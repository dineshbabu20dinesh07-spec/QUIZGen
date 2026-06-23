"""
rbac.py - Role-Based Access Control (RBAC) Module
==================================================
Defines what each role can do and provides FastAPI
dependencies to protect routes by role or permission.

Roles:
  - student  : Can take quizzes, view own attempts
  - faculty  : Can upload/create quizzes, view quiz attempts
  - admin    : Full access to everything
  - superadmin: Full access + manage domains and tenants
"""

from fastapi import Depends, HTTPException, status
from typing import List
from auth import get_current_user

# ──────────────────────────────────────────────
# Permission Definitions
# ──────────────────────────────────────────────
PERMISSIONS = {
    "student": [
        "take_quiz",
        "view_own_attempts",
        "view_available_quizzes",
    ],
    "faculty": [
        "take_quiz",
        "upload_quiz",
        "create_quiz",
        "view_faculty_quizzes",
        "view_quiz_attempts",
        "view_own_attempts",
        "view_available_quizzes",
    ],
    "admin": [
        "*"  # Wildcard — all permissions
    ],
    "superadmin": [
        "*",           # All permissions
        "manage_domains",
        "manage_api_keys",
        "manage_all_users",
    ],
}

# ──────────────────────────────────────────────
# Helper
# ──────────────────────────────────────────────

def has_permission(role: str, permission: str) -> bool:
    """Check if a role has a specific permission."""
    perms = PERMISSIONS.get(role, [])
    return "*" in perms or permission in perms


def get_role_permissions(role: str) -> List[str]:
    """Get all permissions for a given role."""
    return PERMISSIONS.get(role, [])

# ──────────────────────────────────────────────
# FastAPI Dependencies
# ──────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """
    FastAPI dependency factory — allows only users with specified roles.

    Usage:
        @app.post("/upload")
        def upload(user = Depends(require_role("faculty", "admin"))):
            ...

    Raises:
        401 if not logged in
        403 if logged in but wrong role
    """
    def _check(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(allowed_roles)}. Your role: '{role}'",
            )
        return current_user
    return _check


def require_permission(permission: str):
    """
    FastAPI dependency factory — allows only users with a specific permission.

    Usage:
        @app.post("/save-quiz")
        def save(user = Depends(require_permission("create_quiz"))):
            ...
    """
    def _check(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "")
        if not has_permission(role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Missing permission: '{permission}'",
            )
        return current_user
    return _check


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Shortcut dependency — admin or superadmin only."""
    role = current_user.get("role", "")
    if role not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


def require_superadmin(current_user: dict = Depends(get_current_user)) -> dict:
    """Shortcut dependency — superadmin only (domain management)."""
    role = current_user.get("role", "")
    if role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required.",
        )
    return current_user
