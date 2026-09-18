import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { IdentityCandidate, Entity } from '../types';
import { resolveIdentity, undoIdentityMerge } from '../api';

interface IdentitiesPageProps {
  caseId: string;
  identities: IdentityCandidate[];
  entities: Entity[];
  onRefreshIdentities: () => void;
}

export const IdentitiesPage: React.FC<IdentitiesPageProps> = ({
  caseId,
  identities,
  entities,
  onRefreshIdentities,
}) => {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const handleResolve = async (
    candidateId: string,
    decision: 'confirmed_same' | 'kept_separate' | 'unresolved'
  ) => {
    try {
      const result = await resolveIdentity(caseId, candidateId, decision);
      setActiveMessage(
        result.affectedPathsNotice ||
          `Decision recorded: ${decision.replace('_', ' ')}. Graph updated.`
      );
      onRefreshIdentities();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUndo = async (candidateId: string) => {
    try {
      const result = await undoIdentityMerge(caseId, candidateId);
      setActiveMessage(result.message);
      onRefreshIdentities();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#DDDFD7] shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#222824] tracking-tight">
              Entity Resolution & Identity Review
            </h1>
            <p className="text-xs text-[#626B65] mt-1">
              Review potential duplicate entities before merging. Merges are non-destructive and fully reversible.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#E7EEE9] text-[#29483C] rounded-md text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reversible Resolution Engine</span>
          </div>
        </div>
      </div>

      {activeMessage && (
        <div className="p-3 bg-[#E7EEE9] border border-[#355B4C]/20 text-[#29483C] text-xs rounded-md flex items-center justify-between">
          <span>{activeMessage}</span>
          <button onClick={() => setActiveMessage(null)} className="text-[#355B4C] font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Candidate Matches */}
      <div className="space-y-4">
        {identities.map(candidate => {
          const entA = entities.find(e => e.id === candidate.entityAId);
          const entB = entities.find(e => e.id === candidate.entityBId);

          return (
            <div
              key={candidate.id}
              className="bg-white rounded-lg border border-[#DDDFD7] p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#626B65] uppercase tracking-wider">
                    Candidate Match #{candidate.id}
                  </div>
                  <h3 className="text-sm font-semibold text-[#222824] mt-0.5">
                    {candidate.nameA} ↔ {candidate.nameB}
                  </h3>
                  <div className="text-xs text-[#626B65] mt-1">{candidate.reason}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      candidate.status === 'confirmed_same'
                        ? 'bg-[#E7EEE9] text-[#29483C]'
                        : candidate.status === 'kept_separate'
                        ? 'bg-[#EFEDE7] text-[#626B65]'
                        : 'bg-[#F8F0DE] text-[#865817]'
                    }`}
                  >
                    {candidate.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Side-by-side Attribute Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-2">
                  <div className="font-semibold text-[#222824]">{candidate.nameA}</div>
                  <div className="text-[11px] text-[#626B65] space-y-1">
                    <div>Type: <span className="font-medium text-[#222824] capitalize">{candidate.type}</span></div>
                    {entA && Object.entries(entA.identifiers).map(([k, v]) => (
                      <div key={k}>
                        <span className="capitalize">{k}: </span>
                        <span className="font-mono font-medium text-[#222824]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-2">
                  <div className="font-semibold text-[#222824]">{candidate.nameB}</div>
                  <div className="text-[11px] text-[#626B65] space-y-1">
                    <div>Type: <span className="font-medium text-[#222824] capitalize">{candidate.type}</span></div>
                    {entB && Object.entries(entB.identifiers).map(([k, v]) => (
                      <div key={k}>
                        <span className="capitalize">{k}: </span>
                        <span className="font-mono font-medium text-[#222824]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matching & Conflicting Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#29483C] font-semibold">
                    Matching Shared Attributes
                  </div>
                  <ul className="list-disc pl-4 text-[#626B65] text-[11px] space-y-0.5">
                    {candidate.supportingFields.map((field, i: number) => (
                      <li key={i}>
                        <span className="font-medium">{field.field}:</span> {field.valA}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#865817] font-semibold">
                    Conflicting / Unmatched Fields
                  </div>
                  <ul className="list-disc pl-4 text-[#626B65] text-[11px] space-y-0.5">
                    {candidate.conflictingFields.map((field, i: number) => (
                      <li key={i}>
                        <span className="font-medium">{field.field}:</span> {field.valA} vs {field.valB}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#DDDFD7] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#626B65]">
                  {candidate.status === 'confirmed_same'
                    ? 'Entities merged in visual graph. Relationships unified.'
                    : 'Decision will update multi-hop path calculations.'}
                </span>

                <div className="flex items-center space-x-2">
                  {candidate.status === 'confirmed_same' ? (
                    <button
                      onClick={() => handleUndo(candidate.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded border border-[#DDDFD7] hover:bg-[#EFEDE7] text-[#222824] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Merge</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResolve(candidate.id, 'confirmed_same')}
                        className="px-3 py-1.5 rounded bg-[#355B4C] hover:bg-[#29483C] text-white font-medium transition-colors shadow-xs"
                      >
                        Confirm Same Entity (Merge)
                      </button>
                      <button
                        onClick={() => handleResolve(candidate.id, 'kept_separate')}
                        className="px-3 py-1.5 rounded border border-[#DDDFD7] hover:bg-[#EFEDE7] text-[#222824] transition-colors"
                      >
                        Keep Separate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
