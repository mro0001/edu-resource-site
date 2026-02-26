from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse

from ..services import github_service

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/branches")
async def list_branches(
    owner: str = Query(...),
    repo: str = Query(...),
):
    try:
        branches = await github_service.list_branches(owner, repo)
        default_branch = await github_service.get_default_branch(owner, repo)
        return {"branches": branches, "default_branch": default_branch}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {e}")


@router.get("/serve", response_class=HTMLResponse)
async def serve_branch(
    owner: str = Query(...),
    repo: str = Query(...),
    branch: str = Query(...),
):
    try:
        html = await github_service.fetch_and_rewrite_html(owner, repo, branch)
        if not html:
            raise HTTPException(status_code=404, detail="No HTML file found in branch")
        return HTMLResponse(content=html)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {e}")
