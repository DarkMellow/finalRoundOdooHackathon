"""Create wishlists table

Revision ID: 013_create_wishlists_table
Revises: 012_create_user_cards_table
Create Date: 2026-08-09 02:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '013_create_wishlists_table'
down_revision: Union[str, None] = '012_create_user_cards_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'wishlists' not in inspector.get_table_names():
        op.create_table(
            'wishlists',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('items_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index(op.f('ix_wishlists_id'), 'wishlists', ['id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'wishlists' in inspector.get_table_names():
        op.drop_table('wishlists')
