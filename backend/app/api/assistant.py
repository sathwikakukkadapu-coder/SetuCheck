from fastapi import APIRouter, HTTPException
from app.models.schemas import AssistantRequest, AssistantResponse
from app.api.audit import AUDIT_STORE
from app.services.explanation_engine import generate_assistant_explanation

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
            raise HTTPException(status_code=404, detail=f"Audit ID '{request.audit_id}' not found.")

    if not audit_res:
        raise HTTPException(
            status_code=400,
            detail="Audit result or valid audit_id must be provided to generate explanations."
        )

    lang = request.language.lower() if request.language in ["en", "te", "hi"] else "en"
    explanation = generate_assistant_explanation(audit_result=audit_res, lang=lang)
    return explanation
