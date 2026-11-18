import React from 'react';
import { X, ShieldCheck, AlertTriangle, AlertCircle, Info, FileText, Crosshair, CheckCircle2 } from 'lucide-react';

export default function EvidenceModal({ finding, onClose }) {
  if (!finding) return null;

  const isGreen = finding.status_color === 'GREEN' || finding.severity === 'PASSED';
  const isYellow = finding.status_color === 'YELLOW' || finding.severity === 'REVIEW_REQUIRED';
  const isRed = finding.status_color === 'RED' || finding.severity === 'HIGH';

  const badgeColor = isRed
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : isYellow
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : isGreen
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const icon = isRed ? (
    <AlertCircle className="w-5 h-5 text-rose-400" />
  ) : isYellow ? (
    <AlertTriangle className="w-5 h-5 text-amber-400" />
  ) : isGreen ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
  ) : (
    <Info className="w-5 h-5 text-slate-400" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${badgeColor}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-lg">{finding.field_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${badgeColor}`}>
                  {finding.status_color || finding.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Rule: {finding.validation_rule}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Evidence Snippet Callout */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
              <Crosshair className="w-4 h-4" />
              <span>EXTRACTED EVIDENCE SNIPPET & REGION</span>
            </div>
            <p className="text-sm font-mono text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              {finding.evidence_snippet || `${finding.doc_a_name}: ${finding.doc_a_value || 'N/A'} vs ${finding.doc_b_name || 'Doc B'}: ${finding.doc_b_value || 'N/A'}`}
            </p>
            {finding.confidence && (
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>OCR Detection Confidence:</span>
                <span className="font-semibold text-slate-200">{(finding.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Source: {finding.doc_a_name || 'Primary Document'}</span>
              </div>
              <div className="text-sm font-semibold text-slate-100 break-words mt-1">
                {finding.doc_a_value || '(Missing)'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target: {finding.doc_b_name || 'Comparison Target'}</span>
              </div>
              <div className="text-sm font-semibold text-slate-100 break-words mt-1">
                {finding.doc_b_value || (finding.doc_b_name ? '(Missing)' : 'Not applicable / Format verification')}
              </div>
            </div>
          </div>

          {/* Explainable Rationale */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Audit Rationale & Context</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {finding.explanation}
            </p>
          </div>

          {/* Recommended Correction */}
          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>RECOMMENDED CITIZEN / CSC ACTION</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {finding.recommended_correction}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
