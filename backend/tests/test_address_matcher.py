import pytest
from app.services.address_matcher import compare_addresses, normalize_address, extract_pincode
from app.models.schemas import Severity

def test_extract_pincode():
    assert extract_pincode("Plot 42, Guntur, AP, 522002") == "522002"
    assert extract_pincode("No pincode here") is None

def test_normalize_address():
    norm = normalize_address("H.No 12-4, Tilak Rd, Vill. Shamshabad, Dist. Ranga Reddy")
    assert "house number" in norm or "road" in norm
    assert "village" in norm
    assert "district" in norm

def test_pincode_mismatch():
    f = compare_addresses(
        "Plot 42, Gandhi Nagar, Guntur, 522002",
        "Plot 42, Gandhi Nagar, Vijayawada, 520001"
    )
    assert f.severity == Severity.HIGH
    assert "PIN Code" in f.field_name

def test_exact_address_match():
    f = compare_addresses(
        "Plot 42, Gandhi Nagar, Guntur, 522002",
        "Plot 42, Gandhi Nagar, Guntur, 522002"
    )
    assert f.severity == Severity.PASSED

def test_formatting_variance():
    f = compare_addresses(
        "H.No 12-4, Tilak Road, Hyderabad, 500001",
        "House No 12-4, Tilak Rd, Hyderabad, 500001"
    )
    assert f.severity in [Severity.PASSED, Severity.INFORMATIONAL]
