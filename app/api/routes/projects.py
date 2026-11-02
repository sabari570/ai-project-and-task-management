"""Project API routes."""

from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Path, Query, Response, status

from app.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.store import projects, workspaces

router = APIRouter(tags=["Projects"])


def current_time() -> datetime:
    """Return the current timezone-aware UTC time."""
    return datetime.now(timezone.utc)


def get_workspace_or_404(workspace_id: UUID) -> None:
    """Ensure that the parent workspace exists."""
    if workspace_id not in workspaces:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )


def get_project_or_404(project_id: UUID) -> ProjectResponse:
    """Find a project or raise HTTP 404."""
    project = projects.get(project_id)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


@router.post(
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    workspace_id: Annotated[UUID, Path(description="Parent workspace UUID")],
    payload: ProjectCreate,
) -> ProjectResponse:
    """Create a project inside an existing workspace."""
    get_workspace_or_404(workspace_id)

    now = current_time()

    project = ProjectResponse(
        id=uuid4(),
        workspace_id=workspace_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        start_date=payload.start_date,
        due_date=payload.due_date,
        created_at=now,
        updated_at=now,
    )

    projects[project.id] = project
    return project


@router.get(
    "/workspaces/{workspace_id}/projects",
    response_model=list[ProjectResponse],
)
def list_workspace_projects(
    workspace_id: Annotated[UUID, Path(description="Parent workspace UUID")],
    project_status: Annotated[
        str | None,
        Query(alias="status", description="Optional project status filter"),
    ] = None,
) -> list[ProjectResponse]:
    """List projects in a workspace, optionally filtering by status."""
    get_workspace_or_404(workspace_id)

    allowed_statuses = {
        "planned",
        "active",
        "on_hold",
        "completed",
        "archived",
    }

    if project_status is not None and project_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid project status",
        )

    results = [
        project
        for project in projects.values()
        if project.workspace_id == workspace_id
    ]

    if project_status is not None:
        results = [
            project
            for project in results
            if project.status == project_status
        ]

    return results


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
) -> ProjectResponse:
    """Get one project by ID."""
    return get_project_or_404(project_id)


@router.patch(
    "/projects/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
    payload: ProjectUpdate,
) -> ProjectResponse:
    """Update selected project fields."""
    existing = get_project_or_404(project_id)
    changes = payload.model_dump(exclude_unset=True)

    combined_data = {
        "name": existing.name,
        "description": existing.description,
        "status": existing.status,
        "start_date": existing.start_date,
        "due_date": existing.due_date,
    }
    combined_data.update(changes)

    validated = ProjectCreate.model_validate(combined_data)

    updated = existing.model_copy(
        update={
            **validated.model_dump(),
            "updated_at": current_time(),
        }
    )

    projects[project_id] = updated
    return updated


@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
) -> Response:
    """Delete one project."""
    get_project_or_404(project_id)
    del projects[project_id]

    return Response(status_code=status.HTTP_204_NO_CONTENT)