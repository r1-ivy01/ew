import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Key,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { Case } from '../types';
import { resetCase } from '../api';

interface SettingsPageProps {
  caseData?: Case;
  isGeminiAvailable: boolean;
  onResetSuccess: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  caseData,
  isGeminiAvailable,
  onResetSuccess,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!caseData) return;
    setIsResetting(true);
    try {
      const res = await resetCase(caseData.id);
      setResetMessage(res.message);
      setTimeout(() => {
        setResetMessage(null);
        onResetSuccess();
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#DDDFD7] shadow-2xs">
        <h1 className="text-xl font-bold text-[#222824] tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-[#626B65] mt-1">
          System operational state, model connectivity, and forensic ground-truth configuration.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 bg-[#E7EEE9] text-[#29483C] text-xs rounded-lg border border-[#355B4C]/30 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Intelligence & Model Provider */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#355B4C] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#222824]">AI & OCR Extraction Engine</h3>
              <p className="text-[11px] text-[#626B65]">Google Gemini 3.8 Flash & Forensic Vision OCR</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1.5 ${
              isGeminiAvailable
                ? 'bg-[#E7EEE9] text-[#29483C]'
                : 'bg-[#F8F0DE] text-[#865817]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isGeminiAvailable ? 'bg-[#355B4C]' : 'bg-[#865817]'}`} />
            <span>{isGeminiAvailable ? 'Active (Gemini 3.8 Flash)' : 'Sample Walkthrough Mode'}</span>
          </span>
        </div>

        <p className="text-xs text-[#626B65] leading-relaxed">
          TRACE utilizes Gemini 3.8 Flash server-side for optical character extraction on scanned photos and document transcription, alongside deterministic ground-truth verification. If no API key is provided, the full synthetic dataset runs deterministically without error.
        </p>
      </div>

      {/* Case Management & Demo Reset */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2.5 border-b border-[#DDDFD7] pb-3">
          <div className="w-7 h-7 rounded bg-[#EFEDE7] text-[#222824] flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#222824]">Synthetic Demonstration Baseline</h3>
            <p className="text-[11px] text-[#626B65]">Reset case state to initial ground-truth</p>
          </div>
        </div>

        <p className="text-xs text-[#626B65] leading-relaxed">
          Restore the investigation workspace ("Operation Harbor Ledger") to its pristine state before any new evidence uploads, identity merges, or contradiction reviews.
        </p>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2 bg-white hover:bg-[#EFEDE7] text-[#222824] border border-[#DDDFD7] rounded text-xs font-semibold transition-colors flex items-center space-x-2 shadow-2xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Workspace...' : 'Reset Operation Harbor Ledger'}</span>
        </button>
      </div>

      {/* Security & Access Clearance */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2.5 border-b border-[#DDDFD7] pb-3">
          <div className="w-7 h-7 rounded bg-[#EFEDE7] text-[#222824] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#222824]">Investigator Clearance & Data Isolation</h3>
            <p className="text-[11px] text-[#626B65]">Task Force Hunter clearance profile</p>
          </div>
        </div>

        <div className="text-xs space-y-1.5 text-[#626B65]">
          <div>Clearance Level: <span className="text-[#222824] font-mono font-medium">TF-HUNTER-LEVEL-3</span></div>
          <div>Data Retention: <span className="text-[#222824] font-mono font-medium">Isolated Case Scope</span></div>
          <div>Server Architecture: <span className="text-[#355B4C] font-semibold">Express + Vite Full-Stack</span></div>
        </div>
      </div>
    </div>
  );
};
