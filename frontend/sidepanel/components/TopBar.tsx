import React from 'react';
import { ScannerIcon, SearchIcon } from './Icons';

interface TopBarProps {
  currentArea: 'profile' | 'research' | 'mypath';
  isCapturing?: boolean;
  onCaptureClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentArea,
  isCapturing = false,
  onCaptureClick,
}) => {
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

  return (
    <header className="trace-top-bar">
      {/* Left: Breadcrumbs & Quick Search Cue */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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
              fontSize: 14,
              marginTop: -2,
            }}
          >
            {getAreaTitle()}
          </h2>
        </div>

        {/* Quick Search / Command cue */}
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
      </div>

      {/* Right: Capture Action & Sync Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Grounding Mode Pill */}
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
          <span>Epistemic Triad: Active</span>
        </div>

        {/* User-Triggered Capture Button */}
        <button
          onClick={onCaptureClick}
          disabled={isCapturing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            backgroundColor: isCapturing ? 'var(--primary-container)' : 'var(--primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '7px 14px',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: isCapturing ? 'default' : 'pointer',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 1px 3px rgba(0, 104, 95, 0.25)',
          }}
        >
          <ScannerIcon size={15} />
          <span>{isCapturing ? 'Analyzing Page...' : 'Capture Active Page'}</span>
        </button>
      </div>
    </header>
  );
};
