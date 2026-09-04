import React from 'react';
import { CompassIcon } from './Icons';

interface EmptyStateProps {
  onLoadSample: () => void;
  status?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onLoadSample,
  status = 'idle',
}) => {
  return (
    <div
      className="trace-card"
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '640px',
        margin: '40px auto',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'rgba(0, 104, 95, 0.08)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 104, 95, 0.15)',
        }}
      >
        <CompassIcon size={26} />
      </div>

      <div style={{ maxWidth: '440px' }}>
        <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: 18 }}>
          {status === 'analyzing'
            ? 'Analyzing Profile Evidence...'
            : status === 'profile_detected'
            ? 'LinkedIn Profile Detected'
            : 'Awaiting LinkedIn Profile'}
        </h2>
        <p
          className="font-body-sm"
          style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}
        >
          {status === 'analyzing'
            ? 'Reading legitimately visible experience, education, and skills from the active tab. No manual capture required.'
            : 'Open any LinkedIn profile (`linkedin.com/in/*`) in Chrome. Trace automatically observes rendered page elements, extracts grounded evidence, and populates the workspace.'}
        </p>
      </div>

      {/* Detection status pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          marginTop: '4px',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: status === 'analyzing' ? 'var(--primary)' : '#10b981',
          }}
        />
        <span>
          {status === 'analyzing' ? 'Live Extraction in Progress' : 'Automatic Detection Active'}
        </span>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={onLoadSample}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Load Reference Grounded Profile (Ashmit Bagga)
        </button>
      </div>
    </div>
  );
};
