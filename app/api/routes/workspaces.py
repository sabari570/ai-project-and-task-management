"""Workspace API routes."""

from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Path, Response, status

from app.schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)
from app.store import projects, workspaces

router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"],
)


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


def ensure_unique_slug(
    slug: str,
    exclude_id: UUID | None = None,
) -> None:
    """Prevent two workspaces from using the same slug."""
    for workspace in workspaces.values():
        if workspace.slug == slug and workspace.id != exclude_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Workspace slug already exists",
            )


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
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


@router.get(
    "",
    response_model=list[WorkspaceResponse],
)
def list_workspaces() -> list[WorkspaceResponse]:
    """List all workspaces currently in memory."""
    return list(workspaces.values())


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
)
def get_workspace(
    workspace_id: Annotated[UUID, Path(description="Workspace UUID")],
) -> WorkspaceResponse:
    """Get a workspace by ID."""
    return get_workspace_or_404(workspace_id)


@router.patch(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
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


@router.delete(
    "/{workspace_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_workspace(
    workspace_id: Annotated[UUID, Path(description="Workspace UUID")],
) -> Response:
    """Delete a workspace and its projects."""
    get_workspace_or_404(workspace_id)

    del workspaces[workspace_id]

    project_ids = [
        project_id
        for project_id, project in projects.items()
        if project.workspace_id == workspace_id
    ]

    for project_id in project_ids:
        del projects[project_id]

    return Response(status_code=status.HTTP_204_NO_CONTENT)