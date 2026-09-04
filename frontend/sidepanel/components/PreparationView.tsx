import React from 'react';
import { TraceProfile, CareerJourneySynthesis, FactState, ConcreteActivity, PreparationCategory } from '@shared/index';
import { NorthEastIcon, CalendarIcon, LinkIcon } from './Icons';

interface PreparationViewProps {
  profile: TraceProfile;
  synthesis?: CareerJourneySynthesis | null;
  onInspectEvidence?: (
    evidenceId: string,
    claimContext?: {
      claimText?: string;
      factState?: FactState;
      sourceUrl?: string;
    }
  ) => void;
}

export const PreparationView: React.FC<PreparationViewProps> = ({
  profile,
  synthesis,
  onInspectEvidence,
}) => {
  const hasPrepSynthesis = Boolean(
    synthesis &&
      synthesis.preparation &&
      synthesis.preparation.categories &&
      synthesis.preparation.categories.length > 0
  );

  // Fallback anchors
  const milestoneAnchors = React.useMemo(() => {
    const anchors: Array<{
      stage: string;
      title: string;
      subtitle: string;
      date?: string;
      evidenceId?: string;
      isCurrent?: boolean;
    }> = [];

    profile.education.forEach((edu) => {
      anchors.push({
        stage: 'Academic Foundation',
        title: edu.degree || 'Studies',
        subtitle: edu.schoolName,
        date: edu.dateRange.rawString || edu.dateRange.startDate,
        evidenceId: edu.evidenceIds[0],
      });
    });

    profile.experiences.forEach((exp) => {
      anchors.push({
        stage: exp.dateRange.isCurrent ? 'Current Role' : 'Career Progression',
        title: exp.title,
        subtitle: exp.companyName,
        date: exp.dateRange.rawString || exp.dateRange.startDate,
        evidenceId: exp.evidenceIds[0],
        isCurrent: exp.dateRange.isCurrent,
      });
    });

    return anchors;
  }, [profile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Evidence-Backed Preparation Overview Header */}
      <section className="trace-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-headline-sm" style={{ textTransform: 'uppercase', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
              Evidence-Backed Preparation Analysis
            </span>
            <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
              {hasPrepSynthesis
                ? `${synthesis!.preparation.categories.length} Concrete Activity Domains`
                : `${milestoneAnchors.length} Grounded Anchors`}
            </span>
          </div>
          <span
            className="font-label-sm"
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--primary)',
              fontWeight: 600,
              border: '1px solid var(--border-subtle)',
            }}
          >
            0 Fake Scores · Evidence-Only
          </span>
        </div>

        <p className="font-body-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '800px' }}>
          {hasPrepSynthesis
            ? 'What concrete activities are visible in the evidence? Grounded extraction of problem solving, technical project building, industry roles, and competitions without artificial effort metrics.'
            : 'Concrete milestones visible in the rendered profile. No synthetic scores or fake proficiency ratings.'}
        </p>
      </section>

      {/* Main Preparation Body */}
      {hasPrepSynthesis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {synthesis!.preparation.categories.map((cat: PreparationCategory, cIdx: number) => (
            <article key={cIdx} className="trace-card" style={{ padding: '18px 22px' }}>
              {/* Category Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}
                  >
                    {String(cIdx + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15, margin: 0 }}>
                    {cat.name}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="epistemic-badge observed">
                    ● {cat.totalObservedActivities} Observed Activities
                  </span>
                </div>
              </div>

              {/* What concrete activities are visible in the evidence */}
              <p
                className="font-body-sm"
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '14px',
                  lineHeight: 1.45,
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <strong>Visible in Evidence:</strong> {cat.description}
              </p>

              {/* Concrete Activity Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cat.activities.map((act: ConcreteActivity, aIdx: number) => (
                  <div
                    key={aIdx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      padding: '12px 14px',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600 }}>
                        {act.title}
                      </span>
                      <span className={`epistemic-badge ${act.factState}`}>
                        {act.factState === 'observed' ? '● Observed' : '◈ Inferred'}
                      </span>
                    </div>

                    <p className="font-body-sm" style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                      {act.detail}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        paddingTop: '6px',
                        borderTop: '1px dashed var(--border-hairline)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {act.date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarIcon size={11} className="text-muted" />
                            <span className="font-code-sm" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                              {act.date}
                            </span>
                          </div>
                        )}
                        {act.sourceUrl && (
                          <a
                            href={act.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '10px',
                              backgroundColor: 'var(--bg-card)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <span>Source</span>
                            <NorthEastIcon size={9} />
                          </a>
                        )}
                      </div>

                      {act.evidenceIds && act.evidenceIds.length > 0 && onInspectEvidence && (
                        <button
                          type="button"
                          onClick={() =>
                            onInspectEvidence(act.evidenceIds[0], {
                              claimText: `${act.title}: ${act.detail}`,
                              factState: act.factState,
                              sourceUrl: act.sourceUrl,
                            })
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <LinkIcon size={11} />
                          <span>Inspect Evidence ↗</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Fallback: Standard Roles & Academic Institutions */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '20px',
          }}
        >
          <article className="trace-card" style={{ padding: '18px 20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '14px',
              }}
            >
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                Professional Trajectory & Roles
              </h2>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
                {profile.experiences.length} Observed Positions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                      {exp.title} — {exp.companyName}
                    </span>
                    <span className="epistemic-badge observed">● Observed</span>
                  </div>
                  {exp.dateRange.rawString && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <CalendarIcon size={11} className="text-secondary" />
                      <span className="font-code-sm" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {exp.dateRange.rawString}
                      </span>
                    </div>
                  )}
                  {exp.description && (
                    <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.evidenceIds[0] && onInspectEvidence && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onInspectEvidence(exp.evidenceIds[0])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>Inspect Evidence ↗</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="trace-card" style={{ padding: '18px 20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '14px',
              }}
            >
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                Academic & Educational Anchor
              </h2>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
                {profile.education.length} Institutions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                      {edu.schoolName}
                    </span>
                    <span className="epistemic-badge observed">● Observed</span>
                  </div>
                  {edu.degree && (
                    <span className="font-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      {edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                    </span>
                  )}
                  {edu.evidenceIds[0] && onInspectEvidence && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onInspectEvidence(edu.evidenceIds[0])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>Inspect Evidence ↗</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
