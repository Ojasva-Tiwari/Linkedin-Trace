import React from 'react';
import { TraceSkill, EvidenceItem, CareerJourneySynthesis, FactState, SkillSynthesisGroup } from '@shared/index';
import { TreeIcon, NorthEastIcon, PolicyIcon, LinkIcon } from './Icons';

interface SkillsViewProps {
  skills: TraceSkill[];
  synthesis?: CareerJourneySynthesis | null;
  evidenceItems?: EvidenceItem[];
  onInspectEvidence: (
    evidenceId: string,
    claimContext?: {
      claimText?: string;
      factState?: FactState;
      sourceUrl?: string;
    }
  ) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  synthesis,
  onInspectEvidence,
}) => {
  const hasSkillSynthesis = Boolean(
    synthesis && synthesis.skills && synthesis.skills.length > 0
  );

  const observedCount = hasSkillSynthesis
    ? synthesis!.skills.filter((s) => s.factState === 'observed').length
    : skills.filter((s) => s.factState === 'observed').length;

  const inferredCount = hasSkillSynthesis
    ? synthesis!.skills.filter((s) => s.factState === 'inferred').length
    : skills.filter((s) => s.factState === 'inferred').length;

  // Group synthesized skills by category/domain
  const categorizedSkillGroups = React.useMemo(() => {
    if (!hasSkillSynthesis) return [];
    const map = new Map<string, SkillSynthesisGroup[]>();

    synthesis!.skills.forEach((sk) => {
      const cat = sk.category || 'Core Capabilities & Tools';
      const list = map.get(cat) || [];
      list.push(sk);
      map.set(cat, list);
    });

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [hasSkillSynthesis, synthesis]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Epistemic Methodology Callout & Status Bar */}
      <div className="trace-skills-header-grid">
        <section
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <TreeIcon size={14} />
            </div>
            <div>
              <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                Grounded Skill Synthesis Architecture
              </h3>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                TRACE strictly rejects arbitrary 0–100% proficiency scores. Every skill is grouped by domain
                and grounded in direct DOM evidence citations, public code repositories, or demonstrable role responsibilities.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="font-headline-lg" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18 }}>
              {String(observedCount).padStart(2, '0')}
            </div>
            <div className="font-label-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              ● Observed
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="font-headline-lg" style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>
              {String(inferredCount).padStart(2, '0')}
            </div>
            <div className="font-label-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              ◈ Inferred
            </div>
          </div>
        </section>
      </div>

      {/* Main Skills Content */}
      {hasSkillSynthesis ? (
        /* Synthesized Skill Domains */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categorizedSkillGroups.map((group, gIdx) => (
            <section key={gIdx} className="trace-card" style={{ padding: '18px 22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                    }}
                  />
                  <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15, margin: 0 }}>
                    {group.category}
                  </h3>
                </div>
                <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
                  {group.items.length} Capabilities
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '12px',
                }}
              >
                {group.items.map((skill: SkillSynthesisGroup, sIdx: number) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px 14px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="font-headline-sm" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                        {skill.skillName}
                      </span>
                      <span className={`epistemic-badge ${skill.factState}`}>
                        {skill.factState === 'observed' ? '● Observed' : '◈ Inferred'}
                      </span>
                    </div>

                    {/* Demonstrated contexts */}
                    {skill.demonstratedContexts && skill.demonstratedContexts.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="font-label-sm" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Demonstrated In:
                        </span>
                        {skill.demonstratedContexts.map((ctx: string, cIdx: number) => (
                          <div
                            key={cIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '5px',
                              fontSize: '11.5px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span style={{ color: 'var(--primary)', fontSize: '9px' }}>–</span>
                            <span>{ctx}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Supporting sources & evidence inspection */}
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
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {skill.supportingSources?.map((src: string, srcIdx: number) => (
                          <span
                            key={srcIdx}
                            className="font-code-sm"
                            style={{
                              fontSize: '9.5px',
                              backgroundColor: 'var(--bg-card)',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {src}
                          </span>
                        ))}
                      </div>

                      {skill.supportingEvidenceIds && skill.supportingEvidenceIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onInspectEvidence(skill.supportingEvidenceIds[0], {
                              claimText: `${skill.skillName} (${skill.factState})`,
                              factState: skill.factState,
                              sourceUrl: skill.supportingSources?.[0],
                            })
                          }
                          title="Inspect supporting evidence"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          <LinkIcon size={11} />
                          <span>Inspect ↗</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : skills.length === 0 ? (
        /* Empty State */
        <section
          className="trace-card"
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <PolicyIcon size={28} className="text-muted" />
          <h3 className="font-headline-md" style={{ color: 'var(--text-primary)' }}>
            00 Observed Skills Rendered
          </h3>
          <p className="font-body-sm" style={{ color: 'var(--text-secondary)', maxWidth: '460px' }}>
            No explicit skills section elements were present in the active page's rendered DOM.
            Trace adheres to strict epistemic rigor and never fabricates unobserved skill claims.
          </p>
        </section>
      ) : (
        /* Fallback: Raw observed skills grid */
        <section className="trace-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                Observed Professional Capabilities
              </h3>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Extracted directly from legitimate session DOM text. Every capability links to its immutable evidence anchor.
              </p>
            </div>
            <span className="epistemic-badge observed">● {skills.length} Observed</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
            }}
          >
            {skills.map((skill) => (
              <div
                key={skill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ color: 'var(--primary)', fontSize: '10px' }}>●</span>
                  <span
                    className="font-body-md"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {skill.name}
                  </span>
                </div>

                {skill.evidenceIds?.[0] && (
                  <button
                    type="button"
                    onClick={() => onInspectEvidence(skill.evidenceIds[0])}
                    title="Inspect evidence grounding"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    <span>Inspect</span>
                    <NorthEastIcon size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
