"""
Maps rule-engine issue codes to human, executive-facing root-cause
categories for aggregate denial analytics (the "Denial Root Cause
Engine"). Turns raw codes like "NCCI-002" or "DOC-001" into categories
a CFO/RCM director would recognize, rather than requiring them to know
what each code means.

Deliberately excludes informational-only codes (HCC-*, CPT2-*) from
denial-root-cause analysis — those are revenue-opportunity flags, not
denial risk, and mixing them in would misrepresent what's actually
driving denials.
"""
from __future__ import annotations
from typing import Optional

# Ordered by prefix specificity — checked in order, first match wins.
CATEGORY_MAP: list[tuple[str, str, str]] = [
    ("NCCI-",  "NCCI edits / bundling",              "Ediciones NCCI / empaquetado"),
    ("MOD-",   "Modifier issues",                     "Problemas de modificadores"),
    ("DOC-",   "Documentation support",                "Respaldo de documentación"),
    ("ASES-",  "ASES/Medicaid payer rules",           "Reglas de pagador ASES/Medicaid"),
    ("TS-",    "Triple-S payer rules",                "Reglas de pagador Triple-S"),
    ("MMM-",   "MMM payer rules",                     "Reglas de pagador MMM"),
    ("MCS-",   "MCS payer rules",                     "Reglas de pagador MCS"),
    ("CMS-",   "Medicare payer rules",                "Reglas de pagador Medicare"),
    ("PRPPL-", "Timely filing / prompt payment",      "Presentación oportuna / pago puntual"),
]

# Codes that represent opportunities, not denial risk — excluded from
# denial-root-cause analysis entirely.
INFORMATIONAL_PREFIXES = ("HCC-", "CPT2-")


def categorize(issue_code: str) -> Optional[str]:
    """Return the (English) category label for an issue code, or None if
    it's informational-only and should be excluded from denial analytics."""
    code = (issue_code or "").upper()
    if code.startswith(INFORMATIONAL_PREFIXES):
        return None
    for prefix, label_en, _label_es in CATEGORY_MAP:
        if code.startswith(prefix):
            return label_en
    return "Other"


def categorize_es(issue_code: str) -> Optional[str]:
    code = (issue_code or "").upper()
    if code.startswith(INFORMATIONAL_PREFIXES):
        return None
    for prefix, _label_en, label_es in CATEGORY_MAP:
        if code.startswith(prefix):
            return label_es
    return "Otro"
