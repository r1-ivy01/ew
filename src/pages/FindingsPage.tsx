import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Contradiction, HypothesisAssessment } from '../types';
import { reviewContradiction, testHypothesis } from '../api';

interface FindingsPageProps {
  caseId: string;
  contradictions: Contradiction[];
  onRefreshFindings: () => void;
}

export const FindingsPage: React.FC<FindingsPageProps> = ({
  caseId,
  contradictions,
  onRefreshFindings,
}) => {
  const [hypothesisQuery, setHypothesisQuery] = useState(
    'Can Arun Patel be directly connected to David Vance without Apex Marine Corp?'
  );
  const [hypothesisResult, setHypothesisResult] = useState<HypothesisAssessment | null>(null);
  const [isTestingHypothesis, setIsTestingHypothesis] = useState(false);

  const handleReview = async (
    contraId: string,
    status: 'flagged' | 'reviewed_accepted' | 'reviewed_dismissed'
  ) => {
    try {
      await reviewContradiction(caseId, contraId, status);
      onRefreshFindings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEvaluateHypothesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesisQuery.trim() || isTestingHypothesis) return;

    setIsTestingHypothesis(true);
    try {
      const assessment = await testHypothesis(caseId, hypothesisQuery);
      setHypothesisResult(assessment);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTestingHypothesis(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#DDDFD7] shadow-2xs">
        <h1 className="text-xl font-bold text-[#222824] tracking-tight">
          Findings & Hypothesis Challenger
        </h1>
        <p className="text-xs text-[#626B65] mt-1">
          Review discrepancies between independent statements and stress-test investigative theories.
        </p>
      </div>

      {/* Flagged Contradictions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#222824] uppercase tracking-wider font-mono">
              Flagged Evidence Contradictions ({contradictions.length})
            </h2>
            <p className="text-xs text-[#626B65]">Incompatibilities detected across case records.</p>
          </div>
        </div>

        <div className="space-y-4">
          {contradictions.map(contra => (
            <div
              key={contra.id}
              className="bg-white rounded-lg border border-[#DDDFD7] p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#F8F0DE] flex items-center justify-center text-[#865817]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#222824]">{contra.title}</h3>
                    <div className="text-[10px] text-[#626B65] font-mono capitalize">
                      Category: {contra.category.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                    contra.status === 'flagged'
                      ? 'bg-[#F8F0DE] text-[#865817]'
                      : 'bg-[#E7EEE9] text-[#29483C]'
                  }`}
                >
                  {contra.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-[#222824] leading-relaxed">{contra.comparisonRule}</p>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-1 text-xs">
                  <div className="font-semibold text-[#222824] flex items-center space-x-1 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-[#355B4C]" />
                    <span>Claim A: {contra.claimA.sourceFilename}</span>
                  </div>
                  <div className="italic text-[#222824] p-2 bg-white rounded border border-[#DDDFD7] text-[11px]">
                    "{contra.claimA.text}"
                  </div>
                </div>

                <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7] space-y-1 text-xs">
                  <div className="font-semibold text-[#222824] flex items-center space-x-1 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-[#355B4C]" />
                    <span>Claim B: {contra.claimB.sourceFilename}</span>
                  </div>
                  <div className="italic text-[#222824] p-2 bg-white rounded border border-[#DDDFD7] text-[11px]">
                    "{contra.claimB.text}"
                  </div>
                </div>
              </div>

              {/* Resolution Controls */}
              <div className="pt-2 border-t border-[#DDDFD7] flex items-center justify-between text-xs">
                <div className="text-[11px] text-[#626B65]">
                  {contra.investigatorNote
                    ? `Investigator note: ${contra.investigatorNote}`
                    : 'Unresolved discrepancy — verify with primary document custodian.'}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReview(contra.id, 'reviewed_accepted')}
                    className="px-2.5 py-1 bg-[#E7EEE9] hover:bg-[#d5e4d9] text-[#29483C] rounded text-[11px] font-medium transition-colors"
                  >
                    Accept as Known Conflict
                  </button>
                  <button
                    onClick={() => handleReview(contra.id, 'reviewed_dismissed')}
                    className="px-2.5 py-1 bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] rounded text-[11px] font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hypothesis Challenger Form & Assessment */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-5 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#355B4C]" />
            <h2 className="text-sm font-semibold text-[#222824] uppercase tracking-wider font-mono">
              Hypothesis Challenger
            </h2>
          </div>
          <p className="text-xs text-[#626B65] mt-0.5">
            Test alternative theories against case evidence. Evaluates supporting facts, conflicting records, and missing links.
          </p>
        </div>

        <form onSubmit={handleEvaluateHypothesis} className="flex gap-2">
          <input
            type="text"
            value={hypothesisQuery}
            onChange={e => setHypothesisQuery(e.target.value)}
            placeholder="Enter an investigative hypothesis..."
            className="flex-1 text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded-md px-3 py-2 text-[#222824] focus:outline-none focus:border-[#355B4C]"
          />
          <button
            type="submit"
            disabled={isTestingHypothesis}
            className="px-4 py-2 bg-[#355B4C] hover:bg-[#29483C] text-white rounded-md text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1.5"
          >
            {isTestingHypothesis ? (
              <span>Evaluating...</span>
            ) : (
              <>
                <span>Challenge Hypothesis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {hypothesisResult && (
          <div className="p-4 bg-[#F6F5F1] rounded-lg border border-[#DDDFD7] space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#626B65]">Assessment Result</span>
                <h3 className="text-sm font-semibold text-[#222824]">{hypothesisResult.question}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-[#626B65]">Evidence Status</span>
                <div className="text-xs font-bold font-mono uppercase text-[#29483C]">
                  {hypothesisResult.supportingEvidence.length > 0 ? 'Documented Leads' : 'Uncorroborated'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded border border-[#DDDFD7] space-y-1">
                <div className="font-semibold text-[#29483C] text-[11px]">Supporting Facts</div>
                <ul className="list-disc pl-4 space-y-1 text-[#626B65] text-[11px]">
                  {hypothesisResult.supportingEvidence.map((ev, i: number) => (
                    <li key={i}>
                      <span>{ev.claim}</span>
                      <div className="text-[10px] font-mono text-[#355B4C]">
                        [{ev.citation.filename}]
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded border border-[#DDDFD7] space-y-1">
                <div className="font-semibold text-[#A13F3F] text-[11px]">Contradicting Records</div>
                <ul className="list-disc pl-4 space-y-1 text-[#626B65] text-[11px]">
                  {hypothesisResult.conflictingEvidence.length > 0 ? (
                    hypothesisResult.conflictingEvidence.map((ev, i: number) => (
                      <li key={i}>
                        <span>{ev.claim}</span>
                        <div className="text-[10px] font-mono text-[#A13F3F]">
                          [{ev.citation.filename}]
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-[#9DA39E]">None found</li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-white rounded border border-[#DDDFD7] space-y-1">
                <div className="font-semibold text-[#865817] text-[11px]">Missing Links</div>
                <ul className="list-disc pl-4 space-y-1 text-[#626B65] text-[11px]">
                  {hypothesisResult.missingInformation.map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
