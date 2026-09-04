import React from 'react';
import { TraceProfile, EvidenceItem, CareerJourneySynthesis, FactState } from '@shared/index';
import { TreeIcon, NorthEastIcon, LinkIcon } from './Icons';

interface SummaryViewProps {
  profile: TraceProfile;
  synthesis?: CareerJourneySynthesis | null;
  evidenceItems: EvidenceItem[];
  onInspectEvidence?: (
    evidenceId: string,
    claimContext?: {
      claimText?: string;
      factState?: FactState;
      sourceUrl?: string;
    }
  ) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  profile,
  synthesis,
  evidenceItems,
  onInspectEvidence,
}) => {
  const hasEpistemicSynthesis = Boolean(synthesis && synthesis.epistemicSummary);

  const observedCount = hasEpistemicSynthesis
    ? synthesis!.epistemicSummary.observed.length
    : evidenceItems.filter((e) => e.factState === 'observed').length;

  const inferredCount = hasEpistemicSynthesis
    ? synthesis!.epistemicSummary.inferred.length
    : evidenceItems.filter((e) => e.factState === 'inferred').length;

  const unknownCount = hasEpistemicSynthesis
    ? synthesis!.epistemicSummary.unknown.length
    : 0;

  const coverageEntries = Object.entries(
    profile.sectionCoverage || {
      about: profile.aboutSummary ? 'observed' : 'not_rendered',
      experience: profile.experiences.length > 0 ? 'observed' : 'not_rendered',
      education: profile.education.length > 0 ? 'observed' : 'not_rendered',
      skills: profile.skills.length > 0 ? 'observed' : 'not_rendered',
      certifications: profile.certifications.length > 0 ? 'observed' : 'not_rendered',
      projects: (profile.projects?.length ?? 0) > 0 ? 'observed' : 'not_rendered',
      awards: (profile.awards?.length ?? 0) > 0 ? 'observed' : 'not_rendered',
      languages: (profile.languages?.length ?? 0) > 0 ? 'observed' : 'not_rendered',
    }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 3-Tier Epistemic Synthesis Methodology Header */}
      <div
        className="trace-card trace-summary-header"
        style={{
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TreeIcon size={18} className="text-primary" />
          <div>
            <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
              3-Tier Epistemic Career Grounding
            </span>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 1 }}>
              Strict demarcation between directly observed facts, multi-record inferences, and unknown boundaries.
            </p>
          </div>
        </div>
        <span
          className="font-code-sm"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {observedCount} Observed · {inferredCount} Inferred · {unknownCount} Unknown
        </span>
      </div>

      {/* Main 3 Conceptual Sections */}
      {hasEpistemicSynthesis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* SECTION 1: OBSERVED */}
          <article
            className="trace-card"
            style={{
              position: 'relative',
              borderLeft: '4px solid var(--primary)',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>●</span>
                <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16, margin: 0 }}>
                  OBSERVED — Directly Supported Facts
                </h2>
              </div>
              <span className="epistemic-badge observed">● {synthesis!.epistemicSummary.observed.length} Grounded</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
              Concrete factual statements derived with direct, 1-to-1 grounding from legitimate LinkedIn profile records and discovered external sources.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {synthesis!.epistemicSummary.observed.map((claim, idx) => (
                <div
                  key={claim.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>●</span>
                    <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{claim.statement}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {claim.sources?.[0] && (
                      <a
                        href={claim.sources[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        <span>Source</span>
                        <NorthEastIcon size={10} />
                      </a>
                    )}
                    {claim.evidenceIds?.[0] && onInspectEvidence && (
                      <button
                        type="button"
                        onClick={() =>
                          onInspectEvidence(claim.evidenceIds[0], {
                            claimText: claim.statement,
                            factState: 'observed',
                            sourceUrl: claim.sources?.[0],
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
                          gap: '2px',
                        }}
                      >
                        <LinkIcon size={10} />
                        <span>Cite ↗</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* SECTION 2: INFERRED */}
          <article
            className="trace-card"
            style={{
              position: 'relative',
              borderLeft: '4px solid #f59e0b',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>◈</span>
                <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16, margin: 0 }}>
                  INFERRED — Reasonable Emergent Patterns
                </h2>
              </div>
              <span className="epistemic-badge inferred">◈ {synthesis!.epistemicSummary.inferred.length} Patterns</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
              Interpretations synthesized from multiple corroborating records. These are reasonable qualitative trajectory patterns, not single direct DOM observations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {synthesis!.epistemicSummary.inferred.map((claim, idx) => (
                <div
                  key={claim.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>◈</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{claim.statement}</span>
                    </div>

                    {claim.evidenceIds?.[0] && onInspectEvidence && (
                      <button
                        type="button"
                        onClick={() =>
                          onInspectEvidence(claim.evidenceIds[0], {
                            claimText: claim.statement,
                            factState: 'inferred',
                          })
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d97706',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          flexShrink: 0,
                        }}
                      >
                        <LinkIcon size={10} />
                        <span>Inspect Grounding ↗</span>
                      </button>
                    )}
                  </div>

                  {claim.rationale && (
                    <span className="font-body-sm" style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '16px' }}>
                      <strong>Evidence rationale:</strong> {claim.rationale}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* SECTION 3: UNKNOWN & CAUSALITY DISCLAIMERS */}
          <article
            className="trace-card"
            style={{
              position: 'relative',
              borderLeft: '4px solid var(--text-muted)',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>○</span>
                <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16, margin: 0 }}>
                  UNKNOWN — Boundaries Not Established by Evidence
                </h2>
              </div>
              <span className="epistemic-badge unknown">○ {synthesis!.epistemicSummary.unknown.length} Unknowns</span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
              Attributes, metrics, and relationships that cannot be truthfully established from public session evidence. TRACE explicitly notes these gaps rather than fabricating plausible answers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {synthesis!.epistemicSummary.unknown.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    padding: '6px 10px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>○</span>
                  <span><strong>{item.gap}:</strong> {item.whyUnknown}</span>
                </div>
              ))}
            </div>

            {/* Strict Non-Causal Disclaimers */}
            {synthesis!.causalityNotes &&
              synthesis!.causalityNotes.length > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(0, 104, 95, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0, 104, 95, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span
                    className="font-label-sm"
                    style={{
                      textTransform: 'uppercase',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '10.5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Non-Causal Relationship Principle:
                  </span>
                  {synthesis!.causalityNotes.map((disc, dIdx) => (
                    <p key={dIdx} className="font-body-sm" style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '11.5px', lineHeight: 1.4 }}>
                      {disc}
                    </p>
                  ))}
                </div>
              )}
          </article>
        </div>
      ) : (
        /* Fallback: Direct observed evidence items list & section coverage */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <article
            className="trace-card"
            style={{
              position: 'relative',
              borderLeft: '4px solid var(--primary)',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                Observed Facts ({evidenceItems.length} Citations)
              </h2>
              <span className="epistemic-badge observed">● {observedCount} Grounded</span>
            </div>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Concrete attributes extracted directly from {profile.fullName}'s legitimately rendered LinkedIn profile session.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evidenceItems.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>●</span>
                    <span
                      style={{
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.rawText.slice(0, 90)}
                    </span>
                  </div>
                  {onInspectEvidence && (
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(ev.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        flexShrink: 0,
                      }}
                    >
                      <span>Cite ↗</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article
            className="trace-card"
            style={{
              borderLeft: '4px solid var(--text-muted)',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                Rendered vs Unrendered Section Semantics
              </h2>
              <span className="epistemic-badge unknown">○ Legitimate Missing Semantics</span>
            </div>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              TRACE treats missing sections as legitimate non-observations. It does NOT convert absent sections into fake "unknown" facts.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
              }}
            >
              {coverageEntries.map(([section, status]) => (
                <div
                  key={section}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: status === 'observed' ? 'var(--primary-light)' : 'var(--bg-subtle)',
                    border: status === 'observed' ? '1px solid rgba(0, 104, 95, 0.2)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: status === 'observed' ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {section}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: status === 'observed' ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    {status === 'observed' ? 'OBSERVED' : 'NOT RENDERED'}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
