/**
 * TRACE - Pluggable Evidence Collector Surface Architecture (Phase 6)
 * 
 * Provides an extensible registry for multi-surface automatic evidence collection.
 * Designed to cleanly accommodate future automated collectors (LinkedIn Activity, GitHub,
 * Public Projects, Resumes, etc.) without mutating core domain models.
 */

import { ExtractedRawProfile } from './types';
import { EvidenceItem } from '@shared/index';

export type SurfaceType =
  | 'linkedin_profile'
  | 'linkedin_activity'
  | 'github_profile'
  | 'github_repo'
  | 'devpost_project'
  | 'leetcode_profile'
  | 'public_project'
  | 'resume_document'
  | 'external_artifact';

export interface SurfaceContext {
  url: string;
  document?: Document;
  tabId?: number;
  extractedAt?: string;
  authContext?: {
    isPublic: boolean;
    hasSession: boolean;
  };
}

export interface SurfaceCollectorResult {
  surfaceId: string;
  surfaceType: SurfaceType;
  success: boolean;
  rawProfile?: ExtractedRawProfile;
  additionalEvidence?: EvidenceItem[];
  observedSections: string[];
  unrenderedSections: string[];
  notes?: string;
  error?: string;
}

export interface EvidenceCollectorSurface {
  readonly id: string;
  readonly name: string;
  readonly surfaceType: SurfaceType;
  readonly version: string;

  /**
   * Evaluates if this collector can legitimately extract evidence from the given context.
   */
  canHandle(context: SurfaceContext): boolean;

  /**
   * Executes automatic passive collection from the target surface.
   */
  collect(context: SurfaceContext): Promise<SurfaceCollectorResult>;
}

/**
 * Singleton Surface Registry to register, discover, and dispatch evidence collection surfaces.
 */
class EvidenceSurfaceRegistry {
  private collectors: Map<string, EvidenceCollectorSurface> = new Map();

  register(collector: EvidenceCollectorSurface): void {
    this.collectors.set(collector.id, collector);
  }

  unregister(collectorId: string): boolean {
    return this.collectors.delete(collectorId);
  }

  getCollector(context: SurfaceContext): EvidenceCollectorSurface | undefined {
    for (const collector of this.collectors.values()) {
      if (collector.canHandle(context)) {
        return collector;
      }
    }
    return undefined;
  }

  listCollectors(): Array<{ id: string; name: string; surfaceType: SurfaceType; version: string }> {
    return Array.from(this.collectors.values()).map((c) => ({
      id: c.id,
      name: c.name,
      surfaceType: c.surfaceType,
      version: c.version,
    }));
  }
}

export const surfaceRegistry = new EvidenceSurfaceRegistry();
