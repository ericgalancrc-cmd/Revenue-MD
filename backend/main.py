"""
RevenueMD Backend — FastAPI

Endpoints
---------
GET  /health              Health check
POST /api/parse           Upload EDI 837 or CSV → raw parsed claims (no scrubbing)
POST /api/scrub           Pass raw claims JSON → scrubbed results
POST /api/batch           Upload EDI 837 or CSV → parse + scrub in one shot (main flow)
GET  /api/batches         List recent batches (newest first)
GET  /api/batches/{id}    Get a specific batch by ID
POST /api/analyze         Scrub a single claim dict (for the claim workspace AI button)

Run locally
-----------
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Then set VITE_API_URL=http://localhost:8000 in the frontend's .env.local
and POST to http://localhost:8000/api/batch with form field "file".
"""
from __future__ import annotations

import io
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from models import BatchResponse, ParsedClaim, ScrubResult
from parser import parse_837
from parsers.csv_claims import parse_csv
from rules.engine import scrub, scrub_many

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

# ── In-memory batch store (swap for a real DB in production) ─────────────────

_batches: Dict[str, BatchResponse] = {}


def _store_batch(results: List[ScrubResult]) -> BatchResponse:
    auto_clear = [r for r in results if r.lane.value == "auto_clear"]
    needs_attention = [r for r in results if r.lane.value != "auto_clear"]
    at_risk = sum(r.val for r in results if r.lane.value == "needs_work")

    batch = BatchResponse(
        id              = str(uuid.uuid4()),
        created         = datetime.now(timezone.utc).isoformat(),
        total           = len(results),
        auto_clear      = len(auto_clear),
        needs_attention = len(needs_attention),
        at_risk         = round(at_risk, 2),
        claims          = results,
    )
    _batches[batch.id] = batch
    # Keep only the 20 most recent batches in memory
    if len(_batches) > 20:
        oldest_key = sorted(_batches, key=lambda k: _batches[k].created)[0]
        del _batches[oldest_key]
    return batch


def _detect_and_parse(content: bytes, filename: str) -> List[ParsedClaim]:
    """Auto-detect EDI 837 vs CSV by filename extension and content."""
    name = filename.lower()
    text = content.decode("utf-8", errors="replace")

    if name.endswith((".csv", ".txt")) and not text.strip().upper().startswith("ISA"):
        return parse_csv(text)
    return parse_837(text)


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0", "utc": datetime.now(timezone.utc).isoformat()}


@app.post("/api/parse", response_model=List[ParsedClaim])
async def parse_file(file: UploadFile = File(...)):
    """Parse a file and return raw (un-scrubbed) claim objects."""
    content = await file.read()
    claims = _detect_and_parse(content, file.filename or "upload.edi")
    if not claims:
        raise HTTPException(422, "No claims found in the uploaded file.")
    return claims


@app.post("/api/scrub", response_model=List[ScrubResult])
async def scrub_claims(claims: List[ParsedClaim]):
    """Accept raw claim JSON and return scrubbed results."""
    if not claims:
        raise HTTPException(422, "claims list must not be empty.")
    return scrub_many(claims)


@app.post("/api/batch", response_model=BatchResponse)
async def batch(file: UploadFile = File(...)):
    """
    Main workflow endpoint: upload an EDI 837 or CSV file,
    parse + scrub all claims in one shot, persist the batch, and return results.
    """
    content = await file.read()
    filename = file.filename or "upload.edi"

    raw_claims = _detect_and_parse(content, filename)
    if not raw_claims:
        raise HTTPException(422, "No claims found in the uploaded file. "
                                  "Verify it is an EDI 837P or a CSV with a header row.")

    results = scrub_many(raw_claims)
    return _store_batch(results)


@app.get("/api/batches", response_model=List[BatchResponse])
def list_batches():
    """Return up to 20 most recent batches, newest first."""
    return sorted(_batches.values(), key=lambda b: b.created, reverse=True)


@app.get("/api/batches/{batch_id}", response_model=BatchResponse)
def get_batch(batch_id: str):
    if batch_id not in _batches:
        raise HTTPException(404, f"Batch '{batch_id}' not found.")
    return _batches[batch_id]


@app.post("/api/analyze", response_model=ScrubResult)
async def analyze_claim(claim: ParsedClaim):
    """
    Scrub a single claim dict.
    Called by the frontend's 'Run AI analysis' button in the claim workspace.
    """
    return scrub(claim)
