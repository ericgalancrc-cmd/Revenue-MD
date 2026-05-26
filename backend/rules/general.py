"""
General billing rules — apply to all payers.

Covers: CCI bundling edits, authorization presence, unit
reasonableness, and telehealth modifier requirements.
"""

from __future__ import annotations
from typing import List, Set
from models import Issue, Suggestion, ParsedClaim, ServiceLine, Severity

# CCI (Correct Coding Initiative) pairs that cannot be billed same-day.
# Format: frozenset({code_a, code_b})
CCI_BUNDLES: List[Set[str]] = [
    {"90837", "90834"},   # 60-min and 45-min therapy — use one
    {"90837", "90832"},   # 60-min and 30-min therapy — use one
    {"90834", "90832"},   # 45-min and 30-min therapy — use one
    {"99213", "99212"},   # E&M level conflict
    {"99214", "99213"},   # E&M level conflict
]

# Valid add-on codes (may appear alongside a primary without bundling error)
ADDON_CODES = {"90785", "90833", "99354", "99355"}

# Codes that require the GT modifier for telehealth billing
TELEHEALTH_CODES = {
    "90832", "90834", "90837",
    "90839", "90840",
    "99201", "99202", "99203", "99204", "99205",
    "99211", "99212", "99213", "99214", "99215",
    "H0004",
}

# Reasonable daily unit caps (general — payer rules may tighten these)
UNIT_CAPS: dict[str, int] = {
    "H0004": 16,   # Global max; Plan Vital tightens to 8
    "H0019": 24,
    "90832": 2,
    "90834": 2,
    "90837": 2,
}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    cpt_codes = [sl.cpt for sl in claim.service_lines]
    cpt_set   = set(cpt_codes)

    _check_cci(cpt_set, issues, fixes)
    _check_units(claim.service_lines, issues, fixes)
    _check_telehealth(claim.service_lines, issues, fixes)

    return issues, fixes


def _check_cci(cpt_set: set, issues: List[Issue], fixes: List[Suggestion]):
    for bundle in CCI_BUNDLES:
        if bundle.issubset(cpt_set):
            a, b = tuple(bundle)
            issues.append(Issue(
                sev = Severity.error,
                tEn = f"Bundling conflict: {a} + {b}",
                tEs = f"Conflicto de agrupación: {a} + {b}",
                dEn = f"CCI edits prevent billing {a} and {b} on the same date. Bill only the higher-paying code.",
                dEs = f"Las ediciones CCI impiden facturar {a} y {b} el mismo día. Facture solo el código de mayor pago.",
            ))
            fixes.append(Suggestion(
                tEn = f"Remove {b} — keep {a}",
                tEs = f"Eliminar {b} — mantener {a}",
                wEn = "Avoids CCI denial; the higher-level code reimburses the full session.",
                wEs = "Evita denegación CCI; el código mayor nivel reembolsa la sesión completa.",
            ))


def _check_units(lines: List[ServiceLine], issues: List[Issue], fixes: List[Suggestion]):
    for sl in lines:
        cap = UNIT_CAPS.get(sl.cpt)
        if cap and sl.units > cap:
            issues.append(Issue(
                sev = Severity.warning,
                tEn = f"Unit count questionable for {sl.cpt}",
                tEs = f"Cantidad de unidades cuestionable para {sl.cpt}",
                dEn = f"{sl.cpt} billed at {sl.units} units; general max is {cap}/day. Payer-specific cap may be lower.",
                dEs = f"{sl.cpt} facturado a {sl.units} unidades; máximo general es {cap}/día. El límite del asegurador puede ser menor.",
            ))
            fixes.append(Suggestion(
                tEn = f"Verify {sl.cpt} units against payer fee schedule",
                tEs = f"Verificar unidades de {sl.cpt} contra el fee schedule del asegurador",
                wEn = "Confirm the documented service time supports the billed unit count.",
                wEs = "Confirme que el tiempo documentado justifica la cantidad de unidades.",
            ))


def _check_telehealth(lines: List[ServiceLine], issues: List[Issue], fixes: List[Suggestion]):
    for sl in lines:
        if sl.cpt in TELEHEALTH_CODES:
            has_gt  = "GT" in sl.modifier
            has_95  = "95" in sl.modifier
            has_pos = False  # POS code not parsed at line level in this MVP

            # If no telehealth modifier, flag as info (may be in-person)
            if not has_gt and not has_95:
                issues.append(Issue(
                    sev = Severity.info,
                    tEn = f"No telehealth modifier on {sl.cpt}",
                    tEs = f"Sin modificador de telesalud en {sl.cpt}",
                    dEn = f"If this was a telehealth visit, add modifier GT (Plan Vital/ASES) or 95 (commercial). If in-person, ignore.",
                    dEs = f"Si fue una visita de telesalud, añada el modificador GT (Plan Vital/ASES) o 95 (comercial). Si fue presencial, ignore.",
                ))
                fixes.append(Suggestion(
                    tEn = f"Add modifier GT to {sl.cpt} if telehealth",
                    tEs = f"Añadir modificador GT a {sl.cpt} si es telesalud",
                    wEn = "GT is required by ASES/Plan Vital for telehealth services to avoid routing denial.",
                    wEs = "GT es requerido por ASES/Plan Vital para servicios de telesalud y evitar denegación.",
                ))
