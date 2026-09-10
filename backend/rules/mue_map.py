"""
MUE (Medically Unlikely Edits) reference table.

CMS publishes MUE values — the maximum units of a given CPT/HCPCS code
that are clinically plausible for one patient, one date of service, one
provider. Most payers reference these values (or their own close
variant) regardless of which specific plan the patient is on, so this
check is payer-agnostic — unlike ASES-001 in rules/ases.py, which
enforces ASES/Plan Vital-specific caps for behavioral-health HCPCS codes
(H0004, H0019, H2019, 90853).

Deliberately excludes codes already covered by ASES-001 to avoid a
redundant double-flag on ASES/Plan Vital claims — this table only
covers codes ASES-001 doesn't touch (standard E&M and psychotherapy
CPT codes).

Not exhaustive — CMS publishes MUE values for thousands of codes. This
is a starter set for the codes already common in this platform's claim
mix.
"""
from __future__ import annotations
from typing import Dict

# CPT code -> max clinically plausible units per patient/day/provider.
MUE_CAPS: Dict[str, int] = {
    "90791": 1,  # Psychiatric diagnostic evaluation
    "90792": 1,  # Psychiatric diagnostic evaluation with medical services
    "90832": 1,  # Psychotherapy, 30 min
    "90834": 1,  # Psychotherapy, 45 min
    "90837": 1,  # Psychotherapy, 60 min
    "90847": 1,  # Family psychotherapy with patient
    "90839": 1,  # Psychotherapy for crisis, 60 min
    "99202": 1, "99203": 1, "99204": 1, "99205": 1,  # New patient E&M
    "99211": 1, "99212": 1, "99213": 1, "99214": 1, "99215": 1,  # Established patient E&M
}
