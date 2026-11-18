import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  MapPin, 
  UserCheck, 
  HelpCircle,
  FileSearch,
  Eye,
  RefreshCw
} from 'lucide-react';
import { 
  uploadDocumentFiles, 
  extractDocumentFields, 
  runAudit, 
  fetchDemoCases 
} from '../api/apiClient';

const SCHEME_OPTIONS = [
  { id: 'pension', name: 'National Old Age Pension Scheme (NOAPS)', requiredDocs: ['Identity (Aadhaar)', 'Bank Passbook', 'Address Proof'] },
  { id: 'pm_kisan', name: 'PM-KISAN Samman Nidhi', requiredDocs: ['Identity (Aadhaar)', 'Bank Passbook'] },
  { id: 'ration_card', name: 'Public Distribution System (NFSA Ration Card)', requiredDocs: ['Identity (Aadhaar)', 'Address Proof'] },
];

export default function WorkspacePage({ onAuditComplete }) {
  const [selectedScheme, setSelectedScheme] = useState('pension');
  const [demoCases, setDemoCases] = useState([]);
  const [selectedDemoId, setSelectedDemoId] = useState('');
  
  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{ file, type, id, status, previewUrl }]
  const [extractedDocs, setExtractedDocs] = useState([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load 5 Demo Cases on mount
  useEffect(() => {
    async function loadDemos() {
      try {
        const cases = await fetchDemoCases();
        setDemoCases(cases);
      } catch (err) {
        console.warn("Could not load demo cases from backend:", err);
      }
    }
    loadDemos();
  }, []);

  // Handle one-click demo case selection
  const handleSelectDemo = (caseItem) => {
    setSelectedDemoId(caseItem.case_id);
    setErrorMessage('');
    setExtractedDocs(caseItem.documents);
    setUploadedFiles(
      caseItem.documents.map(doc => ({
        id: doc.doc_id,
        filename: doc.original_filename,
        type: doc.document_type,
        status: 'extracted',
        synthetic: true
      }))
    );
  };

  // Handle local file selection
  const handleFileChange = (e, targetDocType) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setErrorMessage('');

    const newEntries = files.map(f => ({
      file: f,
      filename: f.name,
      type: targetDocType,
      status: 'ready',
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));

    setUploadedFiles(prev => [...prev, ...newEntries]);
    setSelectedDemoId(''); // Clear demo selection
  };

  // Upload and Extract real files
  const handleProcessUploadedFiles = async () => {
    if (!uploadedFiles.length) {
      setErrorMessage("Please upload at least one document or select a demo case.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');

      // Filter real files (not synthetic)
      const realEntries = uploadedFiles.filter(item => item.file);
      if (!realEntries.length && extractedDocs.length > 0) {
        // Already loaded demo docs, proceed directly
        setIsUploading(false);
        return;
      }

      const filesToUpload = realEntries.map(e => e.file);
      const typesToUpload = realEntries.map(e => e.type);

      const uploadResp = await uploadDocumentFiles(filesToUpload, typesToUpload);
      const docIds = uploadResp.map(r => r.doc_id);

      // Extract fields
      const extractResp = await extractDocumentFields(docIds);
      setExtractedDocs(extractResp);

      // Update uploaded files status
      setUploadedFiles(prev =>
        prev.map(item => ({
          ...item,
          status: 'extracted'
        }))
      );
    } catch (err) {
      setErrorMessage(`Extraction failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger Pre-Submission Audit
  const handleExecuteAudit = async () => {
    if (!extractedDocs.length && !uploadedFiles.length) {
      setErrorMessage("Please upload documents or load a demo case first.");
      return;
    }

    try {
      setIsAuditing(true);
      setErrorMessage('');

      // If user uploaded real files that aren't extracted yet, extract first
      let docsForAudit = extractedDocs;
      if (!docsForAudit.length && uploadedFiles.some(f => f.file)) {
        const realEntries = uploadedFiles.filter(item => item.file);
        const uploadResp = await uploadDocumentFiles(realEntries.map(e => e.file), realEntries.map(e => e.type));
        docsForAudit = await extractDocumentFields(uploadResp.map(r => r.doc_id));
        setExtractedDocs(docsForAudit);
      }

      const result = await runAudit({
        scheme: selectedScheme,
        pre_extracted: docsForAudit.length > 0 ? docsForAudit : null,
      });

      onAuditComplete(result);
    } catch (err) {
      setErrorMessage(`Audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    setExtractedDocs(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Scheme Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your welfare scheme and submit supporting documents for automated pre-submission compliance audit.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Target Scheme:</label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {SCHEME_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Scheme Guidelines Banner */}
        <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-teal-900 font-medium">
            <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Required for {SCHEME_OPTIONS.find(s => s.id === selectedScheme)?.name}:</strong>{' '}
              {SCHEME_OPTIONS.find(s => s.id === selectedScheme)?.requiredDocs.join(', ')}
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold bg-white px-2 py-0.5 rounded border border-teal-200">
            Mandatory DBT Concordance
          </span>
        </div>
      </div>

      {/* Judges One-Click Demo Suite Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-teal-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-sm tracking-tight text-white uppercase tracking-wider">
              One-Click Demonstration Cases (Judges' Evaluation Suite)
            </h2>
          </div>
          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-mono">
            5 Test Fixtures
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Click any preset case to automatically stage verified synthetic documents and test the deterministic validation engine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {demoCases.map((c) => {
            const isSelected = selectedDemoId === c.case_id;
            return (
              <button
                key={c.case_id}
                onClick={() => handleSelectDemo(c)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">
                  {c.category}
                </div>
                <div className="font-bold text-xs text-white line-clamp-1 mb-1">
                  {c.title.split(':')[1] || c.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {c.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Identity Document */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-1">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>1. Identity Proof</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Synthetic Aadhaar or Voter ID containing applicant name, DOB, and address.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Upload Identity PDF / JPG</span>
              <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'identity')} 
              />
            </label>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 mt-3 block text-center">
            {uploadedFiles.filter(f => f.type === 'identity').length} Document Staged
          </span>
        </div>

        {/* Card 2: Bank Passbook */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-1">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>2. Bank Passbook</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Front folio or cancelled cheque displaying account number and 11-char IFSC code.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Upload Bank Passbook</span>
              <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'bank_passbook')} 
              />
            </label>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 mt-3 block text-center">
            {uploadedFiles.filter(f => f.type === 'bank_passbook').length} Document Staged
          </span>
        </div>

        {/* Card 3: Address Proof */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-1">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>3. Address Proof</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Electricity bill, ration card, or domicile proof verifying local jurisdiction.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Upload Address Proof</span>
              <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'address_proof')} 
              />
            </label>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 mt-3 block text-center">
            {uploadedFiles.filter(f => f.type === 'address_proof').length} Document Staged
          </span>
        </div>
      </div>

      {/* Staged Documents & Extracted Fields List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Staged Documents ({uploadedFiles.length})</h3>
              <p className="text-[11px] text-slate-500">Ready for OCR and cross-document deterministic comparison</p>
            </div>

            {uploadedFiles.some(f => f.file && f.status === 'ready') && (
              <button
                onClick={handleProcessUploadedFiles}
                disabled={isUploading}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Extracting via PyMuPDF/OCR...' : 'Extract Fields'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((doc, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{doc.filename}</div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      Category: <strong>{doc.type.replace('_', ' ')}</strong> &bull; {doc.synthetic ? 'Synthetic Test Fixture' : doc.size}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Structured Fields Ready</span>
                  </span>

                  <button 
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Extracted Fields Preview */}
          {extractedDocs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
                <FileSearch className="w-4 h-4 text-teal-600" />
                <span>Structured Fields Extracted (No Fabrication Guaranteed)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extractedDocs.map((ed, i) => (
                  <div key={i} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900 mb-2 capitalize flex items-center justify-between">
                      <span>{ed.document_type.replace('_', ' ')}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ed.extraction_method}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      {ed.name?.value && (
                        <div><span className="text-slate-500">Name:</span> <strong className="text-slate-800">{ed.name.value}</strong></div>
                      )}
                      {ed.dob?.value && (
                        <div><span className="text-slate-500">DOB:</span> <strong className="text-slate-800">{ed.dob.value}</strong></div>
                      )}
                      {ed.bank_account_no?.value && (
                        <div><span className="text-slate-500">A/C:</span> <strong className="text-slate-800 font-mono">•••• {ed.bank_account_no.value.slice(-4)}</strong></div>
                      )}
                      {ed.ifsc_code?.value && (
                        <div><span className="text-slate-500">IFSC:</span> <strong className="text-slate-800 font-mono">{ed.ifsc_code.value}</strong></div>
                      )}
                      {ed.address?.value && (
                        <div className="line-clamp-2"><span className="text-slate-500">Address:</span> <strong className="text-slate-800">{ed.address.value}</strong></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2 mb-6">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>SetuCheck will run deterministic name matching, IFSC formatting, and address checks.</span>
        </div>

        <button
          onClick={handleExecuteAudit}
          disabled={isAuditing || (!uploadedFiles.length && !extractedDocs.length)}
          className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
            isAuditing || (!uploadedFiles.length && !extractedDocs.length)
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/25'
          }`}
        >
          <FileSearch className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Executing Deterministic Audit...' : 'Execute Compliance Audit'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
