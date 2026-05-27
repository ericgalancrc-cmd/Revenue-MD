"""
MMM Healthcare billing rules.

Covers both MMM Multi Health (ASES/Medicaid GHP) and MMM Classicare /
MMM Platino (Medicare Advantage + dual-eligible wrap-around).
ASES rules (ases.py) are applied separately when payer is MMM Multi Health.
"""

from __future__ import annotations
from typing import List
from models import Issue, Suggestion, ParsedClaim, ServiceLine, Severity

PAYER_NAMES_MEDICAID = {"mmm", "mmm multi", "mmm multi health", "mmm medicaid"}
PAYER_NAMES_MA       = {"mmm classicare", "mmm platinum", "mmm platino", "mmm ma"}

# Codes that require prior auth from MMM BH authorization grid
MMM_BH_AUTH_CODES = {
    "H0004", "H0019", "H0031", "H0032",
    "90832", "90834", "90837", "90839", "90840",
    "90847", "90853",
}

# MMM MA timely filing window: 12 months (42 CFR §424.44 via CMS contract)
MMM_MA_TIMELY_DAYS = 365
# MMM Medicaid timely filing window: 90 days (ASES contract)
MMM_MEDICAID_TIMELY_DAYS = 90


def is_mmm(payer: str) -> bool:
    p = payer.lower()
    return "mmm" in p


def is_mmm_ma(payer: str) -> bool:
    p = payer.lower()
    return "mmm" in p and any(k in p for k in ("classicare", "platino", "platinum", " ma"))


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    if is_mmm_ma(claim.payer):
        _check_ma_rules(claim, issues, fixes)
    else:
        _check_medicaid_rules(claim, issues, fixes)

    _check_bh_auth(claim, issues, fixes)

    return issues, fixes


def _check_ma_rules(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    """Medicare Advantage (Classicare / Platino) specific checks."""
    issues.append(Issue(
        sev=Severity.info,
        tEn="MMM MA claim — Medicare Advantage rules apply (42 CFR Part 422)",
        tEs="Reclamo MMM MA — aplican reglas Medicare Advantage (42 CFR Parte 422)",
        dEn="MMM Classicare/Platino is a Medicare Advantage plan. Timely filing is up to 12 months from DOS. Medicare secondary payer (MSP) rules apply if another payer is primary.",
        dEs="MMM Classicare/Platino es un plan Medicare Advantage. Presentación hasta 12 meses desde DOS. Reglas MSP aplican si otro pagador es primario.",
    ))
    fixes.append(Suggestion(
        tEn="Verify MSP order before submitting to MMM MA",
        tEs="Verificar orden de pagador primario (MSP) antes de someter a MMM MA",
        wEn="If the member has other coverage (employer, VA, TRICARE), that plan is primary. Submit to MMM MA as secondary.",
        wEs="Si el miembro tiene otra cobertura (patronal, VA, TRICARE), ese plan es primario. Someter a MMM MA como secundario.",
    ))


def _check_medicaid_rules(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    """MMM Multi Health (Medicaid GHP) specific checks."""
    if not claim.npi:
        issues.append(Issue(
            sev=Severity.error,
            tEn="Rendering NPI missing — required for MMM Medicaid (ASES)",
            tEs="NPI del proveedor ausente — requerido para MMM Medicaid (ASES)",
            dEn="MMM Multi Health follows ASES requirements. Both rendering NPI (loop 2310B) and group NPI (loop 2010BB) are mandatory.",
            dEs="MMM Multi Health sigue los requisitos de ASES. NPI del proveedor (loop 2310B) y del grupo (loop 2010BB) son obligatorios.",
        ))
        fixes.append(Suggestion(
            tEn="Add rendering NPI and group NPI to the 837P",
            tEs="Añadir NPI del proveedor y del grupo al 837P",
            wEn="Missing NPI causes immediate clean-claim rejection in the ASES clearinghouse.",
            wEs="NPI faltante causa rechazo inmediato de reclamo limpio en el clearinghouse ASES.",
        ))


def _check_bh_auth(claim: ParsedClaim, issues: List[Issue], fixes: List[Suggestion]):
    for sl in claim.service_lines:
        if sl.cpt in MMM_BH_AUTH_CODES and not claim.auth:
            issues.append(Issue(
                sev=Severity.error,
                tEn=f"Prior authorization required for {sl.cpt} (MMM)",
                tEs=f"Autorización previa requerida para {sl.cpt} (MMM)",
                dEn=f"MMM requires prior authorization for {sl.cpt}. The authorization number must appear in REF*D9 on the 837P. Claims submitted without it will deny.",
                dEs=f"MMM requiere autorización previa para {sl.cpt}. El número de autorización debe aparecer en REF*D9 del 837P.",
            ))
            fixes.append(Suggestion(
                tEn=f"Obtain MMM authorization and add to REF*D9 for {sl.cpt}",
                tEs=f"Obtener autorización MMM y añadir a REF*D9 para {sl.cpt}",
                wEn="Contact MMM provider services to verify the authorization number before resubmitting.",
                wEs="Contacte a servicios al proveedor de MMM para verificar el número de autorización antes de resometer.",
            ))
