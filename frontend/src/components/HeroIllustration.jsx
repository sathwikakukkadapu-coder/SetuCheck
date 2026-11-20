import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  GitCompare, 
  Sparkles, 
  Building2, 
  User, 
  CreditCard,
  Check
} from 'lucide-react';

export default function HeroIllustration({ onLoadDemo }) {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Background glow effects */}
      <div className="absolute -top-6 -left-6 w-48 h-48 bg-[#0D9488]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphic Container */}
      <div className="relative bg-[#10243A]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold pl-2">
              SETU-AUDIT-PREVIEW // LIVE ENGINE
            </span>
          </div>

          <div className="inline-flex items-center space-x-1 text-[10px] bg-[#0D9488]/20 text-[#2DD4BF] border border-[#0D9488]/40 px-2 py-0.5 rounded-full font-bold">
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Deterministic AI</span>
          </div>
        </div>

        {/* Floating Mini Score Badge */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" stroke="#1E293B" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="19" 
                  stroke="#2DD4BF" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="119.38" 
                  strokeDashoffset="19.1" 
                  strokeLinecap="round" 
                />
              </svg>
              <span className="absolute font-black text-sm text-white">84</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Readiness Score</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  PASSABLE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">1 Review Requirement &bull; 0 Critical Errors</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Target Scheme</span>
            <span className="text-xs font-extrabold text-[#2DD4BF]">NOAPS Pension</span>
          </div>
        </div>

        {/* Document Cards Comparison Stack */}
        <div className="space-y-3 relative">
          
          {/* Card 1: Indian Aadhaar Identity Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-md relative overflow-hidden group hover:border-[#0D9488]/50 transition">
            {/* Indian Flag Tricolor Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="w-1/3 bg-[#FF9933]"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-[#138808]"></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 pt-1 font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3 h-3 text-[#2DD4BF]" />
                <span>Identity Proof (Aadhaar Format)</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> OCR 98.4%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-white tracking-wide">
                  RAMESH KUMAR
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  DOB: 12/04/1982 &bull; UID: •••• •••• 8912
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Verified Format
                </span>
              </div>
            </div>
          </div>

          {/* Animated Connecting Discrepancy Ray */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-[#2DD4BF]/50 to-transparent"></div>
            <div className="relative z-10 inline-flex items-center space-x-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-md">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Initial Variance Detected (88% RapidFuzz Concordance)</span>
            </div>
          </div>

          {/* Card 2: Bank Passbook */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-md relative group hover:border-[#2563EB]/50 transition">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <Building2 className="w-3 h-3 text-sky-400" />
                <span>Bank Passbook (State Bank of India)</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> OCR 96.1%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>RAMESH K.</span>
                  <span className="text-[9px] bg-amber-950 text-amber-400 px-1 rounded border border-amber-800 font-normal">
                    Initial Abbreviated
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  A/C: •••• 3049 &bull; IFSC: SBIN0001234
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  RBI Validated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checkmark Pills */}
        <div className="pt-1 grid grid-cols-3 gap-2 text-[10px] text-slate-300">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center flex flex-col items-center">
            <Check className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
            <span className="font-semibold text-white">IFSC Active</span>
            <span className="text-[9px] text-slate-400">NPCI Concordant</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center flex flex-col items-center">
            <Check className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
            <span className="font-semibold text-white">DOB Match</span>
            <span className="text-[9px] text-slate-400">Age Verified (44y)</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center flex flex-col items-center">
            <Check className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span className="font-semibold text-white">Name Variant</span>
            <span className="text-[9px] text-amber-300">Affidavit Suggested</span>
          </div>
        </div>

      </div>
    </div>
  );
}
