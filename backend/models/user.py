from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional
from datetime import datetime

class Role(str, Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = Role.ANALYST

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    createdAt: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
