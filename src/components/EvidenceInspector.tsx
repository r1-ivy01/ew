import React, { useState } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Camera,
  Image as ImageIcon,
  Quote,
  Eye,
  Calendar,
  Building,
  User,
  Phone,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Entity, Relationship, EvidenceReference } from '../types';

interface EvidenceInspectorProps {
  entity: Entity | null;
  relationship: Relationship | null;
  entities: Entity[];
  onClose: () => void;
  onOpenSourceModal?: (sourceId: string) => void;
  onUpdateReviewStatus?: (relId: string, status: 'confirmed' | 'pending_review' | 'disputed') => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  entity,
  relationship,
  entities,
  onClose,
  onOpenSourceModal,
  onUpdateReviewStatus,
}) => {
  const [activeImageModalUrl, setActiveImageModalUrl] = useState<string | null>(null);

  if (!entity && !relationship) {
    return null;
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <User className="w-4 h-4 text-[#475569]" />;
      case 'organisation': return <Building className="w-4 h-4 text-[#355B4C]" />;
      case 'phone': return <Phone className="w-4 h-4 text-[#6D28D9]" />;
      case 'vehicle': return <Truck className="w-4 h-4 text-[#B45309]" />;
      case 'location': return <MapPin className="w-4 h-4 text-[#B91C1C]" />;
      case 'account': return <CreditCard className="w-4 h-4 text-[#0369A1]" />;
      default: return <HelpCircle className="w-4 h-4 text-[#626B65]" />;
    }
  };

  return (
    <>
      <aside className="w-[360px] bg-white border-l border-[#DDDFD7] flex flex-col h-full shrink-0 shadow-lg z-20 overflow-hidden">
        {/* Inspector Header */}
        <div className="h-14 px-4 border-b border-[#DDDFD7] flex items-center justify-between bg-[#F6F5F1]">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-xs font-semibold text-[#222824] uppercase tracking-wider font-mono">
              Evidence Inspector
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFEDE7] text-[#626B65]">
              {relationship ? 'Relationship' : 'Entity'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* RELATIONSHIP VIEW */}
          {relationship && (
            <div className="space-y-4">
              {/* Primary Relationship Summary */}
              <div>
                <div className="text-[10px] uppercase font-mono text-[#626B65] tracking-wider">
                  Assertion & Review State
                </div>
                <h3 className="text-base font-semibold text-[#222824] mt-1 leading-snug">
                  {relationship.label}
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium ${
                    relationship.assertionStatus === 'direct_statement'
                      ? 'bg-[#E7EEE9] text-[#29483C]'
                      : 'bg-[#F8F0DE] text-[#865817]'
                  }`}>
                    {relationship.assertionStatus === 'direct_statement' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span className="capitalize">{relationship.assertionStatus.replace('_', ' ')}</span>
                  </span>

                  <span className="text-xs text-[#626B65] font-mono">
                    {relationship.reviewStatus}
                  </span>
                </div>
              </div>

              {/* Connected Entities */}
              <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#DDDFD7] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#626B65]">Connected Nodes</div>
                <div className="space-y-1 text-xs">
                  {(() => {
                    const src = entities.find(e => e.id === relationship.sourceEntityId);
                    const tgt = entities.find(e => e.id === relationship.targetEntityId);
                    return (
                      <>
                        <div className="flex items-center space-x-2 text-[#222824]">
                          {getEntityIcon(src?.entityType || 'person')}
                          <span className="font-semibold">{src?.canonicalName || relationship.sourceEntityId}</span>
                        </div>
                        <div className="pl-6 text-[11px] text-[#626B65] font-mono">↓ {relationship.relationshipType}</div>
                        <div className="flex items-center space-x-2 text-[#222824]">
                          {getEntityIcon(tgt?.entityType || 'person')}
                          <span className="font-semibold">{tgt?.canonicalName || relationship.targetEntityId}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Event Date if present */}
              {relationship.eventDate && (
                <div className="flex items-center space-x-2 text-xs text-[#626B65]">
                  <Calendar className="w-3.5 h-3.5 text-[#355B4C]" />
                  <span>Documented Date: </span>
                  <span className="font-mono text-[#222824] font-medium">{relationship.eventDate}</span>
                </div>
              )}

              {/* Multiple Supporting Evidence Records */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase font-mono tracking-wider text-[#222824] font-semibold">
                    Supporting Sources ({relationship.evidenceReferences.length})
                  </div>
                  <span className="text-[10px] text-[#626B65]">Source-linked chain</span>
                </div>

                {relationship.evidenceReferences.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border border-[#DDDFD7] bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 truncate">
                        {ref.isOcrDerived ? (
                          <Camera className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#355B4C] shrink-0" />
                        )}
                        <span className="font-semibold text-[#222824] truncate" title={ref.sourceFilename}>
                          {ref.sourceFilename}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#626B65] shrink-0">
                        {ref.pageOrRow}
                      </span>
                    </div>

                    {/* Verbatim Quotation / Context */}
                    <div className="p-2 bg-[#F6F5F1] rounded text-xs text-[#222824] italic border-l-2 border-[#355B4C]">
                      "{ref.exactQuotation}"
                    </div>

                    {/* OCR / Image Attachment Preview */}
                    {ref.originalImageUrl && (
                      <div className="pt-1">
                        <div className="text-[10px] uppercase font-mono text-[#626B65] mb-1">
                          Original Image Document
                        </div>
                        <div
                          onClick={() => setActiveImageModalUrl(ref.originalImageUrl!)}
                          className="relative group cursor-pointer border border-[#DDDFD7] rounded overflow-hidden max-h-32 bg-black/5"
                        >
                          <img
                            src={ref.originalImageUrl}
                            alt="Evidence scan"
                            className="w-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity space-x-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Original Scan</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#626B65] pt-1">
                      <span className="capitalize">Method: {ref.extractionMethod.replace('_', ' ')}</span>
                      {ref.dateCited && <span>Cited: {ref.dateCited}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Actions */}
              {onUpdateReviewStatus && (
                <div className="pt-3 border-t border-[#DDDFD7] space-y-2">
                  <div className="text-[11px] font-semibold text-[#222824]">Investigator Verification</div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      onClick={() => onUpdateReviewStatus(relationship.id, 'confirmed')}
                      className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
                        relationship.reviewStatus === 'confirmed'
                          ? 'bg-[#E7EEE9] border-[#355B4C] text-[#29483C]'
                          : 'border-[#DDDFD7] hover:bg-[#EFEDE7]'
                      }`}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onUpdateReviewStatus(relationship.id, 'pending_review')}
                      className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
                        relationship.reviewStatus === 'pending_review'
                          ? 'bg-[#F8F0DE] border-[#865817] text-[#865817]'
                          : 'border-[#DDDFD7] hover:bg-[#EFEDE7]'
                      }`}
                    >
                      Flag Review
                    </button>
                    <button
                      onClick={() => onUpdateReviewStatus(relationship.id, 'disputed')}
                      className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
                        relationship.reviewStatus === 'disputed'
                          ? 'bg-[#F7EAEA] border-[#A13F3F] text-[#A13F3F]'
                          : 'border-[#DDDFD7] hover:bg-[#EFEDE7]'
                      }`}
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ENTITY VIEW */}
          {entity && !relationship && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-1.5 text-[10px] uppercase font-mono text-[#626B65] tracking-wider">
                  {getEntityIcon(entity.entityType)}
                  <span>{entity.entityType}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#222824] mt-1">
                  {entity.canonicalName}
                </h3>
                <div className="text-xs text-[#626B65] mt-0.5">
                  Mentions in case: <span className="font-mono text-[#222824] font-semibold">{entity.mentionCount}</span>
                </div>
              </div>

              {/* Identifiers & Metadata */}
              <div className="p-3 bg-[#F6F5F1] rounded-lg border border-[#DDDFD7] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#626B65]">Extracted Identifiers</div>
                {Object.keys(entity.identifiers).length === 0 ? (
                  <div className="text-xs text-[#626B65] italic">No unique identifiers recorded</div>
                ) : (
                  <div className="space-y-1 text-xs">
                    {Object.entries(entity.identifiers).map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between">
                        <span className="text-[#626B65] capitalize">{k}:</span>
                        <span className="font-mono font-medium text-[#222824] text-right truncate max-w-[180px]">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Relationships in Case */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-mono text-[#222824] font-semibold">
                  Active Case Relationships
                </div>
                <div className="space-y-1.5">
                  {entities
                    .filter(other => other.id !== entity.id)
                    .map(other => {
                      return null; // Relationships are best viewed from graph
                    })}
                  <div className="text-xs text-[#626B65]">
                    Click any connected link on the canvas to inspect its source references.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modal image viewer for original scanned images */}
      {activeImageModalUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
          onClick={() => setActiveImageModalUrl(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#DDDFD7] pb-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#355B4C]" />
                <span className="font-semibold text-sm text-[#222824]">Original Scanned Document / Photo</span>
              </div>
              <button
                onClick={() => setActiveImageModalUrl(null)}
                className="p-1 rounded text-[#626B65] hover:text-[#222824]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-[#F6F5F1] p-2 rounded">
              <img
                src={activeImageModalUrl}
                alt="Original Evidence Document"
                className="max-w-full max-h-[65vh] object-contain rounded border border-[#DDDFD7]"
              />
            </div>
            <div className="text-xs text-[#626B65] flex items-center justify-between pt-1">
              <span>Verified raw attachment — Optical character extraction completed</span>
              <button
                onClick={() => setActiveImageModalUrl(null)}
                className="px-3 py-1 bg-[#355B4C] text-white rounded text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
