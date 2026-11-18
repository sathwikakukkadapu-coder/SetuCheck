import pytest
from pathlib import Path
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.field_extractor import parse_document_fields
from app.models.schemas import DocumentType

def test_extract_from_clean_aadhaar_pdf():
    pdf_path = Path(__file__).resolve().parent.parent / "synthetic_docs" / "aadhaar_suresh_clean.pdf"
    assert pdf_path.exists()
    text, method, conf = extract_text_from_pdf(pdf_path)
    assert "Suresh Krishna Reddy" in text
    assert "Guntur" in text

    doc = parse_document_fields(text, "test-id", "aadhaar_suresh_clean.pdf", DocumentType.IDENTITY)
    assert doc.name is not None
    assert "Suresh Krishna Reddy" in doc.name.value
    assert doc.dob is not None
    assert "14/06/1962" in doc.dob.value

def test_extract_from_clean_passbook_pdf():
    pdf_path = Path(__file__).resolve().parent.parent / "synthetic_docs" / "passbook_suresh_clean.pdf"
    assert pdf_path.exists()
    text, method, conf = extract_text_from_pdf(pdf_path)
    assert "30491827364" in text
    assert "SBIN0001234" in text

    doc = parse_document_fields(text, "test-id-2", "passbook_suresh_clean.pdf", DocumentType.BANK_PASSBOOK)
    assert doc.bank_account_no is not None
    assert doc.bank_account_no.value == "30491827364"
    assert doc.ifsc_code is not None
    assert doc.ifsc_code.value == "SBIN0001234"
