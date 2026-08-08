"""Add addresses_json to customer_profiles

Revision ID: 009_add_addresses_json
Revises: 008_create_carts_table
Create Date: 2026-08-09 01:38:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '009_add_addresses_json'
down_revision: Union[str, None] = '008_create_carts_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('customer_profiles')]
    if 'addresses_json' not in columns:
        op.add_column('customer_profiles', sa.Column('addresses_json', sa.Text(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('customer_profiles')]
    if 'addresses_json' in columns:
        op.drop_column('customer_profiles', 'addresses_json')
