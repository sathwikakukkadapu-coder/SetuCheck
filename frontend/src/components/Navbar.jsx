import React from 'react';
import { ShieldCheck, FileCheck, Languages, FileText, ArrowRight, Activity } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, auditResult }) {
  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'workspace', label: 'Applicant Workspace' },
    { id: 'dashboard', label: 'Audit Dashboard', disabled: !auditResult },
    { id: 'assistant', label: 'Multilingual Assistant', disabled: !auditResult },
    { id: 'report', label: 'Official Dossier', disabled: !auditResult },
    { id: 'admin', label: 'Admin & Rules' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActivePage('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SETU<span className="text-teal-400">CHECK</span></span>
                <span className="text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Civic Pulse
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Explainable Welfare Document Auditor</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && setActivePage(item.id)}
                  disabled={isDisabled}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-[11px]">Engine Ready</span>
            </div>

            <button
              onClick={() => setActivePage('workspace')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95"
            >
              <span>{auditResult ? 'New Audit' : 'Start Audit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
