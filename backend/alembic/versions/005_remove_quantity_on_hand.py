"""Remove quantity_on_hand from products table

Revision ID: 005_remove_quantity_on_hand
Revises: 004_remove_periodicity
Create Date: 2026-08-08 23:54:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '005_remove_quantity_on_hand'
down_revision: Union[str, None] = '004_remove_periodicity'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'quantity_on_hand' in columns:
            op.drop_column('products', 'quantity_on_hand')


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'quantity_on_hand' not in columns:
            op.add_column('products', sa.Column('quantity_on_hand', sa.Float(), server_default='0.0', nullable=False))
