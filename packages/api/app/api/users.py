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
    """Create demo users and appointments for testing"""
    from app.models.appointment import Appointment
    from datetime import datetime, timedelta
    
    try:
        created_items = []
        
        # Create demo doctor if not exists
        doctor = db.query(User).filter(User.email == "doctor@demo.com").first()
        if not doctor:
            doctor = User(
                email="doctor@demo.com",
                hashed_password=get_password_hash("demo123"),
                full_name="Dr. Sarah Johnson",
                role=UserRole.DOCTOR,
                license_number="MD12345",
                specialization="Family Medicine",
                phone_number="(555) 123-4567"
            )
            db.add(doctor)
            created_items.append("Demo Doctor: Dr. Sarah Johnson")
        
        # Create demo patients if not exist
        patients_data = [
            {
                "email": "john.doe@demo.com",
                "full_name": "John Doe",
                "phone": "(555) 987-6543",
                "dob": "1985-03-15"
            },
            {
                "email": "jane.smith@demo.com", 
                "full_name": "Jane Smith",
                "phone": "(555) 456-7890",
                "dob": "1990-07-22"
            },
            {
                "email": "mike.wilson@demo.com",
                "full_name": "Michael Wilson", 
                "phone": "(555) 234-5678",
                "dob": "1978-11-08"
            }
        ]
        
        created_patients = []
        for patient_data in patients_data:
            existing_patient = db.query(User).filter(User.email == patient_data["email"]).first()
            if not existing_patient:
                patient = User(
                    email=patient_data["email"],
                    hashed_password=get_password_hash("demo123"),
                    full_name=patient_data["full_name"],
                    role=UserRole.PATIENT,
                    phone_number=patient_data["phone"],
                    date_of_birth=datetime.fromisoformat(patient_data["dob"])
                )
                db.add(patient)
                created_patients.append(patient)
                created_items.append(f"Demo Patient: {patient_data['full_name']}")
            else:
                created_patients.append(existing_patient)
        
        # Commit users first
        db.commit()
        
        # Refresh doctor to get ID
        if doctor.id is None:
            db.refresh(doctor)
        
        # Create demo appointments
        appointment_data = [
            {
                "patient": created_patients[0],
                "days_offset": 1,
                "reason": "Annual physical examination",
                "status": "scheduled"
            },
            {
                "patient": created_patients[1], 
                "days_offset": 2,
                "reason": "Follow-up consultation for medication review",
                "status": "scheduled"
            },
            {
                "patient": created_patients[2],
                "days_offset": -1,
                "reason": "Routine check-up and blood work review",
                "status": "completed"
            },
            {
                "patient": created_patients[0],
                "days_offset": -7,
                "reason": "Initial consultation for back pain",
                "status": "completed"
            }
        ]
        
        for apt_data in appointment_data:
            # Check if appointment already exists
            existing_apt = db.query(Appointment).filter(
                Appointment.patient_id == apt_data["patient"].id,
                Appointment.doctor_id == doctor.id,
                Appointment.reason == apt_data["reason"]
            ).first()
            
            if not existing_apt:
                appointment = Appointment(
                    patient_id=apt_data["patient"].id,
                    doctor_id=doctor.id,
                    scheduled_at=datetime.now() + timedelta(days=apt_data["days_offset"]),
                    reason=apt_data["reason"],
                    status=apt_data["status"]
                )
                db.add(appointment)
                created_items.append(f"Appointment: {apt_data['patient'].full_name} - {apt_data['reason']}")
        
        db.commit()
        
        return {
            "message": "Demo data created successfully!",
            "created": created_items,
            "note": "All demo accounts use password 'demo123' or can be accessed without password via account switcher"
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}


@router.get("/demo", response_model=list[UserResponse])
async def list_demo_users(db: Session = Depends(get_db)):
    """Public endpoint to list ALL users for account switching - NO AUTH REQUIRED"""
    try:
        # Return ALL users for demo purposes (no authentication required)
        users = db.query(User).all()
        print(f"Found {len(users)} users for demo switcher")
        return users
    except Exception as e:
        print(f"Error listing demo users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list demo users: {str(e)}")