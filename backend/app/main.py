from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, ENABLE_GEMINI
from app.api.upload import router as upload_router
from app.api.extraction import router as extraction_router
from app.api.audit import router as audit_router
from app.api.assistant import router as assistant_router
from app.api.reports import router as reports_router
from app.api.demo import router as demo_router

app = FastAPI(
    title="SetuCheck API",
    description="Explainable Pre-Submission Welfare Document Auditor (Track 1 — Civic Pulse & Digital Governance)",
    version="1.0.0"
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(upload_router, prefix="/api")
app.include_router(extraction_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(demo_router, prefix="/api")

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "SetuCheck Backend Engine",
        "version": "1.0.0",
        "gemini_ai_enabled": ENABLE_GEMINI,
        "mode": "deterministic_audit_with_multilingual_assistant"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to SetuCheck: Explainable Pre-Submission Welfare Document Auditor",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
