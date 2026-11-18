import React from 'react';
import { Shield, Lock, Info, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>SETUCHECK &bull; Track 1 Hackathon Submission</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Civic Pulse, Digital Governance & Public Information. Enabling citizens to identify and rectify document discrepancies prior to government welfare submission.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-semibold text-xs mb-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Privacy & Security Assurances</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                <span>Deterministic rules &bull; No fabrication by AI</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                <span>Masked identifiers &bull; Account & Aadhaar sanitized</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                <span>Temporary session processing &bull; Zero permanent retention</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Statutory Decision-Support Notice</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              SetuCheck is an internal readiness assessment tool. It does not replace official UIDAI authentication, bank API switches, or official statutory approval by government authorities.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 SetuCheck Civic Tech Architecture. Synthetic Data Demonstration Suite.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-teal-400 font-mono">v1.0.0-PROD</span>
            <span>FastAPI + PyMuPDF + React + RapidFuzz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
