from typing import List, Dict, Any
from fastapi import APIRouter
from app.models.schemas import (
    DemoCase,
    ExtractedDocument,
    ExtractedField,
    FieldStatus,
    DocumentType
)

router = APIRouter(prefix="/demo", tags=["Demonstration Cases"])

# 5 Synthetic Demonstration Cases
DEMO_CASES: List[DemoCase] = [
    DemoCase(
        case_id="case-1-perfect",
        title="Case 1: Perfect Concordance (Green / Clean Dossier)",
        category="Perfect Match",
        description="All documents align identically: valid name, 11-digit IFSC code (SBIN0001234), matching address and PIN.",
        expected_findings_summary="Score: 100/100. 0 critical issues. All required fields verified.",
        documents=[
            ExtractedDocument(
                doc_id="syn-id-1",
                original_filename="synthetic_aadhaar_card.pdf",
                document_type=DocumentType.IDENTITY,
                name=ExtractedField(value="Suresh Krishna Reddy", confidence=0.98, status=FieldStatus.EXTRACTED),
                dob=ExtractedField(value="14/06/1962", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Plot 42, Gandhi Nagar, Guntur, Andhra Pradesh, 522002", confidence=0.92, status=FieldStatus.EXTRACTED),
                raw_text="GOVERNMENT OF INDIA\nName: Suresh Krishna Reddy\nDOB: 14/06/1962\nAddress: Plot 42, Gandhi Nagar, Guntur, Andhra Pradesh, 522002",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-bank-1",
                original_filename="synthetic_bank_passbook.pdf",
                document_type=DocumentType.BANK_PASSBOOK,
                name=ExtractedField(value="Suresh Krishna Reddy", confidence=0.96, status=FieldStatus.EXTRACTED),
                bank_account_no=ExtractedField(value="30491827364", confidence=0.95, status=FieldStatus.EXTRACTED),
                ifsc_code=ExtractedField(value="SBIN0001234", confidence=0.98, status=FieldStatus.EXTRACTED),
                bank_name=ExtractedField(value="State Bank of India", confidence=0.99, status=FieldStatus.EXTRACTED),
                raw_text="STATE BANK OF INDIA\nAccount Holder: Suresh Krishna Reddy\nA/C No: 30491827364\nIFSC: SBIN0001234\nBranch: Guntur Main",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-addr-1",
                original_filename="synthetic_electricity_bill.pdf",
                document_type=DocumentType.ADDRESS_PROOF,
                name=ExtractedField(value="Suresh Krishna Reddy", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Plot 42, Gandhi Nagar, Guntur, AP, 522002", confidence=0.90, status=FieldStatus.EXTRACTED),
                raw_text="APCPDCL ELECTRICITY BILL\nConsumer: Suresh Krishna Reddy\nAddress: Plot 42, Gandhi Nagar, Guntur, AP, 522002",
                extraction_method="pdf_text"
            )
        ]
    ),
    DemoCase(
        case_id="case-2-name-mismatch",
        title="Case 2: Name Variation ('Ramesh Kumar' vs 'Ramesh Kumer')",
        category="Name Mismatch",
        description="Fuzzy spelling discrepancy between Aadhaar identity proof and bank passbook. Typical reason for DBT reject.",
        expected_findings_summary="Score ~75/100. REVIEW_REQUIRED: Spelling variation detected with 92% fuzzy concordance.",
        documents=[
            ExtractedDocument(
                doc_id="syn-id-2",
                original_filename="synthetic_identity_ramesh.pdf",
                document_type=DocumentType.IDENTITY,
                name=ExtractedField(value="Ramesh Kumar", confidence=0.97, status=FieldStatus.EXTRACTED),
                dob=ExtractedField(value="10/04/1958", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="House No 12-4, Tilak Road, Hyderabad, Telangana, 500001", confidence=0.91, status=FieldStatus.EXTRACTED),
                raw_text="GOVERNMENT OF INDIA\nName: Ramesh Kumar\nDOB: 10/04/1958\nAddress: House No 12-4, Tilak Road, Hyderabad, Telangana, 500001",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-bank-2",
                original_filename="synthetic_passbook_ramesh.pdf",
                document_type=DocumentType.BANK_PASSBOOK,
                name=ExtractedField(value="Ramesh Kumer", confidence=0.95, status=FieldStatus.EXTRACTED),
                bank_account_no=ExtractedField(value="918273645012", confidence=0.95, status=FieldStatus.EXTRACTED),
                ifsc_code=ExtractedField(value="HDFC0000128", confidence=0.98, status=FieldStatus.EXTRACTED),
                bank_name=ExtractedField(value="HDFC Bank", confidence=0.99, status=FieldStatus.EXTRACTED),
                raw_text="HDFC BANK LIMITED\nA/C Name: Ramesh Kumer\nAccount No: 918273645012\nIFSC: HDFC0000128",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-addr-2",
                original_filename="synthetic_residence_ramesh.pdf",
                document_type=DocumentType.ADDRESS_PROOF,
                name=ExtractedField(value="Ramesh Kumar", confidence=0.96, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="H.No 12-4, Tilak Road, Hyderabad, 500001", confidence=0.88, status=FieldStatus.EXTRACTED),
                raw_text="RESIDENCE CERTIFICATE\nName: Ramesh Kumar\nAddress: H.No 12-4, Tilak Road, Hyderabad, 500001",
                extraction_method="pdf_text"
            )
        ]
    ),
    DemoCase(
        case_id="case-3-invalid-ifsc",
        title="Case 3: Malformed Bank IFSC Code ('SBIN00123' - Length & 5th char)",
        category="Invalid IFSC",
        description="Bank passbook contains an invalid IFSC format missing characters and violating RBI 11-character rule.",
        expected_findings_summary="Score ~70/100. HIGH PRIORITY: IFSC code format rule violated.",
        documents=[
            ExtractedDocument(
                doc_id="syn-id-3",
                original_filename="synthetic_id_priya.pdf",
                document_type=DocumentType.IDENTITY,
                name=ExtractedField(value="Priya Sharma", confidence=0.98, status=FieldStatus.EXTRACTED),
                dob=ExtractedField(value="22/11/1965", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Flat 301, Lakeview Apts, Visakhapatnam, AP, 530003", confidence=0.93, status=FieldStatus.EXTRACTED),
                raw_text="GOVERNMENT OF INDIA\nName: Priya Sharma\nDOB: 22/11/1965\nAddress: Flat 301, Lakeview Apts, Visakhapatnam, AP, 530003",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-bank-3",
                original_filename="synthetic_passbook_invalid_ifsc.pdf",
                document_type=DocumentType.BANK_PASSBOOK,
                name=ExtractedField(value="Priya Sharma", confidence=0.96, status=FieldStatus.EXTRACTED),
                bank_account_no=ExtractedField(value="62019485721", confidence=0.95, status=FieldStatus.EXTRACTED),
                ifsc_code=ExtractedField(value="SBINO0123", confidence=0.92, status=FieldStatus.EXTRACTED),
                bank_name=ExtractedField(value="State Bank of India", confidence=0.95, status=FieldStatus.EXTRACTED),
                raw_text="STATE BANK OF INDIA\nAccount Holder: Priya Sharma\nA/C No: 62019485721\nIFSC: SBINO0123",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-addr-3",
                original_filename="synthetic_gas_bill_priya.pdf",
                document_type=DocumentType.ADDRESS_PROOF,
                name=ExtractedField(value="Priya Sharma", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Flat 301, Lakeview Apartments, Visakhapatnam, 530003", confidence=0.90, status=FieldStatus.EXTRACTED),
                raw_text="LPG GAS CONSUMER RECEIPT\nName: Priya Sharma\nAddress: Flat 301, Lakeview Apartments, Visakhapatnam, 530003",
                extraction_method="pdf_text"
            )
        ]
    ),
    DemoCase(
        case_id="case-4-missing-info",
        title="Case 4: Incomplete Bank Account & Missing Address Proof",
        category="Missing Information",
        description="Account number has only 5 truncated digits, and mandatory address proof was not uploaded.",
        expected_findings_summary="Score ~45/100. HIGH PRIORITY: Incomplete account number & missing mandatory address proof.",
        documents=[
            ExtractedDocument(
                doc_id="syn-id-4",
                original_filename="synthetic_id_anand.pdf",
                document_type=DocumentType.IDENTITY,
                name=ExtractedField(value="Anand Varma", confidence=0.96, status=FieldStatus.EXTRACTED),
                dob=ExtractedField(value="05/01/1960", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Door 5-98, Main Bazaar, Vijayawada, AP, 520001", confidence=0.92, status=FieldStatus.EXTRACTED),
                raw_text="GOVERNMENT OF INDIA\nName: Anand Varma\nDOB: 05/01/1960\nAddress: Door 5-98, Main Bazaar, Vijayawada, AP, 520001",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-bank-4",
                original_filename="synthetic_truncated_passbook.pdf",
                document_type=DocumentType.BANK_PASSBOOK,
                name=ExtractedField(value="Anand Varma", confidence=0.95, status=FieldStatus.EXTRACTED),
                bank_account_no=ExtractedField(value="12345", confidence=0.60, status=FieldStatus.UNCLEAR),
                ifsc_code=ExtractedField(value="UBIN0532185", confidence=0.98, status=FieldStatus.EXTRACTED),
                bank_name=ExtractedField(value="Union Bank of India", confidence=0.95, status=FieldStatus.EXTRACTED),
                raw_text="UNION BANK OF INDIA\nAccount Holder: Anand Varma\nA/C No: 12345\nIFSC: UBIN0532185",
                extraction_method="pdf_text"
            )
        ]
    ),
    DemoCase(
        case_id="case-5-multiple-issues",
        title="Case 5: Compound Discrepancies (Name + IFSC + Missing Fields)",
        category="Multiple Issues",
        description="High-risk scenario: Name differs significantly ('Murali Mohan Rao' vs 'M M Rao'), IFSC is malformed, and address PIN differs.",
        expected_findings_summary="Score ~25/100. Multiple HIGH PRIORITY warnings. Immediate rectification required.",
        documents=[
            ExtractedDocument(
                doc_id="syn-id-5",
                original_filename="synthetic_id_murali.pdf",
                document_type=DocumentType.IDENTITY,
                name=ExtractedField(value="Murali Mohan Rao", confidence=0.97, status=FieldStatus.EXTRACTED),
                dob=ExtractedField(value="18/09/1959", confidence=0.95, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="D.No 8-2-120, Road No 2, Banjara Hills, Hyderabad, 500034", confidence=0.92, status=FieldStatus.EXTRACTED),
                raw_text="GOVERNMENT OF INDIA\nName: Murali Mohan Rao\nDOB: 18/09/1959\nAddress: D.No 8-2-120, Road No 2, Banjara Hills, Hyderabad, 500034",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-bank-5",
                original_filename="synthetic_passbook_murali.pdf",
                document_type=DocumentType.BANK_PASSBOOK,
                name=ExtractedField(value="M M Rao", confidence=0.92, status=FieldStatus.EXTRACTED),
                bank_account_no=ExtractedField(value="000000000000", confidence=0.50, status=FieldStatus.UNCLEAR),
                ifsc_code=ExtractedField(value="ICIC001X", confidence=0.70, status=FieldStatus.UNCLEAR),
                bank_name=ExtractedField(value="ICICI Bank", confidence=0.95, status=FieldStatus.EXTRACTED),
                raw_text="ICICI BANK\nAccount: M M Rao\nA/C: 000000000000\nIFSC: ICIC001X",
                extraction_method="pdf_text"
            ),
            ExtractedDocument(
                doc_id="syn-addr-5",
                original_filename="synthetic_addr_murali.pdf",
                document_type=DocumentType.ADDRESS_PROOF,
                name=ExtractedField(value="Murali Rao", confidence=0.90, status=FieldStatus.EXTRACTED),
                address=ExtractedField(value="Sector 4, MVP Colony, Visakhapatnam, 530017", confidence=0.90, status=FieldStatus.EXTRACTED),
                raw_text="WATER TAX RECEIPT\nName: Murali Rao\nAddress: Sector 4, MVP Colony, Visakhapatnam, 530017",
                extraction_method="pdf_text"
            )
        ]
    )
]

@router.get("/cases", response_model=List[DemoCase])
def list_demo_cases():
    """Returns the 5 synthetic demonstration cases for instant one-click testing."""
    return DEMO_CASES

@router.get("/cases/{case_id}", response_model=DemoCase)
def get_demo_case(case_id: str):
    """Retrieve details and synthetic documents of a specific demo case."""
    for case in DEMO_CASES:
        if case.case_id == case_id:
            return case
    return DEMO_CASES[0]
