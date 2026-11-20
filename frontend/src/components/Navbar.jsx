import React, { useState } from 'react';
import { 
  Bot, 
  Menu, 
  X, 
  ArrowRight, 
  Languages, 
  Check, 
  ChevronDown
} from 'lucide-react';
import SetuCheckLogo from './SetuCheckLogo';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  auditResult, 
  onOpenChat
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { currentLang, changeLanguage, t, supportedLanguages } = useLanguage();

  const navItems = [
    { id: 'landing', label: t.nav.landing },
    { id: 'workspace', label: t.nav.workspace },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'assistant', label: t.nav.assistant },
    { id: 'report', label: t.nav.report },
    { id: 'admin', label: t.nav.admin },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const handleSelectLanguage = (code) => {
    changeLanguage(code);
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
            <SetuCheckLogo 
              size={38} 
              showText={true} 
              subtitle={true} 
              textLight={true} 
              customSubtitle={t.nav.brandSub}
            />
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
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-800/90 border border-slate-700 hover:border-[#2DD4BF] hover:bg-slate-700 transition shadow-xs"
                title="Select Interface Language"
              >
                <Languages className="w-4 h-4 text-[#2DD4BF]" />
                <span className="uppercase text-xs font-extrabold text-[#2DD4BF]">
                  {supportedLanguages.find(l => l.code === currentLang)?.native || currentLang.toUpperCase()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#10243A] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800 mb-1">
                    Select Language / భాష / भाषा
                  </div>
                  {supportedLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800 text-xs transition ${
                        currentLang === l.code ? 'text-[#2DD4BF] font-extrabold bg-slate-800/70' : 'text-slate-200'
                      }`}
                    >
                      <span className="flex items-center space-x-2.5">
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {currentLang === l.code && <Check className="w-4 h-4 text-[#2DD4BF]" />}
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
              <span className="hidden sm:inline">{t.nav.aiAssistant}</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNavClick('workspace')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold bg-gradient-to-r from-[#0D9488] to-[#2563EB] hover:from-[#14B8A6] hover:to-[#3B82F6] text-white px-3.5 py-2 rounded-xl shadow-md shadow-[#0D9488]/25 transition active:scale-95"
            >
              <span>{auditResult ? t.nav.newAudit : t.nav.startAudit}</span>
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
