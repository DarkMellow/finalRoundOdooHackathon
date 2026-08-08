from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RMS Backend API",
    description="Rental Management System API Backend",
    version="0.1.0",
)

# Configure CORS middleware to allow cross-origin requests from frontend
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
        "message": "Welcome to the Rental Management System API",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
