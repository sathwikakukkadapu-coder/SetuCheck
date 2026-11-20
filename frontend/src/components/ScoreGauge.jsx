import React from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function ScoreGauge({ score }) {
  // Score determination: 80+ High, 60-79 Review Recommended, <60 Action Required
  let colorStroke = "#10B981"; // Emerald
  let bgBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let label = "High Application Readiness";
  let explanation = "Strong cross-document concordance. High probability of administrative acceptance.";
  let Icon = CheckCircle2;

  if (score < 60) {
    colorStroke = "#EF4444"; // Rose/Red
    bgBadge = "bg-rose-50 text-rose-800 border-rose-200";
    label = "Action Required (High Rejection Risk)";
    explanation = "Critical discrepancies detected (e.g., missing mandatory documents or invalid IFSC) that will cause rejection.";
    Icon = AlertOctagon;
  } else if (score < 80) {
    colorStroke = "#F59E0B"; // Amber
    bgBadge = "bg-amber-50 text-amber-800 border-amber-200";
    label = "Review & Verification Recommended";
    explanation = "Minor name variation or initial abbreviation detected. CSC operator verification or standard affidavit suggested.";
    Icon = AlertTriangle;
  }

  // Calculate SVG circumference for 64px radius
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden civic-card-shadow">
      
      {/* Background soft ambient glow */}
      <div 
        className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: colorStroke }}
      ></div>

      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#10243A]">
          Overall Readiness Score
        </span>
        <div className="group relative cursor-pointer">
          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 transition" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-[#10243A] text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-left leading-relaxed">
            Deterministic 4-category rubric: Completeness (/30), Consistency (/30), Format Validation (/20), OCR Quality (/20).
          </div>
        </div>
      </div>

      {/* Circular SVG Gauge */}
      <div className="relative w-44 h-44 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Base track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#EEF2F6"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated progress arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colorStroke}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-[#10243A] tracking-tight">{score}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">OUT OF 100</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-2 px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${bgBadge}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>

      <p className="mt-3 text-xs text-[#64748B] max-w-xs leading-relaxed">
        {explanation}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3" />
        <span>Statutory pre-submission indicator. Not an official government rejection.</span>
      </div>
    </div>
  );
}
