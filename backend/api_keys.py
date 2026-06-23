"""
api_keys.py - External API Key Management Module
================================================
Provides:
  - API key generation (for external integrations)
  - Key validation as a FastAPI dependency
  - In-memory rate limiting per key (100 req/min default)

Flow:
  Admin generates key → gives to external user
  External user: GET /api/v1/quizzes -H "X-API-Key: qg_sk_abc123"
  Server validates key → returns data or 401/429
"""

import os
import secrets
import time
from typing import Optional
from datetime import datetime
from collections import defaultdict

from fastapi import Header, HTTPException, status

# ──────────────────────────────────────────────
# DB injection (set from main.py)
# ──────────────────────────────────────────────
api_keys_collection = None
MONGO_AVAILABLE = False

# In-memory fallback storage
_json_api_keys: list = []

def init_api_keys(collection, mongo_available: bool):
    """Called by main.py after DB setup."""
    global api_keys_collection, MONGO_AVAILABLE
    api_keys_collection = collection
    MONGO_AVAILABLE = mongo_available


# ──────────────────────────────────────────────
# Rate Limiting (in-memory, per key)
# ──────────────────────────────────────────────
# Structure: { api_key: [(timestamp1), (timestamp2), ...] }
_rate_limit_store: dict = defaultdict(list)
RATE_LIMIT_REQUESTS = int(os.environ.get("API_RATE_LIMIT", "100"))  # per minute
RATE_LIMIT_WINDOW = 60  # seconds

def _check_rate_limit(api_key: str) -> None:
    """
    Sliding window rate limiter.
    Raises 429 if key exceeds RATE_LIMIT_REQUESTS in RATE_LIMIT_WINDOW seconds.
    """
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    
    # Keep only timestamps within window
    _rate_limit_store[api_key] = [
        ts for ts in _rate_limit_store[api_key] if ts > window_start
    ]
    
    if len(_rate_limit_store[api_key]) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Max {RATE_LIMIT_REQUESTS} requests per minute.",
            headers={"Retry-After": "60"},
        )
    
    _rate_limit_store[api_key].append(now)


# ──────────────────────────────────────────────
# Key Generation
# ──────────────────────────────────────────────

def generate_api_key(
    owner_email: str,
    owner_role: str,
    domain_id: str,
    label: str = "",
) -> dict:
    """
    Generate a new API key for an external user.
    
    Args:
        owner_email : Who created/owns this key
        owner_role  : Role context for this key (e.g. "faculty")
        domain_id   : Which domain/tenant this key belongs to
        label       : Human-readable label (e.g. "Mobile App Integration")
    
    Returns:
        Full key document (including the raw key — shown once only!)
    """
    raw_key = "qg_sk_" + secrets.token_urlsafe(32)
    key_doc = {
        "key": raw_key,
        "owner_email": owner_email,
        "owner_role": owner_role,
        "domain_id": domain_id,
        "label": label or f"API Key for {owner_email}",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_used_at": None,
        "request_count": 0,
    }
    
    if MONGO_AVAILABLE and api_keys_collection is not None:
        api_keys_collection.insert_one(key_doc)
        key_doc.pop("_id", None)
    else:
        _json_api_keys.append(key_doc)
    
    return key_doc


def list_api_keys(domain_id: Optional[str] = None) -> list:
    """List all API keys (optionally filtered by domain). Keys are masked for security."""
    if MONGO_AVAILABLE and api_keys_collection is not None:
        query = {}
        if domain_id:
            query["domain_id"] = domain_id
        docs = list(api_keys_collection.find(query, {"_id": 0}))
    else:
        docs = _json_api_keys
        if domain_id:
            docs = [k for k in docs if k.get("domain_id") == domain_id]
    
    # Mask key for listing (show only prefix)
    return [
        {**d, "key": d["key"][:10] + "..." + d["key"][-4:]} for d in docs
    ]


def revoke_api_key(key_prefix: str, domain_id: str) -> bool:
    """Deactivate an API key (soft delete)."""
    if MONGO_AVAILABLE and api_keys_collection is not None:
        result = api_keys_collection.update_one(
            {"key": {"$regex": f"^{key_prefix}"}, "domain_id": domain_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0
    else:
        for k in _json_api_keys:
            if k["key"].startswith(key_prefix) and k.get("domain_id") == domain_id:
                k["is_active"] = False
                return True
        return False


def _lookup_key(raw_key: str) -> Optional[dict]:
    """Internal: find the full key document."""
    if MONGO_AVAILABLE and api_keys_collection is not None:
        return api_keys_collection.find_one({"key": raw_key, "is_active": True}, {"_id": 0})
    return next(
        (k for k in _json_api_keys if k["key"] == raw_key and k.get("is_active", True)),
        None
    )


def _update_key_stats(raw_key: str) -> None:
    """Update last_used_at and request_count for analytics."""
    now = datetime.utcnow().isoformat()
    if MONGO_AVAILABLE and api_keys_collection is not None:
        api_keys_collection.update_one(
            {"key": raw_key},
            {"$set": {"last_used_at": now}, "$inc": {"request_count": 1}}
        )
    else:
        for k in _json_api_keys:
            if k["key"] == raw_key:
                k["last_used_at"] = now
                k["request_count"] = k.get("request_count", 0) + 1


# ──────────────────────────────────────────────
# FastAPI Dependency — Validate API Key
# ──────────────────────────────────────────────

def require_api_key(x_api_key: Optional[str] = Header(default=None)) -> dict:
    """
    FastAPI dependency for /api/v1/* routes.
    Validates X-API-Key header, applies rate limiting.

    Usage:
        @api_v1_router.get("/quizzes")
        def list_quizzes(key_user = Depends(require_api_key)):
            ...

    Returns:
        The key document (contains owner_email, owner_role, domain_id)
    
    Raises:
        401 if no/invalid key
        403 if key is inactive
        429 if rate limit exceeded
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Include 'X-API-Key' header.",
        )
    
    key_doc = _lookup_key(x_api_key)
    if not key_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key.",
        )
    
    # Rate limit check
    _check_rate_limit(x_api_key)
    
    # Update stats async-ish (fire and forget pattern)
    try:
        _update_key_stats(x_api_key)
    except Exception:
        pass  # Don't fail the request for analytics errors
    
    return key_doc
