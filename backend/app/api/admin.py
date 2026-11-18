import sqlite3
import json
import time
from typing import Dict, Any, List
from fastapi import APIRouter
from app.db.database import get_db_connection
from app.api.audit import AUDIT_STORE

router = APIRouter(prefix="/admin", tags=["Operations & Analytics"])

START_TIME = time.time()

@router.get("/analytics")
def get_admin_analytics() -> Dict[str, Any]:
    """
    Returns operational statistics, audit volumes, discrepancy rates,
    and synthetic vs genuine audit activity metrics.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total audits count
    cursor.execute("SELECT COUNT(*) FROM audits")
    db_audit_count = cursor.fetchone()[0]

    # Overall audits including memory store if not persisted
    total_audits = max(db_audit_count, len(AUDIT_STORE))

    # Readiness score breakdown & pass rates
    cursor.execute("""
        SELECT 
            AVG(readiness_score) as avg_score,
            SUM(CASE WHEN readiness_score >= 80 THEN 1 ELSE 0 END) as ready_count,
            SUM(CASE WHEN readiness_score >= 50 AND readiness_score < 80 THEN 1 ELSE 0 END) as review_count,
            SUM(CASE WHEN readiness_score < 50 THEN 1 ELSE 0 END) as critical_count,
            SUM(total_documents) as total_docs,
            SUM(issues_detected) as total_issues,
            SUM(high_priority_count) as total_high,
            SUM(review_required_count) as total_review,
            SUM(is_synthetic) as synthetic_audits
        FROM audits
    """)
    stats_row = cursor.fetchone()

    avg_score = round(stats_row["avg_score"] or 0, 1)
    ready_count = stats_row["ready_count"] or 0
    review_count = stats_row["review_count"] or 0
    critical_count = stats_row["critical_count"] or 0
    total_docs = stats_row["total_docs"] or 0
    total_issues = stats_row["total_issues"] or 0
    total_high = stats_row["total_high"] or 0
    total_review_needed = stats_row["total_review"] or 0
    synthetic_count = stats_row["synthetic_audits"] or 0
    genuine_count = max(0, total_audits - synthetic_count)

    # Calculate pass rate (score >= 80)
    pass_rate = round((ready_count / total_audits * 100), 1) if total_audits > 0 else 0.0

    # Scheme distribution
    cursor.execute("""
        SELECT scheme_name, COUNT(*) as count, AVG(readiness_score) as avg_score
        FROM audits
        GROUP BY scheme_name
        ORDER BY count DESC
    """)
    scheme_rows = cursor.fetchall()
    scheme_distribution = [
        {"scheme": r["scheme_name"], "count": r["count"], "avg_score": round(r["avg_score"] or 0, 1)}
        for r in scheme_rows
    ]

    # Recent audits
    cursor.execute("""
        SELECT audit_id, scheme_name, readiness_score, issues_detected, high_priority_count, timestamp, is_synthetic
        FROM audits
        ORDER BY timestamp DESC
        LIMIT 10
    """)
    recent_rows = cursor.fetchall()
    recent_audits = [
        {
            "audit_id": r["audit_id"],
            "scheme_name": r["scheme_name"],
            "readiness_score": r["readiness_score"],
            "issues_detected": r["issues_detected"],
            "high_priority_count": r["high_priority_count"],
            "timestamp": r["timestamp"],
            "is_synthetic": bool(r["is_synthetic"])
        }
        for r in recent_rows
    ]

    # Access logs
    cursor.execute("""
        SELECT audit_id, action, accessed_at, ip_address
        FROM audit_access_logs
        ORDER BY accessed_at DESC
        LIMIT 15
    """)
    log_rows = cursor.fetchall()
    access_logs = [
        {
            "audit_id": r["audit_id"],
            "action": r["action"],
            "accessed_at": r["accessed_at"],
            "ip_address": r["ip_address"]
        }
        for r in log_rows
    ]

    # Active schemes count
    cursor.execute("SELECT COUNT(*) FROM schemes WHERE is_active = 1")
    active_schemes = cursor.fetchone()[0]

    # Manual reviews count
    cursor.execute("SELECT COUNT(*) FROM audit_reviews")
    manual_reviews_count = cursor.fetchone()[0]

    conn.close()

    uptime_seconds = int(time.time() - START_TIME)

    return {
        "overview": {
            "total_audits": total_audits,
            "documents_processed": total_docs,
            "applications_ready": ready_count,
            "applications_requiring_correction": critical_count + review_count,
            "pass_rate_percent": pass_rate,
            "average_readiness_score": avg_score,
            "total_issues_flagged": total_issues,
            "high_priority_issues": total_high,
            "review_required_issues": total_review_needed,
            "manual_annotations_recorded": manual_reviews_count,
            "active_schemes_configured": active_schemes,
            "genuine_audits": genuine_count,
            "synthetic_demo_audits": synthetic_count
        },
        "scheme_distribution": scheme_distribution,
        "recent_audits": recent_audits,
        "operational_logs": access_logs,
        "system_health": {
            "status": "healthy",
            "uptime_seconds": uptime_seconds,
            "database": "SQLite (WAL enabled)",
            "ocr_engine": "PyMuPDF native + Tesseract OCR Fallback",
            "validation_engine": "Deterministic RapidFuzz + Format Verification v1.2"
        }
    }
