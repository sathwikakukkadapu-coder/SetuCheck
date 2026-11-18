import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  FileCheck2, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  ExternalLink,
  Cpu,
  Clock,
  Terminal,
  Save,
  CheckCircle2
} from 'lucide-react';
import { fetchAdminAnalytics, fetchSchemes, updateScheme } from '../api/apiClient';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, schemesData] = await Promise.all([
        fetchAdminAnalytics(),
        fetchSchemes()
      ]);
      setAnalytics(analyticsData);
      setSchemes(schemesData);
      if (schemesData.length > 0 && !selectedScheme) {
        setSelectedScheme(schemesData[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateScheme = async (e) => {
    e.preventDefault();
    if (!selectedScheme) return;
    try {
      setSaveSuccess('');
      const updated = await updateScheme(selectedScheme.id, selectedScheme);
      setSelectedScheme(updated);
      setSaveSuccess(`Scheme '${updated.name}' updated! Version bumped to ${updated.rule_version}.`);
      // Refresh list
      const schemesData = await fetchSchemes();
      setSchemes(schemesData);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setError(`Failed to update scheme: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Loading Operational Telemetry...</h2>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const health = analytics?.system_health || {};
  const recentAudits = analytics?.recent_audits || [];
  const logs = analytics?.operational_logs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-600 mb-1">
            <Activity className="w-4 h-4" />
            <span>OPERATIONS & SYSTEM TELEMETRY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SetuCheck Operations & Rule Engine Admin</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit telemetry, genuine vs synthetic logs, scheme rule versioning, and compliance health.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Audits</span>
          <div className="text-2xl font-black text-slate-900 my-1">{overview.total_audits || 0}</div>
          <span className="text-[10px] text-slate-500">{overview.genuine_audits || 0} genuine / {overview.synthetic_demo_audits || 0} demo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pass Rate</span>
          <div className="text-2xl font-black text-emerald-600 my-1">{overview.pass_rate_percent || 0}%</div>
          <span className="text-[10px] text-emerald-700">Readiness &ge; 80/100</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Avg Readiness</span>
          <div className="text-2xl font-black text-teal-600 my-1">{overview.average_readiness_score || 0}</div>
          <span className="text-[10px] text-slate-500">Benchmark score</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Docs Processed</span>
          <div className="text-2xl font-black text-slate-900 my-1">{overview.documents_processed || 0}</div>
          <span className="text-[10px] text-slate-500">OCR & Text layers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">High Priority</span>
          <div className="text-2xl font-black text-rose-600 my-1">{overview.high_priority_issues || 0}</div>
          <span className="text-[10px] text-rose-700">Requires fix</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Manual Reviews</span>
          <div className="text-2xl font-black text-amber-600 my-1">{overview.manual_annotations_recorded || 0}</div>
          <span className="text-[10px] text-amber-700">CSC operator notes</span>
        </div>
      </div>

      {/* System Health & Engine Architecture Card */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-4">
          <Server className="w-4 h-4" />
          <span>PRODUCTION ENGINE SPECIFICATION & INTEGRITY STATUS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">OCR Subsystem:</span>
            <span className="font-semibold text-slate-200">{health.ocr_engine}</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Validation Engine:</span>
            <span className="font-semibold text-slate-200">{health.validation_engine}</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Database Layer:</span>
            <span className="font-semibold text-slate-200">{health.database}</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Active Schemes:</span>
            <span className="font-semibold text-slate-200">{schemes.length} Configured Rules</span>
          </div>
        </div>
      </div>

      {/* Scheme Rules Configuration Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Welfare Scheme Rules & Checklist Editor</h2>
            <p className="text-xs text-slate-500">Configure required supporting proofs, mandatory fields, and verify rule version control.</p>
          </div>
          {saveSuccess && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccess}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheme Selector List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Available Schemes</span>
            {schemes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScheme(s)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedScheme?.id === s.id
                    ? 'bg-teal-50/70 border-teal-500 text-teal-950 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate">{s.name}</span>
                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                    v{s.rule_version}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {s.state} &bull; {s.required_documents.length} required proofs
                </div>
              </button>
            ))}
          </div>

          {/* Scheme Rule Form */}
          {selectedScheme && (
            <div className="lg:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <form onSubmit={handleUpdateScheme} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Scheme Official Name</label>
                    <input
                      type="text"
                      value={selectedScheme.name}
                      onChange={(e) => setSelectedScheme({ ...selectedScheme, name: e.target.value })}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Jurisdiction / Ministry</label>
                    <input
                      type="text"
                      value={selectedScheme.state}
                      onChange={(e) => setSelectedScheme({ ...selectedScheme, state: e.target.value })}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Required Supporting Documents (comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedScheme.required_documents.join(', ')}
                    onChange={(e) => setSelectedScheme({ 
                      ...selectedScheme, 
                      required_documents: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Supported tokens: identity, bank_passbook, address_proof, income_certificate, caste_certificate
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mandatory Field Requirements (comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedScheme.field_requirements.join(', ')}
                    onChange={(e) => setSelectedScheme({ 
                      ...selectedScheme, 
                      field_requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Supported fields: name, dob, address, bank_account_no, ifsc_code
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs font-mono text-slate-500">
                    Rule Version: <strong>{selectedScheme.rule_version}</strong> (bumping on save)
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes & Bump Version</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Operational Access Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Audit Registry Access & Verification Logs</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">SQLite Persistent Store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{new Date(log.accessed_at).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{log.audit_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{log.ip_address}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">
                    No access events logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
