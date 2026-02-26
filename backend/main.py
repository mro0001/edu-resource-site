"""
Edu Resource Site — FastAPI application entry point.

In production (Render), FastAPI serves the built React frontend as static files.
In development, Vite proxies /api to FastAPI — the static file mount is harmless.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Built React frontend location (created by build.sh)
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"


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

# API routes — registered BEFORE the static file catch-all
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


# Serve built React frontend in production
if FRONTEND_DIR.exists():
    # Serve static assets (JS, CSS, images) from /assets/
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    # Catch-all: serve index.html for any non-API route (React Router handles it)
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # If a specific static file exists (favicon, etc.), serve it
        file_path = FRONTEND_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # Otherwise, serve index.html for client-side routing
        return FileResponse(FRONTEND_DIR / "index.html")
