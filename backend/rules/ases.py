"""
ASES Mi Salud (PR Medicaid) and Plan Vital — payer-specific rules.

These two plans share the same underlying ASES managed care contract structure,
so most rules apply to both.  Plan-Vital-only overrides are in plan_vital.py.
"""
from __future__ import annotations
from datetime import date, datetime
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


ASES_PAYERS = {"ASES Mi Salud", "Plan Vital", "MMM", "Triple-S", "First Medical"}

# Auth-required check only for ASES-direct payers; MMM/Triple-S/First Medical
# have their own auth rules in their respective modules.
AUTH_PAYERS = {"ASES Mi Salud", "Plan Vital"}

# ── Unit caps per CPT per day ─────────────────────────────────────────────────
UNIT_CAPS: dict = {
    "H0004":  8,   # behavioral health counseling per 15 min — 8/day = 2 hours
    "H0019": 24,   # day-treatment program per hour — up to 24 hr/day
    "H2019":  0,   # ABA per auth only — flag always
    "90853":  1,   # group therapy — 1 session/day
}

# ── Prior-auth required codes (for ASES-managed plans) ───────────────────────
AUTH_REQUIRED = {"H0004", "H0019", "H2019", "90839"}

# ── Behavioral health codes requiring treatment plan reference ────────────────
TREATMENT_PLAN_CODES = {"90832","90834","90837","90833","90785","H0004"}

# ── Timely filing windows (days from DOS) ─────────────────────────────────────
TIMELY_WINDOWS: dict = {
    "ASES Mi Salud": 180,
    "Plan Vital":    365,   # Plan Vital follows PR Law 2008-194 (12 months)
    "MMM":           365,
    "Triple-S":      365,
    "First Medical": 365,
}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    payer = claim.payer
    if payer not in ASES_PAYERS:
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}
    has_auth = bool(claim.auth and claim.auth.strip())

    # ── ASES-001: Unit cap exceeded ───────────────────────────────────
    for sl in slines:
        cap = UNIT_CAPS.get(sl.cpt)
        if cap is None:
            continue
        if cap == 0 or sl.units > cap:
            over = sl.units if cap == 0 else sl.units - cap
            label = f"over {cap}-unit cap" if cap else "requires prior auth — no cap"
            issues.append(Issue(
                code="ASES-001", sev=Severity.error,
                tEn=f"{sl.cpt}: over {cap}-unit cap" if cap else f"{sl.cpt}: auth required",
                tEs=f"{sl.cpt}: sobre tope de {cap} unidades" if cap else f"{sl.cpt}: requiere autorización",
                dEn=f"{payer} caps {sl.cpt} at {cap} units/day. Billed {sl.units} — excess {over if cap else sl.units} unit(s) will deny.",
                dEs=f"{payer} limita {sl.cpt} a {cap} unidades/día. Se facturaron {sl.units} — las unidades en exceso ({over if cap else sl.units}) serán denegadas.",
            ))
            fixes.append(Fix(
                tEn=f"Reduce {sl.cpt} units or attach auth",
                tEs=f"Reducir unidades de {sl.cpt} u obtener autorización",
                wEn=f"Bill no more than {cap} units of {sl.cpt} per day, or obtain a prior authorization for an extended series and reference it in REF*G1.",
                wEs=f"Facture no más de {cap} unidades de {sl.cpt} por día, u obtenga una autorización previa para una serie extendida y referencíela en REF*G1.",
            ))
            risk += 45

    # ── ASES-002: Prior auth missing (ASES Mi Salud and Plan Vital only) ─
    for sl in slines:
        if sl.cpt in AUTH_REQUIRED and not has_auth and payer in AUTH_PAYERS:
            issues.append(Issue(
                code="ASES-002", sev=Severity.error,
                tEn=f"Prior auth missing for {sl.cpt}",
                tEs=f"Autorización previa ausente para {sl.cpt}",
                dEn=f"{payer} requires a prior authorization number for {sl.cpt}. Claim will deny without a valid auth in REF*G1.",
                dEs=f"{payer} requiere número de autorización previa para {sl.cpt}. El reclamo será denegado sin una autorización válida en REF*G1.",
            ))
            fixes.append(Fix(
                tEn=f"Add prior auth number for {sl.cpt}",
                tEs=f"Agregar número de autorización para {sl.cpt}",
                wEn=f"Obtain prior authorization from {payer} for {sl.cpt} and add the auth number to the REF*G1 segment before submitting.",
                wEs=f"Obtenga autorización previa de {payer} para {sl.cpt} y agregue el número de autorización al segmento REF*G1 antes de someter.",
            ))
            risk += 40

    # ── ASES-009: Treatment-plan reference required ───────────────────
    needs_tp = cpt_set & TREATMENT_PLAN_CODES
    if needs_tp and not claim.auth:
        # Use auth field absence as proxy for missing treatment-plan ref;
        # a real backend would check the note text.
        issues.append(Issue(
            code="ASES-009", sev=Severity.warning,
            tEn="Treatment-plan date reference needed",
            tEs="Se necesita referencia de fecha del plan de tratamiento",
            dEn=f"{payer} auditors require the clinical note for {', '.join(sorted(needs_tp))} to include a reference to the treatment-plan date. Missing reference is the #1 audit trigger for BH claims.",
            dEs=f"Los auditores de {payer} requieren que la nota clínica para {', '.join(sorted(needs_tp))} incluya referencia a la fecha del plan de tratamiento. La referencia faltante es el principal desencadenante de auditoría en reclamos de salud conductual.",
        ))
        fixes.append(Fix(
            tEn="Add treatment-plan date to clinical note",
            tEs="Agregar fecha del plan de tratamiento a la nota clínica",
            wEn="Ensure the clinical note header includes the treatment-plan date (e.g., 'Per treatment plan dated MM/DD/YYYY'). Attach the signed plan to the claim file.",
            wEs="Asegúrese de que el encabezado de la nota clínica incluya la fecha del plan de tratamiento (ej. 'Según plan de tratamiento del DD/MM/AAAA'). Adjunte el plan firmado al expediente del reclamo.",
        ))
        risk += 20

    # ── PR-PPL-001: Timely filing window ──────────────────────────────
    window = TIMELY_WINDOWS.get(payer)
    dos = claim.dos
    if window and dos and dos != "—":
        try:
            d = datetime.strptime(dos, "%Y-%m-%d").date()
            age = (date.today() - d).days
            warn_threshold = int(window * 0.85)

            if age > window:
                issues.append(Issue(
                    code="PR-PPL-001", sev=Severity.error,
                    tEn="Timely filing window expired",
                    tEs="Ventana de presentación expirada",
                    dEn=f"Claim is {age} days old. {payer}'s timely filing limit is {window} days. Will deny unless a documented exception applies (e.g., payer error, natural disaster).",
                    dEs=f"El reclamo tiene {age} días. El límite de presentación oportuna de {payer} es {window} días. Será denegado salvo que aplique una excepción documentada (ej. error del pagador, desastre natural).",
                ))
                fixes.append(Fix(
                    tEn="Document timely filing exception",
                    tEs="Documentar excepción de presentación oportuna",
                    wEn="Attach proof of a timely filing exception (system outage logs, payer correspondence, or Act 194 appeal documentation) to the claim.",
                    wEs="Adjunte prueba de una excepción de presentación oportuna (registros de falla del sistema, correspondencia del pagador, o documentación de apelación bajo la Ley 194) al reclamo.",
                ))
                risk += 50
            elif age > warn_threshold:
                remaining = window - age
                issues.append(Issue(
                    code="PR-PPL-001", sev=Severity.warning,
                    tEn=f"Filing window closing ({remaining} days left)",
                    tEs=f"Ventana de presentación cerrando ({remaining} días restantes)",
                    dEn=f"Claim is {age} days old. Only {remaining} days remain before {payer}'s {window}-day timely filing deadline.",
                    dEs=f"El reclamo tiene {age} días. Solo quedan {remaining} días antes del límite de {window} días de {payer}.",
                ))
                fixes.append(Fix(
                    tEn="Submit claim immediately",
                    tEs="Someter reclamo inmediatamente",
                    wEn=f"Submit this claim within the next {remaining} days to meet {payer}'s timely filing requirement.",
                    wEs=f"Someta este reclamo dentro de los próximos {remaining} días para cumplir con el requisito de presentación oportuna de {payer}.",
                ))
                risk += 20
        except ValueError:
            pass

    return issues, fixes, risk
