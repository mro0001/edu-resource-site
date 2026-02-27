from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class SupplementaryMaterialBase(SQLModel):
    assignment_id: int = Field(foreign_key="assignment.id")
    material_type: str = Field(default="article")  # article, github_repo, reference, video, document, other
    title: str
    url: Optional[str] = None
    file_path: Optional[str] = None  # for uploaded files
    original_filename: Optional[str] = None
    excerpt: Optional[str] = None
    display_order: int = Field(default=0)


class SupplementaryMaterial(SupplementaryMaterialBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MaterialCreate(SQLModel):
    material_type: str = "article"
    title: str
    url: Optional[str] = None
    excerpt: Optional[str] = None
    display_order: int = 0


class MaterialRead(SQLModel):
    id: int
    assignment_id: int
    material_type: str
    title: str
    url: Optional[str]
    file_path: Optional[str]
    original_filename: Optional[str]
    excerpt: Optional[str]
    display_order: int
    created_at: datetime
