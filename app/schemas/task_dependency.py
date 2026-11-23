"""Pydantic schemas for task dependencies."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, model_validator


class TaskDependencyCreate(BaseModel):
    """Input for adding a dependency edge."""

    depends_on_task_id: UUID

    @model_validator(mode="after")
    def validate_not_empty_id(self):
        if not self.depends_on_task_id:
            raise ValueError("depends_on_task_id is required.")
        return self


class TaskDependencyRead(BaseModel):
    """One dependency edge returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    task_id: UUID
    depends_on_task_id: UUID
    created_at: datetime