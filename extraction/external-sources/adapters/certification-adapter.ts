/**
 * TRACE - Certification External Source Adapter
 * Normalizes credentials and certification verification pages (Credly, Coursera, Udemy, etc.).
 */

import { ExternalSourceAdapter } from '../types';

const CERT_DOMAINS = [
  'credly.com',
  'coursera.org',
  'udemy.com',
  'edx.org',
  'freecodecamp.org',
  'hackerrank.com',
  'cloudskillsboost.google',
  'aws.amazon.com',
  'learn.microsoft.com',
];

export class CertificationAdapter implements ExternalSourceAdapter {
  readonly type = 'certification' as const;
  readonly name = 'Certification & Credential Adapter';
  readonly supportedDomains = CERT_DOMAINS;

  canHandle(url: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    if (CERT_DOMAINS.some((d) => cleanDomain.endsWith(d))) return true;
    return /cert|credential|verify|badge/i.test(url);
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().replace(/\/+$/, '');
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, _rawSnippet?: string): Record<string, any> {
    try {
      const parsed = new URL(normalizedUrl);
      const cleanDomain = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const parts = parsed.pathname.split('/').filter(Boolean);

      let issuer = 'Credential Issuer';
      if (cleanDomain.includes('credly')) issuer = 'Credly';
      else if (cleanDomain.includes('coursera')) issuer = 'Coursera';
      else if (cleanDomain.includes('udemy')) issuer = 'Udemy';
      else if (cleanDomain.includes('edx')) issuer = 'edX';
      else if (cleanDomain.includes('microsoft')) issuer = 'Microsoft Learn';
      else if (cleanDomain.includes('google')) issuer = 'Google Cloud';

      return {
        issuer,
        credentialId: parts[parts.length - 1] || undefined,
        domain: cleanDomain,
      };
    } catch {
      return {};
    }
  }

  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string {
    const meta = metadata || this.parseMetadata(normalizedUrl);
    return `Credential Verification: ${meta.issuer || 'Certificate'}`;
  }
}
