
"""Pydantic schemas for workspace labels."""

from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class LabelCreate(BaseModel):
    """Fields accepted when creating a label."""

    name: str = Field(min_length=1, max_length=60)
    color: str | None = Field(default=None, max_length=20)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Label name cannot be empty.")

        return value


class LabelUpdate(BaseModel):
    """Fields accepted when updating a label."""

    name: str | None = Field(default=None, min_length=1, max_length=60)
    color: str | None = Field(default=None, max_length=20)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Label name cannot be empty.")

        return value
    
    @model_validator(mode="after")
    def validate_non_nullable_name(self):
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("Label name cannot be null.")
        return self


class LabelRead(BaseModel):
    """Label response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    name: str
    color: str | None
    created_at: datetime
