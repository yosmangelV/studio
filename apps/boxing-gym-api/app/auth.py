from functools import lru_cache
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()


@lru_cache
def _jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.supabase_jwks_url)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[signing_key.algorithm_name],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def _permissions(user: dict) -> list[str]:
    return user.get("app_metadata", {}).get("permissions", [])


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if "admin" not in _permissions(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


def require_instructor(user: dict = Depends(get_current_user)) -> dict:
    perms = _permissions(user)
    if "instructor" not in perms and "admin" not in perms:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor access required",
        )
    return user


def require_student(user: dict = Depends(get_current_user)) -> dict:
    perms = _permissions(user)
    if "student" not in perms and "admin" not in perms:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required",
        )
    return user
