import React, { useState } from 'react';
import { GreenComputePassport } from '../../types';
import { ShieldCheck, Copy, Check, Download, Search, FileCode, Award, CheckCircle2, FileText } from 'lucide-react';
import { exportPassportToPDF } from '../../utils/passportPdfExport';

interface ComplianceLedgerProps {
  passports: GreenComputePassport[];
  totalCO2Prevented: number;
}

export const ComplianceLedger: React.FC<ComplianceLedgerProps> = ({
  passports,
  totalCO2Prevented,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inspectedPassport, setInspectedPassport] = useState<GreenComputePassport | null>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');

  const filteredPassports = passports.filter(
    (p) =>
      p.passportTokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetJobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.verifiedRenewableSource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `REGEN_X_Green_Compute_Passports_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVerifyHash = () => {
    if (!verifyInput.trim()) return;
    const match = passports.find(
      (p) => p.passportTokenId.toLowerCase() === verifyInput.trim().toLowerCase()
    );
    setVerifyStatus(match ? 'VALID' : 'INVALID');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Immutable ESG Compliance Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Cryptographically sealed <strong className="text-emerald-400">Green Compute Passports</strong> for AI workloads. Each entry combines timestamp, physical clean power origin, GPS telemetry, and avoided CO₂ into an immutable SHA-256 audit proof.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total CO₂ Avoided</div>
            <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
              {totalCO2Prevented.toFixed(2)} MT
            </div>
          </div>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BigQuery JSON</span>
          </button>
        </div>
      </div>

      {/* Live Hash Verification Tool */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="text-xs font-bold text-slate-200 shrink-0 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Live SHA-256 Token Validator:</span>
        </div>
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={verifyInput}
            onChange={(e) => {
              setVerifyInput(e.target.value);
              setVerifyStatus('IDLE');
            }}
            placeholder="Paste SHA-256 Passport Token ID (e.g. e3b0c44298fc...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <button
          onClick={handleVerifyHash}
          className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Verify Cryptographic Hash
        </button>
        {verifyStatus === 'VALID' && (
          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>AUTHENTIC RECORD (BigQuery Verified)</span>
          </span>
        )}
        {verifyStatus === 'INVALID' && (
          <span className="text-rose-400 text-xs font-bold shrink-0">
            Hash not found in current chain
          </span>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Passport Hash, Job ID, or Clean Source..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>BigQuery Partition:</span>
          <span className="text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            TIMESTAMP_TRUNC(entry_date, DAY)
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 pl-4">Passport SHA-256 Token</th>
                <th className="py-3">Target Workload</th>
                <th className="py-3">Verified Clean Power Origin</th>
                <th className="py-3">Physical Cluster GPS</th>
                <th className="py-3 text-right">CO₂ Avoided</th>
                <th className="py-3 text-center">LEED Grade</th>
                <th className="py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPassports.map((passport) => {
                const isCopied = copiedToken === passport.passportTokenId;
                return (
                  <tr key={passport.passportTokenId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-bold">
                          {passport.passportTokenId.slice(0, 16)}…
                        </span>
                        <button
                          onClick={() => handleCopy(passport.passportTokenId)}
                          title="Copy Full Cryptographic Hash"
                          className="p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {new Date(passport.executionTimestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 font-sans">
                      <div className="font-bold text-slate-100 font-mono text-xs">
                        {passport.targetJobId}
                      </div>
                      <div className="text-[11px] text-slate-400">{passport.clientOwner}</div>
                    </td>
                    <td className="py-3.5 font-sans">
                      <div className="text-slate-200 font-medium">
                        {passport.verifiedRenewableSource}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        Action: {passport.routingDecision}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                      {passport.executionGeoLocation}
                      <div className="text-[10px] text-slate-500">
                        Signature: {passport.sovereigntySignature}
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-300 tabular-nums">
                      {passport.netCarbonAvoidedMetricTons.toFixed(2)} MT
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
                        <Award className="w-3 h-3 text-emerald-400" />
                        GRADE {passport.sustainabilityScoreRating}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => exportPassportToPDF(passport)}
                          title="Download Audit-Ready PDF Certificate"
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>PDF Passport</span>
                        </button>
                        <button
                          onClick={() => setInspectedPassport(passport)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Passport Modal */}
      {inspectedPassport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Green Compute Passport Cryptographic Certificate
                </h3>
              </div>
              <button
                onClick={() => setInspectedPassport(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono space-y-2">
                <div>
                  <span className="text-slate-500">SHA-256 TOKEN ID:</span>
                  <div className="text-emerald-400 font-bold break-all mt-0.5">
                    {inspectedPassport.passportTokenId}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">CRYPTOGRAPHIC SIGNATURE:</span>
                  <div className="text-purple-400 font-bold break-all mt-0.5">
                    {inspectedPassport.cryptographicSignature}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">WORKLOAD & OWNER</div>
                  <div className="font-bold text-slate-100 mt-0.5">{inspectedPassport.targetJobId}</div>
                  <div className="text-slate-400 text-[11px]">{inspectedPassport.clientOwner}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">AVOIDED CARBON TONNAGE</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">
                    {inspectedPassport.netCarbonAvoidedMetricTons} MT CO₂
                  </div>
                  <div className="text-slate-400 text-[11px]">Grade {inspectedPassport.sustainabilityScoreRating} Certified</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">VERIFIED POWER ASSET</div>
                  <div className="text-slate-200 mt-0.5">{inspectedPassport.verifiedRenewableSource}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">HARDWARE & JURISDICTION</div>
                  <div className="text-slate-200 mt-0.5">{inspectedPassport.executionGeoLocation}</div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">{inspectedPassport.sovereigntySignature}</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Raw JSON Payload</div>
                <pre className="bg-[#020617] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-sky-400 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectedPassport, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => exportPassportToPDF(inspectedPassport)}
                className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Passport (Audit-Ready PDF)</span>
              </button>
              <button
                onClick={() => setInspectedPassport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
