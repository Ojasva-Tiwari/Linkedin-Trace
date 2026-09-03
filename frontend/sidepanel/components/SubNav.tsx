import React from 'react';

export type ProfileSubView = 'timeline' | 'skills' | 'preparation' | 'summary' | 'artifacts';

interface SubNavProps {
  activeView: ProfileSubView;
  onSelectView: (view: ProfileSubView) => void;
  showArtifactsTab?: boolean;
}

export const SubNav: React.FC<SubNavProps> = ({
  activeView,
  onSelectView,
  showArtifactsTab = false,
}) => {
  const tabs: { id: ProfileSubView; label: string }[] = [
    { id: 'timeline', label: 'Timeline Progression' },
    { id: 'skills', label: 'Skill Architecture' },
    { id: 'preparation', label: 'Preparation Milestones' },
    { id: 'summary', label: 'Epistemic Summary' },
  ];

  if (showArtifactsTab) {
    tabs.push({ id: 'artifacts' as const, label: 'Artifacts Breakdown' });
  }

  return (
    <nav
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
