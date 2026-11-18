import fitz  # PyMuPDF
from pathlib import Path
from typing import Tuple
from app.services.ocr_engine import run_image_ocr

def extract_text_from_pdf(pdf_path: Path) -> Tuple[str, str, float]:
    """
    Extracts text from a PDF file using PyMuPDF.
    If the document has a digital text layer, extracts direct text.
    If the page is purely scanned images with no text, renders page to image
    and executes OCR.
    Returns: (text, extraction_method, confidence)
    """
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    doc = fitz.open(str(pdf_path))
    full_text = []
    has_scanned_page = False

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        page_text = page.get_text()

        if page_text and len(page_text.strip()) > 30:
            full_text.append(page_text.strip())
        else:
            # Scanned page detected, render to pixmap image
            has_scanned_page = True
            pix = page.get_pixmap(dpi=150)
            temp_img = pdf_path.parent / f"temp_{pdf_path.stem}_p{page_idx}.png"
            pix.save(str(temp_img))

            ocr_text, ocr_conf, _ = run_image_ocr(temp_img)
            full_text.append(ocr_text)

            # Cleanup temporary page image
            if temp_img.exists():
                try:
                    temp_img.unlink()
                except Exception:
                    pass

    doc.close()
    combined_text = "\n\n".join(full_text)

    if has_scanned_page:
        return combined_text, "ocr", 0.85
    else:
        return combined_text, "pdf_text", 0.99
