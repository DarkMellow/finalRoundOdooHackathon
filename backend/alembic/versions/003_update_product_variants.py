"""Update product schema for variants and missing columns

Revision ID: 003_update_product_variants
Revises: 002_create_products_table
Create Date: 2026-08-08 22:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '003_update_product_variants'
down_revision: Union[str, None] = '002_create_products_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'category' not in columns:
            op.add_column('products', sa.Column('category', sa.String(length=100), server_default='Electronics', nullable=True))
        if 'rent_price' not in columns:
            op.add_column('products', sa.Column('rent_price', sa.Float(), server_default='0.0', nullable=False))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'category' in columns:
            op.drop_column('products', 'category')
        if 'rent_price' in columns:
            op.drop_column('products', 'rent_price')
