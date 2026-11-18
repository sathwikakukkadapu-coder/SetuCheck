import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Storage folders
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

REPORTS_DIR = BASE_DIR / "reports_generated"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

SYNTHETIC_DIR = BASE_DIR / "synthetic_docs"
SYNTHETIC_DIR.mkdir(parents=True, exist_ok=True)

# Security and limits
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png"
}

# API settings
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]

# AI / External services
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ENABLE_GEMINI = bool(GEMINI_API_KEY)

# Demonstration Schemes
SUPPORTED_SCHEMES = {
    "pension": {
        "name": "National Old Age Pension Scheme (NOAPS)",
        "required_documents": ["identity", "bank_passbook", "address_proof"],
        "required_fields": ["name", "dob", "bank_account_no", "ifsc_code", "address"]
    },
    "pm_kisan": {
        "name": "PM-KISAN Samman Nidhi",
        "required_documents": ["identity", "bank_passbook"],
        "required_fields": ["name", "bank_account_no", "ifsc_code"]
    },
    "ration_card": {
        "name": "Public Distribution System (NFSA Ration Card)",
        "required_documents": ["identity", "address_proof"],
        "required_fields": ["name", "address"]
    }
}
DEFAULT_SCHEME = "pension"
