from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.api.audit import AUDIT_STORE
from app.services.report_generator import generate_pdf_report
from app.config import REPORTS_DIR

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

@router.get("/{audit_id}")
def download_audit_report(audit_id: str):
    """
    Generates and downloads a print-ready, professional PDF audit report.
    """
    if audit_id not in AUDIT_STORE:
        # Check if PDF already exists on disk
        potential_path = REPORTS_DIR / f"SetuCheck_Audit_{audit_id}.pdf"
        if potential_path.exists():
            return FileResponse(
                path=potential_path,
                filename=f"SetuCheck_Audit_{audit_id}.pdf",
                media_type="application/pdf"
            )
        raise HTTPException(status_code=404, detail=f"Audit record '{audit_id}' not found.")

    audit_result = AUDIT_STORE[audit_id]
    pdf_path = generate_pdf_report(audit_result)

    return FileResponse(
        path=pdf_path,
        filename=f"SetuCheck_Audit_{audit_id}.pdf",
        media_type="application/pdf"
    )
