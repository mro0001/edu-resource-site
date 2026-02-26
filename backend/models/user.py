from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    display_name: str
    institution: Optional[str] = None
    institution_type: Optional[str] = None  # university, government, other


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    role: str = Field(default="user")  # user, verified, admin
    is_active: bool = Field(default=True)
    verification_status: str = Field(default="unverified")  # unverified, pending, verified
    verification_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    email: str
    display_name: str
    password: str
    institution: Optional[str] = None
    institution_type: Optional[str] = None


class UserRead(SQLModel):
    id: int
    email: str
    display_name: str
    role: str
    institution: Optional[str]
    institution_type: Optional[str]
    is_active: bool
    verification_status: str
    created_at: datetime


class UserUpdate(SQLModel):
    display_name: Optional[str] = None
    institution: Optional[str] = None
    institution_type: Optional[str] = None


class VerificationUpdate(SQLModel):
    verification_status: str
    verification_notes: Optional[str] = None
    role: Optional[str] = None
