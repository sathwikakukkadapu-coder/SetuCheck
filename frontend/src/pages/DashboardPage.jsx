import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Languages, 
  Download, 
  ArrowRight,
  Filter,
  BarChart3,
  Layers,
  Key,
  ExternalLink,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import DiscrepancyCard from '../components/DiscrepancyCard';
import DocumentComparisonView from '../components/DocumentComparisonView';
import EvidenceModal from '../components/EvidenceModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage({ auditResult, onGoToAssistant, onGoToReport }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedFinding, setSelectedFinding] = useState(null);

  if (!auditResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Audit Dossier</h2>
        <p className="text-xs text-slate-500">Please upload documents in the Applicant Workspace to run an audit.</p>
      </div>
    );
  }

  const {
    readiness_score,
    category_scores,
    deductions = [],
    total_documents,
    issues_detected,
    high_priority_count,
    review_required_count,
    informational_count,
    passed_count,
    findings,
    extracted_documents,
    scheme_name,
    audit_id,
    timestamp,
    summary,
    sha256_hash,
    disclaimer
  } = auditResult;

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'GREEN') return f.status_color === 'GREEN' || f.severity === 'PASSED';
    if (filterSeverity === 'YELLOW') return f.status_color === 'YELLOW' || f.severity === 'REVIEW_REQUIRED';
    if (filterSeverity === 'RED') return f.status_color === 'RED' || f.severity === 'HIGH';
    if (filterSeverity === 'GRAY') return f.status_color === 'GRAY' || f.severity === 'INFORMATIONAL';
    return f.severity === filterSeverity;
  });

  // Recharts Data
  const chartData = [
    { name: 'High Priority', count: high_priority_count, color: '#EF4444' },
    { name: 'Review Req.', count: review_required_count, color: '#F59E0B' },
    { name: 'Informational', count: informational_count, color: '#0EA5E9' },
    { name: 'Passed Checks', count: passed_count, color: '#10B981' },
  ];

  // Category scores defaults if not present
  const catCompleteness = category_scores?.completeness ?? 30;
  const catConsistency = category_scores?.consistency ?? 30;
  const catValidation = category_scores?.field_validation ?? 20;
  const catQuality = category_scores?.document_quality ?? 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Evidence Modal if opened */}
      {selectedFinding && (
        <EvidenceModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}

      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>Dossier ID: <strong>{audit_id}</strong></span>
            <span>&bull;</span>
            <span>{new Date(timestamp).toLocaleString()}</span>
            {sha256_hash && (
              <>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                  <Key className="w-3 h-3 text-teal-600" />
                  SHA-256: {sha256_hash.slice(0, 12)}...
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Findings & Readiness Dashboard</h1>
          <p className="text-xs text-slate-600 mt-1">
            Target Welfare Scheme: <strong className="text-slate-900">{scheme_name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToAssistant}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 px-3.5 py-2.5 rounded-xl transition"
          >
            <Languages className="w-4 h-4 text-teal-600" />
            <span>Telugu / Hindi Voice Assistant</span>
          </button>

          <button
            onClick={onGoToReport}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2.5 rounded-xl transition shadow"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Official Signed PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* 4-Category Score Breakdown Rubric */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Category 1: Completeness */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Completeness</span>
            <span className="text-sm font-extrabold text-slate-900">{catCompleteness} / 30</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${catCompleteness >= 25 ? 'bg-emerald-500' : catCompleteness >= 15 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${(catCompleteness / 30) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Required proofs & mandatory field presence</p>
        </div>

        {/* Category 2: Cross-Document Consistency */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cross Consistency</span>
            <span className="text-sm font-extrabold text-slate-900">{catConsistency} / 30</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${catConsistency >= 25 ? 'bg-emerald-500' : catConsistency >= 15 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${(catConsistency / 30) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Name transliteration & address alignment</p>
        </div>

        {/* Category 3: Field Validation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Field Validation</span>
            <span className="text-sm font-extrabold text-slate-900">{catValidation} / 20</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${catValidation >= 16 ? 'bg-emerald-500' : catValidation >= 10 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${(catValidation / 20) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">RBI IFSC code & bank account checksums</p>
        </div>

        {/* Category 4: OCR Quality & Reliability */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quality & OCR</span>
            <span className="text-sm font-extrabold text-slate-900">{catQuality} / 20</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${catQuality >= 16 ? 'bg-emerald-500' : catQuality >= 10 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${(catQuality / 20) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Deskewed resolution & recognition reliability</p>
        </div>
      </div>

      {/* Top Metrics Row: Score Gauge + Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Readiness Score Gauge */}
        <ScoreGauge score={readiness_score} />

        {/* 4 Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Documents */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Documents</span>
            <div className="text-3xl font-extrabold text-slate-900 my-2">{total_documents}</div>
            <span className="text-[11px] text-slate-500">Cross-verified</span>
          </div>

          {/* Card 2: High Priority */}
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">High Priority</span>
            <div className="text-3xl font-extrabold text-rose-600 my-2">{high_priority_count}</div>
            <span className="text-[11px] text-rose-700">Must fix before submit</span>
          </div>

          {/* Card 3: Review Required */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Review Required</span>
            <div className="text-3xl font-extrabold text-amber-600 my-2">{review_required_count}</div>
            <span className="text-[11px] text-amber-700">Spelling / Formatting</span>
          </div>

          {/* Card 4: Passed Checks */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Passed Checks</span>
            <div className="text-3xl font-extrabold text-emerald-600 my-2">{passed_count}</div>
            <span className="text-[11px] text-emerald-700">Full concordance</span>
          </div>

          {/* Bar Chart Overview */}
          <div className="col-span-2 sm:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Findings Distribution
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                {summary}
              </p>
            </div>

            <div className="w-full sm:w-1/2 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Cross-Document Comparison Matrix */}
      <div className="mb-8">
        <DocumentComparisonView 
          documents={extracted_documents} 
          findings={findings} 
        />
      </div>

      {/* Findings List Section with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Detailed Discrepancy Cards</h2>
            <p className="text-xs text-slate-500">Every check contains documented validation rules, clickable evidence inspector, and actionable rectification steps.</p>
          </div>

          {/* 4-Color Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `All (${findings.length})` },
              { id: 'RED', label: `🔴 Red (${high_priority_count})` },
              { id: 'YELLOW', label: `🟡 Yellow (${review_required_count})` },
              { id: 'GREEN', label: `🟢 Green (${passed_count})` },
              { id: 'GRAY', label: `⚪ Gray (${informational_count})` }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setFilterSeverity(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterSeverity === pill.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Finding Cards */}
        <div className="space-y-4">
          {filteredFindings.map((f, i) => (
            <DiscrepancyCard 
              key={f.id || i} 
              finding={f} 
              onInspect={(finding) => setSelectedFinding(finding)}
            />
          ))}

          {filteredFindings.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No findings matching the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Notice Banner */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed text-center">
        <strong>Statutory Notice:</strong> {disclaimer}
      </div>
    </div>
  );
}
