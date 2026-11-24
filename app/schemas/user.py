"""Pydantic schemas for users."""

from datetime import datetime
from uuid import UUID

from pydantic import (
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    field_validator,
    model_validator,
)

from app.schemas.base import APIModel

# SYNTAX EXPLANATIONS:

#   ConfigDict() is used to configure the behaviour of a Pydantic model.
#         * extra="forbid"
#             This tells Pydantic:
#             Do not allow any additional fields that are not defined in the model.


#         * from_attributes=True
#             This tells Pydantic:
#             Allow me to create a Pydantic model using attributes from a Python object, instead of requiring a dictionary.

# -------------------------------------------------------------------
# User schemas
# -------------------------------------------------------------------


class UserCreate(APIModel):
    """Validated input for creating a user."""

    email: EmailStr
    password: SecretStr = Field(min_length=8, max_length=128)
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


class UserUpdate(APIModel):
    """Validated input for updating a user."""
    email: EmailStr | None = None
    display_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120
    )
    
    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        """Trim and lowercase email."""
        if isinstance(value, str):
            return value.strip().lower()

        return value

    @field_validator("display_name")
    @classmethod
    def normalize_display_name(
        cls,
        value: str | None,
    ) -> str | None:
        """Trim display name and reject blank values."""
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("Display name cannot be empty")

        return value

    @model_validator(mode="after")
    def validate_update(self):
        """Require at least one non-null field."""
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update")

        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")

        return self