const API_BASE = import.meta.env.VITE_API_URL || '';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Health check error:", err);
    return { status: "unreachable", error: err.message };
  }
}

export async function fetchDemoCases() {
  const res = await fetch(`${API_BASE}/api/demo/cases`);
  if (!res.ok) throw new Error("Failed to load demo cases");
  return await res.json();
}

export async function fetchDemoCase(caseId) {
  const res = await fetch(`${API_BASE}/api/demo/cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to load demo case ${caseId}`);
  return await res.json();
}

export async function uploadDocumentFiles(fileList, docTypes) {
  const formData = new FormData();
  fileList.forEach((file) => {
    formData.append('files', file);
  });
  if (docTypes) {
    docTypes.forEach((dt) => {
      formData.append('doc_types', dt);
    });
  }

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Upload failed");
  }

  return await res.json();
}

export async function extractDocumentFields(docIds) {
  const res = await fetch(`${API_BASE}/api/documents/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_ids: docIds }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Extraction failed");
  }

  return await res.json();
}

export async function runAudit({ scheme, pre_extracted, doc_ids }) {
  const res = await fetch(`${API_BASE}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheme: scheme || 'pension',
      pre_extracted: pre_extracted || null,
      doc_ids: doc_ids || null,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Audit execution failed");
  }

  return await res.json();
}

export async function fetchAuditResult(auditId) {
  const res = await fetch(`${API_BASE}/api/audit/${auditId}`);
  if (!res.ok) throw new Error(`Failed to fetch audit ${auditId}`);
  return await res.json();
}

export async function fetchAssistantExplanation({ audit_id, language, audit_result }) {
  const res = await fetch(`${API_BASE}/api/assistant/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audit_id,
      language: language || 'en',
      audit_result,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to fetch multilingual explanation");
  }

  return await res.json();
}

export function getReportDownloadUrl(auditId) {
  return `${API_BASE}/api/reports/${auditId}`;
}

export async function fetchSchemes() {
  const res = await fetch(`${API_BASE}/api/schemes`);
  if (!res.ok) throw new Error("Failed to load schemes");
  return await res.json();
}

export async function updateScheme(schemeId, payload) {
  const res = await fetch(`${API_BASE}/api/schemes/${schemeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to update scheme");
  }
  return await res.json();
}

export async function submitFindingReview(auditId, findingId, isReviewed, reviewerNotes) {
  const res = await fetch(`${API_BASE}/api/audit/${auditId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      finding_id: findingId,
      is_reviewed: isReviewed,
      reviewer_notes: reviewerNotes,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to submit finding review");
  }
  return await res.json();
}

export async function verifyReportDossier(auditId) {
  const res = await fetch(`${API_BASE}/api/reports/verify/${auditId}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to verify report");
  }
  return await res.json();
}

export async function fetchAdminAnalytics() {
  const res = await fetch(`${API_BASE}/api/admin/analytics`);
  if (!res.ok) throw new Error("Failed to load admin analytics");
  return await res.json();
}

