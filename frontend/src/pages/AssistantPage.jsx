import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Volume2, 
  VolumeX, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  FileText,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { fetchAssistantExplanation } from '../api/apiClient';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function AssistantPage({ auditResult, onGoToReport }) {
  const [selectedLang, setSelectedLang] = useState('te'); // Default to regional Telugu
  const [assistantData, setAssistantData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function loadGuidance() {
      if (!auditResult) return;
      try {
        setIsLoading(true);
        const data = await fetchAssistantExplanation({
          audit_id: auditResult.audit_id,
          language: selectedLang,
          audit_result: auditResult,
        });
        setAssistantData(data);
      } catch (err) {
        console.error("Failed to load assistant explanation:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuidance();
  }, [auditResult, selectedLang]);

  // Speech Synthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!assistantData) return;

    const speechText = `${assistantData.headline}. ${assistantData.summary}. ` +
      assistantData.step_by_step_guidance.join('. ');

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = selectedLang === 'te' ? 'te-IN' : (selectedLang === 'hi' ? 'hi-IN' : 'en-IN');
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!auditResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Audit Dossier</h2>
        <p className="text-xs text-slate-500">Please run an audit first to generate personalized multilingual guidance.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Language Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-teal-600 font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Module 4: Multilingual Correction Assistant</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Rectification Guidance</h1>
            <p className="text-xs text-slate-500 mt-1">
              Accessible, plain-language explanations in regional Indian languages with masked identifiers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedLang === lang.code
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{lang.native}</span>
                </button>
              ))}
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleToggleSpeech}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isSpeaking
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Generating plain-language guidance in {selectedLang.toUpperCase()}...</p>
        </div>
      ) : assistantData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Guidance Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{assistantData.headline}</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {assistantData.summary}
              </p>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Language: <strong>{assistantData.language_name}</strong></span>
                <span>Explanation Source: <strong className="uppercase">{assistantData.source}</strong></span>
              </div>
            </div>

            {/* Step-by-Step Rectification Instructions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Recommended Rectification Actions</span>
              </h3>

              <div className="space-y-3">
                {assistantData.step_by_step_guidance.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-xl text-xs text-teal-950 flex items-start space-x-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Finding Explanations */}
            {assistantData.finding_explanations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Flagged Discrepancies Explained Simply
                </h3>

                <div className="space-y-4">
                  {assistantData.finding_explanations.map((fe, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border ${
                        fe.severity === 'HIGH' ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">{fe.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          fe.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fe.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mb-2 leading-relaxed">{fe.simple_explanation}</p>
                      <div className="text-[11px] font-semibold text-slate-900 bg-white/80 p-2 rounded border border-slate-200">
                        <span className="text-teal-700 font-bold">Action: </span>
                        {fe.action_step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Checklist Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-teal-600" />
                <span>Pre-Submission Checklist</span>
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Verify each requirement before submitting your final welfare form.
              </p>

              <div className="space-y-3">
                {assistantData.checklist.map((item, idx) => {
                  const isChecked = !!checkedItems[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 text-xs ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={onGoToReport}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition shadow"
                >
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>View Official Audit Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
