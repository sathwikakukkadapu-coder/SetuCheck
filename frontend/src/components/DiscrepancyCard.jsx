import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  Wand2, 
  RefreshCw, 
  Check,
  FileText,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function DiscrepancyCard({ 
  finding, 
  onInspect, 
  onSimulateFix, 
  isSimulatedFixed = false 
}) {
  const [showSimulateInput, setShowSimulateInput] = useState(false);
  const [candidateFix, setCandidateFix] = useState(() => {
    // Smart prefill suggestion based on finding
    if (finding.field_name?.toLowerCase().includes('name') && finding.doc_a_value) {
      return finding.doc_a_value;
    }
    if (finding.field_name?.toLowerCase().includes('ifsc')) {
      return "SBIN0001234";
    }
    if (finding.field_name?.toLowerCase().includes('account')) {
      return "30491827364";
    }
    if (finding.doc_a_value) {
      return finding.doc_a_value;
    }
    return "";
  });

  const isHigh = !isSimulatedFixed && (finding.severity === 'HIGH' || finding.status_color === 'RED');
  const isReview = !isSimulatedFixed && (finding.severity === 'REVIEW_REQUIRED' || finding.status_color === 'YELLOW');
  const isInfo = !isSimulatedFixed && (finding.severity === 'INFORMATIONAL' || finding.status_color === 'GRAY');
  const isPassed = isSimulatedFixed || finding.severity === 'PASSED' || finding.status_color === 'GREEN';

  let borderClass = "border-slate-200 bg-white";
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
  let badgeLabel = finding.status_color || "PASSED";
  let Icon = CheckCircle2;
  let iconColor = "text-[#16A34A]";

  if (isSimulatedFixed) {
    borderClass = "border-[#0D9488]/40 bg-[#0D9488]/5 ring-1 ring-[#0D9488]";
    badgeClass = "bg-teal-100 text-[#0D9488] border-teal-300";
    badgeLabel = "SIMULATED RESOLVED";
    Icon = CheckCircle2;
    iconColor = "text-[#0D9488]";
  } else if (isHigh) {
    borderClass = "border-rose-200 bg-rose-50/20";
    badgeClass = "bg-rose-100 text-[#DC2626] border-rose-300";
    badgeLabel = "CRITICAL ISSUE";
    Icon = AlertCircle;
    iconColor = "text-[#DC2626]";
  } else if (isReview) {
    borderClass = "border-amber-200 bg-amber-50/20";
    badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    badgeLabel = "REQUIRES REVIEW";
    Icon = AlertTriangle;
    iconColor = "text-amber-600";
  } else if (isInfo) {
    borderClass = "border-sky-200 bg-sky-50/20";
    badgeClass = "bg-sky-100 text-sky-800 border-sky-300";
    badgeLabel = "INFORMATIONAL";
    Icon = Info;
    iconColor = "text-sky-600";
  } else if (isPassed) {
    borderClass = "border-emerald-200 bg-emerald-50/15";
    badgeClass = "bg-emerald-100 text-[#16A34A] border-emerald-300";
    badgeLabel = "VALIDATED";
    Icon = CheckCircle2;
    iconColor = "text-[#16A34A]";
  }

  const handleApplyFix = () => {
    if (!candidateFix.trim() || !onSimulateFix) return;
    onSimulateFix(finding, candidateFix.trim());
    setShowSimulateInput(false);
  };

  return (
    <div className={`rounded-3xl border ${borderClass} p-6 shadow-sm transition-all hover:shadow-md civic-card-shadow`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-slate-100">
            <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
          </div>
          <div>
            <span className="font-extrabold text-[#10243A] text-sm tracking-tight block">
              {finding.field_name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Rule: {finding.validation_rule}
            </span>
          </div>
          {finding.is_reviewed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              <CheckSquare className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {finding.ocr_confidence && (
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              OCR: {Math.round(finding.ocr_confidence * 100)}%
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${badgeClass}`}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Side-by-Side Two Document Comparison Grid */}
      {(finding.doc_a_value || finding.doc_b_value) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 bg-[#F5F8FC] p-3.5 rounded-2xl border border-slate-200/90">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
              Document A: {finding.doc_a_name || 'Identity Proof (Aadhaar)'}
            </span>
            <div className="font-mono text-xs font-bold text-[#10243A] break-words">
              {finding.doc_a_value || <span className="text-slate-400 italic font-normal">Not detected</span>}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
              Document B: {finding.doc_b_name || 'Bank Passbook'}
            </span>
            <div className="font-mono text-xs font-bold text-[#10243A] break-words">
              {finding.doc_b_value || <span className="text-slate-400 italic font-normal">Not detected</span>}
            </div>
          </div>
        </div>
      )}

      {/* Root Cause Explanation */}
      <div className="my-3 text-xs text-[#172B4D] leading-relaxed">
        <strong className="text-[#10243A] block mb-0.5">Why this discrepancy matters:</strong>
        <p className="text-slate-600">{finding.explanation}</p>
      </div>

      {/* Recommended Correction */}
      {finding.recommended_action && (
        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-900 block font-bold">Recommended Citizen Action:</strong>
            <span className="text-amber-800">{finding.recommended_action}</span>
          </div>
        </div>
      )}

      {/* Bottom Actions & What-If Fix Simulator */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          {onInspect && (
            <button
              onClick={() => onInspect(finding)}
              className="inline-flex items-center space-x-1 text-slate-500 hover:text-[#0D9488] font-bold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Raw Evidence</span>
            </button>
          )}

          {/* Simulate Fix Toggle Button */}
          {onSimulateFix && !isPassed && (
            <button
              onClick={() => setShowSimulateInput(!showSimulateInput)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488]/20 px-3 py-1.5 rounded-xl border border-[#0D9488]/30 transition active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{showSimulateInput ? 'Close Simulator' : 'Simulate What-If Fix'}</span>
            </button>
          )}
        </div>

        {isSimulatedFixed && (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#0D9488]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score Recalculated (+12 to +25 Boost)</span>
          </span>
        )}
      </div>

      {/* Interactive What-If Simulation Input */}
      {showSimulateInput && (
        <div className="mt-3 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700 animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Candidate Correction:</span>
            </span>
            <span className="text-[10px] text-slate-400">Re-runs deterministic concordance</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={candidateFix}
              onChange={(e) => setCandidateFix(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-[#2DD4BF] focus:outline-none font-mono"
              placeholder="Enter corrected value to test..."
            />
            <button
              onClick={handleApplyFix}
              className="bg-[#0D9488] hover:bg-[#14B8A6] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
            >
              Apply Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
