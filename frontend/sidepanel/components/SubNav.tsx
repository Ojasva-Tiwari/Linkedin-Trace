import React from 'react';
import { useLayoutMode } from '../context/LayoutContext';

export type ProfileSubView = 'timeline' | 'skills' | 'preparation' | 'activity' | 'sources' | 'summary' | 'artifacts';

interface SubNavProps {
  activeView: ProfileSubView;
  onSelectView: (view: ProfileSubView) => void;
  showArtifactsTab?: boolean;
  activityCount?: number;
  sourcesCount?: number;
}

export const SubNav: React.FC<SubNavProps> = ({
  activeView,
  onSelectView,
  showArtifactsTab = false,
  activityCount,
  sourcesCount,
}) => {
  const { isCompact } = useLayoutMode();

  const tabs: { id: ProfileSubView; label: string }[] = [
    { id: 'timeline', label: isCompact ? 'Timeline' : 'Timeline Progression' },
    { id: 'skills', label: isCompact ? 'Skills' : 'Skill Architecture' },
    { id: 'preparation', label: isCompact ? 'Preparation' : 'Preparation Milestones' },
    {
      id: 'activity',
      label: activityCount !== undefined && activityCount > 0 ? `Activity (${activityCount})` : 'Activity',
    },
    {
      id: 'sources',
      label: sourcesCount !== undefined && sourcesCount > 0 ? (isCompact ? `Sources (${sourcesCount})` : `External Sources (${sourcesCount})`) : (isCompact ? 'Sources' : 'External Sources'),
    },
    { id: 'summary', label: isCompact ? 'Summary' : 'Epistemic Summary' },
  ];

  if (showArtifactsTab) {
    tabs.push({ id: 'artifacts' as const, label: isCompact ? 'Artifacts' : 'Artifacts Breakdown' });
  }

  return (
    <nav
      className="trace-subnav"
      aria-label="Profile Sections"
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)',
        padding: '4px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        gap: '4px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            type="button"
            onClick={() => onSelectView(tab.id)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {isActive && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
