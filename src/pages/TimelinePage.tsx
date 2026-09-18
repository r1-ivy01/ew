import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelinePageProps {
  timeline: TimelineEvent[];
  onOpenSourceRecord?: (sourceId: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ timeline }) => {
  const [viewMode, setViewMode] = useState<'event' | 'discovery'>('event');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Sort by event timestamp or discovery timestamp
  const sortedEvents = [...timeline].sort((a, b) => {
    const timeA = viewMode === 'event' ? a.eventDate : a.discoveryDate;
    const timeB = viewMode === 'event' ? b.eventDate : b.discoveryDate;
    return new Date(timeA).getTime() - new Date(timeB).getTime();
  });

  const currentEvent = sortedEvents[currentIndex] || sortedEvents[0];

  const handleNext = () => {
    if (currentIndex < sortedEvents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-lg border border-[#DDDFD7] shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-[#222824] tracking-tight">Investigation Chronology</h1>
          <p className="text-xs text-[#626B65] mt-1">
            Reconstruct sequences of events or track chronological record discovery.
          </p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center space-x-2 bg-[#EFEDE7] p-1 rounded-md border border-[#DDDFD7]">
          <button
            onClick={() => setViewMode('event')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'event'
                ? 'bg-white text-[#222824] shadow-2xs'
                : 'text-[#626B65] hover:text-[#222824]'
            }`}
          >
            Event Occurrence Time
          </button>
          <button
            onClick={() => setViewMode('discovery')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'discovery'
                ? 'bg-white text-[#222824] shadow-2xs'
                : 'text-[#626B65] hover:text-[#222824]'
            }`}
          >
            Evidence Ingestion Time
          </button>
        </div>
      </div>

      {/* Interactive Step Replay Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#DDDFD7] flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded border border-[#DDDFD7] hover:bg-[#EFEDE7] disabled:opacity-40 text-[#222824]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === sortedEvents.length - 1}
            className="p-1.5 rounded border border-[#DDDFD7] hover:bg-[#EFEDE7] disabled:opacity-40 text-[#222824]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#626B65] pl-2">
            Step {currentIndex + 1} of {sortedEvents.length}
          </span>
        </div>

        <div className="text-xs text-[#222824] font-medium truncate max-w-md">
          {currentEvent?.title}
        </div>

        <button
          onClick={() => setCurrentIndex(0)}
          className="flex items-center space-x-1 text-xs text-[#626B65] hover:text-[#222824]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="space-y-4">
        {sortedEvents.map((evt, idx) => {
          const isSelected = idx === currentIndex;
          const displayDate = new Date(
            viewMode === 'event' ? evt.eventDate : evt.discoveryDate
          ).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={evt.id}
              onClick={() => setCurrentIndex(idx)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#355B4C] shadow-md ring-1 ring-[#355B4C]'
                  : 'bg-white/80 border-[#DDDFD7] hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#355B4C]' : 'bg-[#DDDFD7]'}`} />
                  <span className="font-mono text-xs text-[#355B4C] font-semibold">
                    {displayDate}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#626B65] uppercase">
                  {viewMode === 'event' ? 'Documented Occurrence' : 'Case Discovery'}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#222824] mt-1.5">{evt.title}</h3>
              <p className="text-xs text-[#626B65] mt-1 leading-relaxed">{evt.description}</p>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DDDFD7] text-xs">
                <div className="flex items-center space-x-1.5 text-[11px] text-[#626B65]">
                  <FileText className="w-3 h-3 text-[#355B4C]" />
                  <span className="font-mono">{evt.sourceFilename}</span>
                  {evt.pageOrRow && <span>({evt.pageOrRow})</span>}
                </div>

                <div className="text-[10px] text-[#626B65] font-mono">
                  Entities: {evt.entityIds.length} linked
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
