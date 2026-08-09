"""Create orders table

Revision ID: 014_create_orders_table
Revises: 013_create_wishlists_table
Create Date: 2026-08-09 03:08:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '014_create_orders_table'
down_revision: Union[str, None] = '013_create_wishlists_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'orders' not in inspector.get_table_names():
        op.create_table(
            'orders',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('reference', sa.String(length=50), nullable=False),
            sa.Column('status', sa.String(length=50), server_default='Active', nullable=False),
            sa.Column('order_date', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('start_date', sa.String(length=50), nullable=False),
            sa.Column('end_date', sa.String(length=50), nullable=False),
            sa.Column('total_hours', sa.Integer(), server_default='24', nullable=False),
            sa.Column('subtotal', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('discount', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('total', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('delivery_address', sa.String(length=255), nullable=False),
            sa.Column('payment_method', sa.String(length=100), nullable=False),
            sa.Column('items_json', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('reference')
        )
        op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
        op.create_index(op.f('ix_orders_user_id'), 'orders', ['user_id'], unique=False)
        op.create_index(op.f('ix_orders_reference'), 'orders', ['reference'], unique=True)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'orders' in inspector.get_table_names():
        op.drop_table('orders')
