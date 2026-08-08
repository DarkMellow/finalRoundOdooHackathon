from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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
    description="EasyRental Backend API connected to MariaDB / MySQL with Customer & Admin schemas",
    version=settings.VERSION,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    # Check existing user
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Create new customer user
    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=f"hashed_{payload.password}",  # Placeholder hashing
        phone_number=payload.phone_number,
        role="customer",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create customer profile
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
# ADMIN AUTH ENDPOINTS
# ==========================================

@app.post(
    "/api/v1/admin/signup",
    response_model=schemas.AdminUserResponseSchema,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Auth"],
)
def admin_signup(payload: schemas.AdminSignUpSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An administrator with this email address already exists.",
        )

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=f"hashed_{payload.password}",
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = models.AdminProfile(
        user_id=user.id,
        department=payload.department or "Operations",
        is_superadmin=False,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    return user


@app.post(
    "/api/v1/admin/signin",
    response_model=schemas.AdminUserResponseSchema,
    tags=["Admin Auth"],
)
def admin_signin(payload: schemas.AdminSignInSchema, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.role == "admin")
        .first()
    )
    if not user or user.hashed_password != f"hashed_{payload.password}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )
    return user
