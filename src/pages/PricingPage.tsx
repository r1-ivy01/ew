import React, { useState } from 'react';
import { Check, ArrowLeft, Shield, Building2, Send, CheckCircle2 } from 'lucide-react';
import { submitPilotRequest } from '../api';

interface PricingPageProps {
  onBack: () => void;
  onEnterApp: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack, onEnterApp }) => {
  const [selectedPlan, setSelectedPlan] = useState<'Pilot' | 'Department' | 'Enterprise'>('Pilot');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const res = await submitPilotRequest({
        name,
        email,
        agency,
        plan: selectedPlan,
        notes,
      });
      setSubmittedMessage(res.message);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmittedMessage(null);
        setName('');
        setEmail('');
        setAgency('');
        setNotes('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col selection:bg-[#E7EEE9] selection:text-[#29483C]">
      {/* Header */}
      <header className="h-16 px-8 border-b border-[#DDDFD7] flex items-center justify-between bg-white sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-medium text-[#626B65] hover:text-[#222824] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to TRACE</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onEnterApp}
            className="px-3.5 py-1.5 rounded bg-[#355B4C] hover:bg-[#29483C] text-white text-xs font-medium transition-colors"
          >
            Open Demo Workspace
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#222824] tracking-tight">
            Institutional Deployment Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#626B65] leading-relaxed">
            TRACE workspaces are deployed on-premises or within dedicated isolated cloud boundaries for government task forces, regulatory agencies, and forensic compliance teams.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilot */}
          <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#355B4C] font-mono">
                  Pilot Evaluation
                </div>
                <h3 className="text-2xl font-bold text-[#222824] mt-1">Free / 60-Day</h3>
                <p className="text-xs text-[#626B65] mt-1">
                  For single-investigation units validating source-grounded graph workflows.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#222824] pt-2 border-t border-[#DDDFD7]">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Up to 3 active case workspaces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Cytoscape graph & fragility testing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Local OCR & Gemini 3.8 analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>PDF, CSV, and Image upload</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan('Pilot');
                setIsModalOpen(true);
              }}
              className="w-full py-2 bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] rounded text-xs font-semibold transition-colors"
            >
              Request Evaluation Key
            </button>
          </div>

          {/* Department - Featured */}
          <div className="bg-white rounded-lg border-2 border-[#355B4C] p-6 flex flex-col justify-between space-y-6 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#355B4C] text-white px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold">
              Most Selected
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#355B4C] font-mono">
                  Department
                </div>
                <h3 className="text-2xl font-bold text-[#222824] mt-1">Task Force</h3>
                <p className="text-xs text-[#626B65] mt-1">
                  For multi-investigator bureaus managing complex ongoing criminal or forensic matters.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#222824] pt-2 border-t border-[#DDDFD7]">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Unlimited investigation workspaces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Multi-user collaboration & role audit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Automatic change detection across batches</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Exportable court-ready investigation briefs</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan('Department');
                setIsModalOpen(true);
              }}
              className="w-full py-2 bg-[#355B4C] hover:bg-[#29483C] text-white rounded text-xs font-semibold transition-colors shadow-xs"
            >
              Request Department Access
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#355B4C] font-mono">
                  Enterprise
                </div>
                <h3 className="text-2xl font-bold text-[#222824] mt-1">Agency Custom</h3>
                <p className="text-xs text-[#626B65] mt-1">
                  Air-gapped deployment, custom relational connectors, and dedicated support.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#222824] pt-2 border-t border-[#DDDFD7]">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Air-gapped & On-Premises installation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Custom SQL & warehouse ingestion connectors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Custom OCR models for degraded microfilm</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                  <span>Dedicated forensic data engineering SLA</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan('Enterprise');
                setIsModalOpen(true);
              }}
              className="w-full py-2 bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] rounded text-xs font-semibold transition-colors"
            >
              Contact Solutions Architect
            </button>
          </div>
        </div>
      </main>

      {/* Pilot Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#DDDFD7] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#222824]">
                  Request {selectedPlan} Workspace
                </h3>
                <p className="text-[11px] text-[#626B65]">TRACE Evidence Intelligence Access</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#626B65] hover:text-[#222824] text-sm"
              >
                ✕
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-4 bg-[#E7EEE9] text-[#29483C] text-xs rounded-md flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{submittedMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#222824] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Inspector or Lead Analyst Name"
                    className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 focus:outline-none focus:border-[#355B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#222824] mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov or .org"
                    className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 focus:outline-none focus:border-[#355B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#222824] mb-1">Agency / Department</label>
                  <input
                    type="text"
                    value={agency}
                    onChange={e => setAgency(e.target.value)}
                    placeholder="e.g. Maritime Fraud Task Force"
                    className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 focus:outline-none focus:border-[#355B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#222824] mb-1">Investigation Scope / Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Brief description of data formats (PDFs, CDRs, CSV ledgers)..."
                    className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 focus:outline-none focus:border-[#355B4C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-[#626B65] hover:bg-[#EFEDE7] rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 text-xs bg-[#355B4C] hover:bg-[#29483C] text-white rounded font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Clearance Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
