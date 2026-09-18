import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { uploadSource } from '../api';
import { ChangeReport } from '../types';
import { DEMO_IMAGE_EVIDENCE, DEMO_REPORT_04 } from '../data/syntheticDemo';

interface SourceUploadModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (changeReport?: ChangeReport) => void;
}

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadStage('Parsing source content...');
    setErrorMessage(null);

    try {
      const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg)$/i);

      if (isImage) {
        setUploadStage('Executing optical character recognition (OCR)...');
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            setUploadStage('Extracting entities & validating evidence citations...');
            const result = await uploadSource(caseId, {
              filename: file.name,
              mimeType: file.type || 'image/png',
              rawContent: base64,
              isBase64Image: true,
            });
            setUploadStage('Ready. Integrating into investigation graph...');
            setTimeout(() => {
              setIsUploading(false);
              onUploadSuccess(result.changeReport);
              onClose();
            }, 500);
          } catch (err: any) {
            setErrorMessage(err.message || 'Image processing failed');
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Text / CSV
        const text = await file.text();
        setUploadStage('Extracting structured entities & relationships...');
        const result = await uploadSource(caseId, {
          filename: file.name,
          mimeType: file.type || 'text/plain',
          rawContent: text,
          isBase64Image: false,
        });
        setUploadStage('Evidence validated. Updating investigation graph...');
        setTimeout(() => {
          setIsUploading(false);
          onUploadSuccess(result.changeReport);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  // One-click demo triggers
  const handleLoadDemoImage = async () => {
    setIsUploading(true);
    setUploadStage('Simulating gate camera photograph ingestion...');
    try {
      // Create a small placeholder base64 png for demonstration
      const dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = 400;
      dummyCanvas.height = 240;
      const ctx = dummyCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#222824';
        ctx.fillRect(0, 0, 400, 240);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText('PORT AUTHORITY POLICE — GATE 9 ACCESS', 20, 40);
        ctx.fillText('PLATE: V-7892 (FORD TRANSIT)', 20, 80);
        ctx.fillText('DRIVER: Elena Rostova', 20, 120);
        ctx.fillText('RECEIVER: Marcus Reed (Harbor Holdings)', 20, 160);
        ctx.fillText('DATE: 2024-03-14 23:45:18 EST', 20, 200);
      }
      const dataUrl = dummyCanvas.toDataURL('image/png');

      setUploadStage('Running OCR transcription & entity extraction...');
      const result = await uploadSource(caseId, {
        filename: DEMO_IMAGE_EVIDENCE.filename,
        mimeType: 'image/png',
        rawContent: dataUrl,
        isBase64Image: true,
      });

      setUploadStage('Evidence validated. Bridged components identified!');
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(result.changeReport);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo image ingestion failed');
      setIsUploading(false);
    }
  };

  const handleLoadDemoReport4 = async () => {
    setIsUploading(true);
    setUploadStage('Uploading Report 04 Confidential Informant Debrief...');
    try {
      const result = await uploadSource(caseId, {
        filename: DEMO_REPORT_04.filename,
        mimeType: 'text/plain',
        rawContent: DEMO_REPORT_04.rawText,
        isBase64Image: false,
      });

      setUploadStage('Report 04 integrated. Connected components recalculated.');
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(result.changeReport);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo report ingestion failed');
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: 'transactions' | 'calls' | 'vehicles') => {
    let content = '';
    let name = '';
    if (type === 'transactions') {
      name = 'template_transactions.csv';
      content = `TransactionID,Date,OriginAccount,DestinationAccount,OriginEntity,DestinationEntity,AmountUSD,Reference\nTX-1001,2024-03-10,ACC-110,ACC-220,Company A,Company B,50000.00,"Invoice clearance"`;
    } else if (type === 'calls') {
      name = 'template_call_records.csv';
      content = `CallID,Timestamp,OriginNumber,DestinationNumber,DurationSec,TowerID\nCDR-1001,2024-03-10 14:00:00,+1-555-0100,+1-555-0200,120,TOW-01`;
    } else {
      name = 'template_vehicle_registry.csv';
      content = `Plate,VIN,MakeModel,Year,RegisteredOwner,RegistrationDate,FleetTag,Status\nV-1001,1FTN88210091,Ford Transit,2022,Apex Marine Corp,2022-01-01,TAG-01,Active`;
    }
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#DDDFD7] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#DDDFD7] flex items-center justify-between bg-[#F6F5F1]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#355B4C] flex items-center justify-center text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#222824]">Upload Investigation Records</h3>
              <p className="text-[11px] text-[#626B65]">PDF, TXT, CSV, or Image (JPG, PNG) with forensic OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-[#F7EAEA] border border-[#A13F3F]/30 text-[#A13F3F] text-xs rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#DDDFD7] hover:border-[#355B4C] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F6F5F1]/50 hover:bg-[#E7EEE9]/30 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt,.csv,.jpg,.jpeg,.png"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-white border border-[#DDDFD7] flex items-center justify-center text-[#355B4C] mb-2 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#222824]">
              {selectedFile ? selectedFile.name : 'Click to upload or drag records here'}
            </div>
            <div className="text-[11px] text-[#626B65] mt-1">
              Supports Scanned Reports (OCR), Transaction Ledgers (CSV), CDRs, and Narrative Memos
            </div>
          </div>

          {selectedFile && (
            <button
              onClick={() => processFile(selectedFile)}
              disabled={isUploading}
              className="w-full py-2 bg-[#355B4C] hover:bg-[#29483C] text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadStage || 'Processing...'}</span>
                </>
              ) : (
                <span>Ingest & Extract Records</span>
              )}
            </button>
          )}

          {/* Quick Demonstration Incremental Evidence Buttons */}
          <div className="pt-2 border-t border-[#DDDFD7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#222824] uppercase tracking-wider font-mono text-[10px]">
                Demo Incremental Evidence Pack
              </span>
              <span className="text-[10px] text-[#626B65]">Test incremental graph integration</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLoadDemoImage}
                disabled={isUploading}
                className="p-2.5 text-left rounded border border-[#DDDFD7] hover:border-[#355B4C] bg-white hover:bg-[#F6F5F1] transition-colors group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-medium text-[#222824]">
                  <Camera className="w-3.5 h-3.5 text-[#6D28D9]" />
                  <span>Gate 9 Security Photo (OCR)</span>
                </div>
                <div className="text-[10px] text-[#626B65] mt-1 leading-snug">
                  Extracts OCR text from scanned checkpoint log. Unites Pier 4 and Harbor Holdings!
                </div>
              </button>

              <button
                type="button"
                onClick={handleLoadDemoReport4}
                disabled={isUploading}
                className="p-2.5 text-left rounded border border-[#DDDFD7] hover:border-[#355B4C] bg-white hover:bg-[#F6F5F1] transition-colors group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-medium text-[#222824]">
                  <FileText className="w-3.5 h-3.5 text-[#355B4C]" />
                  <span>Report 04 (Debrief Memo)</span>
                </div>
                <div className="text-[10px] text-[#626B65] mt-1 leading-snug">
                  Adds direct collusion link between Vance and Reed, updating graph and timeline.
                </div>
              </button>
            </div>
          </div>

          {/* Download CSV Templates */}
          <div className="pt-2 border-t border-[#DDDFD7] space-y-1.5">
            <div className="text-[10px] uppercase font-mono text-[#626B65]">
              Download Formatted CSV Templates
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <button
                onClick={() => downloadTemplate('transactions')}
                className="flex items-center space-x-1 px-2 py-1 bg-[#EFEDE7] hover:bg-[#DDDFD7] rounded text-[#222824] transition-colors"
              >
                <Download className="w-3 h-3 text-[#626B65]" />
                <span>Transactions CSV</span>
              </button>
              <button
                onClick={() => downloadTemplate('calls')}
                className="flex items-center space-x-1 px-2 py-1 bg-[#EFEDE7] hover:bg-[#DDDFD7] rounded text-[#222824] transition-colors"
              >
                <Download className="w-3 h-3 text-[#626B65]" />
                <span>Call Records CSV</span>
              </button>
              <button
                onClick={() => downloadTemplate('vehicles')}
                className="flex items-center space-x-1 px-2 py-1 bg-[#EFEDE7] hover:bg-[#DDDFD7] rounded text-[#222824] transition-colors"
              >
                <Download className="w-3 h-3 text-[#626B65]" />
                <span>Vehicle Registry CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
