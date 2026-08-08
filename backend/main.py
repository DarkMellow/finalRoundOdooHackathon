from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import time
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session, joinedload

from config import settings
from database import engine, Base, get_db, test_db_connection
import models
import schemas

# Create database tables automatically if connection succeeds
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not initialize database tables on startup: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME + " API",
    description="EasyRental Backend API connected to MariaDB / MySQL with Customer & Vendor schemas",
    version=settings.VERSION,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception Caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.get("/")
def read_root():
    return {
        "status": "success",
        "project": settings.PROJECT_NAME,
        "message": f"Welcome to the {settings.PROJECT_NAME} Backend API",
    }


@app.get("/health")
def health_check():
    db_status = test_db_connection()
    return {
        "status": "healthy" if db_status["status"] == "connected" else "degraded",
        "project": settings.PROJECT_NAME,
        "database": db_status,
    }


@app.get("/db-status")
def db_status_endpoint():
    return test_db_connection()


# ==========================================
# CUSTOMER AUTH ENDPOINTS
# ==========================================

@app.post(
    "/api/v1/customer/signup",
    response_model=schemas.CustomerUserResponseSchema,
    status_code=status.HTTP_201_CREATED,
    tags=["Customer Auth"],
)
def customer_signup(payload: schemas.CustomerSignUpSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=f"hashed_{payload.password}",
        phone_number=payload.phone_number,
        role="customer",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = models.CustomerProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    return user


@app.post(
    "/api/v1/customer/signin",
    response_model=schemas.CustomerUserResponseSchema,
    tags=["Customer Auth"],
)
def customer_signin(payload: schemas.CustomerSignInSchema, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.role == "customer")
        .first()
    )
    if not user or user.hashed_password != f"hashed_{payload.password}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    return user


# ==========================================
# VENDOR AUTH ENDPOINTS
# ==========================================

@app.post(
    "/api/v1/vendor/signup",
    response_model=schemas.VendorUserResponseSchema,
    status_code=status.HTTP_201_CREATED,
    tags=["Vendor Auth"],
)
def vendor_signup(payload: schemas.VendorSignUpSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A vendor with this email address already exists.",
        )

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=f"hashed_{payload.password}",
        role="vendor",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = models.VendorProfile(
        user_id=user.id,
        company_name=payload.company_name,
        category="General Rental",
        is_verified=False,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    return user


@app.post(
    "/api/v1/vendor/signin",
    response_model=schemas.VendorUserResponseSchema,
    tags=["Vendor Auth"],
)
def vendor_signin(payload: schemas.VendorSignInSchema, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            models.User.email == payload.email,
            models.User.role.in_(["vendor", "admin"]),
        )
        .first()
    )
    if not user or user.hashed_password != f"hashed_{payload.password}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid vendor credentials. Please check your email and password.",
        )

    # Auto-migrate legacy 'admin' role to 'vendor'
    if user.role == "admin":
        user.role = "vendor"
        db.commit()
        db.refresh(user)

    return user


# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

@app.post(
    "/api/v1/products",
    response_model=schemas.ProductResponseSchema,
    status_code=status.HTTP_201_CREATED,
    tags=["Products"],
)
def create_product(payload: schemas.ProductCreateSchema, db: Session = Depends(get_db)):
    # Fallback to first vendor user if vendor_id is not specified or 1
    vendor = db.query(models.User).filter(models.User.id == payload.vendor_id).first()
    if not vendor:
        first_vendor = db.query(models.User).filter(models.User.role == "vendor").first()
        if first_vendor:
            payload.vendor_id = first_vendor.id
        else:
            # Create a default vendor if none exists
            default_vendor = models.User(
                full_name="Default Vendor",
                email="vendor@easyrental.com",
                hashed_password="hashed_vendor123",
                role="vendor",
                is_active=True,
            )
            db.add(default_vendor)
            db.commit()
            db.refresh(default_vendor)
            payload.vendor_id = default_vendor.id

    product = models.Product(
        vendor_id=payload.vendor_id,
        name=payload.name,
        category=payload.category or "Electronics",
        product_type=payload.product_type,
        sales_price=payload.sales_price or 0.0,
        cost_price=0.0,
        is_published=payload.is_published,
        padding_time=payload.padding_time,
        pickup_time=payload.pickup_time,
        return_time=payload.return_time,
        late_fees=payload.late_fees,
        security_deposit=payload.security_deposit,
        attributes_json=payload.attributes_json,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.get(
    "/api/v1/products",
    response_model=list[schemas.ProductResponseSchema],
    tags=["Products"],
)
def get_products(vendor_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    try:
        query = db.query(models.Product).options(
            joinedload(models.Product.vendor).joinedload(models.User.vendor_profile)
        )
        if vendor_id is not None and vendor_id > 0:
            query = query.filter(models.Product.vendor_id == vendor_id)
        return query.order_by(models.Product.id.desc()).all()
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []


@app.get(
    "/api/v1/products/{product_id}",
    response_model=schemas.ProductResponseSchema,
    tags=["Products"],
)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(models.Product)
        .options(joinedload(models.Product.vendor).joinedload(models.User.vendor_profile))
        .filter(models.Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@app.put(
    "/api/v1/products/{product_id}",
    response_model=schemas.ProductResponseSchema,
    tags=["Products"],
)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdateSchema,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@app.delete(
    "/api/v1/products/{product_id}",
    status_code=status.HTTP_200_OK,
    tags=["Products"],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    db.delete(product)
    db.commit()
    return {"status": "success", "message": f"Product {product_id} deleted successfully"}


# ==========================================
# CART ENDPOINTS
# ==========================================

def get_or_create_user_cart(user_id: int | None, db: Session) -> tuple[models.Cart, int]:
    if not user_id:
        first_cust = db.query(models.User).filter(models.User.role == "customer").first()
        if not first_cust:
            first_cust = db.query(models.User).first()
        if first_cust:
            user_id = first_cust.id
        else:
            default_u = models.User(
                full_name="Jane Doe",
                email="jane.doe@example.com",
                hashed_password="hashed_customer123",
                role="customer",
                is_active=True,
            )
            db.add(default_u)
            db.commit()
            db.refresh(default_u)
            user_id = default_u.id

    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart:
        cart = models.Cart(user_id=user_id, items_json="[]")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart, user_id


@app.get(
    "/api/v1/cart",
    response_model=list[schemas.CartItemSchema],
    tags=["Cart"],
)
def get_cart(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    cart, _ = get_or_create_user_cart(user_id, db)
    try:
        items = json.loads(cart.items_json or "[]")
        if not isinstance(items, list):
            items = []
        return items
    except Exception as e:
        print(f"Error parsing cart items: {e}")
        return []


@app.post(
    "/api/v1/cart/items",
    response_model=list[schemas.CartItemSchema],
    tags=["Cart"],
)
def add_to_cart(payload: schemas.AddToCartSchema, db: Session = Depends(get_db)):
    cart, _ = get_or_create_user_cart(payload.user_id, db)
    try:
        items = json.loads(cart.items_json or "[]")
        if not isinstance(items, list):
            items = []
    except Exception:
        items = []

    # Check if item with matching productId AND variantId exists
    matched = False
    for item in items:
        if str(item.get("productId")) == str(payload.productId) and str(item.get("variantId", "")) == str(payload.variantId or ""):
            item["quantity"] = int(item.get("quantity", 1)) + int(payload.quantity or 1)
            item["savedForLater"] = False
            matched = True
            break

    if not matched:
        new_item = {
            "id": f"cart-{int(time.time() * 1000)}",
            "productId": str(payload.productId),
            "variantId": payload.variantId,
            "title": payload.title or "Equipment Rental",
            "brand": payload.brand or "Verified Vendor",
            "image": payload.image or "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80",
            "hourlyRate": float(payload.hourlyRate if payload.hourlyRate is not None else 5.0),
            "quantity": int(payload.quantity or 1),
            "variantName": payload.variantName or "Standard Package",
            "savedForLater": False,
        }
        items.insert(0, new_item)

    cart.items_json = json.dumps(items)
    db.commit()
    db.refresh(cart)
    return items


@app.put(
    "/api/v1/cart/items/{item_id}",
    response_model=list[schemas.CartItemSchema],
    tags=["Cart"],
)
def update_cart_item(
    item_id: str,
    payload: schemas.UpdateCartItemSchema,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    cart, _ = get_or_create_user_cart(user_id, db)
    try:
        items = json.loads(cart.items_json or "[]")
        if not isinstance(items, list):
            items = []
    except Exception:
        items = []

    for item in items:
        if str(item.get("id")) == str(item_id):
            if payload.quantity is not None:
                item["quantity"] = max(1, int(payload.quantity))
            if payload.savedForLater is not None:
                item["savedForLater"] = bool(payload.savedForLater)
            break

    cart.items_json = json.dumps(items)
    db.commit()
    db.refresh(cart)
    return items


@app.delete(
    "/api/v1/cart/items/{item_id}",
    response_model=list[schemas.CartItemSchema],
    tags=["Cart"],
)
def remove_cart_item(
    item_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    cart, _ = get_or_create_user_cart(user_id, db)
    try:
        items = json.loads(cart.items_json or "[]")
        if not isinstance(items, list):
            items = []
    except Exception:
        items = []

    items = [i for i in items if str(i.get("id")) != str(item_id)]
    cart.items_json = json.dumps(items)
    db.commit()
    db.refresh(cart)
    return items


@app.delete(
    "/api/v1/cart",
    response_model=list[schemas.CartItemSchema],
    tags=["Cart"],
)
def clear_cart(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    cart, _ = get_or_create_user_cart(user_id, db)
    cart.items_json = "[]"
    db.commit()
    db.refresh(cart)
    return []


# ==========================================
# ADDRESS ENDPOINTS
# ==========================================

DEFAULT_INITIAL_ADDRESSES = [
    {
        "id": "addr-1",
        "fullName": "Jane Doe",
        "label": "Home",
        "street": "742 Evergreen Terrace",
        "city": "Springfield",
        "state": "IL",
        "zipCode": "62701",
        "phone": "+1 (555) 019-2834",
        "isDefault": True,
    },
    {
        "id": "addr-2",
        "fullName": "Jane Doe (Office)",
        "label": "Work",
        "street": "100 Innovation Way, Suite 400",
        "city": "Chicago",
        "state": "IL",
        "zipCode": "60601",
        "phone": "+1 (555) 012-9988",
        "isDefault": False,
    },
]


def resolve_target_user_id(user_id: int | None, db: Session) -> int:
    if user_id and user_id > 0:
        return user_id
    first_cust = db.query(models.User).filter(models.User.role == "customer").first()
    if not first_cust:
        first_cust = db.query(models.User).first()
    if first_cust:
        return first_cust.id
    default_u = models.User(
        full_name="Jane Doe",
        email="jane.doe@example.com",
        hashed_password="hashed_customer123",
        role="customer",
        is_active=True,
    )
    db.add(default_u)
    db.commit()
    db.refresh(default_u)
    return default_u.id


@app.get(
    "/api/v1/addresses",
    response_model=list[schemas.DeliveryAddressSchema],
    tags=["Addresses"],
)
def get_addresses(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    target_user_id = resolve_target_user_id(user_id, db)
    rows = (
        db.query(models.UserAddress)
        .filter(models.UserAddress.user_id == target_user_id)
        .order_by(models.UserAddress.id.desc())
        .all()
    )
    return [
        schemas.DeliveryAddressSchema(
            id=str(row.id),
            fullName=row.full_name,
            label=row.label,
            street=row.street,
            city=row.city,
            state=row.state or "IL",
            zipCode=row.zip_code or "60601",
            phone=row.phone,
            isDefault=row.is_default,
        )
        for row in rows
    ]


@app.post(
    "/api/v1/addresses",
    response_model=list[schemas.DeliveryAddressSchema],
    tags=["Addresses"],
)
def save_address(payload: schemas.SaveAddressSchema, db: Session = Depends(get_db)):
    target_user_id = resolve_target_user_id(payload.user_id, db)

    if payload.isDefault:
        db.query(models.UserAddress).filter(models.UserAddress.user_id == target_user_id).update(
            {"is_default": False}
        )

    new_addr = models.UserAddress(
        user_id=target_user_id,
        full_name=payload.fullName,
        label=payload.label or "Home",
        street=payload.street,
        city=payload.city,
        state=payload.state or "IL",
        zip_code=payload.zipCode or "60601",
        phone=payload.phone or "+1 (555) 000-1122",
        is_default=bool(payload.isDefault),
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)

    rows = (
        db.query(models.UserAddress)
        .filter(models.UserAddress.user_id == target_user_id)
        .order_by(models.UserAddress.id.desc())
        .all()
    )
    return [
        schemas.DeliveryAddressSchema(
            id=str(row.id),
            fullName=row.full_name,
            label=row.label,
            street=row.street,
            city=row.city,
            state=row.state or "IL",
            zipCode=row.zip_code or "60601",
            phone=row.phone,
            isDefault=row.is_default,
        )
        for row in rows
    ]


@app.delete(
    "/api/v1/addresses/{address_id}",
    response_model=list[schemas.DeliveryAddressSchema],
    tags=["Addresses"],
)
def delete_address(
    address_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(user_id, db)
    addr_query = db.query(models.UserAddress).filter(models.UserAddress.id == address_id)
    if user_id:
        addr_query = addr_query.filter(models.UserAddress.user_id == target_user_id)
    addr = addr_query.first()
    if addr:
        db.delete(addr)
        db.commit()

    rows = (
        db.query(models.UserAddress)
        .filter(models.UserAddress.user_id == target_user_id)
        .order_by(models.UserAddress.id.desc())
        .all()
    )
    return [
        schemas.DeliveryAddressSchema(
            id=str(row.id),
            fullName=row.full_name,
            label=row.label,
            street=row.street,
            city=row.city,
            state=row.state or "IL",
            zipCode=row.zip_code or "60601",
            phone=row.phone,
            isDefault=row.is_default,
        )
        for row in rows
    ]


# ==========================================
# CARD ENDPOINTS
# ==========================================

@app.get(
    "/api/v1/cards",
    response_model=list[schemas.SavedCardSchema],
    tags=["Cards"],
)
def get_cards(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    target_user_id = resolve_target_user_id(user_id, db)
    rows = (
        db.query(models.UserCard)
        .filter(models.UserCard.user_id == target_user_id)
        .order_by(models.UserCard.id.desc())
        .all()
    )
    return [
        schemas.SavedCardSchema(
            id=str(row.id),
            cardholderName=row.cardholder_name,
            cardNumberLast4=row.card_number_last4,
            expiry=row.expiry,
            brand=row.brand,
            isDefault=row.is_default,
        )
        for row in rows
    ]


@app.post(
    "/api/v1/cards",
    response_model=list[schemas.SavedCardSchema],
    tags=["Cards"],
)
def save_card(payload: schemas.SaveCardSchema, db: Session = Depends(get_db)):
    target_user_id = resolve_target_user_id(payload.user_id, db)

    raw_num = payload.cardNumber.replace(" ", "").replace("-", "")
    last4 = raw_num[-4:] if len(raw_num) >= 4 else "4242"

    # Infer brand if simple detection possible
    brand = payload.brand or "Visa"
    if raw_num.startswith("5"):
        brand = "Mastercard"
    elif raw_num.startswith("3"):
        brand = "Amex"

    if payload.isDefault:
        db.query(models.UserCard).filter(models.UserCard.user_id == target_user_id).update(
            {"is_default": False}
        )

    new_card = models.UserCard(
        user_id=target_user_id,
        cardholder_name=payload.cardholderName,
        card_number_last4=last4,
        expiry=payload.expiry or "12/28",
        brand=brand,
        is_default=bool(payload.isDefault),
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    rows = (
        db.query(models.UserCard)
        .filter(models.UserCard.user_id == target_user_id)
        .order_by(models.UserCard.id.desc())
        .all()
    )
    return [
        schemas.SavedCardSchema(
            id=str(row.id),
            cardholderName=row.cardholder_name,
            cardNumberLast4=row.card_number_last4,
            expiry=row.expiry,
            brand=row.brand,
            isDefault=row.is_default,
        )
        for row in rows
    ]


@app.put(
    "/api/v1/cards/{card_id}",
    response_model=list[schemas.SavedCardSchema],
    tags=["Cards"],
)
def update_card(
    card_id: str,
    payload: schemas.SaveCardSchema,
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(payload.user_id, db)
    card = db.query(models.UserCard).filter(models.UserCard.id == card_id, models.UserCard.user_id == target_user_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    raw_num = payload.cardNumber.replace(" ", "").replace("-", "")
    if len(raw_num) >= 4 and not (raw_num.startswith("x") or raw_num.startswith("*")):
        last4 = raw_num[-4:]
        brand = payload.brand or "Visa"
        if raw_num.startswith("5"):
            brand = "Mastercard"
        elif raw_num.startswith("3"):
            brand = "Amex"
        card.card_number_last4 = last4
        card.brand = brand

    card.cardholder_name = payload.cardholderName
    card.expiry = payload.expiry or "12/28"
    if payload.isDefault:
        db.query(models.UserCard).filter(models.UserCard.user_id == target_user_id).update(
            {"is_default": False}
        )
        card.is_default = True

    db.commit()

    rows = (
        db.query(models.UserCard)
        .filter(models.UserCard.user_id == target_user_id)
        .order_by(models.UserCard.id.desc())
        .all()
    )
    return [
        schemas.SavedCardSchema(
            id=str(row.id),
            cardholderName=row.cardholder_name,
            cardNumberLast4=row.card_number_last4,
            expiry=row.expiry,
            brand=row.brand,
            isDefault=row.is_default,
        )
        for row in rows
    ]


@app.delete(
    "/api/v1/cards/{card_id}",
    response_model=list[schemas.SavedCardSchema],
    tags=["Cards"],
)
def delete_card(
    card_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(user_id, db)
    card_query = db.query(models.UserCard).filter(models.UserCard.id == card_id)
    if user_id:
        card_query = card_query.filter(models.UserCard.user_id == target_user_id)
    card = card_query.first()
    if card:
        db.delete(card)
        db.commit()

    rows = (
        db.query(models.UserCard)
        .filter(models.UserCard.user_id == target_user_id)
        .order_by(models.UserCard.id.desc())
        .all()
    )
    return [
        schemas.SavedCardSchema(
            id=str(row.id),
            cardholderName=row.cardholder_name,
            cardNumberLast4=row.card_number_last4,
            expiry=row.expiry,
            brand=row.brand,
            isDefault=row.is_default,
        )
        for row in rows
    ]


# ==========================================
# WISHLIST ENDPOINTS & HELPERS
# ==========================================

DEFAULT_INITIAL_WISHLIST = []


def get_or_create_user_wishlist(user_id: int | None, db: Session) -> tuple[models.Wishlist, int]:
    target_user_id = resolve_target_user_id(user_id, db)
    wishlist = db.query(models.Wishlist).filter(models.Wishlist.user_id == target_user_id).first()
    if not wishlist:
        wishlist = models.Wishlist(
            user_id=target_user_id,
            items_json="[]",
        )
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
    return wishlist, target_user_id


@app.get(
    "/api/v1/wishlist",
    response_model=list[schemas.WishlistItemSchema],
    tags=["Wishlist"],
)
def get_wishlist(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    wishlist, _ = get_or_create_user_wishlist(user_id, db)
    try:
        items = json.loads(wishlist.items_json or "[]")
        if not isinstance(items, list):
            items = []
        return items
    except Exception as e:
        print(f"Error parsing wishlist: {e}")
        return []


@app.post(
    "/api/v1/wishlist/toggle",
    response_model=list[schemas.WishlistItemSchema],
    tags=["Wishlist"],
)
def toggle_wishlist_item(payload: schemas.WishlistToggleSchema, db: Session = Depends(get_db)):
    wishlist, target_user_id = get_or_create_user_wishlist(payload.user_id, db)
    try:
        items = json.loads(wishlist.items_json or "[]")
        if not isinstance(items, list):
            items = []
    except Exception:
        items = []

    existing_idx = next((i for i, item in enumerate(items) if str(item.get("id")) == str(payload.productId)), -1)

    if existing_idx >= 0:
        # Remove from wishlist
        items.pop(existing_idx)
    else:
        # Add to wishlist
        if payload.item:
            new_item = payload.item.model_dump()
        else:
            # Fallback search product in db
            product = db.query(models.Product).filter(models.Product.id == payload.productId).first()
            if product:
                img = None
                if product.variants and len(product.variants) > 0 and product.variants[0].images:
                    img = product.variants[0].images[0].image_url
                new_item = {
                    "id": str(product.id),
                    "title": product.name,
                    "image": img or "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80",
                    "inStock": True,
                    "price": float(product.rental_plans[0].rate if product.rental_plans else 500),
                    "originalPrice": None,
                    "discount": None,
                    "rating": 4.5,
                    "reviews": 10,
                    "assured": True,
                    "stockText": "In Stock",
                }
            else:
                new_item = {
                    "id": str(payload.productId),
                    "title": "Selected Equipment",
                    "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80",
                    "inStock": True,
                    "price": 999,
                    "originalPrice": None,
                    "discount": None,
                    "rating": 4.5,
                    "reviews": 10,
                    "assured": True,
                    "stockText": "In Stock",
                }
        items.insert(0, new_item)

    wishlist.items_json = json.dumps(items)
    db.commit()
    db.refresh(wishlist)
    return items


@app.delete(
    "/api/v1/wishlist/items/{product_id}",
    response_model=list[schemas.WishlistItemSchema],
    tags=["Wishlist"],
)
def remove_wishlist_item(
    product_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    wishlist, _ = get_or_create_user_wishlist(user_id, db)
    try:
        items = json.loads(wishlist.items_json or "[]")
        if not isinstance(items, list):
            items = []
    except Exception:
        items = []

    items = [item for item in items if str(item.get("id")) != str(product_id)]
    wishlist.items_json = json.dumps(items)
    db.commit()
    db.refresh(wishlist)
    return items


@app.delete(
    "/api/v1/wishlist",
    response_model=list[schemas.WishlistItemSchema],
    tags=["Wishlist"],
)
def clear_wishlist(user_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    wishlist, _ = get_or_create_user_wishlist(user_id, db)
    wishlist.items_json = "[]"
    db.commit()
    db.refresh(wishlist)
    return []


# ==========================================
# ORDER ENDPOINTS & HELPERS
# ==========================================

def format_order_response(order: models.Order) -> schemas.OrderResponseSchema:
    try:
        items_data = json.loads(order.items_json or "[]")
        if not isinstance(items_data, list):
            items_data = []
    except Exception:
        items_data = []

    formatted_items = []
    for it in items_data:
        formatted_items.append(
            schemas.OrderItemSchema(
                id=str(it.get("id") or f"item-{random.randint(100, 999)}"),
                productId=str(it.get("productId") or it.get("id") or "p1"),
                title=str(it.get("title") or it.get("name") or "Equipment Item"),
                brand=str(it.get("brand") or "Equipment Co"),
                image=str(it.get("image") or "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80"),
                hourlyRate=float(it.get("hourlyRate") or 0.0),
                quantity=int(it.get("quantity") or 1),
                variantName=it.get("variantName") or it.get("variantTitle") or "Standard",
            )
        )

    order_date_str = order.order_date.isoformat() if order.order_date else datetime.utcnow().isoformat()

    return schemas.OrderResponseSchema(
        id=str(order.id),
        reference=order.reference,
        orderDate=order_date_str,
        status=order.status,
        startDate=order.start_date,
        endDate=order.end_date,
        totalHours=order.total_hours,
        subtotal=order.subtotal,
        discount=order.discount,
        total=order.total,
        deliveryAddress=order.delivery_address,
        paymentMethod=order.payment_method,
        items=formatted_items,
        invoiceUrl=None,
    )


@app.get(
    "/api/v1/orders",
    response_model=list[schemas.OrderResponseSchema],
    tags=["Orders"],
)
def get_customer_orders(
    user_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(user_id, db)
    query = db.query(models.Order).filter(models.Order.user_id == target_user_id)

    if status and status != "all":
        if status == "active":
            query = query.filter(models.Order.status.in_(["Active", "Pending Pickup"]))
        elif status == "completed":
            query = query.filter(models.Order.status.in_(["Completed", "Returned"]))
        elif status == "cancelled":
            query = query.filter(models.Order.status == "Cancelled")
        else:
            query = query.filter(models.Order.status == status)

    orders = query.order_by(models.Order.created_at.desc()).all()
    return [format_order_response(o) for o in orders]


@app.get(
    "/api/v1/orders/{order_id}",
    response_model=schemas.OrderResponseSchema,
    tags=["Orders"],
)
def get_order_by_id(
    order_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(user_id, db)
    order = (
        db.query(models.Order)
        .filter(
            models.Order.user_id == target_user_id,
            (models.Order.reference == order_id) | (models.Order.id == (int(order_id) if order_id.isdigit() else 0)),
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order_response(order)


@app.post(
    "/api/v1/orders",
    response_model=schemas.OrderResponseSchema,
    tags=["Orders"],
)
def create_customer_order(
    payload: schemas.CreateOrderSchema,
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(payload.user_id, db)

    # 1. Resolve Cart or provided items
    items_list = []
    subtotal = 0.0
    total_hours = payload.totalHours or 24

    if payload.items and len(payload.items) > 0:
        for it in payload.items:
            items_list.append(it.model_dump())
            subtotal += it.hourlyRate * total_hours * it.quantity
    else:
        # Load from carts table
        cart, _ = get_or_create_user_cart(target_user_id, db)
        try:
            cart_items = json.loads(cart.items_json or "[]")
        except Exception:
            cart_items = []
        for it in cart_items:
            h_rate = float(it.get("hourlyRate") or 0.0)
            qty = int(it.get("quantity") or 1)
            d_hours = int(it.get("durationHours") or total_hours)
            subtotal += h_rate * d_hours * qty
            items_list.append({
                "id": str(it.get("id") or f"item-{random.randint(100, 999)}"),
                "productId": str(it.get("productId") or it.get("id") or "p1"),
                "title": str(it.get("title") or it.get("name") or "Rental Item"),
                "brand": str(it.get("brand") or "Equipment Brand"),
                "image": str(it.get("image") or "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80"),
                "hourlyRate": h_rate,
                "quantity": qty,
                "variantName": it.get("variantName") or it.get("variantTitle") or "Standard",
            })

    discount = float(payload.discount or 0.0)
    total = max(0.0, subtotal - discount)

    # 2. Resolve Delivery Address
    delivery_address = payload.deliveryAddress
    if not delivery_address:
        if payload.addressId:
            addr = db.query(models.UserAddress).filter(
                models.UserAddress.user_id == target_user_id,
                models.UserAddress.id == (int(payload.addressId) if str(payload.addressId).isdigit() else 0),
            ).first()
            if addr:
                delivery_address = f"{addr.street}, {addr.city}, {addr.state} {addr.zip_code}"
        if not delivery_address:
            default_addr = db.query(models.UserAddress).filter(
                models.UserAddress.user_id == target_user_id,
                models.UserAddress.is_default == True,
            ).first()
            if default_addr:
                delivery_address = f"{default_addr.street}, {default_addr.city}, {default_addr.state} {default_addr.zip_code}"
            else:
                delivery_address = "Standard Delivery Address"

    # 3. Dates & Reference
    now = datetime.utcnow()
    start_dt = now
    end_dt = now + timedelta(hours=total_hours)
    start_date_str = payload.startDate or start_dt.strftime("%Y-%m-%d %H:%M")
    end_date_str = payload.endDate or end_dt.strftime("%Y-%m-%d %H:%M")
    reference = f"ORD-{random.randint(100000, 999999)}"

    # 4. Create Order Record
    new_order = models.Order(
        user_id=target_user_id,
        reference=reference,
        status="Active",
        order_date=now,
        start_date=start_date_str,
        end_date=end_date_str,
        total_hours=total_hours,
        subtotal=subtotal,
        discount=discount,
        total=total,
        delivery_address=delivery_address,
        payment_method=payload.paymentMethod or "Credit Card",
        items_json=json.dumps(items_list),
    )
    db.add(new_order)

    # 5. Clear User Cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == target_user_id).first()
    if cart:
        cart.items_json = "[]"

    db.commit()
    db.refresh(new_order)
    return format_order_response(new_order)


@app.post(
    "/api/v1/orders/{order_id}/cancel",
    response_model=list[schemas.OrderResponseSchema],
    tags=["Orders"],
)
def cancel_customer_order_endpoint(
    order_id: str,
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    target_user_id = resolve_target_user_id(user_id, db)
    order = (
        db.query(models.Order)
        .filter(
            models.Order.user_id == target_user_id,
            (models.Order.reference == order_id) | (models.Order.id == (int(order_id) if order_id.isdigit() else 0)),
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Cancelled"
    order.total = 0.0
    db.commit()

    all_orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == target_user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [format_order_response(o) for o in all_orders]


@app.get(
    "/api/v1/vendor/orders",
    tags=["Vendor"],
)
def get_vendor_orders(
    vendor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    # Resolve vendor_id
    if not vendor_id:
        # Fallback to first vendor user
        vendor = db.query(models.User).filter(models.User.role == "vendor").first()
        if not vendor:
            return []
        vendor_id = vendor.id

    # Get vendor's products
    vendor_products = db.query(models.Product).filter(models.Product.vendor_id == vendor_id).all()
    vendor_prod_ids = {p.id for p in vendor_products}

    # Fetch all orders
    orders = db.query(models.Order).all()
    vendor_orders = []

    for order in orders:
        try:
            items_data = json.loads(order.items_json or "[]")
        except Exception:
            items_data = []

        matching_items = []
        for it in items_data:
            prod_id_str = str(it.get("productId") or "")
            clean_id = None
            if prod_id_str.startswith("db-"):
                try:
                    clean_id = int(prod_id_str.replace("db-", ""))
                except ValueError:
                    pass
            else:
                try:
                    clean_id = int(prod_id_str)
                except ValueError:
                    pass

            if clean_id in vendor_prod_ids:
                matching_items.append(it)

        if len(matching_items) > 0:
            # Get customer details
            customer = db.query(models.User).filter(models.User.id == order.user_id).first()
            customer_name = customer.full_name if customer else "Customer"

            # Calculate total for vendor's items only
            vendor_total = 0.0
            item_names = []
            for it in matching_items:
                h_rate = float(it.get("hourlyRate") or 0.0)
                qty = int(it.get("quantity") or 1)
                vendor_total += h_rate * order.total_hours * qty
                item_names.append(it.get("title") or "Item")

            # Map status
            status_map = {
                "Active": "Reserved",
                "Pending Pickup": "Quotation",
                "Completed": "Picked Up",
                "Returned": "Picked Up",
                "Cancelled": "Cancelled"
            }
            mapped_status = status_map.get(order.status, "Reserved")

            invoice_status_map = {
                "Active": "Invoiced",
                "Pending Pickup": "Quotation Sent",
                "Completed": "Confirmed",
                "Returned": "Confirmed",
                "Cancelled": "Nothing to Invoice"
            }
            mapped_invoice_status = invoice_status_map.get(order.status, "Confirmed")

            # Date formatting
            try:
                # Expecting format: "2026-08-08 16:00"
                pickup_dt = datetime.strptime(order.start_date, "%Y-%m-%d %H:%M")
                pickup_str = pickup_dt.strftime("%b %d, %I:%M%p").replace(" 0", " ").lower()
            except Exception:
                pickup_str = order.start_date

            try:
                return_dt = datetime.strptime(order.end_date, "%Y-%m-%d %H:%M")
                return_str = return_dt.strftime("%b %d, %I:%M%p").replace(" 0", " ").lower()
            except Exception:
                return_str = order.end_date

            vendor_orders.append({
                "id": str(order.id),
                "reference": order.reference,
                "customer": customer_name,
                "item": ", ".join(item_names),
                "status": mapped_status,
                "pickupDate": pickup_str,
                "returnDate": return_str,
                "startDateRaw": order.start_date,
                "endDateRaw": order.end_date,
                "total": int(vendor_total),
                "invoiceStatus": mapped_invoice_status
            })

    return vendor_orders









