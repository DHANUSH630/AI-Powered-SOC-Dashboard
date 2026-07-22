from fastapi import APIRouter, Depends, status, Body
from backend.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from backend.services.auth_service import register_new_user, authenticate_user, refresh_access_token
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user account."""
    return await register_new_user(user_data)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate credentials and return JWT access/refresh tokens."""
    return await authenticate_user(credentials)

@router.post("/refresh")
async def refresh(refresh_token: str = Body(..., embed=True)):
    """Generate a new access token using a valid refresh token."""
    return await refresh_access_token(refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve profile information for the authenticated user."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        createdAt=current_user.get("createdAt")
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout current user."""
    return {"message": "Successfully logged out.", "user_id": current_user["id"]}
