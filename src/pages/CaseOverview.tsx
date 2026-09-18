import React from 'react';
import {
  FileText,
  Network,
  AlertTriangle,
  UserCheck,
  Upload,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Case, ChangeReport } from '../types';

interface CaseOverviewProps {
  caseData: Case;
  changeReports: ChangeReport[];
  onNavigate: (route: string) => void;
  onOpenUpload: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  caseData,
  changeReports,
  onNavigate,
  onOpenUpload,
}) => {
  const caseId = caseData.id;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-8">
      {/* Case Header Card */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#626B65] font-mono uppercase tracking-wider">
              <span>Case Reference: {caseData.referenceNumber || 'DEMO-882'}</span>
              <span>•</span>
              <span className="text-[#355B4C] font-semibold">Active Investigation</span>
            </div>
            <h1 className="text-2xl font-bold text-[#222824] mt-1 tracking-tight">
              {caseData.name}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#355B4C] hover:bg-[#29483C] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Records</span>
            </button>
            <button
              onClick={() => onNavigate(`/app/cases/${caseId}/network`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] text-xs font-medium transition-colors border border-[#DDDFD7]"
            >
              <Network className="w-3.5 h-3.5 text-[#626B65]" />
              <span>Explore Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#626B65] leading-relaxed max-w-3xl">
          {caseData.description}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#DDDFD7]">
          <div
            onClick={() => onNavigate(`/app/cases/${caseId}/sources`)}
            className="p-3 bg-[#F6F5F1] rounded-md border border-[#DDDFD7] cursor-pointer hover:bg-[#EFEDE7] transition-colors"
          >
            <div className="text-[10px] uppercase font-mono text-[#626B65]">Ingested Sources</div>
            <div className="text-xl font-bold text-[#222824] mt-0.5">{caseData.sourceCount}</div>
            <div className="text-[10px] text-[#355B4C] mt-0.5 font-medium">All Grounded</div>
          </div>

          <div
            onClick={() => onNavigate(`/app/cases/${caseId}/network`)}
            className="p-3 bg-[#F6F5F1] rounded-md border border-[#DDDFD7] cursor-pointer hover:bg-[#EFEDE7] transition-colors"
          >
            <div className="text-[10px] uppercase font-mono text-[#626B65]">Active Entities</div>
            <div className="text-xl font-bold text-[#222824] mt-0.5">{caseData.entityCount}</div>
            <div className="text-[10px] text-[#626B65] mt-0.5">Persons, Orgs, Assets</div>
          </div>

          <div
            onClick={() => onNavigate(`/app/cases/${caseId}/network`)}
            className="p-3 bg-[#F6F5F1] rounded-md border border-[#DDDFD7] cursor-pointer hover:bg-[#EFEDE7] transition-colors"
          >
            <div className="text-[10px] uppercase font-mono text-[#626B65]">Relationships</div>
            <div className="text-xl font-bold text-[#222824] mt-0.5">{caseData.relationshipCount}</div>
            <div className="text-[10px] text-[#626B65] mt-0.5">Verbatim Citations</div>
          </div>

          <div
            onClick={() => onNavigate(`/app/cases/${caseId}/findings`)}
            className="p-3 bg-[#F8F0DE] rounded-md border border-[#865817]/30 cursor-pointer hover:bg-[#F3E7CA] transition-colors"
          >
            <div className="text-[10px] uppercase font-mono text-[#865817] font-semibold">Contradictions</div>
            <div className="text-xl font-bold text-[#865817] mt-0.5">{caseData.contradictionCount}</div>
            <div className="text-[10px] text-[#865817] mt-0.5">Requires Review</div>
          </div>

          <div
            onClick={() => onNavigate(`/app/cases/${caseId}/identities`)}
            className="p-3 bg-[#EFEDE7] rounded-md border border-[#DDDFD7] cursor-pointer hover:bg-[#E3E0D8] transition-colors"
          >
            <div className="text-[10px] uppercase font-mono text-[#626B65]">Candidate Matches</div>
            <div className="text-xl font-bold text-[#222824] mt-0.5">{caseData.unresolvedIdentityCount}</div>
            <div className="text-[10px] text-[#626B65] mt-0.5">Reversible Resolution</div>
          </div>
        </div>
      </div>

      {/* Investigation Priorities & Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flagged Items Alert Box */}
        <div className="bg-white rounded-lg border border-[#DDDFD7] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#865817]" />
              <h3 className="text-sm font-semibold text-[#222824]">Priorities & Discrepancies</h3>
            </div>
            <button
              onClick={() => onNavigate(`/app/cases/${caseId}/findings`)}
              className="text-xs text-[#355B4C] hover:underline font-medium"
            >
              View All Findings
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F8F0DE]/60 rounded border border-[#865817]/20 space-y-1">
              <div className="font-semibold text-[#865817] flex items-center justify-between">
                <span>Vehicle Ownership Conflict (V-7892)</span>
                <span className="text-[10px] font-mono uppercase bg-[#F8F0DE] px-1.5 py-0.2 rounded">Flagged</span>
              </div>
              <p className="text-[#222824] leading-relaxed">
                Elena Rostova claims private ownership during interview, but DMV registry identifies Apex Marine Corp as legal owner.
              </p>
            </div>

            <div className="p-3 bg-[#EFEDE7] rounded border border-[#DDDFD7] space-y-1">
              <div className="font-semibold text-[#222824] flex items-center justify-between">
                <span>Unresolved Entity Duplicate</span>
                <span className="text-[10px] font-mono text-[#626B65]">Candidate Match</span>
              </div>
              <p className="text-[#626B65] leading-relaxed">
                "Arun Patel" (Logistics Director) and "Arun K. Patel" (Customs Broker) share identical phone prefix (+1-555-0144).
              </p>
            </div>
          </div>
        </div>

        {/* Change History Feed */}
        <div className="bg-white rounded-lg border border-[#DDDFD7] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#355B4C]" />
              <h3 className="text-sm font-semibold text-[#222824]">Evidence Ingestion History</h3>
            </div>
            <span className="text-[10px] text-[#626B65] font-mono">Incremental Graph Audits</span>
          </div>

          <div className="space-y-3 text-xs">
            {changeReports.length === 0 ? (
              <div className="text-xs text-[#626B65] italic py-4 text-center">
                Initial baseline loaded. Ingest new sources to see incremental change reports.
              </div>
            ) : (
              changeReports.slice(0, 3).map(cr => (
                <div key={`${cr.sourceId}-${cr.timestamp}`} className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#222824]">{cr.sourceFilename}</span>
                    <span className="font-mono text-[10px] text-[#626B65]">
                      {new Date(cr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#626B65] leading-relaxed text-[11px]">{cr.summaryText}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
