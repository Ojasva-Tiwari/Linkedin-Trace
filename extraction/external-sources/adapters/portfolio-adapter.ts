/**
 * TRACE - Portfolio & Project External Source Adapter
 * Normalizes personal websites, portfolio pages, and deployed project applications.
 */

import { ExternalSourceAdapter } from '../types';

const EXCLUDED_HOSTS = new Set([
  'linkedin.com',
  'www.linkedin.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'youtube.com',
  'google.com',
  'bit.ly',
  'tinyurl.com',
  't.co',
]);

export class PortfolioAdapter implements ExternalSourceAdapter {
  readonly type = 'portfolio' as const;
  readonly name = 'Portfolio & Project Adapter';
  readonly supportedDomains = ['*'];

  canHandle(url: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    if (EXCLUDED_HOSTS.has(cleanDomain)) return false;

    // Check common hosting/portfolio patterns
    if (
      cleanDomain.endsWith('.github.io') ||
      cleanDomain.endsWith('.vercel.app') ||
      cleanDomain.endsWith('.netlify.app') ||
      cleanDomain.endsWith('.pages.dev') ||
      cleanDomain.endsWith('.web.app') ||
      cleanDomain.endsWith('.surge.sh')
    ) {
      return true;
    }

    // Check if URL or snippet contains portfolio or project keywords
    if (/portfolio|project|demo|app|personal|site|blog/i.test(url)) {
      return true;
    }

    // Valid independent personal domain (e.g. ojasva.me, satyanadella.com)
    const dotCount = (cleanDomain.match(/\./g) || []).length;
    return dotCount >= 1 && !cleanDomain.includes('linkedin');
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      // Remove common marketing/tracking queries (utm_*)
      const params = new URLSearchParams(parsed.search);
      Array.from(params.keys()).forEach((k) => {
        if (k.startsWith('utm_') || k === 'ref' || k === 'source') {
          params.delete(k);
        }
      });
      parsed.search = params.toString() ? `?${params.toString()}` : '';
      parsed.hash = '';
      return parsed.toString().replace(/\/+$/, '');
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, rawSnippet?: string): Record<string, any> {
    try {
      const parsed = new URL(normalizedUrl);
      const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const isDeployment =
        domain.endsWith('.github.io') ||
        domain.endsWith('.vercel.app') ||
        domain.endsWith('.netlify.app') ||
        domain.endsWith('.pages.dev');

      let candidateTitle: string | undefined;
      if (rawSnippet) {
        const titleMatch = rawSnippet.match(/(?:project|app|portfolio|site):\s*([a-zA-Z0-9\s-_]{3,30})/i);
        if (titleMatch) candidateTitle = titleMatch[1].trim();
      }

      return {
        domain,
        isDeployment,
        targetType: isDeployment ? 'project_app' : 'portfolio_site',
        title: candidateTitle || domain,
      };
    } catch {
      return {};
    }
  }

  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string {
    const meta = metadata || this.parseMetadata(normalizedUrl);
    if (meta.isDeployment) {
      return `Project Web App (${meta.domain})`;
    }
    return `Portfolio / Website (${meta.domain || 'External Link'})`;
  }
}
