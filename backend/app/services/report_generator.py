import os
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
from app.config import REPORTS_DIR
from app.models.schemas import AuditResult, Severity

def generate_pdf_report(audit_result: AuditResult) -> Path:
    """
    Generates a professional, print-ready PDF document audit report using ReportLab.
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

    # Brand Colors
    c_navy = colors.HexColor("#0F172A")
    c_blue = colors.HexColor("#1E3A8A")
    c_teal = colors.HexColor("#0D9488")
    c_gray = colors.HexColor("#475569")
    c_light_bg = colors.HexColor("#F8FAFC")
    c_red = colors.HexColor("#DC2626")
    c_amber = colors.HexColor("#D97706")
    c_green = colors.HexColor("#16A34A")

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_blue
    )

    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_gray
    )

    heading2 = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_navy
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=c_gray
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>SETUCHECK</b> &bull; Document Audit Dossier", title_style),
            Paragraph(f"<b>Audit ID:</b> {audit_result.audit_id}<br/><b>Date:</b> {audit_result.timestamp[:10]}", sub_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8)
    ]))
    story.append(t_header)

    story.append(HRFlowable(width="100%", thickness=1.5, color=c_teal, spaceAfter=12, spaceBefore=4))

    # 2. Executive Summary & Readiness Score
    score = audit_result.readiness_score
    score_color = c_green if score >= 80 else (c_amber if score >= 60 else c_red)

    summary_text = f"""
    <b>Welfare Scheme:</b> {audit_result.scheme_name}<br/>
    <b>Total Documents Evaluated:</b> {audit_result.total_documents} &nbsp;|&nbsp; 
    <b>Issues Flagged:</b> {audit_result.issues_detected} (High Priority: {audit_result.high_priority_count}, Review Needed: {audit_result.review_required_count})<br/>
    <b>Audit Conclusion:</b> {audit_result.summary}
    """

    score_text = f"<font size=24 color='{score_color.hexval()}'><b>{score} / 100</b></font><br/><font size=8 color='{c_gray.hexval()}'>Readiness Indicator</font>"

    overview_data = [
        [
            Paragraph(summary_text, body_style),
            Paragraph(score_text, ParagraphStyle('Score', parent=body_style, alignment=1))
        ]
    ]
    t_overview = Table(overview_data, colWidths=[420, 120])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 14))

    # 3. Findings Table
    story.append(Paragraph("<b>Detailed Validation Findings & Discrepancies</b>", heading2))
    story.append(Spacer(1, 6))

    table_headers = ["Field", "Doc A (Identity)", "Doc B (Secondary)", "Severity", "Finding & Recommended Action"]
    findings_rows = [table_headers]

    for f in audit_result.findings:
        sev_color = "green" if f.severity == Severity.PASSED else ("red" if f.severity == Severity.HIGH else "orange")
        sev_label = f"<font color='{sev_color}'><b>{f.severity.value}</b></font>"

        finding_desc = f"<b>{f.validation_rule}</b><br/>{f.explanation}"
        if f.severity != Severity.PASSED:
            finding_desc += f"<br/><font color='#1E40AF'><b>Fix:</b> {f.recommended_correction}</font>"

        row = [
            Paragraph(f.field_name, body_style),
            Paragraph(f.doc_a_value or "-", body_style),
            Paragraph(f.doc_b_value or "-", body_style),
            Paragraph(sev_label, body_style),
            Paragraph(finding_desc, body_style)
        ]
        findings_rows.append(row)

    col_widths = [100, 95, 95, 70, 180]
    t_findings = Table(findings_rows, colWidths=col_widths, repeatRows=1)
    t_findings.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,1), (-1,-1), 5)
    ]))
    story.append(t_findings)
    story.append(Spacer(1, 14))

    # 4. Mandatory Applicant Checklist
    story.append(Paragraph("<b>Pre-Submission Rectification Checklist</b>", heading2))
    checklist_items = [
        "&bull; <b>Name Match:</b> Ensure applicant name exactly aligns across Aadhaar and Bank Passbook.",
        "&bull; <b>IFSC Validation:</b> 11-digit IFSC code must have '0' as 5th character and point to an active branch.",
        "&bull; <b>Legibility Check:</b> Rescan or re-upload any document flagged with missing or low confidence fields.",
        "&bull; <b>Jurisdiction:</b> Confirm address proof belongs to the scheme's designated eligibility block/ward."
    ]
    for item in checklist_items:
        story.append(Paragraph(item, body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 14))

    # 5. Regulatory & Technical Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=6, spaceBefore=4))
    disclaimer_p = Paragraph(
        f"<b>IMPORTANT NOTICE & DISCLAIMER:</b> {audit_result.disclaimer} "
        "Official welfare scheme approvals remain subject to statutory verification by competent government authorities, "
        "UIDAI Aadhaar authentication, and direct banking switch validation.",
        disclaimer_style
    )
    story.append(disclaimer_p)

    doc.build(story)
    return pdf_path
