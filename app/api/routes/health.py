from fastapi import APIRouter, HTTPException

from app.scripts.check_db import check_database_connection

router = APIRouter(tags=["General"])


@router.get("/")
def read_root() -> dict[str, str]:
    """Return the application welcome message"""
    return {"message": "Welcome to ProjectHub AI"}


@router.get("/health")
def health_check() -> dict[str, str]:
    """Report that the application server is responding"""
    return {"status": "ok"}

@router.get("/health/db")
def database_health() -> dict[str, str]:
    if not check_database_connection():
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        )

    return {"status": "connected"}
