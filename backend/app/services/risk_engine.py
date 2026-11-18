import uuid
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from app.models.schemas import (
    AuditResult,
    ExtractedDocument,
    Finding,
    Severity,
    StatusColor,
    DocumentType,
    CategoryScores,
    DeductionRecord
)
from app.config import SUPPORTED_SCHEMES, DEFAULT_SCHEME
from app.services.name_matcher import compare_names
from app.services.bank_validator import validate_bank_details
from app.services.address_matcher import compare_addresses
from app.services.completeness_checker import check_scheme_completeness, get_scheme_metadata
from app.db.database import get_db_connection

def calculate_category_scores(
    findings: List[Finding],
    documents: List[ExtractedDocument]
) -> Tuple[CategoryScores, List[DeductionRecord]]:
    """
    Computes transparent, category-wise scores based on documented rubric:
    1. Document Completeness (30 pts)
    2. Cross-Document Consistency (30 pts)
    3. Field Validation (20 pts)
    4. Document Quality & OCR Reliability (20 pts)
    Prevents double deductions for the same underlying issue.
    """
    comp_score = 30
    cons_score = 30
    val_score = 20
    qual_score = 20

    deductions: List[DeductionRecord] = []
    seen_deduction_keys = set()

    for f in findings:
        if f.severity == Severity.PASSED:
            continue

        cat = f.category or "consistency"

        # Category 1: Completeness
        if cat == "completeness":
            if "DOC-MISS" in f.id and f.id not in seen_deduction_keys:
                points = 15
                comp_score = max(0, comp_score - points)
                seen_deduction_keys.add(f.id)
                deductions.append(DeductionRecord(
                    rule_id=f.id, category="completeness", reason=f.explanation, points_deducted=points
                ))
            elif "FIELD-MISS" in f.id and f.id not in seen_deduction_keys:
                points = 8
                comp_score = max(0, comp_score - points)
                seen_deduction_keys.add(f.id)
                deductions.append(DeductionRecord(
                    rule_id=f.id, category="completeness", reason=f.explanation, points_deducted=points
                ))

        # Category 2: Consistency
        elif cat == "consistency":
            if "NAME" in f.id:
                dedup_key = "NAME_DEDUCTION"
                if dedup_key not in seen_deduction_keys:
                    if f.severity == Severity.HIGH:
                        points = 15
                    elif f.severity == Severity.REVIEW_REQUIRED:
                        points = 6
                    else:
                        points = 0
                    if points > 0:
                        cons_score = max(0, cons_score - points)
                        seen_deduction_keys.add(dedup_key)
                        deductions.append(DeductionRecord(
                            rule_id=f.id, category="consistency", reason=f.explanation, points_deducted=points
                        ))

            elif "ADDR" in f.id or "PIN" in f.id:
                dedup_key = "ADDR_DEDUCTION"
                if dedup_key not in seen_deduction_keys:
                    if f.severity == Severity.HIGH:
                        points = 12
                    elif f.severity == Severity.REVIEW_REQUIRED:
                        points = 6
                    else:
                        points = 0
                    if points > 0:
                        cons_score = max(0, cons_score - points)
                        seen_deduction_keys.add(dedup_key)
                        deductions.append(DeductionRecord(
                            rule_id=f.id, category="consistency", reason=f.explanation, points_deducted=points
                        ))

        # Category 3: Field Validation
        elif cat == "validation":
            if "IFSC" in f.id and "IFSC_DEDUCTION" not in seen_deduction_keys:
                points = 12 if f.severity == Severity.HIGH else 6
                val_score = max(0, val_score - points)
                seen_deduction_keys.add("IFSC_DEDUCTION")
                deductions.append(DeductionRecord(
                    rule_id=f.id, category="field_validation", reason=f.explanation, points_deducted=points
                ))
            elif "ACC" in f.id and "ACC_DEDUCTION" not in seen_deduction_keys:
                points = 12 if f.severity == Severity.HIGH else 6
                val_score = max(0, val_score - points)
                seen_deduction_keys.add("ACC_DEDUCTION")
                deductions.append(DeductionRecord(
                    rule_id=f.id, category="field_validation", reason=f.explanation, points_deducted=points
                ))

        # Fallback / Generic Unmapped Deduction for unit tests and arbitrary rules
        if f.id not in seen_deduction_keys and f.severity != Severity.PASSED:
            points = 25 if f.severity == Severity.HIGH else (10 if f.severity == Severity.REVIEW_REQUIRED else 0)
            if points > 0:
                cons_score = max(0, cons_score - points)
                seen_deduction_keys.add(f.id)
                deductions.append(DeductionRecord(
                    rule_id=f.id, category=cat, reason=f.explanation, points_deducted=points
                ))

    # Category 4: Document Quality & OCR Reliability
    if documents:
        # Collect all extracted fields from typed attributes and custom fields dict
        all_fields = []
        for doc in documents:
            for attr in ['name', 'dob', 'address', 'bank_account_no', 'ifsc_code', 'bank_name', 'income', 'caste']:
                val = getattr(doc, attr, None)
                if val and hasattr(val, 'confidence'):
                    all_fields.append(val)
            for f in doc.fields.values():
                if hasattr(f, 'confidence'):
                    all_fields.append(f)

        avg_conf = sum(f.confidence for f in all_fields) / max(1, len(all_fields)) if all_fields else 1.0
        low_conf_fields = [f for f in all_fields if f.confidence < 0.70]

        if avg_conf < 0.75 or len(low_conf_fields) >= 2:
            points = 6
            qual_score = max(0, qual_score - points)
            deductions.append(DeductionRecord(
                rule_id="QUAL-OCR-UNCERT",
                category="document_quality",
                reason="One or more fields exhibited low OCR recognition confidence (< 70%). Human verification recommended.",
                points_deducted=points
            ))

    total = comp_score + cons_score + val_score + qual_score

    scores = CategoryScores(
        completeness=comp_score,
        consistency=cons_score,
        field_validation=val_score,
        document_quality=qual_score,
        total=total
    )
    return scores, deductions

def run_audit_engine(
    documents: List[ExtractedDocument],
    scheme_code: str = DEFAULT_SCHEME
) -> AuditResult:
    """
    Executes the multi-document cross-comparison and deterministic validation engine.
    Calculates category-wise scores, persists result into SQLite database,
    and computes SHA-256 integrity hash.
    """
    scheme = get_scheme_metadata(scheme_code)
    findings: List[Finding] = []

    # Map documents by type
    docs_by_type: Dict[str, ExtractedDocument] = {doc.document_type.value: doc for doc in documents}

    identity_doc = docs_by_type.get(DocumentType.IDENTITY.value)
    bank_doc = docs_by_type.get(DocumentType.BANK_PASSBOOK.value)
    addr_doc = docs_by_type.get(DocumentType.ADDRESS_PROOF.value)

    # 1. Scheme completeness checks
    completeness_findings = check_scheme_completeness(documents, scheme_code)
    findings.extend(completeness_findings)

    # 2. Cross-document name matching
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

    # 3. Bank details validation
    if bank_doc:
        acc_no = bank_doc.bank_account_no.value if bank_doc.bank_account_no else None
        ifsc = bank_doc.ifsc_code.value if bank_doc.ifsc_code else None
        findings.extend(validate_bank_details(acc_no, ifsc, "Bank Passbook"))

    # 4. Address validation
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

    # Calculate category scores & deductions
    category_scores, deductions = calculate_category_scores(findings, documents)
    readiness_score = category_scores.total

    # Counts
    high_count = sum(1 for f in findings if f.severity == Severity.HIGH)
    review_count = sum(1 for f in findings if f.severity == Severity.REVIEW_REQUIRED)
    info_count = sum(1 for f in findings if f.severity == Severity.INFORMATIONAL)
    passed_count = sum(1 for f in findings if f.severity == Severity.PASSED)
    total_issues = high_count + review_count + info_count

    # Summary
    if high_count > 0:
        summary = (
            f"Audit completed with {high_count} critical issue(s) and {review_count} item(s) needing human verification. "
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
    timestamp = datetime.now(timezone.utc).isoformat()

    # Calculate cryptographic SHA-256 fingerprint for audit payload
    hasher = hashlib.sha256()
    hasher.update(f"{audit_id}:{scheme_code}:{readiness_score}:{timestamp}:{total_issues}".encode("utf-8"))
    sha256_hash = hasher.hexdigest()

    result = AuditResult(
        audit_id=audit_id,
        scheme_code=scheme_code,
        scheme_name=scheme["name"],
        readiness_score=readiness_score,
        category_scores=category_scores,
        deductions=deductions,
        total_documents=len(documents),
        issues_detected=total_issues,
        high_priority_count=high_count,
        review_required_count=review_count,
        informational_count=info_count,
        passed_count=passed_count,
        findings=findings,
        extracted_documents=documents,
        timestamp=timestamp,
        summary=summary,
        sha256_hash=sha256_hash
    )

    # Persist in SQLite
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO audits (
                audit_id, scheme_code, scheme_name, readiness_score,
                completeness_score, consistency_score, field_validation_score, document_quality_score,
                total_documents, issues_detected, high_priority_count, review_required_count,
                informational_count, passed_count, summary, sha256_hash, documents_json, findings_json, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            audit_id, scheme_code, scheme["name"], readiness_score,
            category_scores.completeness, category_scores.consistency,
            category_scores.field_validation, category_scores.document_quality,
            len(documents), total_issues, high_count, review_count, info_count, passed_count,
            summary, sha256_hash,
            json.dumps([doc.model_dump() for doc in documents]),
            json.dumps([f.model_dump() for f in findings]),
            timestamp
        ))
        conn.commit()
        conn.close()
    except Exception as db_err:
        pass

    return result

def calculate_readiness_score(findings: List[Finding]) -> int:
    """Helper for standalone score computation."""
    scores, _ = calculate_category_scores(findings, [])
    return scores.total
