"""Update user_addresses table to normalized address schema

Revision ID: 011_normalized_user_addresses
Revises: 010_create_user_addresses_table
Create Date: 2026-08-09 01:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '011_normalized_user_addresses'
down_revision: Union[str, None] = '010_create_user_addresses_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_addresses' in inspector.get_table_names():
        op.drop_table('user_addresses')

    op.create_table(
        'user_addresses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=120), nullable=False),
        sa.Column('label', sa.String(length=50), server_default='Home', nullable=False),
        sa.Column('street', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), server_default='IL', nullable=True),
        sa.Column('zip_code', sa.String(length=20), server_default='60601', nullable=True),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('is_default', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_addresses_id'), 'user_addresses', ['id'], unique=False)
    op.create_index(op.f('ix_user_addresses_user_id'), 'user_addresses', ['user_id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_addresses' in inspector.get_table_names():
        op.drop_table('user_addresses')
