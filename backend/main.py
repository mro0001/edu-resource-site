"""
Edu Resource Site — FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from .database import create_db_and_tables
from .routes import (
    auth_router,
    assignments_router,
    materials_router,
    comments_router,
    github_router,
    blog_router,
    instructions_router,
    admin_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    storage = Path(__file__).parent / "storage"
    storage.mkdir(exist_ok=True)
    yield


app = FastAPI(
    title="Edu Resource Site",
    description="Public educational resource site with assignment viewer, blog, and GitHub browser",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(assignments_router, prefix="/api")
app.include_router(materials_router, prefix="/api")
app.include_router(comments_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(instructions_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Edu Resource Site", "version": "0.1.0"}
