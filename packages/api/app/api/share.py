from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
from app.db.database import get_db
from app.core.security import get_current_patient
from app.models.user import User
from app.models.prescription import Prescription
from app.models.share_token import ShareToken

router = APIRouter()


@router.get("/{token}")
async def get_shared_prescription(
    token: str,
    db: Session = Depends(get_db),
):
    # Find active share token
    share_token = db.query(ShareToken).filter(
        ShareToken.token == token,
        ShareToken.is_active == True
    ).first()
    
    if not share_token:
        raise HTTPException(status_code=404, detail="Invalid or expired share token")
    
    # Get prescription
    prescription = db.query(Prescription).filter(
        Prescription.id == share_token.prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Get doctor info
    doctor = db.query(User).filter(User.id == prescription.doctor_id).first()
    
    # Convert medications from JSON string if needed
    medications = prescription.medications
    if isinstance(medications, str):
        medications = json.loads(medications)
    
    interactions = prescription.interactions
    if interactions and isinstance(interactions, str):
        interactions = json.loads(interactions)
    
    return {
        "id": prescription.id,
        "patient_email": prescription.patient_email,
        "doctor_name": doctor.username if doctor else "Unknown Doctor",
        "diagnosis": prescription.diagnosis,
        "medications": medications,
        "interactions": interactions,
        "created_at": prescription.created_at,
        "verification_token": token[:8] + "..." + token[-8:]  # Partial token for verification
    }


@router.delete("/prescriptions/{prescription_id}")
async def revoke_prescription_access(
    prescription_id: int,
    current_patient: User = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    # Verify prescription belongs to patient
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.patient_email == current_patient.email
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found or access denied")
    
    # Deactivate all share tokens for this prescription
    share_tokens = db.query(ShareToken).filter(
        ShareToken.prescription_id == prescription_id,
        ShareToken.is_active == True
    ).all()
    
    for token in share_tokens:
        token.is_active = False
    
    db.commit()
    
    return {"message": "Prescription access revoked successfully"}