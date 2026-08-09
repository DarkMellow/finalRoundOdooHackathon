"""Create user_addresses table

Revision ID: 010_create_user_addresses_table
Revises: 009_add_addresses_json
Create Date: 2026-08-09 01:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '010_create_user_addresses_table'
down_revision: Union[str, None] = '009_add_addresses_json'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_addresses' not in inspector.get_table_names():
        op.create_table(
            'user_addresses',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('addresses_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index(op.f('ix_user_addresses_id'), 'user_addresses', ['id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_addresses' in inspector.get_table_names():
        op.drop_table('user_addresses')
