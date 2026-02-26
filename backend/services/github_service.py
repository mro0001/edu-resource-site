"""
GitHub import service — fetches repo trees and files via REST API.
Adapted from lms-platform with added branch listing support.
"""
import re
from typing import Optional
import httpx

GITHUB_API = "https://api.github.com"
GITHUB_RAW = "https://raw.githubusercontent.com"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB per file


def parse_github_url(url: str) -> tuple[str, str, str]:
    """
    Accepts:
      https://github.com/owner/repo
      https://github.com/owner/repo/tree/branch
    Returns (owner, repo, branch). Branch defaults to "" meaning "auto-detect".
    """
    url = url.rstrip("/").removesuffix(".git")
    pattern = r"github\.com/([^/]+)/([^/]+)(?:/tree/([^/]+))?"
    m = re.search(pattern, url)
    if not m:
        raise ValueError(f"Cannot parse GitHub URL: {url}")
    owner, repo = m.group(1), m.group(2)
    branch = m.group(3) or ""
    return owner, repo, branch


async def get_default_branch(
    owner: str, repo: str, token: Optional[str] = None
) -> str:
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=headers)
        resp.raise_for_status()
        return resp.json()["default_branch"]


async def list_branches(
    owner: str, repo: str, token: Optional[str] = None
) -> list[dict]:
    """List all branches for a repo."""
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/branches",
            headers=headers,
            params={"per_page": 100},
        )
        resp.raise_for_status()
        return [{"name": b["name"]} for b in resp.json()]


async def fetch_repo_files(
    owner: str, repo: str, branch: str, token: Optional[str] = None
) -> tuple[list[dict], str]:
    """
    Returns (files_list, resolved_branch).
    Each file dict has: path, size, download_url.
    """
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    if not branch:
        branch = await get_default_branch(owner, repo, token)

    tree_url = f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(tree_url, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    files = []
    for item in data.get("tree", []):
        if item.get("type") != "blob":
            continue
        path = item["path"]
        if path.startswith(".") or path.endswith((".gitignore", ".DS_Store")):
            continue
        files.append({
            "path": path,
            "size": item.get("size", 0),
            "download_url": f"{GITHUB_RAW}/{owner}/{repo}/{branch}/{path}",
        })
    return files, branch


async def download_file(url: str, token: Optional[str] = None) -> bytes:
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.content


async def fetch_and_rewrite_html(
    owner: str, repo: str, branch: str, token: Optional[str] = None
) -> Optional[str]:
    """
    Fetch the entry HTML from a branch, rewrite relative URLs to point
    to raw.githubusercontent.com so assets load in an iframe.
    """
    files, branch = await fetch_repo_files(owner, repo, branch, token)
    file_paths = [f["path"] for f in files]
    entry = detect_entry_file(file_paths)
    if not entry:
        return None

    entry_url = f"{GITHUB_RAW}/{owner}/{repo}/{branch}/{entry}"
    html_bytes = await download_file(entry_url, token)
    html = html_bytes.decode("utf-8", errors="replace")

    # Rewrite relative URLs to absolute raw.githubusercontent.com paths
    base_url = f"{GITHUB_RAW}/{owner}/{repo}/{branch}/"
    # Handle src="...", href="...", url(...) but skip absolute URLs and data: URIs
    html = re.sub(
        r'(src|href)="(?!https?://|data:|#|mailto:)([^"]+)"',
        lambda m: f'{m.group(1)}="{base_url}{m.group(2)}"',
        html,
    )
    return html


def detect_entry_file(file_paths: list[str]) -> Optional[str]:
    root_htmls = [p for p in file_paths if "/" not in p and p.endswith(".html")]
    if "index.html" in root_htmls:
        return "index.html"
    if root_htmls:
        return root_htmls[0]
    all_htmls = [p for p in file_paths if p.endswith(".html")]
    return all_htmls[0] if all_htmls else None
