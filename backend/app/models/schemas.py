from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class DocumentType(str, Enum):
    IDENTITY = "identity"
    BANK_PASSBOOK = "bank_passbook"
    ADDRESS_PROOF = "address_proof"
    INCOME_CERTIFICATE = "income_certificate"
    CASTE_CERTIFICATE = "caste_certificate"
    SUPPORTING = "supporting"

class FieldStatus(str, Enum):
    EXTRACTED = "extracted"
    UNCLEAR = "unclear"
    MISSING = "missing"
    MANUAL_VERIFICATION_REQUIRED = "manual_verification_required"

class StatusColor(str, Enum):
    GREEN = "GREEN"    # Consistent / Format Validated
    YELLOW = "YELLOW"  # Needs Review / Low OCR Confidence
    RED = "RED"        # Mismatch / Missing Required Information
    GRAY = "GRAY"      # Not Checked / Insufficient Evidence

class Severity(str, Enum):
    HIGH = "HIGH"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    INFORMATIONAL = "INFORMATIONAL"
    PASSED = "PASSED"

class BoundingBox(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    page: int = 1
    description: Optional[str] = None

class ExtractedField(BaseModel):
    value: Optional[str] = None
    original_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    status: FieldStatus = FieldStatus.EXTRACTED
    source_line: Optional[str] = None
    source_document: Optional[str] = None
    page_number: int = 1
    bounding_box: Optional[BoundingBox] = None
    manual_status: str = "unmodified"  # unmodified | verified | corrected

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
    certificate_type: Optional[ExtractedField] = None
    issue_date: Optional[ExtractedField] = None
    expiry_date: Optional[ExtractedField] = None
    raw_text: str = ""
    extraction_method: str = "pdf_text"  # pdf_text | ocr | synthetic
    processing_time_ms: float = 0.0
    fields: Dict[str, ExtractedField] = Field(default_factory=dict)

class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    document_type: DocumentType
    size_bytes: int
    content_type: str
    status: str = "uploaded"

class Finding(BaseModel):
    id: str
    field_name: str
    doc_a_name: str
    doc_a_value: Optional[str] = None
    doc_b_name: Optional[str] = None
    doc_b_value: Optional[str] = None
    validation_rule: str
    severity: Severity
    status_color: StatusColor = StatusColor.GREEN
    category: str = "consistency"  # completeness | consistency | validation | quality
    explanation: str
    recommended_correction: str
    evidence_snippet: Optional[str] = None
    confidence: float = 1.0
    is_reviewed: bool = False
    reviewer_notes: Optional[str] = None
    reviewed_at: Optional[str] = None

class CategoryScores(BaseModel):
    completeness: int = Field(default=30, ge=0, le=30)
    consistency: int = Field(default=30, ge=0, le=30)
    field_validation: int = Field(default=20, ge=0, le=20)
    document_quality: int = Field(default=20, ge=0, le=20)
    total: int = Field(default=100, ge=0, le=100)

class DeductionRecord(BaseModel):
    rule_id: str
    category: str
    reason: str
    points_deducted: int

class AuditRequest(BaseModel):
    doc_ids: Optional[List[str]] = None
    scheme: str = "pension"
    pre_extracted: Optional[List[ExtractedDocument]] = None

class AuditResult(BaseModel):
    audit_id: str
    scheme_code: str
    scheme_name: str
    readiness_score: int  # 0 to 100
    category_scores: CategoryScores
    deductions: List[DeductionRecord] = Field(default_factory=list)
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
    sha256_hash: Optional[str] = None
    disclaimer: str = (
        "SetuCheck is an explainable decision-support tool for pre-submission readiness. "
        "It does not guarantee government application acceptance or definitively predict official rejection."
    )

class FindingReviewPayload(BaseModel):
    finding_id: str
    is_reviewed: bool = True
    reviewer_notes: str

class SchemeRule(BaseModel):
    id: str
    name: str
    state: str = "All India"
    required_documents: List[str]
    optional_documents: List[str] = []
    field_requirements: List[str]
    validation_rules: List[str]
    source_url: Optional[str] = None
    last_verified_date: Optional[str] = None
    rule_version: str = "1.0.0"
    is_active: bool = True
    updated_at: Optional[str] = None

class SchemeCreateUpdate(BaseModel):
    name: str
    state: Optional[str] = "All India"
    required_documents: List[str]
    optional_documents: Optional[List[str]] = []
    field_requirements: List[str]
    validation_rules: Optional[List[str]] = []
    source_url: Optional[str] = None

class AssistantRequest(BaseModel):
    audit_id: Optional[str] = None
    language: str = "en"  # en | te | hi
    finding_id: Optional[str] = None
    audit_result: Optional[AuditResult] = None

class FindingExplanation(BaseModel):
    finding_id: str
    field_name: str
    severity: Severity
    status_color: StatusColor
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
    source: str  # gemini | deterministic_template

class DemoCase(BaseModel):
    case_id: str
    title: str
    category: str
    description: str
    expected_findings_summary: str
    documents: List[ExtractedDocument]

class AuditVerificationResponse(BaseModel):
    audit_id: str
    is_valid: bool
    sha256_hash: str
    timestamp: str
    scheme_name: str
    readiness_score: int
    total_documents: int
    issues_detected: int
    verification_message: str

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    language: str = "en"  # en | te | hi
    audit_id: Optional[str] = None
    audit_result: Optional[AuditResult] = None
    history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    language: str
    suggested_questions: List[str] = Field(default_factory=list)
    referenced_rules: List[str] = Field(default_factory=list)
    source: str = "setumitra_engine"

class SimulatedFieldOverride(BaseModel):
    doc_id: Optional[str] = None
    doc_type: Optional[str] = None
    field_name: str
    corrected_value: str

class SimulateFixRequest(BaseModel):
    scheme: str = "pension"
    documents: List[ExtractedDocument]
    overrides: List[SimulatedFieldOverride]

class SimulateFixResponse(BaseModel):
    original_score: int
    projected_score: int
    score_delta: int
    updated_result: AuditResult
    resolved_findings_count: int
