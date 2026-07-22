from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.auth.jwt_handler import verify_token
from backend.database.crud import get_user_by_id
from backend.models.user import Role
from typing import List

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency to extract and verify the current authenticated user from MongoDB."""
    token_data = verify_token(token)
    if not token_data or not token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await get_user_by_id(token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_roles(allowed_roles: List[Role]):
    """FastAPI dependency factory enforcing Role-Based Access Control (RBAC)."""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "").upper()
        allowed_str_roles = [r.value.upper() for r in allowed_roles]
        if user_role not in allowed_str_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role}' is not authorized to perform this operation."
            )
        return current_user
    return role_checker
