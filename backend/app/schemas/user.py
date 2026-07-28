from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    profile_image_url: Optional[str] = None
    language_pref: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    profile_image_url: Optional[str] = None
    language_pref: Optional[str] = None

class UserResponse(UserBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
