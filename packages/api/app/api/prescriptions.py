from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import qrcode
import io
import base64
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from app.db.database import get_db
from app.core.security import get_current_active_user, get_current_doctor
from app.models.user import User
from app.models.prescription import Prescription
from app.models.share_token import ShareToken
from pydantic import BaseModel
import secrets

router = APIRouter()


class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str


class PrescriptionCreate(BaseModel):
    appointment_id: int
    medications: List[MedicationItem]
    ai_summary: str = None
    ai_interactions: Dict[str, Any] = None


class PrescriptionResponse(BaseModel):
    id: int
    appointment_id: int
    medications: List[Dict[str, str]]
    ai_summary: str = None
    ai_interactions: Dict[str, Any] = None
    status: str
    pdf_url: Optional[str] = None
    qr_code: str = None
    share_token: str = None
    created_at: datetime
    # Derived fields from relationships
    patient_email: str = None
    patient_name: str = None
    doctor_name: str = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PrescriptionResponse])
async def get_prescriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.appointment import Appointment
    
    if current_user.role == "doctor":
        # Get prescriptions for appointments where this user is the doctor
        prescriptions = db.query(Prescription).join(Appointment).filter(
            Appointment.doctor_id == current_user.id
        ).order_by(Prescription.created_at.desc()).all()
    else:
        # Get prescriptions for appointments where this user is the patient
        prescriptions = db.query(Prescription).join(Appointment).filter(
            Appointment.patient_id == current_user.id
        ).order_by(Prescription.created_at.desc()).all()
    
    # Build response with derived fields
    prescription_list = []
    for prescription in prescriptions:
        prescription_data = {
            "id": prescription.id,
            "appointment_id": prescription.appointment_id,
            "medications": prescription.medications if isinstance(prescription.medications, list) else [],
            "ai_summary": prescription.ai_summary,
            "ai_interactions": prescription.ai_interactions,
            "status": prescription.status,
            "pdf_url": prescription.pdf_url,
            "created_at": prescription.created_at,
            "patient_email": prescription.appointment.patient.email,
            "patient_name": prescription.appointment.patient.full_name,
            "doctor_name": prescription.appointment.doctor.full_name
        }
        prescription_list.append(prescription_data)
    
    return prescription_list


@router.post("/", response_model=PrescriptionResponse)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    # Verify appointment exists and belongs to the doctor
    from app.models.appointment import Appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == prescription.appointment_id,
        Appointment.doctor_id == current_doctor.id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or access denied")
    
    # Create share token
    share_token = secrets.token_urlsafe(32)
    
    # Create prescription
    db_prescription = Prescription(
        appointment_id=prescription.appointment_id,
        medications=[med.dict() for med in prescription.medications],
        ai_summary=prescription.ai_summary,
        ai_interactions=prescription.ai_interactions,
        status="draft"
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    # Create share token record
    db_share_token = ShareToken(
        token=share_token,
        prescription_id=db_prescription.id,
        is_active=True
    )
    db.add(db_share_token)
    db.commit()
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    share_url = f"http://localhost:3000/share/{share_token}"
    qr.add_data(share_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Prepare response with derived fields
    response_data = {
        "id": db_prescription.id,
        "appointment_id": db_prescription.appointment_id,
        "medications": db_prescription.medications,
        "ai_summary": db_prescription.ai_summary,
        "ai_interactions": db_prescription.ai_interactions,
        "status": db_prescription.status,
        "pdf_url": db_prescription.pdf_url,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "share_token": share_token,
        "created_at": db_prescription.created_at,
        "patient_email": appointment.patient.email,
        "patient_name": appointment.patient.full_name,
        "doctor_name": current_doctor.full_name
    }
    
    return response_data


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Check access permissions
    if current_user.role == "doctor" and prescription.appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    elif current_user.role == "patient" and prescription.appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Get share token if exists
    share_token = db.query(ShareToken).filter(
        ShareToken.prescription_id == prescription_id,
        ShareToken.is_active == True
    ).first()
    
    qr_code = None
    share_token_value = None
    
    if share_token:
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        share_url = f"http://localhost:3000/share/{share_token.token}"
        qr.add_data(share_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        qr_code = f"data:image/png;base64,{qr_base64}"
        share_token_value = share_token.token
    
    # Return prescription with derived fields
    return {
        "id": prescription.id,
        "appointment_id": prescription.appointment_id,
        "medications": prescription.medications if isinstance(prescription.medications, list) else [],
        "ai_summary": prescription.ai_summary,
        "ai_interactions": prescription.ai_interactions,
        "status": prescription.status,
        "pdf_url": prescription.pdf_url,
        "qr_code": qr_code,
        "share_token": share_token_value,
        "created_at": prescription.created_at,
        "patient_email": prescription.appointment.patient.email,
        "patient_name": prescription.appointment.patient.full_name,
        "doctor_name": prescription.appointment.doctor.full_name
    }