from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class Severity(str, Enum):
    error = "error"
    warning = "warning"
    info = "info"


class Lane(str, Enum):
    needs_work = "needs_work"
    quick_review = "quick_review"
    auto_clear = "auto_clear"


class Issue(BaseModel):
    sev: Severity
    tEn: str
    tEs: str
    dEn: str
    dEs: str


class Suggestion(BaseModel):
    tEn: str
    tEs: str
    wEn: str
    wEs: str


class ServiceLine(BaseModel):
    cpt: str
    modifier: List[str] = []
    units: int = 1
    charge: float = 0.0


class ParsedClaim(BaseModel):
    """Raw claim extracted from EDI 837 — no scrubbing yet."""
    id: str
    payer: str
    payer_id: str = ""
    patient_name: str = ""
    patient_id: str = ""
    npi: str = ""
    provider_name: str = ""
    dos: str = ""
    icd: List[str] = []
    service_lines: List[ServiceLine] = []
    auth: Optional[str] = None
    total_charge: float = 0.0


class ScrubResult(BaseModel):
    """Scrubbed claim — shapes match both the Batch queue and Claims module."""
    # Batch queue fields
    id: str
    payer: str
    codes: str
    prov: str
    risk: int
    lane: Lane
    val: float
    sel: bool = False
    st: str = "pending"
    iEn: str
    iEs: str
    # Detailed claim fields (Claims module)
    pat: str
    dos: str
    cpt: List[str]
    icd: List[str]
    mods: List[str]
    units: List[int]
    auth: Optional[str]
    charge: float
    npi: str
    comp: int
    doc: int
    issues: List[Issue]
    fix: List[Suggestion]
    reviewed: bool = False
    sEn: str
    sEs: str


class BatchResponse(BaseModel):
    id: str = ""
    total: int
    auto_clear: int
    needs_attention: int
    at_risk: float
    claims: List[ScrubResult]


class ClaimUpdate(BaseModel):
    reviewed: Optional[bool] = None
    st: Optional[str] = None


class BatchSummary(BaseModel):
    """Lightweight batch record for the history list (no claim detail)."""
    id: str
    filename: str
    total: int
    auto_clear: int
    needs_attention: int
    at_risk: float
    created_at: str
