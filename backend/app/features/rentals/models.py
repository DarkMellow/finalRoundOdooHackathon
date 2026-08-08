from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field, text

class Rental(SQLModel, table=True):
    __tablename__ = "rentals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", ondelete="RESTRICT", nullable=False)
    customer_name: str = Field(max_length=100, index=True, nullable=False)
    customer_phone: str = Field(max_length=20, index=True, nullable=False)
    start_date: date = Field(nullable=False)
    due_date: date = Field(index=True, nullable=False)
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    
    # Settlement fields (nullable until return is processed)
    actual_return_date: Optional[date] = Field(default=None, nullable=True)
    late_fee_charged: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)
    deposit_refunded: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)
    settled_at: Optional[datetime] = Field(
        default=None, 
        sa_column_kwargs={"nullable": True, "index": True}
    )

class DepositLedgerEntry(SQLModel, table=True):
    __tablename__ = "deposit_ledger_entries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rental_id: int = Field(foreign_key="rentals.id", ondelete="CASCADE", nullable=False)
    entry_type: str = Field(max_length=30, nullable=False)  # 'COLLECTED', 'DEDUCTION', 'REFUNDED'
    amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")}
    )
