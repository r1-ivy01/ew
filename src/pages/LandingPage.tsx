import React from 'react';
import {
  Network,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  GitBranch,
  Layers,
  Sparkles,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenPricing: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenPricing,
  onOpenLogin,
}) => {
  return (
    <div className="min-h-screen paper-texture flex flex-col selection:bg-[#E7EEE9] selection:text-[#29483C]">
      {/* Navigation */}
      <header className="h-16 px-8 border-b border-[#DDDFD7] flex items-center justify-between bg-white/80 backdrop-blur-xs sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#355B4C] flex items-center justify-center text-white font-bold text-sm tracking-wider">
            TR
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-[#222824]">TRACE</span>
            <span className="ml-2 text-xs font-mono text-[#626B65] uppercase tracking-widest hidden sm:inline">
              Evidence Intelligence
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-6 text-xs font-medium text-[#626B65]">
          <a href="#capabilities" className="hover:text-[#222824] transition-colors">Capabilities</a>
          <a href="#workflow" className="hover:text-[#222824] transition-colors">Workflow</a>
          <button onClick={onOpenPricing} className="hover:text-[#222824] transition-colors">
            Pricing
          </button>
          <button
            onClick={onOpenLogin}
            className="hover:text-[#222824] transition-colors hidden sm:inline"
          >
            Sign In
          </button>
          <button
            onClick={onEnterApp}
            className="px-3.5 py-1.5 rounded bg-[#355B4C] hover:bg-[#29483C] text-white font-medium transition-colors shadow-xs"
          >
            Explore Demo Case
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-16 pb-20 space-y-16">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E7EEE9] border border-[#355B4C]/20 text-[#29483C] text-xs font-medium font-mono">
            <span>Hackathon Problem Statement: The Network Hunter</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#222824] leading-[1.12]">
            Every connection,<br />backed by evidence.
          </h1>

          <p className="text-base sm:text-lg text-[#626B65] max-w-2xl mx-auto leading-relaxed">
            Connect fragmented records, inspect relationships, and test investigation leads in one workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#355B4C] hover:bg-[#29483C] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <span>Explore Demo Case (Operation Harbor Ledger)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-white hover:bg-[#EFEDE7] text-[#222824] font-semibold text-sm border border-[#DDDFD7] transition-all shadow-2xs"
            >
              Request Pilot Workspace
            </button>
          </div>

          <div className="text-[11px] text-[#626B65] pt-1">
            Deterministic synthetic walkthrough ready instantly • No credentials required
          </div>
        </div>

        {/* Product Preview (Embedded real interface mockup) */}
        <div className="bg-white rounded-xl border border-[#DDDFD7] shadow-xl overflow-hidden">
          {/* Mock Window Bar */}
          <div className="h-10 bg-[#EFEDE7] border-b border-[#DDDFD7] px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DDDFD7]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#DDDFD7]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#DDDFD7]" />
              <span className="ml-3 font-mono text-xs text-[#626B65]">
                TRACE / Operation Harbor Ledger / Network Graph
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-[#29483C] font-mono bg-[#E7EEE9] px-2 py-0.5 rounded">
              <span>Ground Truth Verified</span>
            </div>
          </div>

          {/* Canvas & Inspector Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[380px]">
            {/* Graph Visual Area */}
            <div className="md:col-span-2 p-6 bg-[#F6F5F1] relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#DDDFD7]">
              {/* Nodes layout preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-[#626B65]">
                  <span className="font-mono uppercase text-[10px]">Active Entities & Edges</span>
                  <span>Component 1 & 2 Bridged</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white border border-[#355B4C] rounded-md shadow-xs space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#355B4C] font-bold">Person</div>
                    <div className="font-semibold text-xs text-[#222824]">Arun Patel</div>
                    <div className="text-[10px] text-[#626B65]">Apex Marine Corp • Logistics Director</div>
                  </div>

                  <div className="p-3 bg-white border border-[#DDDFD7] rounded-md shadow-xs space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#B45309] font-bold">Vehicle</div>
                    <div className="font-semibold text-xs text-[#222824]">Van V-7892</div>
                    <div className="text-[10px] text-[#626B65]">2021 Ford Transit (Blue)</div>
                  </div>

                  <div className="p-3 bg-[#E7EEE9] border border-[#355B4C] rounded-md shadow-xs space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#355B4C] font-bold">New Bridge</div>
                    <div className="font-semibold text-xs text-[#29483C]">Marcus Reed</div>
                    <div className="text-[10px] text-[#626B65]">Harbor Holdings Bay 9-B</div>
                  </div>

                  <div className="p-3 bg-white border border-[#DDDFD7] rounded-md shadow-xs space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#475569] font-bold">Organisation</div>
                    <div className="font-semibold text-xs text-[#222824]">Orion Freight Ltd</div>
                    <div className="text-[10px] text-[#626B65]">Bank Acc: ACC-88210</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDDFD7] text-[11px] text-[#626B65] flex items-center justify-between">
                <span>Multi-hop path: Arun Patel → CDR Call → David Vance → Sublease → Marcus Reed</span>
                <span className="font-mono text-[10px]">100% Sourced</span>
              </div>
            </div>

            {/* Evidence Inspector Side Preview */}
            <div className="p-5 bg-white space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#626B65]">Inspector Snapshot</span>
                <h4 className="font-semibold text-xs text-[#222824] mt-0.5">Wire Transfer $240,000 USD</h4>
                <div className="text-[11px] text-[#29483C] bg-[#E7EEE9] px-1.5 py-0.5 rounded inline-block mt-1">
                  Direct Statement
                </div>
              </div>

              <div className="p-2.5 bg-[#F6F5F1] rounded border border-[#DDDFD7] text-xs space-y-1">
                <div className="font-mono text-[10px] text-[#626B65]">
                  Transactions_Harbor_Ledger.csv (Row 2)
                </div>
                <div className="italic text-[#222824]">
                  "TX-10492 | Orion Freight Ltd → Apex Marine Corp | $240,000.00 | Pier 4 Logistics Handling Advance"
                </div>
              </div>

              <div className="p-2.5 bg-[#F8F0DE] rounded border border-[#865817]/30 text-xs space-y-1">
                <div className="font-semibold text-[11px] text-[#865817]">Flagged Contradiction</div>
                <p className="text-[10px] text-[#626B65]">
                  Elena Rostova claims private vehicle ownership, conflicting with DMV Registry commercial fleet records.
                </p>
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-2 bg-[#355B4C] hover:bg-[#29483C] text-white rounded text-xs font-semibold transition-colors"
              >
                Launch Investigation
              </button>
            </div>
          </div>
        </div>

        {/* 3 Capabilities */}
        <div id="capabilities" className="space-y-6 pt-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-[#222824]">Rigorous Investigation Architecture</h2>
            <p className="text-xs text-[#626B65]">Designed for precision, auditability, and legal defensibility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-[#DDDFD7] space-y-3 shadow-2xs">
              <div className="w-8 h-8 rounded bg-[#E7EEE9] flex items-center justify-center text-[#355B4C]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#222824]">Connect fragmented records</h3>
              <p className="text-xs text-[#626B65] leading-relaxed">
                Ingest PDFs, CSV transaction ledgers, call detail records (CDRs), and scanned images. TRACE builds a case-scoped network graph with strict entity resolution.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border border-[#DDDFD7] space-y-3 shadow-2xs">
              <div className="w-8 h-8 rounded bg-[#E7EEE9] flex items-center justify-center text-[#355B4C]">
                <FileSearch className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#222824]">Inspect every source</h3>
              <p className="text-xs text-[#626B65] leading-relaxed">
                Every relationship cites verbatim text or CSV rows. With forensic OCR, inspect original scanned photos and camera logs alongside extracted facts.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border border-[#DDDFD7] space-y-3 shadow-2xs">
              <div className="w-8 h-8 rounded bg-[#E7EEE9] flex items-center justify-center text-[#355B4C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#222824]">Challenge weak assumptions</h3>
              <p className="text-xs text-[#626B65] leading-relaxed">
                Simulate removing an uncertain identity match or an uncorroborated statement. Test whether a lead survives or collapses without mutating real evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div id="workflow" className="p-8 bg-white rounded-xl border border-[#DDDFD7] space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-[#222824]">Investigation Workflow</h2>
            <p className="text-xs text-[#626B65]">From raw records to defensible intelligence brief.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">01</span>
              <div className="font-semibold mt-1">Upload Records</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">PDF, CSV, Images</div>
            </div>
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">02</span>
              <div className="font-semibold mt-1">OCR & Extract</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">Entities & Citations</div>
            </div>
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">03</span>
              <div className="font-semibold mt-1">Explore Graph</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">Cytoscape Network</div>
            </div>
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">04</span>
              <div className="font-semibold mt-1">Identity Review</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">Reversible Merges</div>
            </div>
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">05</span>
              <div className="font-semibold mt-1">Test Fragility</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">Exclude Assumptions</div>
            </div>
            <div className="p-3 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
              <span className="font-mono text-[10px] text-[#355B4C] font-bold">06</span>
              <div className="font-semibold mt-1">Generate Brief</div>
              <div className="text-[10px] text-[#626B65] mt-0.5">Court-Ready Export</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDDFD7] bg-white py-8 px-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#626B65] space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#222824]">TRACE</span>
            <span>—</span>
            <span>Evidence Intelligence Workspace</span>
          </div>
          <div className="text-[11px] font-mono">
            Hackathon Edition • Evidence First, Analysis Second
          </div>
        </div>
      </footer>
    </div>
  );
};
