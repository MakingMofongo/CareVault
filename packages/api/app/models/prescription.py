from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class PrescriptionStatus(str, enum.Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"
    DISPENSED = "dispensed"
    CANCELLED = "cancelled"


class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    medications = Column(JSON, nullable=False)  # List of medication objects
    ai_summary = Column(Text, nullable=True)
    ai_interactions = Column(JSON, nullable=True)
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.DRAFT)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    finalized_at = Column(DateTime, nullable=True)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="prescriptions")
    share_tokens = relationship("ShareToken", back_populates="prescription")