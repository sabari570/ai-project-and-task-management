"""Create users table.

Revision ID: 20261106_01
Revises:
Create Date: 2026-11-06
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# Revision identifiers.
revision: str = "20261106_01"

down_revision: str | None = None

branch_labels: str | Sequence[str] | None = None

depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the users table."""

    op.create_table(
        "users",

        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "email",
            sa.String(length=320),
            nullable=False,
        ),

        sa.Column(
            "password_hash",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "display_name",
            sa.String(length=120),
            nullable=False,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),

        sa.Column(
            "is_verified",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint(
            "email",
            name="uq_users_email",
        ),
    )


def downgrade() -> None:
    """Remove the users table."""

    op.drop_table("users")