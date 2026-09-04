/**
 * TRACE - LeetCode External Source Adapter
 * Normalizes and categorizes LeetCode profiles and problem links.
 */

import { ExternalSourceAdapter } from '../types';

export class LeetCodeAdapter implements ExternalSourceAdapter {
  readonly type = 'leetcode' as const;
  readonly name = 'LeetCode Adapter';
  readonly supportedDomains = ['leetcode.com', 'leetcode.cn'];

  canHandle(_url: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    return cleanDomain === 'leetcode.com' || cleanDomain === 'leetcode.cn';
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      parsed.search = '';
      parsed.hash = '';
      const pathname = parsed.pathname.replace(/\/+$/, '');
      return `https://leetcode.com${pathname}`;
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, _rawSnippet?: string): Record<string, any> {
    try {
      const parsed = new URL(normalizedUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (parts[0] === 'u' && parts[1]) {
        return {
          targetType: 'profile',
          username: parts[1],
        };
      }

      if (parts[0] === 'problems' && parts[1]) {
        return {
          targetType: 'problem',
          problemSlug: parts[1],
        };
      }

      if (parts.length === 1 && !['problems', 'contest', 'explore'].includes(parts[0])) {
        return {
          targetType: 'profile',
          username: parts[0],
        };
      }

      return { targetType: 'general' };
    } catch {
      return {};
    }
  }

  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string {
    const meta = metadata || this.parseMetadata(normalizedUrl);
    if (meta.targetType === 'profile' && meta.username) {
      return `LeetCode Profile: @${meta.username}`;
    }
    if (meta.targetType === 'problem' && meta.problemSlug) {
      return `LeetCode Problem: ${meta.problemSlug}`;
    }
    return 'LeetCode Profile';
  }
}
