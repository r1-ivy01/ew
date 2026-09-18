import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/dataStore.js';
import { isGeminiAvailable } from './server/gemini.js';
import { RagEngine } from './server/ragEngine.js';

dotenv.config();

const app = express();
const PORT = 3000;

// High body limits for image upload and OCR payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  res.json({
    isGeminiAvailable: isGeminiAvailable(),
    mode: isGeminiAvailable() ? 'live_analysis' : 'sample_walkthrough',
  });
});

// Case Management
app.get('/api/cases', (req, res) => {
  const cases = dataStore.getCases();
  res.json(cases);
});

app.post('/api/cases', (req, res) => {
  const { name, description, referenceNumber } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Case name is required' });
  }
  const newCase = dataStore.createCase(name, description || '', referenceNumber);
  res.json(newCase);
});

app.get('/api/cases/:caseId', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json({
    ...state.caseData,
    sourceCount: state.documents.length,
    entityCount: state.entities.filter(e => !e.mergedInto).length,
    relationshipCount: state.relationships.length,
    unresolvedIdentityCount: state.identities.filter(i => i.status === 'unresolved').length,
    contradictionCount: state.contradictions.filter(co => co.status === 'flagged').length,
    recentChangesCount: state.changeReports.length,
  });
});

app.post('/api/cases/:caseId/reset', (req, res) => {
  const state = dataStore.resetSyntheticCase();
  res.json({
    success: true,
    message: 'Operation Harbor Ledger reset to initial ground-truth baseline.',
    case: state.caseData,
  });
});

// Sources & Upload (PDF, TXT, CSV, JPG, JPEG, PNG)
app.get('/api/cases/:caseId/sources', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json(state.documents);
});

app.post('/api/cases/:caseId/sources', async (req, res) => {
  try {
    const { filename, mimeType, rawContent, isBase64Image } = req.body;
    if (!filename || !rawContent) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }

    const result = await dataStore.ingestSource(
      req.params.caseId,
      filename,
      mimeType || 'text/plain',
      rawContent,
      !!isBase64Image
    );

    res.json(result);
  } catch (err: any) {
    console.error('Ingestion error:', err);
    res.status(500).json({ error: err.message || 'Ingestion failed' });
  }
});

// Graph View
app.get('/api/cases/:caseId/graph', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });

  // Filter out merged entities
  const activeEntities = state.entities.filter(e => !e.mergedInto);
  res.json({
    entities: activeEntities,
    relationships: state.relationships,
    changeReports: state.changeReports,
  });
});

// Identity Review
app.get('/api/cases/:caseId/identities', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json(state.identities);
});

app.post('/api/cases/:caseId/identities/:candidateId/resolve', (req, res) => {
  try {
    const { decision } = req.body;
    const result = dataStore.resolveIdentity(req.params.caseId, req.params.candidateId, decision);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cases/:caseId/identities/:candidateId/undo', (req, res) => {
  try {
    const result = dataStore.undoMerge(req.params.caseId, req.params.candidateId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Contradictions & Findings
app.get('/api/cases/:caseId/findings', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json({
    contradictions: state.contradictions,
    hypotheses: state.hypotheses,
  });
});

app.post('/api/cases/:caseId/findings/contradictions/:contraId/review', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });

  const contra = state.contradictions.find(c => c.id === req.params.contraId);
  if (!contra) return res.status(404).json({ error: 'Contradiction not found' });

  const { status, note } = req.body;
  if (status) contra.status = status;
  if (note) contra.investigatorNote = note;

  res.json(contra);
});

// Path & Fragility Testing
app.post('/api/cases/:caseId/path-test', (req, res) => {
  try {
    const { sourceEntityId, targetEntityId, exclusion } = req.body;
    if (!sourceEntityId || !targetEntityId) {
      return res.status(400).json({ error: 'Source and target entities required' });
    }
    const result = dataStore.testConnection(
      req.params.caseId,
      sourceEntityId,
      targetEntityId,
      exclusion
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// RAG Case Assistant
app.post('/api/cases/:caseId/assistant', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const state = dataStore.getCaseState(req.params.caseId);
    if (!state) return res.status(404).json({ error: 'Case not found' });

    const kb = {
      documents: state.documents,
      entities: state.entities,
      relationships: state.relationships,
      contradictions: state.contradictions,
    };

    const answer = await RagEngine.answerQuestion(question, kb);
    res.json(answer);
  } catch (err: any) {
    console.error('Assistant error:', err);
    res.status(500).json({ error: err.message || 'Assistant failed' });
  }
});

// Hypothesis Testing
app.post('/api/cases/:caseId/hypotheses', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const assessment = await dataStore.evaluateHypothesis(req.params.caseId, question);
    res.json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Timeline View
app.get('/api/cases/:caseId/timeline', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json(state.timeline);
});

// Changes
app.get('/api/cases/:caseId/changes', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json(state.changeReports);
});

// Investigation Brief
app.get('/api/cases/:caseId/brief', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  res.json(state.brief);
});

app.post('/api/cases/:caseId/brief', (req, res) => {
  const state = dataStore.getCaseState(req.params.caseId);
  if (!state) return res.status(404).json({ error: 'Case not found' });
  state.brief = {
    ...state.brief,
    ...req.body,
    caseId: state.caseData.id,
    generatedAt: new Date().toISOString(),
  };
  res.json(state.brief);
});

// Pilot / Contact Request persistence
const contactSubmissions: any[] = [];
app.post('/api/contact', (req, res) => {
  const { name, email, agency, plan, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const entry = {
    id: `req-${Date.now()}`,
    name,
    email,
    agency: agency || 'Undisclosed Agency',
    plan: plan || 'Pilot',
    notes: notes || '',
    submittedAt: new Date().toISOString(),
  };
  contactSubmissions.push(entry);
  res.json({
    success: true,
    message: `Pilot inquiry received for ${name} (${entry.agency}). We will review credential clearance.`,
    entry,
  });
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRACE Evidence Intelligence running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
