import React, { useState, useEffect } from 'react';
import {
  TraceProfile,
  ResearchSet,
  MyPathComparison,
  FactState,
} from '@shared/index';
import { localDB, extensionStorage } from '@storage/index';
import { AIService } from '@ai/index';

type ProductArea = 'profile' | 'research' | 'mypath';
type ProfileSubView = 'timeline' | 'skills' | 'summary' | 'evidence';

export const App: React.FC = () => {
  const [activeArea, setActiveArea] = useState<ProductArea>('profile');
  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('timeline');
  const [currentProfile, setCurrentProfile] = useState<TraceProfile | null>(null);
  const [researchSets, setResearchSets] = useState<ResearchSet[]>([]);
  const [comparison, setComparison] = useState<MyPathComparison | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load initial local data
  useEffect(() => {
    async function loadLocalState() {
      try {
        const activeId = await extensionStorage.getActiveProfileId();
        if (activeId) {
          const prof = await localDB.getProfile(activeId);
          if (prof) setCurrentProfile(prof);
        } else {
          const allProfiles = await localDB.getAllProfiles();
          if (allProfiles.length > 0) {
            setCurrentProfile(allProfiles[0]);
          }
        }

        const sets = await localDB.getAllResearchSets();
        setResearchSets(sets);

        const comp = await localDB.getComparison('latest');
        if (comp) setComparison(comp);
      } catch (err) {
        console.warn('[TRACE UI] Local storage load warning:', err);
      }
    }
    loadLocalState();
  }, []);

  // Handle explicit user-initiated capture
  const handleTriggerCapture = async () => {
    setIsCapturing(true);
    setStatusMessage('Initiating user-triggered capture...');

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          {
            action: 'TRIGGER_PAGE_CAPTURE',
            payload: {
              sourceUrl: window.location.href,
              userInitiated: true,
              timestamp: new Date().toISOString(),
            },
          },
          async (response) => {
            if (response?.success && response.data) {
              setStatusMessage('Extracting grounded evidence via AI provider...');
              const ai = AIService.getProvider();
              const evidence = await ai.extractEvidence(response.data);
              const structured = await ai.structureProfile(evidence, {
                url: response.data.url,
                capturedAt: response.data.capturedAt,
              });

              // Save to local IndexedDB
              await localDB.saveProfile(structured);
              for (const item of evidence) {
                await localDB.saveEvidence(item);
              }
              await extensionStorage.setActiveProfileId(structured.id);

              setCurrentProfile(structured);
              setStatusMessage('Profile successfully captured and stored locally.');
            } else {
              setStatusMessage(response?.error || 'Capture was cancelled or failed.');
            }
            setIsCapturing(false);
          }
        );
      } else {
        // Fallback simulation for local dev outside Chrome Extension context
        setStatusMessage('Browser dev mode: simulated local capture.');
        const ai = AIService.getProvider();
        const fakeEvidence = await ai.extractEvidence({
          url: 'https://www.linkedin.com/in/example',
          pageTitle: 'Example Profile',
          capturedAt: new Date().toISOString(),
          sanitizedDomText: 'Sample local profile text',
          metaTags: {},
        });
        const fakeProfile = await ai.structureProfile(fakeEvidence, {
          url: 'https://www.linkedin.com/in/example',
          capturedAt: new Date().toISOString(),
        });
        await localDB.saveProfile(fakeProfile);
        setCurrentProfile(fakeProfile);
        setIsCapturing(false);
      }
    } catch (err) {
      console.error('[TRACE UI] Capture error:', err);
      setStatusMessage('Error during capture. See console for details.');
      setIsCapturing(false);
    }
  };

  const renderBadge = (state: FactState) => {
    switch (state) {
      case 'observed':
        return <span className="badge badge-observed">Observed</span>;
      case 'inferred':
        return <span className="badge badge-inferred">Inferred</span>;
      case 'unknown':
      default:
        return <span className="badge badge-unknown">Unknown</span>;
    }
  };

  return (
    <div className="trace-shell">
      {/* Top Header */}
      <header className="trace-header">
        <div className="trace-logo">TRACE</div>
        <button
          className="trace-action-btn"
          onClick={handleTriggerCapture}
          disabled={isCapturing}
        >
          {isCapturing ? 'Capturing...' : 'Capture Active Page'}
        </button>
      </header>

      {/* Primary Product Areas (Profile | Research | My Path) */}
      <nav className="trace-nav-areas">
        <button
          className={`trace-nav-btn ${activeArea === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveArea('profile')}
        >
          Profile
        </button>
        <button
          className={`trace-nav-btn ${activeArea === 'research' ? 'active' : ''}`}
          onClick={() => setActiveArea('research')}
        >
          Research
        </button>
        <button
          className={`trace-nav-btn ${activeArea === 'mypath' ? 'active' : ''}`}
          onClick={() => setActiveArea('mypath')}
        >
          My Path
        </button>
      </nav>

      {/* Area 1: Single Profile Views */}
      {activeArea === 'profile' && (
        <>
          <nav className="trace-sub-nav">
            <button
              className={`trace-sub-btn ${activeSubView === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveSubView('timeline')}
            >
              Timeline
            </button>
            <button
              className={`trace-sub-btn ${activeSubView === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveSubView('skills')}
            >
              Skills
            </button>
            <button
              className={`trace-sub-btn ${activeSubView === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveSubView('summary')}
            >
              Summary
            </button>
            <button
              className={`trace-sub-btn ${activeSubView === 'evidence' ? 'active' : ''}`}
              onClick={() => setActiveSubView('evidence')}
            >
              Evidence Log
            </button>
          </nav>

          <main className="trace-content">
            {statusMessage && (
              <div className="trace-card" style={{ borderColor: 'var(--border-active)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{statusMessage}</div>
              </div>
            )}

            {currentProfile ? (
              <div>
                <div className="trace-card">
                  <div className="trace-card-header" style={{ fontSize: 15 }}>
                    {currentProfile.fullName}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {currentProfile.headline || 'No headline observed'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {renderBadge('observed')}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Captured: {new Date(currentProfile.capturedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Sub-view rendering over unified profile data */}
                {activeSubView === 'timeline' && (
                  <div className="trace-card">
                    <div className="trace-card-header">Timeline View</div>
                    {currentProfile.experiences.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No experiences captured yet.</p>
                    ) : (
                      currentProfile.experiences.map((exp) => (
                        <div key={exp.id} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: 600 }}>{exp.title}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{exp.companyName}</div>
                          <div style={{ marginTop: 4 }}>{renderBadge(exp.factState)}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeSubView === 'skills' && (
                  <div className="trace-card">
                    <div className="trace-card-header">Observed & Inferred Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentProfile.skills.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No skills documented yet.</p>
                      ) : (
                        currentProfile.skills.map((skill) => (
                          <div key={skill.id} style={{ display: 'inline-flex', gap: 4, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                            <span>{skill.name}</span>
                            {renderBadge(skill.factState)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeSubView === 'summary' && (
                  <div className="trace-card">
                    <div className="trace-card-header">Summary View</div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {currentProfile.aboutSummary || 'No about summary observed on profile.'}
                    </p>
                  </div>
                )}

                {activeSubView === 'evidence' && (
                  <div className="trace-card">
                    <div className="trace-card-header">Grounded Evidence Trail</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Total atomic evidence items linked: {currentProfile.evidenceIds.length}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="trace-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>No Profile Loaded</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                  Navigate to a LinkedIn profile in Chrome and click "Capture Active Page" above to analyze.
                </p>
              </div>
            )}
          </main>
        </>
      )}

      {/* Area 2: Research (Multiple Explicitly Saved Profiles) */}
      {activeArea === 'research' && (
        <main className="trace-content">
          <div className="trace-card">
            <div className="trace-card-header">Research Cohorts</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              Organize multiple saved profiles for role benchmarks and market trajectory analysis.
            </p>
            {researchSets.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                No active research sets. Save profiles from the Profile view to build cohorts.
              </div>
            ) : (
              researchSets.map((set) => (
                <div key={set.id} className="trace-card">
                  <div style={{ fontWeight: 600 }}>{set.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    Profiles saved: {set.profileRefs.length}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Area 3: My Path (User Profile vs Research Benchmark) */}
      {activeArea === 'mypath' && (
        <main className="trace-content">
          <div className="trace-card">
            <div className="trace-card-header">My Path Trajectory Analysis</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              Compares your canonical profile against selected research sets without fabricated score metrics.
            </p>
            {comparison ? (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Strengths</div>
                <ul style={{ paddingLeft: 16, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {comparison.qualitativeSummary.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Preparation Action Items</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Action items grounded in cohort evidence.
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Set your personal profile and select a research set to run trajectory comparison.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};
