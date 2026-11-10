"""Combine versioned API route modules."""

from fastapi import APIRouter

from app.api.routes import projects, users, workspaces

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(workspaces.router)
api_router.include_router(projects.router)
api_router.include_router(users.router)
