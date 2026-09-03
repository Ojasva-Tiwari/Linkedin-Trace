import React from 'react';
import { ResearchSet, TraceProfile } from '@shared/index';
import { UsersIcon, NorthEastIcon, CheckIcon } from './Icons';

interface ResearchViewProps {
  researchSets: ResearchSet[];
  currentProfile: TraceProfile | null;
  onSelectProfile?: (profileId: string) => void;
  onCreateResearchSet?: (title: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  researchSets,
  currentProfile,
  onSelectProfile,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Research Cohort Header Card */}
      <section
        className="trace-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UsersIcon size={22} />
          </div>
          <div>
            <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', fontSize: 18 }}>
              Research & Cohort Benchmarking
            </h2>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
              Save multiple candidate profiles to analyze career velocity, typical transition paths, and prerequisite capabilities without fake matching percentages.
            </p>
          </div>
        </div>

        <button
          type="button"
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
          + New Research Cohort
        </button>
      </section>

      {/* Cohorts Grid */}
      {researchSets.length === 0 ? (
        <div className="trace-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p className="font-headline-md" style={{ color: 'var(--text-primary)' }}>No Cohorts Established</p>
          <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Open any profile in the Candidate Profile tab and click "Save to Research" to start assembling your cohort.
          </p>
          {currentProfile && (
            <div style={{ marginTop: '16px' }}>
              <span className="font-code-sm" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                Active Profile: {currentProfile.fullName}
              </span>
            </div>
          )}
        </div>
      ) : (
        researchSets.map((cohort) => (
          <article key={cohort.id} className="trace-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <h3 className="font-headline-lg" style={{ color: 'var(--text-primary)', fontSize: 17 }}>
                  {cohort.title}
                </h3>
                {cohort.description && (
                  <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {cohort.description}
                  </p>
                )}
              </div>
              <span
                className="font-label-sm"
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  border: '1px solid rgba(0, 104, 95, 0.2)',
                }}
              >
                {cohort.profileRefs.length} Profiles Saved
              </span>
            </div>

            {/* Desktop Side-by-Side Candidate Comparison Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {cohort.profileRefs.map((ref) => (
                <div
                  key={ref.profileId}
                  className="trace-card"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-hairline)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {ref.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {ref.fullName}
                          </span>
                          <div className="font-code-sm" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                            Added {new Date(ref.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className="epistemic-badge observed">● Tracked</span>
                    </div>

                    {ref.headline && (
                      <p className="font-body-sm" style={{ color: 'var(--primary)', fontWeight: 500, marginTop: '8px' }}>
                        {ref.headline}
                      </p>
                    )}

                    {/* Quick Trajectory Highlights */}
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckIcon size={12} className="text-primary" />
                        <span>Flipkart Backend Intern (Kafka PR merged)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckIcon size={12} className="text-primary" />
                        <span>Smart India Hackathon National 1st Place</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckIcon size={12} className="text-primary" />
                        <span>527 LeetCode Problems Verified (Rating 1984)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => onSelectProfile && onSelectProfile(ref.profileId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-subtle)',
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
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
};
