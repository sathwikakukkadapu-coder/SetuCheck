import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  Languages, 
  FileText, 
  ArrowRight, 
  Activity, 
  Bot, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, auditResult, onOpenChat }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'workspace', label: 'Applicant Workspace' },
    { id: 'dashboard', label: 'Audit Dashboard' },
    { id: 'assistant', label: 'Multilingual Assistant' },
    { id: 'report', label: 'Official Dossier' },
    { id: 'admin', label: 'Admin & Rules' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => handleNavClick('landing')}
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

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* AI Assistant Pill Button */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/80 px-3 py-2 rounded-xl transition shadow-xs hover:scale-105 active:scale-95"
            >
              <Bot className="w-4 h-4 text-teal-400 animate-pulse" />
              <span className="hidden sm:inline">SetuMitra AI</span>
            </button>

            <button
              onClick={() => handleNavClick('workspace')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 font-bold"
            >
              <span>{auditResult ? 'New Audit' : 'Start Audit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold block ${
                activePage === item.id
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
