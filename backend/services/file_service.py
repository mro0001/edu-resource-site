"""
Manages the storage/ directory layout:
  storage/{assignment_id}/original/   <- immutable source files
"""
from pathlib import Path
import shutil

STORAGE_ROOT = Path(__file__).parent.parent / "storage"


def assignment_original_dir(assignment_id: int) -> Path:
    return STORAGE_ROOT / str(assignment_id) / "original"


def ensure_assignment_dirs(assignment_id: int) -> None:
    assignment_original_dir(assignment_id).mkdir(parents=True, exist_ok=True)


def save_file(assignment_id: int, filename: str, content: bytes) -> Path:
    ensure_assignment_dirs(assignment_id)
    dest = assignment_original_dir(assignment_id) / filename
    dest.write_bytes(content)
    return dest


def get_entry_file(assignment_id: int, file_path: str) -> Path:
    return assignment_original_dir(assignment_id) / file_path


def delete_assignment_files(assignment_id: int) -> None:
    dir_path = STORAGE_ROOT / str(assignment_id)
    if dir_path.exists():
        shutil.rmtree(dir_path)
