import React from 'react';
import { Upload, MessageSquare, GitCompare, ChevronRight } from 'lucide-react';
import { Case } from '../types';

interface TopBarProps {
  currentCase?: Case;
  title: string;
  onOpenUpload: () => void;
  onOpenAssistant: () => void;
  onOpenPathTest?: () => void;
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentCase,
  title,
  onOpenUpload,
  onOpenAssistant,
  onOpenPathTest,
}) => {
  return (
    <header className="h-[60px] bg-[#FFFFFF] border-b border-[#DDDFD7] px-6 flex items-center justify-between z-10 shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-[#626B65]">Cases</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#DDDFD7]" />
        <span className="font-medium text-[#222824] truncate max-w-[200px]">
          {currentCase?.name || 'Operation Harbor Ledger'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#DDDFD7]" />
        <span className="text-[#355B4C] font-semibold">{title}</span>
      </div>

      {/* Global Case Actions */}
      <div className="flex items-center space-x-2.5">
        {onOpenPathTest && (
          <button
            onClick={onOpenPathTest}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#222824] bg-[#EFEDE7] hover:bg-[#DDDFD7] transition-colors border border-[#DDDFD7]"
            title="Test connection fragility and multi-hop paths between two entities"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#626B65]" />
            <span>Test Connection</span>
          </button>
        )}

        <button
          onClick={onOpenAssistant}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#29483C] bg-[#E7EEE9] hover:bg-[#d8e5dc] transition-colors border border-[#355B4C]/20"
          title="Query case records with grounded RAG assistance and citations"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#355B4C]" />
          <span>Case Assistant</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#355B4C] hover:bg-[#29483C] transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Records</span>
        </button>
      </div>
    </header>
  );
};
