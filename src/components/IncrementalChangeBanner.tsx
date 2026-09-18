import React from 'react';
import { Sparkles, Layers, X, ArrowRight, Eye } from 'lucide-react';
import { ChangeReport } from '../types';

interface IncrementalChangeBannerProps {
  changeReport: ChangeReport | null;
  onDismiss: () => void;
  onHighlightNew: (entityIds: string[], relIds: string[]) => void;
}

export const IncrementalChangeBanner: React.FC<IncrementalChangeBannerProps> = ({
  changeReport,
  onDismiss,
  onHighlightNew,
}) => {
  if (!changeReport) return null;

  const hasBridgedComponents = changeReport.newlyConnectedComponents.length > 0;

  const handleHighlight = () => {
    const entIds = changeReport.newEntities.map(e => e.id);
    const relIds = changeReport.newRelationships.map(r => r.id);
    onHighlightNew(entIds, relIds);
  };

  return (
    <div className="bg-[#E7EEE9] border-b border-[#355B4C]/20 px-6 py-3 flex items-center justify-between z-15 shrink-0 transition-all">
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-full bg-[#355B4C] text-white flex items-center justify-center shrink-0 shadow-xs">
          {hasBridgedComponents ? (
            <Layers className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="text-xs">
          <div className="font-semibold text-[#29483C] flex items-center space-x-2">
            <span>New Evidence Ingested: {changeReport.sourceFilename}</span>
            {hasBridgedComponents && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#355B4C] text-white font-mono uppercase">
                Bridged Isolated Groups
              </span>
            )}
          </div>
          <p className="text-[#222824] mt-0.5 max-w-2xl leading-relaxed">
            {changeReport.summaryText}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleHighlight}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#355B4C] hover:bg-[#29483C] text-white text-xs font-medium transition-colors shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Highlight Additions on Graph</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1 rounded text-[#626B65] hover:text-[#222824] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
