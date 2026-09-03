import React from 'react';
import { EvidenceItem } from '@shared/index';
import { CloseIcon, NorthEastIcon, PolicyIcon, CheckCircleIcon } from './Icons';

interface EvidenceDrawerProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
  targetPersonName?: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  onClose,
  targetPersonName = 'Candidate Profile',
}) => {
  if (!evidence) return null;

  return (
    <>
      {/* Backdrop Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(27, 27, 30, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Desktop Right Slide-Over Inspection Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.14)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-subtle)',
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        {/* Top Accent Ribbon */}
        <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--primary)' }} />

        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PolicyIcon size={16} className="text-primary" />
              <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                TRACE Artifact Inspector
              </span>
              <span
                className="font-code-sm"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                #{evidence.id}
              </span>
            </div>
            <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', marginTop: '4px', fontSize: 18 }}>
              Evidence Grounding Record
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence inspection"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-container-high)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div
          style={{
            padding: '20px 24px 32px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            flex: 1,
          }}
        >
          {/* Inspected Claim Banner */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Inspected Claim
              </span>
              <span className={`epistemic-badge ${evidence.factState}`}>
                {evidence.factState === 'observed' ? '● Observed' : evidence.factState === 'inferred' ? '◈ Inferred' : '○ Unknown'}
              </span>
            </div>

            <p className="font-headline-sm" style={{ color: 'var(--text-primary)', marginTop: '2px', fontSize: 14, lineHeight: 1.45 }}>
              {evidence.rawText}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '11.5px', marginTop: '4px' }}>
              <span>Target: <strong>{targetPersonName}</strong></span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span>Captured: {new Date(evidence.extractedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Primary Record Source */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Primary Record Source
            </span>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span className="font-headline-sm" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {evidence.provenance.pageTitle || 'Webpage Document Anchor'}
                </span>
                <span className="font-code-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                  {evidence.provenance.url}
                </span>
              </div>

              {evidence.provenance.url && (
                <a
                  href={evidence.provenance.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0,
                    border: '1px solid rgba(0, 104, 95, 0.2)',
                  }}
                >
                  <span>Open Source</span>
                  <NorthEastIcon size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Extracted Citation Snippet */}
          {evidence.provenance.contextSnippet && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-sm" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Extracted Citation
                </span>
                <span className="font-label-sm" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <CheckCircleIcon size={14} /> Verbatim Grounding
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-card)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-hairline)',
                  borderLeft: '4px solid var(--primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <p className="font-body-md" style={{ color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.55 }}>
                  "{evidence.provenance.contextSnippet}"
                </p>
              </div>
            </div>
          )}

          {/* Provenance Footprint Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: 'var(--bg-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Extraction Method:</span>
              <span className="font-code-sm">{evidence.type}</span>
            </div>
            {evidence.provenance.domSelector && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>DOM Selector:</span>
                <span className="font-code-sm">{evidence.provenance.domSelector}</span>
              </div>
            )}
            {evidence.annotation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>Annotation:</span>
                <span style={{ color: 'var(--text-primary)' }}>{evidence.annotation}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
