"""
Plan Vital (ASES Medicaid) specific billing rules.

Plan Vital is Puerto Rico's government Medicaid managed care plan
administered under ASES. These rules reflect the Plan Vital Provider
Manual and ASES fee schedule edits.

All rules marked [VERIFY] should be confirmed against the current
ASES authorization grid and Plan Vital provider bulletin before
production use.
"""

from __future__ import annotations
from typing import List
from models import Issue, Suggestion, ParsedClaim, Severity

# [VERIFY] Daily unit cap for H0004 (Community Psychiatric Support & Treatment)
H0004_DAILY_CAP = 8

# [VERIFY] Psychotherapy codes requiring a treatment-plan date in the note
TREATMENT_PLAN_CODES = {"90832", "90834", "90837", "90838"}

# [VERIFY] Codes requiring prior authorization for extended series (>10/year)
PRIOR_AUTH_CODES = {"H0004", "90837", "90834", "90832", "90839"}

# Plan Vital payer name variants we recognize
PAYER_NAMES = {"plan vital", "planvital", "vital", "ases"}


def is_plan_vital(payer: str) -> bool:
    return any(v in payer.lower() for v in PAYER_NAMES)


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    for sl in claim.service_lines:
        _check_h0004_cap(sl, issues, fixes)
        _check_treatment_plan(sl, claim.auth, issues, fixes)
        _check_prior_auth(sl, claim.auth, issues, fixes)

    return issues, fixes


def _check_h0004_cap(sl, issues, fixes):
    if sl.cpt == "H0004" and sl.units > H0004_DAILY_CAP:
        issues.append(Issue(
            sev = Severity.error,
            tEn = "Unit limit exceeded (Plan Vital H0004)",
            tEs = "Límite de unidades excedido (Plan Vital H0004)",
            dEn = (
                f"H0004 billed at {sl.units} units; Plan Vital caps this at "
                f"{H0004_DAILY_CAP}/day. Claim will deny."
            ),
            dEs = (
                f"H0004 facturado a {sl.units} unidades; Plan Vital limita a "
                f"{H0004_DAILY_CAP}/día. El reclamo será denegado."
            ),
        ))
        fixes.append(Suggestion(
            tEn = f"Reduce H0004 to {H0004_DAILY_CAP} units",
            tEs = f"Reducir H0004 a {H0004_DAILY_CAP} unidades",
            wEn = f"Brings the claim within the Plan Vital daily cap of {H0004_DAILY_CAP} units.",
            wEs = f"Ajusta el reclamo al tope diario de Plan Vital de {H0004_DAILY_CAP} unidades.",
        ))


def _check_treatment_plan(sl, auth, issues, fixes):
    if sl.cpt in TREATMENT_PLAN_CODES:
        # We can't read the clinical note, so flag as a reminder.
        issues.append(Issue(
            sev = Severity.warning,
            tEn = f"Treatment-plan date required for {sl.cpt} (Plan Vital)",
            tEs = f"Fecha de plan de tratamiento requerida para {sl.cpt} (Plan Vital)",
            dEn = (
                f"Plan Vital requires the active treatment-plan date in the clinical note "
                f"for {sl.cpt}. Missing documentation is the #1 audit finding."
            ),
            dEs = (
                f"Plan Vital requiere la fecha del plan de tratamiento activo en la nota "
                f"clínica para {sl.cpt}. Documentación faltante es el hallazgo #1 en auditorías."
            ),
        ))
        fixes.append(Suggestion(
            tEn = "Verify treatment-plan date is documented in the note",
            tEs = "Verificar que la fecha del plan de tratamiento esté en la nota",
            wEn = "Satisfies Plan Vital's documentation requirement and prevents post-payment audit recoupment.",
            wEs = "Cumple el requisito de documentación de Plan Vital y previene recuperaciones post-pago.",
        ))


def _check_prior_auth(sl, auth, issues, fixes):
    if sl.cpt in PRIOR_AUTH_CODES and not auth:
        issues.append(Issue(
            sev = Severity.error,
            tEn = f"Authorization missing for {sl.cpt} (Plan Vital)",
            tEs = f"Autorización faltante para {sl.cpt} (Plan Vital)",
            dEn = (
                f"Plan Vital requires prior authorization for {sl.cpt}. "
                f"No REF*D9 authorization number found on this claim."
            ),
            dEs = (
                f"Plan Vital requiere autorización previa para {sl.cpt}. "
                f"No se encontró número de autorización REF*D9 en este reclamo."
            ),
        ))
        fixes.append(Suggestion(
            tEn = f"Add the prior-auth number for {sl.cpt}",
            tEs = f"Añadir el número de autorización previa para {sl.cpt}",
            wEn = "Obtain the auth number from Plan Vital's portal or call center and attach to the claim.",
            wEs = "Obtenga el número del portal de Plan Vital o centro de llamadas y adjúntelo al reclamo.",
        ))
