"""
Medicare (FCSO — First Coast Service Options, Jurisdiction N) rules.

FCSO is the MAC for Puerto Rico and the US Virgin Islands.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


# ── Medicare wellness / preventive codes ─────────────────────────────────────
AWV_CODES    = {"G0438", "G0439"}   # Annual Wellness Visit (initial / subsequent)
IPPE_CODE    = "G0402"              # Initial Preventive Physical Exam ("Welcome to Medicare")
CCM_CODES    = {"99490","99491","99487","99489"}  # Chronic Care Management
RPM_CODES    = {"99453","99454","99457","99458"}  # Remote Patient Monitoring
TELEHEALTH_MODS = {"GT", "95"}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "Medicare":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}
    has_auth = bool(claim.auth and claim.auth.strip())

    # ── CMS-006: Medicare Secondary Payer (MSP) check ────────────────
    # Always flag — the coder must confirm MSP status before billing Medicare.
    issues.append(Issue(
        code="CMS-006", sev=Severity.warning,
        tEn="MSP: verify no primary payer exists",
        tEs="MSP: verificar que no existe pagador primario",
        dEn="Medicare Secondary Payer (MSP) rules require verifying that no employer group health plan, liability insurance, or workers' comp plan is primary. MSP violations carry civil money penalties (42 CFR §489.20(g)).",
        dEs="Las reglas MSP requieren verificar que ningún plan de salud de grupo de empleadores, seguro de responsabilidad o compensación laboral es primario. Las violaciones MSP conllevan penalidades civiles (42 CFR §489.20(g)).",
    ))
    fixes.append(Fix(
        tEn="Complete MSP questionnaire",
        tEs="Completar cuestionario MSP",
        wEn="Document the completed MSP questionnaire in the patient's chart and confirm Medicare is the appropriate primary payer before submission.",
        wEs="Documente el cuestionario MSP completado en el expediente del paciente y confirme que Medicare es el pagador primario apropiado antes de someter.",
    ))
    risk += 15

    # ── CMS-003: Telehealth modifier required (FCSO Jurisdiction N) ──
    pos = str(claim.pos or "11")
    if pos == "02":
        for sl in slines:
            if not (set(sl.mods) & TELEHEALTH_MODS):
                issues.append(Issue(
                    code="CMS-003", sev=Severity.error,
                    tEn=f"Telehealth modifier missing on {sl.cpt}",
                    tEs=f"Modificador de telesalud ausente en {sl.cpt}",
                    dEn=f"FCSO (Jurisdiction N) requires modifier GT or 95 on {sl.cpt} for telehealth services billed with POS 02.",
                    dEs=f"FCSO (Jurisdicción N) requiere el modificador GT o 95 en {sl.cpt} para servicios de telesalud facturados con POS 02.",
                ))
                fixes.append(Fix(
                    tEn=f"Add modifier GT or 95 to {sl.cpt}",
                    tEs=f"Agregar modificador GT o 95 a {sl.cpt}",
                    wEn=f"Add modifier GT (synchronous audio/video) or 95 (interactive audio/video) to {sl.cpt} in the SV1 segment.",
                    wEs=f"Agregue el modificador GT (audio/video sincrónico) o 95 (audio/video interactivo) a {sl.cpt} en el segmento SV1.",
                ))
                risk += 35

    # ── CMS-008: AWV cannot be billed with a standard E&M same day ───
    em_codes = {"99202","99203","99204","99205","99211","99212","99213","99214","99215"}
    if cpt_set & AWV_CODES and cpt_set & em_codes:
        issues.append(Issue(
            code="CMS-008", sev=Severity.warning,
            tEn="AWV + E&M on same day — modifier required",
            tEs="AWV + E&M el mismo día — se requiere modificador",
            dEn="Billing an Annual Wellness Visit (G0438/G0439) with an E&M on the same day requires modifier 25 on the E&M to document that the E&M addressed a problem separate from the wellness visit.",
            dEs="Facturar una Visita de Bienestar Anual (G0438/G0439) con un E&M el mismo día requiere el modificador 25 en el E&M para documentar que el E&M abordó un problema separado de la visita de bienestar.",
        ))
        fixes.append(Fix(
            tEn="Add modifier 25 to the E&M code",
            tEs="Agregar modificador 25 al código E&M",
            wEn="Append modifier 25 to the E&M code and ensure the clinical note clearly documents a significant, separately identifiable problem-oriented service.",
            wEs="Agregue el modificador 25 al código E&M y asegúrese de que la nota clínica documente claramente un servicio separado e identificable orientado a un problema.",
        ))
        risk += 20

    # ── CMS-009: IPPE only billable once per beneficiary ──────────────
    if IPPE_CODE in cpt_set:
        issues.append(Issue(
            code="CMS-009", sev=Severity.info,
            tEn="IPPE: verify not previously billed",
            tEs="IPPE: verificar que no se ha facturado antes",
            dEn=f"G0402 (Initial Preventive Physical Exam / 'Welcome to Medicare') is billable only once per beneficiary, within the first 12 months of Medicare Part B enrollment. Verify this patient's IPPE history.",
            dEs=f"G0402 (Examen Físico Preventivo Inicial / 'Bienvenida a Medicare') solo se puede facturar una vez por beneficiario, dentro de los primeros 12 meses de inscripción en Medicare Parte B. Verifique el historial de IPPE de este paciente.",
        ))
        fixes.append(Fix(
            tEn="Verify IPPE claim history in PECOS/CMS portal",
            tEs="Verificar historial de IPPE en portal PECOS/CMS",
            wEn="Check the CMS beneficiary portal or contact FCSO provider services to confirm this is the patient's first IPPE claim before submission.",
            wEs="Consulte el portal de beneficiarios de CMS o contacte a los servicios de proveedores de FCSO para confirmar que este es el primer reclamo de IPPE del paciente antes de someter.",
        ))
        risk += 8

    # ── CMS-010: CCM — only one practitioner per month ────────────────
    if cpt_set & CCM_CODES:
        issues.append(Issue(
            code="CMS-010", sev=Severity.info,
            tEn="CCM: verify single billing provider per month",
            tEs="CCM: verificar un solo proveedor facturante por mes",
            dEn="Chronic Care Management codes (99490–99491, 99487–99489) can only be billed by ONE practitioner per patient per calendar month. Verify no other provider billed CCM for this patient this month.",
            dEs="Los códigos de Manejo de Cuidado Crónico (99490–99491, 99487–99489) solo pueden ser facturados por UN proveedor por paciente por mes calendario. Verifique que ningún otro proveedor facturó CCM para este paciente este mes.",
        ))
        fixes.append(Fix(
            tEn="Confirm exclusive CCM billing for this month",
            tEs="Confirmar facturación CCM exclusiva para este mes",
            wEn="Check Medicare claims history (via PECOS or CMS portal) to confirm no other practitioner submitted a CCM claim for this beneficiary in the same calendar month.",
            wEs="Verifique el historial de reclamos Medicare (vía PECOS o portal CMS) para confirmar que ningún otro proveedor sometió un reclamo de CCM para este beneficiario en el mismo mes calendario.",
        ))
        risk += 8

    return issues, fixes, risk
