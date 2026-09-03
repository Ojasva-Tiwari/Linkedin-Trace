import React from 'react';
import { CheckCircleIcon, CloseIcon } from './Icons';

interface CaptureBannerProps {
  message?: string;
  subMessage?: string;
  onDismiss: () => void;
}

export const CaptureBanner: React.FC<CaptureBannerProps> = ({
  message = 'Profile captured · Historical activity partial.',
  subMessage = 'Open LinkedIn Activity → Posts to index chronological timeline anchors.',
  onDismiss,
}) => {
  return (
    <aside
      style={{
        marginBottom: '20px',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
          <CheckCircleIcon size={18} />
        </div>
        <div>
          <p className="font-body-md" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {message}
          </p>
          {subMessage && (
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              {subMessage}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss banner"
        style={{
          background: 'none',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <CloseIcon size={14} />
      </button>
    </aside>
  );
};
