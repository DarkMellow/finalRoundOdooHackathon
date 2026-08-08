from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

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

    rent_val = payload.rent_price if payload.rent_price else payload.sales_price or 0.0

    product = models.Product(
        vendor_id=payload.vendor_id,
        name=payload.name,
        product_type=payload.product_type,
        image_url=payload.image_url,
        quantity_on_hand=int(payload.quantity_on_hand or 0),
        rent_price=rent_val,
        sales_price=rent_val,
        cost_price=0.0,
        is_published=payload.is_published,
        periodicity=payload.periodicity,
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
        query = db.query(models.Product)
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
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
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



