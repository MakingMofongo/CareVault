from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    
    class Config:
        use_enum_values = True


class UserResponseBase(BaseModel):
    email: str  # Use regular str for responses to avoid validation issues
    full_name: str
    role: UserRole
    
    class Config:
        use_enum_values = True


class UserCreate(UserBase):
    password: str
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    phone_number: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    license_number: Optional[str] = None
    specialization: Optional[str] = None


class UserResponse(UserResponseBase):
    id: int
    is_active: bool
    created_at: datetime
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    phone_number: Optional[str] = None
    
    class Config:
        from_attributes = True
        # Ensure enums are serialized as their string values
        use_enum_values = True