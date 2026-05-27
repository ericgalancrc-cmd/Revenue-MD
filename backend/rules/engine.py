"""
Main rules engine — orchestrates all payer-specific and general rule checks,
scores denial risk, assigns a triage lane, and produces the final ScrubResult.
"""

from __future__ import annotations
from typing import List
from models import ParsedClaim, ScrubResult, Issue, Suggestion, Lane, Severity
from rules import general, plan_vital, triple_s, ases, mmm, medicare


# Risk points per issue severity
RISK_POINTS = {Severity.error: 35, Severity.warning: 15, Severity.info: 5}


def scrub(claim: ParsedClaim) -> ScrubResult:
    issues:  List[Issue]      = []
    fixes:   List[Suggestion] = []

    # General rules (all payers)
    gi, gf = general.check(claim)
    issues.extend(gi)
    fixes.extend(gf)

    # Payer-specific rules
    if plan_vital.is_plan_vital(claim.payer):
        pi, pf = plan_vital.check(claim)
        issues.extend(pi)
        fixes.extend(pf)

    if triple_s.is_triple_s(claim.payer):
        ti, tf = triple_s.check(claim)
        issues.extend(ti)
        fixes.extend(tf)

    if ases.is_ases(claim.payer):
        ai, af = ases.check(claim)
        issues.extend(ai)
        fixes.extend(af)

    if mmm.is_mmm(claim.payer):
        mi, mf = mmm.check(claim)
        issues.extend(mi)
        fixes.extend(mf)

    if medicare.is_medicare(claim.payer):
        ri, rf = medicare.check(claim)
        issues.extend(ri)
        fixes.extend(rf)

    # Scores
    risk = _risk_score(issues)
    comp = _compliance_score(issues)
    doc  = _doc_score(issues)
    lane = _lane(risk)

    # Flatten service lines for display
    cpt_codes = [sl.cpt for sl in claim.service_lines]
    all_mods  = list({m for sl in claim.service_lines for m in sl.modifier})
    units     = [sl.units for sl in claim.service_lines]

    codes_str = " + ".join(
        f"{sl.cpt}" + (f"×{sl.units}" if sl.units > 1 else "")
        for sl in claim.service_lines
    )

    # Top issue summaries for batch queue display
    errors   = [i for i in issues if i.sev == Severity.error]
    warnings = [i for i in issues if i.sev == Severity.warning]
    top      = (errors + warnings)[:2]

    i_en = " · ".join(i.tEn for i in top) if top else ""
    i_es = " · ".join(i.tEs for i in top) if top else ""

    # Short narrative summaries
    s_en = _summary_en(risk, issues)
    s_es = _summary_es(risk, issues)

    return ScrubResult(
        id      = claim.id,
        payer   = claim.payer,
        codes   = codes_str,
        prov    = claim.provider_name or "Unknown provider",
        risk    = risk,
        lane    = lane,
        val     = claim.total_charge,
        iEn     = i_en,
        iEs     = i_es,
        pat     = claim.patient_name or f"Patient {claim.patient_id}",
        dos     = claim.dos,
        cpt     = cpt_codes,
        icd     = claim.icd,
        mods    = all_mods,
        units   = units,
        auth    = claim.auth,
        charge  = claim.total_charge,
        npi     = claim.npi,
        comp    = comp,
        doc     = doc,
        issues  = issues,
        fix     = fixes,
        sEn     = s_en,
        sEs     = s_es,
    )


def scrub_many(claims: List[ParsedClaim]) -> List[ScrubResult]:
    return [scrub(c) for c in claims]


# ── scoring helpers ───────────────────────────────────────────────────────────

def _risk_score(issues: List[Issue]) -> int:
    score = sum(RISK_POINTS.get(i.sev, 0) for i in issues)
    return min(score, 99)


def _compliance_score(issues: List[Issue]) -> int:
    deductions = sum(
        20 if i.sev == Severity.error else 8 if i.sev == Severity.warning else 3
        for i in issues
    )
    return max(100 - deductions, 10)


def _doc_score(issues: List[Issue]) -> int:
    doc_keywords = {"treatment-plan", "documentation", "note", "documented"}
    deductions = sum(
        15 for i in issues
        if any(kw in i.tEn.lower() for kw in doc_keywords)
    )
    return max(100 - deductions, 10)


def _lane(risk: int) -> Lane:
    if risk >= 60:
        return Lane.needs_work
    if risk >= 20:
        return Lane.quick_review
    return Lane.auto_clear


def _summary_en(risk: int, issues: List[Issue]) -> str:
    n_errors = sum(1 for i in issues if i.sev == Severity.error)
    n_warn   = sum(1 for i in issues if i.sev == Severity.warning)
    n_info   = sum(1 for i in issues if i.sev == Severity.info)
    if not issues:
        return "No issues detected. Claim appears clean and ready to submit."
    parts = []
    if n_errors:
        parts.append(f"{n_errors} error{'s' if n_errors > 1 else ''}")
    if n_warn:
        parts.append(f"{n_warn} warning{'s' if n_warn > 1 else ''}")
    if n_info and not parts:
        parts.append(f"{n_info} note{'s' if n_info > 1 else ''}")
    return f"RevenueMD identified {' and '.join(parts)} to review before submitting."


def _summary_es(risk: int, issues: List[Issue]) -> str:
    n_errors = sum(1 for i in issues if i.sev == Severity.error)
    n_warn   = sum(1 for i in issues if i.sev == Severity.warning)
    n_info   = sum(1 for i in issues if i.sev == Severity.info)
    if not issues:
        return "Sin problemas detectados. El reclamo parece limpio y listo para enviar."
    parts = []
    if n_errors:
        parts.append(f"{n_errors} error{'es' if n_errors > 1 else ''}")
    if n_warn:
        parts.append(f"{n_warn} advertencia{'s' if n_warn > 1 else ''}")
    if n_info and not parts:
        parts.append(f"{n_info} nota{'s' if n_info > 1 else ''}")
    return f"RevenueMD identificó {' y '.join(parts)} para revisar antes de enviar."
