from typing import List, Dict, Any, Optional
from app.models.schemas import ExtractedDocument, Finding, Severity, DocumentType
from app.config import SUPPORTED_SCHEMES, DEFAULT_SCHEME

def check_scheme_completeness(
    documents: List[ExtractedDocument],
    scheme_code: str = DEFAULT_SCHEME
) -> List[Finding]:
    """
    Checks whether all required documents and mandatory fields are present
    for the selected welfare scheme.
    """
    scheme = SUPPORTED_SCHEMES.get(scheme_code, SUPPORTED_SCHEMES[DEFAULT_SCHEME])
    required_doc_types = scheme["required_documents"]
    required_fields = scheme["required_fields"]

    findings: List[Finding] = []

    # Map uploaded document types
    present_types = {doc.document_type.value: doc for doc in documents}

    # 1. Document-level checks
    for req_type in required_doc_types:
        if req_type not in present_types:
            doc_label = req_type.replace('_', ' ').title()
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
                    explanation=f"{doc_label} is required for '{scheme['name']}' but was not provided.",
                    recommended_correction=f"Upload a valid {doc_label} to complete the required document set.",
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
        if req_field not in aggregated_fields or not aggregated_fields[req_field]:
            field_label = req_field.replace('_', ' ').title()
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
                    explanation=f"Required field '{field_label}' was not extracted from any submitted document.",
                    recommended_correction=f"Ensure your uploaded documents clearly display your {field_label}.",
                    confidence=1.0
                )
            )
        else:
            field_label = req_field.replace('_', ' ').title()
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
                    explanation=f"Required field '{field_label}' is present in the application dossier.",
                    recommended_correction="No action required.",
                    confidence=1.0
                )
            )

    return findings
