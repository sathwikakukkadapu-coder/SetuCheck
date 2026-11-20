import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'తెలుగు (Telugu)', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी (Hindi)', native: 'हिन्दी', flag: '🇮🇳' },
];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem('setucheck_lang');
      if (saved && ['en', 'te', 'hi'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
    return 'en';
  });

  const changeLanguage = (langCode) => {
    if (['en', 'te', 'hi'].includes(langCode)) {
      setCurrentLang(langCode);
      try {
        localStorage.setItem('setucheck_lang', langCode);
      } catch (e) {
        // Ignore localStorage write errors
      }
    }
  };

  const t = translations[currentLang] || translations.en;

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
