"""
Plan Vital — overrides and additions on top of the base ASES rules.

Plan Vital is a managed care organization (MCO) under ASES Mi Salud
with its own bulletin supplements and payer-specific policies.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


# ── Plan Vital specific ───────────────────────────────────────────────────────

# BlueCard-style: Plan Vital issues member IDs starting with 'V' or 'PV'
MEMBER_ID_PREFIXES = ("V", "PV", "4")

# Gatekeeper referral required for specialist visits
SPECIALIST_CODES = {
    "99241","99242","99243","99244","99245",  # outpatient consultations
    "90791","90792",                           # psych eval
}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "Plan Vital":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}

    # ── PV-001: Telehealth must use GT, not 95 ────────────────────────
    # Plan Vital specifically requires modifier GT for synchronous telehealth;
    # modifier 95 is only accepted on commercial plans.
    pos = str(claim.pos or "11")
    if pos == "02":
        for sl in slines:
            if "95" in sl.mods and "GT" not in sl.mods:
                issues.append(Issue(
                    code="PV-001", sev=Severity.warning,
                    tEn="Plan Vital: use modifier GT, not 95",
                    tEs="Plan Vital: usar modificador GT, no 95",
                    dEn="Plan Vital accepts modifier GT for synchronous telehealth. Modifier 95 may be rejected by their system. Replace 95 with GT.",
                    dEs="Plan Vital acepta el modificador GT para telesalud sincrónica. El modificador 95 puede ser rechazado por su sistema. Reemplace 95 con GT.",
                ))
                fixes.append(Fix(
                    tEn="Replace modifier 95 with GT",
                    tEs="Reemplazar modificador 95 con GT",
                    wEn=f"Change modifier 95 to GT on {sl.cpt} for Plan Vital telehealth claims.",
                    wEs=f"Cambie el modificador 95 por GT en {sl.cpt} para reclamos de telesalud de Plan Vital.",
                ))
                risk += 15

    # ── PV-002: Corrected claim — modifier 7 required ────────────────
    # For corrected claims (Type of Bill resubmission), Plan Vital requires
    # a specific loop CLM11-4 frequency code; the frontend doesn't capture this
    # but we can warn if the claim ID looks like a resubmission.
    claim_id = claim.id or ""
    if claim_id.endswith(("-C", "-COR", "-R")):
        if not claim.auth:
            issues.append(Issue(
                code="PV-002", sev=Severity.warning,
                tEn="Corrected claim — original claim ref needed",
                tEs="Reclamo corregido — se necesita referencia al reclamo original",
                dEn="This appears to be a corrected claim. Plan Vital requires the original claim control number in REF*F8 and frequency code 7 in CLM05-3.",
                dEs="Este parece ser un reclamo corregido. Plan Vital requiere el número de control del reclamo original en REF*F8 y el código de frecuencia 7 en CLM05-3.",
            ))
            fixes.append(Fix(
                tEn="Add original claim reference",
                tEs="Agregar referencia al reclamo original",
                wEn="Add REF*F8*<original-claim-number> segment and set CLM05-3 to frequency code 7 (replacement of prior claim).",
                wEs="Agregue el segmento REF*F8*<número-reclamo-original> y establezca CLM05-3 al código de frecuencia 7 (reemplazo de reclamo previo).",
            ))
            risk += 15

    # ── PV-003: Group therapy requires participant count documentation
    if "90853" in cpt_set:
        issues.append(Issue(
            code="PV-003", sev=Severity.info,
            tEn="Group therapy: document participant count",
            tEs="Terapia grupal: documentar cantidad de participantes",
            dEn="Plan Vital requires the clinical note for group therapy (90853) to state the number of participants and session duration (typically 45–90 min).",
            dEs="Plan Vital requiere que la nota clínica de terapia grupal (90853) indique el número de participantes y la duración de la sesión (típicamente 45–90 min).",
        ))
        fixes.append(Fix(
            tEn="Add participant count to group note",
            tEs="Agregar cantidad de participantes a la nota grupal",
            wEn="In the group therapy note, state: 'Group consisted of X participants. Session duration: XX minutes.'",
            wEs="En la nota de terapia grupal, indique: 'El grupo consistió de X participantes. Duración de la sesión: XX minutos.'",
        ))
        risk += 5

    return issues, fixes, risk
