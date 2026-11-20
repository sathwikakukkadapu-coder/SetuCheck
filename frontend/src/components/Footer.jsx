import React from 'react';
import { Shield, Lock, Info, CheckCircle2, Heart } from 'lucide-react';
import SetuCheckLogo from './SetuCheckLogo';

export default function Footer() {
  return (
    <footer className="bg-[#10243A] border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          <div>
            <div className="mb-3">
              <SetuCheckLogo size={32} showText={true} subtitle={false} textLight={true} />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Explainable Pre-Submission Welfare Document Auditor &bull; Track 1: Civic Pulse, Digital Governance & Public Information. Enabling citizens and CSC operators to prevent avoidable welfare rejections.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-xs mb-3">
              <Lock className="w-4 h-4 text-[#2DD4BF]" />
              <span>Privacy & Security Assurances</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>Deterministic rules &bull; No LLM hallucination of facts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>Automatic PII masking &bull; Aadhaar and account digits masked</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>Ephemeral in-memory processing &bull; Zero permanent retention</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-3">
              <Info className="w-4 h-4" />
              <span>Statutory Decision-Support Notice</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SetuCheck is an internal pre-submission readiness tool. It does not replace official UIDAI authentication, bank API switches, or official statutory approval by government welfare authorities.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 SetuCheck Civic Tech Architecture &bull; Synthetic Data Demonstration Suite.</p>
          <div className="flex items-center space-x-4">
            <span className="text-[#2DD4BF] font-mono">v1.0.0-PROD</span>
            <span>FastAPI &bull; PyMuPDF &bull; React &bull; RapidFuzz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
