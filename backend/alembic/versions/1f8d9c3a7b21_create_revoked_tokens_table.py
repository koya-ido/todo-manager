"""create revoked tokens table

Revision ID: 1f8d9c3a7b21
Revises: b7b3d37f5f44
Create Date: 2026-04-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1f8d9c3a7b21"
down_revision: Union[str, Sequence[str], None] = "b7b3d37f5f44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "revoked_tokens" not in inspector.get_table_names():
        op.create_table(
            "revoked_tokens",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("jti", sa.String(length=36), nullable=False),
            sa.Column("subject", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("revoked_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.Column("is_manual_logout", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = sa.inspect(bind)

    indexes = {index["name"] for index in inspector.get_indexes("revoked_tokens")}
    id_index_name = op.f("ix_revoked_tokens_id")
    jti_index_name = op.f("ix_revoked_tokens_jti")

    if id_index_name not in indexes:
        op.create_index(id_index_name, "revoked_tokens", ["id"], unique=False)
    if jti_index_name not in indexes:
        op.create_index(jti_index_name, "revoked_tokens", ["jti"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "revoked_tokens" not in inspector.get_table_names():
        return

    indexes = {index["name"] for index in inspector.get_indexes("revoked_tokens")}
    jti_index_name = op.f("ix_revoked_tokens_jti")
    id_index_name = op.f("ix_revoked_tokens_id")

    if jti_index_name in indexes:
        op.drop_index(jti_index_name, table_name="revoked_tokens")
    if id_index_name in indexes:
        op.drop_index(id_index_name, table_name="revoked_tokens")

    op.drop_table("revoked_tokens")
