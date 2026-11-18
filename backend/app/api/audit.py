from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from app.models.schemas import AuditRequest, AuditResult, ExtractedDocument
from app.api.extraction import EXTRACTION_REGISTRY
from app.api.upload import DOCUMENT_REGISTRY
from app.services.document_processor import process_uploaded_document
from app.services.risk_engine import run_audit_engine

router = APIRouter(prefix="/audit", tags=["Audit Engine"])

# Store audit results for session retrieval and PDF generation
AUDIT_STORE: Dict[str, AuditResult] = {}

@router.post("/run", response_model=AuditResult)
def execute_audit(request: AuditRequest):
    """
    Executes the multi-document cross-comparison and deterministic validation engine.
    Calculates the transparent readiness score (0-100) and classifies findings.
    """
    docs_to_audit: List[ExtractedDocument] = []

    # 1. Use pre-extracted documents if passed directly (e.g. demo cases)
    if request.pre_extracted:
        docs_to_audit = request.pre_extracted

    # 2. Or retrieve by doc_ids
    elif request.doc_ids:
        for did in request.doc_ids:
            if did in EXTRACTION_REGISTRY:
                docs_to_audit.append(EXTRACTION_REGISTRY[did])
            elif did in DOCUMENT_REGISTRY:
                # Extract on the fly if not done previously
                doc_meta = DOCUMENT_REGISTRY[did]
                ext_doc = process_uploaded_document(
                    file_path=doc_meta["saved_path"],
                    doc_id=did,
                    original_filename=doc_meta["original_filename"],
                    doc_type=doc_meta["document_type"]
                )
                EXTRACTION_REGISTRY[did] = ext_doc
                docs_to_audit.append(ext_doc)
            else:
                raise HTTPException(status_code=404, detail=f"Document ID '{did}' not found.")

    if not docs_to_audit:
        raise HTTPException(
            status_code=400,
            detail="No documents available to audit. Upload documents or select a demonstration case."
        )

    # Run deterministic rules
    result = run_audit_engine(documents=docs_to_audit, scheme_code=request.scheme)

    # Persist in session store
    AUDIT_STORE[result.audit_id] = result
    return result

@router.get("/{audit_id}", response_model=AuditResult)
def get_audit_result(audit_id: str):
    """
    Retrieves stored audit results for the active session.
    """
    if audit_id not in AUDIT_STORE:
        raise HTTPException(status_code=404, detail=f"Audit with ID '{audit_id}' was not found.")
    return AUDIT_STORE[audit_id]
