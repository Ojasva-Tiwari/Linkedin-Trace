import React from 'react';
import { FactState, TimelineEvent, CareerJourneySynthesis, SynthesizedMilestone } from '@shared/index';
import { SynthesisStatus } from '../hooks/useAutoProfileAnalysis';
import { LinkIcon, NorthEastIcon, PolicyIcon } from './Icons';

interface TimelineYearGroup {
  yearTitle: string;
  subTitle?: string;
  events: TimelineEvent[];
}

interface TimelineViewProps {
  events: TimelineEvent[];
  synthesis?: CareerJourneySynthesis | null;
  synthesisStatus?: SynthesisStatus;
  onResynthesize?: () => void;
  onInspectEvidence: (
    evidenceId: string,
    claimContext?: {
      claimText?: string;
      factState?: FactState;
      sourceUrl?: string;
    }
  ) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  synthesis,
  synthesisStatus = 'idle',
  onResynthesize,
  onInspectEvidence,
}) => {
  // Raw event year groups fallback
  const fallbackGroups: TimelineYearGroup[] = React.useMemo(() => {
    if (events.length === 0) return [];

    const map = new Map<string, TimelineEvent[]>();
    events.forEach((ev) => {
      const yearMatch = (ev.startDate || ev.endDate || '').match(/\b(19\d\d|20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : (ev.startDate || 'Milestones');
      const existing = map.get(year) || [];
      existing.push(ev);
      map.set(year, existing);
    });

    const result: TimelineYearGroup[] = [];
    map.forEach((evList, year) => {
      const categories = Array.from(new Set(evList.map((e) => e.category)));
      const desc =
        categories.length === 1
          ? categories[0] === 'career'
            ? 'Professional Experience'
            : categories[0] === 'education'
            ? 'Academic Program'
            : 'Milestones & Artifacts'
          : 'Career & Academic Milestones';

      result.push({
        yearTitle: year,
        subTitle: desc,
        events: evList,
      });
    });

    return result.length > 0
      ? result
      : [
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

  const hasSynthesis = Boolean(
    synthesis && synthesis.yearByYear && synthesis.yearByYear.length > 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Synthesis Status Notification Banner */}
      {synthesisStatus === 'unavailable' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
            <PolicyIcon size={16} />
            <span>
              <strong>Evidence collected — synthesis unavailable.</strong> Showing grounded observed timeline.
            </span>
          </div>
          {onResynthesize && (
            <button
              type="button"
              onClick={onResynthesize}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Retry Synthesis
            </button>
          )}
        </div>
      )}

      {synthesisStatus === 'synthesizing' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            backgroundColor: 'rgba(99, 102, 241, 0.06)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '12px',
            color: '#4f46e5',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              animation: 'pulse 1.2s infinite',
            }}
          />
          <span>Synthesizing chronological career progression from collected evidence...</span>
        </div>
      )}

      {/* Synthesis Mode: Year-by-Year Career Journey */}
      {hasSynthesis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {synthesis!.yearByYear.map((group, groupIdx) => (
            <div key={groupIdx} style={{ position: 'relative' }}>
              {/* Year Header */}
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
                    padding: '4px 14px',
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
                  <span className="font-headline-sm" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13.5 }}>
                    {group.periodLabel || group.year}
                  </span>
                </div>

                <span className="font-label-sm" style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                  {group.milestones.length} Milestones
                </span>

                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              {/* Chronology Gap Representation if present */}
              {group.hasChronologyGap && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    marginBottom: '12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>[CHRONOLOGY GAP]:</span>
                  <span>{group.gapNote || 'Public evidence is incomplete for this interval.'}</span>
                </div>
              )}

              {/* Milestones in this Year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                <div
                  className="trace-timeline-spine"
                  style={{
                    position: 'absolute',
                    left: '116px',
                    top: '12px',
                    bottom: '12px',
                    width: '1.5px',
                    backgroundColor: 'var(--border-subtle)',
                  }}
                />

                {group.milestones.map((m: SynthesizedMilestone) => (
                  <div
                    key={m.id}
                    className="trace-card trace-timeline-event-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr minmax(200px, 250px)',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '14px 18px',
                    }}
                  >
                    {/* Column 1: Grounded Date or Period */}
                    <div
                      className="trace-timeline-date-col"
                      style={{ position: 'relative', display: 'flex', flexDirection: 'column', paddingRight: '14px' }}
                    >
                      <span
                        className="font-code-sm"
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                        }}
                      >
                        {m.dateOrPeriod || m.year || group.year}
                      </span>
                      <span
                        className="font-label-sm"
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '10px',
                          marginTop: '2px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {m.category.replace(/_/g, ' ')}
                      </span>
                      <span
                        className="trace-timeline-date-node"
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

                    {/* Column 2: Grounded Milestone Title & Explanation */}
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
                          {m.title}
                        </h3>
                        {renderBadge(m.factState)}
                      </div>

                      <p
                        className="font-body-sm"
                        style={{
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                          lineHeight: '1.45',
                        }}
                      >
                        {m.explanation}
                      </p>

                      {/* Source links if any */}
                      {m.sourceLinks && m.sourceLinks.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {m.sourceLinks.map((url, uIdx) => (
                            <a
                              key={uIdx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10.5px',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                backgroundColor: 'var(--bg-subtle)',
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <span>External Source</span>
                              <NorthEastIcon size={10} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Grounded Evidence Citation */}
                    <div
                      className="trace-timeline-evidence-col"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '6px',
                        paddingLeft: '14px',
                        borderLeft: '1px solid var(--border-hairline)',
                      }}
                    >
                      {m.evidenceIds.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onInspectEvidence(m.evidenceIds[0], {
                                claimText: `${m.title}: ${m.explanation}`,
                                factState: m.factState,
                                sourceUrl: m.sourceLinks?.[0],
                              })
                            }
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
                            {m.evidenceIds.length} Grounded Citations
                          </span>
                        </>
                      ) : (
                        <span className="font-code-sm" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Inferred from multiple records
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback to raw observed timeline events */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {fallbackGroups.length === 0 ? (
            <div className="trace-card" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No timeline events recorded yet. Open a LinkedIn profile to automatically populate the trajectory.
            </div>
          ) : (
            fallbackGroups.map((group, groupIdx) => (
              <div key={groupIdx} style={{ position: 'relative' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <div
                    className="trace-timeline-spine"
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
                      className="trace-card trace-timeline-event-card"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr minmax(200px, 240px)',
                        gap: '20px',
                        alignItems: 'center',
                        padding: '14px 18px',
                      }}
                    >
                      <div
                        className="trace-timeline-date-col"
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', paddingRight: '14px' }}
                      >
                        <span className="font-code-sm" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
                          {ev.startDate || group.yearTitle}
                        </span>
                        <span className="font-label-sm" style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                          {ev.endDate ? `to ${ev.endDate}` : 'Single Anchor'}
                        </span>
                        <span
                          className="trace-timeline-date-node"
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

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                            {ev.title} {ev.organization ? `@ ${ev.organization}` : ''}
                          </h3>
                          {renderBadge(ev.factState)}
                        </div>
                        {ev.description && (
                          <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.45' }}>
                            {ev.description}
                          </p>
                        )}
                      </div>

                      <div
                        className="trace-timeline-evidence-col"
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
            ))
          )}
        </div>
      )}
    </div>
  );
};
