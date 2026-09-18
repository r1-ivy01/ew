import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Save,
  CheckCircle2,
  Shield,
  Clock,
  Building,
  User,
} from 'lucide-react';
import { InvestigationBrief, Case } from '../types';
import { updateBrief } from '../api';

interface BriefPageProps {
  caseData: Case;
  brief: InvestigationBrief;
  onRefreshBrief: () => void;
}

export const BriefPage: React.FC<BriefPageProps> = ({ caseData, brief, onRefreshBrief }) => {
  const [overview, setOverview] = useState(brief.overview || '');
  const [verificationSteps, setVerificationSteps] = useState((brief.verificationSteps || []).join('\n'));
  const [conclusion, setConclusion] = useState(brief.conclusion || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBrief(caseData.id, {
        overview,
        verificationSteps: verificationSteps.split('\n').filter((s: string) => s.trim()),
        conclusion,
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
      onRefreshBrief();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-6 print:p-0 print:bg-white">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#DDDFD7] shadow-2xs print:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-[#355B4C] flex items-center justify-center text-white font-bold text-xs">
            TR
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#222824]">Investigation Brief Report</h2>
            <p className="text-[11px] text-[#626B65]">Formatted for supervisory review and court record filing</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] text-xs font-medium border border-[#DDDFD7] transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? 'Saved!' : 'Save Edits'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#355B4C] hover:bg-[#29483C] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Document Paper Card */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-lg border border-[#DDDFD7] shadow-md space-y-8 print:border-none print:shadow-none print:p-6 print:max-w-none">
        {/* Document Header */}
        <div className="border-b-2 border-[#222824] pb-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#626B65]">
            <span className="font-bold text-[#222824] uppercase tracking-wider">
              TASK FORCE HUNTER • EVIDENCE INTELLIGENCE BRIEF
            </span>
            <span className="border border-[#DDDFD7] px-2 py-0.5 rounded text-[10px]">
              RESTRICTED // FOR OFFICIAL USE ONLY
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#222824] tracking-tight">{brief.title}</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-[#626B65] font-mono">
            <div>Case Ref: <span className="text-[#222824] font-semibold">{caseData.referenceNumber || 'DEMO-882'}</span></div>
            <div>Generated: <span className="text-[#222824]">{new Date(brief.generatedAt).toLocaleDateString()}</span></div>
            <div>Revision: <span className="text-[#222824]">{brief.caseRevision}</span></div>
            <div>Confidence: <span className="text-[#355B4C] font-semibold">High (Multi-Sourced)</span></div>
          </div>
        </div>

        {/* Executive Summary / Overview */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            1. Executive Summary
          </h3>
          <textarea
            value={overview}
            onChange={e => setOverview(e.target.value)}
            rows={4}
            className="w-full text-xs text-[#222824] leading-relaxed p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] focus:bg-white focus:outline-none print:bg-white print:border-none print:p-0 print:resize-none"
          />
        </div>

        {/* Sources Considered */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            2. Evidentiary Sources Ingested
          </h3>
          <div className="border border-[#DDDFD7] rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EFEDE7] text-[#222824] border-b border-[#DDDFD7]">
                <tr>
                  <th className="p-2 font-semibold">Source Filename</th>
                  <th className="p-2 font-semibold">Format</th>
                  <th className="p-2 font-semibold">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDFD7]">
                {brief.sourcesConsidered.map((src, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-semibold text-[#222824]">{src.filename}</td>
                    <td className="p-2 uppercase font-mono text-[10px] text-[#626B65]">{src.type}</td>
                    <td className="p-2 font-mono text-[11px] text-[#626B65]">{src.dateAdded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Primary Target Entities Identified */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            3. Core Entities & Subjects of Interest
          </h3>
          <div className="border border-[#DDDFD7] rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#EFEDE7] text-[#222824] border-b border-[#DDDFD7]">
                <tr>
                  <th className="p-2 font-semibold">Entity Name</th>
                  <th className="p-2 font-semibold">Type</th>
                  <th className="p-2 font-semibold">Identified Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDFD7]">
                {brief.keyEntities.map((ent, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-semibold text-[#222824]">{ent.name}</td>
                    <td className="p-2 capitalize text-[#626B65]">{ent.type}</td>
                    <td className="p-2 text-[#222824]">{ent.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Established Evidentiary Connections */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            4. Evidentiary Connections & Multi-Hop Findings
          </h3>
          <div className="space-y-2">
            {brief.selectedConnections.map((conn, idx: number) => (
              <div key={idx} className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#222824]">{conn.from} → {conn.to}</span>
                  <span className="text-[10px] font-mono uppercase bg-[#E7EEE9] text-[#29483C] px-2 py-0.5 rounded">
                    {conn.relation}
                  </span>
                </div>
                <div className="text-[11px] text-[#626B65] italic">
                  "{conn.evidence}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Contradictions */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            5. Evidentiary Contradictions & Discrepancies
          </h3>
          <div className="space-y-2">
            {brief.contradictions.map((c, idx: number) => (
              <div key={idx} className="p-3 bg-[#F8F0DE]/60 rounded border border-[#865817]/20 space-y-1 text-xs">
                <div className="font-semibold text-[#865817]">{c.title}</div>
                <p className="text-[#222824] leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            6. Recommended Investigative Actions
          </h3>
          <textarea
            value={verificationSteps}
            onChange={e => setVerificationSteps(e.target.value)}
            rows={4}
            className="w-full text-xs text-[#222824] leading-relaxed p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] focus:bg-white focus:outline-none print:bg-white print:border-none print:p-0 print:resize-none font-mono"
          />
        </div>

        {/* Conclusion */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#222824] uppercase tracking-wider">
            7. Investigative Conclusion
          </h3>
          <textarea
            value={conclusion}
            onChange={e => setConclusion(e.target.value)}
            rows={3}
            className="w-full text-xs text-[#222824] leading-relaxed p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] focus:bg-white focus:outline-none print:bg-white print:border-none print:p-0 print:resize-none"
          />
        </div>

        {/* Signature Box */}
        <div className="pt-6 border-t border-[#DDDFD7] flex items-center justify-between text-xs text-[#626B65] font-mono">
          <div>Report Generated: Task Force Hunter Workspace</div>
          <div>Supervisory Clearance: _______________________</div>
        </div>
      </div>
    </div>
  );
};
