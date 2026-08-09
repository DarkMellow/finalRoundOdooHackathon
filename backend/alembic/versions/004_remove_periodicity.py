"""Remove periodicity from products table

Revision ID: 004_remove_periodicity
Revises: 003_update_product_variants
Create Date: 2026-08-08 23:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '004_remove_periodicity'
down_revision: Union[str, None] = '003_update_product_variants'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'periodicity' in columns:
            op.drop_column('products', 'periodicity')


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'periodicity' not in columns:
            op.add_column('products', sa.Column('periodicity', sa.String(length=50), server_default='Hours', nullable=False))
