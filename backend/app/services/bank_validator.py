import re
from typing import List, Optional
from app.models.schemas import Finding, Severity
from app.rules.validation_rules import IFSC_REGEX
from app.utils.masking import mask_account_number

# Known popular bank prefixes for extra diagnostic assistance
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
            explanation=f"IFSC code was not found or could not be detected in {doc_name}.",
            recommended_correction="Provide a bank passbook page or statement clearly displaying the 11-character IFSC code.",
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
            explanation=f"IFSC code '{code}' has invalid length ({len(code)} characters). Must be exactly 11 characters.",
            recommended_correction="Check the passbook front page or cheque leaf for the complete 11-character IFSC code.",
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
            explanation=f"5th character in IFSC code '{code}' is '{code[4]}' instead of '0'. RBI mandates the 5th character must always be zero.",
            recommended_correction="Ensure the 5th character is the numeral '0' (zero), not the letter 'O'.",
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
            explanation=f"IFSC code '{code}' does not conform to the required format (4 letters, 0, 6 alphanumeric).",
            recommended_correction="Verify the IFSC code against your bank branch details or search the official RBI IFSC directory.",
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
        explanation=f"Valid IFSC format ({code}). Bank branch identified as {bank_name_hint}.",
        recommended_correction="No action required.",
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
            explanation=f"Bank account number could not be extracted from {doc_name}.",
            recommended_correction="Upload a clear image or scan of the first page of your bank passbook or cancelled cheque.",
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
            explanation=f"Account number '{masked}' contains non-numeric characters or OCR artefacts.",
            recommended_correction="Ensure account number digits are clearly legible and free from stray marks.",
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
            explanation=f"Account number length ({len(clean_acc)} digits) is outside the standard range of 9 to 18 digits.",
            recommended_correction="Check if the beginning zeros or trailing digits were cut off during scanning.",
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
            explanation="Account number contains identical repeated digits, indicating a dummy or corrupted entry.",
            recommended_correction="Please provide a genuine bank account passbook.",
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
        explanation=f"Account number format is valid ({len(clean_acc)} digits, format verified).",
        recommended_correction="No action required.",
        confidence=1.0
    )

def validate_bank_details(
    acc_num: Optional[str],
    ifsc: Optional[str],
    doc_name: str = "Bank Passbook"
) -> List[Finding]:
    """
    Executes full bank validation suite.
    """
    findings = []
    findings.append(validate_bank_account_number(acc_num, doc_name))
    findings.append(validate_ifsc_code(ifsc, doc_name))
    return findings
