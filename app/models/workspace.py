
"""Workspace and workspace membership database models."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.db.base import Base


class Workspace(Base):
    """Database representation of a workspace."""

    __tablename__ = "workspaces"

    __table_args__ = (
        UniqueConstraint("slug", name="uq_workspaces_slug"),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    creator: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="created_workspaces",
    )

    memberships: Mapped[list["WorkspaceMembership"]] = relationship(
        back_populates="workspace",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @validates("slug")
    def normalize_slug(self, key: str, value: str) -> str:
        """Normalize slug values."""
        return value.strip().lower()


class WorkspaceMembership(Base):
    """Connects users to workspaces and stores their roles."""

    __tablename__ = "workspace_memberships"

    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "user_id",
            name="uq_workspace_memberships_workspace_user",
        ),
        CheckConstraint(
            "role IN ('owner', 'admin', 'member', 'viewer')",
            name="ck_workspace_memberships_role",
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

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
        server_default="member",
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    workspace: Mapped["Workspace"] = relationship(
        back_populates="memberships",
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        back_populates="workspace_memberships",
    )

    @validates("role")
    def validate_role(self, key: str, value: str) -> str:
        """Validate membership roles."""
        allowed_roles = {"owner", "admin", "member", "viewer"}

        if value not in allowed_roles:
            raise ValueError(
                f"Invalid workspace role: {value}"
            )

        return value
