# CLAUDE.md — Edu Resource Site

Developer guide for Claude Code and human contributors.

---

## Project Overview

A public-facing educational resource site for interactive HTML assignments, supplementary materials, blog posts, and GitHub instructions. Professors and government employees can register, get verified, and contribute content. The public can browse assignments, read blog posts, and follow GitHub guides.

---

## Dev Commands

### Backend (run from `edu-resource-site/` directory)
```bash
uv run uvicorn backend.main:app --reload --port 8000
curl http://localhost:8000/api/health
```

### Frontend (run from `edu-resource-site/frontend/`)
```bash
npm run dev        # http://localhost:5173, proxies /api → :8000
npm run build      # production build to dist/
```

Both servers must be running for full functionality.

---

## Architecture

### Tech Stack
- **Backend**: FastAPI + Uvicorn + SQLModel + SQLite
- **Auth**: bcrypt (direct) + python-jose (JWT)
- **HTTP**: httpx (GitHub API calls)
- **Frontend**: React 19 + Vite + TailwindCSS + React Router v7 + TanStack Query v5
- **Markdown**: react-markdown + @tailwindcss/typography

### Auth System
- JWT tokens stored in localStorage, injected via Axios interceptor
- Three dependency levels: `get_current_user` (soft), `require_auth` (401), `require_admin` (403)
- User roles: `user`, `verified`, `admin`
- Verification statuses: `unverified`, `pending`, `verified`
- **Important**: JWT `sub` claim must be a string (not int) — `python-jose` enforces RFC 7519

### Assignment Import Flow
```
parse_github_url() → get_default_branch() → fetch_repo_files()
  → download each file → storage/{id}/original/
  → detect_entry_file() → save DB record
```

### GitHub Branch Viewer (Ephemeral)
- Parse `github_url` into owner/repo
- List branches via GitHub API
- Fetch HTML from selected branch, rewrite relative URLs to `raw.githubusercontent.com`
- Render in sandboxed iframe — no files saved to disk

### iframe Sandbox
```html
<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-downloads" />
```

---

## Database Schema

SQLite at `backend/edu.db` (gitignored). Six tables:

| Table | Key fields |
|---|---|
| `user` | id, email (unique), display_name, hashed_password, role, verification_status |
| `assignment` | id, title, tags (JSON), github_url, github_branch, file_path, created_by_id |
| `supplementarymaterial` | id, assignment_id, material_type, title, url, excerpt, display_order |
| `comment` | id, assignment_id, user_id, content, parent_id (threading) |
| `blogpost` | id, title, slug (unique), content (markdown), tags (JSON), author_id |
| `instructionpage` | id, title, slug (unique), content (markdown), category, display_order, author_id |

---

## API Routes

| Prefix | Purpose |
|---|---|
| `/api/auth` | Register, login, profile |
| `/api/assignments` | CRUD, import, serve |
| `/api/assignments/{id}/materials` | Supplementary materials |
| `/api/assignments/{id}/comments` | Threaded comments (auth-gated) |
| `/api/github` | Branch listing, branch HTML serving |
| `/api/blog` | Blog CRUD (admin-protected writes) |
| `/api/instructions` | Instruction pages (admin-protected writes) |
| `/api/admin` | User management, verification |

---

## File Storage

```
backend/storage/
  {assignment_id}/
    original/     ← immutable source files (never modified)
```

---

## Adding Features

### New API Route
1. Create or extend a file in `backend/routes/`
2. Define `APIRouter` with `prefix` and `tags`
3. Register in `backend/routes/__init__.py`
4. Include in `backend/main.py` with `app.include_router(router, prefix="/api")`
5. Add functions in `frontend/src/lib/api.js`

### New Frontend Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add nav link in `frontend/src/components/Layout.jsx` if needed

---

## Common Pitfalls

- **Wrong working directory**: `uv run uvicorn backend.main:app` must run from `edu-resource-site/`
- **Stale DB schema**: Delete `backend/edu.db` to recreate tables after model changes
- **bcrypt + passlib**: Do NOT use passlib with bcrypt 5.x — use bcrypt directly
- **JWT sub claim**: Must be a string, not an int
- **First admin user**: Manually set role via SQLite or create a seed script
