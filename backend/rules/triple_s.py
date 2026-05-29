"""
Triple-S Salud (BlueCross BlueShield of Puerto Rico) specific rules.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity

# PR-based Triple-S member ID prefixes (local plans vs BlueCard out-of-state)
PR_PREFIXES = ("R", "S", "T", "YYZ", "Q", "4")


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    if claim.payer != "Triple-S":
        return [], [], 0

    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    member_id = (claim.member_id or "").strip().upper()

    # ── TS-001: BlueCard routing check ───────────────────────────────
    if member_id and not any(member_id.startswith(p) for p in PR_PREFIXES):
        issues.append(Issue(
            code="TS-001", sev=Severity.warning,
            tEn="BlueCard member — verify routing",
            tEs="Miembro BlueCard — verificar enrutamiento",
            dEn=f"Member ID prefix '{member_id[:3]}' does not match a Puerto Rico Triple-S plan code. This may be an out-of-state BlueCard member. Route through the BlueCard Inter-Plan program, not directly to Triple-S.",
            dEs=f"El prefijo del ID de miembro '{member_id[:3]}' no corresponde a un código de plan Triple-S de Puerto Rico. Puede ser un miembro BlueCard de otro estado. Enrute a través del programa BlueCard Inter-Plan, no directamente a Triple-S.",
        ))
        fixes.append(Fix(
            tEn="Route claim through BlueCard Inter-Plan",
            tEs="Enrutar reclamo por BlueCard Inter-Plan",
            wEn="Submit this claim through the BCBS BlueCard program. Use the member's home-plan prefix to determine the correct payer ID and routing.",
            wEs="Someta este reclamo a través del programa BCBS BlueCard. Use el prefijo del plan de origen del miembro para determinar el ID de pagador y enrutamiento correcto.",
        ))
        risk += 20

    # ── TS-002: Timely filing — 365 days ──────────────────────────────
    # (Covered in ases.py for all ASES-family payers including Triple-S)

    return issues, fixes, risk
