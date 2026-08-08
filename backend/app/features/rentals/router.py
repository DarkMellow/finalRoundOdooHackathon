from fastapi import APIRouter

router = APIRouter(prefix="/rentals", tags=["rentals"])

@router.get("")
async def list_rentals():
    return []

# Dashboard stats endpoint (can also be in a separate router, but keeping it here for simplicity)
dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@dashboard_router.get("/stats")
async def get_dashboard_stats():
    return {
        "active_rentals": 0,
        "due_today": 0,
        "overdue": 0,
        "deposits_held": 0.00
    }
