from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.security import get_current_active_user, get_current_doctor
from app.models.user import User
from app.models.appointment import Appointment
from pydantic import BaseModel

router = APIRouter()


class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: str
    appointment_date: datetime
    reason: str
    status: str = "scheduled"


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    scheduled_at: datetime
    reason: str
    status: str
    created_at: datetime
    patient_name: str
    patient_email: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "doctor":
        appointments = db.query(Appointment).filter(
            Appointment.doctor_id == current_user.id
        ).order_by(Appointment.scheduled_at.desc()).all()
    else:
        appointments = db.query(Appointment).filter(
            Appointment.patient_id == current_user.id
        ).order_by(Appointment.scheduled_at.desc()).all()
    
    # Add patient details to each appointment
    appointment_list = []
    for apt in appointments:
        appointment_data = {
            "id": apt.id,
            "patient_id": apt.patient_id,
            "doctor_id": apt.doctor_id,
            "scheduled_at": apt.scheduled_at,
            "reason": apt.reason,
            "status": apt.status,
            "created_at": apt.created_at,
            "patient_name": apt.patient.full_name,
            "patient_email": apt.patient.email,
        }
        appointment_list.append(appointment_data)
    
    return appointment_list


@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Find patient by email
    patient = db.query(User).filter(User.email == appointment.patient_email).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_appointment = Appointment(
        patient_id=patient.id,
        doctor_id=current_doctor.id,
        scheduled_at=appointment.appointment_date,
        reason=appointment.reason,
        status=appointment.status,
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Return appointment with patient details
    return {
        "id": db_appointment.id,
        "patient_id": db_appointment.patient_id,
        "doctor_id": db_appointment.doctor_id,
        "scheduled_at": db_appointment.scheduled_at,
        "reason": db_appointment.reason,
        "status": db_appointment.status,
        "created_at": db_appointment.created_at,
        "patient_name": patient.full_name,
        "patient_email": patient.email,
    }


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check access permissions
    if current_user.role == "doctor" and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    elif current_user.role == "patient" and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Return appointment with patient details
    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "scheduled_at": appointment.scheduled_at,
        "reason": appointment.reason,
        "status": appointment.status,
        "created_at": appointment.created_at,
        "patient_name": appointment.patient.full_name,
        "patient_email": appointment.patient.email,
    }