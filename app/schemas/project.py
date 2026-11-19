"""Pydantic schemas for projects."""

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import Field, model_validator

from app.schemas.base import APIModel

ProjectStatus = Literal[
    "planned",
    "active",
    "on_hold",
    "completed",
    "archived",
]


class ProjectCreate(APIModel):
    """Fields required when creating a project."""

    name: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=4000)
    status: ProjectStatus = "planned"
    start_date: date | None = None
    due_date: date | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.due_date is not None
            and self.due_date < self.start_date
        ):
            raise ValueError("due_date cannot be earlier than start_date")
        return self


class ProjectUpdate(APIModel):
    """Fields that can be changed on an existing project."""

    name: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=4000)
    status: ProjectStatus | None = None
    start_date: date | None = None
    due_date: date | None = None

    @model_validator(mode="after")
    def validate_not_empty(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update")
        return self


class ProjectResponse(APIModel):
    """Project data returned by the API."""

    id: UUID
    workspace_id: UUID
    name: str
    description: str | None
    status: ProjectStatus
    start_date: date | None
    due_date: date | None
    created_at: datetime
    updated_at: datetime