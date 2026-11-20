import React from 'react';
import { Shield, Building2, FileText, CheckCircle2, AlertTriangle, AlertCircle, QrCode, Stamp } from 'lucide-react';

export function AadhaarMockup({ name = "Ramesh Kumar", dob = "14/06/1962", address = "Plot 42, Gandhi Nagar, Guntur - 522002", isHighlighted = false }) {
  return (
    <div className={`relative bg-gradient-to-b from-amber-50/80 via-white to-emerald-50/60 rounded-2xl border-2 ${isHighlighted ? 'border-amber-400 shadow-lg shadow-amber-500/10' : 'border-slate-300 shadow-md'} p-4 w-full max-w-sm overflow-hidden text-slate-800 font-sans transition-all hover:scale-[1.01]`}>
      {/* Tricolor top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-600/10 flex items-center justify-center text-amber-700">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900 leading-none">Government of India</div>
            <div className="text-[8px] text-slate-500 font-medium">భారత ప్రభుత్వం &bull; Unique Identification Authority</div>
          </div>
        </div>
        <div className="text-[9px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200">
          Aadhaar
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3 items-start">
        {/* Photo Box */}
        <div className="w-16 h-20 bg-slate-200 rounded-lg border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-300 mb-1"></div>
          <div className="w-12 h-6 rounded-t-full bg-slate-300"></div>
          <span className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-[7px] text-white text-center py-0.5 font-bold">VERIFIED</span>
        </div>

        {/* Details */}
        <div className="space-y-1 text-xs flex-1">
          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Citizen Name</span>
            <span className="font-extrabold text-slate-900 text-sm block leading-tight">{name}</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] pt-0.5">
            <div>
              <span className="text-[8px] text-slate-400 block font-semibold">DOB</span>
              <span className="font-bold text-slate-800">{dob}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 block font-semibold">Gender</span>
              <span className="font-bold text-slate-800">Male / పురుషుడు</span>
            </div>
          </div>

          <div className="pt-0.5">
            <span className="text-[8px] text-slate-400 block font-semibold">Address</span>
            <span className="text-[9px] text-slate-700 line-clamp-2 leading-tight">{address}</span>
          </div>
        </div>
      </div>

      {/* Footer Aadhaar Number & Hologram */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="font-mono font-black text-slate-900 tracking-widest text-xs">
          XXXX XXXX 1984
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Valid Identity Proof</span>
        </div>
      </div>
    </div>
  );
}

export function BankPassbookMockup({ holderName = "Ramesh Kumer", ifsc = "SBIN0001234", accNo = "30491827364", mismatchHighlight = true }) {
  return (
    <div className={`relative bg-gradient-to-b from-sky-50 via-white to-slate-50 rounded-2xl border-2 ${mismatchHighlight ? 'border-amber-400 shadow-lg shadow-amber-500/10' : 'border-slate-300 shadow-md'} p-4 w-full max-w-sm overflow-hidden text-slate-800 font-sans transition-all hover:scale-[1.01]`}>
      {/* Blue top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-800"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-100 pb-2 mb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SBI
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-blue-900 leading-none">State Bank of India</div>
            <div className="text-[8px] text-slate-500">Guntur Main Branch (001234)</div>
          </div>
        </div>
        <span className="text-[9px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
          Savings Passbook
        </span>
      </div>

      {/* Account Info Table */}
      <div className="space-y-2 text-xs">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] font-bold uppercase text-slate-400">Account Holder Name</span>
            {mismatchHighlight && (
              <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Spelling Discrepancy
              </span>
            )}
          </div>
          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
            <span>{holderName}</span>
            {mismatchHighlight && (
              <span className="text-[9px] text-rose-600 font-mono underline decoration-wavy">(differs from Aadhaar)</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">A/C Number</span>
            <span className="font-mono font-bold text-slate-900 text-xs">XXXXXXX{accNo.slice(-4)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">IFSC Code</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{ifsc}</span>
          </div>
        </div>
      </div>

      {/* Bank Stamp Seal */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[9px] text-slate-500">
          <Stamp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Core Banking Verified</span>
        </div>
        <div className="w-14 h-6 border-2 border-dashed border-indigo-400/80 rounded flex items-center justify-center text-[7px] text-indigo-700 font-extrabold uppercase rotate-[-3deg]">
          SBI GUNTUR
        </div>
      </div>
    </div>
  );
}

export function UtilityBillMockup({ consumerName = "Ramesh Kumar", address = "Plot 42, Gandhi Nagar, Guntur, AP 522002" }) {
  return (
    <div className="relative bg-gradient-to-b from-teal-50/70 via-white to-slate-50 rounded-2xl border-2 border-slate-300 shadow-md p-4 w-full max-w-sm overflow-hidden text-slate-800 font-sans transition-all hover:scale-[1.01]">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600"></div>

      <div className="flex items-center justify-between border-b border-teal-100 pb-2 mb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ⚡
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-teal-950 leading-none">APCPDCL Power Bill</div>
            <div className="text-[8px] text-slate-500">Andhra Pradesh Central Power Dist.</div>
          </div>
        </div>
        <span className="text-[9px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
          Utility Proof
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Consumer Name</span>
          <span className="font-extrabold text-slate-900 text-sm">{consumerName}</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Service Address</span>
          <span className="text-[10px] text-slate-700 line-clamp-2 leading-tight">{address}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[9px] font-mono text-slate-400">PIN: 522002 &bull; Guntur</span>
        <span className="text-[8px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
          Valid Address Proof
        </span>
      </div>
    </div>
  );
}
