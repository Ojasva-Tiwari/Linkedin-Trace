import React, { useState, useEffect, useMemo } from 'react';
import {
  ResearchSet,
  TraceProfile,
  CohortComparison,
  CohortPattern,
} from '@shared/index';
import {
  UsersIcon,
  NorthEastIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from './Icons';
import { traceStorage } from '../../../storage/indexeddb';
import { computeCohortComparison } from '../../../features/research/research-comparator';

interface ResearchViewProps {
  researchSets: ResearchSet[];
  activeSetId: string | null;
  onSelectSet: (setId: string) => void;
  onCreateSet: (title: string, description?: string) => Promise<void>;
  onRenameSet: (setId: string, newTitle: string) => Promise<void>;
  onDeleteSet: (setId: string) => Promise<void>;
  currentProfile: TraceProfile | null;
  onAddCurrentProfileToSet: (setId: string) => Promise<void>;
  onRemoveProfileFromSet: (setId: string, profileId: string) => Promise<void>;
  onSelectProfile: (profileId: string) => void;
  onInspectEvidence: (evidenceId: string) => void;
  layoutMode?: 'compact' | 'expanded';
  onLoadSampleCohort?: () => Promise<void>;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  researchSets,
  activeSetId,
  onSelectSet,
  onCreateSet,
  onRenameSet,
  onDeleteSet,
  currentProfile,
  onAddCurrentProfileToSet,
  onRemoveProfileFromSet,
  onSelectProfile,
  onInspectEvidence,
  layoutMode = 'expanded',
  onLoadSampleCohort,
}) => {
  const [loadedProfiles, setLoadedProfiles] = useState<TraceProfile[]>([]);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isRenamingSet, setIsRenamingSet] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');
  const [highlightedProfileIds, setHighlightedProfileIds] = useState<string[] | null>(null);

  // Determine active cohort
  const activeCohort = useMemo(() => {
    if (!activeSetId) return researchSets[0] || null;
    return researchSets.find((s) => s.id === activeSetId) || researchSets[0] || null;
  }, [researchSets, activeSetId]);

  // Load full profile records for active cohort
  useEffect(() => {
    let isMounted = true;
    async function loadCohortProfiles() {
      if (!activeCohort || activeCohort.profileRefs.length === 0) {
        setLoadedProfiles([]);
        return;
      }
      try {
        const ids = activeCohort.profileRefs.map((r) => r.profileId);
        const profiles = await traceStorage.getProfilesBatch(ids);
        if (isMounted) {
          setLoadedProfiles(profiles);
        }
      } catch (err) {
        console.error('Failed to load profiles for research cohort:', err);
      }
    }
    loadCohortProfiles();
    return () => {
      isMounted = false;
    };
  }, [activeCohort]);

  // Compute pure cohort comparison
  const comparison: CohortComparison = useMemo(() => {
    if (!activeCohort) {
      return {
        researchSetId: '',
        researchSetTitle: '',
        comparedAt: new Date().toISOString(),
        profileSummaries: [],
        patterns: [],
        aggregateMetrics: {
          totalProfiles: 0,
          profilesWithInternships: 0,
          profilesWithProjects: 0,
          profilesWithOpenSource: 0,
          profilesWithHackathons: 0,
          profilesWithDSA: 0,
          topSkills: [],
        },
        epistemicDemarcation: {
          observedCount: 0,
          inferredCount: 0,
          unknownCount: 0,
        },
      };
    }
    return computeCohortComparison(activeCohort, loadedProfiles);
  }, [activeCohort, loadedProfiles]);

  const isCurrentProfileInActiveSet = useMemo(() => {
    if (!currentProfile || !activeCohort) return false;
    return activeCohort.profileRefs.some((r) => r.profileId === currentProfile.id);
  }, [currentProfile, activeCohort]);

  // Handler for creating set
  const handleCreateSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateSet(newTitle.trim(), newDesc.trim() || undefined);
    setNewTitle('');
    setNewDesc('');
    setIsCreatingSet(false);
  };

  // Handler for renaming set
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCohort || !renameTitle.trim()) return;
    await onRenameSet(activeCohort.id, renameTitle.trim());
    setIsRenamingSet(false);
  };

  // Toggle supporting profiles filter
  const handleToggleSupportingProfiles = (pattern: CohortPattern) => {
    if (
      highlightedProfileIds &&
      highlightedProfileIds.length === pattern.supportingProfileIds.length &&
      pattern.supportingProfileIds.every((id) => highlightedProfileIds.includes(id))
    ) {
      setHighlightedProfileIds(null);
    } else {
      setHighlightedProfileIds(pattern.supportingProfileIds);
    }
  };

  const isCompact = layoutMode === 'compact';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '16px' : '24px' }}>
      {/* Header & Cohort Selection Bar */}
      <section
        className="trace-card"
        style={{
          padding: isCompact ? '14px 16px' : '20px 24px',
          display: 'flex',
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: isCompact ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UsersIcon size={20} />
          </div>
          <div>
            <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', fontSize: 17, margin: 0 }}>
              Research & Cohort Comparison
            </h2>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: 2, fontSize: '12px' }}>
              Compare explicitly saved profiles across verified milestones, projects, and skills. Zero fake scores.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isCompact ? '100%' : 'auto' }}>
          {currentProfile && activeCohort && (
            <button
              type="button"
              onClick={() => {
                if (isCurrentProfileInActiveSet) {
                  onRemoveProfileFromSet(activeCohort.id, currentProfile.id);
                } else {
                  onAddCurrentProfileToSet(activeCohort.id);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCurrentProfileInActiveSet ? 'var(--bg-subtle)' : 'var(--primary)',
                color: isCurrentProfileInActiveSet ? 'var(--text-primary)' : 'var(--text-inverse)',
                border: isCurrentProfileInActiveSet ? '1px solid var(--border-subtle)' : 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isCurrentProfileInActiveSet ? (
                <>✓ In Research</>
              ) : (
                <>+ Add {currentProfile.fullName.split(' ')[0]} to Cohort</>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreatingSet(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PlusIcon size={14} />
            <span>New Cohort</span>
          </button>
        </div>
      </section>

      {/* Cohort Tabs / Controls */}
      {researchSets.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '2px',
            }}
          >
            {researchSets.map((set) => {
              const isSelected = activeCohort?.id === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onSelectSet(set.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{set.title}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-muted)',
                    }}
                  >
                    {set.profileRefs.length}
                  </span>
                </button>
              );
            })}
          </div>

          {activeCohort && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setRenameTitle(activeCohort.title);
                  setIsRenamingSet(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  textDecoration: 'underline',
                }}
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete cohort "${activeCohort.title}"?`)) {
                    onDeleteSet(activeCohort.id);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-red, #dc2626)',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <TrashIcon size={12} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal / Form: Create Cohort */}
      {isCreatingSet && (
        <form
          onSubmit={handleCreateSetSubmit}
          className="trace-card"
          style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)' }}
        >
          <h4 className="font-headline-sm" style={{ margin: '0 0 10px 0', fontSize: 14 }}>
            Create New Research Cohort
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Cohort title (e.g. SDE Tier-1 Interns 2026)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
              }}
            />
            <input
              type="text"
              placeholder="Optional description / criteria"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsCreatingSet(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal / Form: Rename Cohort */}
      {isRenamingSet && activeCohort && (
        <form
          onSubmit={handleRenameSubmit}
          className="trace-card"
          style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)' }}
        >
          <h4 className="font-headline-sm" style={{ margin: '0 0 10px 0', fontSize: 14 }}>
            Rename Cohort
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
              }}
            />
            <button
              type="button"
              onClick={() => setIsRenamingSet(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'none',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {(!activeCohort || activeCohort.profileRefs.length === 0) && (
        <div className="trace-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ margin: '0 auto 12px auto', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
            <UsersIcon size={36} className="text-muted" />
          </div>
          <p className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0 }}>
            {activeCohort ? `Cohort "${activeCohort.title}" is Empty` : 'No Cohorts Established'}
          </p>
          <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', margin: '8px auto 0 auto', fontSize: '13px' }}>
            A Profile view is for ONE person. Research compares MULTIPLE profiles intentionally saved by you.
            Navigate to any profile and click <strong>"Add to Research"</strong> to begin cross-profile benchmarking.
          </p>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {currentProfile && activeCohort && (
              <button
                type="button"
                onClick={() => onAddCurrentProfileToSet(activeCohort.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Active Profile ({currentProfile.fullName})
              </button>
            )}

            {onLoadSampleCohort && (
              <button
                type="button"
                onClick={onLoadSampleCohort}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                Load Demo Sample Cohort (For Validation)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Populated Cohort Content */}
      {activeCohort && activeCohort.profileRefs.length > 0 && (
        <>
          {/* Aggregate Cross-Profile Metrics Bar */}
          <section
            className="trace-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: isCompact ? 'column' : 'row',
              alignItems: isCompact ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '16px',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-headline-sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cohort Footprint: {comparison.aggregateMetrics.totalProfiles} Verified Profiles
                </span>
                <span className="epistemic-badge observed">● All Counts Decomposable</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>
                  Internships: <strong>{comparison.aggregateMetrics.profilesWithInternships}/{comparison.aggregateMetrics.totalProfiles}</strong>
                </span>
                <span>
                  Projects: <strong>{comparison.aggregateMetrics.profilesWithProjects}/{comparison.aggregateMetrics.totalProfiles}</strong>
                </span>
                <span>
                  Open Source: <strong>{comparison.aggregateMetrics.profilesWithOpenSource}/{comparison.aggregateMetrics.totalProfiles}</strong>
                </span>
                <span>
                  DSA / Problems: <strong>{comparison.aggregateMetrics.profilesWithDSA}/{comparison.aggregateMetrics.totalProfiles}</strong>
                </span>
              </div>
            </div>

            {comparison.aggregateMetrics.topSkills.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: isCompact ? '100%' : '45%' }}>
                <span className="font-code-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Top Cohort Skills:
                </span>
                {comparison.aggregateMetrics.topSkills.slice(0, 4).map((s) => (
                  <span
                    key={s.skill}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      color: 'var(--primary)',
                      fontWeight: 600,
                    }}
                  >
                    {s.skill} ({s.profileCount}/{comparison.aggregateMetrics.totalProfiles})
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Cross-Profile Patterns Section */}
          <section className="trace-card" style={{ padding: isCompact ? '16px' : '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0, fontSize: 16 }}>
                  Observed Cross-Profile Patterns
                </h3>
                <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2, fontSize: '12px' }}>
                  Empirical milestones recurring across selected profiles. No causal claims.
                </p>
              </div>
              <span className="font-code-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                {comparison.patterns.length} Patterns Identified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comparison.patterns.map((pattern) => {
                const isSelected =
                  highlightedProfileIds &&
                  highlightedProfileIds.length === pattern.supportingProfileIds.length &&
                  pattern.supportingProfileIds.every((id) => highlightedProfileIds.includes(id));

                return (
                  <div
                    key={pattern.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-headline-sm" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                          {pattern.title}
                        </span>
                        <span className="epistemic-badge observed">
                          ● {pattern.factState.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-code-sm" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '12px' }}>
                        {pattern.observation}
                      </span>
                    </div>

                    {pattern.rationale && (
                      <p className="font-body-sm" style={{ color: 'var(--text-secondary)', margin: '6px 0 10px 0', fontSize: '12px' }}>
                        {pattern.rationale}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px solid var(--border-hairline)' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSupportingProfiles(pattern)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0,
                        }}
                      >
                        <span>
                          {isSelected ? '✓ Showing supporting profiles' : `View supporting profiles (${pattern.supportingProfileNames.length})`}
                        </span>
                      </button>

                      {pattern.evidenceIds && pattern.evidenceIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="font-code-sm" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Evidence citations:
                          </span>
                          {pattern.evidenceIds.slice(0, 3).map((evId) => (
                            <button
                              key={evId}
                              type="button"
                              onClick={() => onInspectEvidence(evId)}
                              style={{
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--primary)',
                                fontSize: '10px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                              title={`Inspect evidence ${evId}`}
                            >
                              #{evId.slice(-6)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Side-by-Side Profiles Comparison Grid */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0, fontSize: 16 }}>
                Profile Comparison Matrix ({comparison.profileSummaries.length})
              </h3>
              {highlightedProfileIds && (
                <button
                  type="button"
                  onClick={() => setHighlightedProfileIds(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: 600,
                  }}
                >
                  Reset profile filter
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isCompact
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {comparison.profileSummaries
                .filter((p) => !highlightedProfileIds || highlightedProfileIds.includes(p.profileId))
                .map((summary) => (
                  <div
                    key={summary.profileId}
                    className="trace-card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      {/* Profile Card Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              border: '1px solid rgba(0, 104, 95, 0.2)',
                            }}
                          >
                            {summary.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0, fontSize: 14 }}>
                              {summary.fullName}
                            </h4>
                            <p className="font-code-sm" style={{ color: 'var(--primary)', fontSize: '11px', margin: '2px 0 0 0' }}>
                              {summary.currentRole}
                            </p>
                          </div>
                        </div>
                        <span className="epistemic-badge observed">● Tracked</span>
                      </div>

                      {summary.educationSummary && (
                        <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '11.5px' }}>
                          🎓 {summary.educationSummary}
                        </p>
                      )}

                      {/* Decomposed Evidence Stats */}
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          fontSize: '11.5px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckIcon size={12} className="text-primary" />
                          <span>Internships: <strong>{summary.internshipCount}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckIcon size={12} className="text-primary" />
                          <span>Projects: <strong>{summary.projectCount}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckIcon size={12} className="text-primary" />
                          <span>Open Source: <strong>{summary.openSourceCount}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckIcon size={12} className="text-primary" />
                          <span>Hackathons: <strong>{summary.hackathonCount}</strong></span>
                        </div>
                        {summary.dsaProblemCount !== undefined && (
                          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckIcon size={12} className="text-primary" />
                            <span>DSA Footprint: <strong>{summary.dsaProblemCount} documented</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Observed Skills */}
                      {summary.observedSkills.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <span className="font-code-sm" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Observed Skills ({summary.observedSkills.length}):
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                            {summary.observedSkills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                style={{
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-subtle)',
                                  border: '1px solid var(--border-hairline)',
                                  fontSize: '10.5px',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {summary.observedSkills.length > 5 && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                +{summary.observedSkills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        <span>{summary.evidenceCount} evidence</span>
                        <span>•</span>
                        <span>{summary.sourceCount} sources</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => onRemoveProfileFromSet(activeCohort.id, summary.profileId)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                          title="Remove from this cohort"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectProfile(summary.profileId)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-inverse)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          <span>Open Dossier</span>
                          <NorthEastIcon size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
