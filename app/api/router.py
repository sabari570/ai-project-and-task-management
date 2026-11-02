"""Combine versioned API route modules."""

from fastapi import APIRouter

from app.api.routes import projects, workspaces

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(workspaces.router)
api_router.include_router(projects.router)
