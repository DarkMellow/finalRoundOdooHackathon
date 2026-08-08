from datetime import datetime
from typing import Optional, List
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
# PRODUCT & VARIANT SCHEMAS
# ==========================================

class ProductVariantItemSchema(BaseModel):
    id: str
    name: str
    price: str
    stockQuantity: str
    imageUrl: str
    features: str


class ProductAttributesJsonSchema(BaseModel):
    variants: Optional[List[ProductVariantItemSchema]] = None


class ProductCreateSchema(BaseModel):
    vendor_id: Optional[int] = 1
    name: str
    category: Optional[str] = "Electronics"
    product_type: str = "Goods"  # 'Goods' or 'Service'
    sales_price: Optional[float] = 0.0
    cost_price: Optional[float] = 0.0
    is_published: bool = False
    padding_time: Optional[str] = "2:00 H"
    pickup_time: Optional[str] = "10:00 H"
    return_time: Optional[str] = "19:00 H"
    late_fees: Optional[float] = 0.0
    security_deposit: Optional[float] = 0.0
    attributes_json: Optional[str] = None  # Serialized ProductAttributesJsonSchema JSON string


class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = None
    sales_price: Optional[float] = None
    cost_price: Optional[float] = None
    is_published: Optional[bool] = None
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
    category: Optional[str] = "Electronics"
    product_type: str = "Goods"
    sales_price: Optional[float] = 0.0
    cost_price: Optional[float] = 0.0
    is_published: Optional[bool] = True
    padding_time: Optional[str] = None
    pickup_time: Optional[str] = None
    return_time: Optional[str] = None
    late_fees: Optional[float] = None
    security_deposit: Optional[float] = None
    attributes_json: Optional[str] = None
    created_at: Optional[datetime] = None
    vendor_name: Optional[str] = None
    vendor_brand: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# CART SCHEMAS
# ==========================================

class CartItemSchema(BaseModel):
    id: str
    productId: str
    variantId: Optional[str] = None
    title: str
    brand: str
    image: str
    hourlyRate: float
    quantity: int = 1
    variantName: Optional[str] = None
    savedForLater: bool = False


class AddToCartSchema(BaseModel):
    user_id: Optional[int] = None
    productId: str
    variantId: Optional[str] = None
    quantity: int = 1
    title: Optional[str] = None
    brand: Optional[str] = None
    image: Optional[str] = None
    hourlyRate: Optional[float] = None
    variantName: Optional[str] = None


class UpdateCartItemSchema(BaseModel):
    quantity: Optional[int] = None
    savedForLater: Optional[bool] = None


class CartResponseSchema(BaseModel):
    user_id: int
    items: List[CartItemSchema] = []


# ==========================================
# ADDRESS SCHEMAS
# ==========================================

class DeliveryAddressSchema(BaseModel):
    id: str
    fullName: str
    street: str
    city: str
    state: str
    zipCode: str
    phone: str
    isDefault: bool = False
    label: str = "Home"  # 'Home' | 'Work' | 'Other'


class SaveAddressSchema(BaseModel):
    user_id: Optional[int] = None
    fullName: str
    street: str
    city: str
    state: Optional[str] = "IL"
    zipCode: Optional[str] = "60601"
    phone: Optional[str] = "+1 (555) 000-1122"
    label: Optional[str] = "Home"
    isDefault: Optional[bool] = False


# ==========================================
# CARD SCHEMAS
# ==========================================

class SavedCardSchema(BaseModel):
    id: str
    cardholderName: str
    cardNumberLast4: str
    expiry: str
    brand: str = "Visa"
    isDefault: bool = False

    model_config = ConfigDict(from_attributes=True)


class SaveCardSchema(BaseModel):
    user_id: Optional[int] = None
    cardholderName: str
    cardNumber: str
    expiry: Optional[str] = "12/28"
    brand: Optional[str] = "Visa"
    isDefault: Optional[bool] = False


# ==========================================
# WISHLIST SCHEMAS
# ==========================================

class WishlistItemSchema(BaseModel):
    id: str
    title: str
    image: str
    inStock: bool = True
    price: float
    originalPrice: Optional[float] = None
    discount: Optional[int] = None
    rating: float = 4.5
    reviews: int = 20
    assured: bool = True
    stockText: Optional[str] = "In Stock"


class WishlistToggleSchema(BaseModel):
    user_id: Optional[int] = None
    productId: str
    item: Optional[WishlistItemSchema] = None


# ==========================================
# ORDER SCHEMAS
# ==========================================

class OrderItemSchema(BaseModel):
    id: str
    productId: str
    title: str
    brand: str = "Brand"
    image: str
    hourlyRate: float
    quantity: int = 1
    variantName: Optional[str] = "Standard"


class OrderResponseSchema(BaseModel):
    id: str
    reference: str
    orderDate: str
    status: str
    startDate: str
    endDate: str
    totalHours: int
    subtotal: float
    discount: float
    total: float
    deliveryAddress: str
    paymentMethod: str
    items: List[OrderItemSchema] = []
    invoiceUrl: Optional[str] = None


class CreateOrderSchema(BaseModel):
    user_id: Optional[int] = None
    addressId: Optional[str] = None
    deliveryAddress: Optional[str] = None
    paymentMethod: Optional[str] = "Card"
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    totalHours: Optional[int] = 24
    discount: Optional[float] = 0.0
    items: Optional[List[OrderItemSchema]] = None





