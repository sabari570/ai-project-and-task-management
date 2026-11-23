"""Pydantic schemas for task attachments."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AttachmentCreate(BaseModel):
    """
    Client-supplied metadata for an upload.

    storage_key and checksum are set by the server in T045.
    """

    original_filename: str = Field(min_length=1, max_length=255)
    content_type: str | None = Field(default=None, max_length=150)
    size_bytes: int = Field(ge=1)


class AttachmentRead(BaseModel):
    """Attachment metadata returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    uploaded_by: UUID
    storage_key: str
    original_filename: str
    content_type: str | None
    size_bytes: int
    checksum: str | None
    created_at: datetime