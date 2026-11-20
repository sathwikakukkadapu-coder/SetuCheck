import React from 'react';

export default function SetuCheckLogo({ 
  size = 36, 
  showText = true, 
  subtitle = true, 
  textLight = false,
  customSubtitle = null 
}) {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Custom Setu (Bridge) + Shield Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[#10243A] via-[#1E3A5F] to-[#0D9488] p-0.5 shadow-md shadow-[#0D9488]/20 ring-1 ring-white/10"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Outer Shield Outline */}
          <path 
            d="M24 4L8 10V22C8 32 15 41 24 44C33 41 40 32 40 22V10L24 4Z" 
            fill="url(#shieldGrad)" 
            stroke="#2DD4BF" 
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Setu (Bridge) Arcs connecting Citizens to Welfare */}
          <path 
            d="M13 28C16 22 32 22 35 28" 
            stroke="#F5F8FC" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeDasharray="1 0"
          />
          <path 
            d="M16 32C19 27 29 27 32 32" 
            stroke="#5EEAD4" 
            strokeWidth="1.75" 
            strokeLinecap="round"
          />

          {/* Central Verification Checkmark */}
          <path 
            d="M19 18L23 22L30 14" 
            stroke="#2DD4BF" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Subtle bridge suspension pillars */}
          <line x1="20" y1="24" x2="20" y2="29" stroke="#99F6E4" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="23" x2="24" y2="28" stroke="#99F6E4" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="28" y1="24" x2="28" y2="29" stroke="#99F6E4" strokeWidth="1.2" strokeLinecap="round" />

          <defs>
            <linearGradient id="shieldGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10243A" />
              <stop offset="0.6" stopColor="#172B4D" />
              <stop offset="1" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 leading-none">
            <span className={`text-xl font-black tracking-tight ${textLight ? 'text-white' : 'text-[#10243A]'}`}>
              SETU<span className="text-[#0D9488]">CHECK</span>
            </span>
            <span className="text-[9px] font-bold bg-[#0D9488]/15 text-[#0D9488] px-1.5 py-0.5 rounded-full border border-[#0D9488]/30 uppercase tracking-widest">
              GovTech
            </span>
          </div>
          {subtitle && (
            <span className={`text-[10px] font-medium tracking-wide mt-1 line-clamp-1 ${textLight ? 'text-slate-300' : 'text-[#64748B]'}`}>
              {customSubtitle || "Explainable Welfare Document Auditor"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
