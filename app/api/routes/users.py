"""User API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas import UserResponse, UserUpdate
from app.services.users import (
    UserAlreadyExistsError,
    delete_user,
    get_user,
    list_users,
    update_user,
)

router = APIRouter(prefix="/users", tags=["Users"])

# The db instance in the function is obtained from the get_db dependency, which is a function that provides a database session.
@router.get("", response_model=list[UserResponse])
def read_users(
    db: Annotated[Session, Depends(get_db)],
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[UserResponse]:
    """List users with pagination"""
    return list_users(db, offset=offset, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def read_user(
    user_id: Annotated[UUID, Path(description="User UUID")],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Get one user."""
    user = get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def edit_user(
    user_id: Annotated[UUID, Path(description="User UUID")],
    payload: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Update a user's email or display name."""
    changes = payload.model_dump(exclude_unset=True)

    try:
        user = update_user(db, user_id, changes)
    except UserAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_user(
    user_id: Annotated[UUID, Path(description="User UUID")],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    """Delete a user."""
    deleted = delete_user(db, user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)