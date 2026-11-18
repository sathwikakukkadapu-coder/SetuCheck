from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.models.schemas import ExtractedDocument
from app.api.upload import DOCUMENT_REGISTRY
from app.services.document_processor import process_uploaded_document

router = APIRouter(prefix="/documents", tags=["Document Extraction"])

EXTRACTION_REGISTRY = {}

class ExtractRequest(BaseModel):
    doc_ids: List[str]

@router.post("/extract", response_model=List[ExtractedDocument])
async def extract_documents(request: ExtractRequest):
    """
    Runs PDF text extraction and/or image OCR on the uploaded documents.
    Extracts structured fields (Applicant Name, DOB, Address, Bank Account, IFSC, Bank Name).
    Never fabricates values.
    """
    if not request.doc_ids:
        raise HTTPException(status_code=400, detail="No document IDs specified for extraction.")

    extracted_results: List[ExtractedDocument] = []

    for doc_id in request.doc_ids:
        if doc_id not in DOCUMENT_REGISTRY:
            raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found in upload registry.")

        doc_meta = DOCUMENT_REGISTRY[doc_id]
        saved_path = doc_meta["saved_path"]
        orig_name = doc_meta["original_filename"]
        doc_type = doc_meta["document_type"]

        try:
            extracted_doc = process_uploaded_document(
                file_path=saved_path,
                doc_id=doc_id,
                original_filename=orig_name,
                doc_type=doc_type
            )
            EXTRACTION_REGISTRY[doc_id] = extracted_doc
            extracted_results.append(extracted_doc)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process document '{orig_name}': {str(e)}")

    return extracted_results
