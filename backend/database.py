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
    """Create all tables. Called once at startup."""
    from db_models import BatchRecord, ClaimRecord  # noqa: F401 — registers models
    Base.metadata.create_all(bind=engine)
