from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone_number = Column(String(30), nullable=True)
    role = Column(String(20), default="customer", nullable=False)  # 'customer' or 'vendor'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    vendor_profile = relationship("VendorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="owner")
    bookings = relationship("RentalBooking", back_populates="customer")
    products = relationship("Product", back_populates="vendor")
    cart = relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")
    wishlist = relationship("Wishlist", back_populates="user", uselist=False, cascade="all, delete-orphan")
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    cards = relationship("UserCard", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    address_line = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    id_proof_type = Column(String(50), nullable=True)
    id_proof_number = Column(String(100), nullable=True)
    addresses_json = Column(Text, nullable=True)  # JSON array of saved delivery addresses

    user = relationship("User", back_populates="customer_profile")


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    company_name = Column(String(120), nullable=True)
    category = Column(String(100), default="General Rental", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="vendor_profile")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    price_per_month = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="properties")
    bookings = relationship("RentalBooking", back_populates="property")


class RentalBooking(Base):
    __tablename__ = "rental_bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(30), default="pending", nullable=False)  # 'pending', 'approved', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="bookings")
    customer = relationship("User", back_populates="bookings")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), default="Electronics", nullable=True)
    product_type = Column(String(50), default="Goods", nullable=False)  # 'Goods' or 'Service'
    sales_price = Column(Float, default=0.0, nullable=True)
    cost_price = Column(Float, default=0.0, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)

    # Sales / Rental parameters
    padding_time = Column(String(50), default="2:00 H", nullable=True)
    pickup_time = Column(String(50), default="10:00 H", nullable=True)
    return_time = Column(String(50), default="19:00 H", nullable=True)
    late_fees = Column(Float, default=0.0, nullable=True)
    security_deposit = Column(Float, default=0.0, nullable=True)

    # Attributes & Variants stored as JSON string
    attributes_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = relationship("User", back_populates="products")

    @property
    def vendor_name(self) -> str | None:
        if self.vendor and self.vendor.full_name:
            return self.vendor.full_name
        return None

    @property
    def vendor_brand(self) -> str | None:
        if self.vendor and self.vendor.vendor_profile and self.vendor.vendor_profile.company_name:
            return self.vendor.vendor_profile.company_name
        if self.vendor and self.vendor.full_name:
            return self.vendor.full_name
        return None


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    items_json = Column(Text, nullable=True)  # JSON serialized array of cart items
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cart")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    label = Column(String(50), default="Home", nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), default="IL", nullable=True)
    zip_code = Column(String(20), default="60601", nullable=True)
    phone = Column(String(30), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="addresses")


class UserCard(Base):
    __tablename__ = "user_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cardholder_name = Column(String(120), nullable=False)
    card_number_last4 = Column(String(10), nullable=False)
    expiry = Column(String(20), nullable=False)
    brand = Column(String(50), default="Visa", nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cards")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    items_json = Column(Text, nullable=True)  # JSON serialized array of wishlisted product items
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wishlist")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reference = Column(String(50), nullable=False, unique=True, index=True)
    status = Column(String(50), default="Active", nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    total_hours = Column(Integer, default=24, nullable=False)
    subtotal = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, default=0.0, nullable=False)
    delivery_address = Column(String(255), nullable=False)
    payment_method = Column(String(100), nullable=False)
    items_json = Column(Text, nullable=False)  # JSON serialized array of ordered items
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="orders")





