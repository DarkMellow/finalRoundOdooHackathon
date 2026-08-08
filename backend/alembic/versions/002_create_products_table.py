"""Create products table

Revision ID: 002_create_products_table
Revises: 001_initial_user_schemas
Create Date: 2026-08-08 18:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '002_create_products_table'
down_revision: Union[str, None] = '001_initial_user_schemas'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if products table exists before creating
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' not in inspector.get_table_names():
        op.create_table(
            'products',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('vendor_id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=200), nullable=False),
            sa.Column('product_type', sa.String(length=50), server_default='Goods', nullable=False),
            sa.Column('image_url', sa.Text(), nullable=True),
            sa.Column('quantity_on_hand', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('sales_price', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('cost_price', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('is_published', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('periodicity', sa.String(length=50), server_default='Hours', nullable=False),
            sa.Column('padding_time', sa.String(length=50), server_default='2:00 H', nullable=True),
            sa.Column('pickup_time', sa.String(length=50), server_default='10:00 H', nullable=True),
            sa.Column('return_time', sa.String(length=50), server_default='19:00 H', nullable=True),
            sa.Column('late_fees', sa.Float(), server_default='0.0', nullable=True),
            sa.Column('security_deposit', sa.Float(), server_default='0.0', nullable=True),
            sa.Column('attributes_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['vendor_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'products' in inspector.get_table_names():
        op.drop_table('products')
