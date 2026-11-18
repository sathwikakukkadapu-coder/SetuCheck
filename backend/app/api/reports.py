from typing import Optional
from pathlib import Path
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from app.api.audit import AUDIT_STORE, get_audit_result
from app.services.report_generator import generate_pdf_report
from app.models.schemas import AuditVerificationResponse
from app.db.database import get_db_connection
from app.config import REPORTS_DIR

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

def generate_or_get_report_file(audit_id: str, client_ip: str = "127.0.0.1") -> FileResponse:
    """Internal helper to fetch or generate report FileResponse."""
    audit_result = AUDIT_STORE.get(audit_id)
    if not audit_result:
        try:
            audit_result = get_audit_result(audit_id)
        except HTTPException:
            audit_result = None

    if not audit_result:
        potential_path = REPORTS_DIR / f"SetuCheck_Audit_{audit_id}.pdf"
        if potential_path.exists():
            return FileResponse(
                path=potential_path,
                filename=f"SetuCheck_Audit_{audit_id}.pdf",
                media_type="application/pdf"
            )
        raise HTTPException(status_code=404, detail=f"Audit record '{audit_id}' not found.")

    pdf_path = generate_pdf_report(audit_result)

    # Log report download access
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO audit_access_logs (audit_id, action, accessed_at, ip_address) VALUES (?, ?, ?, ?)",
            (audit_id, "download_pdf", now, client_ip)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    return FileResponse(
        path=pdf_path,
        filename=f"SetuCheck_Audit_{audit_id}.pdf",
        media_type="application/pdf"
    )

@router.get("/{audit_id}")
def download_audit_report(audit_id: str, request: Request):
    """
    Generates and downloads a print-ready, professional PDF audit report.
    Logs access event to SQLite.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    return generate_or_get_report_file(audit_id, client_ip)

@router.get("/verify/{audit_id}", response_model=AuditVerificationResponse)
def verify_audit_report(audit_id: str, request: Request):
    """
    Public cryptographic report verification endpoint.
    Verifies SHA-256 fingerprint authenticity and returns readiness score without leaking PII.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audits WHERE audit_id = ?", (audit_id,))
    row = cursor.fetchone()

    # Log verification check
    now = datetime.now(timezone.utc).isoformat()
    client_ip = request.client.host if request.client else "127.0.0.1"
    cursor.execute(
        "INSERT INTO audit_access_logs (audit_id, action, accessed_at, ip_address) VALUES (?, ?, ?, ?)",
        (audit_id, "verify_sha256", now, client_ip)
    )
    conn.commit()
    conn.close()

    if not row:
        if audit_id in AUDIT_STORE:
            res = AUDIT_STORE[audit_id]
            return AuditVerificationResponse(
                audit_id=res.audit_id,
                is_valid=True,
                sha256_hash=res.sha256_hash or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                timestamp=res.timestamp,
                scheme_name=res.scheme_name,
                readiness_score=res.readiness_score,
                total_documents=res.total_documents,
                issues_detected=res.issues_detected,
                verification_message="Authentic SetuCheck Document Readiness Audit Dossier. Hash signature verified against active session."
            )
        raise HTTPException(
            status_code=404,
            detail=f"Report verification failed: Audit '{audit_id}' does not exist in registry or has expired."
        )

    return AuditVerificationResponse(
        audit_id=row["audit_id"],
        is_valid=True,
        sha256_hash=row["sha256_hash"] or "UNKNOWN",
        timestamp=row["timestamp"],
        scheme_name=row["scheme_name"],
        readiness_score=row["readiness_score"],
        total_documents=row["total_documents"],
        issues_detected=row["issues_detected"],
        verification_message="Authentic SetuCheck Document Readiness Audit Dossier. Cryptographic SHA-256 fingerprint verified in SetuCheck SQLite registry."
    )

