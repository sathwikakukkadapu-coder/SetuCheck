import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import ReportPage from './pages/ReportPage';
import AdminPage from './pages/AdminPage';
import { fetchDemoCase, runAudit } from './api/apiClient';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [auditResult, setAuditResult] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleAuditComplete = (result) => {
    setAuditResult(result);
    setActivePage('dashboard');
  };

  const handleDirectDemoRun = async (caseId) => {
    try {
      setIsLoadingDemo(true);
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
      />

      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage 
            onStartAudit={() => setActivePage('workspace')} 
            onLoadDemo={handleDirectDemoRun} 
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

      <Footer />
    </div>
  );
}
