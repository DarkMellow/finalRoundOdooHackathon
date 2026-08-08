"""Create user_cards table

Revision ID: 012_create_user_cards_table
Revises: 011_normalized_user_addresses
Create Date: 2026-08-09 02:12:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '012_create_user_cards_table'
down_revision: Union[str, None] = '011_normalized_user_addresses'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_cards' not in inspector.get_table_names():
        op.create_table(
            'user_cards',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('cardholder_name', sa.String(length=120), nullable=False),
            sa.Column('card_number_last4', sa.String(length=10), nullable=False),
            sa.Column('expiry', sa.String(length=20), nullable=False),
            sa.Column('brand', sa.String(length=50), server_default='Visa', nullable=False),
            sa.Column('is_default', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_cards_id'), 'user_cards', ['id'], unique=False)
        op.create_index(op.f('ix_user_cards_user_id'), 'user_cards', ['user_id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'user_cards' in inspector.get_table_names():
        op.drop_table('user_cards')
