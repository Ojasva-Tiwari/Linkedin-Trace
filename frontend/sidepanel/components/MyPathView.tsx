import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPathJourney,
  ResearchSet,
  TraceProfile,
  CohortComparison,
  MyPathDescriptiveComparison,
} from '@shared/index';
import { CompassIcon, CheckIcon, PlusIcon } from './Icons';
import { traceStorage } from '../../../storage/indexeddb';
import { computeCohortComparison } from '../../../features/research/research-comparator';
import { computeMyPathDescriptiveComparison } from '../../../features/mypath/mypath-comparator';

interface MyPathViewProps {
  researchSets: ResearchSet[];
  onSelectCohort?: (cohortId: string) => void;
  onInspectEvidence: (evidenceId: string) => void;
  layoutMode?: 'compact' | 'expanded';
}

const DEFAULT_EMPTY_JOURNEY: UserPathJourney = {
  id: 'default_user_path',
  fullName: 'Your Career Journey',
  targetRole: 'Software Development Engineer',
  currentStage: 'student',
  education: [],
  experiences: [],
  projects: [],
  hackathons: [],
  openSource: [],
  dsa: { problemCount: 0, platform: 'LeetCode' },
  skills: [],
  certifications: [],
  notes: '',
  updatedAt: new Date().toISOString(),
};

const STARTER_DEMO_JOURNEY: UserPathJourney = {
  id: 'default_user_path',
  fullName: 'Alex Morgan',
  targetRole: 'Full Stack Engineer',
  currentStage: 'student',
  education: [
    {
      id: 'edu-1',
      schoolName: 'State University of Technology',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startDate: '2022',
      endDate: '2026',
    },
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'CloudTech Solutions',
      title: 'Software Engineering Intern',
      startDate: 'June 2024',
      endDate: 'August 2024',
      description: 'Worked on REST API endpoints in TypeScript and PostgreSQL.',
      isInternship: true,
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Real-Time Distributed Chat',
      description: 'Go WebSockets service with Redis Pub/Sub backend.',
      technologies: ['Go', 'Redis', 'WebSockets', 'Docker'],
      url: 'https://github.com/example/chat-engine',
    },
  ],
  hackathons: [],
  openSource: [
    {
      id: 'os-1',
      repoName: 'facebook/react',
      contributionSummary: 'Documentation and unit test fix for hooks runtime.',
      url: 'https://github.com/facebook/react/pulls',
    },
  ],
  dsa: {
    problemCount: 180,
    platform: 'LeetCode',
    contestRating: '1650',
  },
  skills: ['TypeScript', 'Go', 'Docker', 'PostgreSQL', 'React', 'Git'],
  certifications: [],
  notes: 'Focusing on distributed systems and backend engineering.',
  updatedAt: new Date().toISOString(),
};

export const MyPathView: React.FC<MyPathViewProps> = ({
  researchSets,
  onInspectEvidence,
  layoutMode = 'expanded',
}) => {
  const [userJourney, setUserJourney] = useState<UserPathJourney>(DEFAULT_EMPTY_JOURNEY);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [cohortProfiles, setCohortProfiles] = useState<TraceProfile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editTargetRole, setEditTargetRole] = useState('');
  const [editStage, setEditStage] = useState<'student' | 'early_career' | 'transitioning' | 'experienced'>('student');
  const [editSkills, setEditSkills] = useState('');
  const [editDsaCount, setEditDsaCount] = useState(0);

  // Load User Path from IndexedDB
  useEffect(() => {
    async function loadUserPath() {
      try {
        const saved = await traceStorage.getUserPath('default_user_path');
        if (saved) {
          setUserJourney(saved);
        }
      } catch (err) {
        console.error('Failed to load user path from IndexedDB:', err);
      }
    }
    loadUserPath();
  }, []);

  // Sync edit form fields when editing begins
  useEffect(() => {
    if (isEditing) {
      setEditFullName(userJourney.fullName);
      setEditTargetRole(userJourney.targetRole || '');
      setEditStage(userJourney.currentStage);
      setEditSkills((userJourney.skills || []).join(', '));
      setEditDsaCount(userJourney.dsa?.problemCount || 0);
    }
  }, [isEditing, userJourney]);

  // Set initial selected cohort
  useEffect(() => {
    if (!selectedCohortId && researchSets.length > 0) {
      setSelectedCohortId(researchSets[0].id);
    }
  }, [researchSets, selectedCohortId]);

  // Load profiles for selected cohort
  const selectedCohort = useMemo(() => {
    return researchSets.find((s) => s.id === selectedCohortId) || researchSets[0] || null;
  }, [researchSets, selectedCohortId]);

  useEffect(() => {
    let isMounted = true;
    async function loadProfiles() {
      if (!selectedCohort || selectedCohort.profileRefs.length === 0) {
        setCohortProfiles([]);
        return;
      }
      try {
        const ids = selectedCohort.profileRefs.map((r) => r.profileId);
        const profiles = await traceStorage.getProfilesBatch(ids);
        if (isMounted) setCohortProfiles(profiles);
      } catch (err) {
        console.error('Failed to load cohort profiles for My Path:', err);
      }
    }
    loadProfiles();
    return () => {
      isMounted = false;
    };
  }, [selectedCohort]);

  // Compute Cohort Comparison
  const cohortComparison: CohortComparison = useMemo(() => {
    if (!selectedCohort) {
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
    return computeCohortComparison(selectedCohort, cohortProfiles);
  }, [selectedCohort, cohortProfiles]);

  // Compute My Path Descriptive Comparison
  const descriptiveComparison: MyPathDescriptiveComparison = useMemo(() => {
    return computeMyPathDescriptiveComparison(userJourney, cohortComparison);
  }, [userJourney, cohortComparison]);

  // Save journey to IndexedDB
  const handleSaveJourney = async (updated: UserPathJourney) => {
    try {
      await traceStorage.saveUserPath(updated);
      setUserJourney(updated);
    } catch (err) {
      console.error('Failed to save user path:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsList = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: UserPathJourney = {
      ...userJourney,
      fullName: editFullName.trim() || 'Your Career Journey',
      targetRole: editTargetRole.trim() || undefined,
      currentStage: editStage,
      skills: skillsList,
      dsa: {
        ...userJourney.dsa,
        problemCount: editDsaCount,
      },
      updatedAt: new Date().toISOString(),
    };
    await handleSaveJourney(updated);
    setIsEditing(false);
  };

  const handleLoadStarterDemo = async () => {
    await handleSaveJourney(STARTER_DEMO_JOURNEY);
  };

  // Quick add helpers for user path items
  const handleAddProject = async () => {
    const title = window.prompt('Project title:');
    if (!title) return;
    const tech = window.prompt('Technologies used (comma-separated):') || '';
    const newProj = {
      id: `proj-${Date.now()}`,
      title,
      description: 'Documented project artifact',
      technologies: tech.split(',').map((t) => t.trim()).filter(Boolean),
    };
    const updated = {
      ...userJourney,
      projects: [...(userJourney.projects || []), newProj],
      updatedAt: new Date().toISOString(),
    };
    await handleSaveJourney(updated);
  };

  const handleAddInternship = async () => {
    const title = window.prompt('Role title (e.g. Backend Intern):');
    if (!title) return;
    const company = window.prompt('Company name:') || 'Company';
    const newExp = {
      id: `exp-${Date.now()}`,
      title,
      company,
      isInternship: true,
      startDate: '2024',
    };
    const updated = {
      ...userJourney,
      experiences: [...(userJourney.experiences || []), newExp],
      updatedAt: new Date().toISOString(),
    };
    await handleSaveJourney(updated);
  };

  const handleAddOpenSource = async () => {
    const repoName = window.prompt('Repository name (e.g. facebook/react):');
    if (!repoName) return;
    const newOs = {
      id: `os-${Date.now()}`,
      repoName,
      contributionSummary: 'Pull request or active contribution',
    };
    const updated = {
      ...userJourney,
      openSource: [...(userJourney.openSource || []), newOs],
      updatedAt: new Date().toISOString(),
    };
    await handleSaveJourney(updated);
  };

  const isCompact = layoutMode === 'compact';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '16px' : '24px' }}>
      {/* Overview Banner */}
      <section
        className="trace-card"
        style={{
          padding: isCompact ? '14px 16px' : '20px 24px',
          display: 'flex',
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: isCompact ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <CompassIcon size={22} />
          </div>
          <div>
            <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', fontSize: 17, margin: 0 }}>
              My Path Trajectory Analysis
            </h2>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: 2, fontSize: '12px' }}>
              Compare your own documented path against researched patterns. Descriptive facts only—zero fake percentages or predictive scores.
            </p>
          </div>
        </div>

        {/* Cohort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isCompact ? '100%' : 'auto' }}>
          <label htmlFor="cohort-select" className="font-code-sm" style={{ color: 'var(--text-secondary)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
            Benchmarking against:
          </label>
          <select
            id="cohort-select"
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              flex: isCompact ? 1 : 'none',
            }}
          >
            {researchSets.length === 0 ? (
              <option value="">No Research Cohorts Available</option>
            ) : (
              researchSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.profileRefs.length} profiles)
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      {/* Main 2-Column / Stacked Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'minmax(320px, 1fr) minmax(440px, 1.4fr)',
          gap: isCompact ? '16px' : '24px',
        }}
      >
        {/* Left Column: User Documented Journey */}
        <article className="trace-card" style={{ padding: isCompact ? '16px' : '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Your Documented Journey
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="epistemic-badge observed">● Self-Curated</span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {/* User Profile Summary Card */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
            }}
          >
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
                {userJourney.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0, fontSize: 14 }}>
                  {userJourney.fullName}
                </h3>
                <span className="font-code-sm" style={{ color: 'var(--primary)', fontSize: '11px' }}>
                  {userJourney.targetRole || 'Target Role Unstated'} • {userJourney.currentStage}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form Modal/Drawer */}
          {isEditing && (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>
              <div>
                <label className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Role</label>
                <input
                  type="text"
                  value={editTargetRole}
                  onChange={(e) => setEditTargetRole(e.target.value)}
                  placeholder="e.g. SDE Backend"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>
              <div>
                <label className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Career Stage</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as any)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option value="student">Student / Undergraduate</option>
                  <option value="early_career">Early Career (0-2 YOE)</option>
                  <option value="transitioning">Career Transitioning</option>
                  <option value="experienced">Experienced Professional</option>
                </select>
              </div>
              <div>
                <label className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder="TypeScript, Python, Docker, Go"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>
              <div>
                <label className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DSA Problems Solved</label>
                <input
                  type="number"
                  value={editDsaCount}
                  onChange={(e) => setEditDsaCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  alignSelf: 'flex-end',
                }}
              >
                Save Details
              </button>
            </form>
          )}

          {/* Documented Milestones Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Education:</span>
              <span className="font-code-sm">
                {userJourney.education?.[0]
                  ? `${userJourney.education[0].degree || ''} ${userJourney.education[0].fieldOfStudy || ''} (${userJourney.education[0].schoolName})`
                  : 'Not entered'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Internships:</span>
              <span className="font-code-sm">
                {(userJourney.experiences || []).filter((e) => e.isInternship).length} documented
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projects:</span>
              <span className="font-code-sm">
                {userJourney.projects?.length || 0} documented
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Open Source:</span>
              <span className="font-code-sm">
                {userJourney.openSource?.length || 0} contribution(s)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DSA Problems Solved:</span>
              <span className="font-code-sm">
                {userJourney.dsa?.problemCount ? `${userJourney.dsa.problemCount} (${userJourney.dsa.platform || 'LeetCode'})` : 'None documented'}
              </span>
            </div>
          </div>

          {/* Quick Record Adders */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAddProject}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <PlusIcon size={12} />
              <span>Project</span>
            </button>
            <button
              type="button"
              onClick={handleAddInternship}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <PlusIcon size={12} />
              <span>Internship</span>
            </button>
            <button
              type="button"
              onClick={handleAddOpenSource}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <PlusIcon size={12} />
              <span>Open Source</span>
            </button>
          </div>

          {/* Starter Profile for Quick Testing */}
          {userJourney.projects?.length === 0 && (userJourney.experiences || []).length === 0 && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '11.5px' }}>
                Testing My Path? Populate a sample user trajectory baseline with 1 click:
              </p>
              <button
                type="button"
                onClick={handleLoadStarterDemo}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--primary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  fontWeight: 600,
                }}
              >
                Load Starter User Baseline
              </button>
            </div>
          )}
        </article>

        {/* Right Column: Descriptive Comparison vs Researched Patterns */}
        <article className="trace-card" style={{ padding: isCompact ? '16px' : '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0, fontSize: 16 }}>
                Descriptive Comparison & Observations
              </h3>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2, fontSize: '12px' }}>
                {selectedCohort ? `Benchmarking against "${selectedCohort.title}" (${cohortComparison.aggregateMetrics.totalProfiles} profiles)` : 'Select a cohort'}
              </p>
            </div>
            <span
              className="font-code-sm"
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              Zero Match % • Empirical Only
            </span>
          </div>

          {/* If no cohort profiles exist */}
          {cohortComparison.aggregateMetrics.totalProfiles === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <p className="font-headline-sm" style={{ color: 'var(--text-primary)' }}>No Cohort Data for Comparison</p>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
                Go to the Research tab and add candidate profiles to this cohort to view grounded comparative observations.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Comparative Dimensions Panel */}
              <div>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                  Dimension Observations
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {descriptiveComparison.dimensions.map((dim) => (
                    <div
                      key={dim.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span className="font-headline-sm" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {dim.label}
                        </span>
                        <span className="epistemic-badge observed">● {dim.factState.toUpperCase()}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', minWidth: '78px', fontSize: '11px' }}>RESEARCH:</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dim.cohortObservation}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: 'var(--primary)', minWidth: '78px', fontSize: '11px' }}>YOUR PATH:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{dim.userPathStatus}</span>
                        </div>
                      </div>

                      {dim.supportingProfileNames.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-hairline)' }}>
                          <span className="font-code-sm" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Cohort precedents: {dim.supportingProfileNames.slice(0, 3).join(', ')}
                          </span>
                          {dim.evidenceIds && dim.evidenceIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => onInspectEvidence(dim.evidenceIds[0])}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '10.5px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0,
                              }}
                            >
                              Inspect evidence #{dim.evidenceIds[0].slice(-6)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptive Gaps Panel */}
              {descriptiveComparison.gaps.length > 0 && (
                <div>
                  <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Descriptive Trajectory Differences
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {descriptiveComparison.gaps.map((gap) => (
                      <div
                        key={gap.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(217, 119, 6, 0.08)',
                          border: '1px solid rgba(217, 119, 6, 0.25)',
                          fontSize: '12px',
                        }}
                      >
                        <p style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {gap.observedDifference}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                          <div>Cohort precedent: {gap.cohortPrecedent}</div>
                          <div>Your current trajectory: {gap.userCurrentState}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Non-Prescriptive Recommendations */}
              {descriptiveComparison.recommendations.length > 0 && (
                <div>
                  <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Grounded Next Considerations
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {descriptiveComparison.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckIcon size={14} className="text-primary" />
                          <h4 className="font-headline-sm" style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                            {rec.title}
                          </h4>
                        </div>
                        <p className="font-body-sm" style={{ color: 'var(--text-secondary)', margin: '6px 0 8px 0', fontSize: '12px' }}>
                          <em>{rec.precedentSummary}</em> {rec.recommendation}
                        </p>
                        {rec.supportingProfileNames && rec.supportingProfileNames.length > 0 && (
                          <span className="font-code-sm" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Precedent observed in: {rec.supportingProfileNames.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
