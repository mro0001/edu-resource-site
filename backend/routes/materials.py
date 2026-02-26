from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_admin
from ..models.user import User
from ..models.supplementary_material import SupplementaryMaterial, MaterialCreate, MaterialRead

router = APIRouter(prefix="/assignments/{assignment_id}/materials", tags=["materials"])


@router.get("/", response_model=list[MaterialRead])
def list_materials(assignment_id: int, session: Session = Depends(get_session)):
    query = (
        select(SupplementaryMaterial)
        .where(SupplementaryMaterial.assignment_id == assignment_id)
        .order_by(SupplementaryMaterial.display_order)
    )
    return session.exec(query).all()


@router.post("/", response_model=MaterialRead)
def add_material(
    assignment_id: int,
    body: MaterialCreate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    material = SupplementaryMaterial(
        assignment_id=assignment_id,
        **body.model_dump(),
    )
    session.add(material)
    session.commit()
    session.refresh(material)
    return material


@router.delete("/{material_id}")
def delete_material(
    assignment_id: int,
    material_id: int,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    material = session.get(SupplementaryMaterial, material_id)
    if not material or material.assignment_id != assignment_id:
        raise HTTPException(status_code=404, detail="Material not found")
    session.delete(material)
    session.commit()
    return {"ok": True}
