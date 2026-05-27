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
import json
import logging
import os
import time
import uuid
from typing import List

from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db, init_db
from db_models import AuditLog, Batch, Claim
from models import BatchResponse, BatchSummary, ParsedClaim, ScrubResult
from parser import parse_837
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
    allow_methods      = ["GET", "POST", "OPTIONS"],
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
    """Upload an EDI 837 file — returns raw parsed claims before scrubbing."""
    _check_api_key(x_api_key)
    content = (await file.read()).decode("utf-8", errors="replace")
    log.info("parse request: file=%s size=%d", file.filename, len(content))
    try:
        claims = parse_837(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not claims:
        raise HTTPException(status_code=422, detail="No claims found in file.")
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
    content = (await file.read()).decode("utf-8", errors="replace")
    log.info("batch request: file=%s size=%d", file.filename, len(content))

    try:
        parsed = parse_837(content)
    except ValueError as e:
        log.warning("parse error: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    if not parsed:
        raise HTTPException(status_code=422, detail="No claims found in file.")

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


# ── Global error handler ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})
