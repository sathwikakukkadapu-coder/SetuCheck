import pytest
import io
import json
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.models.schemas import (
    ExtractedDocument,
    ExtractedField,
    DocumentType,
    FieldStatus,
    AuditRequest,
    Severity,
    StatusColor,
    FindingReviewPayload
)
from app.services.risk_engine import run_audit_engine
from app.services.name_matcher import compare_names
from app.services.bank_validator import validate_ifsc_code, validate_bank_account_number
from app.services.address_matcher import compare_addresses
from app.services.completeness_checker import check_scheme_completeness
from app.services.field_extractor import (
    parse_document_fields,
    extract_account_number_from_text,
    extract_certificate_details
)
from app.services.document_processor import process_uploaded_document
from app.api.audit import execute_audit, review_audit_finding, AUDIT_STORE
from app.utils.file_security import sanitize_and_save_upload, validate_file_content
from app.api.reports import verify_audit_report, generate_or_get_report_file

# Helper synthetic document builder
def make_doc(doc_id, doc_type, name="Suresh Krishna Reddy", bank_acc="30491827364", ifsc="SBIN0001234", address="Plot 42, Gandhi Nagar, Guntur, 522002", dob="14/06/1962", conf=0.95, extraction="pdf_text"):
    return ExtractedDocument(
        doc_id=doc_id,
        original_filename=f"{doc_id}.pdf",
        document_type=doc_type,
        name=ExtractedField(value=name, confidence=conf, status=FieldStatus.EXTRACTED),
        dob=ExtractedField(value=dob, confidence=conf, status=FieldStatus.EXTRACTED) if dob else None,
        address=ExtractedField(value=address, confidence=conf, status=FieldStatus.EXTRACTED) if address else None,
        bank_account_no=ExtractedField(value=bank_acc, confidence=conf, status=FieldStatus.EXTRACTED) if bank_acc else None,
        ifsc_code=ExtractedField(value=ifsc, confidence=conf, status=FieldStatus.EXTRACTED) if ifsc else None,
        bank_name=ExtractedField(value="State Bank of India", confidence=conf, status=FieldStatus.EXTRACTED) if bank_acc else None,
        raw_text=f"Name: {name}\nAccount: {bank_acc}\nIFSC: {ifsc}\nAddress: {address}",
        extraction_method=extraction
    )

# 1. Fully consistent documents -> high readiness score
def test_scenario_01_consistent_documents():
    docs = [
        make_doc("id1", DocumentType.IDENTITY),
        make_doc("bank1", DocumentType.BANK_PASSBOOK),
        make_doc("addr1", DocumentType.ADDRESS_PROOF)
    ]
    res = run_audit_engine(docs, scheme_code="pension")
    assert res.readiness_score >= 90
    assert res.high_priority_count == 0

# 2. Missing bank passbook -> completeness warning
def test_scenario_02_missing_bank_passbook():
    docs = [
        make_doc("id1", DocumentType.IDENTITY),
        make_doc("addr1", DocumentType.ADDRESS_PROOF)
    ]
    findings = check_scheme_completeness(docs, scheme_code="pension")
    missing_bank = next((f for f in findings if "DOC-MISS-BANK_PASSBOOK" in f.id), None)
    assert missing_bank is not None
    assert missing_bank.severity == Severity.HIGH

# 3. Name variation across documents -> review required
def test_scenario_03_name_variation_review_required():
    f = compare_names("Ramesh Kumar", "Ramesh Kumer")
    assert f.severity == Severity.REVIEW_REQUIRED
    assert f.status_color == StatusColor.YELLOW

# 4. Different addresses across documents -> address discrepancy
def test_scenario_04_different_addresses():
    f = compare_addresses(
        "Plot 42, Gandhi Nagar, Guntur, AP, 522002",
        "Flat 901, Jubilee Hills, Hyderabad, Telangana, 500033"
    )
    assert f.severity in (Severity.HIGH, Severity.REVIEW_REQUIRED)
    assert "Hyderabad" in f.doc_b_value or "500033" in f.doc_b_value

# 5. Invalid IFSC -> high severity failure
def test_scenario_05_invalid_ifsc():
    f = validate_ifsc_code("SBINO001234")  # Letter 'O' at index 4 instead of 0
    assert f.severity == Severity.HIGH
    assert f.status_color == StatusColor.RED

# 6. Low-quality scanned image -> OCR uncertainty note
def test_scenario_06_low_quality_scanned_image():
    docs = [
        make_doc("id1", DocumentType.IDENTITY, conf=0.55, extraction="ocr"),
        make_doc("bank1", DocumentType.BANK_PASSBOOK, conf=0.60, extraction="ocr")
    ]
    res = run_audit_engine(docs, scheme_code="generic_audit")
    assert res.category_scores.document_quality < 20

# 7. OCR uncertainty -> low-confidence flag
def test_scenario_07_ocr_uncertainty_flag():
    raw_text = "Name: Su?esh K?ishna\nAccount: 304?1827"
    doc = parse_document_fields(raw_text, "syn-7", "doc.pdf", DocumentType.BANK_PASSBOOK)
    assert doc.bank_account_no is not None
    # OCR artefacts or missing full digits result in lower confidence or warning
    assert doc.bank_account_no.confidence < 0.95

# 8. Expired or future dated certificate -> date validation warning
def test_scenario_08_date_validation_warning():
    raw_text = "INCOME CERTIFICATE\nValid Till: 01/01/2020\nAnnual Income: Rs. 45,000"
    doc = parse_document_fields(raw_text, "syn-8", "income.pdf", DocumentType.INCOME_CERTIFICATE)
    assert doc.expiry_date is not None
    assert doc.expiry_date.value == "01/01/2020"

# 9. Missing mandatory scheme document -> scheme validation failure
def test_scenario_09_missing_mandatory_scheme_doc():
    docs = [make_doc("id1", DocumentType.IDENTITY)]
    res = run_audit_engine(docs, scheme_code="pm_kisan")
    missing_docs = [f for f in res.findings if "DOC-MISS" in f.id]
    assert len(missing_docs) >= 1
    assert any("BANK_PASSBOOK" in f.id for f in missing_docs)

# 10. Multiple discrepancies combined -> cumulative risk score reduction
def test_scenario_10_multiple_discrepancies():
    docs = [
        make_doc("id1", DocumentType.IDENTITY, name="Suresh Reddy", address="Plot 42 Guntur 522002"),
        make_doc("bank1", DocumentType.BANK_PASSBOOK, name="Venkata Rao", bank_acc="123", ifsc="INVALIDIFSC")
    ]
    res = run_audit_engine(docs, scheme_code="pension")
    assert res.readiness_score < 60
    assert res.high_priority_count >= 2

# 11. Malformed PDF -> graceful error handling
def test_scenario_11_malformed_pdf(tmp_path):
    bad_pdf = tmp_path / "corrupt.pdf"
    bad_pdf.write_bytes(b"%PDF-1.4 ... corrupt random binary stream ... \x00\xFF\xFE")
    # Should not crash; gracefully returns extracted document with fallback
    doc = process_uploaded_document(str(bad_pdf), "bad_1", "corrupt.pdf", DocumentType.IDENTITY)
    assert doc is not None
    assert doc.doc_id == "bad_1"

# 12. Unsupported file type -> rejected with user-friendly message
def test_scenario_12_unsupported_file_type():
    file = UploadFile(filename="virus.exe", file=io.BytesIO(b"MZ\x90\x00"))
    with pytest.raises(HTTPException) as exc_info:
        sanitize_and_save_upload(file)
    assert exc_info.value.status_code == 400
    assert "Unsupported file format" in exc_info.value.detail

# 13. Oversized document upload -> size limit enforcement
def test_scenario_13_oversized_document_upload():
    oversized_data = b"0" * (25 * 1024 * 1024)
    file = UploadFile(filename="huge.pdf", file=io.BytesIO(oversized_data))
    with pytest.raises(HTTPException) as exc_info:
        sanitize_and_save_upload(file)
    assert exc_info.value.status_code == 400
    assert "exceeds maximum size limit" in exc_info.value.detail

# 14. Unauthorized / non-existent audit access -> proper response
def test_scenario_14_nonexistent_audit_access():
    with pytest.raises(HTTPException) as exc_info:
        generate_or_get_report_file("NON-EXISTENT-AUDIT-ID-9999")
    assert exc_info.value.status_code == 404

# 15. Re-upload / review workflow -> operator notes and verification status
def test_scenario_15_review_workflow():
    docs = [
        make_doc("id1", DocumentType.IDENTITY, name="Ramesh Kumar"),
        make_doc("bank1", DocumentType.BANK_PASSBOOK, name="Ramesh Kumer")
    ]
    audit_req = AuditRequest(scheme="pension", pre_extracted=docs)
    audit = execute_audit(audit_req)
    aid = audit.audit_id

    # Find the spelling finding
    spell_finding = next(f for f in audit.findings if "NAME" in f.id or "Spelling" in f.validation_rule)
    payload = FindingReviewPayload(
        finding_id=spell_finding.id,
        is_reviewed=True,
        reviewer_notes="Verified against Gazette notification. Spelling variance permitted by Mandal Tehsildar."
    )
    rev_res = review_audit_finding(aid, payload)
    assert rev_res["status"] == "success"
    assert "Gazette notification" in rev_res["finding"].reviewer_notes
