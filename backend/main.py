"""
RevenueMD Backend — FastAPI

Endpoints
---------
GET  /health          Health check
POST /api/parse       Upload an EDI 837 file → raw parsed claims (no scrubbing)
POST /api/scrub       Pass raw claims JSON → scrubbed results with issues + risk
POST /api/batch       Upload an EDI 837 → parse + scrub in one shot (main flow)

Run locally
-----------
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Then POST to http://localhost:8000/api/batch with a form field named "file"
containing an EDI 837 file.
"""

from __future__ import annotations
import io
from typing import List

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import ParsedClaim, ScrubResult, BatchResponse
from parser import parse_837
from rules.engine import scrub, scrub_many

app = FastAPI(
    title       = "RevenueMD API",
    description = "Pre-submission EDI 837 claim scrubbing for Puerto Rico payers.",
    version     = "0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],    # Tighten before production
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "revenuemd-backend"}


@app.post("/api/parse", response_model=List[ParsedClaim])
async def parse_file(file: UploadFile = File(...)):
    """
    Upload an EDI 837 file.  Returns the raw parsed claim objects —
    useful for inspecting what was extracted before scrubbing.
    """
    content = (await file.read()).decode("utf-8", errors="replace")
    try:
        claims = parse_837(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not claims:
        raise HTTPException(status_code=422, detail="No claims found in file.")
    return claims


@app.post("/api/scrub", response_model=List[ScrubResult])
def scrub_claims(claims: List[ParsedClaim]):
    """
    Pass a list of ParsedClaim objects (from /api/parse or built manually).
    Returns scrubbed results with issues, risk scores, and triage lanes.
    """
    return scrub_many(claims)


@app.post("/api/batch", response_model=BatchResponse)
async def batch(file: UploadFile = File(...)):
    """
    Main workflow endpoint: upload an EDI 837, get back a fully scrubbed
    batch ready to load into the Batch queue UI.

    Steps performed:
      1. Parse 837 → list of ParsedClaim
      2. Run rules engine on each claim → ScrubResult
      3. Compute batch-level metrics
    """
    content = (await file.read()).decode("utf-8", errors="replace")
    try:
        parsed = parse_837(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not parsed:
        raise HTTPException(status_code=422, detail="No claims found in file.")

    results = scrub_many(parsed)

    auto_clear      = sum(1 for r in results if r.lane == "auto_clear")
    needs_attention = sum(1 for r in results if r.lane != "auto_clear")
    at_risk         = sum(r.val for r in results if r.lane == "needs_work")

    return BatchResponse(
        total           = len(results),
        auto_clear      = auto_clear,
        needs_attention = needs_attention,
        at_risk         = at_risk,
        claims          = results,
    )
