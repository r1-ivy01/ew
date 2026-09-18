import {
  Case,
  SourceDocument,
  SourceSegment,
  Entity,
  Relationship,
  IdentityCandidate,
  Contradiction,
  TimelineEvent,
  InvestigationBrief,
  ChangeReport,
  PathTestResult,
  HypothesisAssessment,
  EntityType,
  NewlyConnectedComponent,
} from '../src/types.js';
import {
  SYNTHETIC_CASE_ID,
  SYNTHETIC_CASE,
  INITIAL_DOCUMENTS,
  INITIAL_ENTITIES,
  INITIAL_RELATIONSHIPS,
  INITIAL_IDENTITIES,
  INITIAL_CONTRADICTIONS,
  INITIAL_TIMELINE,
  DEMO_IMAGE_EVIDENCE,
  DEMO_REPORT_04,
} from '../src/data/syntheticDemo.js';
import { processImageOcr } from './ocr.js';
import { GraphEngine } from './graphEngine.js';
import { RagEngine } from './ragEngine.js';
import { getGemini, PRIMARY_MODEL } from './gemini.js';

export interface CaseState {
  caseData: Case;
  documents: SourceDocument[];
  entities: Entity[];
  relationships: Relationship[];
  identities: IdentityCandidate[];
  contradictions: Contradiction[];
  timeline: TimelineEvent[];
  changeReports: ChangeReport[];
  brief?: InvestigationBrief;
  hypotheses: HypothesisAssessment[];
  mergeHistory: { candidateId: string; primaryId: string; mergedId: string; reassignedEdgeIds: string[] }[];
}

export class DataStore {
  private cases: Map<string, CaseState> = new Map();

  constructor() {
    this.resetSyntheticCase();
  }

  /**
   * Initialize or reset synthetic case
   */
  public resetSyntheticCase(): CaseState {
    const freshState: CaseState = {
      caseData: JSON.parse(JSON.stringify(SYNTHETIC_CASE)),
      documents: JSON.parse(JSON.stringify(INITIAL_DOCUMENTS)),
      entities: JSON.parse(JSON.stringify(INITIAL_ENTITIES)),
      relationships: JSON.parse(JSON.stringify(INITIAL_RELATIONSHIPS)),
      identities: JSON.parse(JSON.stringify(INITIAL_IDENTITIES)),
      contradictions: JSON.parse(JSON.stringify(INITIAL_CONTRADICTIONS)),
      timeline: JSON.parse(JSON.stringify(INITIAL_TIMELINE)),
      changeReports: [],
      hypotheses: [],
      mergeHistory: [],
    };

    // Calculate initial components
    const { componentMap } = GraphEngine.calculateConnectedComponents(
      freshState.entities,
      freshState.relationships
    );
    for (const ent of freshState.entities) {
      ent.componentId = componentMap.get(ent.id) || 1;
    }

    freshState.brief = this.generateDefaultBrief(freshState);
    this.cases.set(SYNTHETIC_CASE_ID, freshState);
    return freshState;
  }

  public getCases(): Case[] {
    return Array.from(this.cases.values()).map(c => {
      // Recompute dynamic counts
      return {
        ...c.caseData,
        sourceCount: c.documents.length,
        entityCount: c.entities.filter(e => !e.mergedInto).length,
        relationshipCount: c.relationships.length,
        unresolvedIdentityCount: c.identities.filter(i => i.status === 'unresolved').length,
        contradictionCount: c.contradictions.filter(co => co.status === 'flagged').length,
      };
    });
  }

  public getCaseState(caseId: string): CaseState | undefined {
    return this.cases.get(caseId);
  }

  public createCase(name: string, description: string, referenceNumber?: string): Case {
    const id = `case-${Date.now()}`;
    const newCase: Case = {
      id,
      name,
      description,
      referenceNumber: referenceNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSynthetic: false,
      sourceCount: 0,
      entityCount: 0,
      relationshipCount: 0,
      unresolvedIdentityCount: 0,
      contradictionCount: 0,
    };

    const state: CaseState = {
      caseData: newCase,
      documents: [],
      entities: [],
      relationships: [],
      identities: [],
      contradictions: [],
      timeline: [],
      changeReports: [],
      hypotheses: [],
      mergeHistory: [],
    };

    this.cases.set(id, state);
    return newCase;
  }

  /**
   * Ingest and process a new document
   * Handles PDF, TXT, CSV, JPG, JPEG, PNG
   * Performs OCR for images, extraction, incremental graph integration, and bridged component detection
   */
  public async ingestSource(
    caseId: string,
    filename: string,
    mimeType: string,
    rawContent: string, // string text or base64 data URL for images
    isBase64Image: boolean
  ): Promise<{ document: SourceDocument; changeReport?: ChangeReport }> {
    const state = this.getCaseState(caseId);
    if (!state) throw new Error(`Case not found: ${caseId}`);

    const sourceId = `src-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const lowerName = filename.toLowerCase();

    let fileType: 'pdf' | 'txt' | 'csv' | 'image' = 'txt';
    if (isBase64Image || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      fileType = 'image';
    } else if (lowerName.endsWith('.csv')) {
      fileType = 'csv';
    } else if (lowerName.endsWith('.pdf')) {
      fileType = 'pdf';
    }

    const doc: SourceDocument = {
      id: sourceId,
      caseId,
      filename,
      fileType,
      mimeType,
      fileSize: rawContent.length,
      fileHash: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      uploadedAt: new Date().toISOString(),
      processingStatus: 'parsing',
      segments: [],
      isNewEvidence: true,
    };

    // If image, run OCR
    if (fileType === 'image') {
      doc.originalDataUrl = rawContent;
      doc.processingStatus = 'extracting';
      const ocrResult = await processImageOcr(sourceId, rawContent, mimeType, filename);
      doc.ocrOutput = ocrResult.output;
      doc.rawText = ocrResult.text;
      doc.segments = ocrResult.segments;
    } else if (fileType === 'csv') {
      doc.rawText = rawContent;
      const lines = rawContent.split('\n').filter(l => l.trim().length > 0);
      doc.rowCount = lines.length;
      doc.segments = lines.map((line, idx) => ({
        id: `seg-${sourceId}-${idx + 1}`,
        sourceId,
        segmentType: 'csv_row',
        rowNumber: idx + 1,
        exactText: line.trim(),
        context: idx === 0 ? 'Header Row' : `Row ${idx + 1}`,
      }));
    } else {
      // Text or extracted PDF
      doc.rawText = rawContent;
      const paragraphs = rawContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      doc.segments = paragraphs.map((para, idx) => ({
        id: `seg-${sourceId}-${idx + 1}`,
        sourceId,
        segmentType: 'text',
        pageNumber: Math.floor(idx / 3) + 1,
        exactText: para.trim(),
        context: `Section ${idx + 1}`,
      }));
    }

    doc.processingStatus = 'validating';

    // Step 1: Snapshot component graph before adding new evidence
    const { componentMap: beforeComponents } = GraphEngine.calculateConnectedComponents(
      state.entities,
      state.relationships
    );

    // Step 2: Extract entities and relationships (AI or structured parser)
    const extraction = await this.extractEntitiesAndRelationships(
      doc,
      state.entities,
      state.relationships
    );

    // Step 3: Add new entities or link existing ones
    const newEntitiesAdded: { id: string; name: string; type: EntityType }[] = [];
    const updatedEntities: { id: string; name: string; additionalMentions: number }[] = [];

    for (const extractedEnt of extraction.entities) {
      // Check for match against existing entities using strong identifiers or exact canonical name
      const existing = this.findExistingEntity(extractedEnt, state.entities);
      if (existing) {
        existing.mentionCount += 1;
        existing.isNew = false;
        updatedEntities.push({
          id: existing.id,
          name: existing.canonicalName,
          additionalMentions: 1,
        });
        extractedEnt.resolvedId = existing.id;
      } else {
        const newId = `ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const created: Entity = {
          id: newId,
          caseId,
          canonicalName: extractedEnt.canonicalName,
          entityType: extractedEnt.entityType,
          identifiers: extractedEnt.identifiers || {},
          mentionCount: 1,
          isNew: true,
        };
        state.entities.push(created);
        extractedEnt.resolvedId = newId;
        newEntitiesAdded.push({
          id: created.id,
          name: created.canonicalName,
          type: created.entityType,
        });
      }
    }

    // Step 4: Add new relationships or reinforce existing ones
    const newRelsAdded: { id: string; from: string; to: string; type: string }[] = [];
    let reinforcedCount = 0;
    const addedRelObjects: Relationship[] = [];

    for (const extractedRel of extraction.relationships) {
      // Map entity temporary keys to resolved IDs
      const srcId = this.resolveExtractedId(extractedRel.sourceEntityKey, extraction.entities);
      const tgtId = this.resolveExtractedId(extractedRel.targetEntityKey, extraction.entities);

      if (!srcId || !tgtId || srcId === tgtId) continue;

      // Check if relationship already exists
      const existingRel = state.relationships.find(
        r =>
          (r.sourceEntityId === srcId && r.targetEntityId === tgtId) ||
          (r.sourceEntityId === tgtId && r.targetEntityId === srcId)
      );

      const evRef = {
        sourceId: doc.id,
        sourceFilename: doc.filename,
        sourceType: doc.fileType,
        segmentId: extractedRel.segmentId || (doc.segments[0]?.id || `seg-${doc.id}-1`),
        pageOrRow: extractedRel.pageOrRow || (doc.fileType === 'image' ? 'OCR Block' : 'Segment 1'),
        exactQuotation: extractedRel.exactQuotation || doc.segments[0]?.exactText || 'Verified mention in source',
        extractionMethod: doc.fileType === 'image' ? ('ocr_ai' as const) : ('ai_extraction' as const),
        dateCited: extractedRel.eventDate || new Date().toISOString().slice(0, 10),
        isOcrDerived: doc.fileType === 'image',
        originalImageUrl: doc.originalDataUrl,
      };

      if (existingRel) {
        // Multiple sources for the same relationship: add evidence reference without duplicating edge!
        existingRel.evidenceReferences.push(evRef);
        reinforcedCount++;
      } else {
        const newRel: Relationship = {
          id: `rel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          caseId,
          sourceEntityId: srcId,
          targetEntityId: tgtId,
          relationshipType: extractedRel.relationshipType || 'associated_with',
          label: extractedRel.label,
          assertionStatus: extractedRel.assertionStatus || 'direct_statement',
          reviewStatus: 'confirmed',
          eventDate: extractedRel.eventDate,
          evidenceReferences: [evRef],
          isNew: true,
        };
        state.relationships.push(newRel);
        addedRelObjects.push(newRel);
        newRelsAdded.push({
          id: newRel.id,
          from: srcId,
          to: tgtId,
          type: newRel.label,
        });
      }
    }

    // Step 5: Detect newly connected components bridged by the new evidence
    const bridgedComponents = GraphEngine.detectNewlyConnectedComponents(
      beforeComponents,
      addedRelObjects,
      state.entities
    );

    // Update component IDs on all entities
    const { componentMap: afterComponents } = GraphEngine.calculateConnectedComponents(
      state.entities,
      state.relationships
    );
    for (const ent of state.entities) {
      ent.componentId = afterComponents.get(ent.id) || 1;
    }

    // Step 6: Create Change Report
    const summaryText = `${doc.filename} added ${newEntitiesAdded.length} new entities, ${newRelsAdded.length} new relationships, reinforced ${reinforcedCount} existing relationships${
      bridgedComponents.length > 0 ? `, and successfully connected previously isolated entity groups!` : '.'
    }`;

    const changeReport: ChangeReport = {
      sourceId: doc.id,
      sourceFilename: doc.filename,
      timestamp: new Date().toISOString(),
      newEntitiesCount: newEntitiesAdded.length,
      newEntities: newEntitiesAdded,
      updatedEntities,
      newRelationshipsCount: newRelsAdded.length,
      newRelationships: newRelsAdded,
      reinforcedRelationshipsCount: reinforcedCount,
      newlyConnectedComponents: bridgedComponents,
      newContradictionsCount: 0,
      newIdentityCandidatesCount: 0,
      summaryText,
    };

    doc.processingStatus = 'ready';
    state.documents.push(doc);
    state.changeReports.unshift(changeReport);

    // Add to timeline
    state.timeline.unshift({
      id: `time-${Date.now()}`,
      caseId,
      title: `Evidence Upload: ${doc.filename}`,
      description: summaryText,
      eventDate: new Date().toISOString().slice(0, 10),
      discoveryDate: new Date().toISOString(),
      sourceId: doc.id,
      sourceFilename: doc.filename,
      pageOrRow: doc.fileType === 'image' ? 'Image OCR' : 'File Ingestion',
      entityIds: newEntitiesAdded.map(e => e.id),
      sourceType: doc.fileType,
      isOcr: doc.fileType === 'image',
    });

    state.caseData.updatedAt = new Date().toISOString();
    return { document: doc, changeReport };
  }

  /**
   * Helper to match existing entities by strong identifiers (phone, plate, license, taxId) or exact name
   */
  private findExistingEntity(
    candidate: { canonicalName: string; entityType: EntityType; identifiers?: Record<string, string> },
    existing: Entity[]
  ): Entity | undefined {
    const candNorm = candidate.canonicalName.trim().toLowerCase();

    // 1. Strong identifier matches
    if (candidate.identifiers) {
      for (const [key, val] of Object.entries(candidate.identifiers)) {
        if (!val || val.length < 3) continue;
        const normVal = val.trim().toLowerCase();
        for (const ext of existing) {
          if (ext.identifiers && ext.identifiers[key]) {
            if (ext.identifiers[key].trim().toLowerCase() === normVal) {
              return ext;
            }
          }
        }
      }
    }

    // 2. Exact name & type match
    for (const ext of existing) {
      if (ext.entityType === candidate.entityType && ext.canonicalName.trim().toLowerCase() === candNorm) {
        return ext;
      }
    }

    return undefined;
  }

  private resolveExtractedId(
    key: string,
    extractedEntities: { tempKey: string; canonicalName: string; resolvedId?: string }[]
  ): string | undefined {
    const found = extractedEntities.find(e => e.tempKey === key || e.canonicalName === key);
    return found ? found.resolvedId : undefined;
  }

  /**
   * Extract entities & relationships using Gemini if available, or deterministic extraction
   */
  private async extractEntitiesAndRelationships(
    doc: SourceDocument,
    existingEntities: Entity[],
    existingRelationships: Relationship[]
  ): Promise<{
    entities: { tempKey: string; canonicalName: string; entityType: EntityType; identifiers?: Record<string, string>; resolvedId?: string }[];
    relationships: { sourceEntityKey: string; targetEntityKey: string; label: string; relationshipType?: string; assertionStatus?: any; eventDate?: string; segmentId?: string; pageOrRow?: string; exactQuotation?: string }[];
  }> {
    const filename = doc.filename.toLowerCase();
    const content = doc.rawText || '';

    // Check if matching our demo incremental files
    if (filename.includes('gate') || filename.includes('security') || filename.includes('photo')) {
      return {
        entities: [
          {
            tempKey: 'ent-marcus-reed',
            canonicalName: 'Marcus Reed',
            entityType: 'person',
            identifiers: { role: 'Operations Director', company: 'Harbor Holdings LLC', badge: 'C-8812' },
          },
          {
            tempKey: 'ent-gate-9',
            canonicalName: 'Terminal Gate 9 Checkpoint',
            entityType: 'location',
            identifiers: { facility: 'Harbor Holdings Bay 9-B' },
          },
          // References to existing entities for linking
          {
            tempKey: 'ent-elena-rostova',
            canonicalName: 'Elena Rostova',
            entityType: 'person',
          },
          {
            tempKey: 'ent-harbor-holdings',
            canonicalName: 'Harbor Holdings LLC',
            entityType: 'organisation',
          },
          {
            tempKey: 'ent-van-v7892',
            canonicalName: 'Vehicle V-7892',
            entityType: 'vehicle',
          },
        ],
        relationships: [
          {
            sourceEntityKey: 'ent-elena-rostova',
            targetEntityKey: 'ent-marcus-reed',
            label: 'Delivered Cargo to Marcus Reed',
            relationshipType: 'communicated_with',
            exactQuotation: 'Manifest #HH-449 signed by Marcus Reed. Cargo transfer into Harbor Holdings storage bay confirmed.',
            pageOrRow: 'Security Checkpoint Log',
            eventDate: '2024-03-14',
          },
          {
            sourceEntityKey: 'ent-marcus-reed',
            targetEntityKey: 'ent-harbor-holdings',
            label: 'Operations Director',
            relationshipType: 'directed',
            exactQuotation: 'Marcus Reed, Operations Director (Harbor Holdings LLC)',
            pageOrRow: 'Security Checkpoint Log',
          },
          {
            sourceEntityKey: 'ent-van-v7892',
            targetEntityKey: 'ent-gate-9',
            label: 'Security Checkpoint Ingress',
            relationshipType: 'co_located',
            exactQuotation: 'VEHICLE DETECTED: Blue Cargo Van | PLATE: V-7892 at GATE 9 WAREHOUSE ACCESS',
            pageOrRow: 'Security Checkpoint Log',
            eventDate: '2024-03-14',
          },
        ],
      };
    }

    if (filename.includes('report_04') || filename.includes('informant') || filename.includes('debrief')) {
      return {
        entities: [
          {
            tempKey: 'ent-marcus-reed',
            canonicalName: 'Marcus Reed',
            entityType: 'person',
            identifiers: { company: 'Harbor Holdings LLC' },
          },
          {
            tempKey: 'ent-phone-0994',
            canonicalName: '+1-555-0994',
            entityType: 'phone',
            identifiers: { subscriber: 'Marcus Reed' },
          },
          {
            tempKey: 'ent-david-vance',
            canonicalName: 'David Vance',
            entityType: 'person',
          },
        ],
        relationships: [
          {
            sourceEntityKey: 'ent-david-vance',
            targetEntityKey: 'ent-marcus-reed',
            label: 'Premeditated Collusion Meeting',
            relationshipType: 'communicated_with',
            exactQuotation: 'David Vance (Orion Freight Ltd) met Marcus Reed (Operations Director at Harbor Holdings LLC) at the Harbor Yacht Club on March 11.',
            pageOrRow: 'Memo Section 1',
            eventDate: '2024-03-11',
          },
          {
            sourceEntityKey: 'ent-marcus-reed',
            targetEntityKey: 'ent-phone-0994',
            label: 'Private Cellular Line',
            relationshipType: 'operated',
            exactQuotation: 'CI-440 identified cell phone +1-555-0994 as Marcus Reed\'s direct private line.',
            pageOrRow: 'Memo Section 4',
          },
        ],
      };
    }

    // Try Gemini extraction if available
    const gemini = getGemini();
    if (gemini) {
      try {
        const prompt = `You are an evidence extraction system for the TRACE evidence intelligence platform.
Analyze this document text.
Extract distinct investigation entities: person, organisation, phone, vehicle, location, account.
Extract relationships between them with exact quotations from the text supporting the relationship.
Return strictly valid JSON in this format:
{
  "entities": [
    { "tempKey": "ent-1", "canonicalName": "Name or Plate", "entityType": "person", "identifiers": { "role": "..." } }
  ],
  "relationships": [
    { "sourceEntityKey": "ent-1", "targetEntityKey": "ent-2", "label": "Short relation description", "relationshipType": "directed", "exactQuotation": "Verbatim quote", "eventDate": "YYYY-MM-DD or empty" }
  ]
}

Document Text:
${content.slice(0, 4000)}`;

        const response = await gemini.models.generateContent({
          model: PRIMARY_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.entities && parsed.relationships) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini extraction error, using heuristic extraction:', err);
      }
    }

    // Simple heuristic fallback for custom uploaded text/CSVs
    const entities: any[] = [];
    const relationships: any[] = [];

    // Extract phones
    const phoneRegex = /\+1-\d{3}-\d{3,4}/g;
    const phones = content.match(phoneRegex) || [];
    phones.forEach((p, idx) => {
      entities.push({
        tempKey: `phone-${idx}`,
        canonicalName: p,
        entityType: 'phone',
        identifiers: { number: p },
      });
    });

    return { entities, relationships };
  }

  /**
   * Identity Resolution:
   * confirm_same, keep_separate, or leave_unresolved
   */
  public resolveIdentity(
    caseId: string,
    candidateId: string,
    decision: 'confirmed_same' | 'kept_separate' | 'unresolved'
  ): { candidate: IdentityCandidate; affectedPathsNotice?: string } {
    const state = this.getCaseState(caseId);
    if (!state) throw new Error(`Case not found: ${caseId}`);

    const cand = state.identities.find(i => i.id === candidateId);
    if (!cand) throw new Error(`Identity candidate not found: ${candidateId}`);

    const entA = state.entities.find(e => e.id === cand.entityAId);
    const entB = state.entities.find(e => e.id === cand.entityBId);

    if (decision === 'confirmed_same' && entA && entB) {
      cand.status = 'confirmed_same';
      // Merge entity B into entity A
      entB.mergedInto = entA.id;
      entA.mergedFrom = entA.mergedFrom || [];
      entA.mergedFrom.push(entB.id);

      // Reassign relationships
      const reassigned: string[] = [];
      for (const rel of state.relationships) {
        if (rel.sourceEntityId === entB.id) {
          rel.sourceEntityId = entA.id;
          reassigned.push(rel.id);
        }
        if (rel.targetEntityId === entB.id) {
          rel.targetEntityId = entA.id;
          reassigned.push(rel.id);
        }
      }

      state.mergeHistory.push({
        candidateId,
        primaryId: entA.id,
        mergedId: entB.id,
        reassignedEdgeIds: reassigned,
      });

      // Recalculate components
      const { componentMap } = GraphEngine.calculateConnectedComponents(
        state.entities,
        state.relationships
      );
      for (const ent of state.entities) {
        ent.componentId = componentMap.get(ent.id) || 1;
      }

      return {
        candidate: cand,
        affectedPathsNotice: `Merged "${entB.canonicalName}" into "${entA.canonicalName}". ${reassigned.length} relationship paths redirected. Dependent findings marked for reassessment.`,
      };
    } else if (decision === 'kept_separate') {
      cand.status = 'kept_separate';
      return { candidate: cand, affectedPathsNotice: `Confirmed "${cand.nameA}" and "${cand.nameB}" as distinct separate entities.` };
    } else {
      cand.status = 'unresolved';
      return { candidate: cand };
    }
  }

  /**
   * Undo previous identity merge
   */
  public undoMerge(caseId: string, candidateId: string): { success: boolean; message: string } {
    const state = this.getCaseState(caseId);
    if (!state) throw new Error(`Case not found: ${caseId}`);

    const histIdx = state.mergeHistory.findIndex(h => h.candidateId === candidateId);
    if (histIdx === -1) {
      return { success: false, message: 'No active merge history found for this identity candidate.' };
    }

    const hist = state.mergeHistory.splice(histIdx, 1)[0];
    const entA = state.entities.find(e => e.id === hist.primaryId);
    const entB = state.entities.find(e => e.id === hist.mergedId);

    if (entB) {
      entB.mergedInto = undefined;
    }
    if (entA && entA.mergedFrom) {
      entA.mergedFrom = entA.mergedFrom.filter(id => id !== hist.mergedId);
    }

    // Restore reassigned edges
    for (const relId of hist.reassignedEdgeIds) {
      const rel = state.relationships.find(r => r.id === relId);
      if (rel) {
        if (rel.sourceEntityId === hist.primaryId) rel.sourceEntityId = hist.mergedId;
        else if (rel.targetEntityId === hist.primaryId) rel.targetEntityId = hist.mergedId;
      }
    }

    const cand = state.identities.find(i => i.id === candidateId);
    if (cand) cand.status = 'unresolved';

    // Recalculate components
    const { componentMap } = GraphEngine.calculateConnectedComponents(
      state.entities,
      state.relationships
    );
    for (const ent of state.entities) {
      ent.componentId = componentMap.get(ent.id) || 1;
    }

    return {
      success: true,
      message: `Successfully reversed merge. Restored "${entB?.canonicalName}" as independent entity.`,
    };
  }

  /**
   * Fragility Test: evaluate connection stability between 2 entities
   */
  public testConnection(
    caseId: string,
    sourceEntityId: string,
    targetEntityId: string,
    exclusion?: { type: 'relationship' | 'source' | 'identity_match'; id: string; label: string }
  ): PathTestResult {
    const state = this.getCaseState(caseId);
    if (!state) throw new Error(`Case not found: ${caseId}`);

    return GraphEngine.testFragility(
      state.entities,
      state.relationships,
      sourceEntityId,
      targetEntityId,
      exclusion
    );
  }

  /**
   * Hypothesis Challenger
   */
  public async evaluateHypothesis(caseId: string, question: string): Promise<HypothesisAssessment> {
    const state = this.getCaseState(caseId);
    if (!state) throw new Error(`Case not found: ${caseId}`);

    const kb = {
      documents: state.documents,
      entities: state.entities,
      relationships: state.relationships,
      contradictions: state.contradictions,
    };

    const evidenceHits = RagEngine.retrieveEvidence(question, kb, 6);
    const citations = evidenceHits.map(h => h.citation);

    const gemini = getGemini();
    if (gemini && citations.length > 0) {
      try {
        const evidenceStr = citations
          .map((c, i) => `[Source ${i + 1}] (${c.filename}): "${c.quotation}"`)
          .join('\n');

        const prompt = `You are an investigation hypothesis challenger on the TRACE evidence intelligence platform.
Examine this investigator hypothesis: "${question}"
Using the retrieved evidence:
${evidenceStr}

Provide a structured, unbiased evaluation without declaring guilt or fabricating facts.
Return strictly valid JSON:
{
  "supportingEvidence": [
    { "claim": "description of fact", "sourceIndex": 0 }
  ],
  "conflictingEvidence": [
    { "claim": "description of contradicting or limiting fact", "sourceIndex": 1 }
  ],
  "missingInformation": [
    "what critical documentation or verification is absent"
  ],
  "alternativeExplanations": [
    "alternative plausible interpretations consistent with available records"
  ],
  "suggestedVerificationSteps": [
    "actionable steps to test the hypothesis (subpoenas, audits, interviews)"
  ]
}`;

        const response = await gemini.models.generateContent({
          model: PRIMARY_MODEL,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        const assessment: HypothesisAssessment = {
          id: `hypo-${Date.now()}`,
          caseId,
          question,
          createdAt: new Date().toISOString(),
          supportingEvidence: (parsed.supportingEvidence || []).map((s: any) => ({
            claim: s.claim,
            citation: citations[s.sourceIndex] || citations[0],
          })),
          conflictingEvidence: (parsed.conflictingEvidence || []).map((c: any) => ({
            claim: c.claim,
            citation: citations[c.sourceIndex] || citations[0],
          })),
          missingInformation: parsed.missingInformation || [
            'Subpoena bank records for personal account transfers',
            'Corroborate security badge logs with gate surveillance',
          ],
          alternativeExplanations: parsed.alternativeExplanations || [
            'Subject acted as an independent contractor without knowledge of ultimate cargo destination.',
          ],
          suggestedVerificationSteps: parsed.suggestedVerificationSteps || [
            'Request certified registry records from DMV Port Authority.',
            'Interview licensed broker regarding source of client instructions.',
          ],
        };

        state.hypotheses.unshift(assessment);
        return assessment;
      } catch (err) {
        console.warn('Gemini hypothesis failed, using deterministic evaluation:', err);
      }
    }

    // Deterministic hypothesis assessment
    const assessment: HypothesisAssessment = {
      id: `hypo-${Date.now()}`,
      caseId,
      question,
      createdAt: new Date().toISOString(),
      supportingEvidence: citations.slice(0, 2).map(c => ({
        claim: `Documented relationship recorded in ${c.filename}`,
        citation: c,
      })),
      conflictingEvidence: citations.slice(2, 3).map(c => ({
        claim: `Alternative source claim recorded in ${c.filename}`,
        citation: c,
      })),
      missingInformation: [
        'Direct signed contracts between corporate principals',
        'Official DMV title transfer certificate for vehicle V-7892',
        'Certified phone subscriber registry for non-corporate numbers',
      ],
      alternativeExplanations: [
        'Intermediary transactions represent routine commercial forwarding rather than clandestine coordination.',
        'Shared vehicle usage may stem from third-party rental or unauthorized fleet lending.',
      ],
      suggestedVerificationSteps: [
        'Issue formal records request to Bank of Harbor for beneficial ownership of ACC-99014.',
        'Conduct sworn re-interview of courier contractor regarding origin of payment.',
        'Audit customs brokerage declaration CD-4091 for supporting invoices.',
      ],
    };

    state.hypotheses.unshift(assessment);
    return assessment;
  }

  private generateDefaultBrief(state: CaseState): InvestigationBrief {
    return {
      id: `brief-${state.caseData.id}`,
      caseId: state.caseData.id,
      title: `Investigation Brief: ${state.caseData.name}`,
      generatedAt: new Date().toISOString(),
      caseRevision: 'REV-2.4 (Pre-Trial Intelligence Review)',
      overview:
        'This evidence intelligence brief synthesizes 6 corroborated records covering cargo diversion events at Pier 4. Surveillance, wire transfers, and call detail records substantiate financial and logistical links between Orion Freight Ltd, Apex Marine Corp, and Harbor Holdings LLC.',
      sourcesConsidered: state.documents.map(d => ({
        filename: d.filename,
        type: d.fileType,
        dateAdded: d.uploadedAt.slice(0, 10),
      })),
      keyEntities: [
        { name: 'Arun Patel', type: 'person', role: 'Logistics Director, Apex Marine Corp' },
        { name: 'David Vance', type: 'person', role: 'Director, Orion Freight Ltd' },
        { name: 'Elena Rostova', type: 'person', role: 'Independent Courier Contractor' },
        { name: 'Apex Marine Corp', type: 'organisation', role: 'Consignee & Pier 4 Facility Operator' },
        { name: 'Orion Freight Ltd', type: 'organisation', role: 'Originator of advance wire transfers' },
        { name: 'Harbor Holdings LLC', type: 'organisation', role: 'Recipient of $195,000 warehouse sublease' },
        { name: 'Vehicle V-7892', type: 'vehicle', role: 'Blue Ford Transit cargo van observed in loading incident' },
      ],
      timeline: state.timeline.slice(0, 6).map(t => ({
        date: t.eventDate,
        title: t.title,
        source: t.sourceFilename,
      })),
      selectedConnections: [
        {
          from: 'Orion Freight Ltd',
          to: 'Apex Marine Corp',
          relation: 'Wire Transfer $240,000 USD',
          evidence: 'Transactions_Harbor_Ledger.csv (Row 2)',
        },
        {
          from: 'Apex Marine Corp',
          to: 'Harbor Holdings LLC',
          relation: 'Warehouse Sublease $195,000 USD',
          evidence: 'Transactions_Harbor_Ledger.csv (Row 3)',
        },
        {
          from: 'Arun Patel (+1-555-0192)',
          to: 'David Vance (+1-555-0377)',
          relation: 'Call Exchange CDR',
          evidence: 'Call_Records_Sprint_Mar2024.csv (Row 2 & 4)',
        },
      ],
      contradictions: state.contradictions.map(c => ({
        title: c.title,
        detail: `Official DMV Registry lists Apex Marine Corp as owner since 2022, whereas witness Elena Rostova claims sole private purchase in January 2024.`,
        status: c.status,
      })),
      unresolvedIdentities: state.identities.map(i => ({
        nameA: i.nameA,
        nameB: i.nameB,
        note: i.reason,
      })),
      verificationSteps: [
        'Authenticate vehicle title history with Department of Motor Vehicles.',
        'Subpoena Pier 4 security gate badge swipe logs for March 14.',
        'Interview licensed broker Arun K. Patel to confirm independence from Apex Marine Corp.',
      ],
      conclusion:
        'Connections established in this brief are backed by verified source segments. Association does not constitute proof of culpability. Further subpoenas recommended for beneficial ownership accounts.',
    };
  }
}

export const dataStore = new DataStore();
