from decimal import Decimal
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    daily_rate: Decimal = Field(..., gt=Decimal("0.00"))
    deposit_amount: Decimal = Field(..., ge=Decimal("0.00"))
    quantity_available: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
