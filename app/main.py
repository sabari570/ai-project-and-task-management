"""ProjectHub AI FastAPI application entry point."""

from fastapi import FastAPI

from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers

app = FastAPI(
    title=settings.app_name,
    description="ProjectHub AI backend — versioned API with modular routers.",
    version=settings.app_version,
    debug=settings.debug,
)

# Register consistent error responses.
register_exception_handlers(app)

# General and health routes remain outside the versioned API.
app.include_router(health_router)

# Workspace and project routes use the /api/v1 prefix.
app.include_router(api_router)
