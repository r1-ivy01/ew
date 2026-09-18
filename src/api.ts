import {
  Case,
  SourceDocument,
  Entity,
  Relationship,
  IdentityCandidate,
  Contradiction,
  TimelineEvent,
  InvestigationBrief,
  ChangeReport,
  PathTestResult,
  AssistantMessage,
  HypothesisAssessment,
} from './types';

const API_BASE = '/api';

export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchCase(caseId: string): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error('Failed to fetch case');
  return res.json();
}

export async function createCase(data: { name: string; description?: string; referenceNumber?: string }): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function resetCase(caseId: string): Promise<{ success: boolean; message: string; case: Case }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset case');
  return res.json();
}

export async function fetchSources(caseId: string): Promise<SourceDocument[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

export async function uploadSource(
  caseId: string,
  data: { filename: string; mimeType: string; rawContent: string; isBase64Image?: boolean }
): Promise<{ document: SourceDocument; changeReport?: ChangeReport }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function fetchGraph(caseId: string): Promise<{
  entities: Entity[];
  relationships: Relationship[];
  changeReports: ChangeReport[];
}> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

export async function fetchIdentities(caseId: string): Promise<IdentityCandidate[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/identities`);
  if (!res.ok) throw new Error('Failed to fetch identities');
  return res.json();
}

export async function resolveIdentity(
  caseId: string,
  candidateId: string,
  decision: 'confirmed_same' | 'kept_separate' | 'unresolved'
): Promise<{ candidate: IdentityCandidate; affectedPathsNotice?: string }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/identities/${candidateId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) throw new Error('Failed to resolve identity');
  return res.json();
}

export async function undoIdentityMerge(
  caseId: string,
  candidateId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/identities/${candidateId}/undo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to undo merge');
  return res.json();
}

export async function fetchFindings(caseId: string): Promise<{
  contradictions: Contradiction[];
  hypotheses: HypothesisAssessment[];
}> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/findings`);
  if (!res.ok) throw new Error('Failed to fetch findings');
  return res.json();
}

export async function reviewContradiction(
  caseId: string,
  contraId: string,
  status: 'flagged' | 'reviewed_accepted' | 'reviewed_dismissed',
  note?: string
): Promise<Contradiction> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/findings/contradictions/${contraId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error('Failed to review contradiction');
  return res.json();
}

export async function testConnection(
  caseId: string,
  sourceEntityId: string,
  targetEntityId: string,
  exclusion?: { type: 'relationship' | 'source' | 'identity_match'; id: string; label: string }
): Promise<PathTestResult> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/path-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceEntityId, targetEntityId, exclusion }),
  });
  if (!res.ok) throw new Error('Failed to test connection');
  return res.json();
}

export async function askCaseAssistant(caseId: string, question: string): Promise<AssistantMessage> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Failed to consult Case Assistant');
  return res.json();
}

export async function testHypothesis(caseId: string, question: string): Promise<HypothesisAssessment> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/hypotheses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Failed to test hypothesis');
  return res.json();
}

export async function fetchTimeline(caseId: string): Promise<TimelineEvent[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchBrief(caseId: string): Promise<InvestigationBrief> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/brief`);
  if (!res.ok) throw new Error('Failed to fetch brief');
  return res.json();
}

export async function updateBrief(caseId: string, brief: Partial<InvestigationBrief>): Promise<InvestigationBrief> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brief),
  });
  if (!res.ok) throw new Error('Failed to update brief');
  return res.json();
}

export async function fetchConfig(): Promise<{ isGeminiAvailable: boolean; mode: string }> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) return { isGeminiAvailable: false, mode: 'sample_walkthrough' };
  return res.json();
}

export async function submitPilotRequest(data: {
  name: string;
  email: string;
  agency?: string;
  plan: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit pilot inquiry');
  return res.json();
}
