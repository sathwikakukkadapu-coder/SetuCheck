import re
from typing import Optional, Dict, Tuple
from rapidfuzz import fuzz
from app.models.schemas import Finding, Severity, StatusColor
from app.rules.validation_rules import ADDRESS_ABBREVIATIONS
from app.utils.masking import mask_address

def normalize_address(address: Optional[str]) -> str:
    """
    Normalizes address text:
    - Lowercase
    - Expands abbreviations (vill -> village, dist -> district, etc.)
    - Removes excessive punctuation
    - Strips extra spaces
    """
    if not address:
        return ""
    text = address.lower().strip()
    for pattern, replacement in ADDRESS_ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    # Remove punctuation except commas
    text = re.sub(r'[^a-z0-9\s,]', ' ', text)
    # Normalize spaces
    return re.sub(r'\s+', ' ', text).strip()

def extract_pincode(text: str) -> Optional[str]:
    """Extracts 6-digit Indian PIN code."""
    match = re.search(r'\b[1-9][0-9]{5}\b', text)
    return match.group(0) if match else None

def compare_addresses(
    addr_a: Optional[str],
    addr_b: Optional[str],
    doc_a_name: str = "Identity Document",
    doc_b_name: str = "Address Proof"
) -> Finding:
    """
    Compares two addresses across documents:
    - Checks for missing address
    - Checks PIN code match
    - Compares normalized address tokens
    - Distinguishes minor formatting differences from substantive mismatches
    - Explains that matching PIN codes alone do not prove same address
    """
    raw_a = addr_a.strip() if addr_a else ""
    raw_b = addr_b.strip() if addr_b else ""

    if not raw_a or not raw_b:
        missing_doc = doc_a_name if not raw_a else doc_b_name
        return Finding(
            id="ADDR-MISS-01",
            field_name="Residential Address",
            doc_a_name=doc_a_name,
            doc_a_value=mask_address(raw_a) or "(Missing)",
            doc_b_name=doc_b_name,
            doc_b_value=mask_address(raw_b) or "(Missing)",
            validation_rule="Address Completeness Check",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"Address details missing or incomplete in {missing_doc}.",
            recommended_correction="Upload a recognized address proof (Electricity bill, Ration Card, Voter ID) showing full address.",
            evidence_snippet=f"{missing_doc}: Address unpopulated.",
            confidence=1.0
        )

    # 1. Check PIN codes
    pin_a = extract_pincode(raw_a)
    pin_b = extract_pincode(raw_b)

    if pin_a and pin_b and pin_a != pin_b:
        return Finding(
            id="ADDR-PIN-MISMATCH",
            field_name="Residential Address (PIN Code)",
            doc_a_name=doc_a_name,
            doc_a_value=f"PIN {pin_a} ({mask_address(raw_a)})",
            doc_b_name=doc_b_name,
            doc_b_value=f"PIN {pin_b} ({mask_address(raw_b)})",
            validation_rule="Postal PIN Code Concordance",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="consistency",
            explanation=f"Postal PIN code mismatch detected: {pin_a} in {doc_a_name} vs {pin_b} in {doc_b_name}. This indicates different postal delivery jurisdictions.",
            recommended_correction="Ensure both documents reflect your current residential jurisdiction. Provide updated domicile or residence certificate.",
            evidence_snippet=f"PIN disparity: {pin_a} != {pin_b}.",
            confidence=0.98
        )

    # 2. Normalized similarity
    norm_a = normalize_address(raw_a)
    norm_b = normalize_address(raw_b)

    if norm_a == norm_b:
        return Finding(
            id="ADDR-MATCH-01",
            field_name="Residential Address",
            doc_a_name=doc_a_name,
            doc_a_value=mask_address(raw_a),
            doc_b_name=doc_b_name,
            doc_b_value=mask_address(raw_b),
            validation_rule="Address Consistency Check",
            severity=Severity.PASSED,
            status_color=StatusColor.GREEN,
            category="consistency",
            explanation="Residential address components match consistently across documents. (Note: matching PIN and locality verify consistency across submitted files).",
            recommended_correction="No action required.",
            evidence_snippet=f"Normalized address match: '{norm_a}'.",
            confidence=1.0
        )

    token_sort = fuzz.token_sort_ratio(norm_a, norm_b)
    token_set = fuzz.token_set_ratio(norm_a, norm_b)
    best_similarity = max(token_sort, token_set)

    # Minor formatting differences (similarity >= 82%)
    if best_similarity >= 82:
        return Finding(
            id="ADDR-FORMAT-VAR",
            field_name="Residential Address",
            doc_a_name=doc_a_name,
            doc_a_value=mask_address(raw_a),
            doc_b_name=doc_b_name,
            doc_b_value=mask_address(raw_b),
            validation_rule="Address Fuzzy & Abbreviation Match",
            severity=Severity.INFORMATIONAL,
            status_color=StatusColor.GREEN,
            category="consistency",
            explanation=f"Minor formatting or abbreviation variance detected between addresses (Match: {int(best_similarity)}%). Core location components and PIN are consistent.",
            recommended_correction="Verify that the address format conforms to portal field standards.",
            evidence_snippet=f"Fuzzy score {int(best_similarity)}% with common abbreviations expanded.",
            confidence=round(best_similarity / 100.0, 2)
        )

    # Moderate difference (60% to 81%)
    if best_similarity >= 60:
        return Finding(
            id="ADDR-REVIEW-01",
            field_name="Residential Address",
            doc_a_name=doc_a_name,
            doc_a_value=mask_address(raw_a),
            doc_b_name=doc_b_name,
            doc_b_value=mask_address(raw_b),
            validation_rule="Address Component Consistency",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"Addresses show notable variances in street, ward or locality description (Match: {int(best_similarity)}%). Manual verification advised.",
            recommended_correction="Ensure that the address on your identity proof matches your current residence proof or attach a local body residence declaration.",
            evidence_snippet=f"Address similarity score: {int(best_similarity)}%.",
            confidence=round(best_similarity / 100.0, 2)
        )

    # Substantive Mismatch (< 60%)
    return Finding(
        id="ADDR-MISMATCH-HIGH",
        field_name="Residential Address",
        doc_a_name=doc_a_name,
        doc_a_value=mask_address(raw_a),
        doc_b_name=doc_b_name,
        doc_b_value=mask_address(raw_b),
        validation_rule="Address Jurisdiction Concordance",
        severity=Severity.HIGH,
        status_color=StatusColor.RED,
        category="consistency",
        explanation=f"Significant address discrepancy between {doc_a_name} and {doc_b_name}. Indicates different localities or wards.",
        recommended_correction="Welfare scheme benefits often require local village/mandal residency proof. Submit an aligned document set.",
        evidence_snippet=f"Low similarity (<60%): '{norm_a}' vs '{norm_b}'.",
        confidence=round(best_similarity / 100.0, 2)
    )
