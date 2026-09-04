/**
 * TRACE - External Source Detector & Grounding Engine
 * Automatically discovers external sources from profile and activity evidence,
 * normalizes via the source adapter registry, generates atomic evidence items,
 * and maintains strict provenance back to originating LinkedIn evidence records.
 */

import {
  DiscoveredExternalSource,
  EvidenceItem,
  TracePost,
  TraceProject,
  TraceCertification,
  TraceExperience,
} from '@shared/index';
import { sourceRegistry } from './source-registry';

interface DiscoveryInput {
  canonicalId: string;
  posts?: TracePost[];
  projects?: TraceProject[];
  certifications?: TraceCertification[];
  experiences?: TraceExperience[];
  aboutSummary?: string;
  sourceUrl?: string;
}

interface DiscoveryResult {
  sources: DiscoveredExternalSource[];
  evidenceItems: EvidenceItem[];
}

/**
 * Regex to extract HTTP(S) and domain URLs from arbitrary text.
 */
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"')]+(?:\b|\/)/gi;

/**
 * Shorthand domain patterns often written without protocol (e.g. github.com/user/repo).
 */
const SHORTHAND_REGEX = /\b(?:github\.com|devpost\.com|leetcode\.com)\/[a-zA-Z0-9_\-\.\/]+/gi;

export function discoverExternalSources(input: DiscoveryInput): DiscoveryResult {
  const { canonicalId, posts, projects, certifications, experiences, aboutSummary } = input;
  const discoveredMap = new Map<string, DiscoveredExternalSource>();
  const newEvidenceItems: EvidenceItem[] = [];
  const now = new Date().toISOString();

  // Helper to process candidate URLs
  const processCandidate = (
    rawUrl: string,
    originatingEvidenceId: string,
    originatingContext: string,
    rawSnippet?: string
  ) => {
    if (!rawUrl || !rawUrl.trim()) return;

    let cleanCandidate = rawUrl.trim().replace(/[.,;:)\]}>]+$/, '');
    if (!cleanCandidate.startsWith('http://') && !cleanCandidate.startsWith('https://')) {
      cleanCandidate = `https://${cleanCandidate}`;
    }

    const adapter = sourceRegistry.findAdapter(cleanCandidate);
    if (!adapter) return;

    const normalizedUrl = adapter.normalize(cleanCandidate);
    const dedupeKey = normalizedUrl.toLowerCase();

    if (discoveredMap.has(dedupeKey)) {
      // Already discovered - append evidence citation if not already present
      const existing = discoveredMap.get(dedupeKey)!;
      if (originatingEvidenceId && !existing.evidenceIds.includes(originatingEvidenceId)) {
        existing.evidenceIds.push(originatingEvidenceId);
      }
      return;
    }

    let domain = '';
    try {
      domain = new URL(normalizedUrl).hostname;
    } catch {
      return;
    }

    const metadata = adapter.parseMetadata(normalizedUrl, rawSnippet);
    const label = adapter.generateLabel(normalizedUrl, metadata);

    // Compute deterministic ID for this external source
    const hash = Math.abs(
      normalizedUrl.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(36);
    const sourceId = `ext-${canonicalId}-${hash}`;
    const evidenceId = `ev-${canonicalId}-ext-${hash}`;

    const sourceRecord: DiscoveredExternalSource = {
      id: sourceId,
      sourceType: adapter.type,
      url: cleanCandidate,
      normalizedUrl,
      domain,
      label,
      originatingEvidenceId: originatingEvidenceId || `ev-${canonicalId}-profile`,
      originatingContext,
      discoveredAt: now,
      factState: 'observed',
      evidenceIds: [evidenceId, ...(originatingEvidenceId ? [originatingEvidenceId] : [])],
      metadata,
    };

    // First-class atomic EvidenceItem backing this external source
    const evidenceRecord: EvidenceItem = {
      id: evidenceId,
      type: 'dom_text',
      factState: 'observed',
      rawText: rawSnippet
        ? rawSnippet.slice(0, 240)
        : `Discovered ${label}: ${normalizedUrl}`,
      confidence: 'high',
      provenance: {
        url: normalizedUrl,
        pageTitle: `${label} (${domain})`,
        capturedAt: now,
        contextSnippet: `Originating Evidence Citation: ${originatingEvidenceId} | Context: ${originatingContext}`,
      },
      extractedAt: now,
      annotation: `Discovered ${label} from ${originatingContext}`,
    };

    discoveredMap.set(dedupeKey, sourceRecord);
    newEvidenceItems.push(evidenceRecord);
  };

  // 1. Scan Activity Posts (Visible text and explicit link attachments)
  if (posts && posts.length > 0) {
    posts.forEach((post, pIdx) => {
      const originatingId = post.evidenceIds?.[0] || `ev-${canonicalId}-post-${pIdx}`;
      const contextDesc = `LinkedIn Activity Post (${post.category})`;

      // Explicit link attachments
      if (post.links && post.links.length > 0) {
        post.links.forEach((link) => {
          processCandidate(link, originatingId, contextDesc, post.visibleText);
        });
      }

      // Text body URL extraction
      if (post.visibleText) {
        const textMatches = post.visibleText.match(URL_REGEX) || [];
        const shorthandMatches = post.visibleText.match(SHORTHAND_REGEX) || [];
        const allCandidates = [...textMatches, ...shorthandMatches];

        allCandidates.forEach((cand) => {
          processCandidate(cand, originatingId, contextDesc, post.visibleText);
        });
      }
    });
  }

  // 2. Scan Projects (url and description)
  if (projects && projects.length > 0) {
    projects.forEach((proj, projIdx) => {
      const originatingId = proj.evidenceIds?.[0] || `ev-${canonicalId}-proj-${projIdx}`;
      const contextDesc = `Profile Project: ${proj.title}`;

      if (proj.url) {
        processCandidate(proj.url, originatingId, contextDesc, proj.description);
      }

      if (proj.description) {
        const textMatches = proj.description.match(URL_REGEX) || [];
        const shorthandMatches = proj.description.match(SHORTHAND_REGEX) || [];
        [...textMatches, ...shorthandMatches].forEach((cand) => {
          processCandidate(cand, originatingId, contextDesc, proj.description);
        });
      }
    });
  }

  // 3. Scan Certifications (credentialUrl)
  if (certifications && certifications.length > 0) {
    certifications.forEach((cert, cIdx) => {
      const originatingId = cert.evidenceIds?.[0] || `ev-${canonicalId}-cert-${cIdx}`;
      const contextDesc = `Certification: ${cert.name}`;

      if (cert.credentialUrl) {
        processCandidate(cert.credentialUrl, originatingId, contextDesc);
      }
    });
  }

  // 4. Scan About Summary
  if (aboutSummary && aboutSummary.trim()) {
    const originatingId = `ev-${canonicalId}-about`;
    const contextDesc = 'Profile About Section';
    const textMatches = aboutSummary.match(URL_REGEX) || [];
    const shorthandMatches = aboutSummary.match(SHORTHAND_REGEX) || [];
    [...textMatches, ...shorthandMatches].forEach((cand) => {
      processCandidate(cand, originatingId, contextDesc, aboutSummary);
    });
  }

  // 5. Scan Experience Descriptions
  if (experiences && experiences.length > 0) {
    experiences.forEach((exp, eIdx) => {
      const originatingId = exp.evidenceIds?.[0] || `ev-${canonicalId}-exp-${eIdx}`;
      const contextDesc = `Experience: ${exp.title} at ${exp.companyName}`;

      if (exp.companyUrl) {
        processCandidate(exp.companyUrl, originatingId, contextDesc);
      }

      if (exp.description) {
        const textMatches = exp.description.match(URL_REGEX) || [];
        const shorthandMatches = exp.description.match(SHORTHAND_REGEX) || [];
        [...textMatches, ...shorthandMatches].forEach((cand) => {
          processCandidate(cand, originatingId, contextDesc, exp.description);
        });
      }
    });
  }

  return {
    sources: Array.from(discoveredMap.values()),
    evidenceItems: newEvidenceItems,
  };
}
