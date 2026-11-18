import React from 'react';
import { FileText, Building2, MapPin, Check, X, AlertCircle } from 'lucide-react';

export default function DocumentComparisonView({ documents, findings }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs">
        No documents available for comparison.
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight">Cross-Document Concordance Matrix</h3>
          <p className="text-[11px] text-slate-400">Deterministic multi-document field alignment</p>
        </div>
        <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-mono">
          {documents.length} Dossier Documents
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <th className="py-3 px-4 w-1/4">Field Attribute</th>
              <th className="py-3 px-4 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Identity Proof (Aadhaar)</span>
                </div>
              </th>
              <th className="py-3 px-4 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Bank Passbook</span>
                </div>
              </th>
              <th className="py-3 px-4 w-1/4">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Address Proof</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((f, i) => (
              <tr 
                key={i} 
                className={`transition-colors ${f.hasIssue ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'}`}
              >
                <td className="py-3 px-4 font-semibold text-slate-900">
                  <div className="flex items-center space-x-2">
                    {f.hasIssue ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{f.label}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 break-words">
                  {f.idVal || <span className="text-slate-400 italic">(Missing)</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 break-words">
                  {f.bankVal || <span className="text-slate-400 italic">(Missing)</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 break-words">
                  {f.addrVal || <span className="text-slate-400 italic">(Missing)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
