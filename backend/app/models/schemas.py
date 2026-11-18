from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class DocumentType(str, Enum):
    IDENTITY = "identity"
    BANK_PASSBOOK = "bank_passbook"
    ADDRESS_PROOF = "address_proof"
    SUPPORTING = "supporting"

class FieldStatus(str, Enum):
    EXTRACTED = "extracted"
    UNCLEAR = "unclear"
    MISSING = "missing"
    MANUAL_VERIFICATION_REQUIRED = "manual_verification_required"

class ExtractedField(BaseModel):
    value: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    status: FieldStatus = FieldStatus.EXTRACTED
    source_line: Optional[str] = None

class ExtractedDocument(BaseModel):
    doc_id: str
    original_filename: str
    document_type: DocumentType
    name: Optional[ExtractedField] = None
    dob: Optional[ExtractedField] = None
    address: Optional[ExtractedField] = None
    bank_account_no: Optional[ExtractedField] = None
    ifsc_code: Optional[ExtractedField] = None
    bank_name: Optional[ExtractedField] = None
    raw_text: str = ""
    extraction_method: str = "pdf_text"  # "pdf_text" | "ocr" | "synthetic"
    processing_time_ms: float = 0.0
    fields: Dict[str, ExtractedField] = Field(default_factory=dict)

class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    document_type: DocumentType
    size_bytes: int
    content_type: str
    status: str = "uploaded"

class Severity(str, Enum):
    HIGH = "HIGH"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    INFORMATIONAL = "INFORMATIONAL"
    PASSED = "PASSED"

class Finding(BaseModel):
    id: str
    field_name: str
    doc_a_name: str
    doc_a_value: Optional[str] = None
    doc_b_name: Optional[str] = None
    doc_b_value: Optional[str] = None
    validation_rule: str
    severity: Severity
    explanation: str
    recommended_correction: str
    confidence: float = 1.0

class AuditRequest(BaseModel):
    doc_ids: Optional[List[str]] = None
    scheme: str = "pension"
    pre_extracted: Optional[List[ExtractedDocument]] = None

class AuditResult(BaseModel):
    audit_id: str
    scheme_code: str
    scheme_name: str
    readiness_score: int  # 0 to 100
    total_documents: int
    issues_detected: int
    high_priority_count: int
    review_required_count: int
    informational_count: int
    passed_count: int
    findings: List[Finding]
    extracted_documents: List[ExtractedDocument]
    timestamp: str
    summary: str
    disclaimer: str = (
        "SetuCheck is an explainable decision-support tool for pre-submission readiness. "
        "It does not guarantee government application acceptance or definitively predict official rejection."
    )

class AssistantRequest(BaseModel):
    audit_id: Optional[str] = None
    language: str = "en"  # "en", "te", "hi"
    finding_id: Optional[str] = None
    audit_result: Optional[AuditResult] = None

class FindingExplanation(BaseModel):
    finding_id: str
    field_name: str
    severity: Severity
    title: str
    simple_explanation: str
    action_step: str

class AssistantResponse(BaseModel):
    language: str
    language_name: str
    headline: str
    summary: str
    checklist: List[str]
    finding_explanations: List[FindingExplanation]
    step_by_step_guidance: List[str]
    source: str  # "gemini" or "deterministic_template"

class DemoCase(BaseModel):
    case_id: str
    title: str
    category: str
    description: str
    expected_findings_summary: str
    documents: List[ExtractedDocument]
