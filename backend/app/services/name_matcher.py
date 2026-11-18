import re
import unicodedata
from typing import Tuple, Dict, Any, Optional, Set
from rapidfuzz import fuzz
from app.models.schemas import Finding, Severity, StatusColor

# Common Indic-English transliteration phonetic variants
TRANSLITERATION_MAP = {
    r'\blaxmi\b': 'lakshmi',
    r'\breddi\b': 'reddy',
    r'\bkumer\b': 'kumar',
    r'\bchaudhary\b': 'chowdary',
    r'\bchoudhary\b': 'chowdary',
    r'\bsing\b': 'singh',
    r'\brau\b': 'rao',
    r'\bprasada\b': 'prasad',
    r'\bsarma\b': 'sharma',
    r'\bverma\b': 'varma',
    r'\bvankata\b': 'venkata',
    r'\bwankata\b': 'venkata',
    r'\bsreenivas\b': 'srinivas',
    r'\bsrinivasa\b': 'srinivas',
}

def unicode_normalize_text(text: Optional[str]) -> str:
    """Applies NFKD Unicode normalization to handle accents, diactritics, and Indic scripts."""
    if not text:
        return ""
    normalized = unicodedata.normalize('NFKD', str(text))
    # Remove combining diacritics
    return "".join(c for c in normalized if not unicodedata.combining(c))

def normalize_name_basic(name: Optional[str]) -> str:
    """Normalizes case, whitespace, titles, and punctuation without altering letters."""
    if not name:
        return ""
    text = unicode_normalize_text(name).lower().strip()
    text = re.sub(r'^(shri|shree|smt|srimathi|mr|mrs|miss|ms|kumari|dr)\.?\s+', '', text)
    text = re.sub(r'\b(s/o|d/o|w/o|c/o)\b.*', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def normalize_name(name: Optional[str]) -> str:
    """
    Normalizes a person's name for deterministic cross-comparison:
    - Unicode normalization
    - Strip common titles/honorifics (Shri, Smt, Mr, Mrs, Kumari, Dr)
    - Remove punctuation, dots, hyphens
    - Apply transliteration phonetic harmonization
    - Collapse extra whitespace
    """
    text = normalize_name_basic(name)
    if not text:
        return ""
    # Apply transliteration normalizations
    for pattern, replacement in TRANSLITERATION_MAP.items():
        text = re.sub(pattern, replacement, text)
    return re.sub(r'\s+', ' ', text).strip()

def check_initial_expansion(norm_a: str, norm_b: str) -> bool:
    """
    Detects if one name is an initial expansion of the other.
    E.g. 'k ramesh' vs 'kukkadapu ramesh'
    """
    toks_a = norm_a.split()
    toks_b = norm_b.split()
    if len(toks_a) != len(toks_b):
        return False

    for ta, tb in zip(toks_a, toks_b):
        if ta == tb:
            continue
        # Check if single letter matches start of full word
        if (len(ta) == 1 and tb.startswith(ta)) or (len(tb) == 1 and ta.startswith(tb)):
            continue
        return False
    return True

def compare_names(
    name_a: str,
    name_b: str,
    doc_a_name: str = "Identity Document",
    doc_b_name: str = "Bank Passbook"
) -> Finding:
    """
    Performs comprehensive, explainable name matching across two documents:
    1. Exact string match
    2. Normalized match (titles, punctuation, case)
    3. Indic transliteration alignment (e.g. Laxmi vs Lakshmi)
    4. Initial expansion match (e.g. K. Ramesh vs Kukkadapu Ramesh)
    5. Token inversion match (e.g. Kumar Ramesh vs Ramesh Kumar)
    6. Fuzzy string similarity (RapidFuzz)
    Returns structured Finding with status color, evidence, and clear human explanation.
    """
    raw_a = name_a.strip() if name_a else ""
    raw_b = name_b.strip() if name_b else ""

    if not raw_a or not raw_b:
        missing_doc = doc_a_name if not raw_a else doc_b_name
        return Finding(
            id="NAME-MISSING-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a or "(Missing)",
            doc_b_name=doc_b_name,
            doc_b_value=raw_b or "(Missing)",
            validation_rule="Mandatory Name Cross-Check",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="consistency",
            explanation=f"Applicant name is missing in {missing_doc}. Cross-document comparison cannot proceed.",
            recommended_correction="Ensure both documents have clearly legible applicant names.",
            evidence_snippet=f"{doc_a_name}: '{raw_a or 'NULL'}' | {doc_b_name}: '{raw_b or 'NULL'}'",
            confidence=1.0
        )

    # 1. Exact Match
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
            status_color=StatusColor.GREEN,
            category="consistency",
            explanation="Applicant name matches identically across both documents.",
            recommended_correction="No action required.",
            evidence_snippet=f"Identical character match: '{raw_a}'",
            confidence=1.0
        )

    basic_a = normalize_name_basic(raw_a)
    basic_b = normalize_name_basic(raw_b)

    # 2. Normalized Spacing & Punctuation Match
    if basic_a == basic_b:
        return Finding(
            id="NAME-NORM-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Normalized Spacing & Punctuation Match",
            severity=Severity.PASSED,
            status_color=StatusColor.GREEN,
            category="consistency",
            explanation=f"Names match identically after normalizing spacing, case, and honorific titles ('{raw_a}' vs '{raw_b}').",
            recommended_correction="No action required. Formatting variance is acceptable.",
            evidence_snippet=f"Normalized to '{basic_a}' across both records.",
            confidence=1.0
        )

    norm_a = normalize_name(raw_a)
    norm_b = normalize_name(raw_b)

    # 3. Transliteration / Spelling Variation Match
    if norm_a == norm_b:
        return Finding(
            id="NAME-SPELL-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Spelling / Transliteration Variance Check",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"A spelling variation or regional transliteration difference was detected ('{raw_a}' vs '{raw_b}').",
            recommended_correction="Verify official spelling on Aadhaar before submission. If needed, update bank passbook.",
            evidence_snippet=f"Regional transliteration harmonization aligns '{raw_a}' and '{raw_b}'.",
            confidence=0.92
        )

    # 3. Initial Expansion Check
    if check_initial_expansion(norm_a, norm_b):
        return Finding(
            id="NAME-INITIAL-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Initial / Surname Expansion Verification",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"One document uses an abbreviated initial while the other expands the full name ('{raw_a}' vs '{raw_b}').",
            recommended_correction="Verify that the initial corresponds to the citizen's legal family name or father's name as recognized by portal guidelines.",
            evidence_snippet=f"Initial expansion detected between '{raw_a}' and '{raw_b}'.",
            confidence=0.90
        )

    # 4. Token Order Inversion Check
    tokens_a = set(norm_a.split())
    tokens_b = set(norm_b.split())
    if tokens_a == tokens_b and len(tokens_a) > 1:
        return Finding(
            id="NAME-TOKEN-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Word Order Inversion Check",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"Name components are inverted between documents ('{raw_a}' vs '{raw_b}').",
            recommended_correction="Check whether the welfare portal requires 'Given Name First' or 'Surname First' order.",
            evidence_snippet=f"Same tokens with different order: '{raw_a}' vs '{raw_b}'.",
            confidence=0.92
        )

    # 5. Fuzzy String Similarity
    token_score = fuzz.token_sort_ratio(norm_a, norm_b)
    fuzzy_ratio = fuzz.ratio(norm_a, norm_b)
    best_score = max(token_score, fuzzy_ratio)

    if best_score >= 85:
        return Finding(
            id="NAME-SPELL-01",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Fuzzy Spelling Similarity Check",
            severity=Severity.REVIEW_REQUIRED,
            status_color=StatusColor.YELLOW,
            category="consistency",
            explanation=f"Names are similar ({int(best_score)}% similarity), but a spelling difference was detected ('{raw_a}' in {doc_a_name} vs '{raw_b}' in {doc_b_name}).",
            recommended_correction="Verify the correct official spelling against your original identity proof and request a bank passbook update if needed.",
            evidence_snippet=f"Levenshtein similarity: {int(best_score)}%. Mismatch: '{raw_a}' vs '{raw_b}'.",
            confidence=round(best_score / 100.0, 2)
        )

    if best_score >= 68:
        return Finding(
            id="NAME-MISMATCH-MED",
            field_name="Applicant Name",
            doc_a_name=doc_a_name,
            doc_a_value=raw_a,
            doc_b_name=doc_b_name,
            doc_b_value=raw_b,
            validation_rule="Phonetic & Levenshtein Distance Check",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="consistency",
            explanation=f"Substantial name discrepancy found ('{raw_a}' vs '{raw_b}', match score {int(best_score)}%). Direct Benefit Transfer (DBT) will likely fail.",
            recommended_correction="Direct Benefit Transfer requires high concordance. Update bank records to match identity proof.",
            evidence_snippet=f"Low similarity ({int(best_score)}%): '{raw_a}' vs '{raw_b}'.",
            confidence=round(best_score / 100.0, 2)
        )

    # Complete Mismatch (<68%)
    return Finding(
        id="NAME-MISMATCH-HIGH",
        field_name="Applicant Name",
        doc_a_name=doc_a_name,
        doc_a_value=raw_a,
        doc_b_name=doc_b_name,
        doc_b_value=raw_b,
        validation_rule="Applicant Name Concordance",
        severity=Severity.HIGH,
        status_color=StatusColor.RED,
        category="consistency",
        explanation=f"Names do not match between {doc_a_name} ('{raw_a}') and {doc_b_name} ('{raw_b}'). Documents appear to belong to different individuals.",
        recommended_correction="Ensure both documents belong to the same applicant. Provide legal name change certificate or gazette notification if applicable.",
        evidence_snippet=f"Severe mismatch (<68%): '{raw_a}' vs '{raw_b}'.",
        confidence=round(best_score / 100.0, 2)
    )
