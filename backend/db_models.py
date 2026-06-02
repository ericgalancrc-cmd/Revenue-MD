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
    def from_result(cls, result, batch_id: str, org_id: str = "demo") -> "ClaimRecord":
        """Build a ClaimRecord from a ScrubResult Pydantic model."""
        return cls(
            batch_id           = batch_id,
            org_id             = org_id,
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
        )


class BAARecord(Base):
    """Records each org's acceptance of the HIPAA Business Associate Agreement."""
    __tablename__ = "baa_records"

    id          = Column(String,  primary_key=True)
    org_id      = Column(String,  nullable=False, index=True)
    user_id     = Column(String,  nullable=False)
    accepted_at = Column(String,  nullable=False)
    ip_address  = Column(String,  default="")
    version     = Column(String,  default="1.0")


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
