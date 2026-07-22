"""
Authentication and User Management Service.
Handles user creation, credential validation, JWT issuance, and profile management.
"""

from fastapi import HTTPException, status
from backend.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from backend.auth.password import hash_password, verify_password
from backend.auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from backend.database.crud import create_user, get_user_by_email, get_user_by_id

async def register_new_user(user_in: UserCreate) -> TokenResponse:
    """Register a new user account in MongoDB."""
    existing = await get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_dict = {
        "name": user_in.name,
        "email": user_in.email,
        "password": hash_password(user_in.password),
        "role": user_in.role.value,
    }

    created = await create_user(user_dict)
    
    token_data = {"sub": created["id"], "email": created["email"], "role": created["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=created["id"],
        name=created["name"],
        email=created["email"],
        role=created["role"],
        createdAt=created.get("createdAt")
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

async def authenticate_user(credentials: UserLogin) -> TokenResponse:
    """Validate user credentials and return access + refresh tokens."""
    user = await get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token_data = {"sub": user["id"], "email": user["email"], "role": user["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        createdAt=user.get("createdAt")
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

async def refresh_access_token(refresh_token_str: str) -> dict:
    """Exchange a valid refresh token for a new access token."""
    token_data = verify_token(refresh_token_str, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user = await get_user_by_id(token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token no longer exists."
        )

    new_token_payload = {"sub": user["id"], "email": user["email"], "role": user["role"]}
    new_access_token = create_access_token(new_token_payload)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
