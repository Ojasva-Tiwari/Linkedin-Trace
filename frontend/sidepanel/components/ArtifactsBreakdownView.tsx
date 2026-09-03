import React, { useState } from 'react';
import { ArtifactCategory } from './MetricBreakdownBar';
import { TraceProfile, EvidenceItem } from '@shared/index';
import { CalendarIcon, TimerIcon, NorthEastIcon } from './Icons';

interface ArtifactsBreakdownViewProps {
  profile: TraceProfile;
  evidenceItems: EvidenceItem[];
  initialCategory?: ArtifactCategory;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ArtifactsBreakdownView: React.FC<ArtifactsBreakdownViewProps> = ({
  profile,
  evidenceItems,
  initialCategory = 'internships',
  onInspectEvidence,
}) => {
  const [activeCategory, setActiveCategory] = useState<ArtifactCategory>(initialCategory);

  const categories = [
    { id: 'internships' as const, label: 'Internships', count: profile.experiences.length },
    { id: 'projects' as const, label: 'Projects', count: 4 },
    { id: 'hackathons' as const, label: 'Hackathons', count: 3 },
    { id: 'opensource' as const, label: 'Open-Source', count: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flex: 1,
                padding: '8px 16px',
                textAlign: 'center',
                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.04)' : 'none',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{cat.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-container)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Panel: INTERNSHIPS */}
      {activeCategory === 'internships' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: '16px',
          }}
        >
          {profile.experiences.map((exp) => (
            <div key={exp.id} className="trace-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                    {exp.title} — {exp.companyName}
                  </h3>
                  {exp.location && (
                    <span className="font-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      {exp.location}
                    </span>
                  )}
                </div>
                <span className={`epistemic-badge ${exp.factState}`}>
                  {exp.factState === 'observed' ? '● Observed' : '◈ Inferred'}
                </span>
              </div>

              {/* Tenure & Duration Data Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  margin: '8px 0',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CalendarIcon size={13} className="text-secondary" />
                  <span className="font-code-sm" style={{ color: 'var(--text-primary)', fontSize: 11 }}>
                    {exp.dateRange.rawString || `${exp.dateRange.startDate || ''} – ${exp.dateRange.endDate || 'Present'}`}
                  </span>
                </div>
                <span style={{ color: 'var(--border-strong)', fontSize: '10px' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <TimerIcon size={13} className="text-secondary" />
                  <span className="font-code-sm" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    {exp.dateRange.isCurrent ? 'Ongoing' : 'Completed'}
                  </span>
                </div>
              </div>

              {/* Verifiable Details & Responsibilities */}
              {exp.description && (
                <p className="font-body-md" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                  {exp.description}
                </p>
              )}

              {/* Primary Evidence Anchor */}
              {exp.evidenceIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>
                    Primary Source Record:
                  </span>
                  <button
                    type="button"
                    onClick={() => onInspectEvidence(exp.evidenceIds[0])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <span>Inspect evidence record</span>
                    <NorthEastIcon size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Panel: PROJECTS */}
      {activeCategory === 'projects' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { id: 'prj-1', title: 'High-Throughput Golang Telemetry Proxy', role: 'Systems & Networking', desc: 'Reverse proxy service handling async batching and telemetry export with gRPC streaming.', evId: 'ev-prj-1' },
            { id: 'prj-2', title: 'Distributed Key-Value In-Memory Store', role: 'Database Internals', desc: 'Custom LSM-tree storage engine with Raft consensus implementation in Rust.', evId: 'ev-prj-2' },
            { id: 'prj-3', title: 'TRACE Engine Browser Prototype', role: 'Chrome MV3 & React', desc: 'Local-first trajectory analyzer extension with IndexedDB persistence.', evId: 'ev-prj-3' },
            { id: 'prj-4', title: 'Algorithmic Visualizer & Playground', role: 'Web Platform', desc: 'Interactive Canvas-based tree, graph, and trie traversal animator.', evId: 'ev-prj-4' },
          ].map((prj) => (
            <div key={prj.id} className="trace-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{prj.title}</h3>
                  <span className="font-body-sm" style={{ color: 'var(--text-secondary)' }}>{prj.role}</span>
                </div>
                <span className="epistemic-badge observed">● Observed</span>
              </div>
              <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>{prj.desc}</p>
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => onInspectEvidence(evidenceItems[0]?.id || prj.evId)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <span>Repository Artifact ↗</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Panel: HACKATHONS */}
      {activeCategory === 'hackathons' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { id: 'hack-1', title: 'Smart India Hackathon (SIH)', result: 'National Winner — 1st Place', org: 'Ministry of Education', year: '2024' },
            { id: 'hack-2', title: 'HackIIT Campus Build', result: 'Best Systems Architecture', org: 'IIT Tech Society', year: '2023' },
            { id: 'hack-3', title: 'ETHIndia Web3 Track', result: 'Top Finalist', org: 'Devfolio', year: '2023' },
          ].map((h) => (
            <div key={h.id} className="trace-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{h.title}</h3>
                  <span className="font-body-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>{h.result}</span>
                </div>
                <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>{h.year}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Organizer: {h.org}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Panel: OPEN-SOURCE */}
      {activeCategory === 'opensource' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="trace-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>Kafka Go Client Ecosystem</h3>
                <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>github.com/confluentinc/confluent-kafka-go</span>
              </div>
              <span className="epistemic-badge observed">● Observed</span>
            </div>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Merged upstream PR optimizing consumer partition assignment batch sizes and documenting telemetry handlers.
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <span className="font-code-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>PR #418 · Merged</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
