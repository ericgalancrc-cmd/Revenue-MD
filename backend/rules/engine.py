"""
RevenueMD rules engine — main orchestrator.

Runs every claim through all payer-specific and general rule modules,
then computes risk score, compliance score, documentation score,
triage lane, and AI summary strings.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, Lane, ParsedClaim, ScrubResult, Severity


# ── Import rule modules ───────────────────────────────────────────────────────
from rules import general, ases, plan_vital, medicare, triple_s, mmm, mcs, hcc, modifiers, cpt2, mue, dx_support


_RULE_MODULES = [general, ases, plan_vital, medicare, triple_s, mmm, mcs, hcc, modifiers, cpt2, mue, dx_support]

# ── Payer name normalization ──────────────────────────────────────────────────
_PAYER_MAP = {
    "plan vital":       "Plan Vital",
    "planvital":        "Plan Vital",
    "vital":            "Plan Vital",
    "ases mi salud":    "ASES Mi Salud",
    "ases":             "ASES Mi Salud",
    "mi salud":         "ASES Mi Salud",
    "medicaid":         "ASES Mi Salud",
    "medicare":         "Medicare",
    "cms":              "Medicare",
    "triple-s":         "Triple-S",
    "triple s":         "Triple-S",
    "triples":          "Triple-S",
    "triple-s salud":   "Triple-S",
    "mmm":              "MMM",
    "mmm healthcare":   "MMM",
    "first medical":    "First Medical",
    "firstmedical":     "First Medical",
    "humana":           "Humana Military",
    "tricare":          "Humana Military",
    "humana military":  "Humana Military",
    "mcs":              "MCS",
    "mcs classicare":   "MCS",
    "mcs platino":      "MCS",
    "classicare":       "MCS",
}


def _normalize_payer(raw: str) -> str:
    return _PAYER_MAP.get(raw.lower().strip(), raw.strip())


# ── Scoring weights ───────────────────────────────────────────────────────────
_SEV_WEIGHT: dict = {
    Severity.error:   1.0,
    Severity.warning: 0.4,
    Severity.info:    0.1,
}


def _risk_score(base_risk: int, issues: List[Issue]) -> int:
    """
    Risk = base accumulation from rule modules (already weighted per rule),
    capped at 100.
    """
    return min(base_risk, 100)


def _compliance_score(issues: List[Issue]) -> int:
    """
    Start at 100, deduct per issue severity.
    Errors –15, warnings –7, info –2.
    """
    deductions = {Severity.error: 15, Severity.warning: 7, Severity.info: 2}
    score = 100
    for iss in issues:
        score -= deductions.get(iss.sev, 0)
    return max(0, score)


def _doc_score(issues: List[Issue]) -> int:
    """
    Documentation quality score.  Deduct for doc-specific issue codes.
    """
    doc_codes = {"DOC-001","DOC-002","DOC-003","ASES-009","CMS-002"}
    score = 100
    for iss in issues:
        if iss.code in doc_codes:
            score -= 20 if iss.sev == Severity.error else 10
    return max(0, score)


def _lane(risk: int, issues: List[Issue]) -> Lane:
    has_error = any(i.sev == Severity.error for i in issues)
    has_warning = any(i.sev == Severity.warning for i in issues)
    if risk >= 60 or has_error:
        return Lane.needs_work
    if risk >= 20 or has_warning:
        return Lane.quick_review
    return Lane.auto_clear


def _summary_en(issues: List[Issue], lane: Lane, claim: ParsedClaim) -> str:
    if not issues:
        return (
            f"Claim {claim.id} passed all scrubbing rules for {claim.payer}. "
            "No issues found — ready to send to the clearinghouse."
        )
    errors   = [i for i in issues if i.sev == Severity.error]
    warnings = [i for i in issues if i.sev == Severity.warning]
    parts = []
    if errors:
        parts.append(f"{len(errors)} error{'s' if len(errors)>1 else ''} "
                     f"({'; '.join(i.tEn for i in errors[:2])}{'…' if len(errors)>2 else ''})")
    if warnings:
        parts.append(f"{len(warnings)} warning{'s' if len(warnings)>1 else ''} "
                     f"({'; '.join(i.tEn for i in warnings[:2])}{'…' if len(warnings)>2 else ''})")
    lane_label = {Lane.needs_work:"Needs work", Lane.quick_review:"Quick review", Lane.auto_clear:"Auto-clear"}[lane]
    return (
        f"Claim {claim.id} ({claim.payer}) — {lane_label}. "
        f"Found: {'; '.join(parts)}. "
        f"Review the flagged items below and apply the suggested fixes before resubmitting."
    )


def _summary_es(issues: List[Issue], lane: Lane, claim: ParsedClaim) -> str:
    if not issues:
        return (
            f"El reclamo {claim.id} pasó todas las reglas de revisión para {claim.payer}. "
            "No se encontraron problemas — listo para enviar al clearinghouse."
        )
    errors   = [i for i in issues if i.sev == Severity.error]
    warnings = [i for i in issues if i.sev == Severity.warning]
    parts = []
    if errors:
        parts.append(f"{len(errors)} error{'es' if len(errors)>1 else ''} "
                     f"({'; '.join(i.tEs for i in errors[:2])}{'…' if len(errors)>2 else ''})")
    if warnings:
        parts.append(f"{len(warnings)} advertencia{'s' if len(warnings)>1 else ''} "
                     f"({'; '.join(i.tEs for i in warnings[:2])}{'…' if len(warnings)>2 else ''})")
    lane_label = {Lane.needs_work:"Necesita corrección", Lane.quick_review:"Revisión rápida", Lane.auto_clear:"Auto-aprobado"}[lane]
    return (
        f"Reclamo {claim.id} ({claim.payer}) — {lane_label}. "
        f"Se encontró: {'; '.join(parts)}. "
        f"Revise los elementos marcados abajo y aplique las correcciones sugeridas antes de re-someter."
    )


def _short_issue(issues: List[Issue], lang: str = "en") -> str:
    if not issues:
        return ""
    top = issues[0]
    label = top.tEn if lang == "en" else top.tEs
    if len(issues) > 1:
        more = len(issues) - 1
        label += f" (+{more} {'more' if lang == 'en' else 'más'})"
    return label


# ── Public API ────────────────────────────────────────────────────────────────

def scrub(claim: ParsedClaim) -> ScrubResult:
    """Run all rule modules against a single claim and return a ScrubResult."""
    # Normalize payer name so rule modules get a canonical value
    claim = claim.model_copy(update={"payer": _normalize_payer(claim.payer),
                                      "prov":  claim.prov or claim.provider})

    # Rebuild service_lines from codes string when the frontend sends only text
    # (e.g. claims imported via CSV in the browser and sent to /api/analyze)
    if not claim.service_lines and claim.codes and claim.codes != "—":
        from parsers.csv_claims import _codes_to_service_lines
        claim = claim.model_copy(update={"service_lines": _codes_to_service_lines(claim.codes)})

    all_issues: List[Issue] = []
    all_fixes:  List[Fix]   = []
    total_risk  = 0

    for module in _RULE_MODULES:
        module_issues, module_fixes, module_risk = module.check(claim)
        all_issues.extend(module_issues)
        all_fixes.extend(module_fixes)
        total_risk += module_risk

    risk       = _risk_score(total_risk, all_issues)
    comp       = _compliance_score(all_issues)
    doc        = _doc_score(all_issues)
    lane       = _lane(risk, all_issues)
    summary_en = _summary_en(all_issues, lane, claim)
    summary_es = _summary_es(all_issues, lane, claim)

    # For auto-clear claims, cap risk visually low so the green pill looks right
    if lane == Lane.auto_clear:
        risk = min(risk, 14)

    return ScrubResult(
        **claim.model_dump(),
        lane    = lane,
        risk    = risk,
        comp    = comp,
        doc     = doc,
        sEn     = summary_en,
        sEs     = summary_es,
        iEn     = _short_issue(all_issues, "en"),
        iEs     = _short_issue(all_issues, "es"),
        issues  = all_issues,
        fix     = all_fixes,
    )


def scrub_many(claims: List[ParsedClaim]) -> List[ScrubResult]:
    return [scrub(c) for c in claims]
