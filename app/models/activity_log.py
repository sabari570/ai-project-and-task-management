"""Workspace activity and audit log model."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ActivityLog(Base):
    """
    Records an action in a workspace.

    entity_id is polymorphic (no FK). Pair (entity_type, entity_id) is validated in services.
    """

    __tablename__ = "activity_logs"

    __table_args__ = (
        Index(
            "ix_activity_logs_workspace_created",
            "workspace_id",
            "created_at",
            postgresql_ops={"created_at": "DESC"},
        ),
        Index(
            "ix_activity_logs_entity_created",
            "entity_type",
            "entity_id",
            "created_at",
            postgresql_ops={"created_at": "DESC"},
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

    actor_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    entity_type: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    entity_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


#   when a user moves a task from todo to in_progress, you might save a row with action="task.status_changed", entity_type="task", 
#   entity_id=<task uuid>, and activity_metadata={"from": "todo", "to": "in_progress"}. 
#   The feed can show the action from the main fields and the change from the JSON without adding new columns for every kind of event. 
#   It can be null when there is nothing extra to record.
    activity_metadata: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    workspace: Mapped["Workspace"] = relationship(  # noqa: F821  # pyright: ignore[reportUndefinedVariable]
        "Workspace",
        back_populates="activity_logs",
    )

    actor: Mapped["User | None"] = relationship(  # noqa: F821  # pyright: ignore[reportUndefinedVariable]
        "User",
        back_populates="activity_logs",
        foreign_keys=[actor_id],
    )