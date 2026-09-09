"""
CPT Category II Code Finder — applies regardless of payer.

Flags visits where a diagnosis (e.g. diabetes, hypertension) qualifies
for a CPT II quality-tracking code that isn't present on the claim.
Informational only — a $0, no-RVU code being absent doesn't cause a
denial, but can cost quality-incentive revenue and hurt quality-measure
reporting. See cpt2_map.py for the (deliberately narrow, periodically-
revised) reference set this checks against.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity
from rules.cpt2_map import find_cpt2_opportunities


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    issues: List[Issue] = []
    fixes:  List[Fix]   = []

    existing_cpts = [sl.cpt for sl in claim.service_lines] or (
        [c.strip() for c in (claim.codes or "").split(",")]
    )
    opportunities = find_cpt2_opportunities(claim.diagnoses, existing_cpts)
    if not opportunities:
        return [], [], 0

    for opp in opportunities:
        issues.append(Issue(
            code=f"CPT2-{opp['id'].upper()[:12]}", sev=Severity.info,
            tEn=f"CPT II opportunity: {opp['label']}",
            tEs=f"Oportunidad CPT II: {opp['label']}",
            dEn=opp["note_en"],
            dEs=opp["note_es"],
        ))
        fixes.append(Fix(
            tEn=f"Consider adding a CPT II code ({', '.join(opp['candidate_codes'])})",
            tEs=f"Considere agregar un código CPT II ({', '.join(opp['candidate_codes'])})",
            wEn=f"If the qualifying measurement was taken this visit, add the matching "
                f"code from {', '.join(opp['candidate_codes'])} to document it for quality reporting.",
            wEs=f"Si la medición correspondiente se tomó en esta visita, agregue el código "
                f"correspondiente de {', '.join(opp['candidate_codes'])} para documentarlo en el reporte de calidad.",
        ))

    # Informational only — no risk-score impact, this is a revenue-integrity
    # opportunity, not a denial/compliance risk.
    return issues, fixes, 0
