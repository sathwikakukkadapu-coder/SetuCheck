import re
from typing import Dict, Any, Optional
from app.models.schemas import (
    ExtractedField,
    FieldStatus,
    DocumentType,
    ExtractedDocument
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

def extract_name_from_text(text: str) -> Optional[ExtractedField]:
    """
    Extracts applicant or account holder name using common identity/passbook patterns:
    e.g. "Name: Ramesh Kumar", "Name:\nRamesh Kumar", "Account Holder: Ramesh Kumar"
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        # Pattern 1: Name and value on the same line
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
                    confidence=0.95,
                    status=FieldStatus.EXTRACTED,
                    source_line=line.strip()
                )

        # Pattern 2: Keyword alone on line, value on immediate next line
        if re.match(r'^(?:Name|Applicant Name|Account Holder|A\/C Holder|A\/C Name)\s*[:\-]?$', line, re.IGNORECASE):
            if i + 1 < len(lines):
                next_val = lines[i+1].strip()
                if next_val and not any(kw in next_val.lower() for kw in ["dob", "address", "gender", "aadhaar", "ifsc"]):
                    return ExtractedField(
                        value=next_val,
                        confidence=0.95,
                        status=FieldStatus.EXTRACTED,
                        source_line=f"{line} {next_val}"
                    )

    # Secondary pattern: line right after "Government of India / Unique Identification Authority of India"
    for i, line in enumerate(lines[:-1]):
        if re.search(r'(?:Unique Identification|Government of India|Aadhaar|Passbook)', line, re.IGNORECASE):
            # next non-empty line could be a name
            next_line = lines[i+1].strip()
            if next_line and re.match(r'^[A-Z][a-zA-Z\s\.]+$', next_line) and len(next_line) > 3:
                return ExtractedField(
                    value=next_line,
                    confidence=0.85,
                    status=FieldStatus.EXTRACTED,
                    source_line=next_line
                )

    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING,
        source_line=None
    )

def extract_dob_from_text(text: str) -> Optional[ExtractedField]:
    """
    Extracts Date of Birth:
    Patterns like "DOB: 15/08/1982", "DOB:\n15/08/1982"
    """
    dob_match = re.search(
        r'(?:DOB|Date\s*of\s*Birth|Birth\s*Date|Year\s*of\s*Birth|YOB)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})',
        text,
        re.IGNORECASE
    )
    if dob_match:
        dob_val = dob_match.group(1).strip()
        return ExtractedField(
            value=dob_val,
            confidence=0.95,
            status=FieldStatus.EXTRACTED,
            source_line=dob_match.group(0)
        )

    # Multi-line match
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        if re.match(r'^(?:DOB|Date\s*of\s*Birth|Birth\s*Date)\s*[:\-]?$', line, re.IGNORECASE) and i + 1 < len(lines):
            date_m = re.search(r'\b([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)[0-9]{2})\b', lines[i+1])
            if date_m:
                return ExtractedField(
                    value=date_m.group(1),
                    confidence=0.95,
                    status=FieldStatus.EXTRACTED,
                    source_line=f"{line} {lines[i+1]}"
                )

    # Search for standalone dates
    date_match = re.search(r'\b([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-](?:19|20)[0-9]{2})\b', text)
    if date_match:
        return ExtractedField(
            value=date_match.group(1),
            confidence=0.80,
            status=FieldStatus.EXTRACTED,
            source_line=date_match.group(0)
        )

    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING
    )

def extract_account_number_from_text(text: str) -> Optional[ExtractedField]:
    """
    Extracts Bank Account Number:
    Patterns like "A/C No: 123456789012", "Account Number : 987654321012"
    """
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
                confidence=0.95,
                status=FieldStatus.EXTRACTED,
                source_line=acc_match.group(0)
            )

    # Standalone 11-16 digit numbers that aren't phone numbers or 12-digit Aadhaar
    for match in re.finditer(r'\b([0-9]{11,18})\b', text):
        num = match.group(1)
        # Avoid 12-digit numbers if they look like Aadhaar
        if not re.search(r'(?:Aadhaar|UID)', text):
            return ExtractedField(
                value=num,
                confidence=0.75,
                status=FieldStatus.EXTRACTED,
                source_line=match.group(0)
            )

    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING
    )

def extract_ifsc_from_text(text: str) -> Optional[ExtractedField]:
    """
    Extracts IFSC code:
    Standard 11-character format matching IFSC_REGEX or keyword "IFSC:"
    """
    # Explicit keyword search first
    keyword_match = re.search(
        r'(?:IFSC|RTGS\/NEFT|Branch\s*Code)\s*[:\-]?\s*([A-Za-z0-9]{10,12})',
        text,
        re.IGNORECASE
    )
    if keyword_match:
        code = keyword_match.group(1).strip().upper()
        return ExtractedField(
            value=code,
            confidence=0.95,
            status=FieldStatus.EXTRACTED,
            source_line=keyword_match.group(0)
        )

    # Standalone regex search
    raw_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text.upper())
    if raw_match:
        return ExtractedField(
            value=raw_match.group(0),
            confidence=0.90,
            status=FieldStatus.EXTRACTED,
            source_line=raw_match.group(0)
        )

    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING
    )

def extract_bank_name_from_text(text: str) -> Optional[ExtractedField]:
    """Extracts known Indian Bank Name."""
    upper_text = text.upper()
    for bank in KNOWN_BANKS:
        if bank.upper() in upper_text:
            return ExtractedField(
                value=bank,
                confidence=0.95,
                status=FieldStatus.EXTRACTED,
                source_line=bank
            )
    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING
    )

def extract_address_from_text(text: str) -> Optional[ExtractedField]:
    """
    Extracts Address:
    Looks for "Address:" or patterns containing Village, District, Pin Code, etc.
    """
    addr_match = re.search(
        r'(?:Address|Resi|Permanent\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){1,3})',
        text,
        re.IGNORECASE
    )
    if addr_match:
        clean_addr = re.sub(r'\s+', ' ', addr_match.group(1).strip())
        return ExtractedField(
            value=clean_addr,
            confidence=0.90,
            status=FieldStatus.EXTRACTED,
            source_line=addr_match.group(0)
        )

    # Check for PIN code line
    pin_line = re.search(r'([^\n\r]{10,80}\b[1-9][0-9]{5}\b)', text)
    if pin_line:
        return ExtractedField(
            value=re.sub(r'\s+', ' ', pin_line.group(1).strip()),
            confidence=0.80,
            status=FieldStatus.EXTRACTED,
            source_line=pin_line.group(0)
        )

    return ExtractedField(
        value=None,
        confidence=0.0,
        status=FieldStatus.MISSING
    )

def parse_document_fields(
    raw_text: str,
    doc_id: str,
    original_filename: str,
    doc_type: DocumentType,
    extraction_method: str = "pdf_text"
) -> ExtractedDocument:
    """
    Orchestrates extraction of all standard fields from OCR or PDF raw text.
    Never fabricates values.
    """
    name_field = extract_name_from_text(raw_text)
    dob_field = extract_dob_from_text(raw_text)
    acc_field = extract_account_number_from_text(raw_text)
    ifsc_field = extract_ifsc_from_text(raw_text)
    bank_name_field = extract_bank_name_from_text(raw_text)
    address_field = extract_address_from_text(raw_text)

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
        raw_text=raw_text,
        extraction_method=extraction_method,
        fields=fields_dict
    )
