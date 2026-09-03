import React from 'react';
import { InfoIcon } from './Icons';

export type ArtifactCategory = 'internships' | 'projects' | 'hackathons' | 'opensource';

interface MetricBreakdownBarProps {
  counts: {
    internships: number;
    projects: number;
    hackathons: number;
    opensource: number;
  };
  totalEvidenceCount: number;
  observedCount: number;
  activeCategory?: ArtifactCategory | null;
  onSelectCategory: (category: ArtifactCategory) => void;
}

export const MetricBreakdownBar: React.FC<MetricBreakdownBarProps> = ({
  counts,
  totalEvidenceCount,
  observedCount,
  activeCategory,
  onSelectCategory,
}) => {
  const formatCount = (n: number) => n.toString().padStart(2, '0');

  const categories = [
    { id: 'internships' as const, label: 'Internships', count: counts.internships, subtitle: 'Corporate roles' },
    { id: 'projects' as const, label: 'Projects', count: counts.projects, subtitle: 'Engineering artifacts' },
    { id: 'hackathons' as const, label: 'Hackathons', count: counts.hackathons, subtitle: 'Competitive events' },
    { id: 'opensource' as const, label: 'Open-Source', count: counts.opensource, subtitle: 'Public contributions' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-hairline)',
        padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* 4 Large Desktop Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-container)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  className="font-headline-lg"
                  style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    fontSize: 20,
                  }}
                >
                  {formatCount(cat.count)}
                </span>
                <span
                  className="font-label-md"
                  style={{
                    fontWeight: 600,
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {cat.label}
                </span>
              </div>
              <span
                className="font-code-sm"
                style={{
                  fontSize: 10,
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {cat.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Evidence Grounding Footer (NO fake verification percentages) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 4px 2px 4px',
          color: 'var(--text-secondary)',
          fontSize: 11,
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 10,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <InfoIcon size={13} className="text-secondary" />
          <span>Click any metric block to inspect decomposed source records</span>
        </span>
        <span className="font-code-sm" style={{ fontSize: 11, color: 'var(--text-primary)' }}>
          {totalEvidenceCount} linked sources ({observedCount} observed · {totalEvidenceCount - observedCount} inferred)
        </span>
      </div>
    </div>
  );
};
