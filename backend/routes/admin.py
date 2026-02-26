from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_admin
from ..models.user import User, UserRead, VerificationUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
def list_users(
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    users = session.exec(select(User).order_by(User.created_at.desc())).all()
    return users


@router.patch("/users/{user_id}/verify", response_model=UserRead)
def verify_user(
    user_id: int,
    body: VerificationUpdate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = body.verification_status
    if body.verification_notes is not None:
        user.verification_notes = body.verification_notes
    if body.role is not None:
        user.role = body.role
    user.updated_at = datetime.utcnow()

    session.add(user)
    session.commit()
    session.refresh(user)
    return user
