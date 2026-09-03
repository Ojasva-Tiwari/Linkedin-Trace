import { UserIcon, UsersIcon, CompassIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  currentArea: 'profile' | 'research' | 'mypath';
  onSelectArea: (area: 'profile' | 'research' | 'mypath') => void;
  activeProfileName?: string;
  isCapturing?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentArea,
  onSelectArea,
  activeProfileName = 'Ashmit Bagga',
  isCapturing = false,
}) => {
  const navItems = [
    { id: 'profile', label: 'Candidate Profile', icon: <UserIcon size={18} /> },
    { id: 'research', label: 'Research Cohorts', icon: <UsersIcon size={18} /> },
    { id: 'mypath', label: 'My Path Trajectory', icon: <CompassIcon size={18} /> },
  ] as const;

  return (
    <aside className="trace-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '-0.04em',
              boxShadow: '0 2px 6px rgba(0, 104, 95, 0.25)',
            }}
          >
            T
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="font-headline-sm" style={{ letterSpacing: '0.04em', fontWeight: 700 }}>
                TRACE
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                STUDIO
              </span>
            </div>
            <p className="font-code-sm" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              Evidence-Grounded v0.1
            </p>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          className="font-label-sm"
          style={{
            color: 'var(--text-muted)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '4px 8px 8px 8px',
          }}
        >
          Workspaces
        </div>
        {navItems.map((item) => {
          const isActive = currentArea === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectArea(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
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
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
              <span className="trace-sidebar-label">{item.label}</span>
              {isActive && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                  }}
                />
              )}
            </button>
          );
        })}

        <div style={{ height: 16 }} />

        <div
          className="font-label-sm"
          style={{
            color: 'var(--text-muted)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '4px 8px 8px 8px',
          }}
        >
          Configuration
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            fontWeight: 500,
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <SettingsIcon size={18} />
          <span className="trace-sidebar-label">Settings & Storage</span>
        </button>
      </div>

      {/* Footer Profile Glancer & Local DB Status */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            AS
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }} className="trace-sidebar-label">
            <div
              className="font-headline-sm"
              style={{
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeProfileName}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                color: isCapturing ? 'var(--inferred-text)' : 'var(--observed-text)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: isCapturing ? '#f59e0b' : '#10b981',
                }}
              />
              {isCapturing ? 'Capturing...' : 'Local DB Synced'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
