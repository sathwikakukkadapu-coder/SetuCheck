import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import ReportPage from './pages/ReportPage';
import AdminPage from './pages/AdminPage';
import SetuMitraChat from './components/SetuMitraChat';
import { fetchDemoCase, runAudit } from './api/apiClient';
import { Sparkles, Play, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const DEMO_BUTTONS = [
  { id: 'case-1-perfect-match', label: 'Case 1: 100% Match', score: '100', color: 'emerald' },
  { id: 'case-2-name-mismatch', label: 'Case 2: Name Mismatch', score: '84', color: 'amber' },
  { id: 'case-3-invalid-ifsc', label: 'Case 3: Invalid IFSC', score: '63', color: 'rose' },
  { id: 'case-4-missing-passbook', label: 'Case 4: Missing Proof', score: '48', color: 'rose' },
  { id: 'case-5-multiple-mismatches', label: 'Case 5: Multi-Error', score: '50', color: 'purple' },
];

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [auditResult, setAuditResult] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState('case-2-name-mismatch');

  // Pre-load default audit case so ALL navbar tabs are interactive and populated immediately
  useEffect(() => {
    async function preloadInitialCase() {
      try {
        const demoCase = await fetchDemoCase('case-2-name-mismatch');
        const result = await runAudit({
          scheme: 'pension',
          pre_extracted: demoCase.documents,
        });
        setAuditResult(result);
      } catch (err) {
        console.warn("Could not preload demo audit:", err);
      }
    }
    preloadInitialCase();
  }, []);

  const handleAuditComplete = (result) => {
    setAuditResult(result);
    setActivePage('dashboard');
  };

  const handleDirectDemoRun = async (caseId) => {
    try {
      setIsLoadingDemo(true);
      setActiveCaseId(caseId);
      const demoCase = await fetchDemoCase(caseId);
      const result = await runAudit({
        scheme: 'pension',
        pre_extracted: demoCase.documents,
      });
      setAuditResult(result);
      setActivePage('dashboard');
    } catch (err) {
      console.error("Direct demo run error:", err);
      setActivePage('workspace');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        auditResult={auditResult} 
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* 1-Click Judges Test Scenario Switcher Bar (Visible on Audit, Assistant, Report pages) */}
      {['dashboard', 'assistant', 'report', 'workspace'].includes(activePage) && (
        <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider text-teal-400">Judges Demo Switcher:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {DEMO_BUTTONS.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleDirectDemoRun(btn.id)}
                  disabled={isLoadingDemo}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    activeCaseId === btn.id
                      ? 'bg-teal-500 text-slate-950 shadow-sm ring-1 ring-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{btn.label}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    btn.color === 'emerald' ? 'bg-emerald-950 text-emerald-300' :
                    btn.color === 'amber' ? 'bg-amber-950 text-amber-300' :
                    btn.color === 'rose' ? 'bg-rose-950 text-rose-300' :
                    'bg-purple-950 text-purple-300'
                  }`}>
                    {btn.score}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage 
            onStartAudit={() => setActivePage('workspace')} 
            onLoadDemo={handleDirectDemoRun} 
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {activePage === 'workspace' && (
          <WorkspacePage 
            onAuditComplete={handleAuditComplete} 
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage 
            auditResult={auditResult} 
            onGoToAssistant={() => setActivePage('assistant')} 
            onGoToReport={() => setActivePage('report')} 
          />
        )}

        {activePage === 'assistant' && (
          <AssistantPage 
            auditResult={auditResult} 
            onGoToReport={() => setActivePage('report')} 
          />
        )}

        {activePage === 'report' && (
          <ReportPage 
            auditResult={auditResult} 
            onBackToDashboard={() => setActivePage('dashboard')} 
          />
        )}

        {activePage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Global SetuMitra Interactive AI Co-Pilot Widget */}
      <SetuMitraChat 
        auditResult={auditResult} 
        isOpen={isChatOpen} 
        onToggle={setIsChatOpen} 
      />

      <Footer />
    </div>
  );
}
