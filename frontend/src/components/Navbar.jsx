import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Menu, 
  X, 
  ArrowRight, 
  Languages, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import SetuCheckLogo from './SetuCheckLogo';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  auditResult, 
  onOpenChat, 
  currentLang = 'en', 
  onLanguageChange 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'workspace', label: 'Upload & Audit' },
    { id: 'dashboard', label: 'Audit Dashboard' },
    { id: 'assistant', label: 'Vernacular Co-Pilot' },
    { id: 'report', label: 'Official Dossier' },
    { id: 'admin', label: 'Admin Rules' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const handleSelectLanguage = (code) => {
    if (onLanguageChange) onLanguageChange(code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#10243A]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Custom Brand Identity */}
          <div 
            className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]" 
            onClick={() => handleNavClick('landing')}
          >
            <SetuCheckLogo size={38} showText={true} subtitle={true} textLight={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#0D9488] text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition"
                title="Select Interface Language"
              >
                <Languages className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span className="uppercase text-[11px] font-bold">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#10243A] border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 text-xs transition ${
                        currentLang === l.code ? 'text-[#2DD4BF] font-bold bg-slate-800/50' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SetuMitra AI Co-Pilot Pill */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#0D9488]/15 hover:bg-[#0D9488]/25 text-[#2DD4BF] border border-[#0D9488]/40 px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
            >
              <Bot className="w-4 h-4 text-[#2DD4BF] animate-pulse" />
              <span className="hidden sm:inline">SetuMitra AI</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNavClick('workspace')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white px-3.5 py-2 rounded-xl shadow-md shadow-[#0D9488]/25 transition active:scale-95"
            >
              <span>{auditResult ? 'New Audit' : 'Start Audit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2 bg-[#10243A]">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#0D9488] text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
