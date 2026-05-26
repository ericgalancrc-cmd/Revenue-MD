"""
Triple-S Salud (BCBS licensee) specific billing rules.

Triple-S is Puerto Rico's Blue Cross Blue Shield licensee.
Out-of-state BCBS claims route via BlueCard, which requires
a 3-character alphabetic prefix on the member ID.
"""

from __future__ import annotations
import re
from typing import List
from models import Issue, Suggestion, ParsedClaim, Severity

PAYER_NAMES = {"triple-s", "triple s", "triples", "bcbs pr", "blue cross pr"}

# BlueCard prefix: 3 uppercase alpha characters at the start of member ID
BLUECARD_PREFIX_RE = re.compile(r"^[A-Z]{3}")


def is_triple_s(payer: str) -> bool:
    return any(v in payer.lower() for v in PAYER_NAMES)


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Suggestion]]:
    issues: List[Issue] = []
    fixes:  List[Suggestion] = []

    _check_bluecard_prefix(claim, issues, fixes)

    return issues, fixes


def _check_bluecard_prefix(claim: ParsedClaim, issues, fixes):
    member_id = claim.patient_id or ""
    if not BLUECARD_PREFIX_RE.match(member_id):
        issues.append(Issue(
            sev = Severity.warning,
            tEn = "BlueCard prefix missing or invalid",
            tEs = "Prefijo BlueCard ausente o inválido",
            dEn = (
                f"Triple-S / BlueCard member IDs must start with a 3-letter prefix "
                f"(e.g., 'XYZ123456789'). Current ID: '{member_id}'. "
                f"A missing or wrong prefix routes the claim to the wrong plan and causes denial."
            ),
            dEs = (
                f"Los IDs de miembro de Triple-S / BlueCard deben comenzar con un prefijo de "
                f"3 letras (ej. 'XYZ123456789'). ID actual: '{member_id}'. "
                f"Un prefijo erróneo enruta el reclamo al plan incorrecto y causa denegación."
            ),
        ))
        fixes.append(Suggestion(
            tEn = "Confirm 3-letter prefix on member's ID card",
            tEs = "Confirmar prefijo de 3 letras en la tarjeta del miembro",
            wEn = "The prefix on the physical ID card is the correct routing key for BlueCard claims.",
            wEs = "El prefijo en la tarjeta física es la clave de enrutamiento correcta para reclamos BlueCard.",
        ))
