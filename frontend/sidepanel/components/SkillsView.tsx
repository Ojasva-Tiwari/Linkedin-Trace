import React from 'react';
import { TraceSkill, EvidenceItem } from '@shared/index';
import { TreeIcon, TerminalIcon, NorthEastIcon } from './Icons';

interface SkillsViewProps {
  skills: TraceSkill[];
  evidenceItems: EvidenceItem[];
  onInspectEvidence: (evidenceId: string) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  evidenceItems,
  onInspectEvidence,
}) => {
  const observedCount = skills.filter((s) => s.factState === 'observed').length;
  const inferredCount = skills.filter((s) => s.factState === 'inferred').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Epistemic Methodology Callout & Status Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '16px',
          alignItems: 'center',
        }}
      >
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
              <TreeIcon size={15} />
            </div>
            <div>
              <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>
                Epistemic Skill Architecture
              </span>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                Skills in TRACE represent evidence-backed chronological progression, not arbitrary 0–100 scores or subjective proficiency bars.
              </p>
            </div>
          </div>
        </section>

        {/* Status Box */}
        <div
          className="trace-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
          }}
        >
          <div>
            <div className="font-label-sm" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Grounding Status
            </div>
            <div className="font-headline-sm" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {evidenceItems.length > 0 ? `${evidenceItems.length} Linked Artifacts` : `${skills.length} Capabilities`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="epistemic-badge observed">● {observedCount} Observed</span>
            <span className="epistemic-badge inferred">◈ {inferredCount} Inferred</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Desktop Skill Progression Tracks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Track 1: DSA */}
        <article className="trace-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TerminalIcon size={18} />
              </div>
              <div>
                <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                  Data Structures & Algorithms
                </h2>
                <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>
                  LeetCode · Codeforces · Problem Solving
                </span>
              </div>
            </div>
            <span
              className="font-code-sm"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              2022 – Present
            </span>
          </div>

          {/* Chronological Milestone Spine */}
          <div style={{ position: 'relative', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
            <div
              style={{
                position: 'absolute',
                left: '7px',
                top: '6px',
                bottom: '6px',
                width: '1.5px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />

            {/* Node 1 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  top: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid var(--border-strong)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  1st Year · Nov 2022
                </span>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                C++ fundamentals & recursive algorithm implementations
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <span className="font-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Initial algorithmic practice solutions repository
                </span>
                {evidenceItems[0] && (
                  <button
                    type="button"
                    onClick={() => onInspectEvidence(evidenceItems[0].id)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                  >
                    <NorthEastIcon size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Node 2 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  top: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 0 0 2px var(--bg-card)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  2nd Year · Mar 2024
                </span>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                200+ LeetCode Milestone (Arrays, Trees, Dynamic Programming)
              </p>
              <span className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>
                Systematic medium-difficulty problem solving verification
              </span>
            </div>

            {/* Node 3 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  top: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 0 0 2px var(--bg-card)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  3rd Year · Aug 2025
                </span>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                527 LeetCode Problems Solved & Weekly Contest Rank Peak
              </p>
            </div>
          </div>
        </article>

        {/* Track 2: Backend & Distributed Systems */}
        <article className="trace-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TreeIcon size={18} />
              </div>
              <div>
                <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                  Backend & Distributed Systems
                </h2>
                <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>
                  Golang · Java · Kafka · Microservices
                </span>
              </div>
            </div>
            <span
              className="font-code-sm"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              2023 – Present
            </span>
          </div>

          <div style={{ position: 'relative', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
            <div
              style={{
                position: 'absolute',
                left: '7px',
                top: '6px',
                bottom: '6px',
                width: '1.5px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  top: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Flipkart SDE Intern · Summer 2025
                </span>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                Kafka Consumer Group Optimization (p99 Lag Reduced 34%)
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-18px',
                  top: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #f59e0b',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Final Year · Fall 2025
                </span>
                <span className="epistemic-badge inferred">◈ Inferred</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                Enterprise System Architecture & Microservices Scale Readiness
              </p>
              <span className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>
                Synthesized from high-throughput reverse proxy project & Flipkart distributed pub/sub experience
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
