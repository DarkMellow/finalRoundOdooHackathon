from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, text

class Admin(SQLModel, table=True):
    __tablename__ = "admins"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False, max_length=50)
    password_hash: str = Field(nullable=False, max_length=255)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")}
    )
