"""Task-to-task dependency rows."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TaskDependency(Base):
    """
    One dependency edge: task_id depends on depends_on_task_id.

    Example: (A, B) means task A depends on task B.
    """

    __tablename__ = "task_dependencies"

    __table_args__ = (
        CheckConstraint(
            "task_id <> depends_on_task_id",
            name="ck_task_dependencies_no_self",
        ),
        Index(
            "ix_task_dependencies_depends_on_task_id",
            "depends_on_task_id",
        ),
    )

    task_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    depends_on_task_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    task: Mapped["Task"] = relationship(  # noqa: F821
        "Task",
        back_populates="dependency_links",
        foreign_keys=[task_id],
    )

    depends_on_task: Mapped["Task"] = relationship(  # noqa: F821
        "Task",
        back_populates="prerequisite_links",
        foreign_keys=[depends_on_task_id],
    )