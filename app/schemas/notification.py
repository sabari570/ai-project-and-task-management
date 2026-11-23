"""Pydantic schemas for notifications."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    """Internal shape when creating a notification (T047)."""

    recipient_id: UUID
    workspace_id: UUID | None = None
    type: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    body: str | None = None
    payload: dict[str, Any] | None = None


class NotificationRead(BaseModel):
    """Notification returned to the recipient."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    recipient_id: UUID
    workspace_id: UUID | None
    type: str
    title: str
    body: str | None
    payload: dict[str, Any] | None
    read_at: datetime | None
    created_at: datetime


class NotificationMarkRead(BaseModel):
    """Patch body for mark read/unread (T047)."""

    read: bool = True