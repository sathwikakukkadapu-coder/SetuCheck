from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AssistantRequest,
    AssistantResponse,
    ChatRequest,
    ChatResponse,
    SimulateFixRequest,
    SimulateFixResponse,
    ExtractedField,
    FieldStatus
)
from app.api.audit import AUDIT_STORE, get_audit_result
from app.services.explanation_engine import generate_assistant_explanation
from app.services.chat_engine import generate_chat_reply
from app.services.risk_engine import run_audit_engine
import copy

router = APIRouter(prefix="/assistant", tags=["Multilingual Assistant"])

@router.post("/explain", response_model=AssistantResponse)
def explain_findings(request: AssistantRequest):
    """
    Generates natural-language, accessible explanations in English, Telugu, or Hindi.
    Provides actionable guidance and pre-submission checklist.
    Masks sensitive information before any external AI processing.
    """
    audit_res = request.audit_result

    if not audit_res and request.audit_id:
        if request.audit_id in AUDIT_STORE:
            audit_res = AUDIT_STORE[request.audit_id]
        else:
            try:
                audit_res = get_audit_result(request.audit_id)
            except Exception:
                raise HTTPException(status_code=404, detail=f"Audit ID '{request.audit_id}' not found.")

    if not audit_res:
        raise HTTPException(
            status_code=400,
            detail="Audit result or valid audit_id must be provided to generate explanations."
        )

    lang = request.language.lower() if request.language in ["en", "te", "hi"] else "en"
    explanation = generate_assistant_explanation(audit_result=audit_res, lang=lang)
    return explanation

@router.post("/chat", response_model=ChatResponse)
def chat_with_setumitra(request: ChatRequest):
    """
    Interactive conversational endpoint for SetuMitra Civic Co-Pilot.
    Answers citizen/operator queries grounded in active audit findings.
    """
    if not request.audit_result and request.audit_id:
        if request.audit_id in AUDIT_STORE:
            request.audit_result = AUDIT_STORE[request.audit_id]
        else:
            try:
                request.audit_result = get_audit_result(request.audit_id)
            except Exception:
                pass

    return generate_chat_reply(request)

@router.post("/simulate", response_model=SimulateFixResponse)
def simulate_fixes(request: SimulateFixRequest):
    """
    Interactive 'What-If' Simulation:
    Applies user-supplied candidate corrections and recalculates readiness score
    and findings without modifying the permanent record.
    """
    if not request.documents:
        raise HTTPException(status_code=400, detail="Documents required for simulation.")

    # Deep copy documents so original is untouched
    simulated_docs = copy.deepcopy(request.documents)
    
    # Calculate original baseline score
    orig_res = run_audit_engine(simulated_docs, scheme_code=request.scheme)
    original_score = orig_res.readiness_score
    original_high = orig_res.high_priority_count + orig_res.review_required_count

    # Apply overrides
    for ov in request.overrides:
        target_doc = None
        for d in simulated_docs:
            if ov.doc_id and d.doc_id == ov.doc_id:
                target_doc = d
                break
            elif ov.doc_type and d.document_type.value == ov.doc_type:
                target_doc = d
                break
        
        if not target_doc and simulated_docs:
            target_doc = simulated_docs[0]

        if target_doc:
            fname = ov.field_name.lower().replace(" ", "_")
            field_obj = ExtractedField(
                value=ov.corrected_value,
                original_value=ov.corrected_value,
                normalized_value=ov.corrected_value,
                confidence=1.0,
                status=FieldStatus.EXTRACTED,
                manual_status="simulated_fix"
            )
            if hasattr(target_doc, fname):
                setattr(target_doc, fname, field_obj)
            target_doc.fields[fname] = field_obj

    # Re-run audit with simulated values
    updated_res = run_audit_engine(simulated_docs, scheme_code=request.scheme)
    projected_score = updated_res.readiness_score
    new_high = updated_res.high_priority_count + updated_res.review_required_count

    resolved_count = max(0, original_high - new_high)
    score_delta = max(0, projected_score - original_score)

    return SimulateFixResponse(
        original_score=original_score,
        projected_score=projected_score,
        score_delta=score_delta,
        updated_result=updated_res,
        resolved_findings_count=resolved_count
    )

