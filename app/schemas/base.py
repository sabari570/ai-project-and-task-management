"""Shared Pydantic schema configuration."""

from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    """Base model that rejects unexpected request fields."""

    model_config = ConfigDict(extra="forbid")