/**
 * TRACE - External Source Adapter Registry
 * Manages registered source adapters and dispatches URL normalization and metadata extraction.
 */

import { ExternalSourceAdapter } from './types';
import { GitHubAdapter } from './adapters/github-adapter';
import { DevpostAdapter } from './adapters/devpost-adapter';
import { LeetCodeAdapter } from './adapters/leetcode-adapter';
import { CertificationAdapter } from './adapters/certification-adapter';
import { DocumentAdapter } from './adapters/document-adapter';
import { PortfolioAdapter } from './adapters/portfolio-adapter';

export class SourceAdapterRegistry {
  private adapters: ExternalSourceAdapter[] = [];

  constructor() {
    // Register default built-in adapters in priority order
    this.register(new GitHubAdapter());
    this.register(new DevpostAdapter());
    this.register(new LeetCodeAdapter());
    this.register(new CertificationAdapter());
    this.register(new DocumentAdapter());
    this.register(new PortfolioAdapter()); // Fallback for custom domains and project web apps
  }

  register(adapter: ExternalSourceAdapter): void {
    this.adapters.push(adapter);
  }

  findAdapter(url: string): ExternalSourceAdapter | undefined {
    let domain = '';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname;
    } catch {
      return undefined;
    }

    return this.adapters.find((adapter) => adapter.canHandle(url, domain));
  }

  listAdapters(): Array<{ type: string; name: string; supportedDomains: string[] }> {
    return this.adapters.map((a) => ({
      type: a.type,
      name: a.name,
      supportedDomains: a.supportedDomains,
    }));
  }
}

export const sourceRegistry = new SourceAdapterRegistry();
