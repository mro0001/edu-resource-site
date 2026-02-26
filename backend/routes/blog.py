from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..database import get_session
from ..auth import require_admin
from ..models.user import User
from ..models.blog_post import BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostRead

router = APIRouter(prefix="/blog", tags=["blog"])


def _to_read(post: BlogPost, author_name: Optional[str] = None) -> BlogPostRead:
    return BlogPostRead(
        id=post.id,
        title=post.title,
        slug=post.slug,
        content=post.content,
        excerpt=post.excerpt,
        tags=post.tags or [],
        author_id=post.author_id,
        author_name=author_name,
        is_published=post.is_published,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.get("/", response_model=list[BlogPostRead])
def list_posts(
    tag: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    query = (
        select(BlogPost, User.display_name)
        .join(User, BlogPost.author_id == User.id)
        .where(BlogPost.is_published == True)
        .order_by(BlogPost.published_at.desc())
        .offset(skip)
        .limit(limit)
    )
    results = session.exec(query).all()
    posts = []
    for post, author_name in results:
        if tag and tag not in (post.tags or []):
            continue
        posts.append(_to_read(post, author_name))
    return posts


@router.get("/{slug}", response_model=BlogPostRead)
def get_post(slug: str, session: Session = Depends(get_session)):
    query = (
        select(BlogPost, User.display_name)
        .join(User, BlogPost.author_id == User.id)
        .where(BlogPost.slug == slug)
    )
    result = session.exec(query).first()
    if not result:
        raise HTTPException(status_code=404, detail="Blog post not found")
    post, author_name = result
    return _to_read(post, author_name)


@router.post("/", response_model=BlogPostRead)
def create_post(
    body: BlogPostCreate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    existing = session.exec(select(BlogPost).where(BlogPost.slug == body.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    post = BlogPost(
        **body.model_dump(),
        author_id=admin.id,
        published_at=datetime.utcnow() if body.is_published else None,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return _to_read(post, admin.display_name)


@router.patch("/{post_id}", response_model=BlogPostRead)
def update_post(
    post_id: int,
    body: BlogPostUpdate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    post = session.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)

    # Set published_at when first published
    if body.is_published and not post.published_at:
        post.published_at = datetime.utcnow()

    post.updated_at = datetime.utcnow()
    session.add(post)
    session.commit()
    session.refresh(post)
    return _to_read(post, admin.display_name)


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    post = session.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    session.delete(post)
    session.commit()
    return {"ok": True}
