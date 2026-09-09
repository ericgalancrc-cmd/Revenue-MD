"""
Denial Root Cause Engine — aggregate analytics computed from persisted
claim data. Answers the executive question "why do we keep getting
denied?" instead of just "what got denied?" (which the raw claims list
already shows).

Deliberately built entirely from data RevenueMD already persists (each
claim's stored issues, status, payer, provider, and billed amount) — no
new data source required. Denied-claim analysis uses ClaimRecord.status
== "denied" (set via PATCH /api/claims/{id}), which reflects a real,
confirmed post-submission outcome, not a pre-submission risk guess.
"""
from __future__ import annotations
from typing import Any, Dict, List
import json
from datetime import datetime

from analytics.category_map import categorize, categorize_es


def _month_key(dos: str) -> str | None:
    """Extract a YYYY-MM bucket from a claim's date-of-service string.
    Returns None for unparseable/placeholder dates ('—', blank, etc.) —
    those claims are simply excluded from trend analysis rather than
    guessed at."""
    if not dos or dos == "—":
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(dos.strip(), fmt).strftime("%Y-%m")
        except ValueError:
            continue
    return None


def compute_denial_trends(claim_rows: List[Any]) -> List[Dict[str, Any]]:
    """
    Month-over-month denial trend, grouped by payer — the "is this payer
    getting worse" view that a single-snapshot root-cause breakdown can't
    answer. Only claims with a parseable date-of-service contribute;
    unparseable dates are silently excluded rather than mis-bucketed.
    """
    denied = [r for r in claim_rows if (r.status or "").lower() == "denied"]

    buckets: Dict[tuple, Dict[str, Any]] = {}
    for row in denied:
        month = _month_key(row.dos)
        if month is None:
            continue
        payer = row.payer or "Unknown"
        key = (month, payer)
        if key not in buckets:
            buckets[key] = {"month": month, "payer": payer, "denied_claims": 0, "denied_value": 0.0}
        buckets[key]["denied_claims"] += 1
        buckets[key]["denied_value"] += (row.billed or 0.0)

    trends = sorted(buckets.values(), key=lambda x: (x["month"], x["payer"]))
    for t in trends:
        t["denied_value"] = round(t["denied_value"], 2)
    return trends


def compute_revenue_intelligence(claim_rows: List[Any]) -> Dict[str, Any]:
    """
    claim_rows: ClaimRecord ORM rows for the org (any status).
    Returns the full Revenue Intelligence payload: totals, root-cause
    breakdown, and per-provider / per-payer denial breakdowns — computed
    only from claims whose status is "denied".
    """
    total_claims = len(claim_rows)
    denied = [r for r in claim_rows if (r.status or "").lower() == "denied"]
    total_denied = len(denied)
    total_denied_value = round(sum(r.billed or 0.0 for r in denied), 2)

    if total_denied == 0:
        return {
            "total_claims": total_claims,
            "total_denied_claims": 0,
            "total_denied_value": 0.0,
            "denial_rate_pct": 0.0,
            "root_causes": [],
            "by_provider": [],
            "by_payer": [],
            "trends": [],
        }

    # ── Root causes: each denied claim can contribute to multiple
    # categories (a claim can have both a documentation issue and a
    # modifier issue) — we count claim-membership per category, not a
    # forced single attribution, since that's more honest about mixed
    # causes on a single denial.
    category_counts: Dict[str, int] = {}
    category_labels_es: Dict[str, str] = {}
    category_value: Dict[str, float] = {}
    for row in denied:
        try:
            issues = json.loads(row.issues_json or "[]")
        except (TypeError, ValueError):
            issues = []
        codes_seen_this_claim = set()
        for issue in issues:
            code = issue.get("code", "")
            label = categorize(code)
            if label is None:
                continue  # informational (HCC/CPT2) — excluded from denial analysis
            codes_seen_this_claim.add(label)
            category_labels_es[label] = categorize_es(code) or label
        for label in codes_seen_this_claim:
            category_counts[label] = category_counts.get(label, 0) + 1
            category_value[label] = category_value.get(label, 0.0) + (row.billed or 0.0)

    root_causes = sorted(
        [
            {
                "category": label,
                "category_es": category_labels_es.get(label, label),
                "claim_count": count,
                "pct_of_denials": round(100 * count / total_denied, 1),
                "value_impact": round(category_value.get(label, 0.0), 2),
            }
            for label, count in category_counts.items()
        ],
        key=lambda x: x["value_impact"],
        reverse=True,
    )

    # ── By provider ──────────────────────────────────────────────────
    provider_counts: Dict[str, int] = {}
    provider_value: Dict[str, float] = {}
    for row in denied:
        prov = row.provider or row.prov or "Unknown"
        provider_counts[prov] = provider_counts.get(prov, 0) + 1
        provider_value[prov] = provider_value.get(prov, 0.0) + (row.billed or 0.0)
    by_provider = sorted(
        [
            {"provider": p, "denied_claims": c, "denied_value": round(provider_value[p], 2)}
            for p, c in provider_counts.items()
        ],
        key=lambda x: x["denied_value"],
        reverse=True,
    )

    # ── By payer ─────────────────────────────────────────────────────
    payer_counts: Dict[str, int] = {}
    payer_value: Dict[str, float] = {}
    for row in denied:
        payer = row.payer or "Unknown"
        payer_counts[payer] = payer_counts.get(payer, 0) + 1
        payer_value[payer] = payer_value.get(payer, 0.0) + (row.billed or 0.0)
    by_payer = sorted(
        [
            {"payer": p, "denied_claims": c, "denied_value": round(payer_value[p], 2)}
            for p, c in payer_counts.items()
        ],
        key=lambda x: x["denied_value"],
        reverse=True,
    )

    return {
        "total_claims": total_claims,
        "total_denied_claims": total_denied,
        "total_denied_value": total_denied_value,
        "denial_rate_pct": round(100 * total_denied / total_claims, 1) if total_claims else 0.0,
        "root_causes": root_causes,
        "by_provider": by_provider,
        "by_payer": by_payer,
        "trends": compute_denial_trends(claim_rows),
    }
