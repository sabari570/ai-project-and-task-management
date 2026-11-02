"""Common API error response and exception handlers."""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def error_response(status_code: int, code: str, message: str, details: Any = None):
    """Build the common error response format."""
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register application-wide exception handlers."""

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        """convert HTTP errors into the common response format."""
        error_codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
        }

        message = (
            exc.detail
            if isinstance(exc.detail, str)
            else "The request could not be completed"
        )

        return error_response(
            status_code=exc.status_code,
            code=error_codes.get(exc.status_code, "HTTP_ERROR"),
            message=message,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_exception(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Return validation errors in a predictable structure"""
        details = [
            {
                "location": list(error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
            for error in exc.errors()
        ]

        return error_response(status_code=422, code="VALIDATION_ERROR", details=details)
    
    @app.exception_handler(Exception)
    async def handle_unexpected_exception(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        """Hide internal exception details from API clients."""
        logger.exception(
            "Unhandled application error",
            exc_info=exc,
        )

        return error_response(
            status_code=500,
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred",
        )