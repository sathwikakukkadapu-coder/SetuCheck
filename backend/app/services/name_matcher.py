import re
from typing import Tuple, Dict, Any, Optional
from rapidfuzz import fuzz
from app.models.schemas import Finding, Severity

def normalize_name(name: Optional[str]) -> str:
    """
    Normalizes a person's name:
    - Lowercase
    - Strip common titles/honorifics (Mr, Mrs, Smt, Shri, Dr, Kumari)
    - Remove extra punctuation and dots (e.g. 'K. Ramesh' -> 'k ramesh')
    - Collapse extra whitespace
    """
    if not name:
        return ""
    text = name.lower().strip()
    # Remove honorifics
    text = re.sub(r'^(shri|shree|smt|srimathi|mr|mrs|miss|ms|kumari|dr)\.?\s+', '', text)
    # Remove punctuation
    text = re.sub(r'[^\w\s]', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def compare_names(
    name_a: str,
    name_b: str,
    doc_a_name: str = "Identity Document",
    doc_b_name: str = "Bank Passbook"
) -> Finding:
    """
    Performs comprehensive name matching across two documents:
    1. Exact match
    2. Normalized match (ignoring case, punctuation, honorifics)
    3. Token sort match (e.g. 'Kumar Ramesh' vs 'Ramesh Kumar')
    4. Fuzzy string similarity (RapidFuzz)
    Returns a structured Finding object.
    """
    raw_a = name_a.strip() if name_a else ""
    raw_b = name_b.strip() if name_b else ""

    if not raw_a or not raw_b:
        return Finding(
            id="NAME-MISSING-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a or "(Missing)",
            doc_b_name=doc_b_name,
            doc_b_value=raw_b or "(Missing)",
            validation_rule="Mandatory Name Cross-Check",
            severity=Severity.HIGH,
            explanation=f"Name is missing in one of the documents ({doc_a_name if not raw_a else doc_b_name}).",
            recommended_correction="Ensure both documents have clearly legible applicant names.",
            confidence=1.0
        )

    # 1. Exact match
    if raw_a == raw_b:
        return Finding(
            id="NAME-MATCH-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Exact Name Match",
            severity=Severity.PASSED,
            explanation="Applicant name matches identically across both documents.",
            recommended_correction="No action required.",
            confidence=1.0
        )

    norm_a = normalize_name(raw_a)
    norm_b = normalize_name(raw_b)

    # 2. Normalized Match
    if norm_a == norm_b:
        return Finding(
            id="NAME-NORM-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Normalized Punctuation & Title Match",
            severity=Severity.PASSED,
            explanation=f"Names match after normalizing spacing and titles ('{raw_a}' vs '{raw_b}').",
            recommended_correction="No action required. Minor cosmetic formatting variation.",
            confidence=0.98
        )

    # 3. Token Sort Match (e.g. Ramesh Kumar vs Kumar Ramesh)
    token_score = fuzz.token_sort_ratio(norm_a, norm_b)
    fuzzy_ratio = fuzz.ratio(norm_a, norm_b)

    # Check for swapped first/last name
    tokens_a = set(norm_a.split())
    tokens_b = set(norm_b.split())
    if tokens_a == tokens_b:
        return Finding(
            id="NAME-TOKEN-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Word Order Inversion Check",
            severity=Severity.REVIEW_REQUIRED,
            explanation=f"Name components are inverted between documents ('{raw_a}' vs '{raw_b}').",
            recommended_correction="Verify if government welfare portal specifies 'First Name Last Name' or 'Surname First' order.",
            confidence=0.92
        )

    # 4. High fuzzy similarity (e.g. Ramesh Kumar vs Ramesh Kumer, 90%+)
    if token_score >= 88 or fuzzy_ratio >= 88:
        # Find mismatched characters
        diff_desc = f"Spelling variation detected (Similarity: {int(max(token_score, fuzzy_ratio))}%): '{raw_a}' in {doc_a_name} vs '{raw_b}' in {doc_b_name}."
        return Finding(
            id="NAME-SPELL-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Fuzzy Spelling Similarity Check",
            severity=Severity.REVIEW_REQUIRED,
            explanation=diff_desc,
            recommended_correction="Verify the correct official spelling against your original identity proof and request a bank passbook update or notarized affidavit if required.",
            confidence=round(max(token_score, fuzzy_ratio) / 100.0, 2)
        )

    # 5. Moderate similarity (70% - 87%)
    if token_score >= 70 or fuzzy_ratio >= 70:
        return Finding(
            id="NAME-MISMATCH-MED",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Phonetic & Levenshtein Name Distance",
            severity=Severity.HIGH,
            explanation=f"Substantial name discrepancy found ('{raw_a}' vs '{raw_b}', match score {int(max(token_score, fuzzy_ratio))}%).",
            recommended_correction="Direct Benefit Transfer (DBT) requires high name concordance. Update bank records to match identity document.",
            confidence=round(max(token_score, fuzzy_ratio) / 100.0, 2)
        )

    # 6. Complete mismatch (< 70%)
    return Finding(
        id="NAME-MISMATCH-HIGH",
        field_name="Applicant Name",
        doc_a_name=doc_a_name,
        doc_a_value=raw_a,
        doc_b_name=doc_b_name,
        doc_b_value=raw_b,
        validation_rule="Applicant Name Concordance",
        severity=Severity.HIGH,
        explanation=f"Names do not match between {doc_a_name} ('{raw_a}') and {doc_b_name} ('{raw_b}').",
        recommended_correction="Ensure both documents belong to the same applicant. Provide valid legal name change certificate or gazette notification if applicable.",
        confidence=round(max(token_score, fuzzy_ratio) / 100.0, 2)
    )
