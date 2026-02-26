from .auth import router as auth_router
from .assignments import router as assignments_router
from .materials import router as materials_router
from .comments import router as comments_router
from .github_browser import router as github_router
from .blog import router as blog_router
from .instructions import router as instructions_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "assignments_router",
    "materials_router",
    "comments_router",
    "github_router",
    "blog_router",
    "instructions_router",
    "admin_router",
]
