import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    AuditResult,
    ExtractedDocument,
    Finding,
    Severity,
    DocumentType
)
from app.config import SUPPORTED_SCHEMES, DEFAULT_SCHEME
from app.services.name_matcher import compare_names
from app.services.bank_validator import validate_bank_details
from app.services.address_matcher import compare_addresses
from app.services.completeness_checker import check_scheme_completeness

def calculate_readiness_score(findings: List[Finding]) -> int:
    """
    Computes an explainable score between 0 and 100 based on documented rule deductions:
    - High priority finding: -25 points
    - Review required finding: -12 points
    - Informational finding: 0 points (advisory only, no penalty)
    - Minimum score: 0, Maximum: 100
    """
    score = 100
    for finding in findings:
        if finding.severity == Severity.HIGH:
            score -= 25
        elif finding.severity == Severity.REVIEW_REQUIRED:
            score -= 12
        elif finding.severity == Severity.INFORMATIONAL:
            score -= 0

    return max(0, min(100, score))

def run_audit_engine(
    documents: List[ExtractedDocument],
    scheme_code: str = DEFAULT_SCHEME
) -> AuditResult:
    """
    Executes the complete SetuCheck deterministic validation engine:
    1. Scheme document & mandatory field completeness check
    2. Cross-document name matching (Identity vs Bank, Identity vs Address)
    3. Bank details validation (IFSC code format, account number format)
    4. Address matching and PIN code cross-checks
    5. Scoring & Explainable summary generation
    """
    scheme = SUPPORTED_SCHEMES.get(scheme_code, SUPPORTED_SCHEMES[DEFAULT_SCHEME])
    findings: List[Finding] = []

    # Map documents by type
    docs_by_type: Dict[str, ExtractedDocument] = {doc.document_type.value: doc for doc in documents}

    identity_doc = docs_by_type.get(DocumentType.IDENTITY.value)
    bank_doc = docs_by_type.get(DocumentType.BANK_PASSBOOK.value)
    addr_doc = docs_by_type.get(DocumentType.ADDRESS_PROOF.value)

    # 1. Completeness Checks
    completeness_findings = check_scheme_completeness(documents, scheme_code)
    findings.extend(completeness_findings)

    # 2. Cross-Document Name Matching
    if identity_doc and bank_doc:
        id_name = identity_doc.name.value if identity_doc.name else ""
        bank_name = bank_doc.name.value if bank_doc.name else ""
        findings.append(compare_names(
            id_name,
            bank_name,
            doc_a_name="Identity Document",
            doc_b_name="Bank Passbook"
        ))

    if identity_doc and addr_doc and addr_doc.name and addr_doc.name.value:
        id_name = identity_doc.name.value if identity_doc.name else ""
        addr_name = addr_doc.name.value
        findings.append(compare_names(
            id_name,
            addr_name,
            doc_a_name="Identity Document",
            doc_b_name="Address Proof"
        ))

    # 3. Bank Validation (IFSC & Account Number)
    if bank_doc:
        acc_no = bank_doc.bank_account_no.value if bank_doc.bank_account_no else None
        ifsc = bank_doc.ifsc_code.value if bank_doc.ifsc_code else None
        findings.extend(validate_bank_details(acc_no, ifsc, "Bank Passbook"))

    # 4. Address Validation
    if identity_doc and addr_doc:
        id_addr = identity_doc.address.value if identity_doc.address else ""
        proof_addr = addr_doc.address.value if addr_doc.address else ""
        if id_addr or proof_addr:
            findings.append(compare_addresses(
                id_addr,
                proof_addr,
                doc_a_name="Identity Document",
                doc_b_name="Address Proof"
            ))

    # Calculate statistics
    high_count = sum(1 for f in findings if f.severity == Severity.HIGH)
    review_count = sum(1 for f in findings if f.severity == Severity.REVIEW_REQUIRED)
    info_count = sum(1 for f in findings if f.severity == Severity.INFORMATIONAL)
    passed_count = sum(1 for f in findings if f.severity == Severity.PASSED)
    total_issues = high_count + review_count + info_count

    readiness_score = calculate_readiness_score(findings)

    # Generate transparent high-level summary
    if high_count > 0:
        summary = (
            f"Audit completed with {high_count} critical issue(s) and {review_count} item(s) needing review. "
            f"Readiness Score: {readiness_score}/100. Resolution recommended before official portal submission."
        )
    elif review_count > 0:
        summary = (
            f"Audit completed with {review_count} recommendation(s) for verification. "
            f"Readiness Score: {readiness_score}/100. Application dossier is mostly sound but requires attention."
        )
    else:
        summary = (
            f"All automated checks passed successfully. "
            f"Readiness Score: {readiness_score}/100. High document concordance detected."
        )

    audit_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"

    return AuditResult(
        audit_id=audit_id,
        scheme_code=scheme_code,
        scheme_name=scheme["name"],
        readiness_score=readiness_score,
        total_documents=len(documents),
        issues_detected=total_issues,
        high_priority_count=high_count,
        review_required_count=review_count,
        informational_count=info_count,
        passed_count=passed_count,
        findings=findings,
        extracted_documents=documents,
        timestamp=datetime.now(timezone.utc).isoformat(),
        summary=summary
    )
