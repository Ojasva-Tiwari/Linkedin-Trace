import React from 'react';
import { CheckCircleIcon, CloseIcon } from './Icons';
import { ExtractionStatus } from '../../../extraction/types';

interface CaptureBannerProps {
  status?: ExtractionStatus;
  message?: string;
  subMessage?: string;
  evidenceCount?: number;
  onDismiss: () => void;
}

export const CaptureBanner: React.FC<CaptureBannerProps> = ({
  status = 'ready',
  message,
  subMessage,
  evidenceCount = 0,
  onDismiss,
}) => {
  const getBannerContent = () => {
    if (message) {
      return { msg: message, sub: subMessage };
    }

    switch (status) {
      case 'analyzing':
        return {
          msg: 'Observing legitimately visible profile evidence...',
          sub: 'Reading rendered experience, education, and skills from active tab.',
        };
      case 'profile_detected':
        return {
          msg: 'LinkedIn profile detected in active tab.',
          sub: 'Initiating visible DOM analysis and evidence grounding.',
        };
      case 'partial':
        return {
          msg: 'Partial profile structure observed.',
          sub: `${evidenceCount} grounded evidence records indexed from rendered DOM elements.`,
        };
      case 'ready':
      default:
        return {
          msg: 'Visible profile evidence observed & grounded.',
          sub: `${evidenceCount} atomic evidence records indexed from rendered session elements.`,
        };
    }
  };

  const { msg, sub } = getBannerContent();

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
            {msg}
          </p>
          {sub && (
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              {sub}
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
