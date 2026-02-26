from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class InstructionPageBase(SQLModel):
    title: str
    slug: str = Field(index=True, unique=True)
    content: str  # markdown
    category: str = Field(default="general")
    display_order: int = Field(default=0)
    is_published: bool = Field(default=False)


class InstructionPage(InstructionPageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class InstructionPageCreate(SQLModel):
    title: str
    slug: str
    content: str
    category: str = "general"
    display_order: int = 0
    is_published: bool = False


class InstructionPageUpdate(SQLModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class InstructionPageRead(SQLModel):
    id: int
    title: str
    slug: str
    content: str
    category: str
    display_order: int
    author_id: int
    author_name: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
