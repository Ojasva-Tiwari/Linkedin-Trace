/**
 * TRACE - Document & Resume External Source Adapter
 * Normalizes public resumes, PDFs, Google Docs, and public portfolio documents.
 */

import { ExternalSourceAdapter } from '../types';

export class DocumentAdapter implements ExternalSourceAdapter {
  readonly type = 'document' as const;
  readonly name = 'Document & Resume Adapter';
  readonly supportedDomains = ['drive.google.com', 'docs.google.com', 'dropbox.com'];

  canHandle(url: string, domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')) return true;
    if (cleanDomain.includes('drive.google.com') || cleanDomain.includes('docs.google.com')) return true;
    return /resume|cv|document/i.test(url);
  }

  normalize(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return rawUrl.trim();
    }
  }

  parseMetadata(normalizedUrl: string, rawSnippet?: string): Record<string, any> {
    const isPdf = normalizedUrl.toLowerCase().includes('.pdf');
    const isGoogle = normalizedUrl.includes('google.com');
    const isResume = /resume|cv/i.test(normalizedUrl) || (rawSnippet && /resume|cv/i.test(rawSnippet));

    return {
      isPdf,
      isGoogle,
      docType: isResume ? 'resume' : isPdf ? 'pdf' : 'document',
    };
  }

  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string {
    const meta = metadata || this.parseMetadata(normalizedUrl);
    if (meta.docType === 'resume') {
      return 'Public Resume / CV Document';
    }
    return meta.isPdf ? 'Public PDF Document' : 'Public Document Link';
  }
}
