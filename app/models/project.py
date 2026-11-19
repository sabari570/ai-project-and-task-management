"""Project database model."""

from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Project(Base):
    """Database representation of a workspace project."""

    __tablename__ = "projects"

    __table_args__ = (
        CheckConstraint(
            "status IN ('planned', 'active', 'on_hold', "
            "'completed', 'archived')",
            name="ck_projects_status",
        ),
        Index(
            "ix_projects_workspace_status_created",
            "workspace_id",
            "status",
            "created_at",
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

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="planned",
        server_default="planned",
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
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

    workspace: Mapped["Workspace"] = relationship(  # noqa: F821
        "Workspace",
        back_populates="projects",
    )

    creator: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="created_projects",
    )
    
    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )