import pytest
from pathlib import Path
from app.services.risk_engine import run_audit_engine
from app.services.report_generator import generate_pdf_report
from app.api.demo import DEMO_CASES

def test_generate_pdf_report():
    case_1 = DEMO_CASES[0]
    audit_res = run_audit_engine(case_1.documents, scheme_code="pension")
    pdf_path = generate_pdf_report(audit_res)
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 1000  # Generated valid PDF
