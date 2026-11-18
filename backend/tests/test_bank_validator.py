import pytest
from app.services.bank_validator import validate_ifsc_code, validate_bank_account_number
from app.models.schemas import Severity

def test_valid_ifsc():
    f = validate_ifsc_code("SBIN0001234")
    assert f.severity == Severity.PASSED
    assert "State Bank of India" in f.explanation

def test_invalid_ifsc_length():
    f = validate_ifsc_code("SBIN00123")  # 9 characters instead of 11
    assert f.severity == Severity.HIGH
    assert "length" in f.explanation.lower()

def test_invalid_ifsc_fifth_character():
    # 5th character must be '0', not 'O' or letter
    f = validate_ifsc_code("SBINO001234")
    assert f.severity == Severity.HIGH
    assert "5th character" in f.explanation.lower()

def test_missing_ifsc():
    f = validate_ifsc_code("")
    assert f.severity == Severity.HIGH

def test_valid_bank_account():
    f = validate_bank_account_number("30491827364")
    assert f.severity == Severity.PASSED

def test_short_bank_account():
    f = validate_bank_account_number("12345")
    assert f.severity == Severity.HIGH
    assert "outside the standard range" in f.explanation.lower()

def test_dummy_bank_account():
    f = validate_bank_account_number("000000000000")
    assert f.severity == Severity.HIGH
    assert "repeated digits" in f.explanation.lower()

def test_non_numeric_bank_account():
    f = validate_bank_account_number("9182736AB012")
    assert f.severity == Severity.HIGH
