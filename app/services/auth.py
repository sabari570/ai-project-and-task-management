"""Authentication-related business operations."""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.services.users import UserAlreadyExistsError, create_user


def register_user(
    db: Session,
    *,
    email: str,
    plain_password: str,
    display_name: str,
) -> User:
    """Register a new user with a hashed password."""
    password_hash = hash_password(plain_password)

    return create_user(
        db,
        email=email,
        password_hash=password_hash,
        display_name=display_name,
    )


__all__ = ["UserAlreadyExistsError", "register_user"]