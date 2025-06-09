from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import all models here to ensure they are registered
    from app.models import user, appointment, prescription, share_token
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create default users if they don't exist
    from app.core.security import get_password_hash
    db = SessionLocal()
    
    # Check if default doctor exists
    doctor = db.query(user.User).filter(user.User.email == "doctor@carevault.com").first()
    if not doctor:
        doctor = user.User(
            email="doctor@carevault.com",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Sarah Smith",
            role="doctor",
            is_active=True,
        )
        db.add(doctor)
    
    # Check if default patient exists
    patient = db.query(user.User).filter(user.User.email == "patient@carevault.com").first()
    if not patient:
        patient = user.User(
            email="patient@carevault.com",
            hashed_password=get_password_hash("patient123"),
            full_name="Jane Doe",
            role="patient",
            is_active=True,
        )
        db.add(patient)
    
    db.commit()
    db.close()
    
    print("Database initialized with default users:")
    print("  Doctor: doctor@carevault.com / doctor123")
    print("  Patient: patient@carevault.com / patient123")