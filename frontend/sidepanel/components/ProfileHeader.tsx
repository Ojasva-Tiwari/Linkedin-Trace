import React from 'react';
import { TraceProfile } from '@shared/index';
import { CheckIcon, NorthEastIcon } from './Icons';
import { MetricBreakdownBar, ArtifactCategory } from './MetricBreakdownBar';

interface ProfileHeaderProps {
  profile: TraceProfile;
  inResearch: boolean;
  onToggleResearch: () => void;
  artifactCounts: {
    internships: number;
    projects: number;
    hackathons: number;
    opensource: number;
  };
  observedEvidenceCount: number;
  activeArtifactCategory?: ArtifactCategory | null;
  onSelectArtifactCategory: (category: ArtifactCategory) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  inResearch,
  onToggleResearch,
  artifactCounts,
  observedEvidenceCount,
  activeArtifactCategory,
  onSelectArtifactCategory,
}) => {
  const primaryEducation = profile.education[0];
  const educationString = primaryEducation
    ? `${primaryEducation.schoolName}${primaryEducation.degree ? ` · ${primaryEducation.degree}` : ''}${primaryEducation.dateRange.rawString ? ` (${primaryEducation.dateRange.rawString})` : ''}`
    : null;

  return (
    <section
      className="trace-card"
      style={{
        marginBottom: '20px',
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(440px, 1.3fr)',
          gap: '28px',
          alignItems: 'center',
        }}
      >
        {/* Left: Candidate Identity & Core Metadata */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '22px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
              }}
            >
              {profile.fullName.slice(0, 2).toUpperCase()}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '2px solid #ffffff',
              }}
              title="Verified Identity Anchor"
            >
              <CheckIcon size={11} />
            </span>
          </div>

          {/* Name, Headline, Education & Actions */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="font-headline-xl" style={{ color: 'var(--text-primary)', margin: 0 }}>
                {profile.fullName}
              </h1>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'inline-block',
                }}
                title="Active Profile Synthesized"
              />
              <span
                className="font-label-sm"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Batch of '26
              </span>
            </div>

            <p
              className="font-headline-sm"
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              {profile.headline || 'Software Engineer'}
            </p>

            {educationString && (
              <p
                className="font-body-sm"
                style={{
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  fontSize: '12.5px',
                }}
              >
                {educationString}
              </p>
            )}

            {/* Actions: LinkedIn link & In Research toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <a
                href={profile.sourceUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: '1px solid var(--border-hairline)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>LinkedIn Profile</span>
                <NorthEastIcon size={12} className="text-secondary" />
              </a>

              <button
                type="button"
                onClick={onToggleResearch}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: inResearch ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: inResearch ? 'var(--primary)' : 'var(--text-secondary)',
                  border: inResearch ? '1px solid var(--primary)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {inResearch && <CheckIcon size={13} />}
                <span>{inResearch ? 'In Research Cohort' : 'Save to Research'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Decomposed Horizontal Metric Blocks */}
        <div>
          <MetricBreakdownBar
            counts={artifactCounts}
            totalEvidenceCount={profile.evidenceIds.length}
            observedCount={observedEvidenceCount}
            activeCategory={activeArtifactCategory}
            onSelectCategory={onSelectArtifactCategory}
          />
        </div>
      </div>
    </section>
  );
};
