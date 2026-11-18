import pytest
from app.services.risk_engine import run_audit_engine, calculate_readiness_score
from app.api.demo import DEMO_CASES
from app.models.schemas import Finding, Severity

def test_score_calculation():
    # 0 deductions -> 100
    assert calculate_readiness_score([]) == 100

    # 1 high issue -> 75
    findings = [
        Finding(
            id="T1", field_name="Test", doc_a_name="A", validation_rule="R",
            severity=Severity.HIGH, explanation="E", recommended_correction="C"
        )
    ]
    assert calculate_readiness_score(findings) == 75

def test_case_1_perfect_audit():
    case_1 = DEMO_CASES[0]
    result = run_audit_engine(case_1.documents, scheme_code="pension")
    assert result.readiness_score == 100
    assert result.high_priority_count == 0

def test_case_2_name_mismatch():
    case_2 = DEMO_CASES[1]
    result = run_audit_engine(case_2.documents, scheme_code="pension")
    assert result.review_required_count >= 1
    # Check that Ramesh Kumar vs Ramesh Kumer was detected
    name_finding = next((f for f in result.findings if "Spelling" in f.validation_rule or "Applicant Name" in f.field_name), None)
    assert name_finding is not None
    assert name_finding.severity == Severity.REVIEW_REQUIRED

def test_case_3_invalid_ifsc():
    case_3 = DEMO_CASES[2]
    result = run_audit_engine(case_3.documents, scheme_code="pension")
    assert result.high_priority_count >= 1
    ifsc_finding = next(f for f in result.findings if "IFSC" in f.field_name)
    assert ifsc_finding.severity == Severity.HIGH
