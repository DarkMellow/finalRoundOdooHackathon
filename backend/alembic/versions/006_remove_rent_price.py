"""Remove rent_price from products table

Revision ID: 006_remove_rent_price
Revises: 005_remove_quantity_on_hand
Create Date: 2026-08-09 00:21:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '006_remove_rent_price'
down_revision: Union[str, None] = '005_remove_quantity_on_hand'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'rent_price' in columns:
            op.drop_column('products', 'rent_price')


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'rent_price' not in columns:
            op.add_column('products', sa.Column('rent_price', sa.Float(), server_default='0.0', nullable=False))
