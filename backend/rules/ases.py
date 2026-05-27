"""
ASES / PR Medicaid shared billing rules.

Applies to all ASES-contracted plans (Plan Vital, MMM Multi Health,
Plan Menonita, Triple-S GHP, Humana GHP).  Payer-specific overrides
live in the individual payer modules.
"""

from __future__ import annotations
from typing import List
from models import Issue, Suggestion, ParsedClaim, ServiceLine, Severity

PAYER_NAMES = {"ases", "planvital", "plan vital", "vital", "mmm", "mmm multi",
               "menonita", "plan menonita", "triple-s ghp", "humana ghp"}

TIMELY_FILING_DAYS = 90   # ASES Provider Manual 2024, §6.3

# Codes that require prior auth under ASES (ASES BH Authorization Grid 2024)
PRIOR_AUTH_CODES = {
    "H0004", "H0019", "H0031", "H0032", "H0034",
    "90832", "90834", "90837", "90839", "90840",
    "90847", "90853", "90885",
}

# Codes requiring GT modifier for telehealth under ASES
TELEHEALTH_CODES = {
    "90832", "90834", "90837", "90839", "90840",
    "99202", "99203", "99204", "99205",
    "99212", "99213", "99214", "99215",
    "H0004",
}

# ICD-10 unspecified suffixes that ASES flags for specificity
UNSPECIFIED_SUFFIXES = ("9", "00", "10")


def is_ases(payer: str) -> bool:
    p = payer.lower().replace("-", "").replace(" ", "")
    return any(n.replace("-", "").replace(" ", "") in p for n in PAYER_NAMES)


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    _check_npi_present(claim, issues, fixes)
    _check_prior_auth(claim, issues, fixes)
    _check_telehealth_modifier(claim, issues, fixes)
    _check_icd_specificity(claim, issues, fixes)

    return issues, fixes


def _check_npi_present(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    if not claim.npi:
        issues.append(Issue(
            sev=Severity.error,
            tEn="Rendering NPI missing from claim",
            tEs="NPI del proveedor ausente en el reclamo",
            dEn="ASES requires both the rendering provider NPI (loop 2310B) and the billing group NPI (loop 2010BB) on every 837P submission.",
            dEs="ASES requiere el NPI del proveedor (loop 2310B) y el NPI del grupo (loop 2010BB) en cada envío 837P.",
        ))
        fixes.append(Suggestion(
            tEn="Add rendering provider NPI to loop 2310B",
            tEs="Añadir NPI del proveedor al loop 2310B",
            wEn="Missing NPI is a clean-claim rejection — the claim will not process.",
            wEs="NPI faltante es un rechazo de reclamo limpio — el reclamo no procesará.",
        ))


def _check_prior_auth(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for sl in claim.service_lines:
        if sl.cpt in PRIOR_AUTH_CODES and not claim.auth:
            issues.append(Issue(
                sev=Severity.error,
                tEn=f"Prior authorization missing for {sl.cpt} (ASES)",
                tEs=f"Autorización previa ausente para {sl.cpt} (ASES)",
                dEn=f"{sl.cpt} requires prior authorization under ASES. Include the auth number in REF*D9 on the 837P. Without it, the claim will deny.",
                dEs=f"{sl.cpt} requiere autorización previa bajo ASES. Incluir el número de autorización en REF*D9 del 837P.",
            ))
            fixes.append(Suggestion(
                tEn=f"Add auth number to REF*D9 for {sl.cpt}",
                tEs=f"Añadir número de autorización a REF*D9 para {sl.cpt}",
                wEn="Obtain authorization from ASES before service, then place the number in REF*D9.",
                wEs="Obtenga autorización de ASES antes del servicio y coloque el número en REF*D9.",
            ))


def _check_telehealth_modifier(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for sl in claim.service_lines:
        if sl.cpt in TELEHEALTH_CODES:
            has_gt = "GT" in sl.modifier
            has_95 = "95" in sl.modifier
            if not has_gt and not has_95:
                issues.append(Issue(
                    sev=Severity.info,
                    tEn=f"No telehealth modifier on {sl.cpt} — add GT if telehealth (ASES)",
                    tEs=f"Sin modificador de telesalud en {sl.cpt} — añadir GT si es telesalud (ASES)",
                    dEn=f"ASES requires modifier GT for telehealth services. If this was in-person, ignore. If telehealth, add GT to avoid denial.",
                    dEs=f"ASES requiere modificador GT para servicios de telesalud. Si fue presencial, ignorar. Si fue telesalud, añadir GT.",
                ))
                fixes.append(Suggestion(
                    tEn=f"Add modifier GT to {sl.cpt} if delivered via telehealth",
                    tEs=f"Añadir modificador GT a {sl.cpt} si fue por telesalud",
                    wEn="GT is required by ASES/Plan Vital for all telehealth claims to avoid routing denial.",
                    wEs="GT es requerido por ASES/Plan Vital en todos los reclamos de telesalud.",
                ))


def _check_icd_specificity(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for code in claim.icd:
        # Flag codes ending in common unspecified patterns
        if code.endswith("9") and len(code) < 7:
            issues.append(Issue(
                sev=Severity.info,
                tEn=f"ICD-10 {code} may lack specificity",
                tEs=f"ICD-10 {code} puede carecer de especificidad",
                dEn=f"ASES follows CMS guidelines requiring ICD-10 codes at the highest available specificity. Verify whether a more specific code exists for {code}.",
                dEs=f"ASES sigue guías CMS que requieren ICD-10 al nivel más específico disponible. Verifique si existe un código más específico para {code}.",
            ))
            fixes.append(Suggestion(
                tEn=f"Review ICD-10 {code} for a more specific alternative",
                tEs=f"Revisar ICD-10 {code} para una alternativa más específica",
                wEn="Unspecified codes increase audit risk. Use the most specific code supported by the clinical documentation.",
                wEs="Códigos no especificados aumentan riesgo de auditoría. Use el código más específico que sustente la documentación clínica.",
            ))
