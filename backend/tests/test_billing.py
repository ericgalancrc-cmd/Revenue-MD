"""
Tests for billing/subscription groundwork (backend/billing/) and its
/api/billing/status and /api/billing/start-trial endpoints.

Run from the backend/ directory:
    pytest tests/test_billing.py -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from billing.subscription import compute_status, new_trial_fields, TRIAL_LENGTH_DAYS


# ── Unit tests: compute_status ────────────────────────────────────────────────

class _FakeSub:
    def __init__(self, plan="trial", status="trialing", trial_ends_at=None, current_period_end=None):
        self.plan = plan
        self.status = status
        self.trial_ends_at = trial_ends_at
        self.current_period_end = current_period_end


class TestComputeStatus:
    def test_no_subscription_returns_has_subscription_false(self):
        result = compute_status(None)
        assert result["has_subscription"] is False
        assert result["is_active"] is False

    def test_active_trial_is_active(self):
        future = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        sub = _FakeSub(status="trialing", trial_ends_at=future)
        result = compute_status(sub)
        assert result["is_active"] is True
        assert result["is_trial"] is True
        assert result["status"] == "trialing"
        assert result["trial_days_remaining"] > 0

    def test_expired_trial_is_not_active(self):
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        sub = _FakeSub(status="trialing", trial_ends_at=past)
        result = compute_status(sub)
        assert result["is_active"] is False
        assert result["status"] == "trial_expired"
        assert result["trial_days_remaining"] == 0

    def test_active_paid_subscription_is_active(self):
        sub = _FakeSub(plan="growth", status="active")
        result = compute_status(sub)
        assert result["is_active"] is True
        assert result["is_trial"] is False
        assert result["plan_label"] == "Growth"

    def test_canceled_subscription_is_not_active(self):
        sub = _FakeSub(plan="starter", status="canceled")
        result = compute_status(sub)
        assert result["is_active"] is False

    def test_past_due_subscription_is_not_active(self):
        sub = _FakeSub(plan="professional", status="past_due")
        result = compute_status(sub)
        assert result["is_active"] is False

    def test_unrecognized_plan_falls_back_to_raw_value(self):
        sub = _FakeSub(plan="custom_enterprise_deal", status="active")
        result = compute_status(sub)
        assert result["plan_label"] == "custom_enterprise_deal"

    def test_malformed_trial_ends_at_does_not_crash(self):
        sub = _FakeSub(status="trialing", trial_ends_at="not-a-real-date")
        result = compute_status(sub)  # should not raise
        assert result["has_subscription"] is True


class TestNewTrialFields:
    def test_creates_trial_ending_in_the_future(self):
        fields = new_trial_fields()
        assert fields["plan"] == "trial"
        assert fields["status"] == "trialing"
        ends = datetime.fromisoformat(fields["trial_ends_at"])
        now = datetime.now(timezone.utc)
        assert (ends - now).days in (TRIAL_LENGTH_DAYS - 1, TRIAL_LENGTH_DAYS)  # allow for rounding


# ── Endpoint tests (demo mode) ─────────────────────────────────────────────────

import database as _database
import main as _main
from db_models import Subscription

_main.init_db()


@pytest.fixture
def client():
    db = _database.SessionLocal()
    db.query(Subscription).delete()
    db.commit()
    db.close()
    return TestClient(_main.app)


class TestBillingStatusEndpoint:
    def test_no_subscription_yet(self, client):
        r = client.get("/api/billing/status")
        assert r.status_code == 200
        assert r.json()["has_subscription"] is False


class TestStartTrialEndpoint:
    def test_creates_a_trial(self, client):
        r = client.post("/api/billing/start-trial")
        assert r.status_code == 200
        data = r.json()
        assert data["has_subscription"] is True
        assert data["is_trial"] is True
        assert data["is_active"] is True

    def test_status_reflects_started_trial(self, client):
        client.post("/api/billing/start-trial")
        r = client.get("/api/billing/status")
        assert r.json()["has_subscription"] is True

    def test_cannot_start_a_second_trial(self, client):
        client.post("/api/billing/start-trial")
        r = client.post("/api/billing/start-trial")
        assert r.status_code == 409
