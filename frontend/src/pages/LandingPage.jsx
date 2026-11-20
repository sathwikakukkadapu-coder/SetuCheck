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
  ScanLine,
  Eye,
  Check,
  Cpu,
  Clock,
  HelpCircle,
  ChevronRight,
  Database,
  Fingerprint
} from 'lucide-react';
import HeroIllustration from '../components/HeroIllustration';

export default function LandingPage({ onStartAudit, onLoadDemo, onOpenChat }) {
  const [selectedDemoTab, setSelectedDemoTab] = useState('case-2-name-mismatch');

  const demoCases = [
    {
      id: 'case-1-perfect-match',
      title: 'Case 1: 100% Concordance',
      subtitle: 'Sunita Sharma • All fields perfectly match',
      score: 100,
      badge: 'Green • Ready',
      desc: 'Flawless alignment between Aadhaar, SBI Passbook, and Domicile Certificate.'
    },
    {
      id: 'case-2-name-mismatch',
      title: 'Case 2: Name Initial Variation',
      subtitle: 'Ramesh Kumar vs Ramesh K.',
      score: 84,
      badge: 'Yellow • Review Required',
      desc: 'Detects abbreviated surname in bank passbook. Suggests standard gazette affidavit.'
    },
    {
      id: 'case-3-invalid-ifsc',
      title: 'Case 3: Malformed IFSC Code',
      subtitle: 'K. Lakshmi • Invalid 5th Char in IFSC',
      score: 63,
      badge: 'Red • Action Required',
      desc: 'Catches RBI compliance violation: 5th character must be zero (SBIN0001234, not SBINO...).'
    },
    {
      id: 'case-4-missing-passbook',
      title: 'Case 4: Incomplete Dossier',
      subtitle: 'Mohammed Irfan • Missing Bank Proof',
      score: 48,
      badge: 'Red • Rejection Risk',
      desc: 'Identifies absence of mandatory DBT bank passbook before government submission.'
    },
    {
      id: 'case-5-multiple-mismatches',
      title: 'Case 5: Multi-Discrepancy Audit',
      subtitle: 'Ananya Rao • Name & PIN Discordance',
      score: 50,
      badge: 'Purple • Complex Review',
      desc: 'Compound audit with phonetic transliteration difference and postal PIN code discrepancy.'
    }
  ];

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#172B4D] flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10243A] via-[#10243A] to-[#172B4D] text-white pt-16 pb-24 border-b border-slate-800">
        {/* Subtle Ambient Glow and Grid */}
        <div className="absolute inset-0 bg-dot-pattern-dark opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0D9488]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Calls to Action */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#2DD4BF] shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                <span className="tracking-wide">GovTech Track 1 &bull; Civic Pulse & Public Information</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Your Documents. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#60A5FA]">
                  Verified Before You Apply.
                </span>
              </h1>

              {/* Exact Requested Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Identify document inconsistencies, understand missing information and prepare your welfare application with confidence.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onStartAudit}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-[#0D9488]/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <FileCheck2 className="w-5 h-5 text-[#2DD4BF]" />
                  <span>Start Document Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleScrollToSection('how-it-works')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold px-6 py-4 rounded-xl transition active:scale-95"
                >
                  <span>Explore How It Works</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Trust Indicators Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-300 font-medium">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Explainable RapidFuzz Rules</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Telugu, Hindi & English Voice</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Tamper-Proof SHA-256 Dossier</span>
                </div>
              </div>

            </div>

            {/* Right Column: Visually Impressive Hero Illustration */}
            <div className="lg:col-span-5 relative flex justify-center">
              <HeroIllustration onLoadDemo={onLoadDemo} />
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 hover:border-[#0D9488]/40 transition civic-card-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center mb-3">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-1">Explainable Document Checks</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every score deduction is anchored in deterministic rules (RBI IFSC format, Levenshtein concordance), never hallucinated.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 hover:border-[#2563EB]/40 transition civic-card-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-3">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-1">Multilingual Accessibility</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Full vernacular guidance in Telugu, Hindi, and English with real-time text-to-speech voice playback for rural applicants.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 hover:border-[#16A34A]/40 transition civic-card-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-1">Privacy-Conscious Processing</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Automatic client-side PII masking. Uploaded documents are audited in memory with ephemeral cleanup routines.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 hover:border-amber-500/40 transition civic-card-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-1">Pre-Submission Assistance</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Helps citizens and CSC operators resolve fatal errors before standing in long queues at MeeSeva or government offices.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (FOUR-STEP PROCESS) */}
      <section id="how-it-works" className="py-20 bg-[#F5F8FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-[#0D9488]/10 px-3 py-1 rounded-full">
              Transparent Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight">
              How SetuCheck Verifies Your Application
            </h2>
            <p className="text-sm text-[#64748B]">
              A 4-step explainable pipeline that leaves no room for confusion or arbitrary rejection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative group hover:border-[#0D9488] transition civic-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-slate-200 group-hover:text-[#0D9488] transition">01</span>
                <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center font-bold">
                  <FileSearch className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#10243A] mb-2">Upload Documents</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Upload your identity proof (Aadhaar/Voter ID), bank passbook folio, and address proofs in PDF, JPG, or PNG.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative group hover:border-[#2563EB] transition civic-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-slate-200 group-hover:text-[#2563EB] transition">02</span>
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold">
                  <ScanLine className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#10243A] mb-2">Extract Information</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Tesseract OCR and PyMuPDF extract structured fields with individual confidence ratings and allow manual correction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative group hover:border-amber-500 transition civic-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-slate-200 group-hover:text-amber-500 transition">03</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <GitCompare className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#10243A] mb-2">Identify Discrepancies</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Cross-document concordancer flags spelling differences, initial abbreviations, and invalid bank IFSC codes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative group hover:border-[#16A34A] transition civic-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-slate-200 group-hover:text-[#16A34A] transition">04</span>
                <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#10243A] mb-2">Review Audit Report</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Inspect your Readiness Score (/100), simulate "what-if" fixes, and download a signed SHA-256 PDF audit certificate.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. JUDGES' EVALUATION SUITE: 5 TEST SCENARIOS */}
      <section className="py-16 bg-[#10243A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>One-Click Synthetic Demonstration Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Live Pre-Configured Test Cases for Judges
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Test deterministic validation immediately without manual uploads. Click any scenario to run real cross-document verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {demoCases.map((c) => (
              <div 
                key={c.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-[#0D9488] rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      SCORE: <strong className="text-white text-xs">{c.score}</strong>/100
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.badge.split('•')[0]}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-xs text-white group-hover:text-[#2DD4BF] transition mb-1">
                    {c.title}
                  </h3>
                  <div className="text-[11px] font-medium text-slate-300 mb-2">
                    {c.subtitle}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    {c.desc}
                  </p>
                </div>

                <button
                  onClick={() => onLoadDemo(c.id)}
                  className="w-full inline-flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-[#0D9488] text-white font-bold text-xs py-2 rounded-xl transition"
                >
                  <Play className="w-3.5 h-3.5 text-[#2DD4BF] group-hover:text-white" />
                  <span>Run Audit</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. PRIVACY & SECURITY ARCHITECTURE */}
      <section id="privacy" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full">
              Privacy By Design
            </span>
            <h2 className="text-3xl font-extrabold text-[#10243A] tracking-tight">
              Institutional Privacy & Data Governance Standards
            </h2>
            <p className="text-xs text-[#64748B]">
              SetuCheck acts strictly as a pre-submission readiness assistant and respects citizen confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F5F8FC] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#2DD4BF] flex items-center justify-center mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-2">Automatic PII Masking</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Aadhaar numbers and core banking account digits are automatically masked across all user interfaces, logs, and generated PDF reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F8FC] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#38BDF8] flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-2">Ephemeral Memory Buffer</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Uploaded document files are processed in ephemeral memory and purged using automated cleanup routines to prevent data persistence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F8FC] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#2DD4BF] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#10243A] mb-2">Statutory Decision Support</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Clear statutory disclaimers inform applicants that SetuCheck provides audit advice and does not substitute authorized government approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-16 bg-[#F5F8FC] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-black text-[#10243A] tracking-tight">
            Ready to Verify Your Welfare Documents?
          </h2>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Avoid application delays and welfare pension rejections. Run an instant pre-submission check in less than 30 seconds.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartAudit}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white font-extrabold px-9 py-4 rounded-xl shadow-xl shadow-[#0D9488]/25 transition-all transform hover:-translate-y-0.5"
            >
              <FileCheck2 className="w-5 h-5" />
              <span>Launch Auditor Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
