"""Shared FastAPI dependencies."""

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal

# How it works:
# 1. A request calls get_db().
# 2. SessionLocal() creates a new session for that request.
# 3. FastAPI injects the session into the route.
# 4. If an exception occurs, the current transaction is rolled back.
# 5. The session is closed when the request finishes.
# We deliberately do not commit automatically in this dependency. The service or database operation that owns a transaction should decide when to commit.
# There is no globally shared database Session object. Each request receives its own session.


def get_db() -> Generator[Session, None, None]:
    """
    Provide one database session per request.

    The session is always closed. If an exception occurs
    the current transaction is rolled back.
    """
    db = SessionLocal()

    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
