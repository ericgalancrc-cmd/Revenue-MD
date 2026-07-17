"""
RevenueMD Backend — FastAPI

Endpoints
---------
GET  /health                  Health check (public)
POST /api/parse               Upload EDI 837 or CSV → raw parsed claims
POST /api/scrub               Raw claims JSON → scrubbed results
POST /api/batch               Upload file → parse + scrub + persist (main flow)
GET  /api/batches             List org's recent batches (newest first)
GET  /api/batches/{id}        Get a specific batch by ID
POST /api/analyze             Scrub a single claim dict (AI analysis button)
POST /api/smart-entry         Medical record + claim lines (text/images) → AI-cross-referenced result
GET  /api/baa/status          Check if the org has accepted the BAA
POST /api/baa/accept          Record BAA acceptance for the org
GET  /api/audit               Last 100 audit log entries for the org

Run locally
-----------
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Set AUTH0_DOMAIN + AUTH0_AUDIENCE to enable JWT auth; omit for demo mode.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db, init_db
from db_models import AuditLog, BAARecord, BatchRecord, ClaimRecord
from models import (
    BatchResponse, ClaimUpdate, DocFinding, Issue, ParsedClaim, ScrubResult,
    ServiceLine, SmartEntryLine, SmartEntryResult,
)
from parser import parse_837
from parsers.csv_claims import parse_csv
from rules.engine import _compliance_score, _doc_score, _lane, scrub, scrub_many
import ai

logger = logging.getLogger(__name__)

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="RevenueMD API",
    description="Pre-submission EDI 837 claim scrubbing for Puerto Rico payers.",
    version="1.0.0",
)

cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _audit(
    db: Session,
    org_id: str,
    user_id: str,
    action: str,
    resource_type: str = "",
    resource_id: str = "",
    ip: str = "",
) -> None:
    db.add(AuditLog(
        org_id        = org_id,
        user_id       = user_id,
        action        = action,
        resource_type = resource_type,
        resource_id   = resource_id,
        timestamp     = datetime.now(timezone.utc).isoformat(),
        ip_address    = ip,
    ))


def _store_batch(results: List[ScrubResult], db: Session, org_id: str) -> BatchResponse:
    auto_clear      = sum(1 for r in results if r.lane.value == "auto_clear")
    needs_attention = sum(1 for r in results if r.lane.value != "auto_clear")
    at_risk         = round(sum(r.val for r in results if r.lane.value == "needs_work"), 2)

    batch_id = str(uuid.uuid4())
    created  = datetime.now(timezone.utc).isoformat()

    batch_row = BatchRecord(
        id              = batch_id,
        created         = created,
        total           = len(results),
        auto_clear      = auto_clear,
        needs_attention = needs_attention,
        at_risk         = at_risk,
        org_id          = org_id,
    )
    db.add(batch_row)

    claim_rows = [ClaimRecord.from_result(result, batch_id, org_id=org_id) for result in results]
    for row in claim_rows:
        db.add(row)

    db.commit()
    db.refresh(batch_row)

    for result, row in zip(results, claim_rows):
        db.refresh(row)
        result.row_id = row.row_id
        result.batch_created = created

    return BatchResponse(
        id              = batch_id,
        created         = created,
        total           = len(results),
        auto_clear      = auto_clear,
        needs_attention = needs_attention,
        at_risk         = at_risk,
        claims          = results,
    )


def _batch_row_to_response(batch_row: BatchRecord) -> BatchResponse:
    return BatchResponse(
        id              = batch_row.id,
        created         = batch_row.created,
        total           = batch_row.total,
        auto_clear      = batch_row.auto_clear,
        needs_attention = batch_row.needs_attention,
        at_risk         = batch_row.at_risk,
        claims          = [c.to_result() for c in batch_row.claims],
    )


def _detect_and_parse(content: bytes, filename: str) -> List[ParsedClaim]:
    """Auto-detect EDI 837 vs CSV by filename extension and content."""
    name = filename.lower()
    text = content.decode("utf-8", errors="replace")
    if name.endswith((".csv", ".txt")) and not text.strip().upper().startswith("ISA"):
        return parse_csv(text)
    return parse_837(text)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


def _identity(user: dict) -> tuple[str, str]:
    """(org_id, user_id) — org_id scopes shared clinic data (all staff at the
    same org see the same claims); user_id attributes an action to the
    individual staff member who performed it, for audit accountability."""
    return user["org"], (user.get("email") or user["sub"])


def _scrub_and_enhance(claim: ParsedClaim) -> ScrubResult:
    """Run a claim through the rules engine, then AI enhancement if available."""
    result = scrub(claim)
    if ai.is_available():
        enhanced = ai.enhance(result.model_dump())
        try:
            result = ScrubResult(**enhanced)
        except Exception as exc:
            logger.warning("Could not apply AI enhancement: %s", exc)
    return result


def _get_org_claim(db: Session, row_id: int, org_id: str) -> ClaimRecord:
    row = (
        db.query(ClaimRecord)
        .filter(ClaimRecord.row_id == row_id, ClaimRecord.org_id == org_id)
        .first()
    )
    if row is None:
        raise HTTPException(404, f"Claim '{row_id}' not found.")
    return row


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0", "utc": datetime.now(timezone.utc).isoformat()}


@app.post("/api/parse", response_model=List[ParsedClaim])
async def parse_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    content = await file.read()
    claims = _detect_and_parse(content, file.filename or "upload.edi")
    if not claims:
        raise HTTPException(422, "No claims found in the uploaded file.")
    org_id, user_id = _identity(user)
    _audit(db, org_id, user_id, "file_parsed", "file", file.filename or "", _client_ip(request))
    db.commit()
    return claims


@app.post("/api/scrub", response_model=List[ScrubResult])
async def scrub_claims(
    claims: List[ParsedClaim],
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not claims:
        raise HTTPException(422, "claims list must not be empty.")
    org_id, user_id = _identity(user)
    results = scrub_many(claims)
    _audit(db, org_id, user_id, "claims_scrubbed", "claim", "", _client_ip(request))
    db.commit()
    return results


@app.post("/api/batch", response_model=BatchResponse)
async def batch(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    content = await file.read()
    filename = file.filename or "upload.edi"

    raw_claims = _detect_and_parse(content, filename)
    if not raw_claims:
        raise HTTPException(422, "No claims found in the uploaded file. "
                                  "Verify it is an EDI 837P or a CSV with a header row.")

    results = scrub_many(raw_claims)
    result_batch = _store_batch(results, db, org_id=org_id)
    _audit(db, org_id, user_id, "batch_created", "batch", result_batch.id, _client_ip(request))
    db.commit()
    return result_batch


@app.get("/api/batches", response_model=List[BatchResponse])
def list_batches(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    rows = (
        db.query(BatchRecord)
        .filter(BatchRecord.org_id == org_id)
        .order_by(BatchRecord.created.desc())
        .limit(20)
        .all()
    )
    _audit(db, org_id, user_id, "batches_listed", ip=_client_ip(request))
    db.commit()
    return [_batch_row_to_response(row) for row in rows]


@app.get("/api/batches/{batch_id}", response_model=BatchResponse)
def get_batch(
    batch_id: str,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    row = (
        db.query(BatchRecord)
        .filter(BatchRecord.id == batch_id, BatchRecord.org_id == org_id)
        .first()
    )
    if row is None:
        raise HTTPException(404, f"Batch '{batch_id}' not found.")
    _audit(db, org_id, user_id, "batch_read", "batch", batch_id, _client_ip(request))
    db.commit()
    return _batch_row_to_response(row)


# ── Individual claim CRUD ───────────────────────────────────────────────────────

@app.get("/api/claims", response_model=List[ScrubResult])
def list_claims(
    request: Request,
    limit: int = 200,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Return the org's claims across all batches, newest first."""
    org_id, user_id = _identity(user)
    rows = (
        db.query(ClaimRecord)
        .filter(ClaimRecord.org_id == org_id)
        .order_by(ClaimRecord.row_id.desc())
        .limit(limit)
        .all()
    )
    # Serialize before committing — db.commit() expires loaded ORM instances by
    # default, and a concurrent delete of one of these rows between the query
    # above and a post-commit attribute access would raise ObjectDeletedError.
    results = [row.to_result() for row in rows]
    _audit(db, org_id, user_id, "claims_listed", ip=_client_ip(request))
    db.commit()
    return results


@app.post("/api/claims", response_model=ScrubResult)
async def create_claim(
    claim: ParsedClaim,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Manually add a single claim — scrubbed and persisted like a 1-item batch."""
    org_id, user_id = _identity(user)
    result = _scrub_and_enhance(claim)
    result_batch = _store_batch([result], db, org_id=org_id)
    _audit(db, org_id, user_id, "claim_created", "claim", result_batch.claims[0].id, _client_ip(request))
    db.commit()
    return result_batch.claims[0]


@app.patch("/api/claims/{row_id}", response_model=ScrubResult)
def update_claim(
    row_id: int,
    patch: ClaimUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    row = _get_org_claim(db, row_id, org_id)
    for field, value in patch.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    _audit(db, org_id, user_id, "claim_updated", "claim", str(row_id), _client_ip(request))
    db.commit()
    db.refresh(row)
    return row.to_result()


@app.delete("/api/claims/{row_id}")
def delete_claim(
    row_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    row = _get_org_claim(db, row_id, org_id)
    db.delete(row)
    _audit(db, org_id, user_id, "claim_deleted", "claim", str(row_id), _client_ip(request))
    db.commit()
    return {"deleted": True, "row_id": row_id}


@app.post("/api/analyze", response_model=ScrubResult)
async def analyze_claim(
    claim: ParsedClaim,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    result = _scrub_and_enhance(claim)
    _audit(db, org_id, user_id, "claim_analyzed", "claim", claim.id, _client_ip(request))
    db.commit()
    return result


@app.post("/api/smart-entry", response_model=SmartEntryResult)
async def smart_entry(
    request: Request,
    claim_text: str = Form(""),
    lang: str = Form("en"),
    record_files: List[UploadFile] = File(default=[]),
    claim_files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Medical record + claim lines (pasted text and/or photos/screenshots) →
    a real Claude-vision extraction, cross-referenced against the medical
    record for documentation gaps and run through the deterministic rules
    engine for payer-specific coding checks. Persisted like /api/claims."""
    if not ai.is_available():
        raise HTTPException(503, "Smart Entry requires ANTHROPIC_API_KEY to be configured on the backend.")

    record_bytes = [(f.filename or "record", await f.read()) for f in record_files]
    claim_bytes  = [(f.filename or "claim", await f.read()) for f in claim_files]

    extracted = ai.smart_entry_extract(claim_text, record_bytes, claim_bytes, lang)
    if not extracted or not extracted.get("lines"):
        raise HTTPException(422, "Could not extract any billable lines from the provided input.")

    try:
        raw_lines = extracted["lines"]
        ai_doc_findings = [DocFinding(**f) for f in extracted.get("docFindings", [])]
        ai_issues       = [Issue(**i) for i in extracted.get("issues", [])]

        claim_id = f"SMART-{uuid.uuid4().hex[:6].upper()}"
        service_lines = [
            ServiceLine(
                cpt=l.get("cpt", ""),
                mods=[l["mod"]] if l.get("mod") and l["mod"] != "—" else [],
                units=int(l.get("units") or 1),
                charge=float(l.get("amount") or 0.0),
            )
            for l in raw_lines if l.get("cpt")
        ]
        icds = sorted({l["icd10"] for l in raw_lines if l.get("icd10") and l["icd10"] != "—"})
        total_billed = sum(float(l.get("amount") or 0.0) * int(l.get("units") or 1) for l in raw_lines)
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(502, f"AI returned an unexpected response format: {exc}")

    claim = ParsedClaim(
        id=claim_id,
        codes=", ".join(l["cpt"] for l in raw_lines if l.get("cpt")),
        diagnosis=icds[0] if icds else "",
        diagnoses=icds,
        service_lines=service_lines,
    )
    result = scrub(claim)
    result.issues = list(result.issues) + ai_issues

    has_record = len(record_files) > 0
    extra_risk = sum(40 if i.sev == "error" else 18 if i.sev == "warning" else 5 for i in ai_issues)
    if not has_record:
        extra_risk += 12
    result.risk = min(result.risk + extra_risk, 100)
    result.comp = _compliance_score(result.issues)
    result.doc  = _doc_score(result.issues)
    result.lane = _lane(result.risk, result.issues)

    org_id, user_id = _identity(user)
    result_batch = _store_batch([result], db, org_id=org_id)
    stored = result_batch.claims[0]

    _audit(db, org_id, user_id, "smart_entry_analyzed", "claim", claim_id, _client_ip(request))
    db.commit()

    return SmartEntryResult(
        id=stored.id,
        row_id=stored.row_id,
        lines=[SmartEntryLine(**l) for l in raw_lines],
        icds=icds,
        totalBilled=round(total_billed, 2),
        issues=stored.issues,
        docFindings=ai_doc_findings,
        risk=stored.risk,
        comp=stored.comp,
        doc=stored.doc,
        lane=stored.lane,
        hasRecord=has_record,
        cpts=", ".join(l["cpt"] for l in raw_lines if l.get("cpt")),
    )


@app.post("/api/appeal")
async def generate_appeal(
    body: dict,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    denial = body.get("denial", {})
    lang   = body.get("lang", "en")
    letter = ai.appeal_letter(denial, lang)
    _audit(db, org_id, user_id, "appeal_letter_generated", "claim", denial.get("id", ""), _client_ip(request))
    db.commit()
    return {"letter": letter}


# ── BAA endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/baa/status")
def baa_status(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Return whether this org has accepted the BAA."""
    org_id, _ = _identity(user)
    record = (
        db.query(BAARecord)
        .filter(BAARecord.org_id == org_id)
        .order_by(BAARecord.accepted_at.desc())
        .first()
    )
    return {"accepted": record is not None, "at": record.accepted_at if record else None}


@app.post("/api/baa/accept")
def baa_accept(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Record BAA acceptance for this org (idempotent — safe to call multiple times)."""
    org_id, user_id = _identity(user)
    now     = datetime.now(timezone.utc).isoformat()
    ip      = _client_ip(request)

    db.add(BAARecord(
        id          = str(uuid.uuid4()),
        org_id      = org_id,
        user_id     = user_id,
        accepted_at = now,
        ip_address  = ip,
        version     = "1.0",
    ))
    _audit(db, org_id, user_id, "baa_accepted", "baa", "", ip)
    db.commit()
    return {"accepted": True, "at": now}


# ── Audit log ─────────────────────────────────────────────────────────────────

@app.get("/api/audit")
def list_audit(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Return the last 100 audit log entries for this org."""
    org_id, _ = _identity(user)
    rows = (
        db.query(AuditLog)
        .filter(AuditLog.org_id == org_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id":            r.id,
            "user_id":       r.user_id,
            "action":        r.action,
            "resource_type": r.resource_type,
            "resource_id":   r.resource_id,
            "timestamp":     r.timestamp,
            "ip":            r.ip_address,
        }
        for r in rows
    ]
