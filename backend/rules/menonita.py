"""
Plan Menonita (Puerto Rico regional health plan) rules.

Same honest caveat as rules/humana_pr.py: this module has NOT had the
research investment the other payer modules (ASES, Plan Vital, Medicare,
Triple-S, MMM, MCS) have. It exists so claims routed to "Menonita" get
something rather than falling through silently, but every rule is a
generic placeholder explicitly flagged as needing verification against
Menonita's actual current provider manual.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "Menonita":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    # ── MEN-001: prior authorization — generic reminder, unverified ────────
    if not (claim.auth or "").strip():
        issues.append(Issue(
            code="MEN-001", sev=Severity.warning,
            tEn="Menonita: verify prior-auth requirement (unverified rule)",
            tEs="Menonita: verificar requisito de autorización previa (regla no verificada)",
            dEn="No auth number is present on this claim. Plan Menonita's specific "
                "prior-authorization list has not yet been researched for this "
                "platform — confirm directly with the payer whether this service "
                "requires prior authorization before submission.",
            dEs="No hay número de autorización en este reclamo. La lista específica "
                "de autorizaciones previas del Plan Menonita aún no ha sido "
                "investigada para esta plataforma — confirme directamente con el "
                "pagador si este servicio requiere autorización previa antes de "
                "someter.",
        ))
        fixes.append(Fix(
            tEn="Confirm prior-auth requirements directly with Menonita",
            tEs="Confirmar requisitos de autorización previa directamente con Menonita",
            wEn="Contact Plan Menonita's provider services line to confirm prior-"
                "authorization requirements for this service before submission.",
            wEs="Contacte la línea de servicios al proveedor del Plan Menonita para "
                "confirmar los requisitos de autorización previa antes de someter.",
        ))
        risk += 15

    # ── MEN-002: timely filing — generic reminder, unverified ───────────────
    issues.append(Issue(
        code="MEN-002", sev=Severity.info,
        tEn="Menonita: confirm timely filing window (unverified rule)",
        tEs="Menonita: confirmar plazo de presentación oportuna (regla no verificada)",
        dEn="This platform hasn't yet researched Plan Menonita's specific timely-"
            "filing window — confirm the exact deadline in the payer's current "
            "provider manual before relying on it.",
        dEs="Esta plataforma aún no ha investigado el plazo específico de "
            "presentación oportuna del Plan Menonita — confirme el plazo exacto en "
            "el manual de proveedores actual del pagador antes de confiar en ello.",
    ))
    fixes.append(Fix(
        tEn="Confirm timely filing window with Menonita",
        tEs="Confirmar plazo de presentación oportuna con Menonita",
        wEn="Check Plan Menonita's current provider manual or contact provider "
            "services for the exact timely-filing deadline.",
        wEs="Verifique el manual de proveedores actual del Plan Menonita o "
            "contacte servicios al proveedor para el plazo exacto de presentación "
            "oportuna.",
    ))

    return issues, fixes, risk
