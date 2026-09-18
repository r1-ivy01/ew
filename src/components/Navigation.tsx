import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Network,
  Clock,
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  Settings,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Case } from '../types';

interface NavigationProps {
  currentCase?: Case;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onResetDemo?: () => void;
  isLiveMode?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentCase,
  activeRoute,
  onNavigate,
  onResetDemo,
  isLiveMode = false,
}) => {
  const caseId = currentCase?.id || 'case-harbor-ledger-demo';

  const navItems = [
    { label: 'Overview', route: `/app/cases/${caseId}/overview`, icon: LayoutDashboard },
    { label: 'Sources', route: `/app/cases/${caseId}/sources`, icon: FileText, badge: currentCase?.sourceCount },
    { label: 'Network Graph', route: `/app/cases/${caseId}/network`, icon: Network, highlight: true },
    { label: 'Timeline', route: `/app/cases/${caseId}/timeline`, icon: Clock },
    { label: 'Findings', route: `/app/cases/${caseId}/findings`, icon: AlertTriangle, badge: currentCase?.contradictionCount, badgeWarn: true },
    { label: 'Identities', route: `/app/cases/${caseId}/identities`, icon: UserCheck, badge: currentCase?.unresolvedIdentityCount },
    { label: 'Investigation Brief', route: `/app/cases/${caseId}/brief`, icon: FileSpreadsheet },
    { label: 'Settings', route: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-[216px] shrink-0 bg-[#FFFFFF] border-r border-[#DDDFD7] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-[60px] px-4 border-b border-[#DDDFD7] flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-7 h-7 rounded bg-[#355B4C] flex items-center justify-center text-white font-bold text-xs tracking-wider">
            TR
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-[#222824] group-hover:text-[#355B4C] transition-colors">
              TRACE
            </div>
            <div className="text-[10px] text-[#626B65] uppercase tracking-widest font-mono">
              Evidence Intel
            </div>
          </div>
        </button>
      </div>

      {/* Case Context Pill */}
      {currentCase && (
        <div className="px-3 py-2.5 bg-[#EFEDE7]/60 border-b border-[#DDDFD7]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#626B65]">Active Case</div>
          <div className="text-xs font-semibold text-[#222824] truncate mt-0.5" title={currentCase.name}>
            {currentCase.name}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-[#626B65]">
            <span className="font-mono text-[10px]">{currentCase.referenceNumber || 'DEMO-882'}</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-[#E7EEE9] text-[#29483C] font-medium">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Mode Indicator */}
      <div className="px-3 py-2 border-b border-[#DDDFD7] bg-[#F6F5F1]/80">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            {isLiveMode ? (
              <Sparkles className="w-3.5 h-3.5 text-[#355B4C]" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-[#626B65]" />
            )}
            <span className="font-medium text-[#222824]">
              {isLiveMode ? 'Live AI Mode' : 'Sample Walkthrough'}
            </span>
          </div>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveMode ? 'bg-[#355B4C]' : 'bg-[#865817]'
            }`}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeRoute === item.route;
          const Icon = item.icon;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#E7EEE9] text-[#29483C] font-semibold'
                  : 'text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7]'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#355B4C]' : 'text-[#626B65]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    item.badgeWarn
                      ? 'bg-[#F8F0DE] text-[#865817] font-semibold'
                      : 'bg-[#EFEDE7] text-[#626B65]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[#DDDFD7] space-y-2 bg-[#F6F5F1]">
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="w-full flex items-center justify-center space-x-1.5 px-2 py-1.5 text-xs text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7] rounded border border-[#DDDFD7] transition-colors"
            title="Reset synthetic case to initial ground truth baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        )}

        <div className="flex items-center space-x-2 px-1 pt-1 text-[11px] text-[#626B65]">
          <div className="w-5 h-5 rounded-full bg-[#EFEDE7] border border-[#DDDFD7] flex items-center justify-center text-[10px] font-semibold text-[#222824]">
            IN
          </div>
          <div className="truncate">
            <div className="font-medium text-[#222824] truncate leading-tight">Inv. Miller</div>
            <div className="text-[10px] text-[#626B65] truncate font-mono">Task Force Hunter</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
