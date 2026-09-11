"""
CSV export helpers — the lightweight alternative to the PDF report, for
anyone who wants to pull the data into their own spreadsheet.
"""
from __future__ import annotations
import csv
import io
from typing import Any, Dict, List


def claims_to_csv(claim_rows: List[Any]) -> str:
    """Export a list of ClaimRecord rows to CSV text."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "claim_id", "patient", "payer", "provider", "dos", "billed",
        "status", "outcome", "recovered_amount", "lane", "risk",
        "source",
    ])
    for row in claim_rows:
        writer.writerow([
            row.claim_id, row.patient, row.payer, row.provider, row.dos,
            row.billed, row.status, getattr(row, "outcome", ""),
            getattr(row, "recovered_amount", 0.0), row.lane, row.risk,
            getattr(row, "source", "live"),
        ])
    return buf.getvalue()


def revenue_intelligence_to_csv(payload: Dict[str, Any]) -> str:
    """Export the root-cause breakdown to CSV text."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["category", "claim_count", "pct_of_denials", "value_impact"])
    for rc in payload.get("root_causes", []):
        writer.writerow([rc["category"], rc["claim_count"], rc["pct_of_denials"], rc["value_impact"]])
    writer.writerow([])
    writer.writerow(["provider", "denied_claims", "denied_value"])
    for p in payload.get("by_provider", []):
        writer.writerow([p["provider"], p["denied_claims"], p["denied_value"]])
    writer.writerow([])
    writer.writerow(["payer", "denied_claims", "denied_value"])
    for p in payload.get("by_payer", []):
        writer.writerow([p["payer"], p["denied_claims"], p["denied_value"]])
    return buf.getvalue()
