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
# ADMIN SCHEMAS
# ==========================================

class AdminSignUpSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    department: Optional[str] = "Operations"


class AdminSignInSchema(BaseModel):
    email: EmailStr
    password: str


class AdminProfileSchema(BaseModel):
    department: str
    employee_id: Optional[str] = None
    is_superadmin: bool
    access_level: int

    model_config = ConfigDict(from_attributes=True)


class AdminUserResponseSchema(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    admin_profile: Optional[AdminProfileSchema] = None

    model_config = ConfigDict(from_attributes=True)
