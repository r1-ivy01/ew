export type EntityType = 
  | 'person' 
  | 'organisation' 
  | 'phone' 
  | 'vehicle' 
  | 'location' 
  | 'account' 
  | 'event';

export type SourceType = 'pdf' | 'txt' | 'csv' | 'image';

export type ProcessingStatus = 
  | 'queued' 
  | 'parsing' 
  | 'extracting' 
  | 'validating' 
  | 'ready' 
  | 'needs_review' 
  | 'failed';

export type AssertionStatus = 
  | 'direct_statement' 
  | 'reported_allegation' 
  | 'inferred' 
  | 'uncertain';

export type ReviewStatus = 
  | 'confirmed' 
  | 'pending_review' 
  | 'disputed';

export interface SourceSegment {
  id: string;
  sourceId: string;
  segmentType: 'text' | 'csv_row' | 'ocr_block';
  pageNumber?: number;
  rowNumber?: number;
  exactText: string;
  context?: string;
}

export interface OcrOutput {
  text: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  method: 'gemini_vision' | 'deterministic_ocr';
  timestamp: string;
  detectedLanguage?: string;
  boundingNote?: string;
}

export interface SourceDocument {
  id: string;
  caseId: string;
  filename: string;
  fileType: SourceType;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  uploadedAt: string;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  rawText?: string;
  originalDataUrl?: string; // For images (base64) to inspect in Evidence Inspector
  ocrOutput?: OcrOutput;
  segments: SourceSegment[];
  rowCount?: number;
  pageCount?: number;
  isNewEvidence?: boolean; // If added after baseline in demo/live
}

export interface Entity {
  id: string;
  caseId: string;
  canonicalName: string;
  entityType: EntityType;
  identifiers: Record<string, string>;
  metadata?: Record<string, any>;
  mentionCount: number;
  isNew?: boolean;
  mergedInto?: string;
  mergedFrom?: string[];
  componentId?: number; // Graph component ID for detecting bridged components
}

export interface EntityMention {
  id: string;
  entityId: string;
  sourceId: string;
  segmentId: string;
  rawMention: string;
  confidence: number;
}

export interface EvidenceReference {
  sourceId: string;
  sourceFilename: string;
  sourceType: SourceType;
  segmentId: string;
  pageOrRow: string;
  exactQuotation: string;
  extractionMethod: 'ai_extraction' | 'deterministic' | 'ocr_ai';
  dateCited?: string;
  isOcrDerived?: boolean;
  originalImageUrl?: string;
}

export interface Relationship {
  id: string;
  caseId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  label: string;
  eventDate?: string;
  eventDateEnd?: string;
  isApproximateDate?: boolean;
  assertionStatus: AssertionStatus;
  reviewStatus: ReviewStatus;
  evidenceReferences: EvidenceReference[];
  isCandidate?: boolean;
  isNew?: boolean; // Newly introduced by recent document
}

export interface IdentityCandidate {
  id: string;
  caseId: string;
  entityAId: string;
  entityBId: string;
  nameA: string;
  nameB: string;
  type: EntityType;
  reason: string;
  supportingFields: { field: string; valA: string; valB: string }[];
  conflictingFields: { field: string; valA: string; valB: string }[];
  status: 'unresolved' | 'confirmed_same' | 'kept_separate';
  sources: { sourceId: string; filename: string }[];
}

export interface Contradiction {
  id: string;
  caseId: string;
  title: string;
  category: 'conflicting_identifiers' | 'overlapping_ownership' | 'conflicting_locations' | 'inconsistent_dates';
  entityIds: string[];
  claimA: {
    text: string;
    sourceFilename: string;
    segmentId: string;
    date?: string;
    pageOrRow?: string;
  };
  claimB: {
    text: string;
    sourceFilename: string;
    segmentId: string;
    date?: string;
    pageOrRow?: string;
  };
  comparisonRule: string;
  status: 'flagged' | 'reviewed_accepted' | 'reviewed_dismissed';
  investigatorNote?: string;
}

export interface PathTestResult {
  sourceEntityId: string;
  targetEntityId: string;
  sourceName: string;
  targetName: string;
  originalPaths: {
    entities: { id: string; name: string; type: EntityType }[];
    relationships: { id: string; label: string; source: string }[];
    explanation: string;
  }[];
  activePaths: {
    entities: { id: string; name: string; type: EntityType }[];
    relationships: { id: string; label: string; source: string }[];
    explanation: string;
  }[];
  excludedItem?: {
    type: 'relationship' | 'source' | 'identity_match';
    id: string;
    label: string;
  };
  doesConnectionSurvive: boolean;
  explanation: string;
  alternativeAvailable: boolean;
}

export interface RAGCitation {
  sourceId: string;
  filename: string;
  segmentId?: string;
  pageOrRow?: string;
  quotation: string;
  entityName?: string;
  sourceType?: SourceType;
  isOcr?: boolean;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: RAGCitation[];
  graphEntities?: string[];
  timestamp: string;
}

export interface HypothesisAssessment {
  id: string;
  caseId: string;
  question: string;
  createdAt: string;
  supportingEvidence: { claim: string; citation: RAGCitation }[];
  conflictingEvidence: { claim: string; citation: RAGCitation }[];
  missingInformation: string[];
  alternativeExplanations: string[];
  suggestedVerificationSteps: string[];
  isOutdated?: boolean;
}

export interface NewlyConnectedComponent {
  group1Entities: string[];
  group2Entities: string[];
  bridgeEntity: string;
  description: string;
  newRelationshipId: string;
}

export interface ChangeReport {
  sourceId: string;
  sourceFilename: string;
  timestamp: string;
  newEntitiesCount: number;
  newEntities: { id: string; name: string; type: EntityType }[];
  updatedEntities: { id: string; name: string; additionalMentions: number }[];
  newRelationshipsCount: number;
  newRelationships: { id: string; from: string; to: string; type: string }[];
  reinforcedRelationshipsCount: number;
  newlyConnectedComponents: NewlyConnectedComponent[];
  newContradictionsCount: number;
  newIdentityCandidatesCount: number;
  summaryText: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  eventDate: string; // ISO date or approximate date string
  eventDateEnd?: string;
  isApproximate?: boolean;
  discoveryDate: string; // When document was uploaded/indexed
  sourceId: string;
  sourceFilename: string;
  pageOrRow?: string;
  entityIds: string[];
  sourceType: SourceType;
  isOcr?: boolean;
}

export interface InvestigationBrief {
  id: string;
  caseId: string;
  title: string;
  generatedAt: string;
  caseRevision: string;
  overview: string;
  sourcesConsidered: { filename: string; type: SourceType; dateAdded: string }[];
  keyEntities: { name: string; type: EntityType; role: string }[];
  timeline: { date: string; title: string; source: string }[];
  selectedConnections: { from: string; to: string; relation: string; evidence: string }[];
  contradictions: { title: string; detail: string; status: string }[];
  unresolvedIdentities: { nameA: string; nameB: string; note: string }[];
  verificationSteps: string[];
  conclusion: string;
}

export interface Case {
  id: string;
  name: string;
  description: string;
  referenceNumber?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  isSynthetic: boolean;
  sourceCount: number;
  entityCount: number;
  relationshipCount: number;
  unresolvedIdentityCount: number;
  contradictionCount: number;
}
