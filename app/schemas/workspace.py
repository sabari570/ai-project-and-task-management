"""Pydantic schemas for workspaces."""

from datetime import datetime
from uuid import UUID

from pydantic import Field, model_validator

from app.schemas.base import APIModel


class WorkspaceCreate(APIModel):
    """Fields required when creating a workspace."""

    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(
        min_length=2,
        max_length=180,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="Lowercase URL-friendly workspace identifier",
    )
    description: str | None = Field(default=None, max_length=2000)


class WorkspaceUpdate(APIModel):
    """Fields that can be changed on an existing workspace."""

    name: str | None = Field(default=None, min_length=2, max_length=160)
    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=180,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    description: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_not_empty(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update")
        return self


class WorkspaceResponse(APIModel):
    """Workspace data returned by the API."""

    id: UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime
    updated_at: datetime