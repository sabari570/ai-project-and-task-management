
"""Pydantic schemas for task comments."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreate(BaseModel):
    """Fields accepted when creating a comment."""

    body: str = Field(min_length=1)

    @field_validator("body")
    @classmethod
    def validate_body(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Comment body cannot be empty.")

        return value


class CommentUpdate(BaseModel):
    """Fields accepted when editing a comment."""

    body: str = Field(min_length=1)

    @field_validator("body")
    @classmethod
    def validate_body(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Comment body cannot be empty.")

        return value


class CommentRead(BaseModel):
    """Comment response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    author_id: UUID
    body: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
