import re
from typing import Dict, Any, Optional
from app.models.schemas import (
    ExtractedField,
    FieldStatus,
    DocumentType,
    ExtractedDocument,
    BoundingBox
)
from app.rules.validation_rules import IFSC_REGEX

KNOWN_BANKS = [
    "State Bank of India",
    "SBI",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "PNB",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Indian Overseas Bank",
    "Indian Bank",
    "Kotak Mahindra Bank",
    "Axis Bank"
]

def extract_name_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """
    Extracts applicant or account holder name:
    Tracks original value, normalized value, source line, and synthetic/approx bounding region.
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        match = re.search(
            r'(?:Name|Applicant Name|Account Holder|A\/C Holder|A\/C Name|Cardholder|Beneficiary)\s*[:\-]\s*([A-Za-z\s\.\,\'\-]+)',
            line,
            re.IGNORECASE
        )
        if match:
            candidate = match.group(1).strip()
            candidate = re.split(r'[,;|\n]|\bDOB\b|\bS\/O\b|\bW\/O\b|\bD\/O\b|\bFather\b', candidate)[0].strip()
            if len(candidate) > 2 and not re.match(r'^(of|india|record|synthetic|demo)$', candidate, re.IGNORECASE):
                return ExtractedField(
                    value=candidate,
                    original_value=candidate,
                    normalized_value=candidate.strip().title(),
                    confidence=0.96,
                    status=FieldStatus.EXTRACTED,
                    source_line=line.strip(),
                    source_document=doc_name,
                    page_number=1,
                    bounding_box=BoundingBox(x=120, y=140, width=320, height=30, page=1, description=f"Extracted from: '{line}'"),
                    manual_status="unmodified"
                )

        if re.match(r'^(?:Name|Applicant Name|Account Holder|A\/C Holder|A\/C Name)\s*[:\-]?$', line, re.IGNORECASE):
            if i + 1 < len(lines):
                next_val = lines[i+1].strip()
                if next_val and not any(kw in next_val.lower() for kw in ["dob", "address", "gender", "aadhaar", "ifsc"]):
                    return ExtractedField(
                        value=next_val,
                        original_value=next_val,
                        normalized_value=next_val.strip().title(),
                        confidence=0.94,
                        status=FieldStatus.EXTRACTED,
                        source_line=f"{line} {next_val}",
                        source_document=doc_name,
                        page_number=1,
                        bounding_box=BoundingBox(x=120, y=160, width=320, height=30, page=1, description=f"Extracted on next line"),
                        manual_status="unmodified"
                    )

    # Fallback for line right after Govt header
    for i, line in enumerate(lines[:-1]):
        if re.search(r'(?:Unique Identification|Government of India|Aadhaar|Passbook)', line, re.IGNORECASE):
            next_line = lines[i+1].strip()
            if next_line and re.match(r'^[A-Z][a-zA-Z\s\.]+$', next_line) and len(next_line) > 3:
                return ExtractedField(
                    value=next_line,
                    original_value=next_line,
                    normalized_value=next_line.strip().title(),
                    confidence=0.86,
                    status=FieldStatus.EXTRACTED,
                    source_line=next_line,
                    source_document=doc_name,
                    page_number=1,
                    bounding_box=BoundingBox(x=120, y=180, width=300, height=30, page=1, description="Header proximity match"),
                    manual_status="unmodified"
                )

    return ExtractedField(
        value=None,
        original_value=None,
        normalized_value=None,
        confidence=0.0,
        status=FieldStatus.MISSING,
        source_document=doc_name
    )

def extract_dob_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """Extracts Date of Birth."""
    dob_match = re.search(
        r'(?:DOB|Date\s*of\s*Birth|Birth\s*Date|Year\s*of\s*Birth|YOB)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})',
        text,
        re.IGNORECASE
    )
    if dob_match:
        dob_val = dob_match.group(1).strip()
        return ExtractedField(
            value=dob_val,
            original_value=dob_val,
            normalized_value=dob_val.replace('-', '/').replace('.', '/'),
            confidence=0.96,
            status=FieldStatus.EXTRACTED,
            source_line=dob_match.group(0),
            source_document=doc_name,
            page_number=1,
            bounding_box=BoundingBox(x=120, y=200, width=180, height=25, page=1, description=f"DOB Pattern: {dob_val}"),
            manual_status="unmodified"
        )

    # Multi-line match
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        if re.match(r'^(?:DOB|Date\s*of\s*Birth|Birth\s*Date)\s*[:\-]?$', line, re.IGNORECASE) and i + 1 < len(lines):
            date_m = re.search(r'\b([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)[0-9]{2})\b', lines[i+1])
            if date_m:
                v = date_m.group(1)
                return ExtractedField(
                    value=v,
                    original_value=v,
                    normalized_value=v.replace('-', '/'),
                    confidence=0.95,
                    status=FieldStatus.EXTRACTED,
                    source_line=f"{line} {lines[i+1]}",
                    source_document=doc_name,
                    page_number=1,
                    bounding_box=BoundingBox(x=120, y=220, width=180, height=25, page=1, description="DOB next-line match"),
                    manual_status="unmodified"
                )

    return ExtractedField(value=None, confidence=0.0, status=FieldStatus.MISSING, source_document=doc_name)

def extract_account_number_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """Extracts Bank Account Number."""
    acc_match = re.search(
        r'(?:A\/C\s*No\.?|Account\s*No\.?|Account\s*Number|A\/C\s*Number|Acc\s*No)\s*[:\-]?\s*([0-9\s\-]{8,22})',
        text,
        re.IGNORECASE
    )
    if acc_match:
        raw_val = re.sub(r'[\s\-]', '', acc_match.group(1).strip())
        if raw_val.isdigit() and len(raw_val) >= 8:
            return ExtractedField(
                value=raw_val,
                original_value=acc_match.group(1).strip(),
                normalized_value=raw_val,
                confidence=0.97,
                status=FieldStatus.EXTRACTED,
                source_line=acc_match.group(0),
                source_document=doc_name,
                page_number=1,
                bounding_box=BoundingBox(x=140, y=260, width=240, height=30, page=1, description="Account line match"),
                manual_status="unmodified"
            )

    return ExtractedField(value=None, confidence=0.0, status=FieldStatus.MISSING, source_document=doc_name)

def extract_ifsc_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """Extracts IFSC code."""
    keyword_match = re.search(
        r'(?:IFSC|RTGS\/NEFT|Branch\s*Code)\s*[:\-]?\s*([A-Za-z0-9]{9,12})',
        text,
        re.IGNORECASE
    )
    if keyword_match:
        code = keyword_match.group(1).strip().upper()
        return ExtractedField(
            value=code,
            original_value=keyword_match.group(1).strip(),
            normalized_value=code,
            confidence=0.96,
            status=FieldStatus.EXTRACTED,
            source_line=keyword_match.group(0),
            source_document=doc_name,
            page_number=1,
            bounding_box=BoundingBox(x=140, y=300, width=200, height=30, page=1, description=f"IFSC prefix match: {code}"),
            manual_status="unmodified"
        )

    raw_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text.upper())
    if raw_match:
        c = raw_match.group(0)
        return ExtractedField(
            value=c,
            original_value=c,
            normalized_value=c,
            confidence=0.91,
            status=FieldStatus.EXTRACTED,
            source_line=c,
            source_document=doc_name,
            page_number=1,
            bounding_box=BoundingBox(x=140, y=310, width=200, height=30, page=1, description="IFSC standalone regex match"),
            manual_status="unmodified"
        )

    return ExtractedField(value=None, confidence=0.0, status=FieldStatus.MISSING, source_document=doc_name)

def extract_bank_name_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """Extracts Bank Name."""
    upper_text = text.upper()
    for bank in KNOWN_BANKS:
        if bank.upper() in upper_text:
            return ExtractedField(
                value=bank,
                original_value=bank,
                normalized_value=bank,
                confidence=0.96,
                status=FieldStatus.EXTRACTED,
                source_line=bank,
                source_document=doc_name,
                page_number=1,
                bounding_box=BoundingBox(x=140, y=80, width=280, height=40, page=1, description="Bank header identifier"),
                manual_status="unmodified"
            )
    return ExtractedField(value=None, confidence=0.0, status=FieldStatus.MISSING, source_document=doc_name)

def extract_address_from_text(text: str, doc_name: str = "Document") -> Optional[ExtractedField]:
    """Extracts Address."""
    addr_match = re.search(
        r'(?:Address|Resi|Permanent\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){1,3})',
        text,
        re.IGNORECASE
    )
    if addr_match:
        clean_addr = re.sub(r'\s+', ' ', addr_match.group(1).strip())
        return ExtractedField(
            value=clean_addr,
            original_value=addr_match.group(1).strip(),
            normalized_value=clean_addr,
            confidence=0.92,
            status=FieldStatus.EXTRACTED,
            source_line=addr_match.group(0)[:60],
            source_document=doc_name,
            page_number=1,
            bounding_box=BoundingBox(x=120, y=340, width=380, height=50, page=1, description="Address multi-line segment"),
            manual_status="unmodified"
        )

    pin_line = re.search(r'([^\n\r]{10,80}\b[1-9][0-9]{5}\b)', text)
    if pin_line:
        cl = re.sub(r'\s+', ' ', pin_line.group(1).strip())
        return ExtractedField(
            value=cl,
            original_value=pin_line.group(1).strip(),
            normalized_value=cl,
            confidence=0.82,
            status=FieldStatus.EXTRACTED,
            source_line=pin_line.group(0),
            source_document=doc_name,
            page_number=1,
            bounding_box=BoundingBox(x=120, y=360, width=380, height=40, page=1, description="PIN locality line"),
            manual_status="unmodified"
        )

    return ExtractedField(value=None, confidence=0.0, status=FieldStatus.MISSING, source_document=doc_name)

def extract_certificate_details(text: str, doc_name: str = "Certificate") -> Dict[str, Optional[ExtractedField]]:
    """Extracts certificate-specific fields (issue date, expiry date, certificate type)."""
    res = {}
    # Certificate type
    cert_type = None
    if re.search(r'(?:income\s*certificate|annual\s*income)', text, re.IGNORECASE):
        cert_type = "Income Certificate"
    elif re.search(r'(?:caste\s*certificate|community\s*certificate)', text, re.IGNORECASE):
        cert_type = "Caste Certificate"
    elif re.search(r'(?:residence\s*certificate|domicile)', text, re.IGNORECASE):
        cert_type = "Residence Certificate"

    if cert_type:
        res["certificate_type"] = ExtractedField(
            value=cert_type, original_value=cert_type, normalized_value=cert_type,
            confidence=0.95, status=FieldStatus.EXTRACTED, source_document=doc_name
        )

    # Issue Date
    issue_m = re.search(r'(?:Date\s*of\s*Issue|Issue\s*Date|Issued\s*on)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})', text, re.IGNORECASE)
    if issue_m:
        res["issue_date"] = ExtractedField(
            value=issue_m.group(1), original_value=issue_m.group(1), normalized_value=issue_m.group(1).replace('-', '/'),
            confidence=0.93, status=FieldStatus.EXTRACTED, source_document=doc_name
        )

    # Expiry Date
    exp_m = re.search(r'(?:Valid\s*Upto|Expiry\s*Date|Valid\s*Till)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})', text, re.IGNORECASE)
    if exp_m:
        res["expiry_date"] = ExtractedField(
            value=exp_m.group(1), original_value=exp_m.group(1), normalized_value=exp_m.group(1).replace('-', '/'),
            confidence=0.93, status=FieldStatus.EXTRACTED, source_document=doc_name
        )

    return res

def parse_document_fields(
    raw_text: str,
    doc_id: str,
    original_filename: str,
    doc_type: DocumentType,
    extraction_method: str = "pdf_text"
) -> ExtractedDocument:
    """
    Parses structured fields with bounding evidence, confidence metrics, and normalization.
    """
    name_field = extract_name_from_text(raw_text, original_filename)
    dob_field = extract_dob_from_text(raw_text, original_filename)
    acc_field = extract_account_number_from_text(raw_text, original_filename)
    ifsc_field = extract_ifsc_from_text(raw_text, original_filename)
    bank_name_field = extract_bank_name_from_text(raw_text, original_filename)
    address_field = extract_address_from_text(raw_text, original_filename)
    cert_fields = extract_certificate_details(raw_text, original_filename)

    fields_dict: Dict[str, ExtractedField] = {}
    if name_field and name_field.value:
        fields_dict["name"] = name_field
    if dob_field and dob_field.value:
        fields_dict["dob"] = dob_field
    if acc_field and acc_field.value:
        fields_dict["bank_account_no"] = acc_field
    if ifsc_field and ifsc_field.value:
        fields_dict["ifsc_code"] = ifsc_field
    if bank_name_field and bank_name_field.value:
        fields_dict["bank_name"] = bank_name_field
    if address_field and address_field.value:
        fields_dict["address"] = address_field
    fields_dict.update(cert_fields)

    return ExtractedDocument(
        doc_id=doc_id,
        original_filename=original_filename,
        document_type=doc_type,
        name=name_field,
        dob=dob_field,
        address=address_field,
        bank_account_no=acc_field,
        ifsc_code=ifsc_field,
        bank_name=bank_name_field,
        certificate_type=cert_fields.get("certificate_type"),
        issue_date=cert_fields.get("issue_date"),
        expiry_date=cert_fields.get("expiry_date"),
        raw_text=raw_text,
        extraction_method=extraction_method,
        fields=fields_dict
    )
