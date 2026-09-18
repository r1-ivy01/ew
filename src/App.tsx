import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  RAGCitation,
} from './types';
import {
  fetchCase,
  fetchGraph,
  fetchSources,
  fetchIdentities,
  fetchFindings,
  fetchTimeline,
  fetchBrief,
  fetchConfig,
  resetCase,
} from './api';

import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { FragilityTestModal } from './components/FragilityTestModal';
import { SourceUploadModal } from './components/SourceUploadModal';
import { CaseAssistantDrawer } from './components/CaseAssistantDrawer';

import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { CaseOverview } from './pages/CaseOverview';
import { SourcesView } from './pages/SourcesView';
import { NetworkView } from './pages/NetworkView';
import { TimelinePage } from './pages/TimelinePage';
import { FindingsPage } from './pages/FindingsPage';
import { IdentitiesPage } from './pages/IdentitiesPage';
import { BriefPage } from './pages/BriefPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/app/cases/case-harbor-ledger-demo/network');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [identities, setIdentities] = useState<IdentityCandidate[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [brief, setBrief] = useState<InvestigationBrief | null>(null);
  const [changeReports, setChangeReports] = useState<ChangeReport[]>([]);
  const [latestChangeReport, setLatestChangeReport] = useState<ChangeReport | null>(null);

  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isPathTestOpen, setIsPathTestOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const caseId = 'case-harbor-ledger-demo';

  // Load all case data
  const loadCaseData = useCallback(async () => {
    try {
      const [
        cfg,
        cData,
        graphData,
        srcData,
        idData,
        findingsData,
        timelineData,
        briefData,
      ] = await Promise.all([
        fetchConfig().catch(() => ({ isGeminiAvailable: false, mode: 'sample_walkthrough' })),
        fetchCase(caseId),
        fetchGraph(caseId),
        fetchSources(caseId),
        fetchIdentities(caseId),
        fetchFindings(caseId),
        fetchTimeline(caseId),
        fetchBrief(caseId),
      ]);

      setIsLiveMode(cfg.isGeminiAvailable);
      setCaseData(cData);
      setEntities(graphData.entities);
      setRelationships(graphData.relationships);
      setChangeReports(graphData.changeReports || []);
      setSources(srcData);
      setIdentities(idData);
      setContradictions(findingsData.contradictions);
      setTimeline(timelineData);
      setBrief(briefData);
    } catch (err) {
      console.error('Failed to load case data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

  const handleResetDemo = async () => {
    try {
      await resetCase(caseId);
      setLatestChangeReport(null);
      await loadCaseData();
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  const handleUploadSuccess = (changeReport?: ChangeReport) => {
    if (changeReport) {
      setLatestChangeReport(changeReport);
    }
    loadCaseData();
  };

  const handleUpdateReviewStatus = (relId: string, status: 'confirmed' | 'pending_review' | 'disputed') => {
    setRelationships(prev =>
      prev.map(r => (r.id === relId ? { ...r, reviewStatus: status } : r))
    );
  };

  // Determine current view page title
  const getPageTitle = () => {
    if (currentRoute.includes('/overview')) return 'Overview';
    if (currentRoute.includes('/sources')) return 'Sources';
    if (currentRoute.includes('/network')) return 'Network Graph';
    if (currentRoute.includes('/timeline')) return 'Timeline';
    if (currentRoute.includes('/findings')) return 'Findings & Hypotheses';
    if (currentRoute.includes('/identities')) return 'Identity Review';
    if (currentRoute.includes('/brief')) return 'Investigation Brief';
    if (currentRoute.includes('/settings')) return 'Workspace Settings';
    return 'Workspace';
  };

  // Standalone pages (Landing, Pricing, Login)
  if (currentRoute === '/') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentRoute(`/app/cases/${caseId}/network`)}
        onOpenPricing={() => setCurrentRoute('/pricing')}
        onOpenLogin={() => setCurrentRoute('/login')}
      />
    );
  }

  if (currentRoute === '/pricing') {
    return (
      <PricingPage
        onBack={() => setCurrentRoute('/')}
        onEnterApp={() => setCurrentRoute(`/app/cases/${caseId}/network`)}
      />
    );
  }

  if (currentRoute === '/login') {
    return (
      <LoginPage
        onBack={() => setCurrentRoute('/')}
        onLoginSuccess={() => setCurrentRoute(`/app/cases/${caseId}/network`)}
      />
    );
  }

  // Active workspace layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F5F1] text-[#222824] select-none font-sans">
      {/* Navigation Sidebar */}
      <Navigation
        currentCase={caseData || undefined}
        activeRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onResetDemo={handleResetDemo}
        isLiveMode={isLiveMode}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          currentCase={caseData || undefined}
          title={getPageTitle()}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenPathTest={() => setIsPathTestOpen(true)}
        />

        {/* View Switcher Container with transitions */}
        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              {currentRoute.includes('/overview') && caseData && (
                <CaseOverview
                  caseData={caseData}
                  changeReports={changeReports}
                  onNavigate={setCurrentRoute}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              )}

              {currentRoute.includes('/sources') && (
                <SourcesView
                  sources={sources}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              )}

              {currentRoute.includes('/network') && (
                <NetworkView
                  caseId={caseId}
                  entities={entities}
                  relationships={relationships}
                  latestChangeReport={latestChangeReport}
                  onDismissChangeReport={() => setLatestChangeReport(null)}
                  onUpdateReviewStatus={handleUpdateReviewStatus}
                />
              )}

              {currentRoute.includes('/timeline') && (
                <TimelinePage timeline={timeline} />
              )}

              {currentRoute.includes('/findings') && (
                <FindingsPage
                  caseId={caseId}
                  contradictions={contradictions}
                  onRefreshFindings={loadCaseData}
                />
              )}

              {currentRoute.includes('/identities') && (
                <IdentitiesPage
                  caseId={caseId}
                  identities={identities}
                  entities={entities}
                  onRefreshIdentities={loadCaseData}
                />
              )}

              {currentRoute.includes('/brief') && caseData && brief && (
                <BriefPage
                  caseData={caseData}
                  brief={brief}
                  onRefreshBrief={loadCaseData}
                />
              )}

              {currentRoute.includes('/settings') && (
                <SettingsPage
                  caseData={caseData || undefined}
                  isGeminiAvailable={isLiveMode}
                  onResetSuccess={loadCaseData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fragility Test Modal */}
      {isPathTestOpen && (
        <FragilityTestModal
          caseId={caseId}
          entities={entities}
          relationships={relationships}
          isOpen={isPathTestOpen}
          onClose={() => setIsPathTestOpen(false)}
        />
      )}

      {/* Source Ingestion Modal */}
      {isUploadOpen && (
        <SourceUploadModal
          caseId={caseId}
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Case Assistant RAG Drawer */}
      <CaseAssistantDrawer
        caseId={caseId}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectCitation={(c: RAGCitation) => {
          // If in network view, highlight corresponding source
          setCurrentRoute(`/app/cases/${caseId}/network`);
        }}
      />
    </div>
  );
}
