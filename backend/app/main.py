from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.features.auth.router import router as auth_router
from app.features.products.router import router as products_router
from app.features.rentals.router import router as rentals_router, dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions (e.g., establishing connections)
    yield
    # Shutdown actions (e.g., closing connections)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
# Wildcard is disabled if allow_credentials is True, which is required for HTTPOnly cookies
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include core feature routers under /api prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(rentals_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """
    Health check root endpoint
    """
    return {
        "status": "online",
        "project": settings.PROJECT_NAME
    }
