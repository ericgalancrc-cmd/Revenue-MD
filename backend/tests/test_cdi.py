"""
Tests for the CDI (Clinical Documentation Improvement) feature:
- specificity_map matching logic (unit-level)
- /api/cdi/analyze, /api/cdi, /api/cdi/{id} (endpoint-level, demo mode)

Run from the backend/ directory:
    pytest tests/test_cdi.py -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient

from cdi.specificity_map import find_opportunities, SPECIFICITY_OPPORTUNITIES


# ── Unit tests: specificity_map ────────────────────────────────────────────────

class TestFindOpportunities:
    def test_matches_exact_prefix(self):
        opps = find_opportunities(["E11.9"])
        ids = {o["id"] for o in opps}
        assert "diabetes-unspecified" in ids

    def test_matches_case_insensitively(self):
        opps = find_opportunities(["e11.9"])
        assert any(o["id"] == "diabetes-unspecified" for o in opps)

    def test_does_not_match_unrelated_code(self):
        opps = find_opportunities(["Z00.00"])
        assert opps == []

    def test_does_not_match_already_specific_code(self):
        # E11.22 is already the specific code — shouldn't re-flag as an
        # "unspecified" opportunity for the same family.
        opps = find_opportunities(["E11.22"])
        assert not any(o["id"] == "diabetes-unspecified" for o in opps)

    def test_multiple_diagnoses_can_match_multiple_opportunities(self):
        opps = find_opportunities(["E11.9", "I50.9", "Z00.00"])
        ids = {o["id"] for o in opps}
        assert "diabetes-unspecified" in ids
        assert "chf-unspecified" in ids
        assert len(ids) == 2

    def test_empty_list_returns_no_opportunities(self):
        assert find_opportunities([]) == []

    def test_handles_none_and_blank_entries(self):
        opps = find_opportunities([None, "", "E11.9"])
        assert any(o["id"] == "diabetes-unspecified" for o in opps)

    def test_every_opportunity_has_required_fields(self):
        for opp in SPECIFICITY_OPPORTUNITIES:
            assert opp["id"]
            assert opp["code_prefix"]
            assert opp["family"]
            assert len(opp["candidates"]) >= 1
            assert opp["query_en"]
            assert opp["query_es"]


# ── Endpoint tests (demo mode — no Auth0 configured) ──────────────────────────

import sys as _sys
import os as _os

_os.environ.setdefault("DATABASE_URL", f"sqlite:///{_os.path.dirname(__file__)}/test_cdi.db")

import database as _database  # noqa: E402
import main as _main          # noqa: E402
from db_models import CDIQuery  # noqa: E402

_main.init_db()


@pytest.fixture
def client():
    # Function-scoped isolation without re-importing the app (re-importing
    # rebinds a fresh SQLAlchemy Base whose metadata no longer matches the
    # already-defined ORM classes in db_models, so tables silently stop being
    # created) — instead just wipe the one table this test file cares about.
    db = _database.SessionLocal()
    db.query(CDIQuery).delete()
    db.commit()
    db.close()
    return TestClient(_main.app)


class TestCDIAnalyzeEndpoint:
    def test_returns_empty_list_for_no_match(self, client):
        r = client.post("/api/cdi/analyze", json={"diagnoses": ["Z00.00"]})
        assert r.status_code == 200
        assert r.json() == []

    def test_returns_and_persists_matched_opportunity(self, client):
        r = client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9"]})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["opportunity_id"] == "diabetes-unspecified"
        assert data[0]["status"] == "open"
        assert data[0]["query_en"]
        assert data[0]["ai_enhanced"] is False  # no ANTHROPIC_API_KEY in test env

    def test_matches_multiple_opportunities_at_once(self, client):
        r = client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9", "J44.9"]})
        assert r.status_code == 200
        ids = {row["opportunity_id"] for row in r.json()}
        assert ids == {"diabetes-unspecified", "copd-unspecified"}


class TestCDIListEndpoint:
    def test_lists_previously_created_queries(self, client):
        client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9"]})
        r = client.get("/api/cdi")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_filters_by_status(self, client):
        client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9"]})
        r_open = client.get("/api/cdi", params={"status": "open"})
        r_resolved = client.get("/api/cdi", params={"status": "resolved"})
        assert len(r_open.json()) == 1
        assert len(r_resolved.json()) == 0


class TestCDIUpdateEndpoint:
    def test_marks_resolved_with_code(self, client):
        created = client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9"]}).json()
        qid = created[0]["id"]
        r = client.patch(f"/api/cdi/{qid}", json={"status": "resolved", "resolved_code": "E11.22"})
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "resolved"
        assert body["resolved_code"] == "E11.22"
        assert body["resolved_at"] is not None

    def test_rejects_invalid_status(self, client):
        created = client.post("/api/cdi/analyze", json={"diagnoses": ["E11.9"]}).json()
        qid = created[0]["id"]
        r = client.patch(f"/api/cdi/{qid}", json={"status": "bogus"})
        assert r.status_code == 400

    def test_404_for_unknown_id(self, client):
        r = client.patch("/api/cdi/does-not-exist", json={"status": "answered"})
        assert r.status_code == 404
