from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_auth
from ..models.user import User
from ..models.comment import Comment, CommentCreate, CommentRead

router = APIRouter(prefix="/assignments/{assignment_id}/comments", tags=["comments"])


@router.get("/", response_model=list[CommentRead])
def list_comments(assignment_id: int, session: Session = Depends(get_session)):
    query = (
        select(Comment, User.display_name)
        .join(User, Comment.user_id == User.id)
        .where(Comment.assignment_id == assignment_id)
        .order_by(Comment.created_at)
    )
    results = session.exec(query).all()
    comments = []
    for comment, display_name in results:
        comments.append(CommentRead(
            id=comment.id,
            assignment_id=comment.assignment_id,
            user_id=comment.user_id,
            user_display_name=display_name,
            content=comment.content,
            parent_id=comment.parent_id,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        ))
    return comments


@router.post("/", response_model=CommentRead)
def add_comment(
    assignment_id: int,
    body: CommentCreate,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    comment = Comment(
        assignment_id=assignment_id,
        user_id=user.id,
        content=body.content,
        parent_id=body.parent_id,
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return CommentRead(
        id=comment.id,
        assignment_id=comment.assignment_id,
        user_id=comment.user_id,
        user_display_name=user.display_name,
        content=comment.content,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete("/{comment_id}")
def delete_comment(
    assignment_id: int,
    comment_id: int,
    user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    comment = session.get(Comment, comment_id)
    if not comment or comment.assignment_id != assignment_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(comment)
    session.commit()
    return {"ok": True}
