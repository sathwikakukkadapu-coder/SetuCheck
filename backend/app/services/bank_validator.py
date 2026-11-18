import re
from typing import List, Optional
from app.models.schemas import Finding, Severity, StatusColor
from app.rules.validation_rules import IFSC_REGEX
from app.utils.masking import mask_account_number

BANK_PREFIXES = {
    "SBIN": "State Bank of India",
    "HDFC": "HDFC Bank",
    "ICIC": "ICICI Bank",
    "PUNB": "Punjab National Bank",
    "BARB": "Bank of Baroda",
    "CNRB": "Canara Bank",
    "UBIN": "Union Bank of India",
    "IOBA": "Indian Overseas Bank",
    "IDIB": "Indian Bank",
    "KKBK": "Kotak Mahindra Bank",
    "AXIS": "Axis Bank",
}

def validate_ifsc_code(ifsc: Optional[str], doc_name: str = "Bank Passbook") -> Finding:
    """
    Validates Indian Financial System Code (IFSC) based on RBI guidelines:
    - Exactly 11 characters.
    - First 4 characters: Alphabetic bank code.
    - 5th character: ALWAYS numeric '0' (reserved for future use).
    - Last 6 characters: Alphanumeric branch code.
    """
    if not ifsc or not ifsc.strip():
        return Finding(
            id="IFSC-MISS-01",
            field_name="IFSC Code",
            doc_a_name=doc_name,
            doc_a_value="(Missing)",
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="Mandatory Bank IFSC Presence",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"IFSC code was not found or could not be detected in {doc_name}.",
            recommended_correction="Provide a bank passbook page or statement clearly displaying the 11-character IFSC code.",
            evidence_snippet=f"{doc_name}: No IFSC detected.",
            confidence=1.0
        )

    code = ifsc.strip().upper()

    # Rule Check: Length
    if len(code) != 11:
        return Finding(
            id="IFSC-LEN-01",
            field_name="IFSC Code",
            doc_a_name=doc_name,
            doc_a_value=code,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="IFSC Length Rule (11 characters)",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"IFSC code '{code}' has invalid length ({len(code)} characters). RBI standard requires exactly 11 characters.",
            recommended_correction="Check the passbook front page or cheque leaf for the complete 11-character IFSC code.",
            evidence_snippet=f"Detected: '{code}' (length {len(code)}, expected 11).",
            confidence=1.0
        )

    # Rule Check: 5th character is '0'
    if code[4] != '0':
        return Finding(
            id="IFSC-FIFTH-01",
            field_name="IFSC Code",
            doc_a_name=doc_name,
            doc_a_value=code,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="IFSC 5th Character Standard (Must be '0')",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"5th character in IFSC code '{code}' is '{code[4]}' instead of '0'. RBI mandates the 5th character must always be zero (not the letter 'O').",
            recommended_correction="Ensure the 5th character is the numeral '0' (zero), not the letter 'O'.",
            evidence_snippet=f"Character at index 4 is '{code[4]}', expected numeral '0'.",
            confidence=1.0
        )

    # Rule Check: Complete regex
    if not re.match(IFSC_REGEX, code):
        return Finding(
            id="IFSC-FMT-01",
            field_name="IFSC Code",
            doc_a_name=doc_name,
            doc_a_value=code,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="RBI IFSC Format Specification",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"IFSC code '{code}' does not conform to the required format (4 letters, 0, 6 alphanumeric).",
            recommended_correction="Verify the IFSC code against your bank branch details or search the official RBI IFSC directory.",
            evidence_snippet=f"Regex mismatch against '^[A-Z]{{4}}0[A-Z0-9]{{6}}$': '{code}'.",
            confidence=1.0
        )

    bank_name_hint = BANK_PREFIXES.get(code[:4], "Recognized Bank")
    return Finding(
        id="IFSC-PASS-01",
        field_name="IFSC Code",
        doc_a_name=doc_name,
        doc_a_value=code,
        doc_b_name=None,
        doc_b_value=None,
        validation_rule="RBI IFSC Format Specification",
        severity=Severity.PASSED,
        status_color=StatusColor.GREEN,
        category="validation",
        explanation=f"Valid IFSC format ({code}). Bank branch identified as {bank_name_hint}.",
        recommended_correction="No action required.",
        evidence_snippet=f"Format verified: {code} ({bank_name_hint}).",
        confidence=1.0
    )

def validate_bank_account_number(acc_num: Optional[str], doc_name: str = "Bank Passbook") -> Finding:
    """
    Validates Bank Account Number:
    - Must be present
    - Length between 9 and 18 digits (standard Indian core banking ranges)
    - Rejects all repetitive digits (e.g. 0000000000, 1111111111)
    - Rejects alphabetic characters in account number
    """
    if not acc_num or not acc_num.strip():
        return Finding(
            id="ACC-MISS-01",
            field_name="Bank Account Number",
            doc_a_name=doc_name,
            doc_a_value="(Missing)",
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="Mandatory Bank Account Presence",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"Bank account number could not be extracted from {doc_name}.",
            recommended_correction="Upload a clear image or scan of the first page of your bank passbook or cancelled cheque.",
            evidence_snippet=f"{doc_name}: No account digits detected.",
            confidence=1.0
        )

    clean_acc = re.sub(r'[\s\-]', '', acc_num.strip())
    masked = mask_account_number(clean_acc)

    # Check for non-digits
    if not clean_acc.isdigit():
        return Finding(
            id="ACC-NONNUM-01",
            field_name="Bank Account Number",
            doc_a_name=doc_name,
            doc_a_value=masked,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="Numeric Account Number Check",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"Account number '{masked}' contains non-numeric characters or OCR artefacts.",
            recommended_correction="Ensure account number digits are clearly legible and free from stray marks.",
            evidence_snippet=f"Non-numeric chars found in raw account string.",
            confidence=0.95
        )

    # Length Check (Typically 9-18 digits in Indian Banks)
    if len(clean_acc) < 9 or len(clean_acc) > 18:
        return Finding(
            id="ACC-LEN-01",
            field_name="Bank Account Number",
            doc_a_name=doc_name,
            doc_a_value=masked,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="Account Number Standard Length (9-18 digits)",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation=f"Account number length ({len(clean_acc)} digits) is outside the standard range (9 to 18 digits in Indian core banking).",
            recommended_correction="Check if beginning zeros or trailing digits were cut off during scanning.",
            evidence_snippet=f"Length: {len(clean_acc)} digits (standard: 9-18).",
            confidence=1.0
        )

    # Check for dummy / repetitive numbers
    if len(set(clean_acc)) == 1:
        return Finding(
            id="ACC-DUMMY-01",
            field_name="Bank Account Number",
            doc_a_name=doc_name,
            doc_a_value=masked,
            doc_b_name=None,
            doc_b_value=None,
            validation_rule="Account Plausibility & Entropy Check",
            severity=Severity.HIGH,
            status_color=StatusColor.RED,
            category="validation",
            explanation="Account number contains identical repeated digits, indicating a dummy or corrupted entry.",
            recommended_correction="Please provide a genuine bank account passbook.",
            evidence_snippet=f"Repetitive dummy digits detected: '{masked}'.",
            confidence=1.0
        )

    return Finding(
        id="ACC-PASS-01",
        field_name="Bank Account Number",
        doc_a_name=doc_name,
        doc_a_value=masked,
        doc_b_name=None,
        doc_b_value=None,
        validation_rule="Account Number Format and Plausibility",
        severity=Severity.PASSED,
        status_color=StatusColor.GREEN,
        category="validation",
        explanation=f"Account number format is valid ({len(clean_acc)} digits, format verified).",
        recommended_correction="No action required.",
        evidence_snippet=f"Passed format and entropy checks: {len(clean_acc)} digits.",
        confidence=1.0
    )

def validate_bank_details(
    acc_num: Optional[str],
    ifsc: Optional[str],
    doc_name: str = "Bank Passbook"
) -> List[Finding]:
    """Executes full bank validation suite."""
    return [
        validate_bank_account_number(acc_num, doc_name),
        validate_ifsc_code(ifsc, doc_name)
    ]
