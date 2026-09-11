"""
Denial probability calibration.

The existing `risk` score on every claim (rules/engine.py) is a
deterministic point total — it goes up when known problems are found,
but it was never calibrated against what actually happens to claims
with those problems. "Risk 78" means "$78 worth of known issues," not
"78% of claims like this get denied."

This module closes that gap using the org's own historical claim data
(claims marked "denied" or "paid" — via live outcome tracking or the
historical import feature). For each rule-engine issue code, it computes
the empirical historical denial rate among claims that had that issue —
then blends that empirical rate with the org's overall baseline rate
using Bayesian shrinkage (a Beta-Binomial posterior mean), so:

- A code seen on hundreds of historical claims: the estimate leans
  heavily on that code's own real track record.
- A code seen on only 1-2 historical claims (or never): the estimate
  leans heavily on the org's overall baseline denial rate instead,
  rather than overfitting to a tiny, noisy sample.

Deliberately NOT a black-box ML model — a single clinic's early claim
volume is nowhere near enough data to train something like logistic
regression or gradient boosting reliably, and a transparent, auditable
number ("your NCCI-002 findings historically denied 62% of the time,
based on 34 of your own past claims") is more useful and more
trustworthy to a biller or compliance officer than an opaque score
would be, even if a fancier model might eventually do slightly better
with enough real data.
"""
from __future__ import annotations
from typing import Any, Dict, List
import json

# How many pseudo-observations of the org's baseline rate to blend in
# for every issue code — effectively "how much real evidence for THIS
# specific code does it take before we trust its own track record over
# the org average." Higher = more conservative (leans on baseline
# longer); lower = trusts sparse per-code data sooner.
PRIOR_STRENGTH = 8.0


def compute_org_denial_stats(claim_rows: List[Any]) -> Dict[str, Any]:
    """
    Summarize an org's historical claims into the statistics the
    calibration needs: overall baseline denial rate, and per-issue-code
    (times seen, times denied) among claims with a resolved status
    (denied or paid — pending/unresolved claims don't contribute,
    since we don't yet know their outcome).
    """
    resolved = [r for r in claim_rows if (r.status or "").lower() in ("denied", "paid")]
    total = len(resolved)
    total_denied = sum(1 for r in resolved if (r.status or "").lower() == "denied")
    baseline_rate = (total_denied / total) if total else None

    code_stats: Dict[str, Dict[str, int]] = {}
    for row in resolved:
        try:
            issues = json.loads(row.issues_json or "[]")
        except (TypeError, ValueError):
            issues = []
        is_denied = (row.status or "").lower() == "denied"
        seen_codes = set()
        for issue in issues:
            code = issue.get("code", "")
            if not code or code in seen_codes:
                continue  # count each code once per claim, not once per line item
            seen_codes.add(code)
            stats = code_stats.setdefault(code, {"times_seen": 0, "times_denied": 0})
            stats["times_seen"] += 1
            if is_denied:
                stats["times_denied"] += 1

    return {
        "total_resolved_claims": total,
        "baseline_rate": baseline_rate,
        "code_stats": code_stats,
    }


def estimate_denial_probability(issue_codes: List[str], org_stats: Dict[str, Any]) -> Dict[str, Any]:
    """
    Given the issue codes that fired on a NEW (not-yet-submitted) claim,
    return a calibrated denial-probability estimate plus a plain-language
    basis explaining how much real evidence backs it.

    Combination across multiple issue codes uses a noisy-OR: treats each
    issue's shrunk denial rate as an independent chance that issue alone
    leads to denial, and combines them as "the probability at least one
    of these problems causes a denial" — P = 1 - product(1 - p_i). This
    naturally increases with more/worse issues while staying bounded and
    interpretable, without assuming issues are perfectly independent in
    reality (a simplification worth stating plainly, not hiding).
    """
    baseline = org_stats.get("baseline_rate")
    total_resolved = org_stats.get("total_resolved_claims", 0)

    if baseline is None:
        return {
            "probability": None,
            "confidence": "none",
            "basis": "No historical outcome data yet — import past claims or mark some as "
                     "denied/paid to enable real denial-probability estimates.",
            "sample_size": 0,
        }

    if not issue_codes:
        # A clean claim isn't zero-risk — some fraction of clean-looking
        # claims still get denied for reasons rules don't model (eligibility,
        # clearinghouse rejects, etc.). The org's own baseline is the
        # honest estimate here, not zero.
        return {
            "probability": round(baseline, 3),
            "confidence": "baseline" if total_resolved >= 20 else "low",
            "basis": f"No rule-engine issues found — using your org's overall historical "
                     f"denial rate ({total_resolved} resolved claims).",
            "sample_size": total_resolved,
        }

    code_stats = org_stats.get("code_stats", {})
    per_code_estimates = []
    total_evidence = 0
    for code in issue_codes:
        stats = code_stats.get(code, {"times_seen": 0, "times_denied": 0})
        seen, denied = stats["times_seen"], stats["times_denied"]
        # Beta-Binomial posterior mean: blends the code's own empirical
        # rate with the org baseline, weighted by how much real evidence
        # exists for this specific code.
        shrunk_rate = (denied + PRIOR_STRENGTH * baseline) / (seen + PRIOR_STRENGTH)
        per_code_estimates.append(shrunk_rate)
        total_evidence += seen

    # Noisy-OR combination across all fired issue codes.
    prob_no_denial = 1.0
    for p in per_code_estimates:
        prob_no_denial *= (1 - p)
    combined = 1 - prob_no_denial

    if total_evidence == 0:
        confidence = "low"
        basis = (f"None of this claim's {len(issue_codes)} flagged issue(s) have appeared in "
                 f"your history yet — using your org's overall baseline rate as a starting point.")
    elif total_evidence < 10:
        confidence = "low"
        basis = f"Based on limited history ({total_evidence} past claims with these issue types)."
    elif total_evidence < 30:
        confidence = "moderate"
        basis = f"Based on {total_evidence} of your past claims with these issue types."
    else:
        confidence = "high"
        basis = f"Based on {total_evidence} of your past claims with these issue types — a solid sample."

    return {
        "probability": round(min(combined, 0.99), 3),
        "confidence": confidence,
        "basis": basis,
        "sample_size": total_evidence,
    }
