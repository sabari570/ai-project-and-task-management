from fastapi import APIRouter

router = APIRouter(tags=["General"])


@router.get("/")
def read_root() -> dict[str, str]:
    """Return the application welcome message"""
    return {"message": "Welcome to ProjectHub AI"}


@router.get("/health")
def health_check() -> dict[str, str]:
    """Report that the application server is responding"""
    return {"status": "ok"}
