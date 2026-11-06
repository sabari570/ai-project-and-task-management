"""Pydantic request and response schemas for ProjectHub AI."""

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    field_validator,
    model_validator,
)

# SYNTAX EXPLANATIONS:

#   ConfigDict() is used to configure the behaviour of a Pydantic model.
#         * extra="forbid"
#             This tells Pydantic:
#             Do not allow any additional fields that are not defined in the model.


#         * from_attributes=True
#             This tells Pydantic:
#             Allow me to create a Pydantic model using attributes from a Python object, instead of requiring a dictionary.

# -------------------------------------------------------------------
# Shared configuration
# -------------------------------------------------------------------

class APIModel(BaseModel):
    """Base model that rejects unexpected request fields."""

    model_config = ConfigDict(extra="forbid")


# -------------------------------------------------------------------
# User schemas
# -------------------------------------------------------------------

class UserCreate(APIModel):
    """Validated input for creating a user."""

    email: EmailStr
    password: SecretStr
    display_name: str = Field(min_length=1, max_length=120)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        """Trim and lowercase email before validation."""
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("display_name")
    @classmethod
    def normalize_display_name(cls, value: str) -> str:
        """Remove leading and trailing whitespace."""
        value = value.strip()

        if not value:
            raise ValueError("Display name cannot be empty")

        return value


class UserResponse(APIModel):
    """Public user data returned by the API."""

    model_config = ConfigDict(
        extra="forbid",
        from_attributes=True,
    )

    id: UUID
    email: EmailStr
    display_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------------
# Workspace schemas
# -------------------------------------------------------------------

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


# -------------------------------------------------------------------
# Project schemas
# -------------------------------------------------------------------

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


class ProjectResponse(BaseModel):
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
