"""align task and comment column lengths

Revision ID: 3d2b8a4c9f10
Revises: 6c1f5f7b2e91
Create Date: 2026-04-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3d2b8a4c9f10"
down_revision: Union[str, Sequence[str], None] = "6c1f5f7b2e91"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "tasks",
        "position",
        existing_type=sa.Integer(),
        type_=sa.SmallInteger(),
        existing_nullable=False,
    )
    op.alter_column(
        "tasks",
        "title",
        existing_type=sa.String(length=255),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
    op.alter_column(
        "tasks",
        "content",
        existing_type=sa.Text(),
        type_=sa.String(length=800),
        existing_nullable=True,
    )
    op.alter_column(
        "comments",
        "comment",
        existing_type=sa.Text(),
        type_=sa.String(length=800),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "comments",
        "comment",
        existing_type=sa.String(length=800),
        type_=sa.Text(),
        existing_nullable=False,
    )
    op.alter_column(
        "tasks",
        "content",
        existing_type=sa.String(length=800),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "tasks",
        "title",
        existing_type=sa.String(length=50),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        "tasks",
        "position",
        existing_type=sa.SmallInteger(),
        type_=sa.Integer(),
        existing_nullable=False,
    )
