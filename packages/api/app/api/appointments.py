from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def get_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # TODO: Implement appointment listing
    return {"message": "Appointments endpoint"}