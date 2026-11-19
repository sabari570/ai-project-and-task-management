"""Task database model."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.comment import Comment
from app.models.label import Label, task_labels

# SYNTAX EXPLANATION:
    
#   ondelete defines what happens to a record when the referenced parent record is deleted. 
#   It does not define what happens when the task itself is deleted.

#       1. ondelete="RESTRICT"

#           creator_id: Mapped[UUID] = mapped_column(
#               Uuid(as_uuid=True),
#               ForeignKey("users.id", ondelete="RESTRICT"),
#               nullable=False,
#           )
#               Meaning: Prevent deleting a user if that user is referenced as the creator of an existing task.


#       2. ondelete="SET NULL"

#           assignee_id: Mapped[UUID | None] = mapped_column(
#               Uuid(as_uuid=True),
#               ForeignKey("users.id", ondelete="SET NULL"),
#               nullable=True,
#           )
#               Meaning: If a user is deleted, automatically set their assignee_id to NULL in the related tasks.

# * Understanding parent
#   parent: Mapped["Task | None"] = relationship(
#       "Task",
#       back_populates="subtasks",
#       remote_side="Task.id",
#   )

#       parent: Attribute name used to access the parent task.
#       Mapped["Task | None"]: This can contain a Task object or None.
#       relationship("Task"): Establishes a relationship with the same Task model.
#       back_populates="subtasks": Connects this relationship with the subtasks relationship.
#       remote_side="Task.id": Tells SQLAlchemy which Task.id belongs to the parent side of this self-referencing relationship.


# * Understanding subtasks
#   subtasks: Mapped[list["Task"]] = relationship(
#       "Task",
#       back_populates="parent",
#   )

#       subtasks: Attribute used to access all child tasks.
#       Mapped[list["Task"]]: Returns a list of Task objects.
#       relationship("Task"): Connects to the same Task model.
#       back_populates="parent": Connects this relationship to the parent attribute.

class Task(Base):
    """Database representation of a project task."""

    __tablename__ = "tasks"

    __table_args__ = (
        CheckConstraint(
            "status IN "
            "('backlog', 'todo', 'in_progress', 'blocked', 'done', 'cancelled')",
            name="ck_tasks_status",
        ),
        CheckConstraint(
            "priority IN ('low', 'normal', 'high', 'urgent')",
            name="ck_tasks_priority",
        ),
        CheckConstraint(
            "position >= 0",
            name="ck_tasks_position_nonnegative",
        ),
        CheckConstraint(
            "version >= 1",
            name="ck_tasks_version_positive",
        ),
        Index(
            "ix_tasks_project_status_position",
            "project_id",
            "status",
            "position",
        ),
        Index(
            "ix_tasks_assignee_status_due",
            "assignee_id",
            "status",
            "due_at",
        ),
        Index(
            "ix_tasks_project_created",
            "project_id",
            "created_at",
        ),
        Index(
            "ix_tasks_parent_task_id",
            "parent_task_id",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    parent_task_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(240),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="backlog",
        server_default="backlog",
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="normal",
        server_default="normal",
    )

    creator_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    assignee_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    due_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
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

    # Many tasks belong to one project.
    project: Mapped["Project"] = relationship(  # noqa: F821
        "Project",
        back_populates="tasks",
    )

    # A task can have one parent task and multiple subtasks.
    parent: Mapped["Task | None"] = relationship(
        "Task",
        back_populates="subtasks",
        remote_side="Task.id",
    )

    subtasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="parent",
    )

    # The user who created this task.
    creator: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="created_tasks",
        foreign_keys=[creator_id],
    )

    # The user assigned to this task, if any.
    assignee: Mapped["User | None"] = relationship(  # noqa: F821
        "User",
        back_populates="assigned_tasks",
        foreign_keys=[assignee_id],
    )
    
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="task",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    labels: Mapped[list["Label"]] = relationship(
        "Label",
        secondary=task_labels,
        back_populates="tasks",
    )