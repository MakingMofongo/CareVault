from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.db.database import get_db
from app.core.security import get_current_active_user, get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str
    license_number: str = None
    specialization: str = None
    date_of_birth: str = None
    phone_number: str = None


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    return current_user


@router.get("/", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Only allow doctors to list users for now
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in database")
        
        # Filter out users with invalid data that might cause validation errors
        valid_users = []
        for user in users:
            try:
                # Test if the user can be serialized
                user_dict = {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role,
                    "is_active": user.is_active,
                    "created_at": user.created_at,
                    "license_number": user.license_number,
                    "specialization": user.specialization,
                    "date_of_birth": user.date_of_birth,
                    "phone_number": user.phone_number
                }
                valid_users.append(user)
                print(f"Valid user: {user.email}")
            except Exception as e:
                print(f"Skipping invalid user {user.id}: {e}")
                continue
        
        return valid_users
    except Exception as e:
        print(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    print(f"Creating user with data: {user_data}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"User already exists: {user_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user_data.role not in ["doctor", "patient"]:
        print(f"Invalid role: {user_data.role}")
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'doctor' or 'patient'")
    
    # Create new user
    try:
        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            role=UserRole.DOCTOR if user_data.role == "doctor" else UserRole.PATIENT,
            license_number=user_data.license_number,
            specialization=user_data.specialization,
            phone_number=user_data.phone_number
        )
        
        # Handle date_of_birth if provided
        if user_data.date_of_birth:
            try:
                db_user.date_of_birth = datetime.fromisoformat(user_data.date_of_birth)
            except ValueError:
                print(f"Invalid date format: {user_data.date_of_birth}")
                raise HTTPException(status_code=400, detail="Invalid date format for date_of_birth")
        
        print(f"Adding user to database: {db_user.email}")
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print(f"User created successfully: {db_user.id}")
        return db_user
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.post("/demo-setup")
async def setup_demo_data(
    db: Session = Depends(get_db),
):
    """Create demo appointments for existing patients"""
    from app.models.appointment import Appointment
    from datetime import datetime, timedelta
    
    try:
        # Find demo doctor
        doctor = db.query(User).filter(User.email == "doctor@carevault.com").first()
        if not doctor:
            return {"error": "Demo doctor not found"}
        
        # Find demo patients
        john = db.query(User).filter(User.email == "john.doe@example.com").first()
        jane = db.query(User).filter(User.email == "jane.smith@example.com").first()
        
        created_appointments = []
        
        if john:
            # Create appointment for John
            john_apt = Appointment(
                patient_id=john.id,
                doctor_id=doctor.id,
                scheduled_at=datetime.now() + timedelta(days=1),
                reason="Regular checkup and health assessment",
                status="scheduled"
            )
            db.add(john_apt)
            created_appointments.append(f"Appointment for {john.full_name}")
        
        if jane:
            # Create appointment for Jane  
            jane_apt = Appointment(
                patient_id=jane.id,
                doctor_id=doctor.id,
                scheduled_at=datetime.now() + timedelta(days=2),
                reason="Follow-up consultation",
                status="scheduled"
            )
            db.add(jane_apt)
            created_appointments.append(f"Appointment for {jane.full_name}")
        
        db.commit()
        
        return {
            "message": "Demo data created",
            "appointments": created_appointments
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}