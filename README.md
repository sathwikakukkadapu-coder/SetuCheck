# SetuCheck: Explainable Pre-Submission Welfare Document Auditor

> **Track 1 — Civic Pulse, Digital Governance & Public Information**  
> *A hackathon-ready, production-grade decision-support platform designed to protect citizen welfare entitlements by identifying and rectifying document discrepancies before official submission.*

---

## 1. Problem Statement

Every month, thousands of vulnerable citizens applying for direct-benefit government welfare schemes—such as the **National Old Age Pension Scheme (NOAPS)**, **PM-KISAN Samman Nidhi**, and the **National Food Security Act (NFSA Ration Card)**—face prolonged application delays or rejections.

Common pitfalls include:
- **Spelling Inconsistencies**: *"Ramesh Kumar"* on an Aadhaar identity card versus *"Ramesh Kumer"* on a bank passbook.
- **Invalid IFSC Code**: Typographical errors (e.g. entering the letter `'O'` instead of numeral zero `'0'` in the 5th position required by the Reserve Bank of India).
- **Truncated Bank Records**: Incomplete or missing account numbers on scanned passbook folios.
- **Address & Jurisdiction Mismatches**: Variations between postal PIN codes and local administrative revenue wards.
- **Missing Mandatory Enclosures**: Omitting specific required proofs for selected schemes.

Existing government information portals outline eligibility criteria, but do not provide applicants or rural kiosk operators (e.g. Common Service Centers) with an automated tool to audit supporting documents prior to submission. 

**SetuCheck** bridges this gap as an explainable, pre-submission decision-support auditor that extracts, cross-checks, scores document readiness, explains discrepancies in regional languages (Telugu, Hindi, English), and generates downloadable compliance dossiers.

> **Statutory Disclaimer**: SetuCheck is an explainable decision-support tool for pre-submission readiness. It never claims to guarantee government application acceptance or definitively predict official rejection. Final approvals remain subject to statutory verification by competent government authorities.

---

## 2. Core Modules Architecture

SetuCheck is architected into four decoupled, deterministic modules:

```
                    ┌────────────────────────────────────────────────────────┐
                    │               SetuCheck Modern UI (React)              │
                    │   Vite + Tailwind CSS + Lucide Icons + Recharts        │
                    └───────────┬────────────────────────────────┬───────────┘
                                │                                │
                      REST APIs │                      REST APIs │
                                ▼                                ▼
┌───────────────────────────────────────────────┐  ┌───────────────────────────────────────────────┐
│       MODULE 1: DOCUMENT UPLOAD & OCR         │  │    MODULE 2: SMART COMPARISON ENGINE          │
│ • PyMuPDF text stream extraction              │  │ • Deterministic Python rule suite             │
│ • OpenCV bilateral denoising & thresholding   │  │ • RapidFuzz Levenshtein & token sort match    │
│ • Safe UUID & magic byte validation           │  │ • RBI 11-char IFSC format verification        │
│ • Non-hallucinatory structured JSON parsing   │  │ • Address abbreviation normalizer (PIN match) │
└───────────────────────┬───────────────────────┘  └─────────────────────┬─────────────────────────┘
                        │                                                │
                        └───────────────────────┬────────────────────────┘
                                                │
                                                ▼
┌───────────────────────────────────────────────┐  ┌───────────────────────────────────────────────┐
│     MODULE 3: EXPLAINABLE RISK AUDITOR        │  │   MODULE 4: MULTILINGUAL ASSISTANT & REPORTS  │
│ • Transparent 0-100 Readiness Score           │  │ • English, Telugu (తెలుగు), Hindi (हिन्दी)   │
│ • Configurable, documented rule deductions    │  │ • Identifiers masked (Aadhaar, Account No)    │
│ • 4 Severity tiers (HIGH, REVIEW, INFO, PASS) │  │ • Web Speech API read-aloud support           │
│ • Cross-document concordance matrix           │  │ • Downloadable ReportLab PDF dossier          │
└───────────────────────────────────────────────┘  └───────────────────────────────────────────────┘
```

### Module 1: Document Upload & Structured OCR
- Accepts PDF, JPG, JPEG, and PNG files up to 15 MB.
- Direct digital PDF text extraction via **PyMuPDF** (`fitz`).
- Computer vision preprocessing with **OpenCV** (grayscale, Gaussian noise reduction, Otsu adaptive thresholding) for scanned images.
- Structured field extraction: Applicant Name, Date of Birth, Bank Account Number, IFSC Code, Bank Branch Name, and Residential Address.
- **Zero Hallucination Guarantee**: If an OCR field cannot be extracted with high confidence, it is marked as `missing` or `manual_verification_required`, never fabricated.

### Module 2: Smart Document Comparison Engine
- **Name Matching**:
  - Exact character match.
  - Case-insensitive, title-stripped (Shri, Smt, Kumari) and punctuation-normalized match.
  - Token-order inversion detection (e.g. *"Kumar Ramesh"* vs *"Ramesh Kumar"*).
  - Fuzzy string similarity using **RapidFuzz** (`ratio`, `token_sort_ratio`) identifying spelling variances (e.g. *"Ramesh Kumar"* vs *"Ramesh Kumer"*).
- **Bank Validation**:
  - Strict **RBI IFSC format rule**: `^[A-Z]{4}0[A-Z0-9]{6}$` (validates length 11, 5th character must be `'0'`).
  - Account number format, length (9–18 digits), non-numeric detection, and dummy repetitive sequence rejection (`0000000000`).
  - Does *not* claim to verify live account balance or Aadhaar link status without authorized NPCI banking switches.
- **Address Validation**:
  - Normalizes common Indian abbreviations (`rd` -> road, `vill` -> village, `dist` -> district, `h.no` -> house number, `ap` -> andhra pradesh).
  - PIN code cross-verification (detects cross-district mismatches).
  - Distinguishes minor cosmetic formatting differences from substantive territorial mismatches.
- **Scheme-Specific Completeness**:
  - Configurable checks for NOAPS Pension, PM-KISAN, and NFSA Ration Card.

### Module 3: Explainable Rejection-Risk Auditor
- Transparent **Readiness Score (0–100)** calculated using documented rule deductions:
  - Critical Discrepancy (e.g. invalid IFSC, major name mismatch): `-25`
  - Review Required (e.g. minor spelling difference, token inversion): `-12`
  - Informational (e.g. cosmetic formatting variance): `-0` (no penalty)
- Findings classification:
  - `HIGH PRIORITY`: Critical rule failure requiring action before submission.
  - `REVIEW REQUIRED`: Human verification recommended.
  - `INFORMATIONAL`: Cosmetic or minor formatting observation.
  - `PASSED`: Fully concordant across documents.
- Side-by-side Visual Comparison Matrix displaying exact values across documents.

### Module 4: Multilingual Correction Assistant & Reports
- Full native support for **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
- Step-by-step citizen rectification instructions (e.g. visiting a bank branch with original Aadhaar to update passbook spelling).
- Interactive pre-submission preparation checklist.
- Browser-based **Web Speech Synthesis** for reading instructions aloud to semi-literate citizens.
- Downloadable official **PDF Audit Report** generated dynamically via **ReportLab**.

---

## 3. Synthetic Demonstration Cases (Judges' Evaluation Suite)

Five synthetic test applicant cases are embedded into the application for instant evaluation:

| Case ID | Title | Scenario & Discrepancies | Expected Score & Outcome |
| :--- | :--- | :--- | :--- |
| **Case 1** | *Perfect Concordance* | Identity, Bank Passbook, and Address Proof match identically. Valid IFSC (`SBIN0001234`). | **100/100 (PASSED)**<br/>Clean dossier. 0 critical issues. |
| **Case 2** | *Name Variation* | Identity: *"Ramesh Kumar"* vs Bank Passbook: *"Ramesh Kumer"*. | **~76/100 (REVIEW REQUIRED)**<br/>Fuzzy spelling discrepancy (92% concordance) detected. |
| **Case 3** | *Invalid IFSC Code* | Bank Passbook has malformed IFSC (`SBINO0123`: 9 chars, letter 'O' as 5th char). | **~75/100 (HIGH PRIORITY)**<br/>Violates RBI 11-char IFSC standard. |
| **Case 4** | *Missing Information* | Truncated 5-digit bank account number (`12345`) and missing Address Proof. | **~50/100 (HIGH PRIORITY)**<br/>Incomplete banking record & missing mandatory enclosure. |
| **Case 5** | *Compound Issues* | Name mismatch (*"Murali Mohan Rao"* vs *"M M Rao"*), corrupted account (`000000000000`), malformed IFSC, and PIN mismatch. | **~25/100 (HIGH PRIORITY)**<br/>Multiple compound failures flagged. |

---

## 4. Privacy & Cybersecurity Architecture

- **Data Minimization**: Uploaded files are saved using randomized UUID filenames (`<uuid4>.pdf`). Path traversal is blocked.
- **Magic Bytes Validation**: File extensions and content headers are verified (`%PDF`, JPEG `\xFF\xD8\xFF`, PNG `\x89PNG`).
- **Identifier Masking**:
  - Bank Account Numbers: `•••• •••• 1234` (all but last 4 digits masked).
  - Identity Numbers (Aadhaar): `XXXX XXXX 1234`.
  - Addresses: House/door numbers redacted in public views.
- **Zero Hallucination & Safe AI**:
  - Deterministic Python rules govern all compliance and scoring decisions.
  - If Gemini API is enabled, all sensitive fields are pre-sanitized before transmission.
  - Fully functional offline via deterministic multilingual templates when external APIs are unavailable.
- **Zero Permanent Storage**: Temporary documents are isolated by session.

---

## 5. Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React icons, Recharts.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, PyMuPDF (fitz), OpenCV, Tesseract OCR, RapidFuzz, ReportLab.
- **Testing**: Pytest, HTTPX.

---

## 6. Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm 9+

### 1. Clone & Set Up Backend
```bash
# Clone the repository
git clone https://github.com/your-username/setucheck.git
cd setucheck

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Generate synthetic demonstration PDFs
python backend/generate_synthetic_files.py

# Run automated test suite
pytest backend/tests/ -v

# Start FastAPI server
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be live at `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).

### 2. Set Up Frontend
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend will be live at `http://127.0.0.1:5173`.

---

## 7. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and engine configuration status. |
| `/api/demo/cases` | `GET` | Retrieve the 5 synthetic demonstration cases. |
| `/api/documents/upload` | `POST` | Upload single or multiple documents with validation. |
| `/api/documents/extract` | `POST` | Extract structured fields via PyMuPDF/OCR. |
| `/api/audit/run` | `POST` | Execute deterministic comparison and readiness scoring. |
| `/api/audit/{audit_id}` | `GET` | Retrieve stored audit session findings. |
| `/api/assistant/explain` | `POST` | Generate multilingual guidance (English, Telugu, Hindi). |
| `/api/reports/{audit_id}`| `GET` | Download official print-ready PDF dossier. |

---

## 8. Automated Test Suite Results

The automated test suite verifies all critical parsing, validation, scoring, and security rules:

```
============================== test session starts ==============================
platform win32 -- Python 3.11.9, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Users\Sathwika\Downloads\Nxtwave

backend/tests/test_address_matcher.py::test_extract_pincode PASSED       [  2%]
backend/tests/test_address_matcher.py::test_normalize_address PASSED     [  5%]
backend/tests/test_address_matcher.py::test_pincode_mismatch PASSED      [  8%]
backend/tests/test_address_matcher.py::test_exact_address_match PASSED   [ 10%]
backend/tests/test_address_matcher.py::test_formatting_variance PASSED   [ 13%]
backend/tests/test_api.py::test_health_endpoint PASSED                   [ 16%]
backend/tests/test_api.py::test_demo_cases_list PASSED                   [ 18%]
backend/tests/test_api.py::test_demo_case_retrieval PASSED               [ 21%]
backend/tests/test_api.py::test_audit_execution_and_storage PASSED       [ 24%]
backend/tests/test_api.py::test_assistant_multilingual_telugu PASSED     [ 27%]
backend/tests/test_api.py::test_assistant_multilingual_hindi PASSED      [ 29%]
backend/tests/test_api.py::test_report_generation_endpoint PASSED        [ 32%]
backend/tests/test_bank_validator.py::test_valid_ifsc PASSED             [ 35%]
backend/tests/test_bank_validator.py::test_invalid_ifsc_length PASSED    [ 37%]
backend/tests/test_bank_validator.py::test_invalid_ifsc_fifth_character PASSED [ 40%]
backend/tests/test_bank_validator.py::test_missing_ifsc PASSED           [ 43%]
backend/tests/test_bank_validator.py::test_valid_bank_account PASSED     [ 45%]
backend/tests/test_bank_validator.py::test_short_bank_account PASSED     [ 48%]
backend/tests/test_bank_validator.py::test_dummy_bank_account PASSED     [ 51%]
backend/tests/test_bank_validator.py::test_non_numeric_bank_account PASSED [ 54%]
backend/tests/test_masking.py::test_mask_account_number PASSED           [ 56%]
backend/tests/test_masking.py::test_mask_identity_number PASSED          [ 59%]
backend/tests/test_masking.py::test_mask_address PASSED                  [ 62%]
backend/tests/test_masking.py::test_sanitize_for_ai PASSED               [ 64%]
backend/tests/test_name_matcher.py::test_normalize_name PASSED           [ 67%]
backend/tests/test_name_matcher.py::test_exact_name_match PASSED         [ 70%]
backend/tests/test_name_matcher.py::test_normalized_title_match PASSED   [ 72%]
backend/tests/test_name_matcher.py::test_token_inversion PASSED          [ 75%]
backend/tests/test_name_matcher.py::test_spelling_variation PASSED       [ 78%]
backend/tests/test_name_matcher.py::test_critical_mismatch PASSED        [ 81%]
backend/tests/test_pdf_extraction.py::test_extract_from_clean_aadhaar_pdf PASSED [ 83%]
backend/tests/test_pdf_extraction.py::test_extract_from_clean_passbook_pdf PASSED [ 86%]
backend/tests/test_report_generator.py::test_generate_pdf_report PASSED  [ 89%]
backend/tests/test_risk_engine.py::test_score_calculation PASSED         [ 91%]
backend/tests/test_risk_engine.py::test_case_1_perfect_audit PASSED      [ 94%]
backend/tests/test_risk_engine.py::test_case_2_name_mismatch PASSED      [ 97%]
backend/tests/test_risk_engine.py::test_case_3_invalid_ifsc PASSED       [100%]

======================== 37 passed in 1.84s ========================
```

---

## 9. Deployment Guide

### Deploying Frontend to Vercel
1. Set the root directory as `frontend`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable: `VITE_API_URL` pointing to your deployed backend URL.

### Deploying Backend to Render
1. Create a **New Web Service** connected to your repository.
2. Environment: `Python 3`.
3. Build Command: `pip install -r backend/requirements.txt`.
4. Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Optional Environment Variable: `GEMINI_API_KEY` (if natural-language LLM enrichment is desired).

---

## 10. License & Ethics

SetuCheck is created for **Track 1 — Civic Pulse, Digital Governance & Public Information**.  
Distributed under the MIT License. Designed strictly as an explainable public-service aid; all demonstration data is synthetic.
