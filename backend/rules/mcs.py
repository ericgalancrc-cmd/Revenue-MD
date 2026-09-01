"""
MCS Classicare / MCS Platino (Medicare Advantage, Puerto Rico) rules.

MCS is a Medicare Advantage organization, so 42 CFR Part 422 (MA) rules
apply on top of general Medicare requirements. MCS Platino is the
wrap-around product for dual-eligible (Medicare + Medicaid) members.

Rule sources mirror what's already published in the app's own Compliance
tab for MCS — see the "MCS" entry in src/App.jsx's payer facts.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


# MCS Platino is the dual-eligible (Medicare + Medicaid) wrap-around product;
# MCS Classicare is the standard MA product. There's no reliable way to tell
# them apart from member_id prefix alone (undocumented), so Platino-specific
# checks below key off diagnosis/plan hints already present on the claim
# rather than guessing at a prefix scheme.

# Behavioral health codes requiring documentation of MA-specific auth rules
# that may differ from FFS Medicare's schedule (per the app's own "needs
# verification" note for MCS prior-auth scheduling).
PA_REVIEW_CODES = {
    "99241", "99242", "99243", "99244", "99245",  # specialist consults
    "70551", "70552", "70553",                     # MRI brain (high-cost imaging)
    "72148", "72149", "72158",                     # MRI lumbar spine
}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "MCS":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}

    # ── MCS-001: Rendering provider Medicare enrollment (PTAN) ────────
    # MA claims deny outright if the rendering provider isn't enrolled in
    # Medicare with a valid PTAN for Puerto Rico (statutory, 42 CFR Part 422).
    if not (claim.npi or "").strip():
        issues.append(Issue(
            code="MCS-001", sev=Severity.error,
            tEn="NPI missing — required for MA enrollment check",
            tEs="NPI ausente — requerido para verificar matrícula MA",
            dEn="MCS (Medicare Advantage) requires the rendering provider to have a valid PTAN and active Medicare enrollment for Puerto Rico. No NPI is present on this claim to verify that enrollment.",
            dEs="MCS (Medicare Advantage) requiere que el proveedor tenga un PTAN válido y matrícula activa en Medicare para Puerto Rico. No hay NPI en este reclamo para verificar esa matrícula.",
        ))
        fixes.append(Fix(
            tEn="Add rendering provider NPI",
            tEs="Agregar NPI del proveedor",
            wEn="Enter the rendering provider's NPI and confirm their PTAN/Medicare enrollment is active for Puerto Rico before submission.",
            wEs="Ingrese el NPI del proveedor y confirme que su PTAN/matrícula Medicare está activa para Puerto Rico antes de someter.",
        ))
        risk += 30

    # ── MCS-002: Medicare Secondary Payer (MSP) — applies to all MA claims ──
    # Same statutory basis as CMS-006 in medicare.py; MSP rules apply to
    # Medicare Advantage the same as they do to FFS Medicare.
    issues.append(Issue(
        code="MCS-002", sev=Severity.warning,
        tEn="MSP: verify no other primary payer",
        tEs="MSP: verificar que no existe otro pagador primario",
        dEn="Medicare Secondary Payer (MSP) rules apply to MA plans the same as FFS Medicare — confirm no employer group health plan, liability insurance, or workers' comp is primary before billing MCS.",
        dEs="Las reglas MSP aplican a planes MA igual que a Medicare tradicional — confirme que ningún plan de grupo de empleador, seguro de responsabilidad o compensación laboral es primario antes de facturar a MCS.",
    ))
    fixes.append(Fix(
        tEn="Complete MSP questionnaire",
        tEs="Completar cuestionario MSP",
        wEn="Document the completed MSP questionnaire in the patient's chart and confirm MCS is the appropriate primary payer before submission.",
        wEs="Documente el cuestionario MSP completado en el expediente del paciente y confirme que MCS es el pagador primario apropiado antes de someter.",
    ))
    risk += 15

    # ── MCS-003: Specialist consult / high-cost imaging — verify PA schedule ──
    # MCS's own prior-auth list can differ from FFS Medicare's, and the app's
    # published facts flag this as "needs verification" rather than confirmed.
    flagged = cpt_set & PA_REVIEW_CODES
    if flagged and not claim.auth:
        issues.append(Issue(
            code="MCS-003", sev=Severity.warning,
            tEn="Verify MCS prior-auth requirement",
            tEs="Verificar requisito de autorización previa de MCS",
            dEn=f"MCS's prior-authorization schedule for {', '.join(sorted(flagged))} may differ from standard FFS Medicare. No auth number is on this claim — confirm via the MCS provider portal whether prior auth is required before submission.",
            dEs=f"El listado de autorizaciones previas de MCS para {', '.join(sorted(flagged))} puede diferir del Medicare tradicional. No hay número de autorización en este reclamo — confirme vía el portal de proveedores de MCS si se requiere autorización previa antes de someter.",
        ))
        fixes.append(Fix(
            tEn="Check MCS provider portal for PA requirement",
            tEs="Verificar requisito de PA en portal de MCS",
            wEn=f"Log in to the MCS provider portal to confirm whether {', '.join(sorted(flagged))} requires prior authorization, and obtain the auth number if so before submitting.",
            wEs=f"Ingrese al portal de proveedores de MCS para confirmar si {', '.join(sorted(flagged))} requiere autorización previa, y obtenga el número de autorización antes de someter.",
        ))
        risk += 15

    return issues, fixes, risk
