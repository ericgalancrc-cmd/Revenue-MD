"""
Medicare billing rules for Puerto Rico.

Medicare in Puerto Rico is administered by FCSO (First Coast Service Options),
the MAC for Jurisdiction N.  Covers Part B professional claims (837P).

Key regulatory sources:
  - 42 CFR Part 424 (timely filing, ABN)
  - 42 CFR Part 410 (covered services, telehealth)
  - 42 CFR Part 489 (MSP)
  - CMS Pub 100-04 (Medicare Claims Processing Manual)
  - CMS MLN Matters SE20011 (telehealth)
  - AMA CPT 2021 E/M guidelines
"""

from __future__ import annotations
import re
from typing import List
from models import Issue, Suggestion, ParsedClaim, ServiceLine, Severity

PAYER_NAMES = {
    "medicare", "fcso", "first coast", "medicare part b",
    "cms", "noridian", "palmetto",   # other MACs occasionally seen
}

# Codes on the Medicare telehealth services list (condensed — verify with CMS)
TELEHEALTH_CODES = {
    "90832", "90834", "90837", "90839", "90840",
    "90847", "90853",
    "99202", "99203", "99204", "99205",
    "99211", "99212", "99213", "99214", "99215",
    "H0004", "G0396", "G0397",
}

# CPT E/M codes subject to 2021 AMA documentation guidelines
EM_CODES = {
    "99202", "99203", "99204", "99205",
    "99211", "99212", "99213", "99214", "99215",
}

# High-value codes that commonly trigger Medicare ABN review
ABN_RISK_CODES = {"G0396", "G0397", "H0004", "H0019", "H0031"}

# Medicare timely filing: 12 months from DOS (42 CFR §424.44)
TIMELY_FILING_DAYS = 365


def is_medicare(payer: str) -> bool:
    p = payer.lower()
    return any(name in p for name in PAYER_NAMES)


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    _check_npi(claim, issues, fixes)
    _check_telehealth(claim, issues, fixes)
    _check_em_documentation(claim, issues, fixes)
    _check_msp_flag(claim, issues, fixes)
    _check_abn_risk(claim, issues, fixes)

    return issues, fixes


def _check_npi(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    if not claim.npi:
        issues.append(Issue(
            sev=Severity.error,
            tEn="Rendering provider NPI missing — Medicare requires NPI on all claims",
            tEs="NPI del proveedor ausente — Medicare requiere NPI en todos los reclamos",
            dEn="Medicare (FCSO) requires the rendering provider NPI in loop 2310B and the billing entity NPI in loop 2010BB of the 837P. Claims without NPI are returned.",
            dEs="Medicare (FCSO) requiere NPI del proveedor en loop 2310B y NPI de la entidad facturadora en loop 2010BB del 837P. Reclamos sin NPI son devueltos.",
        ))
        fixes.append(Suggestion(
            tEn="Add rendering NPI (loop 2310B) and billing NPI (loop 2010BB)",
            tEs="Añadir NPI del proveedor (loop 2310B) y NPI de facturación (loop 2010BB)",
            wEn="Verify the provider's NPI is active in PECOS and enrolled with FCSO before submitting.",
            wEs="Verifique que el NPI del proveedor esté activo en PECOS y matriculado con FCSO antes de someter.",
        ))


def _check_telehealth(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for sl in claim.service_lines:
        if sl.cpt in TELEHEALTH_CODES:
            has_gt = "GT" in sl.modifier
            has_95 = "95" in sl.modifier
            if not has_gt and not has_95:
                issues.append(Issue(
                    sev=Severity.warning,
                    tEn=f"Telehealth modifier missing on {sl.cpt} (Medicare requires GT)",
                    tEs=f"Modificador de telesalud ausente en {sl.cpt} (Medicare requiere GT)",
                    dEn=f"Medicare requires modifier GT on {sl.cpt} for telehealth services (42 CFR §410.78). Without GT, FCSO will process the claim as an in-person visit, which may trigger a site-of-service denial.",
                    dEs=f"Medicare requiere modificador GT en {sl.cpt} para telesalud (42 CFR §410.78). Sin GT, FCSO procesará el reclamo como visita presencial.",
                ))
                fixes.append(Suggestion(
                    tEn=f"Add modifier GT to {sl.cpt} — confirm service was delivered via telehealth",
                    tEs=f"Añadir modificador GT a {sl.cpt} — confirmar que el servicio fue por telesalud",
                    wEn="Also verify the service is on the CMS Medicare Telehealth Services List for the date of service.",
                    wEs="También verifique que el servicio esté en la lista de Telesalud de Medicare de CMS para la fecha del servicio.",
                ))


def _check_em_documentation(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    cpt_set = {sl.cpt for sl in claim.service_lines}
    em_billed = cpt_set & EM_CODES
    if em_billed:
        issues.append(Issue(
            sev=Severity.info,
            tEn=f"E/M code(s) {', '.join(sorted(em_billed))} — verify 2021 AMA documentation",
            tEs=f"Codigo(s) E/M {', '.join(sorted(em_billed))} — verificar documentacion AMA 2021",
            dEn="Since Jan 1, 2021, Medicare E/M level is determined by total time on the date of service OR medical decision making (MDM). History and exam components are no longer required. Ensure the note supports the selected level by one of these two methods.",
            dEs="Desde el 1 de enero de 2021, el nivel de E/M de Medicare se determina por tiempo total en la fecha de servicio O toma de decisiones medicas (MDM). Historia y examen ya no son requeridos. Asegurese que la nota sustente el nivel seleccionado.",
        ))
        fixes.append(Suggestion(
            tEn="Confirm the clinical note documents total time or MDM to support the E/M level",
            tEs="Confirmar que la nota clinica documenta tiempo total o MDM para sustener el nivel de E/M",
            wEn="E/M downcoding is a top Medicare audit finding. The 2021 guidelines simplify, but the documentation must explicitly state the basis (time or MDM).",
            wEs="El downcoding de E/M es un hallazgo de auditoria frecuente en Medicare. Las guias de 2021 simplifican, pero la documentacion debe indicar explicitamente la base (tiempo o MDM).",
        ))


def _check_msp_flag(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    issues.append(Issue(
        sev=Severity.info,
        tEn="Medicare claim — verify Medicare Secondary Payer (MSP) status",
        tEs="Reclamo Medicare — verificar estado de Pagador Secundario Medicare (MSP)",
        dEn="Before submitting any Medicare claim, confirm the patient does not have primary coverage through an employer group health plan, VA, TRICARE, or other source. Submitting to Medicare as primary when another payer is primary is an MSP violation (42 CFR §489.20).",
        dEs="Antes de someter cualquier reclamo Medicare, confirme que el paciente no tiene cobertura primaria por plan de salud patronal, VA, TRICARE u otra fuente. Someter a Medicare como primario cuando otro pagador es primario es una violacion MSP (42 CFR §489.20).",
    ))
    fixes.append(Suggestion(
        tEn="Run MSP inquiry in FCSO portal before submitting",
        tEs="Realizar consulta MSP en el portal de FCSO antes de someter",
        wEn="Use the CMS MSP Inquiry or the FCSO provider portal to verify payer order for each date of service.",
        wEs="Use la Consulta MSP de CMS o el portal de proveedores de FCSO para verificar el orden de pagadores.",
    ))


def _check_abn_risk(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for sl in claim.service_lines:
        if sl.cpt in ABN_RISK_CODES:
            issues.append(Issue(
                sev=Severity.warning,
                tEn=f"ABN may be required for {sl.cpt} if Medicare coverage is uncertain",
                tEs=f"ABN puede ser requerido para {sl.cpt} si la cobertura Medicare es incierta",
                dEn=f"{sl.cpt} has variable Medicare coverage. If there is any chance Medicare will deny for medical necessity or frequency, issue an Advance Beneficiary Notice (ABN) to the patient before service (42 CFR §411.408; CMS Pub 100-04, Ch. 30).",
                dEs=f"{sl.cpt} tiene cobertura variable en Medicare. Si existe alguna posibilidad de que Medicare deniegue por necesidad medica o frecuencia, emita un Aviso de Beneficiario (ABN) al paciente antes del servicio (42 CFR §411.408).",
            ))
            fixes.append(Suggestion(
                tEn=f"Issue a valid ABN to the patient for {sl.cpt} before service",
                tEs=f"Emitir un ABN valido al paciente para {sl.cpt} antes del servicio",
                wEn="A valid ABN shifts financial liability to the patient if Medicare denies. Without it, the provider may not collect from the patient.",
                wEs="Un ABN valido transfiere la responsabilidad financiera al paciente si Medicare deniega. Sin el, el proveedor no puede cobrarle al paciente.",
            ))
