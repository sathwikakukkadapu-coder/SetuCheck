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
  Layers,
  Sparkles,
  RotateCcw,
  Building2,
  Calendar,
  Hash,
  Eye
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import DiscrepancyCard from '../components/DiscrepancyCard';
import DocumentComparisonView from '../components/DocumentComparisonView';
import EvidenceModal from '../components/EvidenceModal';
import { AadhaarMockup, BankPassbookMockup, UtilityBillMockup } from '../components/DocumentVisualizer';
import { simulateAuditFixes, getReportDownloadUrl } from '../api/apiClient';
import { useLanguage } from '../i18n/LanguageContext';

export default function DashboardPage({ 
  auditResult, 
  onGoToAssistant, 
  onGoToReport,
  onGoToWorkspace
}) {
  const { t } = useLanguage();
  const d = t.dashboard;

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'comparison' | 'mockups'
  
  // What-If Simulation State
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [simulatedFixes, setSimulatedFixes] = useState({});
  const [simulationStats, setSimulationStats] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!auditResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#10243A] mb-2">No Active Audit Dossier</h2>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-6">
          Upload supporting documents in the Applicant Workspace to generate a live deterministic audit.
        </p>
        <button
          onClick={onGoToWorkspace}
          className="inline-flex items-center space-x-2 bg-[#0D9488] hover:bg-[#14B8A6] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition"
        >
          <span>Open Applicant Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Active or simulated result
  const activeResult = simulatedResult || auditResult;

  const {
    readiness_score,
    category_scores,
    total_documents,
    high_priority_count,
    review_required_count,
    passed_count,
    findings = [],
    extracted_documents = [],
    scheme_name,
    audit_id,
    timestamp
  } = activeResult;

  // Handle What-If candidate fix simulation
  const handleSimulateFix = async (finding, correctedValue) => {
    try {
      setIsSimulating(true);
      const newFixes = { ...simulatedFixes, [finding.id]: correctedValue };
      setSimulatedFixes(newFixes);

      let fieldKey = "name";
      if (finding.field_name?.toLowerCase().includes("ifsc")) fieldKey = "ifsc_code";
      else if (finding.field_name?.toLowerCase().includes("account")) fieldKey = "bank_account_no";
      else if (finding.field_name?.toLowerCase().includes("address")) fieldKey = "address";

      let docType = "bank_passbook";
      if (finding.doc_b_name?.toLowerCase().includes("identity") || finding.doc_a_name?.toLowerCase().includes("identity")) {
        docType = "bank_passbook";
      }

      const overrides = Object.entries(newFixes).map(([fId, val]) => ({
        field_name: fieldKey,
        corrected_value: val,
        doc_type: docType
      }));

      const simResp = await simulateAuditFixes({
        scheme: auditResult.scheme_code || 'pension',
        documents: auditResult.extracted_documents,
        overrides: overrides
      });

      setSimulatedResult(simResp.updated_audit);
      setSimulationStats({
        scoreDelta: simResp.score_delta,
        prevScore: simResp.previous_score,
        newScore: simResp.new_score,
        resolvedCount: simResp.resolved_count,
      });
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setSimulatedResult(null);
    setSimulatedFixes({});
    setSimulationStats(null);
  };

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'HIGH') return f.severity === 'HIGH' || f.status_color === 'RED';
    if (filterSeverity === 'REVIEW') return f.severity === 'REVIEW_REQUIRED' || f.status_color === 'YELLOW';
    if (filterSeverity === 'INFO') return f.severity === 'INFORMATIONAL' || f.status_color === 'GRAY';
    if (filterSeverity === 'PASSED') return f.severity === 'PASSED' || f.status_color === 'GREEN';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* 1. TOP HEADER & DOSSIER REFERENCE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm mb-8 civic-card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{d.dossierBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10243A] tracking-tight">
              {d.heading}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
              <span className="flex items-center gap-1 font-mono">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                {d.refLabel} <strong className="text-[#10243A]">{audit_id}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {d.schemeLabel} <strong className="text-[#10243A]">{scheme_name}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {d.auditedLabel} {new Date(timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onGoToAssistant}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#0D9488]/10 hover:bg-[#0D9488]/20 text-[#0D9488] px-3.5 py-2.5 rounded-xl border border-[#0D9488]/30 transition"
            >
              <Languages className="w-4 h-4" />
              <span>{d.vernacularVoiceBtn}</span>
            </button>

            <a
              href={getReportDownloadUrl(audit_id)}
              target="_blank"
              rel="noopener noreferrer"
              download={`SetuCheck_${audit_id}.pdf`}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#10243A] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>{d.downloadPdfBtn}</span>
            </a>
          </div>
        </div>

        {/* Simulation Alert Pill */}
        {simulatedResult && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>
                <strong>{d.simActive} {simulationStats?.prevScore}</strong> &rarr; <strong className="text-emerald-700">{simulationStats?.newScore}</strong> (+{simulationStats?.scoreDelta} pts).
              </span>
            </div>
            <button
              onClick={handleResetSimulation}
              className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-teal-200 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{d.resetSim}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. STATS & SCORE GAUGES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Readiness Gauge (4 cols) */}
        <div className="lg:col-span-4">
          <ScoreGauge score={readiness_score} />
        </div>

        {/* Breakdown & Metric Cards (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          
          {/* Top 4 Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm civic-card-shadow">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                <span>{d.kpiDocs}</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-[#10243A]">{total_documents}</div>
              <div className="text-[10px] text-slate-500 mt-1">{d.kpiDocsSub}</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-rose-200/80 bg-rose-50/20 shadow-sm civic-card-shadow">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#DC2626] mb-1">
                <span>{d.kpiCritical}</span>
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div className="text-2xl font-black text-[#DC2626]">{high_priority_count}</div>
              <div className="text-[10px] text-rose-700 mt-1">{d.kpiCriticalSub}</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-amber-200/80 bg-amber-50/20 shadow-sm civic-card-shadow">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 mb-1">
                <span>{d.kpiReview}</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">{review_required_count}</div>
              <div className="text-[10px] text-amber-800 mt-1">{d.kpiReviewSub}</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm civic-card-shadow">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#16A34A] mb-1">
                <span>{d.kpiValidated}</span>
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div className="text-2xl font-black text-[#16A34A]">{passed_count}</div>
              <div className="text-[10px] text-emerald-700 mt-1">{d.kpiValidatedSub}</div>
            </div>
          </div>

          {/* 4-Category Rubric Score Breakdown Card */}
          {category_scores && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm civic-card-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#10243A]">
                  {d.rubricTitle}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Max: 100</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{d.rubricCompleteness}</div>
                  <div className="text-lg font-black text-[#10243A]">
                    {category_scores.completeness_score} <span className="text-xs text-slate-400">/ 30</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#0D9488] h-full rounded-full" 
                      style={{ width: `${(category_scores.completeness_score / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{d.rubricConsistency}</div>
                  <div className="text-lg font-black text-[#10243A]">
                    {category_scores.consistency_score} <span className="text-xs text-slate-400">/ 30</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#2563EB] h-full rounded-full" 
                      style={{ width: `${(category_scores.consistency_score / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{d.rubricValidation}</div>
                  <div className="text-lg font-black text-[#10243A]">
                    {category_scores.validation_score} <span className="text-xs text-slate-400">/ 20</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${(category_scores.validation_score / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{d.rubricQuality}</div>
                  <div className="text-lg font-black text-[#10243A]">
                    {category_scores.quality_score} <span className="text-xs text-slate-400">/ 20</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#16A34A] h-full rounded-full" 
                      style={{ width: `${(category_scores.quality_score / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. VIEW MODE TABS: Discrepancy Findings vs Concordance Matrix vs Document Visualizer */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'findings'
              ? 'bg-[#10243A] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{d.tabFindings} ({findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'comparison'
              ? 'bg-[#10243A] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{d.tabMatrix}</span>
        </button>

        <button
          onClick={() => setActiveTab('mockups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'mockups'
              ? 'bg-[#10243A] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{d.tabMockups}</span>
        </button>
      </div>

      {/* TAB 1: DISCREPANCY FINDINGS WITH FILTERS */}
      {activeTab === 'findings' && (
        <div className="space-y-6">
          
          {/* Severity Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#10243A]">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{d.filterLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: d.filterAll },
                { id: 'HIGH', label: d.filterHigh },
                { id: 'REVIEW', label: d.filterReview },
                { id: 'INFO', label: d.filterInfo },
                { id: 'PASSED', label: d.filterPassed },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterSeverity(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterSeverity === tab.id
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finding Cards List */}
          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center civic-card-shadow">
                <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto mb-3" />
                <h3 className="font-bold text-[#10243A] text-base mb-1">{d.noFindings}</h3>
                <p className="text-xs text-[#64748B]">{d.noFindingsSub}</p>
              </div>
            ) : (
              filteredFindings.map((finding) => (
                <DiscrepancyCard
                  key={finding.id}
                  finding={finding}
                  onInspect={setSelectedFinding}
                  onSimulateFix={handleSimulateFix}
                  isSimulatedFixed={Boolean(simulatedFixes[finding.id])}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONCORDANCE MATRIX */}
      {activeTab === 'comparison' && (
        <DocumentComparisonView 
          documents={extracted_documents} 
          findings={findings} 
        />
      )}

      {/* TAB 3: REALISTIC INDIAN DOCUMENT MOCKUPS */}
      {activeTab === 'mockups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm civic-card-shadow">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">1. Aadhaar Card</h3>
            <AadhaarMockup 
              data={{
                name: extracted_documents.find(d => d.document_type === 'identity')?.name?.value || "RAMESH KUMAR",
                uid: "8912",
                dob: extracted_documents.find(d => d.document_type === 'identity')?.dob?.value || "12/04/1982",
                address: extracted_documents.find(d => d.document_type === 'identity')?.address?.value || "H No 4-12, Gandhi Nagar, Hyderabad 500028"
              }}
            />
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm civic-card-shadow">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">2. State Bank Passbook</h3>
            <BankPassbookMockup 
              data={{
                name: extracted_documents.find(d => d.document_type === 'bank_passbook')?.name?.value || "RAMESH K.",
                account: "•••• 3049",
                ifsc: extracted_documents.find(d => d.document_type === 'bank_passbook')?.ifsc_code?.value || "SBIN0001234",
                branch: "SBI Hyderabad Main"
              }}
            />
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm civic-card-shadow">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">3. Utility / Domicile Bill</h3>
            <UtilityBillMockup 
              data={{
                consumerName: extracted_documents.find(d => d.document_type === 'address_proof')?.name?.value || "RAMESH KUMAR",
                billNo: "APCPDCL-7849102",
                address: extracted_documents.find(d => d.document_type === 'address_proof')?.address?.value || "H No 4-12, Gandhi Nagar, Hyderabad 500028"
              }}
            />
          </div>
        </div>
      )}

      {/* Raw Evidence Modal */}
      {selectedFinding && (
        <EvidenceModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}

    </div>
  );
}
