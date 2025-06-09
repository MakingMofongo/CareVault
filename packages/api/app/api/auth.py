from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_active_user,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserResponse

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    print(f"LOGIN ATTEMPT (JSON): {login_data.email}")
    
    # Try to find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # If user not found, create a demo user on the fly
    if not user:
        print(f"User not found, creating demo user: {login_data.email}")
        try:
            from app.core.security import get_password_hash
            from app.models.user import UserRole
            
            # Determine role from email or default to patient
            email_lower = login_data.email.lower()
            if "doctor" in email_lower or "dr." in email_lower or "physician" in email_lower:
                role = UserRole.DOCTOR
                full_name = "Dr. " + login_data.email.split("@")[0].replace(".", " ").title()
            else:
                role = UserRole.PATIENT
                full_name = login_data.email.split("@")[0].replace(".", " ").title()
            
            print(f"Auto-creating user with role: {role} and name: {full_name}")
            
            user = User(
                email=login_data.email,
                hashed_password=get_password_hash("demo123"),
                full_name=full_name,
                role=role,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created new demo user: {user.full_name} ({user.role})")
        except Exception as e:
            print(f"Failed to create user: {e}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create demo user",
            )
    
    print(f"LOGIN SUCCESS (JSON): {user.full_name} ({user.role}) - Role type: {type(user.role)}")
    
    # DEMO MODE: Accept ANY password, NO verification at all
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Ensure role is properly serialized
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "license_number": user.license_number,
        "specialization": user.specialization,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "phone_number": user.phone_number
    }
    
    print(f"Returning user data (JSON): {user_dict}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
    }


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    print(f"LOGIN ATTEMPT: {form_data.username}")
    
    # Try to find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # If user not found, create a demo user on the fly
    if not user:
        print(f"User not found, creating demo user: {form_data.username}")
        # For demo purposes, create any missing user automatically
        try:
            from app.core.security import get_password_hash
            from app.models.user import UserRole
            
            # Determine role from email or default to patient
            email_lower = form_data.username.lower()
            if "doctor" in email_lower or "dr." in email_lower or "physician" in email_lower:
                role = UserRole.DOCTOR
                full_name = "Dr. " + form_data.username.split("@")[0].replace(".", " ").title()
            else:
                role = UserRole.PATIENT
                full_name = form_data.username.split("@")[0].replace(".", " ").title()
            
            print(f"Auto-creating user with role: {role} and name: {full_name}")
            
            user = User(
                email=form_data.username,
                hashed_password=get_password_hash("demo123"),  # Default password
                full_name=full_name,
                role=role,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created new demo user: {user.full_name} ({user.role})")
        except Exception as e:
            print(f"Failed to create user: {e}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create demo user",
            )
    
    print(f"LOGIN SUCCESS: {user.full_name} ({user.role}) - Role type: {type(user.role)}")
    
    # DEMO MODE: Accept ANY password, NO verification at all
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Ensure role is properly serialized
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "license_number": user.license_number,
        "specialization": user.specialization,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "phone_number": user.phone_number
    }
    
    print(f"Returning user data: {user_dict}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
    }


@router.post("/demo-login", response_model=Token)
async def demo_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Demo login endpoint that bypasses password verification for easier testing"""
    print(f"DEMO LOGIN ATTEMPT: {form_data.username}")
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        print(f"Demo user not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEMO LOGIN SUCCESS: {user.full_name} ({user.role})")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Ensure role is properly serialized
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "license_number": user.license_number,
        "specialization": user.specialization,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "phone_number": user.phone_number
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
    }


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user