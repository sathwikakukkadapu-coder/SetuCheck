from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_synthetic_pdf(filepath: Path, title: str, subtitle: str, fields: dict):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'SynTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0F172A'),
        alignment=1
    )
    sub_style = ParagraphStyle(
        'SynSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.HexColor('#64748B'),
        alignment=1
    )
    label_style = ParagraphStyle(
        'SynLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#1E3A8A')
    )
    val_style = ParagraphStyle(
        'SynVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.HexColor('#1E293B')
    )

    story = [
        Paragraph(title, title_style),
        Spacer(1, 4),
        Paragraph(subtitle, sub_style),
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0D9488'), spaceAfter=14),
        Paragraph("<b>[DEMO DOCUMENT - SYNTHETIC DATA FOR EVALUATION PURPOSES ONLY]</b>", ParagraphStyle('Watermark', parent=sub_style, fontSize=9, textColor=colors.HexColor('#DC2626'))),
        Spacer(1, 14)
    ]

    table_data = []
    for k, v in fields.items():
        table_data.append([
            Paragraph(f"<b>{k}:</b>", label_style),
            Paragraph(str(v), val_style)
        ])

    t = Table(table_data, colWidths=[160, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(t)
    doc.build(story)

def generate_all_demo_files():
    target_dir = Path(__file__).resolve().parent / "synthetic_docs"
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. Clean Aadhaar
    create_synthetic_pdf(
        target_dir / "aadhaar_suresh_clean.pdf",
        "GOVERNMENT OF INDIA / UIDAI",
        "Aadhaar Identity Verification Record (Synthetic)",
        {
            "Name": "Suresh Krishna Reddy",
            "DOB": "14/06/1962",
            "Gender": "Male",
            "Address": "Plot 42, Gandhi Nagar, Guntur, Andhra Pradesh, 522002",
            "Aadhaar Number": "XXXX XXXX 7492"
        }
    )

    # 2. Clean Passbook
    create_synthetic_pdf(
        target_dir / "passbook_suresh_clean.pdf",
        "STATE BANK OF INDIA",
        "Savings Bank Passbook Front Folio (Synthetic)",
        {
            "Account Holder": "Suresh Krishna Reddy",
            "Account Number": "30491827364",
            "IFSC Code": "SBIN0001234",
            "Bank Name": "State Bank of India",
            "Branch": "Guntur Main Branch"
        }
    )

    # 3. Ramesh Kumar Aadhaar
    create_synthetic_pdf(
        target_dir / "aadhaar_ramesh.pdf",
        "GOVERNMENT OF INDIA / UIDAI",
        "Aadhaar Identity Verification Record (Synthetic)",
        {
            "Name": "Ramesh Kumar",
            "DOB": "10/04/1958",
            "Address": "House No 12-4, Tilak Road, Hyderabad, Telangana, 500001",
            "Aadhaar Number": "XXXX XXXX 3819"
        }
    )

    # 4. Ramesh Kumer Passbook (Name variation)
    create_synthetic_pdf(
        target_dir / "passbook_ramesh_kumer.pdf",
        "HDFC BANK LIMITED",
        "Retail Banking Passbook (Synthetic - Spelling Variation)",
        {
            "Account Holder": "Ramesh Kumer",
            "Account Number": "918273645012",
            "IFSC Code": "HDFC0000128",
            "Bank Name": "HDFC Bank",
            "Branch": "Abids Hyderabad"
        }
    )

    # 5. Invalid IFSC Passbook
    create_synthetic_pdf(
        target_dir / "passbook_invalid_ifsc.pdf",
        "STATE BANK OF INDIA",
        "Savings Bank Passbook (Synthetic - Malformed IFSC)",
        {
            "Account Holder": "Priya Sharma",
            "Account Number": "62019485721",
            "IFSC Code": "SBINO0123",
            "Bank Name": "State Bank of India",
            "Branch": "Visakhapatnam Beach Road"
        }
    )

    print("Successfully generated all synthetic PDF demo files in", target_dir)

if __name__ == "__main__":
    generate_all_demo_files()
