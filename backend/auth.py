"""
auth.py - JWT Cookie-Based Authentication Module
=================================================
Handles:
  - Password hashing with bcrypt
  - JWT token creation / verification
  - FastAPI dependency: get_current_user (reads session cookie)
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

# ──────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "quizgen-super-secret-change-in-prod-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("SESSION_EXPIRE_MINUTES", "1440"))  # 24 hours default

# ──────────────────────────────────────────────
import bcrypt

# ──────────────────────────────────────────────
# Password Hashing
# ──────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pwd_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against stored bcrypt hash."""
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# ──────────────────────────────────────────────
# JWT Token Management
# ──────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT token.
    
    Args:
        data: Payload dict (e.g. {"sub": email, "role": "student", "domain_id": "default"})
        expires_delta: Token lifetime. Defaults to ACCESS_TOKEN_EXPIRE_MINUTES.
    
    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    
    Returns:
        Decoded payload dict.
    
    Raises:
        HTTPException 401 if invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please login again.",
        )

# ──────────────────────────────────────────────
# FastAPI Dependency — Get Current User
# ──────────────────────────────────────────────

def get_current_user(session: Optional[str] = Cookie(default=None)) -> dict:
    """
    FastAPI dependency that reads the 'session' HttpOnly cookie,
    verifies the JWT, and returns the user payload.

    Usage in routes:
        @app.get("/me")
        def me(user = Depends(get_current_user)):
            return user

    Raises:
        HTTPException 401 if no cookie or invalid token.
    """
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login.",
        )
    return decode_access_token(session)


def get_optional_user(session: Optional[str] = Cookie(default=None)) -> Optional[dict]:
    """
    Same as get_current_user but returns None instead of raising error.
    Use for routes that work for both authenticated and guest users.
    """
    if not session:
        return None
    try:
        return decode_access_token(session)
    except HTTPException:
        return None
