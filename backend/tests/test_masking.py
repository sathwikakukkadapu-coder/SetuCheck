import pytest
from app.utils.masking import (
    mask_account_number,
    mask_identity_number,
    mask_address,
    sanitize_for_ai
)

def test_mask_account_number():
    assert mask_account_number("30491827364") == "XXXXXXX7364"
    assert mask_account_number("1234") == "****"
    assert mask_account_number("") == ""

def test_mask_identity_number():
    masked = mask_identity_number("123456789012")
    assert masked == "XXXX XXXX 9012"
    assert "12345678" not in masked

def test_mask_address():
    res = mask_address("H.No 12-4/A, Tilak Road, Hyderabad")
    assert "[REDACTED]" in res

def test_sanitize_for_ai():
    payload = {
        "applicant_name": "Ramesh Kumar",
        "bank_account_no": "918273645012",
        "aadhaar_number": "123456789012",
        "nested": {
            "account_no": "30491827364"
        }
    }
    sanitized = sanitize_for_ai(payload)
    assert "918273645012" not in str(sanitized)
    assert "123456789012" not in str(sanitized)
    assert "XXXX" in sanitized["aadhaar_number"]
    assert "XXXXXXXX5012" == sanitized["bank_account_no"]
