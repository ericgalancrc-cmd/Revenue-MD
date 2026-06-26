"""
RevenueMD Backend — FastAPI v0.3.0

Endpoints
---------
GET  /health              Health check (no auth required)
GET  /api/batches         List recent batches (last 50)
POST /api/parse           Upload an EDI 837 → raw parsed claims
POST /api/scrub           Pass parsed claims JSON → scrubbed results
POST /api/batch           Upload an EDI 837 → parse + scrub + persist

Environment variables
---------------------
DATABASE_URL      SQLAlchemy URL (default: sqlite:///./revenuemd.db)
ALLOWED_ORIGINS   Comma-separated CORS origins (default: localhost dev ports)
API_KEY           If set, all POST requests must include X-API-Key header
ENVIRONMENT       development | production (shown in /health)
LOG_LEVEL         DEBUG | INFO | WARNING | ERROR (default: INFO)

Run locally
-----------
  cd backend
  cp .env.example .env        # edit values
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations
import csv
import io
import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from database import get_db, init_db
from db_models import AuditLog, Batch, Claim
from models import BatchResponse, BatchSummary, ClaimUpdate, DashboardMetrics, Issue, ParsedClaim, ScrubResult, Suggestion
from parser import parse_837
from document_parser import extract_claims, _get_client as _ai_client
from rules.engine import scrub_many

# ── Environment ───────────────────────────────────────────────────────────────

_env         = os.getenv("ENVIRONMENT", "development")
_log_level   = os.getenv("LOG_LEVEL", "INFO").upper()
_api_key     = os.getenv("API_KEY", "")
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://localhost:8080",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level   = getattr(logging, _log_level, logging.INFO),
    format  = "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt = "%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger("revenuemd")

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "RevenueMD API",
    description = "Pre-submission EDI 837 claim scrubbing for Puerto Rico payers.",
    version     = "0.3.0",
    docs_url    = "/docs" if _env != "production" else None,
    redoc_url   = None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins      = ALLOWED_ORIGINS,
    allow_credentials  = True,
    allow_methods      = ["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers      = ["Content-Type", "X-API-Key", "Authorization"],
    expose_headers     = ["X-Request-ID"],
)


@app.on_event("startup")
def startup():
    init_db()
    log.info("Database initialized.")


# ── Middleware ─────────────────────────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000)
    log.info("%s %s → %s  (%dms)", request.method, request.url.path, response.status_code, elapsed)
    return response


# ── Auth helper ───────────────────────────────────────────────────────────────

def _check_api_key(x_api_key: str | None):
    if _api_key and x_api_key != _api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header.")


# ── File routing helper ───────────────────────────────────────────────────────

def _is_edi(file_bytes: bytes, filename: str) -> bool:
    """Return True if the file looks like a raw EDI 837 transaction."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext in ("edi", "837", "x12"):
        return True
    try:
        peek = file_bytes[:10].decode("ascii", errors="replace").strip()
        return peek.startswith("ISA")
    except Exception:
        return False


async def _parse_upload(file: UploadFile) -> tuple[bytes, list[ParsedClaim]]:
    """Read an uploaded file and return (raw_bytes, parsed_claims)."""
    file_bytes = await file.read()
    filename   = file.filename or "upload"
    if _is_edi(file_bytes, filename):
        log.info("routing to EDI parser: %s", filename)
        content = file_bytes.decode("utf-8", errors="replace")
        return file_bytes, parse_837(content)
    log.info("routing to document extractor: %s", filename)
    return file_bytes, extract_claims(file_bytes, filename)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":      "ok",
        "service":     "revenuemd-backend",
        "version":     "0.3.0",
        "environment": _env,
    }


@app.get("/api/batches", response_model=List[BatchSummary])
def list_batches(db: Session = Depends(get_db)):
    """Return the 50 most recent batches (summary only — no claim detail)."""
    rows = db.query(Batch).order_by(Batch.created_at.desc()).limit(50).all()
    return [
        BatchSummary(
            id              = b.id,
            filename        = b.filename or "",
            total           = b.total,
            auto_clear      = b.auto_clear,
            needs_attention = b.needs_attention,
            at_risk         = b.at_risk,
            created_at      = b.created_at.isoformat() if b.created_at else "",
        )
        for b in rows
    ]


@app.post("/api/parse", response_model=List[ParsedClaim])
async def parse_file(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None),
):
    """Upload a claim document (PDF, image, EDI 837, CSV) — returns raw parsed claims."""
    _check_api_key(x_api_key)
    log.info("parse request: file=%s", file.filename)
    try:
        _, claims = await _parse_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not claims:
        raise HTTPException(status_code=422, detail="No claims found in document.")
    log.info("parsed %d claims", len(claims))
    return claims


@app.post("/api/scrub", response_model=List[ScrubResult])
def scrub_claims(
    claims: List[ParsedClaim],
    x_api_key: str | None = Header(default=None),
):
    """Pass ParsedClaim objects → scrubbed results with issues and triage lanes."""
    _check_api_key(x_api_key)
    log.info("scrub request: %d claims", len(claims))
    return scrub_many(claims)


@app.post("/api/batch", response_model=BatchResponse)
async def batch(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Main workflow: upload an EDI 837, get a fully scrubbed batch.
    Results are persisted to the database for history.
    """
    _check_api_key(x_api_key)
    log.info("batch request: file=%s", file.filename)

    try:
        _, parsed = await _parse_upload(file)
    except ValueError as e:
        log.warning("parse/extract error: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    if not parsed:
        raise HTTPException(status_code=422, detail="No claims found in document.")

    results = scrub_many(parsed)

    auto_clear      = sum(1 for r in results if r.lane == "auto_clear")
    needs_attention = sum(1 for r in results if r.lane != "auto_clear")
    at_risk         = sum(r.val for r in results if r.lane == "needs_work")

    batch_id = str(uuid.uuid4())

    # Persist batch
    db_batch = Batch(
        id              = batch_id,
        filename        = file.filename,
        total           = len(results),
        auto_clear      = auto_clear,
        needs_attention = needs_attention,
        at_risk         = at_risk,
    )
    db.add(db_batch)

    for r in results:
        db.add(Claim(
            id          = r.id,
            batch_id    = batch_id,
            payer       = r.payer,
            codes       = r.codes,
            prov        = r.prov,
            risk        = r.risk,
            lane        = r.lane,
            val         = r.val,
            pat         = r.pat,
            dos         = r.dos,
            npi         = r.npi,
            charge      = r.charge,
            comp        = r.comp,
            doc         = r.doc,
            issues_json = json.dumps([i.model_dump() for i in r.issues]),
            fix_json    = json.dumps([f.model_dump() for f in r.fix]),
            iEn         = r.iEn,
            iEs         = r.iEs,
            sEn         = r.sEn,
            sEs         = r.sEs,
            cpt_json    = json.dumps(r.cpt),
            icd_json    = json.dumps(r.icd),
            mods_json   = json.dumps(r.mods),
            units_json  = json.dumps(r.units),
            auth        = r.auth,
        ))

    db.add(AuditLog(event="batch_upload", batch_id=batch_id, detail=file.filename))
    db.commit()

    log.info(
        "batch complete: id=%s total=%d auto_clear=%d needs_attention=%d at_risk=%.2f",
        batch_id, len(results), auto_clear, needs_attention, at_risk,
    )

    return BatchResponse(
        id              = batch_id,
        total           = len(results),
        auto_clear      = auto_clear,
        needs_attention = needs_attention,
        at_risk         = at_risk,
        claims          = results,
    )


def _claim_to_scrub(c: Claim) -> ScrubResult:
    """Convert a DB Claim row to a ScrubResult (shared by multiple endpoints)."""
    return ScrubResult(
        id       = c.id,
        payer    = c.payer or "",
        codes    = c.codes or "",
        prov     = c.prov or "",
        risk     = c.risk or 0,
        lane     = c.lane or "auto_clear",
        val      = c.val or 0.0,
        sel      = c.lane == "auto_clear" and c.st == "pending",
        st       = c.st or "pending",
        iEn      = c.iEn or "",
        iEs      = c.iEs or "",
        pat      = c.pat or "",
        dos      = c.dos or "",
        cpt      = json.loads(c.cpt_json or "[]"),
        icd      = json.loads(c.icd_json or "[]"),
        mods     = json.loads(c.mods_json or "[]"),
        units    = json.loads(c.units_json or "[]"),
        auth     = c.auth,
        charge   = c.charge or 0.0,
        npi      = c.npi or "",
        comp     = c.comp or 0,
        doc      = c.doc or 0,
        issues   = [Issue(**i) for i in json.loads(c.issues_json or "[]")],
        fix      = [Suggestion(**s) for s in json.loads(c.fix_json or "[]")],
        reviewed = c.reviewed or False,
        sEn      = c.sEn or "",
        sEs      = c.sEs or "",
    )


@app.get("/api/claims", response_model=List[ScrubResult])
def list_claims(limit: int = 100, db: Session = Depends(get_db)):
    """Return the most recent claims across all batches."""
    rows = db.query(Claim).order_by(Claim.created_at.desc()).limit(limit).all()
    return [_claim_to_scrub(c) for c in rows]


@app.get("/api/dashboard", response_model=DashboardMetrics)
def dashboard(db: Session = Depends(get_db)):
    """Return aggregate metrics computed from real claim data."""
    rows = db.query(Claim).all()
    total = len(rows)
    if total == 0:
        return DashboardMetrics(
            total=0, approved=0, pending=0, high_risk=0,
            at_risk_value=0.0, approved_value=0.0,
            approval_rate=0.0, denial_rate=0.0,
        )
    approved       = sum(1 for r in rows if r.st == "approved")
    denied         = sum(1 for r in rows if r.st == "denied")
    pending        = sum(1 for r in rows if r.st == "pending")
    high_risk      = sum(1 for r in rows if r.lane == "needs_work")
    at_risk_value  = sum(r.val or 0 for r in rows if r.lane == "needs_work")
    approved_value = sum(r.val or 0 for r in rows if r.st == "approved")
    return DashboardMetrics(
        total          = total,
        approved       = approved,
        pending        = pending,
        high_risk      = high_risk,
        at_risk_value  = round(at_risk_value, 2),
        approved_value = round(approved_value, 2),
        approval_rate  = round(approved / total * 100, 1),
        denial_rate    = round(denied / total * 100, 1),
    )


@app.get("/api/batches/{batch_id}", response_model=BatchResponse)
def get_batch(batch_id: str, db: Session = Depends(get_db)):
    """Return a single batch with all its claims — used to restore session state."""
    b = db.query(Batch).filter(Batch.id == batch_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return BatchResponse(
        id              = b.id,
        total           = b.total,
        auto_clear      = b.auto_clear,
        needs_attention = b.needs_attention,
        at_risk         = b.at_risk,
        claims          = [_claim_to_scrub(c) for c in b.claims],
    )


@app.post("/api/claims/{claim_id}/analyze")
async def analyze_claim(
    claim_id: str,
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Run Claude AI analysis on a claim and persist the bilingual assessment."""
    _check_api_key(x_api_key)
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim not found.")

    issues = json.loads(c.issues_json or "[]")
    fixes  = json.loads(c.fix_json  or "[]")
    issues_text = "\n".join(f"- [{i['sev'].upper()}] {i['tEn']}: {i['dEn']}" for i in issues) or "None."
    fixes_text  = "\n".join(f"- {f['tEn']}: {f['wEn']}" for f in fixes) or "None."

    prompt = f"""\
You are a senior medical billing specialist for Puerto Rico payers \
(Plan Vital/ASES, Triple-S, MCS, MMM, Medicare/FCSO).

Write a concise, actionable 2–3 sentence billing assessment for the coder \
who will review this claim. Be specific: name the codes, the payer rule, \
and the exact action needed. Avoid generic advice.

CLAIM DETAILS
ID: {c.id}
Payer: {c.payer or "Unknown"}
Provider: {c.prov or "Unknown"} | NPI: {c.npi or "N/A"}
Date of service: {c.dos or "Unknown"}
Codes: {c.codes or "Unknown"} | ICD-10: {", ".join(json.loads(c.icd_json or "[]")) or "None"}
Modifiers: {", ".join(json.loads(c.mods_json or "[]")) or "None"}
Billed: ${c.val or 0:.2f} | Auth: {c.auth or "None"}
Risk {c.risk or 0}/100 | Compliance {c.comp or 0}/100 | Documentation {c.doc or 0}/100

ISSUES FOUND BY RULES ENGINE
{issues_text}

SUGGESTED FIXES
{fixes_text}

Return ONLY a JSON object — no markdown, no explanation:
{{"sEn": "2-3 sentence assessment in English", "sEs": "Same assessment in Spanish"}}\
"""
    try:
        response = _ai_client().messages.create(
            model      = "claude-sonnet-4-6",
            max_tokens = 512,
            messages   = [{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            lines = raw.splitlines()
            raw = "\n".join(lines[1:(-1 if lines[-1].strip() == "```" else len(lines))])
        result = json.loads(raw)
        sEn = str(result.get("sEn", ""))
        sEs = str(result.get("sEs", ""))
        c.sEn = sEn
        c.sEs = sEs
        db.commit()
        log.info("claim analyzed: id=%s", claim_id)
        return {"sEn": sEn, "sEs": sEs}
    except Exception as e:
        log.error("AI analysis failed for %s: %s", claim_id, e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")


@app.patch("/api/claims/{claim_id}")
def update_claim(
    claim_id: str,
    update: ClaimUpdate,
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Persist claim review status and approval state."""
    _check_api_key(x_api_key)
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if update.reviewed is not None:
        claim.reviewed = update.reviewed
    if update.st is not None:
        claim.st = update.st
    db.add(AuditLog(event="claim_approve", claim_id=claim_id, detail=f"reviewed={claim.reviewed} st={claim.st}"))
    db.commit()
    log.info("claim updated: id=%s reviewed=%s st=%s", claim_id, claim.reviewed, claim.st)
    return {"id": claim_id, "reviewed": claim.reviewed, "st": claim.st}


@app.get("/api/denials")
def list_denials(db: Session = Depends(get_db)):
    """Return denied claims with appeal-window days remaining."""
    rows = db.query(Claim).filter(Claim.st == "denied").order_by(Claim.created_at.desc()).all()
    now = datetime.now(timezone.utc)
    result = []
    for c in rows:
        if c.created_at:
            ts = c.created_at if c.created_at.tzinfo else c.created_at.replace(tzinfo=timezone.utc)
            days = max(0, (now - ts).days)
        else:
            days = 0
        issues = json.loads(c.issues_json or "[]")
        errors = [i for i in issues if i.get("sev") == "error"]
        rEn = errors[0]["dEn"] if errors else (c.iEn or "Claim denied")
        rEs = errors[0]["dEs"] if errors else (c.iEs or "Reclamo denegado")
        result.append({
            "id":    c.id,
            "payer": c.payer or "",
            "rEn":   rEn,
            "rEs":   rEs,
            "lost":  c.val or 0.0,
            "days":  days,
        })
    return result


@app.post("/api/claims/{claim_id}/appeal")
async def appeal_claim(
    claim_id: str,
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Generate a bilingual Claude appeal strategy for a denied claim."""
    _check_api_key(x_api_key)
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim not found.")

    issues = json.loads(c.issues_json or "[]")
    issues_text = "\n".join(f"- [{i['sev'].upper()}] {i['tEn']}: {i['dEn']}" for i in issues) or "No issues recorded."

    prompt = f"""\
You are a senior Puerto Rico medical billing appeals specialist \
(Plan Vital/ASES, Triple-S, MCS, MMM, Medicare/FCSO).

Generate a concise, actionable first-level appeal strategy for this denied claim. \
Cover: (1) the strongest argument for reversal, (2) documentation to attach, \
(3) the relevant payer rule to cite, (4) realistic recovery estimate.

CLAIM: {c.id}
Payer: {c.payer or "Unknown"}
Provider: {c.prov or "Unknown"} | NPI: {c.npi or "N/A"}
Date of service: {c.dos or "Unknown"}
Codes: {c.codes or "Unknown"}
Billed: ${c.val or 0:.2f} | Auth: {c.auth or "None"}
Denial reasons:
{issues_text}

Return ONLY a JSON object — no markdown, no explanation:
{{"strategyEn": "2-3 paragraph appeal strategy in English", "strategyEs": "Same strategy in Spanish"}}\
"""
    try:
        response = _ai_client().messages.create(
            model      = "claude-sonnet-4-6",
            max_tokens = 1024,
            messages   = [{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            lines = raw.splitlines()
            raw = "\n".join(lines[1:(-1 if lines[-1].strip() == "```" else len(lines))])
        result = json.loads(raw)
        log.info("appeal generated: id=%s", claim_id)
        return {"strategyEn": str(result.get("strategyEn", "")), "strategyEs": str(result.get("strategyEs", ""))}
    except Exception as e:
        log.error("Appeal generation failed for %s: %s", claim_id, e)
        raise HTTPException(status_code=500, detail=f"Appeal generation failed: {e}")


@app.get("/api/batches/{batch_id}/export")
def export_batch(batch_id: str, db: Session = Depends(get_db)):
    """Download a batch as a UTF-8 CSV file."""
    b = db.query(Batch).filter(Batch.id == batch_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found.")

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["ID", "Payer", "Patient", "Codes", "ICD-10", "Provider", "NPI", "DOS",
                     "Billed", "Risk", "Lane", "Status", "Auth", "Issues"])
    for c in b.claims:
        issues = json.loads(c.issues_json or "[]")
        issues_text = "; ".join(f"[{i.get('sev','').upper()}] {i.get('tEn','')}" for i in issues)
        writer.writerow([
            c.id, c.payer or "", c.pat or "", c.codes or "",
            " | ".join(json.loads(c.icd_json or "[]")),
            c.prov or "", c.npi or "", c.dos or "",
            f"{c.val or 0:.2f}", c.risk or 0, c.lane or "",
            c.st or "pending", c.auth or "", issues_text,
        ])

    filename = f"batch_{batch_id[:8]}.csv"
    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode("utf-8-sig")),
        media_type = "text/csv",
        headers    = {"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Global error handler ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})
