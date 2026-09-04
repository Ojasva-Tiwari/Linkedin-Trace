import React from 'react';
import { TraceProfile, TracePost } from '@shared/index';
import { PostIcon, LinkIcon, NorthEastIcon, PolicyIcon } from './Icons';

interface ActivityViewProps {
  profile: TraceProfile;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  profile,
  onInspectEvidence,
}) => {
  const posts: TracePost[] = profile.posts || [];
  const observedCount = posts.filter((p) => p.factState === 'observed').length;
  const classifiedCount = posts.filter((p) => p.category !== 'other/unclassified').length;

  const renderCategoryBadge = (category: string) => {
    let bg = 'rgba(0, 104, 95, 0.08)';
    let color = 'var(--primary)';
    let border = 'rgba(0, 104, 95, 0.2)';

    switch (category) {
      case 'project':
      case 'open source':
        bg = 'rgba(2, 132, 199, 0.08)';
        color = '#0284c7';
        border = 'rgba(2, 132, 199, 0.25)';
        break;
      case 'hackathon/competition':
      case 'achievement/award':
        bg = 'rgba(217, 119, 6, 0.08)';
        color = '#d97706';
        border = 'rgba(217, 119, 6, 0.25)';
        break;
      case 'job/career update':
      case 'internship':
        bg = 'rgba(16, 185, 129, 0.08)';
        color = '#059669';
        border = 'rgba(16, 185, 129, 0.25)';
        break;
      case 'DSA/problem solving':
      case 'technical learning':
        bg = 'rgba(147, 51, 234, 0.08)';
        color = '#7c3aed';
        border = 'rgba(147, 51, 234, 0.25)';
        break;
      default:
        bg = 'var(--bg-subtle)';
        color = 'var(--text-secondary)';
        border = 'var(--border-subtle)';
        break;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          textTransform: 'capitalize',
        }}
      >
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} />
        {category}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Activity Overview Header */}
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
            <PostIcon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="font-headline-sm" style={{ fontWeight: 700, margin: 0 }}>
                LinkedIn Activity & Posts
              </h2>
              <span className="epistemic-badge epistemic-badge--observed">
                ● Observed
              </span>
            </div>
            <p className="font-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              {posts.length > 0
                ? `${posts.length} activity post${posts.length === 1 ? '' : 's'} discovered · ${classifiedCount} evidence-classified`
                : 'Activity section discovered from rendered browser session'}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              textAlign: 'center',
            }}
          >
            <span className="font-code-sm" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
              {String(observedCount).padStart(2, '0')}
            </span>
            <span className="font-label-sm" style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>
              Observed Posts
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              textAlign: 'center',
            }}
          >
            <span className="font-code-sm" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {String(classifiedCount).padStart(2, '0')}
            </span>
            <span className="font-label-sm" style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>
              Evidence-Backed
            </span>
          </div>
        </div>
      </div>

      {/* Posts Feed or Honest Empty State */}
      {posts.length === 0 ? (
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
            <PostIcon size={22} />
          </div>
          <h3 className="font-headline-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>
            No Accessible Posts Rendered in Current Session
          </h3>
          <p
            className="font-body-sm"
            style={{ color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: '1.5' }}
          >
            LinkedIn did not render any public post cards in this session view.
            Trace strictly respects session boundaries and does not crawl private or rate-limited endpoints.
          </p>
          <span className="font-code-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Status: not_rendered
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map((post, idx) => (
            <div
              key={post.id || `post-${idx}`}
              className="trace-card trace-post-card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Post Metadata Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderCategoryBadge(post.category)}
                  {post.postDate && (
                    <span className="font-code-sm" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      • {post.postDate}
                    </span>
                  )}
                </div>

                {/* Inspect Evidence Button */}
                {post.evidenceIds && post.evidenceIds.length > 0 && (
                  <button
                    type="button"
                    data-testid="inspect-post-evidence"
                    aria-label="Inspect post evidence"
                    onClick={() => onInspectEvidence(post.evidenceIds[0])}
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

              {/* Post Visible Content */}
              <p
                className="font-body-sm"
                style={{
                  color: 'var(--text-primary)',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}
              >
                {post.visibleText}
              </p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="font-code-sm"
                      style={{
                        fontSize: '11px',
                        color: 'var(--primary)',
                        backgroundColor: 'var(--primary-light)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* External Links & Post URL */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-hairline)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {post.links && post.links.map((link, lIdx) => {
                    let displayHost = 'External link';
                    try {
                      displayHost = new URL(link).hostname;
                    } catch {}
                    return (
                      <a
                        key={lIdx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-label-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '11px',
                        }}
                      >
                        <NorthEastIcon size={10} />
                        <span>{displayHost}</span>
                      </a>
                    );
                  })}
                </div>

                {post.postUrl && (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-label-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    <LinkIcon size={11} />
                    <span>View original post</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
