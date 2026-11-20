import React from 'react';
import { Lock, Info, CheckCircle2 } from 'lucide-react';
import SetuCheckLogo from './SetuCheckLogo';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="bg-[#10243A] border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          <div>
            <div className="mb-3">
              <SetuCheckLogo size={32} showText={true} subtitle={false} textLight={true} />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              {f.desc}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-xs mb-3">
              <Lock className="w-4 h-4 text-[#2DD4BF]" />
              <span>{f.privacyTitle}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>{f.assurance1}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>{f.assurance2}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span>{f.assurance3}</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-3">
              <Info className="w-4 h-4" />
              <span>{f.noticeTitle}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {f.noticeDesc}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>{f.copyright}</p>
          <div className="flex items-center space-x-4">
            <span className="text-[#2DD4BF] font-mono">v1.0.0-PROD</span>
            <span>FastAPI &bull; PyMuPDF &bull; React &bull; RapidFuzz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
