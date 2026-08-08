from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# ==========================================
# CUSTOMER SCHEMAS
# ==========================================

class CustomerSignUpSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None


class CustomerSignInSchema(BaseModel):
    email: EmailStr
    password: str


class CustomerProfileSchema(BaseModel):
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CustomerUserResponseSchema(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    customer_profile: Optional[CustomerProfileSchema] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# VENDOR SCHEMAS
# ==========================================

class VendorSignUpSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    company_name: Optional[str] = None


class VendorSignInSchema(BaseModel):
    email: EmailStr
    password: str


class VendorProfileSchema(BaseModel):
    company_name: Optional[str] = None
    category: str
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class VendorUserResponseSchema(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    vendor_profile: Optional[VendorProfileSchema] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# PRODUCT SCHEMAS
# ==========================================

class ProductCreateSchema(BaseModel):
    vendor_id: Optional[int] = 1
    name: str
    product_type: str = "Goods"  # 'Goods' or 'Service'
    image_url: Optional[str] = None
    quantity_on_hand: int = 0
    rent_price: float = 0.0
    sales_price: Optional[float] = 0.0
    cost_price: Optional[float] = 0.0
    is_published: bool = False
    periodicity: str = "Hours"
    padding_time: Optional[str] = "2:00 H"
    pickup_time: Optional[str] = "10:00 H"
    return_time: Optional[str] = "19:00 H"
    late_fees: Optional[float] = 0.0
    security_deposit: Optional[float] = 0.0
    attributes_json: Optional[str] = None


class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    product_type: Optional[str] = None
    image_url: Optional[str] = None
    quantity_on_hand: Optional[int] = None
    rent_price: Optional[float] = None
    sales_price: Optional[float] = None
    cost_price: Optional[float] = None
    is_published: Optional[bool] = None
    periodicity: Optional[str] = None
    padding_time: Optional[str] = None
    pickup_time: Optional[str] = None
    return_time: Optional[str] = None
    late_fees: Optional[float] = None
    security_deposit: Optional[float] = None
    attributes_json: Optional[str] = None


class ProductResponseSchema(BaseModel):
    id: int
    vendor_id: int
    name: str
    product_type: str = "Goods"
    image_url: Optional[str] = None
    quantity_on_hand: Optional[int] = 0
    rent_price: Optional[float] = 0.0
    sales_price: Optional[float] = 0.0
    cost_price: Optional[float] = 0.0
    is_published: Optional[bool] = True
    periodicity: Optional[str] = "Hours"
    padding_time: Optional[str] = None
    pickup_time: Optional[str] = None
    return_time: Optional[str] = None
    late_fees: Optional[float] = None
    security_deposit: Optional[float] = None
    attributes_json: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


