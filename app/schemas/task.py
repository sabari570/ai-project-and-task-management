"""Pydantic schemas for tasks."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

TaskStatus = Literal[
    "backlog",
    "todo",
    "in_progress",
    "blocked",
    "done",
    "cancelled",
]

TaskPriority = Literal[
    "low",
    "normal",
    "high",
    "urgent",
]


class TaskCreate(BaseModel):
    """Schema for creating a task."""

    project_id: UUID

    parent_task_id: UUID | None = None

    title: str = Field(
        min_length=1,
        max_length=240,
    )

    description: str | None = None

    status: TaskStatus = "backlog"

    priority: TaskPriority = "normal"

    assignee_id: UUID | None = None

    due_at: datetime | None = None

    position: int = Field(
        default=0,
        ge=0,
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        """Remove unnecessary spaces from the title."""

        cleaned_value = value.strip()

        if not cleaned_value:
            raise ValueError("Task title cannot be empty.")

        return cleaned_value


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    parent_task_id: UUID | None = None

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=240,
    )

    description: str | None = None

    status: TaskStatus | None = None

    priority: TaskPriority | None = None

    assignee_id: UUID | None = None

    due_at: datetime | None = None

    position: int | None = Field(
        default=None,
        ge=0,
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        """Normalize the title when supplied."""

        if value is None:
            return None

        cleaned_value = value.strip()

        if not cleaned_value:
            raise ValueError("Task title cannot be empty.")

        return cleaned_value
    
    @model_validator(mode="after")
    def validate_non_nullable_fields(self):
        """Reject null values for non-nullable update fields."""

        non_nullable_fields = (
            "title",
            "status",
            "priority",
            "position",
        )

        for field_name in non_nullable_fields:
            if (
                field_name in self.model_fields_set
                and getattr(self, field_name) is None
            ):
                raise ValueError(
                    f"{field_name} cannot be null."
                )

        return self


class TaskRead(BaseModel):
    """Schema for returning task information."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    project_id: UUID

    parent_task_id: UUID | None

    title: str

    description: str | None

    status: TaskStatus

    priority: TaskPriority

    creator_id: UUID

    assignee_id: UUID | None

    due_at: datetime | None

    position: int

    version: int

    created_at: datetime

    updated_at: datetime
