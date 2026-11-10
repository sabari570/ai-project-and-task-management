"""Database operations for users."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User


class UserAlreadyExistsError(Exception):
    """Raised when a user email already exists."""


def commit_or_rollback(db: Session) -> None:
    """
    Commit the current database transaction.

    Roll back if the database rejects the operation.
    The current users table has a unique email constraint.
    """
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise UserAlreadyExistsError("A user with this email already exists") from exc
    except Exception:
        db.rollback()
        raise


def create_user(
    db: Session, *, email: str, password_hash: str, display_name: str
) -> User:
    """
    Create a user using an already-hashed password.
    Password hashing and public registration are handled in T030.
    """
    if not password_hash:
        raise ValueError("password_hash cannot be empty")

    user = User(email=email, password_hash=password_hash, display_name=display_name)

    db.add(user)
    commit_or_rollback(db)
    db.refresh(user)

    return user


def get_user(db: Session, user_id: UUID) -> User | None:
    """find one user by UUID"""
    return db.get(User, user_id)


def list_users(
    db: Session,
    *,
    offset: int = 0,
    limit: int = 50,
) -> list[User]:
    """Return users in deterministic order with pagination."""
    statement = (
        select(User).order_by(User.created_at, User.id).offset(offset).limit(limit)
    )

    return list(db.scalars(statement).all())


def update_user(db: Session, user_id: UUID, changes: dict[str, object]) -> User | None:
    """Update the permitted user fields."""
    allowed_fields = {"email", "display_name"}

    if not set(changes).issubset(allowed_fields):
        raise ValueError("Unsupported user update field")

    user = db.get(User, user_id)

    if user is None:
        return None

    for field, value in changes.items():
        setattr(user, field, value)

    commit_or_rollback(db)
    db.refresh(user)

    return user


def delete_user(db: Session, user_id: UUID) -> bool:
    """Delete a user. Return False if the user does not exist."""
    user = db.get(User, user_id)

    if user is None:
        return False

    db.delete(user)
    commit_or_rollback(db)

    return True
