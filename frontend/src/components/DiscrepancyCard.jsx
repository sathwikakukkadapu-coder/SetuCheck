import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, ShieldCheck, Crosshair, CheckSquare, Wand2, RefreshCw, Check } from 'lucide-react';

export default function DiscrepancyCard({ finding, onInspect, onSimulateFix, isSimulatedFixed = false }) {
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
  let iconColor = "text-emerald-600";

  if (isSimulatedFixed) {
    borderClass = "border-teal-300 bg-teal-50/40 ring-1 ring-teal-400";
    badgeClass = "bg-teal-100 text-teal-800 border-teal-300";
    badgeLabel = "SIMULATED RESOLVED";
    Icon = CheckCircle2;
    iconColor = "text-teal-600";
  } else if (isHigh) {
    borderClass = "border-rose-200 bg-rose-50/30";
    badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
    badgeLabel = "RED • HIGH PRIORITY";
    Icon = AlertCircle;
    iconColor = "text-rose-600";
  } else if (isReview) {
    borderClass = "border-amber-200 bg-amber-50/30";
    badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    badgeLabel = "YELLOW • REVIEW REQUIRED";
    Icon = AlertTriangle;
    iconColor = "text-amber-600";
  } else if (isInfo) {
    borderClass = "border-sky-200 bg-sky-50/30";
    badgeClass = "bg-sky-100 text-sky-800 border-sky-300";
    badgeLabel = "GRAY • INFORMATIONAL";
    Icon = Info;
    iconColor = "text-sky-600";
  } else if (isPassed) {
    borderClass = "border-emerald-200 bg-emerald-50/20";
    badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    badgeLabel = "GREEN • VALIDATED";
    Icon = CheckCircle2;
    iconColor = "text-emerald-600";
  }

  const handleApplyFix = () => {
    if (!candidateFix.trim() || !onSimulateFix) return;
    onSimulateFix(finding, candidateFix.trim());
    setShowSimulateInput(false);
  };

  return (
    <div className={`rounded-xl border ${borderClass} p-5 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
          <span className="font-bold text-slate-900 text-sm tracking-tight">{finding.field_name}</span>
          {finding.is_reviewed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              <CheckSquare className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Rule: {finding.validation_rule}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeClass}`}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Comparison Grid if two values exist */}
      {(finding.doc_a_value || finding.doc_b_value) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              {finding.doc_a_name || 'Document A'}
            </span>
            <div className="font-mono text-xs font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200 break-words">
              {finding.doc_a_value || '(Not Present)'}
            </div>
          </div>

          {finding.doc_b_name && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {finding.doc_b_name}
              </span>
              <div className="font-mono text-xs font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200 break-words">
                {finding.doc_b_value || '(Not Present)'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="mt-2 text-xs text-slate-700 leading-relaxed">
        <p><strong className="text-slate-900 font-semibold">Finding:</strong> {finding.explanation}</p>
      </div>

      {/* Recommendation */}
      {!isPassed && (
        <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg text-xs flex items-start space-x-2.5 text-blue-900">
          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-blue-950">Recommended Rectification: </span>
            <span className="text-blue-900">{finding.recommended_correction}</span>
          </div>
        </div>
      )}

      {/* Operator review notes if present */}
      {finding.reviewer_notes && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
          <span className="font-bold text-emerald-950">Operator Verification Note: </span>
          <span>{finding.reviewer_notes}</span>
          {finding.reviewed_at && (
            <span className="text-[10px] text-emerald-700 ml-2 font-mono">
              ({new Date(finding.reviewed_at).toLocaleTimeString()})
            </span>
          )}
        </div>
      )}

      {/* Interactive What-If Simulator Inline Form */}
      {showSimulateInput && (
        <div className="mt-3 p-3.5 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-teal-950">
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-teal-600" />
              What-If Correction Simulator
            </span>
            <span className="text-[10px] text-teal-700 font-mono">Live Recalculation</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-normal">
            Enter candidate corrected value to preview readiness improvement without altering raw uploads:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={candidateFix}
              onChange={(e) => setCandidateFix(e.target.value)}
              placeholder="Enter corrected value..."
              className="flex-1 text-xs font-mono p-2 bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleApplyFix}
              className="inline-flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Recalculate</span>
            </button>
            <button
              onClick={() => setShowSimulateInput(false)}
              className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Deterministic Rule ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{finding.id}</code></span>
        <div className="flex items-center gap-2">
          <span>Confidence: <strong>{Math.round((finding.confidence || 1) * 100)}%</strong></span>
          
          {onSimulateFix && !isSimulatedFixed && !isPassed && (
            <button
              onClick={() => setShowSimulateInput(!showSimulateInput)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition"
            >
              <Wand2 className="w-3 h-3" /> Simulate Fix
            </button>
          )}

          {isSimulatedFixed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-teal-600" /> Simulated Fix
            </span>
          )}

          {onInspect && (
            <button
              onClick={() => onInspect(finding)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-lg transition"
            >
              <Crosshair className="w-3 h-3" /> Inspect Evidence
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
