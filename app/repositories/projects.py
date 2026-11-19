"""Database queries for projects."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project


def list_projects_by_workspace(
    db: Session,
    workspace_id: UUID,
) -> list[Project]:
    """
    Return projects belonging to the specified workspace.

    The workspace filter is applied in the database query,
    not after loading projects into Python.
    """

    statement = (
        select(Project)
        .where(Project.workspace_id == workspace_id)
        .order_by(Project.created_at.desc())
    )

    return list(db.scalars(statement).all())