from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

db_url = settings.database_url
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

# Create SQLAlchemy Engine
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_db_connection() -> dict:
    """Test connection to the database."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            return {
                "status": "connected",
                "database": settings.DB_NAME,
                "host": settings.DB_HOST,
                "url": db_url,
            }
    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e),
            "database": settings.DB_NAME,
            "host": settings.DB_HOST,
        }
