"""
Humana PR (Puerto Rico Medicare Advantage) rules.

IMPORTANT — read before trusting this module: unlike ASES/Mi Salud, Plan
Vital, Medicare (FCSO), Triple-S, MMM, and MCS — each built with real,
researched payer-specific rules citing actual statutes/provider manuals —
this module has NOT had the same research investment. It exists so
claims routed to "Humana PR" get *something* rather than silently
falling through to only the general rules, but every rule here is a
generic Medicare Advantage placeholder, explicitly flagged as needing
verification against Humana PR's actual current provider manual before
being trusted the way the other payer modules are.

Do not remove this docstring's caveat when adding real, researched rules
later — replace it once specific citations are added, the same way the
other payer modules already do.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "Humana PR":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    # ── HUMANA-001: prior authorization — generic MA reminder, unverified ──
    if not (claim.auth or "").strip():
        issues.append(Issue(
            code="HUMANA-001", sev=Severity.warning,
            tEn="Humana PR: verify prior-auth requirement (unverified rule)",
            tEs="Humana PR: verificar requisito de autorización previa (regla no verificada)",
            dEn="No auth number is present on this claim. Humana PR's specific "
                "prior-authorization list has not yet been researched for this "
                "platform — confirm directly via Humana's provider portal whether "
                "this service requires prior authorization before submission.",
            dEs="No hay número de autorización en este reclamo. La lista específica "
                "de autorizaciones previas de Humana PR aún no ha sido investigada "
                "para esta plataforma — confirme directamente en el portal de "
                "proveedores de Humana si este servicio requiere autorización previa "
                "antes de someter.",
        ))
        fixes.append(Fix(
            tEn="Check Humana's provider portal for prior-auth requirements",
            tEs="Verificar requisitos de autorización previa en el portal de Humana",
            wEn="Log in to Humana's provider portal to confirm prior-authorization "
                "requirements for this service before submission.",
            wEs="Ingrese al portal de proveedores de Humana para confirmar los "
                "requisitos de autorización previa para este servicio antes de someter.",
        ))
        risk += 15

    # ── HUMANA-002: timely filing — generic MA reminder, unverified ─────────
    issues.append(Issue(
        code="HUMANA-002", sev=Severity.info,
        tEn="Humana PR: confirm timely filing window (unverified rule)",
        tEs="Humana PR: confirmar plazo de presentación oportuna (regla no verificada)",
        dEn="This platform hasn't yet researched Humana PR's specific timely-filing "
            "window — most Medicare Advantage plans use 90-365 days from date of "
            "service, but confirm the exact window in Humana's current provider "
            "manual before relying on it.",
        dEs="Esta plataforma aún no ha investigado el plazo específico de "
            "presentación oportuna de Humana PR — la mayoría de los planes "
            "Medicare Advantage usan 90-365 días desde la fecha de servicio, pero "
            "confirme el plazo exacto en el manual de proveedores actual de Humana "
            "antes de confiar en ello.",
    ))
    fixes.append(Fix(
        tEn="Confirm timely filing window in Humana's provider manual",
        tEs="Confirmar plazo de presentación oportuna en el manual de Humana",
        wEn="Check Humana PR's current provider manual for the exact timely-filing "
            "deadline applicable to this claim type.",
        wEs="Verifique el manual de proveedores actual de Humana PR para el plazo "
            "exacto de presentación oportuna aplicable a este tipo de reclamo.",
    ))

    return issues, fixes, risk
