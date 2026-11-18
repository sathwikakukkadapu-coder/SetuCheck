import json
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import SchemeRule, SchemeCreateUpdate
from app.db.database import get_db_connection

router = APIRouter(prefix="/schemes", tags=["Scheme Configurations"])

@router.get("", response_model=List[SchemeRule])
def list_schemes():
    """Returns all active government welfare schemes and document requirement definitions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE is_active = 1 ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()

    schemes = []
    for r in rows:
        schemes.append(SchemeRule(
            id=r["id"],
            name=r["name"],
            state=r["state"],
            required_documents=json.loads(r["required_documents"]),
            optional_documents=json.loads(r["optional_documents"]),
            field_requirements=json.loads(r["field_requirements"]),
            validation_rules=json.loads(r["validation_rules"]),
            source_url=r["source_url"],
            last_verified_date=r["last_verified_date"],
            rule_version=r["rule_version"],
            is_active=bool(r["is_active"]),
            updated_at=r["updated_at"]
        ))
    return schemes

@router.get("/{scheme_id}", response_model=SchemeRule)
def get_scheme(scheme_id: str):
    """Retrieve details and requirements for a specific scheme."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
    r = cursor.fetchone()
    conn.close()

    if not r:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")

    return SchemeRule(
        id=r["id"],
        name=r["name"],
        state=r["state"],
        required_documents=json.loads(r["required_documents"]),
        optional_documents=json.loads(r["optional_documents"]),
        field_requirements=json.loads(r["field_requirements"]),
        validation_rules=json.loads(r["validation_rules"]),
        source_url=r["source_url"],
        last_verified_date=r["last_verified_date"],
        rule_version=r["rule_version"],
        is_active=bool(r["is_active"]),
        updated_at=r["updated_at"]
    )

@router.put("/{scheme_id}", response_model=SchemeRule)
def update_scheme(scheme_id: str, payload: SchemeCreateUpdate):
    """Allows administrators to update scheme document requirements and bump rule version."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")

    # Bump minor version
    old_version = existing["rule_version"]
    parts = old_version.split(".")
    try:
        new_version = f"{parts[0]}.{int(parts[1]) + 1}.0"
    except Exception:
        new_version = f"{old_version}.1"

    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        UPDATE schemes SET
            name = ?,
            state = ?,
            required_documents = ?,
            optional_documents = ?,
            field_requirements = ?,
            validation_rules = ?,
            source_url = ?,
            rule_version = ?,
            updated_at = ?
        WHERE id = ?
    """, (
        payload.name,
        payload.state or existing["state"],
        json.dumps(payload.required_documents),
        json.dumps(payload.optional_documents or []),
        json.dumps(payload.field_requirements),
        json.dumps(payload.validation_rules or []),
        payload.source_url or existing["source_url"],
        new_version,
        now,
        scheme_id
    ))
    conn.commit()
    conn.close()

    return get_scheme(scheme_id)
