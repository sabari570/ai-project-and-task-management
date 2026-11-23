"""Pydantic schemas for activity logs."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ActivityLogCreate(BaseModel):
    """Internal shape when recording activity (T046)."""

    workspace_id: UUID
    actor_id: UUID | None = None
    entity_type: str = Field(min_length=1, max_length=80)
    entity_id: UUID
    action: str = Field(min_length=1, max_length=100)
    activity_metadata: dict[str, Any] | None = None


class ActivityLogRead(BaseModel):
    """Activity log entry returned in a feed."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    workspace_id: UUID
    actor_id: UUID | None
    entity_type: str
    entity_id: UUID
    action: str
    activity_metadata: dict[str, Any] | None = None
    created_at: datetime