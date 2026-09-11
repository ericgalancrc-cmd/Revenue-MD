"""
Builds a board-ready PDF export of the Denial Root Cause Engine /
Revenue Intelligence output — the "hand this to the CFO" artifact an
RCM director needs instead of a screenshot of the dashboard.
"""
from __future__ import annotations
from io import BytesIO
from typing import Any, Dict
from datetime import datetime, timezone

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)


def build_revenue_intelligence_pdf(payload: Dict[str, Any], org_label: str = "RevenueMD") -> bytes:
    """Return PDF bytes for the given Revenue Intelligence payload
    (the same shape returned by /api/analytics/revenue-intelligence)."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=letter,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
    )
    styles = getSampleStyleSheet()
    heading_style = ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"], spaceBefore=16, spaceAfter=8,
    )
    story = []

    generated = datetime.now(timezone.utc).strftime("%B %d, %Y")
    story.append(Paragraph("Denial Root Cause Report", styles["Title"]))
    story.append(Paragraph(f"{org_label} &middot; Generated {generated}", styles["Normal"]))
    story.append(Spacer(1, 16))

    # ── Executive summary ──────────────────────────────────────────────
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(payload.get("executive_summary", "No summary available."), styles["Normal"]))
    story.append(Spacer(1, 8))

    # ── Headline metrics ────────────────────────────────────────────────
    metrics_data = [
        ["Total Claims", "Denied Claims", "Denial Rate", "Value at Risk", "Recovered", "Recovery Rate"],
        [
            str(payload.get("total_claims", 0)),
            str(payload.get("total_denied_claims", 0)),
            f"{payload.get('denial_rate_pct', 0)}%",
            f"${payload.get('total_denied_value', 0):,.2f}",
            f"${payload.get('total_recovered_value', 0):,.2f}",
            f"{payload.get('recovery_rate_pct', 0)}%",
        ],
    ]
    metrics_table = Table(metrics_data, hAlign="LEFT")
    metrics_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F766E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 8))

    # ── Root causes ──────────────────────────────────────────────────────
    story.append(Paragraph("Denial Root Causes", heading_style))
    root_causes = payload.get("root_causes", [])
    if root_causes:
        rc_data = [["Category", "Claims", "% of Denials", "Value Impact"]]
        for rc in root_causes:
            rc_data.append([
                rc["category"], str(rc["claim_count"]),
                f"{rc['pct_of_denials']}%", f"${rc['value_impact']:,.2f}",
            ])
        rc_table = Table(rc_data, hAlign="LEFT", colWidths=[2.6 * inch, 0.9 * inch, 1.1 * inch, 1.3 * inch])
        rc_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(rc_table)
    else:
        story.append(Paragraph("No denial root causes recorded yet.", styles["Normal"]))
    story.append(Spacer(1, 8))

    # ── By provider ───────────────────────────────────────────────────────
    story.append(Paragraph("By Provider", heading_style))
    by_provider = payload.get("by_provider", [])
    if by_provider:
        p_data = [["Provider", "Denied Claims", "Denied Value"]]
        for p in by_provider:
            p_data.append([p["provider"], str(p["denied_claims"]), f"${p['denied_value']:,.2f}"])
        p_table = Table(p_data, hAlign="LEFT", colWidths=[2.6 * inch, 1.3 * inch, 1.6 * inch])
        p_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(p_table)
    else:
        story.append(Paragraph("No provider data available.", styles["Normal"]))
    story.append(Spacer(1, 8))

    # ── By payer ──────────────────────────────────────────────────────────
    story.append(Paragraph("By Payer", heading_style))
    by_payer = payload.get("by_payer", [])
    if by_payer:
        pay_data = [["Payer", "Denied Claims", "Denied Value"]]
        for p in by_payer:
            pay_data.append([p["payer"], str(p["denied_claims"]), f"${p['denied_value']:,.2f}"])
        pay_table = Table(pay_data, hAlign="LEFT", colWidths=[2.6 * inch, 1.3 * inch, 1.6 * inch])
        pay_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(pay_table)
    else:
        story.append(Paragraph("No payer data available.", styles["Normal"]))

    doc.build(story)
    return buf.getvalue()
