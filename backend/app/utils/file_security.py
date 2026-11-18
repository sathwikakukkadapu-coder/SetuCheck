import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import HTTPException, UploadFile
from app.config import UPLOAD_DIR, MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS

# Signatures for content inspection (magic bytes)
FILE_SIGNATURES = {
    b"%PDF": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png"
}

def validate_file_content(header_bytes: bytes, file_ext: str) -> bool:
    """
    Validate that the file header bytes match the expected file extension.
    Prevents executable or malicious masqueraded files.
    """
    ext = file_ext.lower()
    if ext == ".pdf":
        return header_bytes.startswith(b"%PDF")
    elif ext in [".jpg", ".jpeg"]:
        return header_bytes.startswith(b"\xff\xd8\xff")
    elif ext == ".png":
        return header_bytes.startswith(b"\x89PNG")
    return False

def sanitize_and_save_upload(file: UploadFile) -> Tuple[str, Path, int]:
    """
    Securely saves an uploaded file:
    - Verifies extension
    - Reads and checks file size
    - Validates magic bytes header
    - Assigns randomized UUID filename to prevent collision and path traversal
    Returns (doc_id, saved_path, file_size)
    """
    original_name = file.filename or "unknown"
    ext = Path(original_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read content
    contents = file.file.read()
    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if file_size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size limit of {max_mb} MB."
        )

    # Verify magic bytes
    if not validate_file_content(contents[:16], ext):
        raise HTTPException(
            status_code=400,
            detail=f"File content does not match extension '{ext}'. Verification failed."
        )

    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}{ext}"
    saved_path = UPLOAD_DIR / safe_filename

    with open(saved_path, "wb") as f:
        f.write(contents)

    return doc_id, saved_path, file_size

def cleanup_file(path: Path) -> None:
    """Safely remove a file if it exists."""
    try:
        if path.exists():
            os.remove(path)
    except Exception:
        pass
