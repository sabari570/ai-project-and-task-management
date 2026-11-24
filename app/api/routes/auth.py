"""Authentication routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas import UserCreate, UserResponse
from app.services.auth import UserAlreadyExistsError, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
)
def register(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Create a user account with a hashed password."""
    try:
        user = register_user(
            db,
            email=str(payload.email),
            plain_password=payload.password.get_secret_value(),
            display_name=payload.display_name,
        )
    except UserAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return UserResponse.model_validate(user)