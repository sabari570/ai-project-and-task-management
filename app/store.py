"""Temporary in-memory storage shared by API route modules."""

from uuid import UUID

from app.schemas import ProjectResponse, WorkspaceResponse

workspaces: dict[UUID, WorkspaceResponse] = {}
projects: dict[UUID, ProjectResponse] = {}