"""Auth request/response schemas matching the frontend form fields."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    experience_level: str = Field(default="beginner")  # beginner/intermediate/advanced


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_initials: str
    experience_level: str
    xp: int
    current_level: int
    streak: int
    university_id: Optional[str] = None
    university_role: Optional[str] = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
