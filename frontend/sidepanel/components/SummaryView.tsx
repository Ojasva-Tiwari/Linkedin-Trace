import React from 'react';
import { TreeIcon, LinkIcon } from './Icons';

interface SummaryViewProps {
  onInspectEvidence?: (evidenceId: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  onInspectEvidence,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 3-Tier Epistemic Synthesis Methodology Banner */}
      <div
        className="trace-card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TreeIcon size={18} className="text-primary" />
          <div>
            <span className="font-headline-sm" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
              3-Tier Epistemic Synthesis
            </span>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 1 }}>
              Strict demarcation between observed traces, synthesized inferences, and unobserved variables.
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
          8 Observed · 2 Inferred · 3 Unknown
        </span>
      </div>

      {/* Card 1: Observed Facts (Wide Hero Card) */}
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
            Observed Facts
          </h2>
          <span className="epistemic-badge observed">
            ● Observed · Verifiable Traces
          </span>
        </div>

        <p className="font-body-lg" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
          Candidate began programming during first undergraduate year (Oct 2022), practiced algorithmic problem solving with 527 authenticated LeetCode submissions by Year 3, built four public systems projects, won the Smart India Hackathon, completed two consecutive software engineering internships (TechFlow in Y2, Flipkart Core Backend in Y3), and accepted a full-time SDE role at Microsoft in Year 4.
        </p>

        {/* Anchored Primary Evidence Logs */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Anchored Repositories & Trace Records
            </span>
            <span className="font-code-sm" style={{ color: 'var(--text-secondary)' }}>
              3 Direct Provenance Links
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onInspectEvidence && onInspectEvidence('ev-leetcode-527')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                transition: 'all 0.15s ease',
              }}
            >
              <LinkIcon size={12} className="text-primary" />
              leetcode.com/ashmit_b
            </button>

            <button
              type="button"
              onClick={() => onInspectEvidence && onInspectEvidence('ev-github')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                transition: 'all 0.15s ease',
              }}
            >
              <LinkIcon size={12} className="text-primary" />
              github.com/ashmit-b
            </button>

            <button
              type="button"
              onClick={() => onInspectEvidence && onInspectEvidence('ev-flipkart')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                transition: 'all 0.15s ease',
              }}
            >
              <LinkIcon size={12} className="text-primary" />
              flipkart-backend/2025
            </button>
          </div>
        </div>
      </article>

      {/* 2-Column Desktop Grid for Inferences and Unknowns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Card 2: Possible Interpretations */}
        <article
          className="trace-card"
          style={{
            position: 'relative',
            borderLeft: '4px solid #f59e0b',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
              Possible Interpretations
            </h2>
            <span className="epistemic-badge inferred">
              ◈ Inferred · Reasonable Synthesis
            </span>
          </div>

          <p className="font-body-md" style={{ color: 'var(--text-primary)', lineHeight: 1.55, flex: 1 }}>
            The visible trajectory exhibits consistent compounding between algorithmic competitive practice and real-world distributed systems delivery. However, public evidence cannot isolate which specific factor (e.g., contest rating versus Flipkart internship) had the greatest causal weight on the final Microsoft placement.
          </p>

          {/* Strict TRACE Causality Grounding Disclaimer */}
          <div
            style={{
              marginTop: '16px',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <span className="font-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Causal Weight Resolution:
            </span>
            <span
              className="font-label-sm"
              style={{
                color: '#92400e',
                backgroundColor: '#fef3c7',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                border: '1px solid #fde68a',
              }}
            >
              Indeterminate (Rule #11)
            </span>
          </div>
        </article>

        {/* Card 3: Unknown & Unobserved Elements */}
        <article
          className="trace-card"
          style={{
            position: 'relative',
            borderLeft: '4px solid var(--text-muted)',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 className="font-headline-sm" style={{ color: 'var(--text-primary)', fontSize: 15 }}>
              Unknown & Unobserved Elements
            </h2>
            <span className="epistemic-badge unknown">
              ○ Unknown · Outside Observational Scope
            </span>
          </div>

          <ul
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              listStyle: 'none',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>—</span>
              <span>Total private preparation, self-study, and offline mock interview hours.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>—</span>
              <span>Unrecorded campus alumni network referrals or internal recruiter outreach dynamics.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>—</span>
              <span>Specific interview rounds and problem sets asked during Microsoft on-site evaluations.</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
};
