from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create SQLAlchemy Engine for MySQL / MariaDB connection
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
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
    """Test connection to the MySQL/MariaDB database."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return {
                "status": "connected",
                "database": settings.DB_NAME,
                "host": settings.DB_HOST,
            }
    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e),
            "database": settings.DB_NAME,
            "host": settings.DB_HOST,
        }
