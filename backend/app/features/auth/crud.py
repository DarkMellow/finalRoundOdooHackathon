from typing import Optional
from sqlmodel import Session, select
from app.features.auth.models import Admin
from app.core.security import get_password_hash

def get_admin_by_username(session: Session, username: str) -> Optional[Admin]:
    """
    Retrieve an administrator record by username.
    """
    statement = select(Admin).where(Admin.username == username)
    return session.exec(statement).first()

def create_admin(session: Session, username: str, password_plain: str) -> Admin:
    """
    Create a new administrator with a secure password hash.
    """
    password_hash = get_password_hash(password_plain)
    db_admin = Admin(username=username, password_hash=password_hash)
    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)
    return db_admin
