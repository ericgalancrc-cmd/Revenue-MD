"""
Tests for the Denial Root Cause Engine (backend/analytics/) and its
/api/analytics/revenue-intelligence endpoint.

Run from the backend/ directory:
    pytest tests/test_analytics.py -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import json
import pytest
from fastapi.testclient import TestClient

from analytics.category_map import categorize, categorize_es
from analytics.engine import compute_revenue_intelligence


# ── Unit tests: category_map ──────────────────────────────────────────────────

class TestCategorize:
    def test_ncci_maps_correctly(self):
        assert categorize("NCCI-002") == "NCCI edits / bundling"

    def test_doc_maps_correctly(self):
        assert categorize("DOC-001") == "Documentation support"

    def test_mod_maps_correctly(self):
        assert categorize("MOD-002") == "Modifier issues"

    def test_hcc_excluded_as_informational(self):
        assert categorize("HCC-001") is None

    def test_cpt2_excluded_as_informational(self):
        assert categorize("CPT2-DIABETES-HBA") is None

    def test_unknown_code_falls_back_to_other(self):
        assert categorize("ZZZZ-999") == "Other"

    def test_spanish_variant_matches_english_structure(self):
        assert categorize_es("NCCI-002") == "Ediciones NCCI / empaquetado"
        assert categorize_es("HCC-001") is None


# ── Unit tests: compute_revenue_intelligence ──────────────────────────────────

class _FakeRow:
    """Minimal stand-in for a ClaimRecord ORM row."""
    def __init__(self, status, billed, payer, provider, issue_codes, dos="—"):
        self.status = status
        self.billed = billed
        self.payer = payer
        self.provider = provider
        self.prov = provider
        self.dos = dos
        self.issues_json = json.dumps([{"code": c} for c in issue_codes])


class TestComputeRevenueIntelligence:
    def test_no_denied_claims_returns_empty_shape(self):
        rows = [_FakeRow("pending", 100, "Plan Vital", "Dr. A", ["DOC-001"])]
        result = compute_revenue_intelligence(rows)
        assert result["total_denied_claims"] == 0
        assert result["root_causes"] == []

    def test_denied_claim_counted_in_root_causes(self):
        rows = [
            _FakeRow("denied", 200.0, "Plan Vital", "Dr. A", ["NCCI-002"]),
            _FakeRow("paid", 150.0, "Plan Vital", "Dr. A", ["NCCI-002"]),  # not denied — excluded
        ]
        result = compute_revenue_intelligence(rows)
        assert result["total_denied_claims"] == 1
        assert result["total_denied_value"] == 200.0
        assert len(result["root_causes"]) == 1
        assert result["root_causes"][0]["category"] == "NCCI edits / bundling"
        assert result["root_causes"][0]["claim_count"] == 1
        assert result["root_causes"][0]["pct_of_denials"] == 100.0

    def test_informational_codes_excluded_from_root_causes(self):
        rows = [_FakeRow("denied", 100.0, "MCS", "Dr. A", ["HCC-001", "CPT2-DIABETES-HBA"])]
        result = compute_revenue_intelligence(rows)
        assert result["total_denied_claims"] == 1
        assert result["root_causes"] == []  # both codes are informational-only

    def test_multiple_categories_on_one_claim_both_counted(self):
        rows = [_FakeRow("denied", 100.0, "Plan Vital", "Dr. A", ["NCCI-002", "DOC-001"])]
        result = compute_revenue_intelligence(rows)
        cats = {rc["category"] for rc in result["root_causes"]}
        assert cats == {"NCCI edits / bundling", "Documentation support"}
        for rc in result["root_causes"]:
            assert rc["pct_of_denials"] == 100.0

    def test_root_causes_sorted_by_value_impact_descending(self):
        rows = [
            _FakeRow("denied", 50.0, "Plan Vital", "Dr. A", ["DOC-001"]),
            _FakeRow("denied", 500.0, "Plan Vital", "Dr. B", ["NCCI-002"]),
        ]
        result = compute_revenue_intelligence(rows)
        assert result["root_causes"][0]["category"] == "NCCI edits / bundling"
        assert result["root_causes"][0]["value_impact"] == 500.0

    def test_by_provider_breakdown(self):
        rows = [
            _FakeRow("denied", 100.0, "Plan Vital", "Dr. A", ["DOC-001"]),
            _FakeRow("denied", 300.0, "Plan Vital", "Dr. B", ["DOC-001"]),
        ]
        result = compute_revenue_intelligence(rows)
        providers = {p["provider"]: p["denied_value"] for p in result["by_provider"]}
        assert providers == {"Dr. A": 100.0, "Dr. B": 300.0}
        assert result["by_provider"][0]["provider"] == "Dr. B"  # highest value first

    def test_by_payer_breakdown(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", ["MCS-001"]),
            _FakeRow("denied", 300.0, "Triple-S", "Dr. A", ["TS-001"]),
        ]
        result = compute_revenue_intelligence(rows)
        payers = {p["payer"]: p["denied_value"] for p in result["by_payer"]}
        assert payers == {"MCS": 100.0, "Triple-S": 300.0}

    def test_denial_rate_computed_against_all_claims(self):
        rows = [
            _FakeRow("denied", 100.0, "Plan Vital", "Dr. A", ["DOC-001"]),
            _FakeRow("paid", 100.0, "Plan Vital", "Dr. A", []),
            _FakeRow("pending", 100.0, "Plan Vital", "Dr. A", []),
            _FakeRow("pending", 100.0, "Plan Vital", "Dr. A", []),
        ]
        result = compute_revenue_intelligence(rows)
        assert result["total_claims"] == 4
        assert result["denial_rate_pct"] == 25.0


# ── Endpoint tests (demo mode) ─────────────────────────────────────────────────

import database as _database
import main as _main
from db_models import ClaimRecord

_main.init_db()


@pytest.fixture
def client():
    db = _database.SessionLocal()
    db.query(ClaimRecord).delete()
    db.commit()
    db.close()
    return TestClient(_main.app)


def _seed_claim(client, payer="Plan Vital", codes="99213", diagnosis="F32.1"):
    """Create a claim via the real API, then mark it denied."""
    r = client.post("/api/claims", json={
        "id": "SEED-1", "patient": "Test", "codes": codes, "payer": payer,
        "provider": "Dr. Seed", "npi": "1234567890", "dos": "2026-05-20",
        "billed": 200.0, "val": 200.0, "auth": "", "pos": "11",
        "diagnosis": diagnosis, "diagnoses": [diagnosis],
        "service_lines": [{"cpt": codes, "mods": [], "units": 1, "charge": 200.0}],
    })
    assert r.status_code == 200, r.text
    row_id = r.json()["row_id"]
    r2 = client.patch(f"/api/claims/{row_id}", json={"status": "denied"})
    assert r2.status_code == 200
    return row_id


class TestHistoricalImport:
    """
    Verifies the historical-import path: a CSV with a `status` column
    (denied/paid) uploaded via /api/batch with source=historical_import
    feeds the Denial Root Cause Engine exactly like a live-scrubbed claim,
    while staying distinguishable via the source tag.
    """
    def test_batch_defaults_to_live_source(self, client):
        csv_content = "claim_id,payer,codes,billed,status\nH1,MCS,99213,100,denied\n"
        r = client.post("/api/batch", files={"file": ("test.csv", csv_content, "text/csv")})
        assert r.status_code == 200
        claims = client.get("/api/claims", params={"source": "live"}).json()
        assert any(c["id"] == "H1" for c in claims)

    def test_historical_import_source_tagging(self, client):
        csv_content = "claim_id,payer,codes,billed,status\nH2,MCS,99213,200,denied\n"
        r = client.post(
            "/api/batch",
            data={"source": "historical_import"},
            files={"file": ("hist.csv", csv_content, "text/csv")},
        )
        assert r.status_code == 200

        hist_claims = client.get("/api/claims", params={"source": "historical_import"}).json()
        assert any(c["id"] == "H2" for c in hist_claims)

        live_claims = client.get("/api/claims", params={"source": "live"}).json()
        assert not any(c["id"] == "H2" for c in live_claims)

    def test_invalid_source_rejected(self, client):
        csv_content = "claim_id,payer,codes,billed,status\nH3,MCS,99213,100,denied\n"
        r = client.post(
            "/api/batch",
            data={"source": "bogus"},
            files={"file": ("bad.csv", csv_content, "text/csv")},
        )
        assert r.status_code == 400

    def test_historical_denied_claim_feeds_revenue_intelligence(self, client):
        csv_content = "claim_id,payer,provider,codes,billed,diagnosis,status\nH4,MCS,Dr. X,90839,500,F32.1,denied\n"
        r = client.post(
            "/api/batch",
            data={"source": "historical_import"},
            files={"file": ("hist2.csv", csv_content, "text/csv")},
        )
        assert r.status_code == 200
        ri = client.get("/api/analytics/revenue-intelligence").json()
        assert ri["total_denied_claims"] == 1
        assert ri["total_denied_value"] == 500.0

    def test_mixed_live_and_historical_both_count_toward_denial_analysis(self, client):
        live_csv = "claim_id,payer,codes,billed,status\nL1,Triple-S,99213,150,denied\n"
        client.post("/api/batch", files={"file": ("live.csv", live_csv, "text/csv")})

        hist_csv = "claim_id,payer,codes,billed,status\nH5,Triple-S,99213,250,denied\n"
        client.post(
            "/api/batch",
            data={"source": "historical_import"},
            files={"file": ("hist3.csv", hist_csv, "text/csv")},
        )

        ri = client.get("/api/analytics/revenue-intelligence").json()
        assert ri["total_denied_claims"] == 2
        assert ri["total_denied_value"] == 400.0


class TestComputeDenialTrends:
    def test_groups_by_month_and_payer(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="2026-01-15"),
            _FakeRow("denied", 200.0, "MCS", "Dr. B", [], dos="2026-01-20"),
            _FakeRow("denied", 150.0, "MCS", "Dr. A", [], dos="2026-02-01"),
        ]
        result = compute_revenue_intelligence(rows)
        trends = result["trends"]
        jan = next(t for t in trends if t["month"] == "2026-01" and t["payer"] == "MCS")
        feb = next(t for t in trends if t["month"] == "2026-02" and t["payer"] == "MCS")
        assert jan["denied_claims"] == 2
        assert jan["denied_value"] == 300.0
        assert feb["denied_claims"] == 1
        assert feb["denied_value"] == 150.0

    def test_excludes_unparseable_dates(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="—"),
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos=""),
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="not-a-date"),
        ]
        result = compute_revenue_intelligence(rows)
        assert result["trends"] == []

    def test_excludes_non_denied_claims(self):
        rows = [
            _FakeRow("paid", 100.0, "MCS", "Dr. A", [], dos="2026-01-15"),
            _FakeRow("pending", 100.0, "MCS", "Dr. A", [], dos="2026-01-15"),
        ]
        result = compute_revenue_intelligence(rows)
        assert result["trends"] == []

    def test_handles_alternate_date_formats(self):
        rows = [_FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="01/15/2026")]
        result = compute_revenue_intelligence(rows)
        assert result["trends"][0]["month"] == "2026-01"

    def test_sorted_chronologically(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="2026-03-01"),
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="2026-01-01"),
            _FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="2026-02-01"),
        ]
        result = compute_revenue_intelligence(rows)
        months = [t["month"] for t in result["trends"]]
        assert months == ["2026-01", "2026-02", "2026-03"]


class TestOutcomeRecoveryTracking:
    def test_resolved_outcome_contributes_to_recovered_value(self):
        rows = [_FakeRow("denied", 200.0, "MCS", "Dr. A", [], dos="2026-01-01")]
        rows[0].outcome = "resolved"
        rows[0].recovered_amount = 150.0
        result = compute_revenue_intelligence(rows)
        assert result["total_recovered_value"] == 150.0
        assert result["outcome_counts"] == {"resolved": 1}

    def test_recovery_rate_computed_against_total_denied_value(self):
        rows = [
            _FakeRow("denied", 200.0, "MCS", "Dr. A", [], dos="2026-01-01"),
            _FakeRow("denied", 200.0, "MCS", "Dr. B", [], dos="2026-01-01"),
        ]
        rows[0].outcome, rows[0].recovered_amount = "resolved", 100.0
        rows[1].outcome, rows[1].recovered_amount = "appealed", 0.0
        result = compute_revenue_intelligence(rows)
        # $100 recovered of $400 total denied = 25%
        assert result["recovery_rate_pct"] == 25.0
        assert result["outcome_counts"] == {"resolved": 1, "appealed": 1}

    def test_untracked_outcome_defaults_gracefully(self):
        rows = [_FakeRow("denied", 100.0, "MCS", "Dr. A", [], dos="2026-01-01")]
        # No .outcome attribute set at all — simulates older data / a fake
        # row without the new field.
        result = compute_revenue_intelligence(rows)
        assert result["outcome_counts"] == {"not_tracked": 1}
        assert result["total_recovered_value"] == 0.0


class TestOutcomeUpdateEndpoint:
    def test_marking_resolved_with_recovered_amount_feeds_revenue_intelligence(self, client):
        create = client.post("/api/claims", json={
            "id": "OUT-1", "patient": "Test", "codes": "99213", "payer": "MCS",
            "provider": "Dr. X", "npi": "1234567890", "dos": "2026-04-01",
            "billed": 300.0, "val": 300.0, "auth": "", "pos": "11",
            "diagnosis": "F32.1", "diagnoses": ["F32.1"],
            "service_lines": [{"cpt": "99213", "mods": [], "units": 1, "charge": 300.0}],
        })
        row_id = create.json()["row_id"]
        client.patch(f"/api/claims/{row_id}", json={"status": "denied"})
        r = client.patch(f"/api/claims/{row_id}", json={"outcome": "resolved", "recovered_amount": 250.0})
        assert r.status_code == 200
        body = r.json()
        assert body["outcome"] == "resolved"
        assert body["recovered_amount"] == 250.0
        assert body["outcome_updated_at"] is not None  # auto-stamped

        ri = client.get("/api/analytics/revenue-intelligence").json()
        assert ri["total_recovered_value"] >= 250.0
        assert ri["outcome_counts"].get("resolved", 0) >= 1


class TestProviderScorecards:
    def test_computes_denial_rate_per_provider(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", ["DOC-001"], dos="2026-01-01"),
            _FakeRow("paid", 100.0, "MCS", "Dr. A", [], dos="2026-01-01"),
        ]
        from analytics.engine import compute_provider_scorecards
        cards = compute_provider_scorecards(rows)
        card = next(c for c in cards if c["provider"] == "Dr. A")
        assert card["total_claims"] == 2
        assert card["denied_claims"] == 1
        assert card["denial_rate_pct"] == 50.0

    def test_top_causes_reflect_that_providers_denials_only(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. A", ["NCCI-002"], dos="2026-01-01"),
            _FakeRow("denied", 100.0, "MCS", "Dr. B", ["DOC-001"], dos="2026-01-01"),
        ]
        from analytics.engine import compute_provider_scorecards
        cards = compute_provider_scorecards(rows)
        card_a = next(c for c in cards if c["provider"] == "Dr. A")
        card_b = next(c for c in cards if c["provider"] == "Dr. B")
        assert card_a["top_causes"][0]["category"] == "NCCI edits / bundling"
        assert card_b["top_causes"][0]["category"] == "Documentation support"

    def test_sorted_by_denied_value_descending(self):
        rows = [
            _FakeRow("denied", 100.0, "MCS", "Dr. Low", ["DOC-001"], dos="2026-01-01"),
            _FakeRow("denied", 900.0, "MCS", "Dr. High", ["DOC-001"], dos="2026-01-01"),
        ]
        from analytics.engine import compute_provider_scorecards
        cards = compute_provider_scorecards(rows)
        assert cards[0]["provider"] == "Dr. High"

    def test_recovered_value_reflects_resolved_outcomes(self):
        row = _FakeRow("denied", 200.0, "MCS", "Dr. A", ["DOC-001"], dos="2026-01-01")
        row.outcome, row.recovered_amount = "resolved", 150.0
        from analytics.engine import compute_provider_scorecards
        cards = compute_provider_scorecards([row])
        assert cards[0]["recovered_value"] == 150.0

    def test_endpoint_returns_scorecards(self, client):
        client.post("/api/batch", data={"source": "historical_import"},
                    files={"file": ("h.csv", "claim_id,payer,provider,codes,billed,status\nPS1,MCS,Dr. Scorecard,99213,400,denied\n", "text/csv")})
        r = client.get("/api/analytics/provider-scorecards")
        assert r.status_code == 200
        data = r.json()
        assert any(c["provider"] == "Dr. Scorecard" for c in data)


class TestReportExports:
    def test_claims_csv_export_has_header_and_rows(self, client):
        _seed_claim(client)
        r = client.get("/api/reports/claims.csv")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("text/csv")
        assert "attachment" in r.headers["content-disposition"]
        lines = r.text.strip().split("\n")
        assert lines[0].startswith("claim_id,patient,payer")
        assert len(lines) >= 2  # header + at least one claim

    def test_revenue_intelligence_csv_export(self, client):
        client.post("/api/batch", data={"source": "historical_import"},
                    files={"file": ("h.csv", "claim_id,payer,codes,billed,status\nRX1,MCS,99213,300,denied\n", "text/csv")})
        r = client.get("/api/reports/revenue-intelligence.csv")
        assert r.status_code == 200
        assert "category,claim_count" in r.text

    def test_revenue_intelligence_pdf_export(self, client):
        client.post("/api/batch", data={"source": "historical_import"},
                    files={"file": ("h.csv", "claim_id,payer,codes,billed,status\nRX2,MCS,99213,300,denied\n", "text/csv")})
        r = client.get("/api/reports/revenue-intelligence.pdf")
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
        assert r.content[:4] == b"%PDF"  # real PDF magic bytes, not an error page

    def test_pdf_export_works_with_zero_data(self, client):
        # Should not crash on an empty org — just produce a report saying so
        r = client.get("/api/reports/revenue-intelligence.pdf")
        assert r.status_code == 200
        assert r.content[:4] == b"%PDF"


class TestRevenueIntelligenceEndpoint:
    def test_empty_org_returns_zero_state(self, client):
        r = client.get("/api/analytics/revenue-intelligence")
        assert r.status_code == 200
        data = r.json()
        assert data["total_denied_claims"] == 0
        assert "executive_summary" in data

    def test_denied_claim_surfaces_in_root_causes(self, client):
        # 99213 with no diagnosis-supporting context triggers DOC-003
        # (unspecified) style findings from the real rules engine via
        # /api/claims's scrub-on-create path.
        _seed_claim(client, codes="99213", diagnosis="Z00.00")
        r = client.get("/api/analytics/revenue-intelligence")
        assert r.status_code == 200
        data = r.json()
        assert data["total_denied_claims"] == 1
        assert data["total_denied_value"] == 200.0
        assert isinstance(data["executive_summary"], str) and data["executive_summary"]

    def test_lang_param_returns_spanish_fallback_when_no_root_causes(self, client):
        r = client.get("/api/analytics/revenue-intelligence", params={"lang": "es"})
        assert r.status_code == 200
        assert "no hay reclamos denegados" in r.json()["executive_summary"].lower() or \
               "aún no hay" in r.json()["executive_summary"].lower()
