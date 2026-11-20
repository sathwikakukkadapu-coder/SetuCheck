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
  RefreshCw,
  Lock,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info
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
  
  // Multi-step State (1: Scheme & Docs, 2: Upload/Extract, 3: Review & Correct Fields, 4: Audit)
  const [currentStep, setCurrentStep] = useState(1);

  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{ file, type, id, status, filename, size, synthetic }]
  const [extractedDocs, setExtractedDocs] = useState([]);
  
  // Field Editing Modal State
  const [editingField, setEditingField] = useState(null); // { docIndex, fieldKey, currentValue, label }
  const [editValue, setEditValue] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
    setCurrentStep(3); // Jump to Step 3 (Review & Correct Extracted Information)
  };

  // Handle local file selection
  const handleFileChange = (e, targetDocType) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    addFilesToStaging(files, targetDocType);
  };

  const addFilesToStaging = (files, targetDocType) => {
    setErrorMessage('');
    const newEntries = files.map(f => ({
      file: f,
      filename: f.name,
      type: targetDocType,
      status: 'ready',
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));

    setUploadedFiles(prev => [...prev.filter(item => item.type !== targetDocType), ...newEntries]);
    setSelectedDemoId('');
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, targetDocType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFilesToStaging(Array.from(e.dataTransfer.files), targetDocType);
    }
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
        setIsUploading(false);
        setCurrentStep(3);
        return;
      }

      const filesToUpload = realEntries.map(e => e.file);
      const typesToUpload = realEntries.map(e => e.type);

      const uploadResp = await uploadDocumentFiles(filesToUpload, typesToUpload);
      const docIds = uploadResp.map(r => r.doc_id);

      // Extract fields via PyMuPDF/OCR
      const extractResp = await extractDocumentFields(docIds);
      setExtractedDocs(extractResp);

      setUploadedFiles(prev =>
        prev.map(item => ({
          ...item,
          status: 'extracted'
        }))
      );

      setCurrentStep(3); // Advance to Review & Correct
    } catch (err) {
      setErrorMessage(`Extraction failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Modal for a field
  const handleStartEditField = (docIndex, fieldKey, currentValue, label) => {
    setEditingField({ docIndex, fieldKey, currentValue, label });
    setEditValue(currentValue || '');
  };

  // Save manual field correction
  const handleSaveFieldEdit = () => {
    if (!editingField) return;
    const { docIndex, fieldKey } = editingField;

    setExtractedDocs(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated[docIndex] && updated[docIndex][fieldKey]) {
        updated[docIndex][fieldKey].value = editValue.trim();
        updated[docIndex][fieldKey].confidence = 1.0;
        updated[docIndex][fieldKey].status = 'user_corrected';
      }
      return updated;
    });

    setEditingField(null);
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
      
      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto text-xs font-bold text-slate-500">
          <div className="flex items-center space-x-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 1 ? 'bg-[#0D9488] text-white shadow-sm' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span className={currentStep >= 1 ? 'text-[#10243A]' : ''}>Scheme Selection</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div className={`h-full bg-[#0D9488] transition-all duration-300 ${
              currentStep === 1 ? 'w-1/3' : (currentStep === 2 ? 'w-2/3' : 'w-full')
            }`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 2 ? 'bg-[#0D9488] text-white shadow-sm' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span className={currentStep >= 2 ? 'text-[#10243A]' : ''}>Upload Documents</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div className={`h-full bg-[#0D9488] transition-all duration-300 ${
              currentStep >= 3 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 3 ? 'bg-[#0D9488] text-white shadow-sm' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span className={currentStep >= 3 ? 'text-[#10243A]' : ''}>Review & Audit</span>
          </div>
        </div>
      </div>

      {/* Header & Target Scheme Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm mb-8 civic-card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#10243A] tracking-tight">
              Pre-Submission Applicant Workspace
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Cross-audit welfare documents before submitting to MeeSeva or the government department.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-[#10243A] whitespace-nowrap">Target Scheme:</label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-[#172B4D] text-xs font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
            >
              {SCHEME_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Scheme Guidelines Banner */}
        <div className="mt-4 p-3.5 bg-[#0D9488]/10 border border-[#0D9488]/20 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0D9488] font-medium">
            <Building2 className="w-4 h-4 shrink-0" />
            <span>
              <strong>Mandatory for {SCHEME_OPTIONS.find(s => s.id === selectedScheme)?.name}:</strong>{' '}
              {SCHEME_OPTIONS.find(s => s.id === selectedScheme)?.requiredDocs.join(', ')}
            </span>
          </div>
          <span className="text-[11px] text-[#0D9488] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#0D9488]/20">
            DBT Direct Benefit Transfer Rules Active
          </span>
        </div>
      </div>

      {/* Judges One-Click Demo Suite Banner */}
      <div className="bg-[#10243A] rounded-3xl border border-slate-800 p-6 text-white mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-[#2DD4BF]">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="font-bold text-sm tracking-tight text-white uppercase tracking-wider">
              Judges & Evaluators Demo Suite (5 Synthetic Fixtures)
            </h2>
          </div>
          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-mono">
            Zero Upload Wait Time
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Click any scenario below to load pre-verified synthetic records and immediately test cross-document concordance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {demoCases.map((c) => {
            const isSelected = selectedDemoId === c.case_id;
            return (
              <button
                key={c.case_id}
                onClick={() => handleSelectDemo(c)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#0D9488]/20 border-[#2DD4BF] text-white shadow-md ring-1 ring-[#2DD4BF]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider mb-1">
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

      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between text-xs text-[#64748B] shadow-xs">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-[#0D9488]" />
          <span>
            <strong>Privacy Assured:</strong> All document files are processed in ephemeral memory. Sensitive 12-digit Aadhaar and bank account numbers are automatically masked.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Memory Cleanup: Active</span>
      </div>

      {/* Step 2: 3-Card Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Identity Document */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between civic-card-shadow"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'identity')}
        >
          <div>
            <div className="flex items-center space-x-2 text-[#10243A] font-bold text-sm mb-1">
              <UserCheck className="w-4 h-4 text-[#2563EB]" />
              <span>1. Identity Proof</span>
            </div>
            <p className="text-[11px] text-[#64748B] mb-4">
              Aadhaar, Voter ID or Passport showing applicant name, DOB, and address.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] bg-[#F5F8FC] hover:bg-blue-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-[#10243A]">Upload Identity File</span>
              <span className="text-[10px] text-[#64748B] mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'identity')} 
              />
            </label>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
              {uploadedFiles.filter(f => f.type === 'identity').length} Staged
            </span>
          </div>
        </div>

        {/* Card 2: Bank Passbook */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between civic-card-shadow"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'bank_passbook')}
        >
          <div>
            <div className="flex items-center space-x-2 text-[#10243A] font-bold text-sm mb-1">
              <Building2 className="w-4 h-4 text-[#0D9488]" />
              <span>2. Bank Passbook</span>
            </div>
            <p className="text-[11px] text-[#64748B] mb-4">
              Passbook front page or statement showing account number and 11-digit IFSC code.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-[#0D9488] bg-[#F5F8FC] hover:bg-teal-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-[#10243A]">Upload Bank Passbook</span>
              <span className="text-[10px] text-[#64748B] mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'bank_passbook')} 
              />
            </label>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
              {uploadedFiles.filter(f => f.type === 'bank_passbook').length} Staged
            </span>
          </div>
        </div>

        {/* Card 3: Address Proof */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between civic-card-shadow"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'address_proof')}
        >
          <div>
            <div className="flex items-center space-x-2 text-[#10243A] font-bold text-sm mb-1">
              <MapPin className="w-4 h-4 text-[#38BDF8]" />
              <span>3. Address Proof</span>
            </div>
            <p className="text-[11px] text-[#64748B] mb-4">
              Electricity bill, ration card, or domicile proof verifying local jurisdiction.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-[#38BDF8] bg-[#F5F8FC] hover:bg-sky-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px]">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-[#10243A]">Upload Address Proof</span>
              <span className="text-[10px] text-[#64748B] mt-1">PDF, JPG, PNG up to 15MB</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'address_proof')} 
              />
            </label>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
              {uploadedFiles.filter(f => f.type === 'address_proof').length} Staged
            </span>
          </div>
        </div>
      </div>

      {/* Staged Documents List & Extract Action */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm mb-8 civic-card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#10243A] text-sm">Staged Documents ({uploadedFiles.length})</h3>
              <p className="text-[11px] text-[#64748B]">Ready for OCR extraction and cross-document concordance</p>
            </div>

            {uploadedFiles.some(f => f.file && f.status === 'ready') && (
              <button
                onClick={handleProcessUploadedFiles}
                disabled={isUploading}
                className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#10243A] hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Extracting via Tesseract & PyMuPDF...' : 'Extract Fields with Confidence'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((doc, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#10243A]">{doc.filename}</div>
                    <div className="text-[11px] text-[#64748B] capitalize">
                      Category: <strong>{doc.type.replace('_', ' ')}</strong> &bull; {doc.synthetic ? 'Synthetic Test Fixture' : doc.size}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Structured Fields Ready</span>
                  </span>

                  <button 
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-[#DC2626] transition p-1"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* STEP 3: EXTRACTED FIELDS REVIEW & MANUAL CORRECTION */}
          {extractedDocs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileSearch className="w-5 h-5 text-[#0D9488]" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                      Step 3: Review Extracted Information & Confidence
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Correct any blurry OCR readings before running the audit so false deductions are avoided.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-[#64748B]">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    &ge;75% High
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    &lt;75% Review
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extractedDocs.map((ed, docIdx) => (
                  <div key={docIdx} className="bg-[#F5F8FC] p-4 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <div className="font-extrabold text-[#10243A] mb-3 capitalize flex items-center justify-between border-b border-slate-200 pb-2">
                        <span>{ed.document_type.replace('_', ' ')}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {ed.extraction_method}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        {/* Name Field */}
                        {ed.name && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">NAME</span>
                              <strong className="text-[#10243A] text-xs">{ed.name.value || '(Not detected)'}</strong>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                (ed.name.confidence || 0) >= 0.75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {Math.round((ed.name.confidence || 0) * 100)}%
                              </span>
                              <button
                                onClick={() => handleStartEditField(docIdx, 'name', ed.name.value, 'Applicant Name')}
                                className="text-slate-400 hover:text-[#0D9488] p-1"
                                title="Edit Field"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* DOB Field */}
                        {ed.dob && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">DOB</span>
                              <strong className="text-[#10243A] text-xs">{ed.dob.value || '(Not detected)'}</strong>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                (ed.dob.confidence || 0) >= 0.75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {Math.round((ed.dob.confidence || 0) * 100)}%
                              </span>
                              <button
                                onClick={() => handleStartEditField(docIdx, 'dob', ed.dob.value, 'Date of Birth')}
                                className="text-slate-400 hover:text-[#0D9488] p-1"
                                title="Edit Field"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Bank Account Number */}
                        {ed.bank_account_no && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">A/C NUMBER</span>
                              <strong className="text-[#10243A] font-mono text-xs">•••• {ed.bank_account_no.value.slice(-4)}</strong>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                                {Math.round((ed.bank_account_no.confidence || 0) * 100)}%
                              </span>
                              <button
                                onClick={() => handleStartEditField(docIdx, 'bank_account_no', ed.bank_account_no.value, 'Bank Account Number')}
                                className="text-slate-400 hover:text-[#0D9488] p-1"
                                title="Edit Field"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* IFSC Code */}
                        {ed.ifsc_code && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">IFSC CODE</span>
                              <strong className="text-[#10243A] font-mono text-xs">{ed.ifsc_code.value || '(Not detected)'}</strong>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                (ed.ifsc_code.confidence || 0) >= 0.75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {Math.round((ed.ifsc_code.confidence || 0) * 100)}%
                              </span>
                              <button
                                onClick={() => handleStartEditField(docIdx, 'ifsc_code', ed.ifsc_code.value, 'IFSC Code')}
                                className="text-slate-400 hover:text-[#0D9488] p-1"
                                title="Edit Field"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        {ed.address && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                            <div className="pr-2">
                              <span className="text-[10px] text-slate-400 font-bold block">ADDRESS</span>
                              <strong className="text-[#10243A] text-xs line-clamp-2">{ed.address.value || '(Not detected)'}</strong>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                (ed.address.confidence || 0) >= 0.75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {Math.round((ed.address.confidence || 0) * 100)}%
                              </span>
                              <button
                                onClick={() => handleStartEditField(docIdx, 'address', ed.address.value, 'Residential Address')}
                                className="text-slate-400 hover:text-[#0D9488] p-1"
                                title="Edit Field"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-[#10243A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-bold text-sm text-[#10243A]">Manual Field Correction</h3>
              </div>
              <button 
                onClick={() => setEditingField(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] mb-4">
              Override OCR read for <strong>{editingField.label}</strong>. Correcting verified details prevents false deductions during audit.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-[#10243A] block">Corrected Value:</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-[#F5F8FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#10243A] focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                placeholder={`Enter verified ${editingField.label}...`}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#14B8A6] text-white shadow-md transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Correction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-[#DC2626] flex items-center space-x-2 mb-6">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm civic-card-shadow">
        <div className="text-xs text-[#64748B] flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>SetuCheck will execute deterministic name concordance, RBI IFSC validation, and completeness rules.</span>
        </div>

        <button
          onClick={handleExecuteAudit}
          disabled={isAuditing || (!uploadedFiles.length && !extractedDocs.length)}
          className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
            isAuditing || (!uploadedFiles.length && !extractedDocs.length)
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white shadow-[#0D9488]/25'
          }`}
        >
          <FileSearch className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Running Deterministic Audit...' : 'Execute Compliance Audit'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
