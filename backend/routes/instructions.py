from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_admin
from ..models.user import User
from ..models.instruction_page import (
    InstructionPage, InstructionPageCreate, InstructionPageUpdate, InstructionPageRead,
)

router = APIRouter(prefix="/instructions", tags=["instructions"])


def _to_read(page: InstructionPage, author_name: Optional[str] = None) -> InstructionPageRead:
    return InstructionPageRead(
        id=page.id,
        title=page.title,
        slug=page.slug,
        content=page.content,
        category=page.category,
        display_order=page.display_order,
        author_id=page.author_id,
        author_name=author_name,
        is_published=page.is_published,
        created_at=page.created_at,
        updated_at=page.updated_at,
    )


@router.get("/", response_model=list[InstructionPageRead])
def list_pages(
    category: Optional[str] = None,
    session: Session = Depends(get_session),
):
    query = (
        select(InstructionPage, User.display_name)
        .join(User, InstructionPage.author_id == User.id)
        .where(InstructionPage.is_published == True)
        .order_by(InstructionPage.category, InstructionPage.display_order)
    )
    if category:
        query = query.where(InstructionPage.category == category)
    results = session.exec(query).all()
    return [_to_read(page, name) for page, name in results]


@router.get("/{slug}", response_model=InstructionPageRead)
def get_page(slug: str, session: Session = Depends(get_session)):
    query = (
        select(InstructionPage, User.display_name)
        .join(User, InstructionPage.author_id == User.id)
        .where(InstructionPage.slug == slug)
    )
    result = session.exec(query).first()
    if not result:
        raise HTTPException(status_code=404, detail="Instruction page not found")
    page, author_name = result
    return _to_read(page, author_name)


@router.post("/", response_model=InstructionPageRead)
def create_page(
    body: InstructionPageCreate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(InstructionPage).where(InstructionPage.slug == body.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    page = InstructionPage(**body.model_dump(), author_id=admin.id)
    session.add(page)
    session.commit()
    session.refresh(page)
    return _to_read(page, admin.display_name)


@router.patch("/{page_id}", response_model=InstructionPageRead)
def update_page(
    page_id: int,
    body: InstructionPageUpdate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    page = session.get(InstructionPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Instruction page not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(page, key, value)
    page.updated_at = datetime.utcnow()

    session.add(page)
    session.commit()
    session.refresh(page)
    return _to_read(page, admin.display_name)


@router.delete("/{page_id}")
def delete_page(
    page_id: int,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    page = session.get(InstructionPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Instruction page not found")
    session.delete(page)
    session.commit()
    return {"ok": True}
