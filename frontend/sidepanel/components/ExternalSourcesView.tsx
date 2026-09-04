import React from 'react';
import { TraceProfile, DiscoveredExternalSource } from '@shared/index';
import {
  GitHubIcon,
  DevpostIcon,
  LeetCodeIcon,
  GlobeIcon,
  DocumentIcon,
  NorthEastIcon,
  PolicyIcon,
  CheckIcon,
} from './Icons';

interface ExternalSourcesViewProps {
  profile: TraceProfile;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ExternalSourcesView: React.FC<ExternalSourcesViewProps> = ({
  profile,
  onInspectEvidence,
}) => {
  const sources: DiscoveredExternalSource[] = profile.externalSources || [];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <GitHubIcon size={18} />;
      case 'devpost':
        return <DevpostIcon size={18} />;
      case 'leetcode':
        return <LeetCodeIcon size={18} />;
      case 'document':
        return <DocumentIcon size={18} />;
      case 'portfolio':
      default:
        return <GlobeIcon size={18} />;
    }
  };

  const getSourceTypeBadge = (type: string) => {
    let bg = 'rgba(0, 104, 95, 0.08)';
    let color = 'var(--primary)';
    let border = 'rgba(0, 104, 95, 0.25)';

    switch (type) {
      case 'github':
        bg = '#24292f15';
        color = '#24292f';
        border = '#24292f30';
        break;
      case 'devpost':
        bg = 'rgba(0, 61, 166, 0.08)';
        color = '#003ea6';
        border = 'rgba(0, 61, 166, 0.25)';
        break;
      case 'leetcode':
        bg = 'rgba(255, 161, 22, 0.12)';
        color = '#d97706';
        border = 'rgba(255, 161, 22, 0.35)';
        break;
      case 'certification':
        bg = 'rgba(16, 185, 129, 0.08)';
        color = '#059669';
        border = 'rgba(16, 185, 129, 0.25)';
        break;
      case 'document':
        bg = 'rgba(147, 51, 234, 0.08)';
        color = '#7c3aed';
        border = 'rgba(147, 51, 234, 0.25)';
        break;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {type}
      </span>
    );
  };

  const sourceCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    sources.forEach((s) => {
      counts[s.sourceType] = (counts[s.sourceType] || 0) + 1;
    });
    return counts;
  }, [sources]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* External Sources Header Overview Card */}
      <div
        className="trace-card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GlobeIcon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="font-headline-sm" style={{ fontWeight: 700, margin: 0 }}>
                Discovered External Sources
              </h2>
              <span className="epistemic-badge observed">
                ● Observed
              </span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              {sources.length > 0
                ? `${sources.length} external artifact${sources.length === 1 ? '' : 's'} discovered from profile & post evidence`
                : 'Scans visible candidate profile & activity posts for external artifacts'}
            </p>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(sourceCounts).map(([type, count]) => (
            <div
              key={type}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 9px',
                fontSize: 11,
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {count}
              </span>
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Feed or Honest Empty State */}
      {sources.length === 0 ? (
        <div
          className="trace-card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <GlobeIcon size={22} />
          </div>
          <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>
            No External Sources Discovered in Evidence
          </h3>
          <p
            className="font-body-sm"
            style={{ color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: '1.5' }}
          >
            No external GitHub repositories, Devpost hackathons, LeetCode handles, or personal portfolio websites were referenced in the current profile or activity posts.
          </p>
          <span className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Status: zero_external_references
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sources.map((source) => (
            <div
              key={source.id}
              className="trace-card trace-source-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Header: Type icon, badge, label, and inspect button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    {getSourceIcon(source.sourceType)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="font-headline-sm" style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>
                        {source.label}
                      </h3>
                      {getSourceTypeBadge(source.sourceType)}
                    </div>
                    <span className="font-code-sm" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Domain: {source.domain}
                    </span>
                  </div>
                </div>

                {/* Inspect Evidence Button */}
                {source.evidenceIds && source.evidenceIds.length > 0 && (
                  <button
                    type="button"
                    data-testid="inspect-source-evidence"
                    aria-label="Inspect external source evidence"
                    onClick={() => onInspectEvidence(source.evidenceIds[0])}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(0, 104, 95, 0.2)',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 104, 95, 0.16)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                    }}
                  >
                    <PolicyIcon size={12} />
                    <span>Inspect Evidence ↗</span>
                  </button>
                )}
              </div>

              {/* URL & Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href={source.normalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: 12.5,
                    fontFamily: 'var(--font-mono)',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}
                >
                  <span>{source.normalizedUrl}</span>
                  <NorthEastIcon size={12} />
                </a>
              </div>

              {/* Originating Evidence Citation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-hairline)',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                <CheckIcon size={12} className="text-secondary" />
                <span>
                  <strong style={{ fontWeight: 600 }}>Origin:</strong> {source.originatingContext}
                </span>
                {source.originatingEvidenceId && (
                  <span className="font-code-sm" style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: 10 }}>
                    [{source.originatingEvidenceId}]
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
