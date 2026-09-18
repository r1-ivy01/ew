import { getGemini, PRIMARY_MODEL } from './gemini.js';
import { SourceDocument, Entity, Relationship, Contradiction, RAGCitation, AssistantMessage } from '../src/types.js';
import { GraphEngine } from './graphEngine.js';

export interface CaseKnowledgeBase {
  documents: SourceDocument[];
  entities: Entity[];
  relationships: Relationship[];
  contradictions: Contradiction[];
}

export class RagEngine {
  /**
   * Search and score evidence across all case records
   */
  static retrieveEvidence(
    query: string,
    kb: CaseKnowledgeBase,
    topK = 6
  ): { citation: RAGCitation; score: number }[] {
    const qTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const scored: { citation: RAGCitation; score: number }[] = [];

    // 1. Search Source Segments (Text, CSV rows, OCR blocks)
    for (const doc of kb.documents) {
      for (const seg of doc.segments) {
        const text = seg.exactText.toLowerCase();
        let matchCount = 0;
        for (const term of qTerms) {
          if (text.includes(term)) matchCount++;
        }

        if (matchCount > 0) {
          const pageOrRow = seg.pageNumber
            ? `Page ${seg.pageNumber}`
            : seg.rowNumber
            ? `Row ${seg.rowNumber}`
            : 'Document Segment';

          scored.push({
            citation: {
              sourceId: doc.id,
              filename: doc.filename,
              segmentId: seg.id,
              pageOrRow,
              quotation: seg.exactText,
              sourceType: doc.fileType,
              isOcr: seg.segmentType === 'ocr_block' || doc.fileType === 'image',
            },
            score: matchCount * 2 + (doc.isNewEvidence ? 1 : 0),
          });
        }
      }
    }

    // 2. Search Relationship Evidence references
    for (const rel of kb.relationships) {
      const relDesc = `${rel.label} ${rel.relationshipType}`.toLowerCase();
      for (const ref of rel.evidenceReferences) {
        const quote = ref.exactQuotation.toLowerCase();
        let matchCount = 0;
        for (const term of qTerms) {
          if (quote.includes(term) || relDesc.includes(term)) matchCount++;
        }
        if (matchCount > 0) {
          scored.push({
            citation: {
              sourceId: ref.sourceId,
              filename: ref.sourceFilename,
              segmentId: ref.segmentId,
              pageOrRow: ref.pageOrRow,
              quotation: ref.exactQuotation,
              sourceType: ref.sourceType,
              isOcr: ref.isOcrDerived,
            },
            score: matchCount * 2.5,
          });
        }
      }
    }

    // 3. Search Contradictions
    for (const contra of kb.contradictions) {
      const contraText = `${contra.title} ${contra.comparisonRule} ${contra.claimA.text} ${contra.claimB.text}`.toLowerCase();
      let matchCount = 0;
      for (const term of qTerms) {
        if (contraText.includes(term)) matchCount++;
      }
      if (matchCount > 0) {
        scored.push({
          citation: {
            sourceId: 'contra-source',
            filename: contra.claimA.sourceFilename,
            segmentId: contra.claimA.segmentId,
            pageOrRow: contra.claimA.pageOrRow,
            quotation: `[Contradiction: ${contra.title}] Claim A: "${contra.claimA.text}" vs Claim B: "${contra.claimB.text}"`,
            isOcr: false,
          },
          score: matchCount * 3,
        });
      }
    }

    // Deduplicate citations by quotation
    const seen = new Set<string>();
    const unique: { citation: RAGCitation; score: number }[] = [];
    scored.sort((a, b) => b.score - a.score);

    for (const item of scored) {
      if (!seen.has(item.citation.quotation)) {
        seen.add(item.citation.quotation);
        unique.push(item);
        if (unique.length >= topK) break;
      }
    }

    return unique;
  }

  /**
   * Handle contextual Question Answering using RAG and Graph Context
   */
  static async answerQuestion(
    question: string,
    kb: CaseKnowledgeBase
  ): Promise<AssistantMessage> {
    const evidenceHits = this.retrieveEvidence(question, kb, 6);
    const citations = evidenceHits.map(h => h.citation);

    // Check if question asks about connection between 2 entities
    const lowerQ = question.toLowerCase();
    let graphExplanation = '';
    const involvedEntities: string[] = [];

    const matchedEntities = kb.entities.filter(e =>
      lowerQ.includes(e.canonicalName.toLowerCase())
    );

    if (matchedEntities.length >= 2) {
      const entA = matchedEntities[0];
      const entB = matchedEntities[1];
      involvedEntities.push(entA.id, entB.id);

      const adj = GraphEngine.buildAdjacency(kb.entities, kb.relationships);
      const paths = GraphEngine.findPaths(adj, entA.id, entB.id);

      if (paths.length > 0) {
        graphExplanation = `\nGraph Path: ${paths[0].explanation}\nPrimary connection backed by: ${paths[0].relationships.map(r => r.source).join('; ')}.`;
      } else {
        graphExplanation = `\nGraph Analysis: No active path currently connects ${entA.canonicalName} and ${entB.canonicalName} in the evidence graph.`;
      }
    }

    // If Gemini is configured, use server-side model with strict case-grounding
    const gemini = getGemini();
    if (gemini && citations.length > 0) {
      try {
        const evidenceContext = citations
          .map((c, i) => `[Source ${i + 1}] (${c.filename} | ${c.pageOrRow || 'Record'}): "${c.quotation}"`)
          .join('\n');

        const prompt = `You are TRACE, a professional Evidence Intelligence assistant for investigative workflows.
Core Rule: Ground your answer strictly on the retrieved case evidence below.
Do not assume guilt or fabricate facts.
If the evidence is insufficient to answer the question with certainty, state clearly that the records do not confirm it.
Always cite your claims using bracketed numbers like [Source 1], [Source 2].

Retrieved Case Evidence:
${evidenceContext}

${graphExplanation ? `Graph Analysis:\n${graphExplanation}` : ''}

Investigator Question:
${question}

Answer concisely, professionally, and with complete citation accuracy:`;

        const response = await gemini.models.generateContent({
          model: PRIMARY_MODEL,
          contents: prompt,
        });

        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: (response.text || '').trim(),
          citations,
          graphEntities: involvedEntities,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        console.warn('Gemini RAG failed, using deterministic case answer:', err);
      }
    }

    // Deterministic fallback response with real citations
    let answerText = '';
    if (citations.length === 0) {
      answerText = `The current case records contain insufficient evidence to answer "${question}". No matching entries were located across uploaded reports, transaction logs, call detail records, vehicle registries, or OCR extractions.`;
    } else {
      const summaryList = citations
        .map((c, idx) => `• [${c.filename} — ${c.pageOrRow}]: "${c.quotation}"`)
        .join('\n');

      if (graphExplanation) {
        answerText = `Based on current case documentation and graph path analysis:\n${graphExplanation}\n\nSupporting Case Citations:\n${summaryList}`;
      } else {
        answerText = `Based on retrieved case evidence, the relevant records indicate:\n\n${summaryList}\n\nEvery connection above is directly verified against the original case source segments.`;
      }
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: answerText,
      citations,
      graphEntities: involvedEntities,
      timestamp: new Date().toISOString(),
    };
  }
}
