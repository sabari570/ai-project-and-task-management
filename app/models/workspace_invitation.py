"""Workspace invitation database model."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.db.base import Base


class WorkspaceInvitation(Base):
    """
    Pending or accepted invitation to join a workspace.

    Only token_hash is stored. Raw tokens are handled in T040.
    """

    __tablename__ = "workspace_invitations"

    __table_args__ = (
        CheckConstraint(
            "role IN ('owner', 'admin', 'member', 'viewer')",
            name="ck_workspace_invitations_role",
        ),
        Index(
            "uq_workspace_invitations_workspace_email_pending",
            "workspace_id",
            "invited_email",
            unique=True,
            postgresql_where=text("accepted_at IS NULL"),
        ),
        Index(
            "ix_workspace_invitations_workspace_id",
            "workspace_id",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    workspace_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )

    invited_email: Mapped[str] = mapped_column(
        String(320),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
        server_default="member",
    )

    token_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    invited_by: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    workspace: Mapped["Workspace"] = relationship(  # noqa: F821  # pyright: ignore[reportUndefinedVariable]
        "Workspace",
        back_populates="invitations",
    )

    inviter: Mapped["User"] = relationship(  # noqa: F821  # pyright: ignore[reportUndefinedVariable]
        "User",
        back_populates="sent_workspace_invitations",
        foreign_keys=[invited_by],
    )

    @validates("invited_email")
    def normalize_invited_email(self, key: str, value: str) -> str:
        return value.strip().lower()

    @validates("role")
    def validate_role(self, key: str, value: str) -> str:
        allowed = {"owner", "admin", "member", "viewer"}
        if value not in allowed:
            raise ValueError(f"Invalid invitation role: {value}")
        return value