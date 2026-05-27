"""
SQLAlchemy ORM models: Batch, Claim, AuditLog.
"""

from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Batch(Base):
    __tablename__ = "batches"

    id              = Column(String, primary_key=True)
    filename        = Column(String, nullable=True)
    total           = Column(Integer)
    auto_clear      = Column(Integer)
    needs_attention = Column(Integer)
    at_risk         = Column(Float)
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    claims = relationship("Claim", back_populates="batch", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id          = Column(String, primary_key=True)
    batch_id    = Column(String, ForeignKey("batches.id"), nullable=False)
    payer       = Column(String)
    codes       = Column(String)
    prov        = Column(String)
    risk        = Column(Integer)
    lane        = Column(String)
    val         = Column(Float)
    pat         = Column(String)
    dos         = Column(String)
    npi         = Column(String)
    charge      = Column(Float)
    comp        = Column(Integer)
    doc         = Column(Integer)
    issues_json = Column(Text)    # JSON array of Issue objects
    fix_json    = Column(Text)    # JSON array of Suggestion objects
    reviewed    = Column(Boolean, default=False)
    st          = Column(String, default="pending")
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batch = relationship("Batch", back_populates="claims")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    event      = Column(String)          # batch_upload | claim_view | claim_approve
    batch_id   = Column(String, nullable=True)
    claim_id   = Column(String, nullable=True)
    detail     = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
