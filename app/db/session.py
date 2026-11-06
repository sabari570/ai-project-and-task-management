"""SQLAlchemy engine and database session factory."""

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()


def get_sqlalchemy_database_url(database_url: str) -> str:
    """
    Configure SQLAlchemy to use Psycopg 3.

    The existing Psycopg connectivity script can continue using
    a regular postgressql:// URL. SQLAlchemy needs the explicit
    postgresql+psycopg:// driver name.
    """

    url = make_url(database_url)

    if url.drivername in {"postgres", "postgresql"}:
        url = url.set(drivername="postgresql+psycopg")

    return url.render_as_string(hide_password=False)


SQLALCHEMY_DATABASE_URL = get_sqlalchemy_database_url(settings.database_url)

# engine manages connections and the connection pool.
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, echo=settings.debug)

# SessionLocal creates a new database Session whenever called.
SessionLocal = sessionmaker(
    bind=engine, class_=Session, autoflush=False, expire_on_commit=False
)
