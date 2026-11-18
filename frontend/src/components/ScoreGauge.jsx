import React from 'react';
import { HelpCircle, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function ScoreGauge({ score }) {
  // Score determination: 80+ High, 60-79 Review Recommended, <60 Action Required
  let colorClass = "text-emerald-500 stroke-emerald-500";
  let bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
  let label = "High Application Readiness";
  let Icon = CheckCircle;

  if (score < 60) {
    colorClass = "text-rose-500 stroke-rose-500";
    bgClass = "bg-rose-50 border-rose-200 text-rose-800";
    label = "Action Required (High Rejection Risk)";
    Icon = AlertOctagon;
  } else if (score < 80) {
    colorClass = "text-amber-500 stroke-amber-500";
    bgClass = "bg-amber-50 border-amber-200 text-amber-800";
    label = "Review & Verification Recommended";
    Icon = AlertTriangle;
  }

  // Calculate SVG circumference for 70px radius
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-2xl -z-10 pointer-events-none"></div>

      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Readiness Score</span>
        <div className="group relative cursor-pointer">
          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 transition" />
          <div className="absolute right-0 top-6 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-left leading-normal">
            Calculated by deterministic rules: Deductions are applied for name variance (-12 to -25), invalid IFSC (-25), and missing documents (-25).
          </div>
        </div>
      </div>

      {/* Circular SVG Gauge */}
      <div className="relative w-40 h-40 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Base Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}</span>
          <span className="text-[11px] font-semibold text-slate-400">OUT OF 100</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-3 px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1.5 ${bgClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>

      <p className="mt-3 text-[11px] text-slate-500 max-w-xs leading-relaxed">
        Internal pre-submission concordance indicator. Not an official government rejection probability.
      </p>
    </div>
  );
}
