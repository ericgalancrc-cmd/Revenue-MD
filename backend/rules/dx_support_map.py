"""
Missing Diagnosis (Dx) Support reference table.

Maps behavioral-health CPT codes to the ICD-10 diagnosis category
(prefix) that typically justifies medical necessity for billing them.
This is the inverse of CDI: CDI improves the specificity of a diagnosis
that already exists on the claim; this catches the case where a
procedure is billed with NO diagnosis that plausibly supports it at all
— a common, real medical-necessity denial cause.

Deliberately scoped to behavioral-health codes (this platform's core
claim mix) rather than attempting broad LCD/NCD coverage across every
specialty, which is payer- and even MAC-specific and would require far
more research to do responsibly. A general E&M code (99213, etc.) is
NOT included here — virtually any diagnosis can justify a general office
visit, so a generic necessity check for those codes would misfire
constantly and isn't a good fit for this narrow, defensible approach.
"""
from __future__ import annotations
from typing import Dict, List

# CPT code -> ICD-10 prefixes that support medical necessity for it.
# "F" alone means "any F-code (mental/behavioral disorder) qualifies."
DX_SUPPORT_MAP: Dict[str, List[str]] = {
    "90791": ["F"],   # Psychiatric diagnostic evaluation
    "90792": ["F"],   # Psychiatric diagnostic evaluation with medical services
    "90832": ["F"],   # Psychotherapy, 30 min
    "90834": ["F"],   # Psychotherapy, 45 min
    "90837": ["F"],   # Psychotherapy, 60 min
    "90847": ["F"],   # Family psychotherapy with patient
    "90853": ["F"],   # Group psychotherapy
    "90839": ["F"],   # Psychotherapy for crisis
    "H0004": ["F"],   # Behavioral health counseling (ASES)
    "H0019": ["F"],   # Day-treatment program
}


def check_dx_support(cpt: str, diagnoses: List[str]) -> bool:
    """Return True if at least one diagnosis on the claim supports medical
    necessity for the given CPT code, per DX_SUPPORT_MAP. Returns True
    (no issue) for any CPT not in the map — this check only asserts on
    codes it has real reference data for."""
    required_prefixes = DX_SUPPORT_MAP.get(cpt)
    if required_prefixes is None:
        return True
    normalized = [(d or "").strip().upper() for d in diagnoses if d]
    if not normalized:
        return False
    return any(
        dx.startswith(prefix.upper())
        for dx in normalized
        for prefix in required_prefixes
    )
