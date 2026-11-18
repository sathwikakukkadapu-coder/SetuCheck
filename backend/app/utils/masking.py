import re
from typing import Optional, Any, Dict

def mask_account_number(account_no: Optional[str]) -> str:
    """
    Masks bank account number, keeping only the last 3-4 digits.
    Example: 123456789012 -> XXXXXXXX9012
    """
    if not account_no:
        return ""
    clean = re.sub(r'[\s\-]', '', str(account_no))
    if len(clean) <= 4:
        return "*" * len(clean)
    masked_prefix = "X" * (len(clean) - 4)
    return f"{masked_prefix}{clean[-4:]}"

def mask_identity_number(id_no: Optional[str]) -> str:
    """
    Masks identity/Aadhaar number, keeping only the last 4 digits.
    Example: 1234 5678 9012 -> XXXX XXXX 9012
    """
    if not id_no:
        return ""
    clean = re.sub(r'[\s\-]', '', str(id_no))
    if len(clean) <= 4:
        return "*" * len(clean)
    if len(clean) == 12:
        return f"XXXX XXXX {clean[-4:]}"
    masked_prefix = "X" * (len(clean) - 4)
    return f"{masked_prefix}{clean[-4:]}"

def mask_ifsc(ifsc: Optional[str]) -> str:
    """
    IFSC is not strictly confidential (it's a public bank branch code),
    but normalize and format it safely.
    """
    if not ifsc:
        return ""
    return ifsc.strip().upper()

def mask_address(address: Optional[str]) -> str:
    """
    Partially obfuscate specific house/door numbers in sensitive public views if needed,
    while leaving locality/district/state visible for comparison.
    """
    if not address:
        return ""
    # Replace leading house number patterns like "H.No 12-3/4" with "H.No [MASKED]"
    return re.sub(r'(?i)(h\.?no\.?|house\s*no\.?|d\.?no\.?|flat\s*no\.?)\s*[:#\-]?\s*[\w\-\/]+', r'\1 [REDACTED]', address)

def sanitize_for_ai(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize an entire dictionary payload before sending to external AI (e.g. Gemini).
    Masks all sensitive identifiers like account numbers and identity numbers.
    """
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, dict):
            sanitized[key] = sanitize_for_ai(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_for_ai(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, str):
            lower_k = key.lower()
            if any(term in lower_k for term in ["account", "acct", "acc_no"]):
                sanitized[key] = mask_account_number(value)
            elif any(term in lower_k for term in ["aadhaar", "uid", "identity_no", "id_num"]):
                sanitized[key] = mask_identity_number(value)
            else:
                sanitized[key] = value
        else:
            sanitized[key] = value
    return sanitized
