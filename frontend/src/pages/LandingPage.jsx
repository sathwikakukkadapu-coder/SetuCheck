import React, { useState } from 'react';
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
  Play,
  Bot,
  Volume2,
  ExternalLink,
  Layers,
  Wand2,
  CheckCircle2,
  Shield,
  FileSearch,
  ScanLine
} from 'lucide-react';
import { AadhaarMockup, BankPassbookMockup, UtilityBillMockup } from '../components/DocumentVisualizer';

export default function LandingPage({ onStartAudit, onLoadDemo, onOpenChat }) {
  const [activeTabDoc, setActiveTabDoc] = useState('aadhaar');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 border-b border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-teal-400 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Track 1: Civic Pulse, Digital Governance & Public Information</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Explainable Pre-Submission <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400">
                  Welfare Document Auditor
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Protect citizen welfare pensions, ration benefits, and DBT transfers from avoidable rejections. SetuCheck cross-audits identity cards, bank passbooks, and address proofs to detect spelling variances, malformed IFSCs, and missing mandatory proofs before official submission.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onStartAudit}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black px-7 py-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <FileCheck2 className="w-5 h-5" />
                  <span>Launch Auditor Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onLoadDemo("case-2-name-mismatch")}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-6 py-4 rounded-xl transition"
                >
                  <Play className="w-4 h-4 text-teal-400" />
                  <span>Test Demo: 'Ramesh Kumar'</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Deterministic RapidFuzz Rules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Telugu, Hindi & English Voice</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>SHA-256 Signed Dossier</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Document Audit Visualizer */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-5 shadow-2xl space-y-4">
                {/* Visualizer Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-teal-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Live OCR Cross-Audit Studio</span>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-full">
                    Concordance: 92%
                  </span>
                </div>

                {/* Document Tab Switcher */}
                <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700 text-[11px] font-semibold">
                  <button
                    onClick={() => setActiveTabDoc('aadhaar')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeTabDoc === 'aadhaar' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    1. Aadhaar ID
                  </button>
                  <button
                    onClick={() => setActiveTabDoc('passbook')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeTabDoc === 'passbook' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    2. Bank Passbook
                  </button>
                  <button
                    onClick={() => setActiveTabDoc('utility')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeTabDoc === 'utility' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    3. Address Proof
                  </button>
                </div>

                {/* Rendered Mockup */}
                <div className="flex justify-center py-1">
                  {activeTabDoc === 'aadhaar' && <AadhaarMockup name="Ramesh Kumar" isHighlighted={true} />}
                  {activeTabDoc === 'passbook' && <BankPassbookMockup holderName="Ramesh Kumer" mismatchHighlight={true} />}
                  {activeTabDoc === 'utility' && <UtilityBillMockup consumerName="Ramesh Kumar" />}
                </div>

                {/* Discrepancy Callout Chip */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span><strong>Spelling Variation:</strong> 'Kumar' vs 'Kumer'</span>
                  </div>
                  <button
                    onClick={() => onLoadDemo("case-2-name-mismatch")}
                    className="text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-1 rounded transition shrink-0"
                  >
                    Audit Case 2 &rarr;
                  </button>
                </div>

                {/* Ask SetuMitra Action */}
                <button
                  onClick={onOpenChat}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-teal-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Bot className="w-4 h-4 text-teal-400" />
                  <span>Ask SetuMitra AI about this mismatch</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5 One-Click Judge Demo Scenarios Showcase */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Judges & Evaluators Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Test 5 Real-World Demonstration Scenarios
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Click any scenario below to immediately inspect the live deterministic verification engine, readiness score gauge, and multilingual recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Case 1 */}
            <div 
              onClick={() => onLoadDemo("case-1-perfect-match")}
              className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Case 1</span>
                  <span className="text-xs font-extrabold text-emerald-600">100/100</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Clean / Full Concordance</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Identical names, valid 11-char IFSC, matching address PIN. Zero discrepancies detected.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span>Submission Ready</span>
                <span>Launch &rarr;</span>
              </div>
            </div>

            {/* Case 2 */}
            <div 
              onClick={() => onLoadDemo("case-2-name-mismatch")}
              className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Case 2</span>
                  <span className="text-xs font-extrabold text-amber-600">84/100</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Spelling Discrepancy</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  'Ramesh Kumar' vs 'Ramesh Kumer'. 92% Levenshtein similarity flagged for verification.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span>Review Required</span>
                <span>Launch &rarr;</span>
              </div>
            </div>

            {/* Case 3 */}
            <div 
              onClick={() => onLoadDemo("case-3-invalid-ifsc")}
              className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">Case 3</span>
                  <span className="text-xs font-extrabold text-rose-600">63/100</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Invalid Bank IFSC</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  9-character truncated code (`SBINO0123`). Violates mandatory RBI core banking standard.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px] font-bold text-rose-700">
                <span>Format Error</span>
                <span>Launch &rarr;</span>
              </div>
            </div>

            {/* Case 4 */}
            <div 
              onClick={() => onLoadDemo("case-4-missing-passbook")}
              className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">Case 4</span>
                  <span className="text-xs font-extrabold text-rose-600">48/100</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Missing Proof & Short A/C</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Missing mandatory Address Proof and truncated 5-digit account number. Penalizes completeness.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px] font-bold text-rose-700">
                <span>High Rejection Risk</span>
                <span>Launch &rarr;</span>
              </div>
            </div>

            {/* Case 5 */}
            <div 
              onClick={() => onLoadDemo("case-5-multiple-mismatches")}
              className="p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded">Case 5</span>
                  <span className="text-xs font-extrabold text-purple-600">50/100</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Compound Conflicts</h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Name initial abbreviation + repetitive dummy account + differing PIN jurisdictions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-[11px] font-bold text-purple-700">
                <span>Multiple Errors</span>
                <span>Launch &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Architectural Modules */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Architectural Blueprint</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Core Production Modules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 1</span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Document OCR & Text Extraction</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                PyMuPDF stream extraction for digital PDFs, and OpenCV deskewing + Tesseract fallback for scanned images. Extracts names, DOB, address, and account numbers deterministically.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 2</span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Deterministic Comparison Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                RapidFuzz Levenshtein scoring, Indian phonetic transliteration rules (Laxmi/Lakshmi, Kumar/Kumer), initial expansion checking, and RBI 11-char IFSC validation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 3</span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Explainable Risk & Score Rubric</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent 4-category 0–100 score: Completeness (30), Consistency (30), Validation (20), Quality (20). Includes an interactive What-If Fix Simulator!
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block mb-1">Module 4</span>
              <h4 className="font-bold text-slate-900 text-base mb-2">SetuMitra Voice & PDF Dossier</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Two-way voice assistant in Telugu, Hindi, and English with Web Speech API audio synthesis, masked identifiers, and official signed PDF report generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SetuMitra AI Interactive Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-850 p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Bot className="w-5 h-5 text-teal-400" />
                <span>Meet SetuMitra (సేతుమిత్ర) &bull; Your Civic AI Co-Pilot</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ask Questions in English, Telugu or Hindi
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Citizens don't need to understand complex government jargon. SetuMitra explains why your IFSC was flagged, how to update passbook spelling at your local bank branch, and which utility bills are acceptable.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={onOpenChat}
                  className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg"
                >
                  "Why is my IFSC flagged?"
                </button>
                <button
                  onClick={onOpenChat}
                  className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg"
                >
                  "పాస్‌బుక్‌లో పేరు ఎలా మార్చుకోవాలి?"
                </button>
                <button
                  onClick={onOpenChat}
                  className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg"
                >
                  "निवास प्रमाण के नियम क्या हैं?"
                </button>
              </div>
            </div>

            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black px-7 py-4 rounded-xl shadow-xl transition shrink-0 transform hover:scale-105 active:scale-95"
            >
              <Bot className="w-5 h-5" />
              <span>Chat with SetuMitra AI</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
