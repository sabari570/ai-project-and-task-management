"""Pydantic schemas for workspace invitations."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

WorkspaceRole = Literal["owner", "admin", "member", "viewer"]


class WorkspaceInvitationCreate(BaseModel):
    """Fields used when creating an invitation (API comes in T040)."""

    invited_email: EmailStr
    role: WorkspaceRole = "member"
    expires_at: datetime

    @field_validator("invited_email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class WorkspaceInvitationRead(BaseModel):
    """Invitation returned by the API (never includes token_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    invited_email: str
    role: WorkspaceRole
    invited_by: UUID
    expires_at: datetime
    accepted_at: datetime | None
    created_at: datetime