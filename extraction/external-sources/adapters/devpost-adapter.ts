/**
 * TRACE - Devpost External Source Adapter
 * Normalizes and categorizes Devpost hackathon project submissions and hacker profiles.
 */

import { ExternalSourceAdapter } from '../types';

export class DevpostAdapter implements ExternalSourceAdapter {
  readonly type = 'devpost' as const;
  readonly name = 'Devpost Adapter';
  readonly supportedDomains = ['devpost.com'];

  canHandle(_url: string, domain: string): boolean {
    return domain.toLowerCase().replace(/^www\./, '') === 'devpost.com';
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      parsed.search = '';
      parsed.hash = '';
      const pathname = parsed.pathname.replace(/\/+$/, '');
      return `https://devpost.com${pathname}`;
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, _rawSnippet?: string): Record<string, any> {
    try {
      const parsed = new URL(normalizedUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (parts[0] === 'software' && parts[1]) {
        const slug = parts[1];
        const title = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          targetType: 'project',
          projectSlug: slug,
          projectTitle: title,
        };
      }

      if (parts.length === 1 && parts[0] !== 'software') {
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
    if (meta.targetType === 'project' && meta.projectTitle) {
      return `Devpost Hackathon: ${meta.projectTitle}`;
    }
    if (meta.targetType === 'profile' && meta.username) {
      return `Devpost Profile: @${meta.username}`;
    }
    return 'Devpost Submission';
  }
}
