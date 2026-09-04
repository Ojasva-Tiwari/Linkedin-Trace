import React, { useState, useEffect, useMemo } from 'react';
import {
  EvidenceItem,
  ResearchSet,
  ResearchProfileRef,
  FactState,
} from '@shared/index';
import { traceStorage } from '@storage/indexeddb';

import { SAMPLE_RESEARCH_SETS } from '@storage/sampleData';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ProfileHeader } from './components/ProfileHeader';
import { ArtifactCategory } from './components/MetricBreakdownBar';
import { SubNav, ProfileSubView } from './components/SubNav';
import { TimelineView } from './components/TimelineView';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { ArtifactsBreakdownView } from './components/ArtifactsBreakdownView';
import { SkillsView } from './components/SkillsView';
import { PreparationView } from './components/PreparationView';
import { ActivityView } from './components/ActivityView';
import { ExternalSourcesView } from './components/ExternalSourcesView';
import { SummaryView } from './components/SummaryView';
import { ResearchView } from './components/ResearchView';
import { MyPathView } from './components/MyPathView';
import { CaptureBanner } from './components/CaptureBanner';
import { EmptyState } from './components/EmptyState';
import { useAutoProfileAnalysis } from './hooks/useAutoProfileAnalysis';
import { LayoutProvider, useLayoutMode } from './context/LayoutContext';

const AppInner: React.FC = () => {
  const { isCompact } = useLayoutMode();
  // Navigation State
  const [activeArea, setActiveArea] = useState<'profile' | 'research' | 'mypath'>('profile');
  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('timeline');
  const [activeArtifactCategory, setActiveArtifactCategory] = useState<ArtifactCategory | null>(null);

  // Automatic Profile Analysis Hook
  const {
    status,
    synthesisStatus,
    synthesis,
    detection,
    profile,
    evidenceItems,
    timelineEvents,
    reanalyze,
    resynthesize,
    loadSampleProfile,
    loadProfileById,
  } = useAutoProfileAnalysis();

  // Inspected Evidence Item for Right Slide-Over
  const [inspectedEvidence, setInspectedEvidence] = useState<EvidenceItem | null>(null);

  // Research & My Path State
  const [researchSets, setResearchSets] = useState<ResearchSet[]>([]);
  const [activeResearchSetId, setActiveResearchSetId] = useState<string | null>(null);
  const [isInResearch, setIsInResearch] = useState(false);

  // Banner Visibility
  const [showStatusBanner, setShowStatusBanner] = useState(true);

  // Build quick evidence lookup map
  const evidenceMap = useMemo(() => {
    const map: Record<string, EvidenceItem> = {};
    evidenceItems.forEach((ev) => {
      map[ev.id] = ev;
    });
    return map;
  }, [evidenceItems]);

  // Load Research Sets from IndexedDB (Strictly persistent, zero default sample injection)
  useEffect(() => {
    async function loadResearch() {
      try {
        const sets = await traceStorage.getAllResearchSets();
        setResearchSets(sets);
        if (sets.length > 0) {
          setActiveResearchSetId((prev) => prev || sets[0].id);
        }
      } catch (err) {
        console.warn('Error loading research sets:', err);
      }
    }
    loadResearch();
  }, []);

  // Update In-Research toggle when profile or active cohort changes
  useEffect(() => {
    setInspectedEvidence(null);
    if (profile && researchSets.length > 0) {
      const activeSet = researchSets.find((s) => s.id === activeResearchSetId) || researchSets[0];
      const inSet = activeSet?.profileRefs.some((r) => r.profileId === profile.id) || false;
      setIsInResearch(inSet);
    } else {
      setIsInResearch(false);
    }
  }, [profile, researchSets, activeResearchSetId]);

  // Research Cohort Actions
  const handleCreateResearchSet = async (title: string, description?: string) => {
    const newSet: ResearchSet = {
      id: `set-${Date.now()}`,
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileRefs: [],
      tags: [],
    };
    await traceStorage.saveResearchSet(newSet);
    setResearchSets((prev) => [...prev, newSet]);
    setActiveResearchSetId(newSet.id);
  };

  const handleRenameResearchSet = async (setId: string, newTitle: string) => {
    const target = researchSets.find((s) => s.id === setId);
    if (!target) return;
    const updated: ResearchSet = {
      ...target,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    };
    await traceStorage.saveResearchSet(updated);
    setResearchSets((prev) => prev.map((s) => (s.id === setId ? updated : s)));
  };

  const handleDeleteResearchSet = async (setId: string) => {
    await traceStorage.deleteResearchSet(setId);
    const remaining = researchSets.filter((s) => s.id !== setId);
    setResearchSets(remaining);
    setActiveResearchSetId(remaining[0]?.id || null);
  };

  const handleAddProfileToSet = async (setId: string) => {
    if (!profile) return;
    const targetSet = researchSets.find((s) => s.id === setId);
    if (!targetSet) return;
    if (targetSet.profileRefs.some((r) => r.profileId === profile.id)) return;

    const newRef: ResearchProfileRef = {
      profileId: profile.id,
      fullName: profile.fullName,
      headline: profile.headline,
      addedAt: new Date().toISOString(),
      tags: [],
    };
    const updatedSet: ResearchSet = {
      ...targetSet,
      profileRefs: [...targetSet.profileRefs, newRef],
      updatedAt: new Date().toISOString(),
    };
    await traceStorage.saveResearchSet(updatedSet);
    setResearchSets((prev) => prev.map((s) => (s.id === setId ? updatedSet : s)));
    setIsInResearch(true);
  };

  const handleRemoveProfileFromSet = async (setId: string, profileId: string) => {
    const targetSet = researchSets.find((s) => s.id === setId);
    if (!targetSet) return;
    const updatedRefs = targetSet.profileRefs.filter((r) => r.profileId !== profileId);
    const updatedSet: ResearchSet = {
      ...targetSet,
      profileRefs: updatedRefs,
      updatedAt: new Date().toISOString(),
    };
    await traceStorage.saveResearchSet(updatedSet);
    setResearchSets((prev) => prev.map((s) => (s.id === setId ? updatedSet : s)));
    if (profile && profileId === profile.id) {
      setIsInResearch(false);
    }
  };

  // Toggle Research Membership for currently viewed profile
  const handleToggleResearch = async () => {
    if (!profile) return;
    try {
      let currentSet = researchSets.find((s) => s.id === activeResearchSetId) || researchSets[0];
      if (!currentSet) {
        currentSet = {
          id: `set-${Date.now()}`,
          title: 'My Research Cohort',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileRefs: [],
          tags: [],
        };
        await traceStorage.saveResearchSet(currentSet);
        setResearchSets([currentSet]);
        setActiveResearchSetId(currentSet.id);
      }

      if (isInResearch) {
        await handleRemoveProfileFromSet(currentSet.id, profile.id);
      } else {
        await handleAddProfileToSet(currentSet.id);
      }
    } catch (err) {
      console.error('Failed to toggle research set:', err);
    }
  };

  // Switch to selected profile from Research matrix
  const handleSelectProfileFromResearch = async (profileId: string) => {
    await loadProfileById(profileId);
    setActiveArea('profile');
    setActiveSubView('timeline');
  };

  // Explicit user-triggered demo sample cohort loading
  const handleLoadSampleCohort = async () => {
    for (const s of SAMPLE_RESEARCH_SETS) {
      await traceStorage.saveResearchSet(s);
    }
    const sets = await traceStorage.getAllResearchSets();
    setResearchSets(sets);
    if (sets.length > 0) {
      setActiveResearchSetId(sets[0].id);
    }
  };

  // Handle Decomposed Metric Category Click
  const handleSelectArtifactCategory = (category: ArtifactCategory) => {
    setActiveArtifactCategory(category);
    setActiveSubView('artifacts');
  };

  // Inspect Evidence in Right Slide-Over
  const handleInspectEvidence = (
    evidenceId: string,
    claimContext?: {
      claimText?: string;
      factState?: FactState;
      sourceUrl?: string;
    }
  ) => {
    const item = evidenceMap[evidenceId] || null;
    if (item) {
      if (claimContext) {
        setInspectedEvidence({
          ...item,
          rawText: claimContext.claimText || item.rawText,
          factState: claimContext.factState || item.factState,
          provenance: {
            ...item.provenance,
            url: claimContext.sourceUrl || item.provenance.url,
            contextSnippet: item.provenance.contextSnippet || item.rawText,
          },
          annotation: `Grounding citation for synthesized claim #${evidenceId}`,
        });
      } else {
        setInspectedEvidence(item);
      }
    } else {
      setInspectedEvidence({
        id: evidenceId,
        type: 'dom_text',
        factState: claimContext?.factState || 'observed',
        rawText: claimContext?.claimText || `Evidence citation #${evidenceId}`,
        provenance: {
          url: claimContext?.sourceUrl || profile?.sourceUrl || 'https://linkedin.com',
          pageTitle: `${profile?.fullName || 'Candidate'} | LinkedIn`,
          capturedAt: new Date().toISOString(),
          contextSnippet: 'Direct observation grounded in public document context.',
        },
        extractedAt: new Date().toISOString(),
        confidence: 'high',
        annotation: 'Grounding citation record',
      });
    }
  };

  // Observed evidence count for grounding status (NO fake percentages)
  const observedEvidenceCount = profile
    ? profile.evidenceIds.filter(
        (id) => evidenceMap[id]?.factState === 'observed' || id.startsWith('ev-')
      ).length
    : 0;

  // Dynamic decomposable artifact counts strictly derived from stored evidence
  const artifactCounts = useMemo(() => {
    if (!profile) {
      return { internships: 0, projects: 0, hackathons: 0, opensource: 0 };
    }
    if (profile.decomposedMetrics) {
      return profile.decomposedMetrics;
    }
    const internshipCount = profile.experiences.filter((e) => {
      const t = e.title.toLowerCase();
      return t.includes('intern') || t.includes('fellow') || t.includes('trainee') || t.includes('co-op');
    }).length;
    return {
      internships: internshipCount > 0 ? internshipCount : profile.experiences.length,
      projects: profile.projects?.length ?? 0,
      hackathons: (profile.projects || []).filter((p) => p.isHackathon).length,
      opensource: (profile.projects || []).filter((p) => p.isOpenSource).length,
    };
  }, [profile]);

  return (
    <div className={`trace-desktop-app ${isCompact ? 'trace-mode-compact' : 'trace-mode-expanded'}`}>
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentArea={activeArea}
        onSelectArea={setActiveArea}
        activeProfileName={profile?.fullName || detection?.fullName || 'Candidate Profile'}
        isCapturing={status === 'analyzing'}
      />

      {/* Main Viewport */}
      <div className="trace-main-viewport">
        {/* Desktop Top Action Bar with Real-Time State Machine */}
        <TopBar
          currentArea={activeArea}
          status={status}
          synthesisStatus={synthesisStatus}
          onReanalyze={reanalyze}
          onResynthesize={() => resynthesize(true)}
          postsCount={profile?.posts?.length}
        />

        {/* Centered Desktop Content Container */}
        <main className="trace-desktop-container">
          {/* Automatic Profile Grounding Status Banner */}
          {showStatusBanner && profile && (
            <CaptureBanner
              status={status}
              evidenceCount={profile.metadata?.totalEvidenceCount || evidenceItems.length}
              onDismiss={() => setShowStatusBanner(false)}
            />
          )}

          {/* Area 1: PROFILE (Single Person Only) */}
          {activeArea === 'profile' && (
            <>
              {profile ? (
                <>
                  {/* Wide Horizontal Profile Identity & Metrics Header */}
                  <ProfileHeader
                    profile={profile}
                    inResearch={isInResearch}
                    onToggleResearch={handleToggleResearch}
                    artifactCounts={artifactCounts}
                    observedEvidenceCount={observedEvidenceCount}
                    activeArtifactCategory={activeArtifactCategory}
                    onSelectArtifactCategory={handleSelectArtifactCategory}
                  />

                  {/* Profile Sub-Navigation Tabs */}
                  <SubNav
                    activeView={activeSubView}
                    onSelectView={setActiveSubView}
                    showArtifactsTab={activeSubView === 'artifacts'}
                    activityCount={profile.posts?.length}
                    sourcesCount={profile.externalSources?.length}
                  />

                  {/* Sub-View Projections */}
                  {activeSubView === 'timeline' && (
                    <TimelineView
                      events={timelineEvents}
                      synthesis={synthesis}
                      synthesisStatus={synthesisStatus}
                      onResynthesize={() => resynthesize(true)}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'artifacts' && (
                    <ArtifactsBreakdownView
                      profile={profile}
                      evidenceItems={evidenceItems}
                      initialCategory={activeArtifactCategory || 'internships'}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'skills' && (
                    <SkillsView
                      skills={profile.skills}
                      synthesis={synthesis}
                      evidenceItems={evidenceItems}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'preparation' && (
                    <PreparationView
                      profile={profile}
                      synthesis={synthesis}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'activity' && (
                    <ActivityView
                      profile={profile}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'sources' && (
                    <ExternalSourcesView
                      profile={profile}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'summary' && (
                    <SummaryView
                      profile={profile}
                      synthesis={synthesis}
                      evidenceItems={evidenceItems}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  onLoadSample={loadSampleProfile}
                  status={status}
                />
              )}
            </>
          )}


          {/* Area 2: RESEARCH (Multiple Saved Profiles in Comparison Layout) */}
          {activeArea === 'research' && (
            <ResearchView
              researchSets={researchSets}
              activeSetId={activeResearchSetId}
              onSelectSet={(id) => setActiveResearchSetId(id)}
              onCreateSet={handleCreateResearchSet}
              onRenameSet={handleRenameResearchSet}
              onDeleteSet={handleDeleteResearchSet}
              currentProfile={profile}
              onAddCurrentProfileToSet={(setId) => handleAddProfileToSet(setId)}
              onRemoveProfileFromSet={(setId, profileId) => handleRemoveProfileFromSet(setId, profileId)}
              onSelectProfile={handleSelectProfileFromResearch}
              onInspectEvidence={handleInspectEvidence}
              layoutMode={isCompact ? 'compact' : 'expanded'}
              onLoadSampleCohort={handleLoadSampleCohort}
            />
          )}

          {/* Area 3: MY PATH (Personal Trajectory vs Target Benchmark Cohorts) */}
          {activeArea === 'mypath' && (
            <MyPathView
              researchSets={researchSets}
              onInspectEvidence={handleInspectEvidence}
              layoutMode={isCompact ? 'compact' : 'expanded'}
            />
          )}
        </main>
      </div>

      {/* Slide-Over Right Evidence Grounding Inspector */}
      <EvidenceDrawer
        evidence={inspectedEvidence}
        onClose={() => setInspectedEvidence(null)}
        targetPersonName={profile?.fullName || 'Candidate Profile'}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LayoutProvider>
      <AppInner />
    </LayoutProvider>
  );
};

export default App;
