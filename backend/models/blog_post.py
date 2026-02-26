from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, JSON


class BlogPostBase(SQLModel):
    title: str
    slug: str = Field(index=True, unique=True)
    content: str  # markdown
    excerpt: Optional[str] = None
    tags: list[str] = Field(default=[], sa_column=Column(JSON))
    is_published: bool = Field(default=False)


class BlogPost(BlogPostBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id")
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BlogPostCreate(SQLModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    tags: list[str] = []
    is_published: bool = False


class BlogPostUpdate(SQLModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    tags: Optional[list[str]] = None
    is_published: Optional[bool] = None


class BlogPostRead(SQLModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    tags: list[str]
    author_id: int
    author_name: Optional[str] = None
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
