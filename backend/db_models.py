"""
SQLAlchemy ORM models for persistent batch and claim storage.

Nested Pydantic objects (issues, fix, service_lines, diagnoses) are
stored as JSON text columns — keeps the schema simple and avoids
many-to-many join tables for a v1.
"""
from __future__ import annotations

import json
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, Index
from sqlalchemy.orm import relationship

from database import Base


class BatchRecord(Base):
    __tablename__ = "batches"

    id              = Column(String, primary_key=True)
    created         = Column(String, nullable=False, index=True)
    total           = Column(Integer, default=0)
    auto_clear      = Column(Integer, default=0)
    needs_attention = Column(Integer, default=0)
    at_risk         = Column(Float,   default=0.0)
    org_id          = Column(String,  nullable=True, index=True, default="demo")
    source          = Column(String,  nullable=False, default="live")  # "live" | "historical_import"

    claims = relationship(
        "ClaimRecord",
        back_populates="batch",
        cascade="all, delete-orphan",
        order_by="ClaimRecord.row_id",
    )


class ClaimRecord(Base):
    __tablename__ = "claim_records"

    row_id   = Column(Integer, primary_key=True, autoincrement=True)
    batch_id = Column(String, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id   = Column(String,  nullable=True, index=True, default="demo")
    source   = Column(String,  nullable=False, default="live")  # "live" | "historical_import" — denormalized from the owning batch for simple analytics filtering

    # Scalar fields
    claim_id  = Column(String,  nullable=False)
    patient   = Column(String,  default="")
    codes     = Column(String,  default="")
    payer     = Column(String,  default="")
    prov      = Column(String,  default="")
    provider  = Column(String,  default="")
    npi       = Column(String,  default="")
    dos       = Column(String,  default="")
    billed    = Column(Float,   default=0.0)
    val       = Column(Float,   default=0.0)
    auth      = Column(String,  default="")
    pos       = Column(String,  default="11")
    diagnosis = Column(String,  default="")
    member_id = Column(String,  default="")
    status    = Column(String,  default="pending")
    outcome           = Column(String,  default="")    # "" | "paid" | "denied" | "appealed" | "written_off" | "resolved"
    recovered_amount  = Column(Float,   default=0.0)    # $ recovered — meaningful once outcome == "resolved"
    outcome_updated_at = Column(String, nullable=True)
    lane      = Column(String,  default="auto_clear")
    risk      = Column(Integer, default=0)
    comp      = Column(Integer, default=100)
    doc       = Column(Integer, default=100)
    sEn       = Column(Text,    default="")
    sEs       = Column(Text,    default="")
    iEn       = Column(String,  default="")
    iEs       = Column(String,  default="")

    # JSON-encoded nested objects
    diagnoses_json     = Column(Text, default="[]")
    service_lines_json = Column(Text, default="[]")
    issues_json        = Column(Text, default="[]")
    fix_json           = Column(Text, default="[]")

    batch = relationship("BatchRecord", back_populates="claims")

    __table_args__ = (
        Index("ix_claim_records_batch_claim", "batch_id", "claim_id"),
    )

    # ── Serialisation helpers ─────────────────────────────────────────

    @classmethod
    def from_result(cls, result, batch_id: str, org_id: str = "demo", source: str = "live") -> "ClaimRecord":
        """Build a ClaimRecord from a ScrubResult Pydantic model."""
        return cls(
            batch_id           = batch_id,
            org_id             = org_id,
            source             = source,
            claim_id           = result.id,
            patient            = result.patient,
            codes              = result.codes,
            payer              = result.payer,
            prov               = result.prov,
            provider           = result.provider,
            npi                = result.npi,
            dos                = result.dos,
            billed             = result.billed,
            val                = result.val,
            auth               = result.auth,
            pos                = result.pos,
            diagnosis          = result.diagnosis,
            member_id          = result.member_id,
            status             = result.status,
            outcome            = result.outcome,
            recovered_amount   = result.recovered_amount,
            outcome_updated_at = result.outcome_updated_at,
            lane               = result.lane.value,
            risk               = result.risk,
            comp               = result.comp,
            doc                = result.doc,
            sEn                = result.sEn,
            sEs                = result.sEs,
            iEn                = result.iEn,
            iEs                = result.iEs,
            diagnoses_json     = json.dumps(result.diagnoses),
            service_lines_json = json.dumps([sl.model_dump() for sl in result.service_lines]),
            issues_json        = json.dumps([i.model_dump() for i in result.issues]),
            fix_json           = json.dumps([f.model_dump() for f in result.fix]),
        )

    def to_result(self):
        """Deserialise back to a ScrubResult Pydantic model."""
        from models import ScrubResult, ServiceLine, Issue, Fix, Lane

        return ScrubResult(
            row_id        = self.row_id,
            id            = self.claim_id,
            patient       = self.patient,
            codes         = self.codes,
            payer         = self.payer,
            prov          = self.prov,
            provider      = self.provider,
            npi           = self.npi,
            dos           = self.dos,
            billed        = self.billed,
            val           = self.val,
            auth          = self.auth,
            pos           = self.pos,
            diagnosis     = self.diagnosis,
            diagnoses     = json.loads(self.diagnoses_json or "[]"),
            member_id     = self.member_id,
            service_lines = [ServiceLine(**sl) for sl in json.loads(self.service_lines_json or "[]")],
            status        = self.status,
            outcome       = self.outcome,
            recovered_amount = self.recovered_amount,
            outcome_updated_at = self.outcome_updated_at,
            lane          = Lane(self.lane),
            risk          = self.risk,
            comp          = self.comp,
            doc           = self.doc,
            sEn           = self.sEn,
            sEs           = self.sEs,
            iEn           = self.iEn,
            iEs           = self.iEs,
            issues        = [Issue(**i) for i in json.loads(self.issues_json or "[]")],
            fix           = [Fix(**f)   for f in json.loads(self.fix_json   or "[]")],
            batch_created = self.batch.created if self.batch is not None else None,
        )


class Subscription(Base):
    """
    One row per org. Groundwork for real billing — schema and status
    logic only. Deliberately does NOT gate/block any other endpoint yet:
    there's no real payment processor connected, so enforcing this would
    lock people out of their own trial with no way to pay. Wire in
    enforcement once Stripe (or equivalent) is actually connected.
    """
    __tablename__ = "subscriptions"

    id                     = Column(String, primary_key=True)
    org_id                 = Column(String, nullable=False, unique=True, index=True)
    plan                   = Column(String, default="trial")     # "trial" | "starter" | "growth" | "professional" | "enterprise"
    status                 = Column(String, default="trialing")  # "trialing" | "active" | "past_due" | "canceled"
    trial_ends_at          = Column(String, nullable=True)
    current_period_end     = Column(String, nullable=True)
    stripe_customer_id     = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    created_at             = Column(String, nullable=False)
    updated_at             = Column(String, nullable=True)


class BAARecord(Base):
    """Records each org's acceptance of the HIPAA Business Associate Agreement."""
    __tablename__ = "baa_records"

    id          = Column(String,  primary_key=True)
    org_id      = Column(String,  nullable=False, index=True)
    user_id     = Column(String,  nullable=False)
    accepted_at = Column(String,  nullable=False)
    ip_address  = Column(String,  default="")
    version     = Column(String,  default="1.0")


class TeamInvite(Base):
    """
    A pending or accepted invite for a staff member to join an org's shared
    clinic data. Recording the invite here does NOT send an email — actually
    delivering it requires either Auth0's own invite/Organizations flow or a
    transactional email provider (e.g. SendGrid), neither of which is wired
    up yet. This table just gives the Settings > Team page something real
    to read and write instead of a hardcoded demo list.
    """
    __tablename__ = "team_invites"

    id           = Column(String,  primary_key=True)
    org_id       = Column(String,  nullable=False, index=True)
    email        = Column(String,  nullable=False)
    role         = Column(String,  default="coder")   # "coder" | "manager"
    invited_by   = Column(String,  nullable=False)
    invited_at   = Column(String,  nullable=False)
    status       = Column(String,  default="pending")  # "pending" | "active" | "revoked"

    __table_args__ = (
        Index("ix_team_invites_org_email", "org_id", "email"),
    )


class CDIQuery(Base):
    """A Clinical Documentation Improvement query — flags a documentation
    specificity opportunity (e.g. an unspecified diabetes code that could be
    more specific with better chart documentation) and tracks the physician
    query sent to resolve it through to a coded outcome."""
    __tablename__ = "cdi_queries"

    id               = Column(String,  primary_key=True)
    org_id           = Column(String,  nullable=False, index=True)
    claim_row_id     = Column(Integer, nullable=True, index=True)  # optional link to claim_records.row_id
    opportunity_id   = Column(String,  nullable=False)             # e.g. "diabetes-unspecified"
    family           = Column(String,  nullable=False)             # human label, e.g. "Type 2 diabetes mellitus, unspecified"
    source_code      = Column(String,  nullable=False)             # the unspecified code that triggered this, e.g. "E11.9"
    candidates_json  = Column(Text,    default="[]")               # candidate more-specific codes
    query_en         = Column(Text,    default="")
    query_es         = Column(Text,    default="")
    ai_enhanced       = Column(Integer, default=0)                   # 0/1 — whether Claude personalized the query text
    status           = Column(String,  default="open")             # "open" | "answered" | "resolved"
    resolved_code    = Column(String,  default="")
    created_by       = Column(String,  nullable=False)
    created_at       = Column(String,  nullable=False)
    resolved_at      = Column(String,  nullable=True)

    __table_args__ = (
        Index("ix_cdi_queries_org_status", "org_id", "status"),
    )


class AuditLog(Base):
    """HIPAA-required audit trail: every batch/claim operation is logged."""
    __tablename__ = "audit_logs"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    org_id        = Column(String,  nullable=False, index=True)
    user_id       = Column(String,  nullable=False)
    action        = Column(String,  nullable=False)   # e.g. batch_created, batch_read, baa_accepted
    resource_type = Column(String,  default="")
    resource_id   = Column(String,  default="")
    timestamp     = Column(String,  nullable=False)
    ip_address    = Column(String,  default="")
