import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_auth
from ..models.user import User
from ..models.assignment import Assignment
from ..models.supplementary_material import SupplementaryMaterial, MaterialCreate, MaterialRead

router = APIRouter(prefix="/assignments/{assignment_id}/materials", tags=["materials"])

MATERIALS_DIR = Path(__file__).resolve().parent.parent / "storage" / "materials"
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".csv", ".txt", ".md", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".zip", ".html", ".json",
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _check_owner_or_admin(assignment: Assignment, user: User):
    """Raise 403 if the user is neither the assignment creator nor an admin."""
    if assignment.created_by_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the assignment owner or an admin can manage materials")


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
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    _check_owner_or_admin(assignment, user)

    material = SupplementaryMaterial(
        assignment_id=assignment_id,
        **body.model_dump(),
    )
    session.add(material)
    session.commit()
    session.refresh(material)
    return material


@router.post("/upload", response_model=MaterialRead)
async def upload_material(
    assignment_id: int,
    file: UploadFile = File(...),
    title: str = Form(...),
    material_type: str = Form("document"),
    excerpt: Optional[str] = Form(None),
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    _check_owner_or_admin(assignment, user)

    # Validate extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"File type '{suffix}' is not allowed")

    # Read content and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=422, detail="File exceeds 20 MB limit")

    # Save to disk
    dest_dir = MATERIALS_DIR / str(assignment_id)
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Use a unique filename to avoid collisions
    material = SupplementaryMaterial(
        assignment_id=assignment_id,
        material_type=material_type,
        title=title,
        excerpt=excerpt,
        original_filename=file.filename,
    )
    session.add(material)
    session.commit()
    session.refresh(material)

    safe_name = f"{material.id}_{file.filename}"
    dest_path = dest_dir / safe_name
    dest_path.write_bytes(content)

    material.file_path = f"{assignment_id}/{safe_name}"
    session.add(material)
    session.commit()
    session.refresh(material)
    return material


@router.get("/{material_id}/download")
def download_material(
    assignment_id: int,
    material_id: int,
    session: Session = Depends(get_session),
):
    material = session.get(SupplementaryMaterial, material_id)
    if not material or material.assignment_id != assignment_id or not material.file_path:
        raise HTTPException(status_code=404, detail="Material not found")

    file_path = MATERIALS_DIR / material.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_path,
        filename=material.original_filename or file_path.name,
        media_type="application/octet-stream",
    )


@router.delete("/{material_id}")
def delete_material(
    assignment_id: int,
    material_id: int,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    _check_owner_or_admin(assignment, user)

    material = session.get(SupplementaryMaterial, material_id)
    if not material or material.assignment_id != assignment_id:
        raise HTTPException(status_code=404, detail="Material not found")

    # Remove file from disk if it's an upload
    if material.file_path:
        file_path = MATERIALS_DIR / material.file_path
        if file_path.exists():
            file_path.unlink()

    session.delete(material)
    session.commit()
    return {"ok": True}
