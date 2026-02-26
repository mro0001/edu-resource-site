from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class CommentBase(SQLModel):
    assignment_id: int = Field(foreign_key="assignment.id")
    user_id: int = Field(foreign_key="user.id")
    content: str
    parent_id: Optional[int] = Field(default=None, foreign_key="comment.id")


class Comment(CommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CommentCreate(SQLModel):
    content: str
    parent_id: Optional[int] = None


class CommentRead(SQLModel):
    id: int
    assignment_id: int
    user_id: int
    user_display_name: Optional[str] = None
    content: str
    parent_id: Optional[int]
    created_at: datetime
    updated_at: datetime
