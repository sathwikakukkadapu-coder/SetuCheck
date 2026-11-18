import json
from typing import Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AuditRequest,
    AuditResult,
    ExtractedDocument,
    FindingReviewPayload,
    CategoryScores,
    Finding
)
from app.api.extraction import EXTRACTION_REGISTRY
from app.api.upload import DOCUMENT_REGISTRY
from app.services.document_processor import process_uploaded_document
from app.services.risk_engine import run_audit_engine
from app.db.database import get_db_connection

router = APIRouter(prefix="/audit", tags=["Audit Engine"])

AUDIT_STORE: Dict[str, AuditResult] = {}

@router.post("/run", response_model=AuditResult)
def execute_audit(request: AuditRequest):
    """
    Executes the multi-document cross-comparison and deterministic validation engine.
    Calculates 4-category readiness scores, saves record in database, and returns findings.
    """
    docs_to_audit: List[ExtractedDocument] = []

    if request.pre_extracted:
        docs_to_audit = request.pre_extracted
    elif request.doc_ids:
        for did in request.doc_ids:
            if did in EXTRACTION_REGISTRY:
                docs_to_audit.append(EXTRACTION_REGISTRY[did])
            elif did in DOCUMENT_REGISTRY:
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

    result = run_audit_engine(documents=docs_to_audit, scheme_code=request.scheme)
    AUDIT_STORE[result.audit_id] = result
    return result

@router.get("/{audit_id}", response_model=AuditResult)
def get_audit_result(audit_id: str):
    """Retrieves stored audit results for the active session or from persistent SQLite store."""
    if audit_id in AUDIT_STORE:
        return AUDIT_STORE[audit_id]

    # Query SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audits WHERE audit_id = ?", (audit_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Audit with ID '{audit_id}' was not found.")

    cat_scores = CategoryScores(
        completeness=row["completeness_score"],
        consistency=row["consistency_score"],
        field_validation=row["field_validation_score"],
        document_quality=row["document_quality_score"],
        total=row["readiness_score"]
    )

    documents = [ExtractedDocument(**d) for d in json.loads(row["documents_json"])]
    findings = [Finding(**f) for f in json.loads(row["findings_json"])]

    # Fetch any review annotations
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_reviews WHERE audit_id = ?", (audit_id,))
    rev_rows = cursor.fetchall()
    conn.close()

    rev_map = {r["finding_id"]: r for r in rev_rows}
    for f in findings:
        if f.id in rev_map:
            f.is_reviewed = True
            f.reviewer_notes = rev_map[f.id]["reviewer_notes"]
            f.reviewed_at = rev_map[f.id]["reviewed_at"]

    audit_res = AuditResult(
        audit_id=row["audit_id"],
        scheme_code=row["scheme_code"],
        scheme_name=row["scheme_name"],
        readiness_score=row["readiness_score"],
        category_scores=cat_scores,
        total_documents=row["total_documents"],
        issues_detected=row["issues_detected"],
        high_priority_count=row["high_priority_count"],
        review_required_count=row["review_required_count"],
        informational_count=row["informational_count"],
        passed_count=row["passed_count"],
        findings=findings,
        extracted_documents=documents,
        timestamp=row["timestamp"],
        summary=row["summary"],
        sha256_hash=row["sha256_hash"]
    )
    AUDIT_STORE[audit_id] = audit_res
    return audit_res

@router.post("/{audit_id}/review")
def review_audit_finding(audit_id: str, payload: FindingReviewPayload):
    """
    Allows a CSC operator or applicant to mark a finding as reviewed and add notes.
    """
    audit = get_audit_result(audit_id)
    finding = next((f for f in audit.findings if f.id == payload.finding_id), None)
    if not finding:
        raise HTTPException(status_code=404, detail=f"Finding '{payload.finding_id}' not found in audit.")

    now = datetime.now(timezone.utc).isoformat()
    finding.is_reviewed = payload.is_reviewed
    finding.reviewer_notes = payload.reviewer_notes
    finding.reviewed_at = now

    # Persist in SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO audit_reviews (
            audit_id, finding_id, is_reviewed, reviewer_notes, reviewed_at
        ) VALUES (?, ?, ?, ?, ?)
    """, (
        audit_id, payload.finding_id, int(payload.is_reviewed), payload.reviewer_notes, now
    ))
    conn.commit()
    conn.close()

    AUDIT_STORE[audit_id] = audit
    return {
        "status": "success",
        "message": f"Finding '{payload.finding_id}' marked as reviewed.",
        "finding": finding
    }
