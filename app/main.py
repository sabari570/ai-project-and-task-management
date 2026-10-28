"""Minimal FastAPI application for Task T002."""

from fastapi import FastAPI

app = FastAPI(
    title="ProjectHub AI",
    description="ProjectHub AI backend — initial learning milestone.",
    version="0.1.0",
)


@app.get("/", tags=["General"])
def read_root() -> dict[str, str]:
    """Return a welcome message."""
    return {"message": "Welcome to ProjectHub AI"}


@app.get("/health", tags=["General"])
def health_check() -> dict[str, str]:
    """Report that the application is responding."""
    return {"status": "ok"}