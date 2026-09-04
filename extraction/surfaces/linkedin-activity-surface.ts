/**
 * TRACE - LinkedIn Activity & Posts Collector Surface
 * 
 * Implements EvidenceCollectorSurface for automatic discovery and extraction
 * of rendered LinkedIn activity posts.
 * Grounded in visible session content only; strictly factState = 'observed'.
 */

import {
  EvidenceCollectorSurface,
  SurfaceContext,
  SurfaceCollectorResult,
  surfaceRegistry,
} from '../collector-surface';
import { RawActivityPostItem } from '../types';

export class LinkedInActivitySurface implements EvidenceCollectorSurface {
  readonly id = 'linkedin_activity';
  readonly name = 'LinkedIn Activity & Posts Surface';
  readonly surfaceType = 'linkedin_activity' as const;
  readonly version = '0.1.0';

  canHandle(context: SurfaceContext): boolean {
    if (!context.url) return false;
    try {
      const parsed = new URL(context.url);
      const isLinkedIn = parsed.hostname.includes('linkedin.com');
      return isLinkedIn && parsed.pathname.includes('/in/');
    } catch {
      return false;
    }
  }

  async collect(context: SurfaceContext): Promise<SurfaceCollectorResult> {
    const doc = context.document || (typeof document !== 'undefined' ? document : null);
    if (!doc) {
      return {
        surfaceId: this.id,
        surfaceType: this.surfaceType,
        success: false,
        observedSections: [],
        unrenderedSections: ['activity'],
        error: 'Document context unavailable.',
      };
    }

    const posts = extractActivityPostsFromDoc(doc, context.url);
    const hasActivity = posts.length > 0 || isActivitySectionRendered(doc);

    return {
      surfaceId: this.id,
      surfaceType: this.surfaceType,
      success: true,
      observedSections: hasActivity ? ['activity'] : [],
      unrenderedSections: hasActivity ? [] : ['activity'],
      notes: `Extracted ${posts.length} visible activity posts from session.`,
    };
  }
}

/**
 * Checks if the activity section container is rendered in the DOM.
 */
export function isActivitySectionRendered(doc: Document): boolean {
  // Check for dedicated activity feed page
  if (typeof window !== 'undefined' && window.location.pathname.includes('/recent-activity/')) {
    return true;
  }

  // Check for activity heading on profile page
  const headings = Array.from(doc.querySelectorAll('h2, h3, section header'));
  for (const h of headings) {
    if (/activity/i.test(h.textContent || '')) {
      return true;
    }
  }

  const actSection = doc.querySelector('#content_collections, #activity, .activities, div[data-view-name*="activity"]');
  return !!actSection;
}

/**
 * Extracts visible activity posts legitimately rendered in the DOM.
 */
export function extractActivityPostsFromDoc(doc: Document, sourceUrl: string): RawActivityPostItem[] {
  const postCards: Element[] = [];

  // Strategy A: Feed-style update cards (present on /recent-activity/ or profile activity section)
  const feedCards = Array.from(
    doc.querySelectorAll(
      '.feed-shared-update-v2, div[data-urn*="urn:li:activity"], div[data-id*="urn:li:activity"], .occludable-update, .profile-activity-card'
    )
  );
  feedCards.forEach((c) => {
    if (!postCards.includes(c)) postCards.push(c);
  });

  // Strategy B: Profile "Activity" section list items
  const headings = Array.from(doc.querySelectorAll('h2, h3'));
  for (const h of headings) {
    if (/activity/i.test(h.textContent || '')) {
      const section = h.closest('section') || h.parentElement?.closest('div');
      if (section) {
        const items = Array.from(
          section.querySelectorAll(
            'ul.pvs-list > li, div[data-view-name="profile-component-entity"], .pvs-entity'
          )
        );
        items.forEach((item) => {
          if (!postCards.includes(item)) postCards.push(item);
        });
      }
      break;
    }
  }

  const results: RawActivityPostItem[] = [];
  const seenUrls = new Set<string>();

  postCards.forEach((card, idx) => {
    try {
      // 1. Post URL or URN
      let postUrl: string | undefined;
      const urn =
        card.getAttribute('data-urn') ||
        card.getAttribute('data-id') ||
        card.querySelector('[data-urn]')?.getAttribute('data-urn');

      if (urn && urn.includes('urn:li:activity:')) {
        const actId = urn.match(/urn:li:activity:(\d+)/)?.[1];
        if (actId) {
          postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${actId}/`;
        }
      }

      if (!postUrl) {
        const linkEl = card.querySelector<HTMLAnchorElement>(
          'a[href*="/feed/update/urn:li:activity:"], a[href*="/posts/"], a[href*="/pulse/"]'
        );
        if (linkEl?.href) {
          postUrl = linkEl.href.split('?')[0];
        }
      }

      if (!postUrl && sourceUrl) {
        postUrl = sourceUrl;
      }

      // Avoid duplicates inside same page extraction
      const dedupKey = postUrl || `card-${idx}-${card.textContent?.slice(0, 40)}`;
      if (seenUrls.has(dedupKey)) return;
      seenUrls.add(dedupKey);

      // 2. Visible Post Text
      const textEl = card.querySelector<HTMLElement>(
        '.feed-shared-update-v2__description, .update-components-text, .inline-show-more-text, .break-words, span[dir="ltr"]'
      );
      let visibleText = textEl?.innerText?.trim() || '';

      // Fallback: if no dedicated text element, read the card text excluding buttons
      if (!visibleText) {
        const clone = card.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('button, svg, nav').forEach((el) => el.remove());
        visibleText = clone.innerText?.trim() || '';
      }

      if (!visibleText || visibleText.length < 5) {
        return; // Skip empty or navigation-only cards
      }

      // 3. Post Date / Relative Time
      let postDateRaw: string | undefined;
      const timeEl = card.querySelector<HTMLElement>(
        'time, .update-components-actor__sub-description, .feed-shared-actor__sub-description, span.visually-hidden'
      );
      if (timeEl) {
        // Look for date pattern like "2w", "1mo", "3d", "Oct 2024"
        const timeText = timeEl.innerText?.trim();
        const cleanMatch = timeText?.match(/\b(\d+[wdmyh]|yesterday|\w+\s+\d{4}|\d+\s+\w+)\b/i);
        postDateRaw = cleanMatch ? cleanMatch[0] : timeText;
      }

      if (!postDateRaw) {
        const cardText = card.textContent || '';
        const match = cardText.match(/\b(\d+\s*(?:h|d|w|mo|yr|m|s|hours?|days?|weeks?|months?|years?)|yesterday|just now|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i);
        if (match) {
          postDateRaw = match[1].trim();
        }
      }

      // 4. Author Name
      const authorEl = card.querySelector<HTMLElement>(
        '.update-components-actor__name, .feed-shared-actor__name, .update-components-actor__title'
      );
      const authorName = authorEl?.innerText?.trim() || undefined;

      // 5. Hashtags
      const hashtagMatches = visibleText.match(/#[a-zA-Z0-9_\u00c0-\u00ff]+/g) || [];
      const hashtags = Array.from(new Set(hashtagMatches));

      // 6. External Links in Post
      const links: string[] = [];
      card.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
        const h = a.href;
        if (
          h &&
          !h.includes('linkedin.com/feed/update/') &&
          !h.includes('linkedin.com/in/') &&
          !h.includes('/search/') &&
          !h.startsWith('javascript:') &&
          !links.includes(h)
        ) {
          links.push(h);
        }
      });

      // 7. Attachments
      const hasAttachment = !!card.querySelector(
        'img.feed-shared-image__image, .feed-shared-article, video, iframe, [class*="update-components-image"]'
      );

      // 8. DOM Selector
      const domSelector = urn
        ? `[data-urn="${urn}"]`
        : `section#activity div:nth-of-type(${idx + 1})`;

      results.push({
        id: `raw-post-${idx}`,
        postUrl,
        postDateRaw,
        visibleText,
        authorName,
        hashtags,
        links,
        hasAttachment,
        domSelector,
        rawText: card.textContent?.trim() || visibleText,
        sourcePageTitle: doc.title || 'LinkedIn Profile',
      });
    } catch {
      // Gracefully continue to next card
    }
  });

  return results;
}

// Auto-register surface in singleton registry
export const linkedInActivitySurface = new LinkedInActivitySurface();
surfaceRegistry.register(linkedInActivitySurface);
