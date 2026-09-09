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
GET  /api/analytics/revenue-intelligence   Denial root-cause breakdown + exec summary
GET  /api/team                List this org's pending/active invites
POST /api/team/invite         Record a new invite for this org (no email sent)
POST /api/cdi/analyze         Scan diagnoses for CDI specificity opportunities → physician queries
GET  /api/cdi                 List this org's CDI queries (optional ?status= filter)
PATCH /api/cdi/{id}           Mark a CDI query answered/resolved

Run locally
-----------
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Set AUTH0_DOMAIN + AUTH0_AUDIENCE to enable JWT auth; omit for demo mode.
"""
from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db, init_db
from db_models import AuditLog, BAARecord, BatchRecord, CDIQuery, ClaimRecord, TeamInvite
from cdi.specificity_map import find_opportunities
from analytics.engine import compute_revenue_intelligence
from models import (
    BatchResponse, CDIAnalyzeRequest, CDIStatusUpdate, ClaimUpdate, DocFinding,
    Issue, ParsedClaim, ScrubResult, ServiceLine, SmartEntryLine,
    SmartEntryResult, TeamInviteRequest,
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


def _rate_limit_key(request: Request) -> str:
    """Rate-limit by client IP, respecting X-Forwarded-For behind Render/Vercel's proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_rate_limit_key, default_limits=["120/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Baseline security headers. Cheap, has no dependency on any external
    account/service, and meaningfully raises the floor against clickjacking,
    MIME-sniffing, and protocol-downgrade attacks on a product handling PHI."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # Render/Vercel terminate TLS in front of the app; HSTS is still safe to
    # set here so browsers enforce HTTPS on every subsequent visit.
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


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


# ── Upload hardening ──────────────────────────────────────────────────────────
# Caps chosen generously for real EDI 837/CSV claim files and scanned medical
# record photos/PDFs, while still ruling out abuse (someone trying to exhaust
# memory or disk with an oversized upload).
MAX_CLAIM_FILE_BYTES = 10 * 1024 * 1024   # 10 MB — EDI 837 / CSV batch files
MAX_RECORD_FILE_BYTES = 15 * 1024 * 1024  # 15 MB — per medical-record image/PDF
MAX_SMART_ENTRY_FILES = 10                # combined record_files + claim_files per request

ALLOWED_CLAIM_EXTENSIONS = (".edi", ".txt", ".csv", ".837", ".x12")
ALLOWED_RECORD_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
    "application/pdf",
}


def _read_capped(file: UploadFile, max_bytes: int) -> bytes:
    """Read an UploadFile's content, rejecting anything over max_bytes.

    Reads up to max_bytes + 1 so an oversized file is caught without ever
    buffering the full (potentially huge) payload into memory.
    """
    # Starlette's UploadFile wraps a SpooledTemporaryFile; .file gives sync access.
    content = file.file.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(
            413,
            f"'{file.filename or 'upload'}' exceeds the {max_bytes // (1024*1024)} MB upload limit.",
        )
    return content


def _validate_claim_filename(filename: str) -> None:
    name = (filename or "").lower()
    if not name.endswith(ALLOWED_CLAIM_EXTENSIONS):
        raise HTTPException(
            415,
            f"Unsupported file type for '{filename}'. Expected one of: {', '.join(ALLOWED_CLAIM_EXTENSIONS)}.",
        )


def _validate_record_upload(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_RECORD_CONTENT_TYPES:
        raise HTTPException(
            415,
            f"Unsupported file type '{file.content_type}' for '{file.filename}'. "
            f"Expected an image (JPEG/PNG/WEBP/HEIC) or PDF.",
        )


def _cdi_row_to_dict(row: CDIQuery) -> dict:
    return {
        "id":             row.id,
        "claim_row_id":   row.claim_row_id,
        "opportunity_id": row.opportunity_id,
        "family":         row.family,
        "source_code":    row.source_code,
        "candidates":     json.loads(row.candidates_json or "[]"),
        "query_en":       row.query_en,
        "query_es":       row.query_es,
        "ai_enhanced":    bool(row.ai_enhanced),
        "status":         row.status,
        "resolved_code":  row.resolved_code,
        "created_by":     row.created_by,
        "created_at":     row.created_at,
        "resolved_at":    row.resolved_at,
    }


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
    _validate_claim_filename(file.filename or "")
    content = _read_capped(file, MAX_CLAIM_FILE_BYTES)
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
@limiter.limit("20/minute")
async def batch(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    org_id, user_id = _identity(user)
    filename = file.filename or "upload.edi"
    _validate_claim_filename(filename)
    content = _read_capped(file, MAX_CLAIM_FILE_BYTES)

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
@limiter.limit("30/minute")
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
@limiter.limit("15/minute")
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

    all_files = list(record_files) + list(claim_files)
    if len(all_files) > MAX_SMART_ENTRY_FILES:
        raise HTTPException(413, f"Too many files — max {MAX_SMART_ENTRY_FILES} per request.")
    for f in all_files:
        _validate_record_upload(f)

    record_bytes = [(f.filename or "record", _read_capped(f, MAX_RECORD_FILE_BYTES)) for f in record_files]
    claim_bytes  = [(f.filename or "claim",  _read_capped(f, MAX_RECORD_FILE_BYTES)) for f in claim_files]

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
@limiter.limit("20/minute")
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


# ── Revenue Intelligence (Denial Root Cause Engine) ───────────────────────────

@app.get("/api/analytics/revenue-intelligence")
@limiter.limit("20/minute")
def revenue_intelligence(
    request: Request,
    lang: str = "en",
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Aggregate denial root-cause analytics for this org: what % of denied
    claims trace back to which category (NCCI edits, documentation
    support, modifier issues, payer-specific rules, etc.), broken down
    by provider and by payer, plus a plain-English executive summary.
    Computed entirely from claims already persisted — relies on
    ClaimRecord.status == "denied" as the signal for a confirmed
    (not just predicted) denial.
    """
    org_id, user_id = _identity(user)
    rows = db.query(ClaimRecord).filter(ClaimRecord.org_id == org_id).all()

    payload = compute_revenue_intelligence(rows)
    payload["executive_summary"] = ai.revenue_intelligence_summary(payload, lang)

    _audit(db, org_id, user_id, "revenue_intelligence_viewed", ip=_client_ip(request))
    db.commit()
    return payload


# ── CDI (Clinical Documentation Improvement) endpoints ────────────────────────

@app.post("/api/cdi/analyze")
@limiter.limit("20/minute")
async def cdi_analyze(
    body: CDIAnalyzeRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Scan a claim's diagnoses for CDI specificity opportunities (e.g. an
    unspecified diabetes code that better documentation could make more
    specific), generate a physician query for each, and persist them as
    open CDIQuery records for tracking through to resolution."""
    org_id, user_id = _identity(user)
    ip = _client_ip(request)

    opportunities = find_opportunities(body.diagnoses)
    if not opportunities:
        return []

    now = datetime.now(timezone.utc).isoformat()
    created = []
    for opp in opportunities:
        generated = ai.cdi_query({**opp, "source_code": opp["code_prefix"]}, body.note_text, body.lang)
        row = CDIQuery(
            id             = str(uuid.uuid4()),
            org_id         = org_id,
            claim_row_id   = body.claim_row_id,
            opportunity_id = opp["id"],
            family         = opp["family"],
            source_code    = opp["code_prefix"],
            candidates_json= json.dumps(opp["candidates"]),
            query_en       = generated["query_en"],
            query_es       = generated["query_es"],
            ai_enhanced    = 1 if generated["ai_enhanced"] else 0,
            status         = "open",
            created_by     = user_id,
            created_at     = now,
        )
        db.add(row)
        created.append(row)

    _audit(db, org_id, user_id, "cdi_analyzed", "cdi_query", "", ip)
    db.commit()
    for row in created:
        db.refresh(row)

    return [_cdi_row_to_dict(row) for row in created]


@app.get("/api/cdi")
def list_cdi(
    request: Request,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """List this org's CDI queries, newest first, optionally filtered by status."""
    org_id, user_id = _identity(user)
    q = db.query(CDIQuery).filter(CDIQuery.org_id == org_id)
    if status:
        q = q.filter(CDIQuery.status == status)
    rows = q.order_by(CDIQuery.created_at.desc()).limit(200).all()
    _audit(db, org_id, user_id, "cdi_listed", ip=_client_ip(request))
    db.commit()
    return [_cdi_row_to_dict(row) for row in rows]


@app.patch("/api/cdi/{query_id}")
def update_cdi(
    query_id: str,
    body: CDIStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Mark a CDI query as answered or resolved, optionally recording the
    final code the physician's response supports."""
    if body.status not in ("answered", "resolved"):
        raise HTTPException(400, "status must be 'answered' or 'resolved'.")

    org_id, user_id = _identity(user)
    row = (
        db.query(CDIQuery)
        .filter(CDIQuery.id == query_id, CDIQuery.org_id == org_id)
        .first()
    )
    if row is None:
        raise HTTPException(404, f"CDI query '{query_id}' not found.")

    row.status = body.status
    if body.resolved_code:
        row.resolved_code = body.resolved_code
    if body.status == "resolved":
        row.resolved_at = datetime.now(timezone.utc).isoformat()

    _audit(db, org_id, user_id, "cdi_status_updated", "cdi_query", query_id, _client_ip(request))
    db.commit()
    db.refresh(row)
    return _cdi_row_to_dict(row)


# ── Team endpoints ────────────────────────────────────────────────────────────
#
# NOTE: these endpoints persist invite records scoped to the org, but do NOT
# send an email. Actually delivering an invite requires either Auth0's own
# Organizations/invite flow or a transactional email provider (e.g. SendGrid) —
# neither is wired up. Until one is, a manager has to relay the invited
# person's login info out of band, and that person's first real login (once
# Auth0 is configured — see docs/AUTH0_SETUP.md) is what actually grants them
# access; this table is just the record of who's been invited.

@app.get("/api/team")
def list_team(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """List invites (pending and active) for this org, newest first."""
    org_id, user_id = _identity(user)
    rows = (
        db.query(TeamInvite)
        .filter(TeamInvite.org_id == org_id)
        .order_by(TeamInvite.invited_at.desc())
        .all()
    )
    _audit(db, org_id, user_id, "team_listed", ip=_client_ip(request))
    db.commit()
    return [
        {
            "id":         r.id,
            "email":      r.email,
            "role":       r.role,
            "invited_by": r.invited_by,
            "invited_at": r.invited_at,
            "status":     r.status,
        }
        for r in rows
    ]


@app.post("/api/team/invite")
@limiter.limit("10/minute")
def invite_team_member(
    body: TeamInviteRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Record a pending invite for this org. Does not send an email — see note above."""
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "A valid email address is required.")
    if body.role not in ("coder", "manager"):
        raise HTTPException(400, "role must be 'coder' or 'manager'.")

    org_id, user_id = _identity(user)

    existing = (
        db.query(TeamInvite)
        .filter(TeamInvite.org_id == org_id, TeamInvite.email == email)
        .first()
    )
    if existing and existing.status != "revoked":
        raise HTTPException(409, f"{email} has already been invited to this org.")

    now = datetime.now(timezone.utc).isoformat()
    invite = TeamInvite(
        id         = str(uuid.uuid4()),
        org_id     = org_id,
        email      = email,
        role       = body.role,
        invited_by = user_id,
        invited_at = now,
        status     = "pending",
    )
    db.add(invite)
    _audit(db, org_id, user_id, "team_invite_created", "team_invite", invite.id)
    db.commit()

    return {
        "id":         invite.id,
        "email":      invite.email,
        "role":       invite.role,
        "invited_by": invite.invited_by,
        "invited_at": invite.invited_at,
        "status":     invite.status,
    }


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
