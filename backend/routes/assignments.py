from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_auth, require_admin
from ..models.user import User
from ..models.assignment import Assignment, AssignmentCreate, AssignmentUpdate, AssignmentRead
from ..services import github_service, file_service

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/", response_model=list[AssignmentRead])
def list_assignments(
    search: Optional[str] = None,
    subject_area: Optional[str] = None,
    published_only: bool = True,
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
):
    query = select(Assignment)
    if published_only:
        query = query.where(Assignment.is_published == True)
    if subject_area:
        query = query.where(Assignment.subject_area == subject_area)
    if search:
        query = query.where(
            Assignment.title.contains(search) | Assignment.description.contains(search)
        )
    query = query.order_by(Assignment.created_at.desc()).offset(skip).limit(limit)
    return session.exec(query).all()


@router.get("/{assignment_id}", response_model=AssignmentRead)
def get_assignment(assignment_id: int, session: Session = Depends(get_session)):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.post("/import", response_model=AssignmentRead)
async def import_from_github(
    body: AssignmentCreate,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    if not body.github_url:
        raise HTTPException(status_code=422, detail="github_url is required")

    owner, repo, branch = github_service.parse_github_url(body.github_url)
    files, resolved_branch = await github_service.fetch_repo_files(owner, repo, branch)

    assignment = Assignment(
        title=body.title or repo,
        description=body.description,
        subject_area=body.subject_area,
        tags=body.tags,
        github_url=body.github_url,
        github_branch=resolved_branch,
        created_by_id=user.id,
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)

    # Download files to storage
    file_paths = []
    for f in files:
        content = await github_service.download_file(f["download_url"])
        file_service.save_file(assignment.id, f["path"], content)
        file_paths.append(f["path"])

    entry = github_service.detect_entry_file(file_paths)
    if entry:
        assignment.file_path = entry
        session.add(assignment)
        session.commit()
        session.refresh(assignment)

    return assignment


@router.patch("/{assignment_id}", response_model=AssignmentRead)
def update_assignment(
    assignment_id: int,
    body: AssignmentUpdate,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.created_by_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the creator or an admin can edit this assignment")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(assignment, key, value)
    assignment.updated_at = datetime.utcnow()

    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.created_by_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the creator or an admin can delete this assignment")
    file_service.delete_assignment_files(assignment_id)
    session.delete(assignment)
    session.commit()
    return {"ok": True}


@router.get("/{assignment_id}/serve", response_class=HTMLResponse)
def serve_assignment(assignment_id: int, session: Session = Depends(get_session)):
    assignment = session.get(Assignment, assignment_id)
    if not assignment or not assignment.file_path:
        raise HTTPException(status_code=404, detail="Assignment not found")

    file_path = file_service.get_entry_file(assignment_id, assignment.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Assignment file not found on disk")

    html = file_path.read_text(encoding="utf-8")
    return HTMLResponse(content=html)
