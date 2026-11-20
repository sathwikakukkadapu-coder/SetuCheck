import pytest
from app.main import health_check
from app.api.demo import list_demo_cases, get_demo_case, DEMO_CASES
from app.api.audit import execute_audit, get_audit_result
from app.api.assistant import explain_findings
from app.api.reports import generate_or_get_report_file, verify_audit_report
from app.models.schemas import AuditRequest, AssistantRequest

def test_health_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert "version" in res
    assert res["mode"] == "deterministic_audit_with_multilingual_assistant"

def test_demo_cases_list():
    cases = list_demo_cases()
    assert len(cases) == 5
    assert cases[0].case_id == "case-1-perfect"

def test_demo_case_retrieval():
    case = get_demo_case("case-2-name-mismatch")
    assert case.case_id == "case-2-name-mismatch"
    assert "Ramesh" in case.title

def test_audit_execution_and_storage():
    case_2 = DEMO_CASES[1]
    req = AuditRequest(
        scheme="pension",
        pre_extracted=case_2.documents
    )
    result = execute_audit(req)
    assert result.readiness_score > 0
    assert result.total_documents == len(case_2.documents)
    assert result.issues_detected >= 1

    # Verify retrieval from session store
    retrieved = get_audit_result(result.audit_id)
    assert retrieved.audit_id == result.audit_id
    assert retrieved.readiness_score == result.readiness_score

def test_assistant_multilingual_telugu():
    case_1 = DEMO_CASES[0]
    audit_req = AuditRequest(scheme="pension", pre_extracted=case_1.documents)
    audit_res = execute_audit(audit_req)

    assist_req = AssistantRequest(
        audit_id=audit_res.audit_id,
        language="te"
    )
    response = explain_findings(assist_req)
    assert response.language == "te"
    assert "తెలుగు" in response.language_name
    assert len(response.checklist) > 0

def test_assistant_multilingual_hindi():
    case_2 = DEMO_CASES[1]
    audit_req = AuditRequest(scheme="pension", pre_extracted=case_2.documents)
    audit_res = execute_audit(audit_req)

    assist_req = AssistantRequest(
        audit_id=audit_res.audit_id,
        language="hi"
    )
    response = explain_findings(assist_req)
    assert response.language == "hi"
    assert "हिन्दी" in response.language_name
    assert len(response.step_by_step_guidance) > 0

def test_report_generation_endpoint():
    case_1 = DEMO_CASES[0]
    audit_req = AuditRequest(scheme="pension", pre_extracted=case_1.documents)
    audit_res = execute_audit(audit_req)

    file_resp = generate_or_get_report_file(audit_res.audit_id)
    assert file_resp.media_type == "application/pdf"
    assert audit_res.audit_id in file_resp.filename

def test_setumitra_chat():
    from app.api.assistant import chat_with_setumitra
    from app.models.schemas import ChatRequest
    case_1 = DEMO_CASES[0]
    audit_req = AuditRequest(scheme="pension", pre_extracted=case_1.documents)
    audit_res = execute_audit(audit_req)

    req = ChatRequest(
        message="Why is my IFSC code important?",
        language="en",
        audit_id=audit_res.audit_id
    )
    chat_res = chat_with_setumitra(req)
    assert chat_res.reply != ""
    assert "RBI" in chat_res.reply or "IFSC" in chat_res.reply

def test_what_if_simulator():
    from app.api.assistant import simulate_fixes
    from app.models.schemas import SimulateFixRequest, SimulatedFieldOverride
    case_3 = DEMO_CASES[2]  # Invalid IFSC
    audit_req = AuditRequest(scheme="pension", pre_extracted=case_3.documents)
    audit_res = execute_audit(audit_req)
    
    # Fix the IFSC code to valid SBIN0001234
    req = SimulateFixRequest(
        scheme="pension",
        documents=case_3.documents,
        overrides=[
            SimulatedFieldOverride(doc_type="bank_passbook", field_name="ifsc_code", corrected_value="SBIN0001234")
        ]
    )
    sim_res = simulate_fixes(req)
    assert sim_res.projected_score >= sim_res.original_score
    assert sim_res.projected_score >= 80
