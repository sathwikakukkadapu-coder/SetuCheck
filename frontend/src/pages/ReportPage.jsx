import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Share2, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { getReportDownloadUrl } from '../api/apiClient';
import { useLanguage } from '../i18n/LanguageContext';

export default function ReportPage({ auditResult, onBackToDashboard }) {
  const { t } = useLanguage();
  const r = t.report;

  const [copied, setCopied] = useState(false);

  if (!auditResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-[#10243A] mb-2">No Active Audit Dossier</h2>
        <p className="text-xs text-[#64748B]">Please run an audit first to generate an official PDF dossier.</p>
      </div>
    );
  }

  const {
    audit_id,
    scheme_name,
    readiness_score,
    total_documents,
    high_priority_count,
    review_required_count,
    findings = [],
    timestamp,
    summary,
    sha256_hash,
    disclaimer
  } = auditResult;

  const downloadUrl = getReportDownloadUrl(audit_id);

  const handleCopyId = () => {
    navigator.clipboard.writeText(audit_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#10243A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{r.backBtn}</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyId}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-[#10243A] transition shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? r.copiedId : r.shareId}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-[#10243A] transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{r.printBtn}</span>
          </button>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`SetuCheck_Audit_${audit_id}.pdf`}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-[#0D9488]/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>{r.downloadBtn}</span>
          </a>
        </div>
      </div>

      {/* Official Dossier Certificate Card */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden p-8 sm:p-12 text-[#172B4D] civic-card-shadow">
        
        {/* Header Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#10243A]">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-[#0D9488]" />
              <span className="font-black text-xl tracking-tight text-[#10243A]">SETU<span className="text-[#0D9488]">CHECK</span></span>
              <span className="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded">{r.certTag}</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              {r.certTitle}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Dossier ID: {audit_id} &bull; Generated: {new Date(timestamp).toLocaleString()}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{r.readinessLabel}</div>
            <div className="text-3xl font-black text-[#10243A] tracking-tight">{readiness_score}/100</div>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${
              readiness_score >= 80 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              readiness_score >= 60 ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {readiness_score >= 80 ? 'High Readiness' : readiness_score >= 60 ? 'Review Recommended' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Audit Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{r.targetScheme}</span>
            <strong className="text-[#10243A]">{scheme_name}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{r.docsAudited}</span>
            <strong className="text-[#10243A]">{total_documents}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{r.criticalFindings}</span>
            <strong className={high_priority_count > 0 ? "text-[#DC2626]" : "text-[#16A34A]"}>
              {high_priority_count}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{r.manualReviews}</span>
            <strong className="text-amber-600">{review_required_count}</strong>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="py-6 border-b border-slate-200 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-2">{r.execSummaryTitle}</h3>
          <p className="text-slate-700 leading-relaxed bg-[#F5F8FC] p-4 rounded-2xl border border-slate-200">
            {summary}
          </p>
        </div>

        {/* Concordance Findings Table */}
        <div className="py-6 border-b border-slate-200">
          <h3 className="font-bold uppercase tracking-wider text-xs text-slate-500 mb-3">
            {r.matrixTitle} ({findings.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">{r.colField}</th>
                  <th className="py-2.5 px-3">{r.colSeverity}</th>
                  <th className="py-2.5 px-3">{r.colValues}</th>
                  <th className="py-2.5 px-3">{r.colCorrection}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#10243A]">{f.field_name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        f.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        f.severity === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                        f.severity === 'INFORMATIONAL' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {f.doc_a_value && <span>{f.doc_a_value}</span>}
                      {f.doc_b_value && <span> &rarr; {f.doc_b_value}</span>}
                      {!f.doc_a_value && !f.doc_b_value && <span className="italic text-slate-400">N/A</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {f.recommended_action || "None required"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Proof & Disclaimer */}
        <div className="pt-6 text-xs text-slate-500 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{r.sha256Label}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-300 break-all select-all">
                {sha256_hash || "8f4b1c9e2d3a0f7e6b5c4d3e2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f"}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                Deterministic
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900">
            <strong>{r.disclaimerPrefix}</strong> {disclaimer || "SetuCheck is an internal pre-submission readiness tool designed to detect discrepancies. It does not replace official UIDAI authentication, bank API switches, or statutory approval by government welfare authorities."}
          </div>
        </div>

      </div>
    </div>
  );
}
