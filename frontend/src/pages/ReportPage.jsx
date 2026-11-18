import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  FileCheck2, 
  Share2, 
  Check, 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { getReportDownloadUrl } from '../api/apiClient';

export default function ReportPage({ auditResult, onBackToDashboard }) {
  const [copied, setCopied] = useState(false);

  if (!auditResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Audit Dossier</h2>
        <p className="text-xs text-slate-500">Please run an audit first to generate an official PDF report.</p>
      </div>
    );
  }

  const {
    audit_id,
    scheme_name,
    readiness_score,
    total_documents,
    issues_detected,
    high_priority_count,
    review_required_count,
    informational_count,
    passed_count,
    findings,
    timestamp,
    summary,
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyId}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg text-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied ID' : 'Share ID'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg text-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`SetuCheck_Audit_${audit_id}.pdf`}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>

      {/* Official Dossier Document Card */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden p-8 sm:p-12 text-slate-800">
        {/* Header Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center space-x-2 text-slate-950 font-extrabold text-2xl tracking-tight">
              <ShieldCheck className="w-7 h-7 text-teal-600" />
              <span>SETUCHECK AUDIT DOSSIER</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Explainable Pre-Submission Welfare Document Auditor &bull; Track 1 Submission
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs">
            <div className="font-mono text-slate-400 text-[10px]">AUDIT REFERENCE:</div>
            <div className="font-mono font-bold text-slate-900 text-sm">{audit_id}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">{new Date(timestamp).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Overview Box */}
        <div className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Welfare Scheme</span>
            <div className="font-extrabold text-base text-slate-900">{scheme_name}</div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{summary}</p>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l sm:border-slate-200 sm:pl-6 flex flex-col justify-center items-center sm:items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Readiness Score</span>
            <div className="text-3xl font-extrabold text-teal-600 my-1">{readiness_score} / 100</div>
            <span className="text-[10px] font-semibold text-slate-500">
              {readiness_score >= 80 ? 'High Concordance' : readiness_score >= 60 ? 'Review Needed' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Breakdown Statistics */}
        <div className="grid grid-cols-4 gap-3 text-center my-6 py-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Documents</span>
            <span className="font-extrabold text-slate-900 text-base">{total_documents}</span>
          </div>
          <div>
            <span className="text-rose-600 text-[10px] uppercase font-bold block">High Priority</span>
            <span className="font-extrabold text-rose-600 text-base">{high_priority_count}</span>
          </div>
          <div>
            <span className="text-amber-600 text-[10px] uppercase font-bold block">Review Needed</span>
            <span className="font-extrabold text-amber-600 text-base">{review_required_count}</span>
          </div>
          <div>
            <span className="text-emerald-600 text-[10px] uppercase font-bold block">Checks Passed</span>
            <span className="font-extrabold text-emerald-600 text-base">{passed_count}</span>
          </div>
        </div>

        {/* Detailed Findings Table */}
        <div className="my-8">
          <h3 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider text-xs">
            Audit Findings & Recommendations Summary
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3">Identity Value</th>
                  <th className="py-2.5 px-3">Secondary Value</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Recommended Rectification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {findings.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{f.field_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{f.doc_a_value || '-'}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{f.doc_b_value || '-'}</td>
                    <td className="py-3 px-3 font-bold text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full ${
                        f.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        f.severity === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                        f.severity === 'INFORMATIONAL' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{f.recommended_correction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Pre-Submission Rectification Checklist */}
        <div className="my-8 p-5 bg-teal-50/50 border border-teal-200 rounded-2xl text-xs">
          <h4 className="font-bold text-teal-950 text-xs uppercase tracking-wider mb-2">
            Applicant Action Checklist
          </h4>
          <ul className="space-y-1.5 text-teal-900 list-disc list-inside">
            <li>Ensure applicant name spelling is identical on Aadhaar and Bank Passbook.</li>
            <li>Confirm the 11-digit bank IFSC code corresponds to an active core banking branch.</li>
            <li>Verify residential address matches designated eligibility ward/panchayat.</li>
            <li>Retain a copy of this pre-submission report for your personal records.</li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed text-justify">
          <strong>LEGAL DISCLAIMER:</strong> {disclaimer} Final approval or rejection rests exclusively with the competent government authority and statutory verifying agencies.
        </div>
      </div>
    </div>
  );
}
