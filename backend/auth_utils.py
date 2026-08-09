# auth_utils.py
import bcrypt

def _truncate_to_72_bytes(password: str) -> bytes:
    """Bcrypt only considers the first 72 bytes of a password.
    Truncate safely on a UTF-8 boundary so we never split a
    multi-byte character and produce garbage/invalid input."""
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) <= 72:
        return pw_bytes
    truncated = pw_bytes[:72]
    while truncated:
        try:
            truncated.decode("utf-8")
            return truncated
        except UnicodeDecodeError:
            truncated = truncated[:-1]
    return b""

def hash_password(plain_password: str) -> str:
    safe_bytes = _truncate_to_72_bytes(plain_password)
    hashed = bcrypt.hashpw(safe_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_bytes = _truncate_to_72_bytes(plain_password)
    try:
        return bcrypt.checkpw(safe_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False