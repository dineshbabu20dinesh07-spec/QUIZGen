"""
tenants.py - Multi-Domain / Multi-Tenancy Module
=================================================
Provides:
  - Domain model for isolating data per organization
  - Middleware/dependency to detect domain from request
  - Helper to inject domain_id into all DB queries

How it works:
  - Each request carries a domain identifier:
      Browser requests  → read from 'Origin' header or 'X-Domain-ID' header
      API key requests  → caller sends 'X-Domain-ID' header
  - All DB operations filter by domain_id automatically
  - Default domain = "default" (for backward compatibility)
"""

import os
from typing import Optional
from fastapi import Request, Header, HTTPException, status
from datetime import datetime

# ──────────────────────────────────────────────
# Import DB (set at runtime from main.py)
# ──────────────────────────────────────────────
# These will be set by main.py after MongoDB connects
domains_collection = None
MONGO_AVAILABLE = False

def init_tenants(collection, mongo_available: bool):
    """Called from main.py after DB setup to inject the collection."""
    global domains_collection, MONGO_AVAILABLE
    domains_collection = collection
    MONGO_AVAILABLE = mongo_available


# ──────────────────────────────────────────────
# Domain Model
# ──────────────────────────────────────────────
"""
Domain document structure in MongoDB:
{
    "domain_id": "abc_college",          # Unique slug
    "name": "ABC College",               # Display name
    "allowed_origins": [                 # CORS whitelist for this domain
        "https://abc.quizgen.com",
        "http://localhost:5173"
    ],
    "plan": "basic",                     # Subscription plan
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
}
"""

DEFAULT_DOMAIN = {
    "domain_id": "default",
    "name": "Default Organization",
    "allowed_origins": ["http://localhost:5173", "http://localhost:3000"],
    "plan": "free",
    "is_active": True,
    "created_at": datetime.utcnow().isoformat(),
}

# In-memory JSON fallback for domains
_json_domains = [DEFAULT_DOMAIN]

# ──────────────────────────────────────────────
# Domain CRUD (used by admin routes)
# ──────────────────────────────────────────────

def create_domain(domain_data: dict) -> dict:
    """Create a new tenant domain."""
    if MONGO_AVAILABLE and domains_collection is not None:
        existing = domains_collection.find_one({"domain_id": domain_data["domain_id"]})
        if existing:
            raise HTTPException(status_code=400, detail="Domain ID already exists.")
        domains_collection.insert_one(domain_data)
    else:
        if any(d["domain_id"] == domain_data["domain_id"] for d in _json_domains):
            raise HTTPException(status_code=400, detail="Domain ID already exists.")
        _json_domains.append(domain_data)
    return domain_data


def get_all_domains() -> list:
    """Get all registered tenant domains."""
    if MONGO_AVAILABLE and domains_collection is not None:
        docs = list(domains_collection.find({}, {"_id": 0}))
        return docs
    return _json_domains


def get_domain_by_id(domain_id: str) -> Optional[dict]:
    """Look up a domain by its slug."""
    if MONGO_AVAILABLE and domains_collection is not None:
        return domains_collection.find_one({"domain_id": domain_id}, {"_id": 0})
    return next((d for d in _json_domains if d["domain_id"] == domain_id), None)


def get_all_allowed_origins() -> list:
    """Collect all allowed_origins from all active domains (for CORS)."""
    domains = get_all_domains()
    origins = []
    for d in domains:
        if d.get("is_active", True):
            origins.extend(d.get("allowed_origins", []))
    return list(set(origins))  # deduplicate


# ──────────────────────────────────────────────
# FastAPI Dependency — Extract Domain from Request
# ──────────────────────────────────────────────

def get_domain_id(
    request: Request,
    x_domain_id: Optional[str] = Header(default=None),
) -> str:
    """
    FastAPI dependency to extract the current tenant's domain_id.
    
    Priority:
      1. X-Domain-ID header (explicit, for API key callers)
      2. Origin header → matched against registered domains
      3. Falls back to "default"

    Usage:
        @app.get("/quizzes")
        def list_quizzes(domain_id: str = Depends(get_domain_id)):
            quizzes = db.find({"domain_id": domain_id})
    """
    # Handle direct programmatic call where x_domain_id defaults to Header object
    if x_domain_id and not isinstance(x_domain_id, str):
        x_domain_id = request.headers.get("x-domain-id")

    # 1. Explicit header (API key users)
    if x_domain_id:
        domain = get_domain_by_id(x_domain_id)
        if domain and domain.get("is_active", True):
            return x_domain_id
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Domain '{x_domain_id}' not found or inactive."
        )

    # 2. Match from Origin header
    origin = request.headers.get("origin", "")
    if origin:
        all_domains = get_all_domains()
        for domain in all_domains:
            if origin in domain.get("allowed_origins", []):
                if domain.get("is_active", True):
                    return domain["domain_id"]

    # 3. Default fallback
    return "default"
