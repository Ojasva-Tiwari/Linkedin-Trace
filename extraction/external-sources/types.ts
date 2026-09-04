/**
 * TRACE - External Source Adapter Types
 * Defines interfaces for discovering, normalizing, and grounding external sources.
 */

import { ExternalSourceType } from '@shared/index';

export interface SourceDiscoveryContext {
  profileId: string;
  originatingEvidenceId: string;
  originatingContext: string;
  rawText?: string;
}

export interface ExtractedLinkCandidate {
  rawUrl: string;
  normalizedUrl: string;
  domain: string;
  originatingEvidenceId: string;
  originatingContext: string;
  rawSnippet?: string;
}

export interface ExternalSourceAdapter {
  readonly type: ExternalSourceType;
  readonly name: string;
  readonly supportedDomains: string[];

  /**
   * Returns true if this adapter can handle the given URL and domain.
   */
  canHandle(url: string, domain: string): boolean;

  /**
   * Normalizes the URL (strips tracking parameters, trailing slashes, fragments if appropriate).
   */
  normalize(url: string): string;

  /**
   * Generates a descriptive label (e.g. "GitHub Repository: owner/repo", "Devpost Submission").
   */
  generateLabel(normalizedUrl: string, metadata?: Record<string, any>): string;

  /**
   * Extracts non-invasive metadata from URL structure or public patterns.
   */
  parseMetadata(normalizedUrl: string, rawSnippet?: string): Record<string, any>;
}
