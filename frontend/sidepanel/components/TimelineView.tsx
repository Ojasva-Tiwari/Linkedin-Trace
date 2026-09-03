import React from 'react';
import { FactState, TimelineEvent } from '@shared/index';
import { LinkIcon } from './Icons';

interface TimelineYearGroup {
  yearTitle: string;
  subTitle?: string;
  events: TimelineEvent[];
}

interface TimelineViewProps {
  events: TimelineEvent[];
  onInspectEvidence: (evidenceId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  onInspectEvidence,
}) => {
  // Group events by year/academic stage
  const groups: TimelineYearGroup[] = React.useMemo(() => {
    if (events.length === 0) return [];

    const map = new Map<string, TimelineEvent[]>();
    events.forEach((ev) => {
      const year = ev.startDate ? new Date(ev.startDate).getFullYear().toString() : 'Milestones';
      const existing = map.get(year) || [];
      existing.push(ev);
      map.set(year, existing);
    });

    const result: TimelineYearGroup[] = [];
    map.forEach((evList, year) => {
      result.push({
        yearTitle: year,
        subTitle: year === '2025' || year === '2026' ? 'Placement & Senior Stage' : year === '2024' ? 'Internships & SIH Win' : 'Undergraduate Foundations',
        events: evList,
      });
    });

    return result.length > 0 ? result : [
      {
        yearTitle: 'All Milestones',
        subTitle: 'Chronological Progression',
        events,
      },
    ];
  }, [events]);

  const renderBadge = (factState: FactState) => {
    switch (factState) {
      case 'observed':
        return <span className="epistemic-badge observed">● Observed</span>;
      case 'inferred':
        return <span className="epistemic-badge inferred">◈ Inferred</span>;
      case 'unknown':
      default:
        return <span className="epistemic-badge unknown">○ Unknown</span>;
    }
  };

  if (events.length === 0) {
    return (
      <div className="trace-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <p className="font-body-md" style={{ color: 'var(--text-secondary)' }}>
          No timeline events recorded yet. Capture a profile to populate the trajectory.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {groups.map((group, groupIdx) => (
        <div key={groupIdx} style={{ position: 'relative' }}>
          {/* Group Year Header with horizontal divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-subtle)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <span className="font-headline-sm" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {group.yearTitle}
              </span>
            </div>
            <span className="font-label-sm" style={{ color: 'var(--text-muted)' }}>
              {group.subTitle}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Desktop 3-Column Events List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {/* Continuous Vertical Spine line through left date column */}
            <div
              style={{
                position: 'absolute',
                left: '116px',
                top: '12px',
                bottom: '12px',
                width: '1.5px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />

            {group.events.map((ev) => (
              <div
                key={ev.id}
                className="trace-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr minmax(200px, 240px)',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '14px 18px',
                }}
              >
                {/* Column 1: Date on the Left */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', paddingRight: '14px' }}>
                  <span
                    className="font-code-sm"
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  >
                    {ev.startDate || group.yearTitle}
                  </span>
                  <span
                    className="font-label-sm"
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                      marginTop: '2px',
                    }}
                  >
                    {ev.endDate ? `to ${ev.endDate}` : 'Single Anchor'}
                  </span>
                  {/* Small node marker on the spine */}
                  <span
                    style={{
                      position: 'absolute',
                      right: '-7px',
                      top: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-card)',
                      border: '2px solid var(--primary)',
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* Column 2: Event & Content in the Center */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3
                      className="font-headline-sm"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '14px',
                        margin: 0,
                      }}
                    >
                      {ev.title} {ev.organization ? `@ ${ev.organization}` : ''}
                    </h3>
                    {renderBadge(ev.factState)}
                  </div>
                  {ev.description && (
                    <p
                      className="font-body-sm"
                      style={{
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        lineHeight: '1.45',
                      }}
                    >
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Column 3: Evidence & Grounding on the Right */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                    paddingLeft: '14px',
                    borderLeft: '1px solid var(--border-hairline)',
                  }}
                >
                  {ev.evidenceIds.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onInspectEvidence(ev.evidenceIds[0])}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(0, 104, 95, 0.2)',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 104, 95, 0.16)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                        }}
                      >
                        <LinkIcon size={12} />
                        <span>Inspect Evidence ↗</span>
                      </button>
                      <span className="font-code-sm" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Artifact #{ev.evidenceIds[0]}
                      </span>
                    </>
                  ) : (
                    <span className="font-code-sm" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Inferred from context
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
