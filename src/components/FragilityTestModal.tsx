import React, { useState } from 'react';
import {
  X,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Entity, Relationship, PathTestResult } from '../types';
import { testConnection } from '../api';

interface FragilityTestModalProps {
  caseId: string;
  entities: Entity[];
  relationships: Relationship[];
  isOpen: boolean;
  onClose: () => void;
}

export const FragilityTestModal: React.FC<FragilityTestModalProps> = ({
  caseId,
  entities,
  relationships,
  isOpen,
  onClose,
}) => {
  const activeEntities = entities.filter(e => !e.mergedInto);

  const [sourceId, setSourceId] = useState<string>(activeEntities[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(activeEntities[1]?.id || '');
  const [testResult, setTestResult] = useState<PathTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Exclusion options
  const [exclusionType, setExclusionType] = useState<'none' | 'relationship' | 'identity'>('none');
  const [excludedRelId, setExcludedRelId] = useState<string>('');

  if (!isOpen) return null;

  const handleRunTest = async (overrideExclusion?: any) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setIsLoading(true);
    try {
      let exclusionParam: any = undefined;

      if (overrideExclusion) {
        exclusionParam = overrideExclusion;
      } else if (exclusionType === 'relationship' && excludedRelId) {
        const rel = relationships.find(r => r.id === excludedRelId);
        exclusionParam = {
          type: 'relationship',
          id: excludedRelId,
          label: rel ? `"${rel.label}"` : 'Selected Relationship',
        };
      } else if (exclusionType === 'identity') {
        exclusionParam = {
          type: 'identity_match',
          id: 'id-cand-01',
          label: 'Unresolved match: Arun Patel == Arun K. Patel',
        };
      }

      const result = await testConnection(caseId, sourceId, targetId, exclusionParam);
      setTestResult(result);
    } catch (err: any) {
      console.error('Fragility test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#DDDFD7] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#DDDFD7] flex items-center justify-between bg-[#F6F5F1]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#355B4C] flex items-center justify-center text-white">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#222824]">Path Search & Fragility Testing</h3>
              <p className="text-[11px] text-[#626B65]">Test whether connections survive if an assumption is removed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 border-b border-[#DDDFD7] space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#222824] mb-1">Source Entity</label>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded-md px-3 py-2 text-[#222824] focus:outline-none focus:border-[#355B4C]"
              >
                {activeEntities.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.canonicalName} ({e.entityType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#222824] mb-1">Target Entity</label>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded-md px-3 py-2 text-[#222824] focus:outline-none focus:border-[#355B4C]"
              >
                {activeEntities.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.canonicalName} ({e.entityType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fragility Simulation Dropdown */}
          <div className="p-3 bg-[#EFEDE7]/60 rounded-md border border-[#DDDFD7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#222824] flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#865817]" />
                <span>Simulate Exclusion (Stress-Test Reliability)</span>
              </span>
              <span className="text-[10px] text-[#626B65]">Does not mutate case data</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setExclusionType('none');
                  setExcludedRelId('');
                }}
                className={`px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors ${
                  exclusionType === 'none'
                    ? 'bg-[#E7EEE9] border-[#355B4C] text-[#29483C]'
                    : 'bg-white border-[#DDDFD7] text-[#626B65]'
                }`}
              >
                Baseline (Full Evidence)
              </button>

              <button
                type="button"
                onClick={() => setExclusionType('relationship')}
                className={`px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors ${
                  exclusionType === 'relationship'
                    ? 'bg-[#E7EEE9] border-[#355B4C] text-[#29483C]'
                    : 'bg-white border-[#DDDFD7] text-[#626B65]'
                }`}
              >
                Exclude a Relationship
              </button>

              <button
                type="button"
                onClick={() => setExclusionType('identity')}
                className={`px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors ${
                  exclusionType === 'identity'
                    ? 'bg-[#E7EEE9] border-[#355B4C] text-[#29483C]'
                    : 'bg-white border-[#DDDFD7] text-[#626B65]'
                }`}
              >
                Exclude Identity Merge
              </button>
            </div>

            {exclusionType === 'relationship' && (
              <div className="pt-2">
                <label className="block text-[11px] text-[#626B65] mb-1">Select Relationship to Exclude:</label>
                <select
                  value={excludedRelId}
                  onChange={e => setExcludedRelId(e.target.value)}
                  className="w-full text-xs bg-white border border-[#DDDFD7] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">Choose a relationship...</option>
                  {relationships.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.evidenceReferences[0]?.sourceFilename || 'Source'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={() => handleRunTest()}
            disabled={isLoading || sourceId === targetId}
            className="w-full py-2 bg-[#355B4C] hover:bg-[#29483C] text-white rounded-md text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Computing Paths across Evidence Graph...' : 'Execute Path Search & Fragility Analysis'}
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {testResult ? (
            <div className="space-y-4">
              {/* Outcome Banner */}
              <div
                className={`p-4 rounded-lg border flex items-start space-x-3 ${
                  testResult.doesConnectionSurvive
                    ? 'bg-[#E7EEE9] border-[#355B4C]/40 text-[#29483C]'
                    : 'bg-[#F7EAEA] border-[#A13F3F]/40 text-[#A13F3F]'
                }`}
              >
                {testResult.doesConnectionSurvive ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#355B4C]" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#A13F3F]" />
                )}
                <div>
                  <div className="font-semibold text-xs uppercase tracking-wider font-mono">
                    {testResult.doesConnectionSurvive ? 'Connection Survives' : 'Connection Severed'}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed text-[#222824]">
                    {testResult.explanation}
                  </p>
                </div>
              </div>

              {/* Active Path Visualizer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#222824] uppercase tracking-wider font-mono">
                  Supported Shortest Paths ({testResult.activePaths.length})
                </div>

                {testResult.activePaths.length === 0 ? (
                  <div className="p-4 bg-[#F6F5F1] rounded border border-[#DDDFD7] text-xs text-[#626B65] italic">
                    No active paths connect {testResult.sourceName} and {testResult.targetName} under current exclusions.
                  </div>
                ) : (
                  testResult.activePaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#F6F5F1] rounded-md border border-[#DDDFD7] space-y-2"
                    >
                      <div className="text-xs font-mono font-medium text-[#222824] leading-relaxed">
                        {path.explanation}
                      </div>
                      <div className="text-[10px] text-[#626B65] border-t border-[#DDDFD7] pt-1.5 flex items-center space-x-2">
                        <span className="font-medium">Evidence basis:</span>
                        <span className="truncate">
                          {path.relationships.map(r => r.source).join(' • ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-[#626B65] text-xs space-y-1">
              <GitCompare className="w-6 h-6 text-[#DDDFD7]" />
              <span>Select two entities above and execute the fragility test.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
