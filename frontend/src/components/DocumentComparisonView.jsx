import React from 'react';
import { 
  FileText, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function DocumentComparisonView({ documents, findings }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs civic-card-shadow">
        No documents available for cross-comparison.
      </div>
    );
  }

  // Find documents by type
  const idDoc = documents.find(d => d.document_type === 'identity');
  const bankDoc = documents.find(d => d.document_type === 'bank_passbook');
  const addrDoc = documents.find(d => d.document_type === 'address_proof');

  // Compare key fields
  const fields = [
    {
      label: "Applicant / Account Name",
      idVal: idDoc?.name?.value || null,
      bankVal: bankDoc?.name?.value || null,
      addrVal: addrDoc?.name?.value || null,
      hasIssue: findings?.some(f => f.field_name.toLowerCase().includes('name') && f.severity !== 'PASSED')
    },
    {
      label: "Date of Birth (DOB)",
      idVal: idDoc?.dob?.value || null,
      bankVal: bankDoc?.dob?.value || '(N/A in Passbook)',
      addrVal: addrDoc?.dob?.value || '(N/A in Address Proof)',
      hasIssue: findings?.some(f => f.field_name.toLowerCase().includes('dob') && f.severity !== 'PASSED')
    },
    {
      label: "Bank Account Number",
      idVal: "(N/A in Aadhaar)",
      bankVal: bankDoc?.bank_account_no?.value ? `•••• •••• ${bankDoc.bank_account_no.value.slice(-4)}` : null,
      addrVal: "(N/A in Address Proof)",
      hasIssue: findings?.some(f => f.field_name.toLowerCase().includes('account') && f.severity !== 'PASSED')
    },
    {
      label: "Bank IFSC Code",
      idVal: "(N/A in Aadhaar)",
      bankVal: bankDoc?.ifsc_code?.value || null,
      addrVal: "(N/A in Address Proof)",
      hasIssue: findings?.some(f => f.field_name.toLowerCase().includes('ifsc') && f.severity !== 'PASSED')
    },
    {
      label: "Bank Branch Name",
      idVal: "(N/A in Aadhaar)",
      bankVal: bankDoc?.bank_name?.value || null,
      addrVal: "(N/A in Address Proof)",
      hasIssue: false
    },
    {
      label: "Residential Address",
      idVal: idDoc?.address?.value || null,
      bankVal: bankDoc?.address?.value || '(Not specified on front folio)',
      addrVal: addrDoc?.address?.value || null,
      hasIssue: findings?.some(f => f.field_name.toLowerCase().includes('address') && f.severity !== 'PASSED')
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm civic-card-shadow">
      <div className="px-6 py-4 bg-[#10243A] border-b border-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
          <div>
            <h3 className="font-bold text-sm tracking-tight">Cross-Document Concordance Matrix</h3>
            <p className="text-[11px] text-slate-400">Multi-document deterministic field alignment</p>
          </div>
        </div>
        <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-mono">
          {documents.length} Staged Documents
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F5F8FC] text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-5 w-1/4">Field Attribute</th>
              <th className="py-3.5 px-5 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>1. Identity (Aadhaar)</span>
                </div>
              </th>
              <th className="py-3.5 px-5 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>2. Bank Passbook</span>
                </div>
              </th>
              <th className="py-3.5 px-5 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>3. Address Proof</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((f, i) => (
              <tr key={i} className={`hover:bg-slate-50/80 transition ${f.hasIssue ? 'bg-amber-50/20' : ''}`}>
                <td className="py-3.5 px-5 font-bold text-[#10243A]">
                  <div className="flex items-center space-x-2">
                    {f.hasIssue ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    )}
                    <span>{f.label}</span>
                  </div>
                </td>
                
                <td className="py-3.5 px-5 font-mono text-slate-700">
                  {f.idVal || <span className="text-slate-400 italic">Not extracted</span>}
                </td>

                <td className="py-3.5 px-5 font-mono text-slate-700">
                  {f.bankVal || <span className="text-slate-400 italic">Not extracted</span>}
                </td>

                <td className="py-3.5 px-5 font-mono text-slate-700">
                  {f.addrVal || <span className="text-slate-400 italic">Not extracted</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
