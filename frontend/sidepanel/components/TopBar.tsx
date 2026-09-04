import React from 'react';
import { SearchIcon, ExpandLayoutIcon, CompactLayoutIcon } from './Icons';
import { ExtractionStatus } from '../../../extraction/types';
import { SynthesisStatus } from '../hooks/useAutoProfileAnalysis';
import { useLayoutMode } from '../context/LayoutContext';

interface TopBarProps {
  currentArea: 'profile' | 'research' | 'mypath';
  status?: ExtractionStatus;
  synthesisStatus?: SynthesisStatus;
  onReanalyze?: () => void;
  onResynthesize?: () => void;
  postsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentArea,
  status = 'idle',
  synthesisStatus = 'idle',
  onReanalyze,
  onResynthesize,
  postsCount,
}) => {
  const { isCompact, toggleLayoutMode } = useLayoutMode();
  const getAreaTitle = () => {
    switch (currentArea) {
      case 'profile':
        return 'Candidate Trajectory Workspace';
      case 'research':
        return 'Market Research & Cohorts';
      case 'mypath':
        return 'Trajectory Gap Analysis & Planning';
    }
  };

  const renderSynthesisBadge = () => {
    switch (synthesisStatus) {
      case 'synthesizing':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 11px',
              fontSize: 11.5,
              fontWeight: 500,
              color: '#6366f1',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                animation: 'pulse 1.2s infinite',
              }}
            />
            <span>Synthesizing...</span>
          </div>
        );

      case 'ready':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 11px',
              fontSize: 11.5,
              fontWeight: 500,
              color: '#059669',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span>Synthesis Ready</span>
          </div>
        );

      case 'unavailable':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 11px',
                fontSize: 11.5,
                fontWeight: 500,
                color: '#dc2626',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
              <span>Synthesis Unavailable</span>
            </div>
            {onResynthesize && (
              <button
                type="button"
                onClick={onResynthesize}
                title="Retry grounded synthesis"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            )}
          </div>
        );

      case 'idle':
      default:
        return null;
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'analyzing':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(0, 104, 95, 0.08)',
              border: '1px solid rgba(0, 104, 95, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--primary)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span>Collecting Evidence...</span>
          </div>
        );


      case 'profile_detected':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 500,
              color: '#0284c7',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#0284c7',
              }}
            />
            <span>Profile Detected</span>
          </div>
        );

      case 'ready':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: 11.5,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.15)',
                }}
              />
              <span>Live Grounded</span>
            </div>
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                title="Re-read current visible page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Re-trace</span>
              </button>
            )}
          </div>
        );

      case 'partial':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: 11.5,
                color: '#b45309',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>Partial DOM Grounded</span>
            </div>
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Re-trace
              </button>
            )}
          </div>
        );

      case 'idle':
      default:
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: 11.5,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--text-muted)',
              }}
            />
            <span>Awaiting LinkedIn Profile</span>
          </div>
        );
    }
  };

  return (
    <header className="trace-top-bar">
      {/* Left: Breadcrumbs & Quick Search Cue */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 10 : 20 }}>
        <div>
          <span
            className="font-label-sm"
            style={{
              color: 'var(--text-muted)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Trace Studio /
          </span>
          <h2
            className="font-headline-sm"
            style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontSize: isCompact ? 13 : 14,
              marginTop: -2,
            }}
          >
            {getAreaTitle()}
          </h2>
        </div>

        {/* Quick Search / Command cue (hidden in compact mode) */}
        {!isCompact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-lg)',
              padding: '5px 12px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <SearchIcon size={14} />
            <span>Search claims, profiles, skills...</span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 5px',
                marginLeft: 8,
              }}
            >
              ⌘K
            </span>
          </div>
        )}
      </div>

      {/* Right: Epistemic State, Activity Cue & Layout Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 8 : 12 }}>
        {renderStatusBadge()}
        {renderSynthesisBadge()}

        {postsCount !== undefined && postsCount > 0 && !isCompact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--primary)',
              backgroundColor: 'rgba(0, 104, 95, 0.08)',
              padding: '4px 9px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(0, 104, 95, 0.2)',
            }}
            title={`${postsCount} activity posts grounded in profile evidence`}
          >
            <span>{postsCount} Posts</span>
          </div>
        )}

        {/* Layout Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleLayoutMode}
          title={isCompact ? 'Switch to Expanded workspace (1200-1400px)' : 'Switch to Compact utility workspace (380-440px)'}
          aria-label={isCompact ? 'Switch to Expanded workspace' : 'Switch to Compact utility workspace'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: isCompact ? '5px 8px' : '5px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 11.5,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {isCompact ? <ExpandLayoutIcon size={14} /> : <CompactLayoutIcon size={14} />}
          <span style={{ fontSize: '11px' }}>{isCompact ? 'Expand' : 'Compact'}</span>
        </button>
      </div>
    </header>
  );
};
