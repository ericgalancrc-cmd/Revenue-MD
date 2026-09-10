"""
Missing Diagnosis (Dx) Support Finder — applies regardless of payer.

Flags a behavioral-health CPT code billed without any diagnosis on the
claim that plausibly supports medical necessity for it — e.g. billing
psychotherapy (90837) with no behavioral-health diagnosis at all, or no
diagnosis whatsoever. See rules/dx_support_map.py for the (deliberately
narrow) reference set this checks against.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity
from rules.dx_support_map import DX_SUPPORT_MAP, check_dx_support


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    cpt_set = {sl.cpt for sl in claim.service_lines} or {
        c.strip() for c in (claim.codes or "").split(",") if c.strip()
    }
    # Some claim sources only populate the singular `diagnosis` field, others
    # only the `diagnoses` list — check the union of both rather than
    # assuming either is authoritative.
    all_dx = list(claim.diagnoses) + ([claim.diagnosis] if claim.diagnosis else [])
    flagged_codes = sorted(
        cpt for cpt in cpt_set
        if cpt in DX_SUPPORT_MAP and not check_dx_support(cpt, all_dx)
    )
    if not flagged_codes:
        return [], [], 0

    issues.append(Issue(
        code="MDX-001", sev=Severity.error,
        tEn=f"No supporting diagnosis for {', '.join(flagged_codes)}",
        tEs=f"Sin diagnóstico de respaldo para {', '.join(flagged_codes)}",
        dEn=f"{', '.join(flagged_codes)} typically requires a behavioral-health "
            f"diagnosis (an F-code) to support medical necessity. This claim has "
            f"no diagnosis, or none in that category — payers commonly deny for "
            f"lack of medical necessity in this situation.",
        dEs=f"{', '.join(flagged_codes)} usualmente requiere un diagnóstico de "
            f"salud conductual (código F) para respaldar la necesidad médica. "
            f"Este reclamo no tiene diagnóstico, o ninguno en esa categoría — los "
            f"pagadores comúnmente deniegan por falta de necesidad médica en "
            f"esta situación.",
    ))
    fixes.append(Fix(
        tEn="Add a supporting behavioral-health diagnosis",
        tEs="Agregar un diagnóstico de salud conductual de respaldo",
        wEn=f"Confirm the clinical note documents a behavioral-health diagnosis "
            f"and add the corresponding ICD-10 F-code to the claim before "
            f"submitting {', '.join(flagged_codes)}.",
        wEs=f"Confirme que la nota clínica documenta un diagnóstico de salud "
            f"conductual y agregue el código ICD-10 F correspondiente al "
            f"reclamo antes de someter {', '.join(flagged_codes)}.",
    ))
    risk += 40

    return issues, fixes, risk
