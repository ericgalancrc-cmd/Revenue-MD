"""
CPT Category II code opportunity reference.

CPT II codes are supplemental tracking codes (no RVU, $0 billed) used for
quality reporting — payers increasingly tie quality-incentive revenue
(HEDIS/MIPS-style measures) to these being present alongside qualifying
visits. Missing one doesn't cause a claim denial, but it can cost
quality-bonus revenue and hurt quality-measure reporting.

This is a deliberately narrow starter set of well-established, stable
CPT II codes — NOT exhaustive. CPT II codes are periodically revised by
the CPT Editorial Panel, so treat this the same as the "verify first"
payer rules elsewhere in the app: a prompt to check, not a guarantee.
"""
from __future__ import annotations
from typing import List, TypedDict


class CPT2Opportunity(TypedDict):
    id: str
    trigger_dx_prefixes: List[str]   # diagnosis prefixes that trigger this opportunity
    candidate_codes: List[str]       # CPT II codes that would document the measure
    label: str
    note_en: str
    note_es: str


CPT2_OPPORTUNITIES: List[CPT2Opportunity] = [
    {
        "id": "diabetes-hba1c",
        "trigger_dx_prefixes": ["E11.", "E10."],
        "candidate_codes": ["3044F", "3051F", "3052F"],
        "label": "Diabetes — HbA1c level tracking",
        "note_en": (
            "This claim carries a diabetes diagnosis but no HbA1c-tracking CPT II "
            "code (3044F/3051F/3052F). If an HbA1c was drawn and reviewed this "
            "visit, consider adding the code matching the result "
            "(3044F: <7.0%, 3051F: 7.0–9.0%, 3052F: >9.0%) — this documents a "
            "quality measure payers often tie to incentive payments. Verify "
            "against your payer's current measure specification."
        ),
        "note_es": (
            "Este reclamo tiene un diagnóstico de diabetes pero no un código CPT II "
            "de seguimiento de HbA1c (3044F/3051F/3052F). Si se realizó y revisó "
            "una HbA1c en esta visita, considere agregar el código correspondiente "
            "al resultado (3044F: <7.0%, 3051F: 7.0–9.0%, 3052F: >9.0%) — esto "
            "documenta una medida de calidad que los pagadores frecuentemente "
            "vinculan a pagos de incentivo. Verifique contra la especificación "
            "actual de la medida de su pagador."
        ),
    },
    {
        "id": "hypertension-bp-control",
        "trigger_dx_prefixes": ["I10", "I11.", "I12.", "I13."],
        "candidate_codes": ["3074F", "3075F", "3077F", "3078F", "3079F", "3080F"],
        "label": "Hypertension — blood pressure control tracking",
        "note_en": (
            "This claim carries a hypertension diagnosis but no blood-pressure-"
            "control CPT II code. If BP was measured this visit, consider adding "
            "the systolic code matching the reading (3074F: <130, 3075F: 130–139, "
            "3077F: ≥140) and the diastolic code (3078F: <80, 3079F: 80–89, "
            "3080F: ≥90) — this documents a quality measure payers often tie to "
            "incentive payments. Verify against your payer's current measure "
            "specification."
        ),
        "note_es": (
            "Este reclamo tiene un diagnóstico de hipertensión pero no un código "
            "CPT II de control de presión arterial. Si se midió la presión arterial "
            "en esta visita, considere agregar el código sistólico correspondiente "
            "a la lectura (3074F: <130, 3075F: 130–139, 3077F: ≥140) y el código "
            "diastólico (3078F: <80, 3079F: 80–89, 3080F: ≥90) — esto documenta una "
            "medida de calidad que los pagadores frecuentemente vinculan a pagos de "
            "incentivo. Verifique contra la especificación actual de la medida de "
            "su pagador."
        ),
    },
]


def find_cpt2_opportunities(diagnoses: List[str], existing_cpts: List[str]) -> List[CPT2Opportunity]:
    """Return CPT II opportunities triggered by the claim's diagnoses that
    aren't already addressed by an existing CPT II code on the claim."""
    normalized_dx = [(d or "").strip().upper() for d in diagnoses if d]
    existing = {(c or "").strip().upper() for c in existing_cpts if c}

    matches: List[CPT2Opportunity] = []
    for opp in CPT2_OPPORTUNITIES:
        dx_hit = any(
            dx.startswith(prefix.upper())
            for dx in normalized_dx
            for prefix in opp["trigger_dx_prefixes"]
        )
        if not dx_hit:
            continue
        already_present = existing & {c.upper() for c in opp["candidate_codes"]}
        if already_present:
            continue
        matches.append(opp)
    return matches
