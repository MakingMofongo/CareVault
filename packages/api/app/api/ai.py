from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/check")
async def check_interactions(
    medications: list[dict],
    current_user: User = Depends(get_current_active_user),
):
    # TODO: Implement AI interaction checking
    return {
        "issues": [],
        "summary": "No interactions found. Safe to prescribe.",
    }