"""
MMM Healthcare (Humana subsidiary, Puerto Rico) specific rules.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "MMM":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}

    # ── MMM-001: Behavioral health — auth always required ─────────────
    bh_codes = {"90832","90834","90837","90791","90792","90853","H0004","H0019"}
    needs_auth = cpt_set & bh_codes
    if needs_auth and not claim.auth:
        issues.append(Issue(
            code="MMM-001", sev=Severity.error,
            tEn="MMM: BH auth required",
            tEs="MMM: autorización de SM requerida",
            dEn=f"MMM Healthcare requires prior authorization for all behavioral health services: {', '.join(sorted(needs_auth))}. Claims without a valid auth number will be denied.",
            dEs=f"MMM Healthcare requiere autorización previa para todos los servicios de salud mental/conductual: {', '.join(sorted(needs_auth))}. Los reclamos sin número de autorización válido serán denegados.",
        ))
        fixes.append(Fix(
            tEn="Obtain BH prior auth from MMM",
            tEs="Obtener autorización previa de SM de MMM",
            wEn=f"Call MMM provider services or submit an auth request via their portal for {', '.join(sorted(needs_auth))} before claim submission.",
            wEs=f"Llame a servicios al proveedor de MMM o someta una solicitud de autorización vía su portal para {', '.join(sorted(needs_auth))} antes de someter el reclamo.",
        ))
        risk += 40

    return issues, fixes, risk
