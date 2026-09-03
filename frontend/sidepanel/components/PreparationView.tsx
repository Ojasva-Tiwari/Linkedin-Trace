import React from 'react';
import { TerminalIcon, NorthEastIcon } from './Icons';

interface PreparationViewProps {
  onInspectEvidence?: (evidenceId: string) => void;
}

export const PreparationView: React.FC<PreparationViewProps> = ({
  onInspectEvidence,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Evidence-Backed Preparation Overview (NO fake effort sparkline) */}
      <section className="trace-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-headline-sm" style={{ textTransform: 'uppercase', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
              Preparation Milestones
            </span>
            <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>2022–2026 Trajectory</span>
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
            3 Observed Milestones · 1 Inferred · 0 Fake Scores
          </span>
        </div>

        {/* Concrete Trajectory Stage Anchors (Desktop Wide Row) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '14px 8px 4px 8px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>Y1 (2022)</span>
            <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>Foundations</span>
            <span className="font-code-sm" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>C++ & Core CS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>Y2 (2023)</span>
            <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>Startup Prep</span>
            <span className="font-code-sm" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>TechFlow Intern</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>Y3 (2024)</span>
            <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>Flipkart Intern</span>
            <span className="font-code-sm" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Kafka & Scale</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 104, 95, 0.2)' }}>
            <span className="font-label-sm" style={{ color: 'var(--primary)' }}>Y4 (2025)</span>
            <span className="font-headline-sm" style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>Microsoft SDE</span>
            <span className="font-code-sm" style={{ fontSize: 10, color: 'var(--primary)', marginTop: 2 }}>Accepted Offer</span>
          </div>
        </div>
      </section>

      {/* 2-Column Desktop Grid: Coding & Systems */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Pillar 1: Coding & Algorithmic Problem Solving */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-container-high)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                01
              </span>
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                Coding & Problem Solving
              </h2>
            </div>
            <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
              Nov 2022 → Oct 2025
            </span>
          </div>

          {/* Platform Identity Card (LeetCode) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TerminalIcon size={16} className="text-secondary" />
              <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>LeetCode</span>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>@ashmit_b</span>
            </div>
            <span className="epistemic-badge observed">● Observed</span>
          </div>

          {/* Concrete Platform Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="font-label-sm" style={{ color: 'var(--text-secondary)', display: 'block' }}>Peak Contest Rating</span>
              <span className="font-headline-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>1,984</span>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="font-label-sm" style={{ color: 'var(--text-secondary)', display: 'block' }}>Weekly Contests</span>
              <span className="font-headline-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>26 Recorded</span>
            </div>
          </div>

          {/* Dated Concrete Milestone Observations */}
          <div style={{ position: 'relative', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                position: 'absolute',
                left: '6px',
                top: '4px',
                bottom: '4px',
                width: '1.5px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />

            {/* Milestone 1 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-16px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #f59e0b',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Baseline: 50 Problems Solved</p>
                <span className="epistemic-badge inferred">◈ Inferred</span>
              </div>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>Late 2022</span>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Initial recursion, binary search, and basic sorting bootstrap during early coursework.
              </p>
            </div>

            {/* Milestone 2 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-16px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>200 Problems Milestone</p>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>Mar 2024</span>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Systematic mastery of medium-level trees, dynamic programming, and graphs.
              </p>
            </div>

            {/* Milestone 3 */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-16px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>527 Problems & 45-Day Continuous Streak</p>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>Aug 2025</span>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Easy (190), Medium (280), Hard (57) confirmed through authenticated profile trace.
              </p>
              {onInspectEvidence && (
                <div style={{ marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => onInspectEvidence('ev-leetcode-527')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: 0,
                      fontWeight: 500,
                    }}
                  >
                    <span>Inspect evidence snippet</span>
                    <NorthEastIcon size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Pillar 2: Systems & Production Architecture */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-container-high)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                02
              </span>
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                Systems & Production Architecture
              </h2>
            </div>
            <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
              Summer – Fall 2025
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Flipkart Backend Internship (Kafka Telemetry)
                </span>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                Applied production experience: Golang service proxy and pub/sub cluster re-balancing optimization reducing p99 processing lag by 34%.
              </p>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Private System Design & Mock Interviews
                </span>
                <span className="epistemic-badge unknown">○ Unknown</span>
              </div>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.45 }}>
                Private offline study, mock interview hours, and internal referrals are outside observational scope and not documented in public records.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
