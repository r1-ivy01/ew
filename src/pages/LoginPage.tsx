import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess }) => {
  const [badgeId, setBadgeId] = useState('TF-HUNTER-882');
  const [passphrase, setPassphrase] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col justify-between selection:bg-[#E7EEE9] selection:text-[#29483C]">
      {/* Top Header */}
      <header className="h-16 px-8 border-b border-[#DDDFD7] flex items-center bg-white">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-medium text-[#626B65] hover:text-[#222824] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to TRACE</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded bg-[#355B4C] flex items-center justify-center text-white font-bold text-sm tracking-wider mx-auto">
            TR
          </div>
          <h1 className="text-2xl font-semibold text-[#222824] tracking-tight">
            Investigator Sign In
          </h1>
          <p className="text-xs text-[#626B65]">
            Evidence intelligence workspace for cross-record forensic analysis
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#DDDFD7] p-6 space-y-5 shadow-sm">
          {/* Quick Demo Access button */}
          <div>
            <button
              onClick={onLoginSuccess}
              className="w-full py-2.5 bg-[#355B4C] hover:bg-[#29483C] text-white rounded text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Synthetic Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-[10px] text-center text-[#626B65] mt-1.5 font-mono">
              Immediate access • Pre-loaded with Operation Harbor Ledger
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#DDDFD7]"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-[#626B65]">
              Or Department Clearance
            </span>
            <div className="flex-grow border-t border-[#DDDFD7]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#222824] mb-1">
                Investigator Badge ID / Email
              </label>
              <input
                type="text"
                value={badgeId}
                onChange={e => setBadgeId(e.target.value)}
                className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 text-[#222824] focus:outline-none focus:border-[#355B4C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#222824] mb-1">
                Security Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                className="w-full text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded px-3 py-2 text-[#222824] focus:outline-none focus:border-[#355B4C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#EFEDE7] hover:bg-[#DDDFD7] text-[#222824] rounded text-xs font-medium transition-colors"
            >
              Sign In with Department Clearance
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDDFD7] bg-white py-4 px-8 text-center text-[11px] text-[#626B65]">
        TRACE Evidence Intelligence • Single Sign-On, Workspace OAuth & Task Force Tokens Supported
      </footer>
    </div>
  );
};
