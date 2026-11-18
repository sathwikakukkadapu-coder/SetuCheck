import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "setucheck.db"

def get_db_connection():
    """Returns a SQLite connection with dict-like row access."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema with necessary indexes."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Schemes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT NOT NULL DEFAULT 'All India / Central',
            required_documents TEXT NOT NULL,
            optional_documents TEXT NOT NULL,
            field_requirements TEXT NOT NULL,
            validation_rules TEXT NOT NULL,
            source_url TEXT,
            last_verified_date TEXT,
            rule_version TEXT NOT NULL DEFAULT '1.0.0',
            is_active INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL
        )
    """)

    # Audits table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audits (
            audit_id TEXT PRIMARY KEY,
            scheme_code TEXT NOT NULL,
            scheme_name TEXT NOT NULL,
            readiness_score INTEGER NOT NULL,
            completeness_score INTEGER NOT NULL DEFAULT 30,
            consistency_score INTEGER NOT NULL DEFAULT 30,
            field_validation_score INTEGER NOT NULL DEFAULT 20,
            document_quality_score INTEGER NOT NULL DEFAULT 20,
            total_documents INTEGER NOT NULL,
            issues_detected INTEGER NOT NULL,
            high_priority_count INTEGER NOT NULL,
            review_required_count INTEGER NOT NULL,
            informational_count INTEGER NOT NULL,
            passed_count INTEGER NOT NULL,
            summary TEXT NOT NULL,
            sha256_hash TEXT,
            documents_json TEXT NOT NULL,
            findings_json TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            is_synthetic INTEGER NOT NULL DEFAULT 0
        )
    """)

    # Manual Reviews & Annotations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id TEXT NOT NULL,
            finding_id TEXT NOT NULL,
            is_reviewed INTEGER NOT NULL DEFAULT 1,
            reviewer_notes TEXT,
            reviewed_by TEXT DEFAULT 'CSC Operator / Citizen',
            reviewed_at TEXT NOT NULL,
            FOREIGN KEY (audit_id) REFERENCES audits (audit_id),
            UNIQUE(audit_id, finding_id)
        )
    """)

    # Audit events / access logging
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id TEXT NOT NULL,
            action TEXT NOT NULL,
            accessed_at TEXT NOT NULL,
            ip_address TEXT DEFAULT '127.0.0.1'
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audits_timestamp ON audits(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_audit_id ON audit_reviews(audit_id)")

    conn.commit()

    # Seed default schemes if table is empty
    cursor.execute("SELECT COUNT(*) FROM schemes")
    if cursor.fetchone()[0] == 0:
        seed_default_schemes(conn)

    conn.close()

def seed_default_schemes(conn: sqlite3.Connection):
    """Seeds authentic, researched welfare scheme requirements."""
    now = datetime.now(timezone.utc).isoformat()
    schemes = [
        (
            "pension",
            "National Old Age Pension Scheme (NOAPS)",
            "Central / All India (MoRD)",
            json.dumps(["identity", "bank_passbook", "address_proof"]),
            json.dumps(["income_certificate"]),
            json.dumps(["name", "dob", "bank_account_no", "ifsc_code", "address"]),
            json.dumps(["NAME_MATCH", "IFSC_VALIDATION", "AGE_60_PLUS", "ADDRESS_MATCH"]),
            "https://nsap.nic.in/",
            "2026-01-15",
            "1.2.0",
            1,
            now
        ),
        (
            "pm_kisan",
            "PM-KISAN Samman Nidhi",
            "Central / All India (MoA&FW)",
            json.dumps(["identity", "bank_passbook"]),
            json.dumps(["land_records", "address_proof"]),
            json.dumps(["name", "bank_account_no", "ifsc_code"]),
            json.dumps(["NAME_MATCH", "IFSC_VALIDATION", "DBT_ACCOUNT_CHECK"]),
            "https://pmkisan.gov.in/",
            "2026-02-01",
            "2.0.1",
            1,
            now
        ),
        (
            "ration_card",
            "Public Distribution System (NFSA Ration Card)",
            "State / Civil Supplies Department",
            json.dumps(["identity", "address_proof"]),
            json.dumps(["income_certificate", "caste_certificate"]),
            json.dumps(["name", "address"]),
            json.dumps(["NAME_MATCH", "LOCALITY_PIN_MATCH"]),
            "https://nfsa.gov.in/",
            "2026-01-10",
            "1.1.0",
            1,
            now
        ),
        (
            "generic_audit",
            "General Pre-Submission Document Audit",
            "Universal Pre-Check",
            json.dumps(["identity", "bank_passbook"]),
            json.dumps(["address_proof", "income_certificate", "supporting"]),
            json.dumps(["name", "bank_account_no", "ifsc_code"]),
            json.dumps(["NAME_MATCH", "IFSC_VALIDATION", "ADDRESS_CHECK"]),
            "https://digitalindia.gov.in/",
            "2026-03-01",
            "1.0.0",
            1,
            now
        )
    ]

    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO schemes (
            id, name, state, required_documents, optional_documents,
            field_requirements, validation_rules, source_url,
            last_verified_date, rule_version, is_active, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, schemes)
    conn.commit()

# Initialize DB on module load
init_db()
