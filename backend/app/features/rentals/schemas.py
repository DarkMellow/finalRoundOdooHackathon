from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

class RentalBase(BaseModel):
    product_id: int
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_phone: str = Field(..., min_length=1, max_length=20)
    start_date: date
    due_date: date
    deposit_amount: Decimal = Field(..., ge=Decimal("0.00"))

class RentalCreate(RentalBase):
    pass

class RentalReturn(BaseModel):
    actual_return_date: date

class RentalOut(RentalBase):
    id: int
    actual_return_date: Optional[date] = None
    late_fee_charged: Optional[Decimal] = None
    deposit_refunded: Optional[Decimal] = None
    settled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
