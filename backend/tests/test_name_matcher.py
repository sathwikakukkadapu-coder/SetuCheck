import pytest
from app.services.name_matcher import compare_names, normalize_name
from app.models.schemas import Severity

def test_normalize_name():
    assert normalize_name("Shri Ramesh Kumar") == "ramesh kumar"
    assert normalize_name("K. Suresh Reddy") == "k suresh reddy"
    assert normalize_name("  Dr.  Anand  Varma  ") == "anand varma"

def test_exact_name_match():
    finding = compare_names("Ramesh Kumar", "Ramesh Kumar")
    assert finding.severity == Severity.PASSED
    assert finding.confidence == 1.0

def test_normalized_title_match():
    finding = compare_names("Mr. Ramesh Kumar", "Ramesh Kumar")
    assert finding.severity == Severity.PASSED

def test_token_inversion():
    finding = compare_names("Kumar Ramesh", "Ramesh Kumar")
    assert finding.severity == Severity.REVIEW_REQUIRED
    assert "inverted" in finding.explanation.lower()

def test_spelling_variation():
    # Key hackathon demo requirement: "Ramesh Kumar" vs "Ramesh Kumer"
    finding = compare_names("Ramesh Kumar", "Ramesh Kumer")
    assert finding.severity == Severity.REVIEW_REQUIRED
    assert "spelling variation" in finding.explanation.lower()
    assert finding.confidence >= 0.88

def test_critical_mismatch():
    finding = compare_names("Ramesh Kumar", "Suresh Krishna Reddy")
    assert finding.severity == Severity.HIGH
