import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  FileCheck2, 
  GitCompare, 
  AlertTriangle, 
  Languages, 
  Download, 
  Sparkles, 
  Lock,
  Building,
  CheckCircle,
  Play
} from 'lucide-react';

export default function LandingPage({ onStartAudit, onLoadDemo }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-20 pb-24 border-b border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-400 mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Track 1: Civic Pulse, Digital Governance & Public Information</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Explainable Pre-Submission <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400">
              Welfare Document Auditor
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Protect citizen welfare benefits from avoidable rejections. SetuCheck cross-audits identity cards, bank passbooks, and address proofs to catch spelling mismatches, malformed IFSCs, and missing fields before portal submission.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAudit}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <FileCheck2 className="w-5 h-5" />
              <span>Launch Auditor Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLoadDemo("case-2-name-mismatch")}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl transition"
            >
              <Play className="w-4 h-4 text-teal-400" />
              <span>Test Demo: 'Ramesh Kumar' Mismatch</span>
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Deterministic Validation Rules</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Telugu, Hindi & English Guidance</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Sensitive Identifiers Masked</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Downloadable Audit PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Civic Problem & SetuCheck Solution */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">The Civic Problem</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why do legitimate welfare applications get stalled?
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Every month, thousands of vulnerable citizens applying for pensions (NOAPS), PM-KISAN, or ration benefits face severe application delays or rejections due to minor discrepancies between supporting documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Name Spelling Inconsistencies</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Ramesh Kumar" in Aadhaar versus "Ramesh Kumer" in the bank passbook triggers automated DBT payment failure or rejection at the local verification tier.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Invalid IFSC & Branch Codes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bank mergers or typographical OCR mistakes (such as typing 'O' instead of RBI standard zero '0') result in bank rejection without plain-language explanations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Language & Guidance Barrier</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizens are often not told in their mother tongue (Telugu, Hindi) exactly what needs fixing, resulting in repeated visits to administrative offices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Modules */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Architectural Blueprint</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Comprehensive Modules Built for Public Scale
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 1</span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Document Upload & OCR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supports PDF, JPG, PNG with PyMuPDF text stream extraction and OpenCV image preprocessing. Extracts structured fields without hallucinations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 2</span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Smart Comparison Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic validation rules using RapidFuzz Levenshtein similarity, RBI 11-char IFSC format verification, and address abbreviation normalization.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 3</span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Explainable Risk Auditor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent 0–100 readiness score based on documented weights. Side-by-side visual matrix and priority classification (High, Review, Info, Passed).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 4</span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Multilingual Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Culturally accessible explanations and step-by-step checklists in Telugu, Hindi, and English with masked inputs and downloadable ReportLab PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Judges One-Click Demo Suite Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-800 to-slate-850 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs text-teal-400 font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Hackathon Evaluation Suite</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Test 5 Synthetic Judge Cases with One Click
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Evaluate perfect match, spelling mismatch, invalid IFSC, missing records, and multiple compound discrepancy scenarios instantly.
              </p>
            </div>

            <button
              onClick={onStartAudit}
              className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shrink-0"
            >
              <span>Explore Demo Cases</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
