import json
from typing import List, Dict, Any, Optional
from app.models.schemas import ExtractedDocument, Finding, Severity, StatusColor, DocumentType
from app.config import SUPPORTED_SCHEMES, DEFAULT_SCHEME
from app.db.database import get_db_connection

def get_scheme_metadata(scheme_code: str) -> Dict[str, Any]:
    """Retrieves scheme rules from database or fallback configuration."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes WHERE id = ? AND is_active = 1", (scheme_code,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "name": row["name"],
                "required_documents": json.loads(row["required_documents"]),
                "optional_documents": json.loads(row["optional_documents"]),
                "required_fields": json.loads(row["field_requirements"]),
                "validation_rules": json.loads(row["validation_rules"]),
                "version": row["rule_version"],
            }
    except Exception:
        pass

    # Fallback to in-memory config
    if scheme_code in SUPPORTED_SCHEMES:
        s = SUPPORTED_SCHEMES[scheme_code]
        return {
            "name": s["name"],
            "required_documents": s["required_documents"],
            "optional_documents": [],
            "required_fields": s["required_fields"],
            "validation_rules": [],
            "version": "1.0.0"
        }

    s_def = SUPPORTED_SCHEMES[DEFAULT_SCHEME]
    return {
        "name": s_def["name"],
        "required_documents": s_def["required_documents"],
        "optional_documents": [],
        "required_fields": s_def["required_fields"],
        "validation_rules": [],
        "version": "1.0.0"
    }

def check_scheme_completeness(
    documents: List[ExtractedDocument],
    scheme_code: str = DEFAULT_SCHEME
) -> List[Finding]:
    """
    Checks whether all required documents and mandatory fields are present
    for the selected welfare scheme.
    """
    scheme = get_scheme_metadata(scheme_code)
    required_doc_types = scheme["required_documents"]
    required_fields = scheme["required_fields"]

    findings: List[Finding] = []

    # Map uploaded document types
    present_types = {doc.document_type.value: doc for doc in documents}

    # 1. Document-level completeness
    for req_type in required_doc_types:
        doc_label = req_type.replace('_', ' ').title()
        if req_type not in present_types:
            findings.append(
                Finding(
                    id=f"DOC-MISS-{req_type.upper()}",
                    field_name=f"Mandatory Document: {doc_label}",
                    doc_a_name=doc_label,
                    doc_a_value="(Not Uploaded)",
                    doc_b_name=None,
                    doc_b_value=None,
                    validation_rule=f"{scheme['name']} Document Checklist",
                    severity=Severity.HIGH,
                    status_color=StatusColor.RED,
                    category="completeness",
                    explanation=f"{doc_label} is mandatory for '{scheme['name']}' but was not provided in the dossier.",
                    recommended_correction=f"Upload a valid {doc_label} to complete the required document set.",
                    evidence_snippet=f"Missing mandatory enclosure: {req_type}.",
                    confidence=1.0
                )
            )
        else:
            findings.append(
                Finding(
                    id=f"DOC-PRES-{req_type.upper()}",
                    field_name=f"Enclosure: {doc_label}",
                    doc_a_name=doc_label,
                    doc_a_value="Enclosed",
                    doc_b_name=None,
                    doc_b_value=None,
                    validation_rule=f"{scheme['name']} Document Checklist",
                    severity=Severity.PASSED,
                    status_color=StatusColor.GREEN,
                    category="completeness",
                    explanation=f"Mandatory {doc_label} is uploaded and recognized.",
                    recommended_correction="No action required.",
                    evidence_snippet=f"File: {present_types[req_type].original_filename}.",
                    confidence=1.0
                )
            )

    # 2. Field-level checks across present documents
    aggregated_fields: Dict[str, Optional[str]] = {}
    for doc in documents:
        if doc.name and doc.name.value:
            aggregated_fields["name"] = doc.name.value
        if doc.dob and doc.dob.value:
            aggregated_fields["dob"] = doc.dob.value
        if doc.bank_account_no and doc.bank_account_no.value:
            aggregated_fields["bank_account_no"] = doc.bank_account_no.value
        if doc.ifsc_code and doc.ifsc_code.value:
            aggregated_fields["ifsc_code"] = doc.ifsc_code.value
        if doc.address and doc.address.value:
            aggregated_fields["address"] = doc.address.value

    for req_field in required_fields:
        field_label = req_field.replace('_', ' ').title()
        if req_field not in aggregated_fields or not aggregated_fields[req_field]:
            findings.append(
                Finding(
                    id=f"FIELD-MISS-{req_field.upper()}",
                    field_name=field_label,
                    doc_a_name="Uploaded Documents",
                    doc_a_value="(Missing)",
                    doc_b_name=None,
                    doc_b_value=None,
                    validation_rule=f"Mandatory Field Requirement ({scheme['name']})",
                    severity=Severity.HIGH,
                    status_color=StatusColor.RED,
                    category="completeness",
                    explanation=f"Required field '{field_label}' was not extracted from any submitted document.",
                    recommended_correction=f"Ensure your uploaded documents clearly display your {field_label}.",
                    evidence_snippet=f"Field '{req_field}' missing across all files.",
                    confidence=1.0
                )
            )
        else:
            findings.append(
                Finding(
                    id=f"FIELD-PRES-{req_field.upper()}",
                    field_name=field_label,
                    doc_a_name="Uploaded Documents",
                    doc_a_value="Verified Present",
                    doc_b_name=None,
                    doc_b_value=None,
                    validation_rule=f"Mandatory Field Requirement ({scheme['name']})",
                    severity=Severity.PASSED,
                    status_color=StatusColor.GREEN,
                    category="completeness",
                    explanation=f"Required field '{field_label}' is present in the application dossier.",
                    recommended_correction="No action required.",
                    evidence_snippet=f"Field detected: '{aggregated_fields[req_field][:30]}...'",
                    confidence=1.0
                )
            )

    return findings
