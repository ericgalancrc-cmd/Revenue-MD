"""
Missing Modifier Finder — applies regardless of payer.

Generalizes and extends the modifier checks that already exist scattered
across general.py/medicare.py (NCCI bundling, the narrow psychotherapy-
add-on modifier-25 case, telehealth GT/95) with a broader systematic
sweep for common modifier gaps that aren't tied to one specific scenario.

Deliberately narrow in scope to what's well-established and low-risk to
assert generically:
- MOD-001: the same CPT billed twice on one claim with no modifier that
  would distinguish the two lines (59/76/77/50/LT/RT/XE/XS/XP/XU) —
  flags a likely duplicate-billing or missing-modifier situation without
  claiming to know WHICH modifier is correct (that depends on clinical
  context this claim doesn't carry).
- MOD-002: an E&M code billed alongside a separate, non-add-on procedure
  code on the same claim without modifier 25 on the E&M. (The narrower
  psychotherapy-add-on case is already covered by CMS-002 in general.py
  and is explicitly skipped here to avoid a duplicate/redundant issue.)
- MOD-003: a well-established professional/technical-component-split
  code (see pc_tc_map.py) billed in a facility place-of-service without
  modifier 26 — the facility likely owns the equipment, so the
  technical component shouldn't also be billed by the physician.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity
from rules.general import EM_CODES
from rules.pc_tc_map import PC_TC_SPLIT_CODES, FACILITY_POS

# Modifiers that legitimately distinguish two lines with the same CPT code
DISTINGUISHING_MODS = {"59", "76", "77", "50", "LT", "RT", "XE", "XS", "XP", "XU"}

# The add-on codes CMS-002 (general.py) already covers for the E&M+25 case —
# skip those here so we don't fire a second, redundant issue for them.
_ADDON_CODES_HANDLED_ELSEWHERE = {"90833", "90836"}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    if not slines:
        return [], [], 0

    # ── MOD-001: duplicate CPT without a distinguishing modifier ──────
    cpt_lines: dict = {}
    for sl in slines:
        cpt_lines.setdefault(sl.cpt, []).append(sl)
    for cpt, lines in cpt_lines.items():
        if len(lines) < 2:
            continue
        if any(DISTINGUISHING_MODS & set(l.mods) for l in lines):
            continue
        issues.append(Issue(
            code="MOD-001", sev=Severity.warning,
            tEn=f"Duplicate {cpt} without a distinguishing modifier",
            tEs=f"{cpt} duplicado sin modificador distintivo",
            dEn=f"{cpt} appears {len(lines)} times on this claim with no modifier "
                f"(59/76/77/50/LT/RT, or an X-modifier) distinguishing the lines. "
                f"If these represent genuinely separate services, add the modifier "
                f"that applies; if not, this may be an unintentional duplicate.",
            dEs=f"{cpt} aparece {len(lines)} veces en este reclamo sin un modificador "
                f"(59/76/77/50/LT/RT, o un modificador X) que distinga las líneas. "
                f"Si representan servicios genuinamente separados, agregue el modificador "
                f"correspondiente; si no, esto puede ser un duplicado no intencional.",
        ))
        fixes.append(Fix(
            tEn=f"Add a distinguishing modifier to {cpt}, or remove the duplicate",
            tEs=f"Agregue un modificador distintivo a {cpt}, o elimine el duplicado",
            wEn=f"Determine whether both {cpt} lines reflect separate, distinct services. "
                f"If so, add the appropriate modifier (59/76/77/50/LT/RT or an X-modifier) "
                f"to the second line. If not, remove the duplicate line.",
            wEs=f"Determine si ambas líneas de {cpt} reflejan servicios separados y distintos. "
                f"Si es así, agregue el modificador apropiado (59/76/77/50/LT/RT o un modificador X) "
                f"a la segunda línea. Si no, elimine la línea duplicada.",
        ))
        risk += 15

    # ── MOD-002: E&M + separate procedure same day, no modifier 25 ────
    cpt_set = {sl.cpt for sl in slines}
    non_addon_procedures = cpt_set - EM_CODES - _ADDON_CODES_HANDLED_ELSEWHERE
    if non_addon_procedures and (cpt_set & EM_CODES):
        for sl in slines:
            if sl.cpt in EM_CODES and "25" not in sl.mods:
                issues.append(Issue(
                    code="MOD-002", sev=Severity.warning,
                    tEn=f"Modifier 25 may be needed on {sl.cpt}",
                    tEs=f"El modificador 25 podría ser necesario en {sl.cpt}",
                    dEn=f"{sl.cpt} is billed alongside another procedure "
                        f"({', '.join(sorted(non_addon_procedures))}) on the same claim. "
                        f"If the E&M represents a separately identifiable service beyond "
                        f"that procedure, modifier 25 is likely needed.",
                    dEs=f"{sl.cpt} se factura junto con otro procedimiento "
                        f"({', '.join(sorted(non_addon_procedures))}) en el mismo reclamo. "
                        f"Si el E&M representa un servicio separado e identificable más allá "
                        f"de ese procedimiento, probablemente se necesite el modificador 25.",
                ))
                fixes.append(Fix(
                    tEn=f"Confirm and add modifier 25 to {sl.cpt} if applicable",
                    tEs=f"Confirme y agregue el modificador 25 a {sl.cpt} si aplica",
                    wEn=f"Verify the clinical note documents a significant, separately "
                        f"identifiable E&M service, then append modifier 25 to {sl.cpt}.",
                    wEs=f"Verifique que la nota clínica documente un servicio E&M "
                        f"significativo y separadamente identificable, luego agregue el "
                        f"modificador 25 a {sl.cpt}.",
                ))
                risk += 15

    # ── MOD-003: PC/TC split code in a facility POS without modifier 26 ──
    pos = str(claim.pos or "11")
    if pos in FACILITY_POS:
        for sl in slines:
            if sl.cpt in PC_TC_SPLIT_CODES and "26" not in sl.mods and "TC" not in sl.mods:
                desc = PC_TC_SPLIT_CODES[sl.cpt]
                issues.append(Issue(
                    code="MOD-003", sev=Severity.warning,
                    tEn=f"Modifier 26 may be needed on {sl.cpt}",
                    tEs=f"El modificador 26 podría ser necesario en {sl.cpt}",
                    dEn=f"{sl.cpt} ({desc}) is billed with a facility place-of-service "
                        f"({pos}). The facility likely owns the equipment — if so, the "
                        f"physician should bill only the professional component "
                        f"(modifier 26), not the global service.",
                    dEs=f"{sl.cpt} ({desc}) se factura con un lugar de servicio de "
                        f"instalación ({pos}). La instalación probablemente posee el "
                        f"equipo — si es así, el médico debe facturar solo el componente "
                        f"profesional (modificador 26), no el servicio global.",
                ))
                fixes.append(Fix(
                    tEn=f"Confirm equipment ownership and add modifier 26 if applicable",
                    tEs=f"Confirme la propiedad del equipo y agregue el modificador 26 si aplica",
                    wEn=f"Verify whether the facility or the physician's practice owns the "
                        f"equipment used for {sl.cpt}. If the facility owns it, add modifier 26.",
                    wEs=f"Verifique si la instalación o la práctica del médico posee el "
                        f"equipo usado para {sl.cpt}. Si la instalación lo posee, agregue el "
                        f"modificador 26.",
                ))
                risk += 10

    return issues, fixes, risk
