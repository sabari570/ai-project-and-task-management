"""Label model and task-label association table."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Table,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# SYNTAX EXPLANATION:
#   This file defines both the labels table and the task_labels association table.
#   The association table uses (task_id, label_id) as a composite primary key.
#   PostgreSQL therefore rejects a second insertion of the same pair.

#   tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
#       "Task",
#       secondary=task_labels,
#       back_populates="labels",
#   )
#       This is a many-to-many relationship in SQLAlchemy.
#       It means one label can be associated with multiple tasks, and one task can have multiple labels.

# * secondary=task_labels
#       This is the important part.
#       It tells SQLAlchemy to use an intermediate/association table called task_labels to connect tasks and labels.
#       Why do we need this?
#       Because tasks and labels have a many-to-many relationship.

task_labels = Table(
    "task_labels",
    Base.metadata,
    Column(
        "task_id",
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    ),
    Column(
        "label_id",
        Uuid(as_uuid=True),
        ForeignKey("labels.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    ),
)

# Helps queries that find tasks using a particular label.
Index("ix_task_labels_label_id", task_labels.c.label_id)


class Label(Base):
    """A workspace-specific label that can be attached to tasks."""

    __tablename__ = "labels"

    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "name",
            name="uq_labels_workspace_name",
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
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    color: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    workspace: Mapped["Workspace"] = relationship(  # noqa: F821
        "Workspace",
        back_populates="labels",
    )

    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        "Task",
        secondary=task_labels,
        back_populates="labels",
    )
