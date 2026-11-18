import os
import hashlib
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from app.config import REPORTS_DIR
from app.models.schemas import AuditResult, Severity

def generate_pdf_report(audit_result: AuditResult) -> Path:
    """
    Generates a professional, print-ready PDF document audit report using ReportLab.
    Features:
    - SetuCheck Emblem & Dossier Reference
    - 4-Category Readiness Score Breakdown
    - Embedded SHA-256 Tamper-Evidence Fingerprint
    - Embedded Cryptographic QR Code pointing to verification endpoint
    - Documented Validation Findings Table
    - Trilingual Applicant Action Checklist
    - Statutory Legal Disclaimer
    """
    pdf_filename = f"SetuCheck_Audit_{audit_result.audit_id}.pdf"
    pdf_path = REPORTS_DIR / pdf_filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    c_navy = colors.HexColor("#0F172A")
    c_blue = colors.HexColor("#1E3A8A")
    c_teal = colors.HexColor("#0D9488")
    c_gray = colors.HexColor("#475569")
    c_light_bg = colors.HexColor("#F8FAFC")
    c_red = colors.HexColor("#DC2626")
    c_amber = colors.HexColor("#D97706")
    c_green = colors.HexColor("#16A34A")

    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=c_blue
    )
    sub_style = ParagraphStyle(
        'DocSub', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=13, textColor=c_gray
    )
    heading2 = ParagraphStyle(
        'Heading2', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=c_navy
    )
    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.HexColor("#334155")
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer', parent=styles['Normal'],
        fontName='Helvetica-Oblique', fontSize=7, leading=9.5, textColor=c_gray
    )

    story = []

    # 1. Header with QR code and Emblem
    # Generate QR Code Widget pointing to verification endpoint
    verify_url = f"https://setucheck.gov.in/verify/{audit_result.audit_id}"
    qr_widget = QrCodeWidget(verify_url)
    qr_widget.barWidth = 55
    qr_widget.barHeight = 55
    qr_widget.qrVersion = 2
    d_qr = Drawing(60, 60)
    d_qr.add(qr_widget)

    header_data = [
        [
            Paragraph("<b>SETUCHECK</b> &bull; Pre-Submission Document Dossier<br/><font size=8 color='#64748B'>Track 1: Civic Pulse &bull; Digital Governance &bull; Decision Support</font>", title_style),
            d_qr,
            Paragraph(f"<b>Dossier ID:</b><br/>{audit_result.audit_id}<br/><b>Date:</b> {audit_result.timestamp[:10]}<br/><b>Rule Ver:</b> 2.1.0", sub_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[330, 70, 140])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4)
    ]))
    story.append(t_header)

    story.append(HRFlowable(width="100%", thickness=1.5, color=c_teal, spaceAfter=8, spaceBefore=4))

    # 2. Executive Overview & 4-Category Score Breakdown
    score = audit_result.readiness_score
    score_color = c_green if score >= 80 else (c_amber if score >= 60 else c_red)
    cat = audit_result.category_scores

    summary_text = f"""
    <b>Welfare Scheme:</b> {audit_result.scheme_name}<br/>
    <b>Documents Evaluated:</b> {audit_result.total_documents} &nbsp;|&nbsp; 
    <b>Issues Detected:</b> {audit_result.issues_detected} (High Priority: {audit_result.high_priority_count}, Review Needed: {audit_result.review_required_count})<br/>
    <b>Assessment Summary:</b> {audit_result.summary}
    """

    score_text = f"""
    <font size=22 color='{score_color.hexval()}'><b>{score} / 100</b></font><br/>
    <font size=7 color='{c_gray.hexval()}'><b>CATEGORY BREAKDOWN</b><br/>
    Completeness: {cat.completeness}/30 &bull; Consistency: {cat.consistency}/30<br/>
    Validation: {cat.field_validation}/20 &bull; Quality: {cat.document_quality}/20
    </font>
    """

    overview_data = [
        [
            Paragraph(summary_text, body_style),
            Paragraph(score_text, ParagraphStyle('Score', parent=body_style, alignment=1))
        ]
    ]
    t_overview = Table(overview_data, colWidths=[380, 160])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 10))

    # 3. Findings Table
    story.append(Paragraph("<b>Detailed Validation Findings & Discrepancies</b>", heading2))
    story.append(Spacer(1, 4))

    table_headers = ["Field", "Identity Value", "Secondary Value", "Status", "Finding & Recommended Action"]
    findings_rows = [table_headers]

    for f in audit_result.findings:
        sev_color = "green" if f.severity == Severity.PASSED else ("red" if f.severity == Severity.HIGH else "orange")
        status_label = f"<font color='{sev_color}'><b>{f.severity.value}</b></font>"

        finding_desc = f"<b>{f.validation_rule}</b><br/>{f.explanation}"
        if f.severity != Severity.PASSED:
            finding_desc += f"<br/><font color='#1E40AF'><b>Action:</b> {f.recommended_correction}</font>"

        row = [
            Paragraph(f.field_name, body_style),
            Paragraph(f.doc_a_value or "-", body_style),
            Paragraph(f.doc_b_value or "-", body_style),
            Paragraph(status_label, body_style),
            Paragraph(finding_desc, body_style)
        ]
        findings_rows.append(row)

    col_widths = [95, 90, 90, 65, 200]
    t_findings = Table(findings_rows, colWidths=col_widths, repeatRows=1)
    t_findings.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,1), (-1,-1), 4)
    ]))
    story.append(t_findings)
    story.append(Spacer(1, 10))

    # 4. Mandatory Applicant Action Checklist
    story.append(Paragraph("<b>Pre-Submission Applicant Rectification Checklist</b>", heading2))
    checklist_items = [
        "&bull; <b>Name Concordance:</b> Ensure applicant name exactly aligns across Aadhaar and Bank Passbook records for DBT processing.",
        "&bull; <b>IFSC Validation:</b> 11-digit bank IFSC code must have '0' as 5th character and point to an active core banking branch.",
        "&bull; <b>Legibility Check:</b> Rescan or re-upload any document flagged with missing or low confidence fields.",
        "&bull; <b>Jurisdiction Alignment:</b> Confirm address proof belongs to the scheme's designated eligibility block/ward."
    ]
    for item in checklist_items:
        story.append(Paragraph(item, body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 8))

    # 5. Cryptographic SHA-256 Fingerprint & Disclaimer
    sha_hash = audit_result.sha256_hash or hashlib.sha256(audit_result.audit_id.encode()).hexdigest()
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=4, spaceBefore=4))

    hash_p = Paragraph(
        f"<b>DOCUMENT INTEGRITY FINGERPRINT (SHA-256):</b> <font face='Courier'>{sha_hash}</font><br/>"
        f"Scan QR code or query <font face='Courier'>/api/reports/verify/{audit_result.audit_id}</font> to verify report integrity.",
        ParagraphStyle('Hash', parent=body_style, fontSize=7, leading=9, textColor=c_gray)
    )
    story.append(hash_p)

    story.append(Spacer(1, 4))
    disclaimer_p = Paragraph(
        f"<b>STATUTORY DISCLAIMER:</b> {audit_result.disclaimer} "
        "Official welfare scheme approvals remain subject to statutory verification by competent government authorities, "
        "UIDAI Aadhaar authentication, and direct banking switch validation.",
        disclaimer_style
    )
    story.append(disclaimer_p)

    doc.build(story)
    return pdf_path
