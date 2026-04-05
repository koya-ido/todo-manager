"""add logical delete columns to users

Revision ID: 6c1f5f7b2e91
Revises: 1f8d9c3a7b21
Create Date: 2026-04-05 17:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6c1f5f7b2e91"
down_revision: Union[str, Sequence[str], None] = "1f8d9c3a7b21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("delete_flag", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "users",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "delete_flag")
