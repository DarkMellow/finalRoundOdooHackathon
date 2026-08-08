from sqlmodel import create_engine, Session
from app.core.config import settings

# Create engine with parameters to handle connection dropped by MySQL server
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    Automatically commits/rolls back depending on block execution, 
    and closes the session after response is completed.
    """
    with Session(engine) as session:
        yield session
