"""Application settings loaded from environment variables or .env."""

from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed configuration for ProjectHub AI."""
    
    app_env: str = "development"

    postgres_db: str = "projecthub"
    postgres_user: str = "projecthub_user"
    postgres_password: str

    database_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "ProjectHub AI"
    app_version: str = "0.1.0"
    environment: Literal["development", "testing", "production"] = "development"
    debug: bool = False

    # Options for local development; required in production
    secret_key: SecretStr | None = None

    @model_validator(mode="after")
    def required_production_secret(self) -> "Settings":
        if self.environment == "production" and self.secret_key is None:
            raise ValueError("SECRET_KEY must be set when ENVIRONMENT=production")

        if (
            self.environment == "production"
            and self.secret_key is not None
            and len(self.secret_key.get_secret_value()) < 32
        ):
            raise ValueError(
                "SECRET_KEY must contain at least 32 characters in production"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    "create settings once and reuse them across the application"
    return Settings()  # pyright: ignore[reportCallIssue]


settings = get_settings()
