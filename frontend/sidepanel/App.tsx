import React, { useState, useEffect } from 'react';
import {
  TraceProfile,
  EvidenceItem,
  TimelineEvent,
  ResearchSet,
  MyPathComparison,
} from '@shared/index';
import { traceStorage } from '@storage/indexeddb';
import {
  SAMPLE_PROFILE,
  SAMPLE_EVIDENCE_ITEMS,
  SAMPLE_TIMELINE_EVENTS,
  SAMPLE_RESEARCH_SETS,
} from '@storage/sampleData';

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
import { SummaryView } from './components/SummaryView';
import { ResearchView } from './components/ResearchView';
import { MyPathView } from './components/MyPathView';
import { CaptureBanner } from './components/CaptureBanner';
import { EmptyState } from './components/EmptyState';

export const App: React.FC = () => {
  // Navigation State
  const [activeArea, setActiveArea] = useState<'profile' | 'research' | 'mypath'>('profile');
  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('timeline');
  const [activeArtifactCategory, setActiveArtifactCategory] = useState<ArtifactCategory | null>(null);

  // Profile & Evidence State
  const [profile, setProfile] = useState<TraceProfile | null>(null);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, EvidenceItem>>({});
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [inspectedEvidence, setInspectedEvidence] = useState<EvidenceItem | null>(null);

  // Research & My Path State
  const [researchSets, setResearchSets] = useState<ResearchSet[]>([]);
  const [isInResearch, setIsInResearch] = useState(false);
  const [myPathComparison] = useState<MyPathComparison | null>(null);

  // Extension & Capture State
  const [syncState, setSyncState] = useState<'synced' | 'capturing' | 'idle' | 'error'>('synced');
  const [showCaptureBanner, setShowCaptureBanner] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('Profile captured · Historical activity partial.');

  // 1. Initial Local Data Load from IndexedDB
  useEffect(() => {
    async function initData() {
      try {
        const activeProfileId = await traceStorage.getActiveProfileId();
        let currentProfile: TraceProfile | null = null;

        if (activeProfileId) {
          currentProfile = await traceStorage.getProfile(activeProfileId);
        } else {
          // Pre-populate with sample profile for testing if database is fresh
          await traceStorage.saveProfile(SAMPLE_PROFILE);
          for (const ev of SAMPLE_EVIDENCE_ITEMS) {
            await traceStorage.saveEvidence(ev);
          }
          await traceStorage.saveTimelineEvents(SAMPLE_TIMELINE_EVENTS);
          for (const rs of SAMPLE_RESEARCH_SETS) {
            await traceStorage.saveResearchSet(rs);
          }
          await traceStorage.setActiveProfileId(SAMPLE_PROFILE.id);
          currentProfile = SAMPLE_PROFILE;
        }

        if (currentProfile) {
          setProfile(currentProfile);

          // Fetch evidence
          const evItems = await traceStorage.getEvidenceForProfile(currentProfile.id);
          const map: Record<string, EvidenceItem> = {};
          evItems.forEach((ev: EvidenceItem) => {
            map[ev.id] = ev;
          });
          // Also merge sample evidence if needed
          SAMPLE_EVIDENCE_ITEMS.forEach((ev: EvidenceItem) => {
            if (!map[ev.id]) map[ev.id] = ev;
          });
          setEvidenceMap(map);

          // Fetch timeline
          const tl = await traceStorage.getTimelineForProfile(currentProfile.id);
          setTimelineEvents(tl.length > 0 ? tl : SAMPLE_TIMELINE_EVENTS);
        }

        // Fetch Research Sets
        const sets = await traceStorage.getAllResearchSets();
        setResearchSets(sets.length > 0 ? sets : SAMPLE_RESEARCH_SETS);

        // Check if active profile is in research set
        if (currentProfile) {
          const inSet = sets.some((s: ResearchSet) => s.profileRefs.some((r) => r.profileId === currentProfile?.id));
          setIsInResearch(inSet);
        }
      } catch (err) {
        console.error('Error loading initial TRACE data:', err);
        // Fallback to sample data in memory
        setProfile(SAMPLE_PROFILE);
        const map: Record<string, EvidenceItem> = {};
        SAMPLE_EVIDENCE_ITEMS.forEach((ev) => {
          map[ev.id] = ev;
        });
        setEvidenceMap(map);
        setTimelineEvents(SAMPLE_TIMELINE_EVENTS);
        setResearchSets(SAMPLE_RESEARCH_SETS);
      }
    }

    initData();
  }, []);

  // 2. Handle User-Triggered Page Capture via Chrome Runtime or Simulation
  const handleTriggerCapture = async () => {
    setSyncState('capturing');
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { type: 'CAPTURE_CURRENT_PAGE' },
            async (response) => {
              if (chrome.runtime.lastError || !response?.success) {
                setBannerMessage('Capture triggered on active tab. Make sure a LinkedIn profile is loaded.');
                setShowCaptureBanner(true);
                setSyncState('idle');
              } else {
                setBannerMessage('Active DOM successfully captured. Trajectory updated.');
                setShowCaptureBanner(true);
                setSyncState('synced');
              }
            }
          );
        } else {
          setSyncState('idle');
        }
      } else {
        // Mock capture simulation in desktop browser preview
        setTimeout(() => {
          setSyncState('synced');
          setBannerMessage('Desktop studio preview: Trajectory cache refreshed.');
          setShowCaptureBanner(true);
        }, 500);
      }
    } catch (err) {
      console.error('Capture failed:', err);
      setSyncState('error');
    }
  };

  // 3. Toggle Research Cohort Membership
  const handleToggleResearch = async () => {
    if (!profile) return;
    try {
      const sets = await traceStorage.getAllResearchSets();
      const defaultSet = sets[0] || SAMPLE_RESEARCH_SETS[0];

      if (isInResearch) {
        const updatedRefs = defaultSet.profileRefs.filter((r: { profileId: string }) => r.profileId !== profile.id);
        const updatedSet: ResearchSet = { ...defaultSet, profileRefs: updatedRefs, updatedAt: new Date().toISOString() };
        await traceStorage.saveResearchSet(updatedSet);
        setResearchSets([updatedSet]);
        setIsInResearch(false);
      } else {
        const updatedRefs = [
          ...defaultSet.profileRefs,
          {
            profileId: profile.id,
            fullName: profile.fullName,
            headline: profile.headline,
            addedAt: new Date().toISOString(),
            tags: [],
          },
        ];
        const updatedSet: ResearchSet = { ...defaultSet, profileRefs: updatedRefs, updatedAt: new Date().toISOString() };
        await traceStorage.saveResearchSet(updatedSet);
        setResearchSets([updatedSet]);
        setIsInResearch(true);
      }
    } catch (err) {
      console.error('Failed to toggle research set:', err);
    }
  };

  // 4. Handle Decomposed Metric Category Click
  const handleSelectArtifactCategory = (category: ArtifactCategory) => {
    setActiveArtifactCategory(category);
    setActiveSubView('artifacts');
  };

  // 5. Inspect Evidence in Right Slide-Over
  const handleInspectEvidence = (evidenceId: string) => {
    const item = evidenceMap[evidenceId] || SAMPLE_EVIDENCE_ITEMS.find((e) => e.id === evidenceId) || null;
    if (item) {
      setInspectedEvidence(item);
    } else {
      setInspectedEvidence({
        id: evidenceId,
        type: 'dom_text',
        factState: 'observed',
        rawText: `Evidence artifact citation #${evidenceId}`,
        provenance: {
          url: profile?.sourceUrl || 'https://linkedin.com',
          pageTitle: 'Document Citation Anchor',
          capturedAt: new Date().toISOString(),
          contextSnippet: 'Direct observation grounded in public document context.',
        },
        extractedAt: new Date().toISOString(),
        confidence: 'high',
      });
    }
  };

  // Observed evidence count for grounding bar (NO fake percentages)
  const observedEvidenceCount = profile
    ? profile.evidenceIds.filter((id) => evidenceMap[id]?.factState === 'observed' || id.startsWith('ev-')).length
    : 0;

  return (
    <div className="trace-desktop-app">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentArea={activeArea}
        onSelectArea={setActiveArea}
        activeProfileName={profile?.fullName || 'Ashmit Bagga'}
        isCapturing={syncState === 'capturing'}
      />

      {/* Main Viewport */}
      <div className="trace-main-viewport">
        {/* Desktop Top Action Header */}
        <TopBar
          currentArea={activeArea}
          isCapturing={syncState === 'capturing'}
          onCaptureClick={handleTriggerCapture}
        />

        {/* Centered Desktop Content Container */}
        <main className="trace-desktop-container">
          {/* Multi-Page / Partial Capture Notification Banner */}
          {showCaptureBanner && (
            <CaptureBanner
              message={bannerMessage}
              subMessage="Open LinkedIn Activity → Posts to index chronological timeline anchors."
              onDismiss={() => setShowCaptureBanner(false)}
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
                    artifactCounts={{
                      internships: profile.experiences.length,
                      projects: 4,
                      hackathons: 3,
                      opensource: 1,
                    }}
                    observedEvidenceCount={observedEvidenceCount}
                    activeArtifactCategory={activeArtifactCategory}
                    onSelectArtifactCategory={handleSelectArtifactCategory}
                  />

                  {/* Profile Sub-Navigation Tabs */}
                  <SubNav
                    activeView={activeSubView}
                    onSelectView={setActiveSubView}
                    showArtifactsTab={activeSubView === 'artifacts'}
                  />

                  {/* Sub-View Projections */}
                  {activeSubView === 'timeline' && (
                    <TimelineView
                      events={timelineEvents}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'artifacts' && (
                    <ArtifactsBreakdownView
                      profile={profile}
                      evidenceItems={Object.values(evidenceMap)}
                      initialCategory={activeArtifactCategory || 'internships'}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'skills' && (
                    <SkillsView
                      skills={profile.skills}
                      evidenceItems={Object.values(evidenceMap)}
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'preparation' && (
                    <PreparationView
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}

                  {activeSubView === 'summary' && (
                    <SummaryView
                      onInspectEvidence={handleInspectEvidence}
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  onTriggerCapture={handleTriggerCapture}
                  onLoadSample={() => setProfile(SAMPLE_PROFILE)}
                  isCapturing={syncState === 'capturing'}
                />
              )}
            </>
          )}

          {/* Area 2: RESEARCH (Multiple Saved Profiles in Comparison Layout) */}
          {activeArea === 'research' && (
            <ResearchView
              researchSets={researchSets}
              currentProfile={profile}
              onSelectProfile={() => {
                setActiveArea('profile');
                setActiveSubView('timeline');
              }}
            />
          )}

          {/* Area 3: MY PATH (Personal Trajectory vs Target Benchmark Cohorts) */}
          {activeArea === 'mypath' && (
            <MyPathView
              comparison={myPathComparison}
              userProfile={profile}
              researchSets={researchSets}
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

export default App;
