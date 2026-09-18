import React, { useState } from 'react';
import {
  FileText,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  Eye,
  Download,
  Upload,
  Clock,
  X,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { SourceDocument } from '../types';

interface SourcesViewProps {
  sources: SourceDocument[];
  onOpenUpload: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({ sources, onOpenUpload }) => {
  const [selectedSource, setSelectedSource] = useState<SourceDocument | null>(null);

  const getSourceIcon = (type: string, isOcr?: boolean) => {
    if (isOcr || type === 'image') {
      return <Camera className="w-4 h-4 text-[#6D28D9]" />;
    }
    if (type === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-[#0369A1]" />;
    }
    return <FileText className="w-4 h-4 text-[#355B4C]" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F6F5F1] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-lg border border-[#DDDFD7] shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-[#222824] tracking-tight">Case Evidence Sources</h1>
          <p className="text-xs text-[#626B65] mt-1">
            Audit verbatim texts, CSV ledgers, CDR records, and scanned OCR photos powering the graph.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[#355B4C] hover:bg-[#29483C] text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Additional Records</span>
        </button>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-lg border border-[#DDDFD7] overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#EFEDE7] text-[#222824] border-b border-[#DDDFD7]">
            <tr>
              <th className="p-3 font-semibold">Document Title</th>
              <th className="p-3 font-semibold">Format & Method</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Segments Extracted</th>
              <th className="p-3 font-semibold">Ingestion Time</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDDFD7]">
            {sources.map(src => (
              <tr key={src.id} className="hover:bg-[#F6F5F1] transition-colors">
                <td className="p-3">
                  <div className="flex items-center space-x-2.5">
                    {getSourceIcon(src.fileType, !!src.ocrOutput)}
                    <div>
                      <div className="font-semibold text-[#222824]">{src.filename}</div>
                      <div className="text-[10px] text-[#626B65] font-mono">{src.id}</div>
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#EFEDE7] text-[#222824]">
                    {src.ocrOutput ? 'OCR Vision Extracted' : src.fileType.toUpperCase()}
                  </span>
                </td>

                <td className="p-3">
                  <span className="inline-flex items-center space-x-1 text-[11px] text-[#29483C] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#355B4C]" />
                    <span className="capitalize">{src.processingStatus}</span>
                  </span>
                </td>

                <td className="p-3">
                  <span className="font-mono text-xs font-semibold text-[#222824]">
                    {src.segments.length} segments
                  </span>
                </td>

                <td className="p-3 text-[11px] text-[#626B65] font-mono">
                  {new Date(src.uploadedAt).toLocaleDateString()}
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelectedSource(src)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-[#DDDFD7] hover:bg-[#EFEDE7] text-[#222824] text-[11px] font-medium transition-colors"
                  >
                    <Eye className="w-3 h-3 text-[#626B65]" />
                    <span>Inspect Raw Record</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw Document Inspection Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#DDDFD7] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="h-14 px-6 border-b border-[#DDDFD7] flex items-center justify-between bg-[#F6F5F1]">
              <div className="flex items-center space-x-2">
                {getSourceIcon(selectedSource.fileType, !!selectedSource.ocrOutput)}
                <span className="font-semibold text-sm text-[#222824]">{selectedSource.filename}</span>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 rounded text-[#626B65] hover:text-[#222824]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Image Preview if OCR */}
              {selectedSource.originalDataUrl && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono text-[#626B65]">Original Evidence Scan</div>
                  <div className="border border-[#DDDFD7] rounded overflow-hidden max-h-64 bg-black/5 flex items-center justify-center p-2">
                    <img
                      src={selectedSource.originalDataUrl}
                      alt="Source evidence"
                      className="max-h-60 object-contain rounded"
                    />
                  </div>
                </div>
              )}

              {/* OCR Transcription / Raw text */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#626B65]">
                  {selectedSource.ocrOutput ? 'Optical Character Transcription' : 'Verbatim Source Content'}
                </div>
                <div className="p-4 bg-[#F6F5F1] rounded border border-[#DDDFD7] font-mono text-xs text-[#222824] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto select-text">
                  {selectedSource.ocrOutput?.text || selectedSource.rawText || 'Content indexed'}
                </div>
              </div>
            </div>

            <div className="h-12 px-6 border-t border-[#DDDFD7] bg-[#F6F5F1] flex items-center justify-between text-xs text-[#626B65]">
              <span>Ingested & indexed in case knowledge base</span>
              <button
                onClick={() => setSelectedSource(null)}
                className="px-3 py-1 bg-[#355B4C] text-white rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
