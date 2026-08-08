from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field, text

class Product(SQLModel, table=True):
    __tablename__ = "products"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True, nullable=False)
    daily_rate: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2, nullable=False)
    deposit_amount: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2, nullable=False)
    quantity_available: int = Field(default=0, nullable=False)
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")}
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()"), "onupdate": text("now()")}
    )
