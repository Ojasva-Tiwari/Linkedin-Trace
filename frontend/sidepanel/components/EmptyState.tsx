import React from 'react';
import { TerminalIcon } from './Icons';

interface EmptyStateProps {
  onTriggerCapture: () => void;
  onLoadSample: () => void;
  isCapturing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onTriggerCapture,
  onLoadSample,
  isCapturing,
}) => {
  return (
    <div className="trace-card" style={{
      textAlign: 'center',
      padding: '36px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <TerminalIcon size={20} />
      </div>

      <div style={{ maxWidth: '280px' }}>
        <h2 className="font-headline-md" style={{ color: 'var(--text-primary)' }}>
          No Profile Loaded
        </h2>
        <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Open any public LinkedIn profile in Chrome and click "Capture Active Page" to extract a grounded evidence trajectory.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onTriggerCapture}
          disabled={isCapturing}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            fontSize: '12px',
            cursor: isCapturing ? 'default' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'background-color 0.15s ease',
          }}
        >
          {isCapturing ? 'Capturing...' : 'Capture Active Page'}
        </button>

        <button
          type="button"
          onClick={onLoadSample}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Load Verified Sample Profile (Ashmit Bagga)
        </button>
      </div>
    </div>
  );
};
