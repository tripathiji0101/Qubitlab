"""Authentication endpoints — register, login, refresh, me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user_id,
)
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    UserResponse,
    AuthResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _initials(name: str) -> str:
    parts = name.strip().split()
    return "".join(p[0].upper() for p in parts[:2]) if parts else "?"


def _user_response(u: User) -> UserResponse:
    return UserResponse(
        id=u.id,
        name=u.name,
        email=u.email,
        role=u.role,
        avatar_initials=u.avatar_initials,
        experience_level=u.experience_level,
        xp=u.xp,
        current_level=u.current_level,
        streak=u.streak,
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role="student",
        avatar_initials=_initials(body.name),
        experience_level=body.experience_level,
    )
    db.add(user)
    await db.flush()

    access = create_access_token(user.id, user.role)
    refresh = create_refresh_token(user.id)

    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_response(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access = create_access_token(user.id, user.role)
    refresh = create_refresh_token(user.id)

    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_response(user),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access = create_access_token(user.id, user.role)
    new_refresh = create_refresh_token(user.id)

    return AuthResponse(
        access_token=access,
        refresh_token=new_refresh,
        user=_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)
