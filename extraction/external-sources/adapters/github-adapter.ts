/**
 * TRACE - GitHub External Source Adapter
 * Normalizes and categorizes GitHub profiles, repositories, and gists.
 */

import { ExternalSourceAdapter } from '../types';

export class GitHubAdapter implements ExternalSourceAdapter {
  readonly type = 'github' as const;
  readonly name = 'GitHub Adapter';
  readonly supportedDomains = ['github.com', 'gist.github.com'];

  canHandle(_url: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    return cleanDomain === 'github.com' || cleanDomain === 'gist.github.com';
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      parsed.search = '';
      parsed.hash = '';
      let pathname = parsed.pathname.replace(/\/+$/, '');
      if (pathname.endsWith('.git')) {
        pathname = pathname.slice(0, -4);
      }
      return `https://${parsed.hostname.toLowerCase().replace(/^www\./, '')}${pathname}`;
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, _rawSnippet?: string): Record<string, any> {
    try {
      const parsed = new URL(normalizedUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (parsed.hostname.includes('gist')) {
        return {
          targetType: 'gist',
          owner: parts[0] || undefined,
          gistId: parts[1] || undefined,
        };
      }

      if (parts.length === 1) {
        return {
          targetType: 'profile',
          owner: parts[0],
        };
      }

      if (parts.length >= 2) {
        return {
          targetType: 'repository',
          owner: parts[0],
          repo: parts[1],
        };
      }

      return { targetType: 'organization' };
    } catch {
      return {};
    }
  }

  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string {
    const meta = metadata || this.parseMetadata(normalizedUrl);
    if (meta.targetType === 'repository' && meta.owner && meta.repo) {
      return `GitHub Repository: ${meta.owner}/${meta.repo}`;
    }
    if (meta.targetType === 'profile' && meta.owner) {
      return `GitHub Profile: @${meta.owner}`;
    }
    if (meta.targetType === 'gist') {
      return `GitHub Gist: ${meta.owner || 'public'}`;
    }
    return 'GitHub Link';
  }
}
