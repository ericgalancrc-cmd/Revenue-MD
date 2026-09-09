from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Severity(str, Enum):
    error   = "error"
    warning = "warning"
    info    = "info"


class Lane(str, Enum):
    needs_work   = "needs_work"
    quick_review = "quick_review"
    auto_clear   = "auto_clear"


class Issue(BaseModel):
    code: str
    sev:  Severity
    tEn:  str
    tEs:  str
    dEn:  str
    dEs:  str


class Fix(BaseModel):
    tEn: str   # short title EN
    tEs: str   # short title ES
    wEn: str   # what to do EN
    wEs: str   # what to do ES


class ServiceLine(BaseModel):
    cpt:     str
    mods:    List[str] = []
    units:   int = 1
    charge:  float = 0.0


class ParsedClaim(BaseModel):
    id:          str
    patient:     str = "Unknown"
    codes:       str = "—"
    payer:       str = "Unknown"
    prov:        str = "Unknown"    # alias for provider (batch queue field)
    provider:    str = "Unknown"
    npi:         str = ""
    dos:         str = "—"
    billed:      float = 0.0
    val:         float = 0.0        # alias for billed (batch queue field)
    auth:        str = ""
    pos:         str = "11"
    diagnosis:   str = ""
    diagnoses:   List[str] = []
    member_id:   str = ""
    service_lines: List[ServiceLine] = []
    status:      str = "pending"


class ScrubResult(ParsedClaim):
    row_id:      Optional[int] = None   # stable per-record id for single-claim CRUD
    lane:        Lane    = Lane.auto_clear
    risk:        int     = 0
    comp:        int     = 100
    doc:         int     = 100
    sEn:         str     = ""
    sEs:         str     = ""
    iEn:         str     = ""    # short issue label EN (batch queue)
    iEs:         str     = ""    # short issue label ES (batch queue)
    issues:      List[Issue] = []
    fix:         List[Fix]   = []
    ai_note:     str     = ""   # biller-facing AI insight beyond the issue list
    ai_enhanced: bool    = False
    batch_created: Optional[str] = None   # timestamp of the owning batch, for trend charts


class ClaimUpdate(BaseModel):
    """Partial update for a single claim — only fields present are applied."""
    patient:   Optional[str]   = None
    codes:     Optional[str]   = None
    payer:     Optional[str]   = None
    prov:      Optional[str]   = None
    provider:  Optional[str]   = None
    dos:       Optional[str]   = None
    billed:    Optional[float] = None
    val:       Optional[float] = None
    auth:      Optional[str]   = None
    pos:       Optional[str]   = None
    diagnosis: Optional[str]   = None
    member_id: Optional[str]   = None
    status:    Optional[str]   = None


class TeamInviteRequest(BaseModel):
    email: str
    role:  str = "coder"   # "coder" | "manager"


class CDIAnalyzeRequest(BaseModel):
    diagnoses:    List[str] = []
    note_text:    str = ""
    claim_row_id: Optional[int] = None
    lang:         str = "en"


class CDIStatusUpdate(BaseModel):
    status:        str            # "answered" | "resolved"
    resolved_code: Optional[str] = None


class BatchResponse(BaseModel):
    id:              str
    created:         str
    total:           int
    auto_clear:      int
    needs_attention: int
    at_risk:         float
    claims:          List[ScrubResult]


class SmartEntryLine(BaseModel):
    cpt:    str
    desc:   str   = ""
    icd10:  str   = "—"
    mod:    str   = "—"
    units:  int   = 1
    amount: float = 0.0


class DocFinding(BaseModel):
    ok:  bool
    msg: str


class SmartEntryResult(BaseModel):
    id:          str
    row_id:      Optional[int] = None
    lines:       List[SmartEntryLine] = []
    icds:        List[str] = []
    totalBilled: float = 0.0
    issues:      List[Issue] = []
    docFindings: List[DocFinding] = []
    risk:        int  = 0
    comp:        int  = 100
    doc:         int  = 100
    lane:        Lane = Lane.auto_clear
    hasRecord:   bool = False
    cpts:        str  = ""
