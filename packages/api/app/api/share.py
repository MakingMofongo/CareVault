from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db

router = APIRouter()


@router.get("/{token}")
async def get_shared_prescription(
    token: str,
    db: Session = Depends(get_db),
):
    # TODO: Implement share token validation and prescription retrieval
    return {"message": f"Share token: {token}"}