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
