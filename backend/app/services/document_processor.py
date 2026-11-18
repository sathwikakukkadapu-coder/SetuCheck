import time
from pathlib import Path
from typing import Tuple
from app.models.schemas import ExtractedDocument, DocumentType
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.ocr_engine import run_image_ocr
from app.services.field_extractor import parse_document_fields

def process_uploaded_document(
    file_path: Path,
    doc_id: str,
    original_filename: str,
    doc_type: DocumentType
) -> ExtractedDocument:
    """
    Processes an uploaded document (PDF or image):
    - Determines extractor (PyMuPDF for PDF, OpenCV+Tesseract for image)
    - Extracts raw text
    - Parses structured fields
    - Measures processing duration
    """
    start_time = time.time()
    ext = file_path.suffix.lower()

    if ext == ".pdf":
        raw_text, method, conf = extract_text_from_pdf(file_path)
    elif ext in [".jpg", ".jpeg", ".png"]:
        raw_text, conf, success = run_image_ocr(file_path)
        method = "ocr"
    else:
        raise ValueError(f"Unsupported document file extension: {ext}")

    doc = parse_document_fields(
        raw_text=raw_text,
        doc_id=doc_id,
        original_filename=original_filename,
        doc_type=doc_type,
        extraction_method=method
    )
    doc.processing_time_ms = round((time.time() - start_time) * 1000, 2)
    return doc
