"""User database model."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.db.base import Base
from app.models.project import Project
from app.models.task import Task
from app.models.workspace import Workspace, WorkspaceMembership

# TERMS EXPLANATION:
#
#   1. Mapped[str]
#       This tells SQLAlchemy that:
#       - Mapped means this Python attribute is mapped to a database column.
#       - str means the value stored in this column should be a Python string.
#       In simple terms:

#       The id variable represents a database column that stores string values.
#
#   2. = mapped_column(...)
#       mapped_column() tells SQLAlchemy to create the actual database column configuration.

#   3. @validates("email")
#       This is a SQLAlchemy validation decorator.
#       It tells SQLAlchemy:
#       "Whenever someone assigns a new value to the email attribute of this model, execute the function below."

class User(Base):
    """Database representation of an application user."""

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint(
            "email",
            name="uq_users_email",
        ),
    )
    # Primary key: every user gets a unique UUID.
    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
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

    created_workspaces: Mapped[list["Workspace"]] = relationship(
        "Workspace", back_populates="creator"
    )

    workspace_memberships: Mapped[list["WorkspaceMembership"]] = relationship(
        "WorkspaceMembership",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    
    created_projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="creator",
    )
    
    created_tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="creator",
        foreign_keys="Task.creator_id",
        passive_deletes="all",
    )

    assigned_tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="assignee",
        foreign_keys="Task.assignee_id",
        passive_deletes=True,
    )

    @validates("email")
    def normalize_email(self, key: str, value: str) -> str:
        """Normalize email whenever it is assigned through the ORM."""
        return value.strip().lower()
