"""
RevenueMD Backend — FastAPI

Endpoints
---------
GET  /health          Health check (no auth required)
POST /api/parse       Upload an EDI 837 → raw parsed claims (no scrubbing)
POST /api/scrub       Pass parsed claims JSON → scrubbed results
POST /api/batch       Upload an EDI 837 → parse + scrub in one shot (main flow)

Environment variables
---------------------
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

Then POST to http://localhost:8000/api/batch with a form field "file" containing
an EDI 837 file.
"""

from __future__ import annotations
import logging
import os
import time
from typing import List

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import ParsedClaim, ScrubResult, BatchResponse
from parser import parse_837
from rules.engine import scrub, scrub_many

# ── Environment ───────────────────────────────────────────────────────────────

_env         = os.getenv("ENVIRONMENT", "development")
_log_level   = os.getenv("LOG_LEVEL", "INFO").upper()
_api_key     = os.getenv("API_KEY", "")          # empty = no key required
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
    version     = "0.2.0",
    docs_url    = "/docs" if _env != "production" else None,   # hide Swagger in prod
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
    """If API_KEY env var is set, every POST must include it."""
    if _api_key and x_api_key != _api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header.")


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":      "ok",
        "service":     "revenuemd-backend",
        "version":     "0.2.0",
        "environment": _env,
    }


@app.post("/api/parse", response_model=List[ParsedClaim])
async def parse_file(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None),
):
    """
    Upload an EDI 837 file. Returns the raw parsed claim objects —
    useful for inspecting what was extracted before scrubbing.
    """
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
    """
    Pass a list of ParsedClaim objects (from /api/parse or built manually).
    Returns scrubbed results with issues, risk scores, and triage lanes.
    """
    _check_api_key(x_api_key)
    log.info("scrub request: %d claims", len(claims))
    return scrub_many(claims)


@app.post("/api/batch", response_model=BatchResponse)
async def batch(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None),
):
    """
    Main workflow endpoint: upload an EDI 837, get back a fully scrubbed
    batch ready to load into the Batch queue UI.

    Steps:
      1. Parse 837  → list of ParsedClaim
      2. Run rules engine on each claim  → ScrubResult
      3. Compute batch-level metrics and return BatchResponse
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

    log.info(
        "batch complete: total=%d auto_clear=%d needs_attention=%d at_risk=%.2f",
        len(results), auto_clear, needs_attention, at_risk,
    )

    return BatchResponse(
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
