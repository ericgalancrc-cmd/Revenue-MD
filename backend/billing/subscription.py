"""
Subscription status logic — groundwork for real billing.

No Stripe (or any payment processor) is connected yet. This module only
computes and reports status from the Subscription table; it does not
enforce access restrictions anywhere. Wire in real enforcement (e.g. a
FastAPI dependency that raises 402 Payment Required) once a payment
processor is actually connected — doing so before that would lock
people out of their own trial with no way to pay.

TRIAL_LENGTH_DAYS: how long a new org's trial lasts before status logic
considers it expired. 14 days is a common SaaS default — adjust freely,
this isn't tied to any external commitment.
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

TRIAL_LENGTH_DAYS = 14

PLAN_LABELS = {
    "trial": "Free Trial",
    "starter": "Starter",
    "growth": "Growth",
    "professional": "Professional",
    "enterprise": "Enterprise",
}


def new_trial_fields(now: Optional[datetime] = None) -> Dict[str, str]:
    """Return the field values for a brand-new trial subscription row."""
    now = now or datetime.now(timezone.utc)
    trial_ends = now + timedelta(days=TRIAL_LENGTH_DAYS)
    return {
        "plan": "trial",
        "status": "trialing",
        "trial_ends_at": trial_ends.isoformat(),
        "created_at": now.isoformat(),
    }


def compute_status(sub: Any, now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Given a Subscription ORM row (or None if the org has never started
    one), return a plain-dict status payload for the API — including
    whether the trial has actually expired (computed here, not trusted
    blindly from the stored `status` column, since nothing currently
    flips that column automatically on expiry).
    """
    now = now or datetime.now(timezone.utc)

    if sub is None:
        return {
            "has_subscription": False,
            "plan": None,
            "plan_label": None,
            "status": "none",
            "is_active": False,
            "is_trial": False,
            "trial_days_remaining": None,
            "trial_ends_at": None,
        }

    is_trial = sub.status == "trialing"
    trial_days_remaining = None
    trial_expired = False
    if is_trial and sub.trial_ends_at:
        try:
            ends = datetime.fromisoformat(sub.trial_ends_at)
            remaining = (ends - now).total_seconds() / 86400
            trial_days_remaining = max(0, round(remaining, 1))
            trial_expired = remaining <= 0
        except ValueError:
            pass

    # "Active" here means "should have access" — trialing-and-not-expired
    # counts as active, same as a paid, current subscription would.
    is_active = sub.status == "active" or (is_trial and not trial_expired)

    return {
        "has_subscription": True,
        "plan": sub.plan,
        "plan_label": PLAN_LABELS.get(sub.plan, sub.plan),
        "status": "trial_expired" if (is_trial and trial_expired) else sub.status,
        "is_active": is_active,
        "is_trial": is_trial,
        "trial_days_remaining": trial_days_remaining,
        "trial_ends_at": sub.trial_ends_at,
        "current_period_end": sub.current_period_end,
    }
