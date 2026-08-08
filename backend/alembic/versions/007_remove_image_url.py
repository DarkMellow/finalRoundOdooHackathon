"""Remove image_url from products table

Revision ID: 007_remove_image_url
Revises: 006_remove_rent_price
Create Date: 2026-08-09 00:27:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '007_remove_image_url'
down_revision: Union[str, None] = '006_remove_rent_price'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'image_url' in columns:
            op.drop_column('products', 'image_url')


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('products')]
        if 'image_url' not in columns:
            op.add_column('products', sa.Column('image_url', sa.Text(), nullable=True))
