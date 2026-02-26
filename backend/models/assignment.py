from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, JSON


class AssignmentBase(SQLModel):
    title: str
    description: Optional[str] = None
    subject_area: Optional[str] = None
    tags: list[str] = Field(default=[], sa_column=Column(JSON))
    github_url: Optional[str] = None
    github_branch: Optional[str] = None
    file_path: Optional[str] = None
    is_published: bool = Field(default=True)


class Assignment(AssignmentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AssignmentCreate(SQLModel):
    title: str
    description: Optional[str] = None
    subject_area: Optional[str] = None
    tags: list[str] = []
    github_url: Optional[str] = None
    github_branch: Optional[str] = None


class AssignmentUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject_area: Optional[str] = None
    tags: Optional[list[str]] = None
    is_published: Optional[bool] = None


class AssignmentRead(SQLModel):
    id: int
    title: str
    description: Optional[str]
    subject_area: Optional[str]
    tags: list[str]
    github_url: Optional[str]
    github_branch: Optional[str]
    file_path: Optional[str]
    is_published: bool
    created_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime
