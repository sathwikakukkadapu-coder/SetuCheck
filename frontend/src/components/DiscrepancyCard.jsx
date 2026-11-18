import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, ShieldCheck, Crosshair, CheckSquare } from 'lucide-react';

export default function DiscrepancyCard({ finding, onInspect, onResolve }) {
  const isHigh = finding.severity === 'HIGH' || finding.status_color === 'RED';
  const isReview = finding.severity === 'REVIEW_REQUIRED' || finding.status_color === 'YELLOW';
  const isInfo = finding.severity === 'INFORMATIONAL' || finding.status_color === 'GRAY';
  const isPassed = finding.severity === 'PASSED' || finding.status_color === 'GREEN';

  let borderClass = "border-slate-200 bg-white";
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
  let badgeLabel = finding.status_color || "PASSED";
  let Icon = CheckCircle2;
  let iconColor = "text-emerald-600";

  if (isHigh) {
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

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Deterministic Rule ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{finding.id}</code></span>
        <div className="flex items-center gap-3">
          <span>Confidence: <strong>{Math.round((finding.confidence || 1) * 100)}%</strong></span>
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
