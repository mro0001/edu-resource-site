#!/usr/bin/env bash
# Render build script — installs both Python and Node dependencies,
# then builds the React frontend so FastAPI can serve it.

set -o errexit  # exit on error

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install fastapi uvicorn[standard] sqlmodel aiofiles httpx bcrypt python-jose[cryptography] python-multipart

echo "=== Installing frontend dependencies ==="
cd frontend
npm install

echo "=== Building frontend ==="
npm run build
cd ..

echo "=== Build complete ==="
