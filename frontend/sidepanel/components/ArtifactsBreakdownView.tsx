import React, { useState } from 'react';
import { ArtifactCategory } from './MetricBreakdownBar';
import { TraceProfile, EvidenceItem } from '@shared/index';
import { CalendarIcon, TimerIcon, NorthEastIcon, PolicyIcon } from './Icons';

interface ArtifactsBreakdownViewProps {
  profile: TraceProfile;
  evidenceItems?: EvidenceItem[];
  initialCategory?: ArtifactCategory;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ArtifactsBreakdownView: React.FC<ArtifactsBreakdownViewProps> = ({
  profile,
  initialCategory = 'internships',
  onInspectEvidence,
}) => {
  const [activeCategory, setActiveCategory] = useState<ArtifactCategory>(initialCategory);

  // Derive dynamic collections from canonical profile data
  const internshipItems = profile.experiences.filter((e) => {
    const t = e.title.toLowerCase();
    return t.includes('intern') || t.includes('fellow') || t.includes('trainee') || t.includes('co-op');
  });
  // Fallback to all corporate experiences if no explicit internship exists, preserving label transparency
  const displayInternships = internshipItems.length > 0 ? internshipItems : profile.experiences;

  const projectItems = profile.projects || [];
  const hackathonItems = (profile.projects || []).filter((p) => p.isHackathon);
  const openSourceItems = (profile.projects || []).filter((p) => p.isOpenSource);

  const counts = profile.decomposedMetrics || {
    internships: internshipItems.length > 0 ? internshipItems.length : profile.experiences.length,
    projects: projectItems.length,
    hackathons: hackathonItems.length,
    opensource: openSourceItems.length,
  };

  const categories = [
    {
      id: 'internships' as const,
      label: internshipItems.length > 0 ? 'Internships' : 'Corporate Roles',
      count: internshipItems.length > 0 ? internshipItems.length : profile.experiences.length,
    },
    { id: 'projects' as const, label: 'Projects', count: counts.projects },
    { id: 'hackathons' as const, label: 'Hackathons', count: counts.hackathons },
    { id: 'opensource' as const, label: 'Open-Source', count: counts.opensource },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 Dynamic Category Filter Tabs */}
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
                {String(cat.count).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Panel: INTERNSHIPS / CORPORATE ROLES */}
      {activeCategory === 'internships' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: '16px',
          }}
        >
          {displayInternships.length === 0 ? (
            <div
              className="trace-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PolicyIcon size={24} className="text-muted" />
              <h4 className="font-headline-sm" style={{ color: 'var(--text-primary)' }}>
                00 Observed Internship Records
              </h4>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
                No internship or corporate employment records were rendered in this session.
              </p>
            </div>
          ) : (
            displayInternships.map((exp) => (
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

                {exp.description && (
                  <p className="font-body-md" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                    {exp.description}
                  </p>
                )}

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
            ))
          )}
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
          {projectItems.length === 0 ? (
            <div
              className="trace-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PolicyIcon size={24} className="text-muted" />
              <h4 className="font-headline-sm" style={{ color: 'var(--text-primary)' }}>
                00 Observed Project Records
              </h4>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
                No project section elements were rendered in this session. Trace presents only authentic observations.
              </p>
            </div>
          ) : (
            projectItems.map((prj) => (
              <div key={prj.id} className="trace-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{prj.title}</h3>
                    {prj.url && (
                      <a href={prj.url} target="_blank" rel="noopener noreferrer" className="font-code-sm" style={{ color: 'var(--primary)' }}>
                        {prj.url}
                      </a>
                    )}
                  </div>
                  <span className="epistemic-badge observed">● Observed</span>
                </div>
                {prj.description && (
                  <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>
                    {prj.description}
                  </p>
                )}
                {prj.evidenceIds.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(prj.evidenceIds[0])}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <span>Inspect Evidence ↗</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
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
          {hackathonItems.length === 0 ? (
            <div
              className="trace-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PolicyIcon size={24} className="text-muted" />
              <h4 className="font-headline-sm" style={{ color: 'var(--text-primary)' }}>
                00 Observed Hackathon Records
              </h4>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
                No competitive hackathon artifacts were explicitly listed on this profile.
              </p>
            </div>
          ) : (
            hackathonItems.map((h) => (
              <div key={h.id} className="trace-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{h.title}</h3>
                    <span className="font-body-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>Hackathon Artifact</span>
                  </div>
                  <span className="epistemic-badge observed">● Observed</span>
                </div>
                {h.description && (
                  <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {h.description}
                  </p>
                )}
                {h.evidenceIds.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(h.evidenceIds[0])}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <span>Inspect Evidence ↗</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Category Panel: OPEN-SOURCE */}
      {activeCategory === 'opensource' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {openSourceItems.length === 0 ? (
            <div
              className="trace-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PolicyIcon size={24} className="text-muted" />
              <h4 className="font-headline-sm" style={{ color: 'var(--text-primary)' }}>
                00 Observed Open-Source Records
              </h4>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
                No open-source repositories or contributions were linked in this profile's visible DOM.
              </p>
            </div>
          ) : (
            openSourceItems.map((os) => (
              <div key={os.id} className="trace-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{os.title}</h3>
                    {os.url && (
                      <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>{os.url}</span>
                    )}
                  </div>
                  <span className="epistemic-badge observed">● Observed</span>
                </div>
                {os.description && (
                  <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    {os.description}
                  </p>
                )}
                {os.evidenceIds.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(os.evidenceIds[0])}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <span>Inspect Evidence ↗</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
