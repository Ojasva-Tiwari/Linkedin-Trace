import React from 'react';
import { MyPathComparison, TraceProfile, ResearchSet } from '@shared/index';
import { CompassIcon, CheckCircleIcon } from './Icons';

interface MyPathViewProps {
  comparison: MyPathComparison | null;
  userProfile: TraceProfile | null;
  researchSets: ResearchSet[];
  onSelectCohort?: (cohortId: string) => void;
}

export const MyPathView: React.FC<MyPathViewProps> = ({
  comparison,
  userProfile,
  researchSets: _researchSets,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Card */}
      <section
        className="trace-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CompassIcon size={22} />
        </div>
        <div>
          <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', fontSize: 18 }}>
            My Path Trajectory Analysis
          </h2>
          <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
            Compares your verified trajectory against target research cohorts to highlight concrete preparation milestones and skill adjacencies without artificial match percentages.
          </p>
        </div>
      </section>

      {/* Desktop 2-Column Comparison Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(460px, 1.4fr)',
          gap: '24px',
        }}
      >
        {/* Left Column: Personal Trajectory Baseline */}
        <article className="trace-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Personal Trajectory Baseline
            </span>
            <span className="epistemic-badge observed">● Grounded</span>
          </div>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                AS
              </div>
              <div>
                <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {userProfile?.fullName || 'Ashmit Bagga'}
                </h3>
                <span className="font-code-sm" style={{ color: 'var(--primary)', fontSize: '11px' }}>
                  {userProfile?.headline || 'Incoming SDE @ Microsoft'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Undergraduate Cohort:</span>
              <span className="font-code-sm">Batch of 2026</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Algorithmic Baseline:</span>
              <span className="font-code-sm">527 Problems (Rating 1984)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Production Internships:</span>
              <span className="font-code-sm">2 Completed (Flipkart, TechFlow)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>National Accolades:</span>
              <span className="font-code-sm">SIH 1st Prize Winner</span>
            </div>
          </div>
        </article>

        {/* Right Column: Grounded Action Items & Cohort Delta */}
        <article className="trace-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                Benchmark Comparison & Insights
              </h3>
              <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                Target: Tier-1 Campus SDE Cohort (Batch 2026)
              </p>
            </div>
            <span
              className="font-code-sm"
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              Epistemic Confidence: Grounded
            </span>
          </div>

          {/* Qualitative Strengths */}
          <div style={{ marginBottom: '16px' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Demonstrated Capabilities
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(comparison?.qualitativeSummary.strengths || [
                'Production pub/sub streaming & high-throughput Golang telemetry',
                'Advanced competitive algorithmic problem solving (top 3% contest peak)',
                'National hackathon victory proving rapid product execution under pressure',
              ]).map((str, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircleIcon size={14} className="text-primary" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concrete Preparation Gap Items */}
          <div>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Suggested Benchmark Focus Areas
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(comparison?.qualitativeSummary.potentialGaps || [
                'Large-scale distributed database consensus (e.g. Raft/Paxos internals in production)',
                'Formal microservices telemetry tracing (OpenTelemetry / Jaeger integration)',
              ]).map((gap, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--primary)',
                  }}
                >
                  <p className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{gap}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
