"""ProjectHub AI API — T004 in-memory workspace and project CRUD."""

from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Path, Query, Response, status

from app.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)

app = FastAPI(
    title="ProjectHub AI",
    description="ProjectHub AI backend — in-memory workspace and project CRUD.",
    version="0.1.0",
)


# -------------------------------------------------------------------
# Temporary in-memory storage
# -------------------------------------------------------------------
# These dictionaries exist only while this Python process is running.
# Restarting the application clears all stored workspaces and projects.

workspaces: dict[UUID, WorkspaceResponse] = {}
projects: dict[UUID, ProjectResponse] = {}


def current_time() -> datetime:
    """Return the current timezone-aware UTC time."""
    return datetime.now(timezone.utc)


def get_workspace_or_404(workspace_id: UUID) -> WorkspaceResponse:
    """Find a workspace or raise HTTP 404."""
    workspace = workspaces.get(workspace_id)

    if workspace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return workspace


def get_project_or_404(project_id: UUID) -> ProjectResponse:
    """Find a project or raise HTTP 404."""
    project = projects.get(project_id)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


def ensure_unique_slug(slug: str, exclude_id: UUID | None = None) -> None:
    """Ensure that no other workspace uses this slug."""
    for workspace in workspaces.values():
        if workspace.slug == slug and workspace.id != exclude_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Workspace slug already exists",
            )


# -------------------------------------------------------------------
# General endpoints — retained from earlier tasks
# -------------------------------------------------------------------

@app.get("/", tags=["General"])
def read_root() -> dict[str, str]:
    return {"message": "Welcome to ProjectHub AI"}


@app.get("/health", tags=["General"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


# -------------------------------------------------------------------
# Workspace CRUD
# -------------------------------------------------------------------

@app.post(
    "/workspaces",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Workspaces"],
)
def create_workspace(payload: WorkspaceCreate) -> WorkspaceResponse:
    """Create a workspace."""
    ensure_unique_slug(payload.slug)

    now = current_time()

    workspace = WorkspaceResponse(
        id=uuid4(),
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        created_at=now,
        updated_at=now,
    )

    workspaces[workspace.id] = workspace
    return workspace


@app.get(
    "/workspaces",
    response_model=list[WorkspaceResponse],
    tags=["Workspaces"],
)
def list_workspaces() -> list[WorkspaceResponse]:
    """Return all workspaces currently in memory."""
    return list(workspaces.values())


@app.get(
    "/workspaces/{workspace_id}",
    response_model=WorkspaceResponse,
    tags=["Workspaces"],
)
def get_workspace(
    workspace_id: Annotated[UUID, Path(description="Workspace UUID")],
) -> WorkspaceResponse:
    """Get one workspace by ID."""
    return get_workspace_or_404(workspace_id)


@app.patch(
    "/workspaces/{workspace_id}",
    response_model=WorkspaceResponse,
    tags=["Workspaces"],
)
def update_workspace(
    workspace_id: Annotated[UUID, Path(description="Workspace UUID")],
    payload: WorkspaceUpdate,
) -> WorkspaceResponse:
    """Update selected workspace fields."""
    existing = get_workspace_or_404(workspace_id)
    changes = payload.model_dump(exclude_unset=True)

    new_slug = changes.get("slug")
    if new_slug is not None:
        ensure_unique_slug(new_slug, exclude_id=workspace_id)

    updated = existing.model_copy(
        update={
            **changes,
            "updated_at": current_time(),
        }
    )

    workspaces[workspace_id] = updated
    return updated


@app.delete(
    "/workspaces/{workspace_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    tags=["Workspaces"],
)
def delete_workspace(
    workspace_id: Annotated[UUID, Path(description="Workspace UUID")],
) -> Response:
    """Delete a workspace and its in-memory projects."""
    get_workspace_or_404(workspace_id)

    del workspaces[workspace_id]

    # A project's workspace is removed with its parent workspace.
    project_ids = [
        project_id
        for project_id, project in projects.items()
        if project.workspace_id == workspace_id
    ]

    for project_id in project_ids:
        del projects[project_id]

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# -------------------------------------------------------------------
# Project CRUD
# -------------------------------------------------------------------

@app.post(
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Projects"],
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


@app.get(
    "/workspaces/{workspace_id}/projects",
    response_model=list[ProjectResponse],
    tags=["Projects"],
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

    results = [
        project
        for project in projects.values()
        if project.workspace_id == workspace_id
    ]

    if project_status is not None:
        allowed_statuses = {
            "planned",
            "active",
            "on_hold",
            "completed",
            "archived",
        }

        if project_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid project status",
            )

        results = [
            project
            for project in results
            if project.status == project_status
        ]

    return results


@app.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["Projects"],
)
def get_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
) -> ProjectResponse:
    """Get one project by ID."""
    return get_project_or_404(project_id)


@app.patch(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["Projects"],
)
def update_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
    payload: ProjectUpdate,
) -> ProjectResponse:
    """Update selected project fields."""
    existing = get_project_or_404(project_id)
    changes = payload.model_dump(exclude_unset=True)

    # Validate the combined old and new values, not only the patch body.
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


@app.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    tags=["Projects"],
)
def delete_project(
    project_id: Annotated[UUID, Path(description="Project UUID")],
) -> Response:
    """Delete one project."""
    get_project_or_404(project_id)
    del projects[project_id]

    return Response(status_code=status.HTTP_204_NO_CONTENT)