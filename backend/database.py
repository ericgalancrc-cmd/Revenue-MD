"""
Database engine and session factory.

Defaults to SQLite (revenuemd.db in the backend directory).
Override with DATABASE_URL env var for PostgreSQL on Railway/Render:
  DATABASE_URL=postgresql://user:pass@host:5432/dbname
"""
from __future__ import annotations

import os
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./revenuemd.db")

_is_sqlite = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    # SQLite requires this for use across threads (FastAPI runs handlers concurrently)
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    # Connection pool sizing — fine for SQLite, sensible for Postgres too
    pool_pre_ping=True,
)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_conn, _record):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")     # concurrent reads during writes
        cur.execute("PRAGMA foreign_keys=ON")      # enforce FK constraints
        cur.execute("PRAGMA busy_timeout=5000")    # wait up to 5s instead of failing
        cur.close()

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and closes it when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and apply lightweight SQLite column migrations."""
    from db_models import BatchRecord, ClaimRecord, BAARecord, AuditLog  # noqa: F401
    Base.metadata.create_all(bind=engine)
    if _is_sqlite:
        _sqlite_migrate()


def _sqlite_migrate():
    """Add new columns to existing SQLite tables without Alembic."""
    new_columns = [
        ("batches",       "org_id", "TEXT DEFAULT 'demo'"),
        ("claim_records", "org_id", "TEXT DEFAULT 'demo'"),
    ]
    with engine.connect() as conn:
        for table, column, definition in new_columns:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
                conn.commit()
            except Exception:
                pass  # column already exists — safe to ignore
