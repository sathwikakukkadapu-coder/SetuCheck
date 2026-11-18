from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.schemas import UploadResponse, DocumentType
from app.utils.file_security import sanitize_and_save_upload

router = APIRouter(prefix="/documents", tags=["Document Upload"])

# In-memory document registry for session tracking
DOCUMENT_REGISTRY = {}

@router.post("/upload", response_model=List[UploadResponse])
async def upload_documents(
    files: List[UploadFile] = File(...),
    doc_types: List[str] = Form(None)
):
    """
    Accepts one or multiple document files (PDF, JPG, JPEG, PNG).
    Validates file format, magic bytes, and enforces size restrictions.
    Saves with randomized UUID and returns identifiers.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    responses = []
    for idx, file in enumerate(files):
        # Determine assigned document type
        dtype_str = doc_types[idx] if (doc_types and idx < len(doc_types)) else "identity"
        try:
            dtype = DocumentType(dtype_str)
        except ValueError:
            dtype = DocumentType.IDENTITY

        doc_id, saved_path, file_size = sanitize_and_save_upload(file)

        # Store in registry
        DOCUMENT_REGISTRY[doc_id] = {
            "doc_id": doc_id,
            "original_filename": file.filename or "unknown",
            "saved_path": saved_path,
            "document_type": dtype,
            "size_bytes": file_size,
            "content_type": file.content_type or "application/octet-stream"
        }

        responses.append(UploadResponse(
            doc_id=doc_id,
            filename=file.filename or "unknown",
            document_type=dtype,
            size_bytes=file_size,
            content_type=file.content_type or "application/octet-stream",
            status="uploaded"
        ))

    return responses
