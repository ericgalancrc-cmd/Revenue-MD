"""
MUE (Medically Unlikely Edits) — applies regardless of payer.

Flags a service line whose billed units exceed the clinically plausible
maximum for that CPT code, per rules/mue_map.py. Distinct from ASES-001
in rules/ases.py, which is a payer-scoped (ASES/Plan Vital only) cap for
a different set of behavioral-health HCPCS codes — the two tables are
deliberately non-overlapping so a claim never gets double-flagged for
the same code.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity
from rules.mue_map import MUE_CAPS


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    for sl in claim.service_lines:
        cap = MUE_CAPS.get(sl.cpt)
        if cap is None or sl.units <= cap:
            continue
        issues.append(Issue(
            code="MUE-001", sev=Severity.error,
            tEn=f"{sl.cpt}: exceeds MUE cap ({sl.units} > {cap})",
            tEs=f"{sl.cpt}: excede el límite MUE ({sl.units} > {cap})",
            dEn=f"{sl.cpt} is billed at {sl.units} units, exceeding the Medically "
                f"Unlikely Edit cap of {cap} unit(s) per patient/day/provider. "
                f"Claims over the MUE cap deny the excess units outright.",
            dEs=f"{sl.cpt} se factura con {sl.units} unidades, excediendo el límite "
                f"de Edición Médicamente Improbable (MUE) de {cap} unidad(es) por "
                f"paciente/día/proveedor. Los reclamos que exceden el límite MUE "
                f"deniegan las unidades excedentes directamente.",
        ))
        fixes.append(Fix(
            tEn=f"Reduce {sl.cpt} to {cap} unit(s) or split across dates",
            tEs=f"Reducir {sl.cpt} a {cap} unidad(es) o dividir entre fechas",
            wEn=f"Verify the units billed are correct. If genuinely {sl.units} "
                f"units were performed, confirm this isn't a data-entry error "
                f"before submission — most payers will deny anything over {cap}.",
            wEs=f"Verifique que las unidades facturadas sean correctas. Si "
                f"genuinamente se realizaron {sl.units} unidades, confirme que no "
                f"sea un error de entrada antes de someter — la mayoría de los "
                f"pagadores denegarán todo lo que exceda {cap}.",
        ))
        risk += 30

    return issues, fixes, risk
