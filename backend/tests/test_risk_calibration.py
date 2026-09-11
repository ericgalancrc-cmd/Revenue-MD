"""
Tests for backend/analytics/risk_calibration.py and the
/api/analytics/predict-denial endpoint.

Run from the backend/ directory:
    pytest tests/test_risk_calibration.py -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import json
import pytest
from fastapi.testclient import TestClient

from analytics.risk_calibration import compute_org_denial_stats, estimate_denial_probability


class _FakeRow:
    def __init__(self, status, issue_codes):
        self.status = status
        self.issues_json = json.dumps([{"code": c} for c in issue_codes])


# ── Unit tests: compute_org_denial_stats ──────────────────────────────────────

class TestComputeOrgDenialStats:
    def test_empty_org_has_no_baseline(self):
        stats = compute_org_denial_stats([])
        assert stats["baseline_rate"] is None
        assert stats["total_resolved_claims"] == 0

    def test_baseline_rate_from_denied_and_paid(self):
        rows = [
            _FakeRow("denied", []), _FakeRow("denied", []),
            _FakeRow("paid", []), _FakeRow("paid", []),
        ]
        stats = compute_org_denial_stats(rows)
        assert stats["baseline_rate"] == 0.5
        assert stats["total_resolved_claims"] == 4

    def test_pending_claims_excluded_from_baseline(self):
        rows = [_FakeRow("denied", []), _FakeRow("pending", [])]
        stats = compute_org_denial_stats(rows)
        assert stats["total_resolved_claims"] == 1  # pending doesn't count

    def test_per_code_stats_tracked_correctly(self):
        rows = [
            _FakeRow("denied", ["NCCI-002"]),
            _FakeRow("denied", ["NCCI-002"]),
            _FakeRow("paid", ["NCCI-002"]),
        ]
        stats = compute_org_denial_stats(rows)
        assert stats["code_stats"]["NCCI-002"] == {"times_seen": 3, "times_denied": 2}

    def test_code_counted_once_per_claim_not_per_occurrence(self):
        # Even if a code somehow appeared twice in one claim's issues list,
        # it should only count once toward that claim's times_seen.
        rows = [_FakeRow("denied", ["NCCI-002", "NCCI-002"])]
        stats = compute_org_denial_stats(rows)
        assert stats["code_stats"]["NCCI-002"]["times_seen"] == 1


# ── Unit tests: estimate_denial_probability ───────────────────────────────────

class TestEstimateDenialProbability:
    def test_no_historical_data_returns_none(self):
        org_stats = {"baseline_rate": None, "total_resolved_claims": 0, "code_stats": {}}
        result = estimate_denial_probability(["NCCI-002"], org_stats)
        assert result["probability"] is None
        assert result["confidence"] == "none"

    def test_clean_claim_uses_baseline_rate(self):
        org_stats = {"baseline_rate": 0.2, "total_resolved_claims": 50, "code_stats": {}}
        result = estimate_denial_probability([], org_stats)
        assert result["probability"] == 0.2
        assert result["sample_size"] == 50

    def test_code_with_high_historical_denial_rate_scores_high(self):
        # NCCI-002 denied 9/10 times historically — should score close to that,
        # not close to the org baseline of 0.1.
        org_stats = {
            "baseline_rate": 0.1,
            "total_resolved_claims": 100,
            "code_stats": {"NCCI-002": {"times_seen": 10, "times_denied": 9}},
        }
        result = estimate_denial_probability(["NCCI-002"], org_stats)
        assert result["probability"] > 0.5  # should lean toward the code's own 90% rate
        assert result["confidence"] in ("low", "moderate")

    def test_unseen_code_falls_back_toward_baseline(self):
        # A code never seen before (0 evidence) should land very close to
        # the org's baseline rate, not some arbitrary number.
        org_stats = {"baseline_rate": 0.15, "total_resolved_claims": 40, "code_stats": {}}
        result = estimate_denial_probability(["SOME-NEW-CODE"], org_stats)
        assert abs(result["probability"] - 0.15) < 0.02
        assert result["sample_size"] == 0

    def test_more_evidence_increases_confidence(self):
        org_stats_low = {
            "baseline_rate": 0.1, "total_resolved_claims": 100,
            "code_stats": {"X": {"times_seen": 3, "times_denied": 1}},
        }
        org_stats_high = {
            "baseline_rate": 0.1, "total_resolved_claims": 100,
            "code_stats": {"X": {"times_seen": 50, "times_denied": 20}},
        }
        low = estimate_denial_probability(["X"], org_stats_low)
        high = estimate_denial_probability(["X"], org_stats_high)
        assert low["confidence"] == "low"
        assert high["confidence"] == "high"

    def test_multiple_issues_combine_via_noisy_or(self):
        # Two moderately risky issues together should produce HIGHER
        # probability than either alone (noisy-OR), but never exceed 1.
        org_stats = {
            "baseline_rate": 0.1, "total_resolved_claims": 100,
            "code_stats": {
                "A": {"times_seen": 20, "times_denied": 10},  # ~50%
                "B": {"times_seen": 20, "times_denied": 10},  # ~50%
            },
        }
        single = estimate_denial_probability(["A"], org_stats)
        combined = estimate_denial_probability(["A", "B"], org_stats)
        assert combined["probability"] > single["probability"]
        assert combined["probability"] <= 0.99

    def test_probability_never_reported_above_99_percent(self):
        org_stats = {
            "baseline_rate": 0.9, "total_resolved_claims": 100,
            "code_stats": {
                "A": {"times_seen": 50, "times_denied": 50},
                "B": {"times_seen": 50, "times_denied": 50},
                "C": {"times_seen": 50, "times_denied": 50},
            },
        }
        result = estimate_denial_probability(["A", "B", "C"], org_stats)
        assert result["probability"] <= 0.99


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


def _make_claim_payload(payer="MCS", codes="90837", diagnosis="I50.9"):
    return {
        "id": "PRED-1", "patient": "Test", "codes": codes, "payer": payer,
        "provider": "Dr. Test", "npi": "1234567890", "dos": "2026-05-20",
        "billed": 300.0, "val": 300.0, "auth": "", "pos": "11",
        "diagnosis": diagnosis, "diagnoses": [diagnosis],
        "service_lines": [{"cpt": codes, "mods": [], "units": 1, "charge": 300.0}],
    }


class TestPredictDenialEndpoint:
    def test_no_history_returns_none_probability(self, client):
        r = client.post("/api/analytics/predict-denial", json=_make_claim_payload())
        assert r.status_code == 200
        data = r.json()
        assert data["denial_probability"] is None
        assert data["confidence"] == "none"
        assert "risk" in data  # deterministic rules-based risk is always present regardless

    def test_with_history_returns_real_probability(self, client):
        # Seed several historical denied claims with the same MDX-001-style
        # issue (psychotherapy billed against a non-behavioral-health dx).
        for i in range(15):
            client.post("/api/batch", data={"source": "historical_import"}, files={
                "file": (f"h{i}.csv",
                         f"claim_id,payer,codes,billed,diagnosis,status\nH{i},MCS,90837,300,I50.9,denied\n",
                         "text/csv"),
            })
        r = client.post("/api/analytics/predict-denial", json=_make_claim_payload())
        assert r.status_code == 200
        data = r.json()
        assert data["denial_probability"] is not None
        assert data["denial_probability"] > 0.5  # should reflect the 100% historical denial rate for this pattern
        assert data["confidence"] in ("moderate", "high")
