import {
  EvidenceItem,
  MyPathComparison,
  RawCapturePackage,
  TimelineEvent,
  TraceProfile,
} from '@shared/index';

/**
 * Options passed to AI extraction requests.
 */
export interface ExtractionOptions {
  modelName?: string;
  temperature?: number;
  strictGrounding?: boolean; // Ensure every extracted item maps to raw evidence
}

/**
 * Supported provider types.
 */
export type AIProviderType =
  | 'stub'
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'local'
  | 'chrome-prompt';

/**
 * Common configuration for AI providers.
 * Stored locally in chrome.storage / memory, never committed to repository.
 */
export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  endpointUrl?: string;
  modelName?: string;
}

/**
 * Core interface that all AI inference engines in TRACE must implement.
 * Guarantees that neither UI nor business logic is coupled to a specific cloud or model.
 */
export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: AIProviderType;

  /**
   * Check if credentials or local model endpoints are ready.
   */
  isConfigured(): Promise<boolean>;

  /**
   * Parse a raw user-captured DOM/text package into atomic EvidenceItems.
   * Grounded extraction: only captures facts that exist in the source.
   */
  extractEvidence(
    rawCapture: RawCapturePackage,
    options?: ExtractionOptions
  ): Promise<EvidenceItem[]>;

  /**
   * Structure evidence into a canonical TraceProfile.
   * Distinguishes observed facts from inferred classifications.
   */
  structureProfile(
    evidence: EvidenceItem[],
    baseInfo: { url: string; capturedAt: string }
  ): Promise<TraceProfile>;

  /**
   * Synthesize timeline projections and milestone views over the profile data.
   */
  generateTimeline(profile: TraceProfile): Promise<TimelineEvent[]>;

  /**
   * Generate qualitative trajectory comparison for My Path.
   * STRICT PRINCIPLE: Must not invent fake readiness scores.
   */
  generatePathComparison(
    userProfile: TraceProfile,
    benchmarkProfiles: TraceProfile[],
    researchSetId: string
  ): Promise<MyPathComparison>;
}

/**
 * StubAIProvider for development, unit testing, and offline use.
 * Returns safe mock data without making network requests or requiring API keys.
 */
export class StubAIProvider implements AIProvider {
  readonly id = 'stub-provider';
  readonly name = 'Stub / Offline Provider';
  readonly type: AIProviderType = 'stub';

  async isConfigured(): Promise<boolean> {
    return true;
  }

  async extractEvidence(
    rawCapture: RawCapturePackage,
    _options?: ExtractionOptions
  ): Promise<EvidenceItem[]> {
    // Stub implementation returning an observed evidence item
    return [
      {
        id: `ev-${Date.now()}-1`,
        type: 'dom_text',
        factState: 'observed',
        rawText: `Captured page content from ${rawCapture.url}`,
        provenance: {
          url: rawCapture.url,
          pageTitle: rawCapture.pageTitle,
          capturedAt: rawCapture.capturedAt,
          contextSnippet: rawCapture.sanitizedDomText.slice(0, 150),
        },
        extractedAt: new Date().toISOString(),
        confidence: 'high',
        annotation: 'Placeholder extraction by StubAIProvider',
      },
    ];
  }

  async structureProfile(
    evidence: EvidenceItem[],
    baseInfo: { url: string; capturedAt: string }
  ): Promise<TraceProfile> {
    return {
      id: `profile-${Date.now()}`,
      sourceUrl: baseInfo.url,
      fullName: 'Observed Profile (Stub)',
      headline: 'Candidate / Professional',
      capturedAt: baseInfo.capturedAt,
      updatedAt: new Date().toISOString(),
      experiences: [],
      education: [],
      skills: [],
      certifications: [],
      publications: [],
      evidenceIds: evidence.map((e) => e.id),
      metadata: {
        extractionVersion: '0.1.0-stub',
        totalEvidenceCount: evidence.length,
        notes: 'Initial stub profile created by StubAIProvider',
      },
    };
  }

  async generateTimeline(_profile: TraceProfile): Promise<TimelineEvent[]> {
    return [];
  }

  async generatePathComparison(
    userProfile: TraceProfile,
    _benchmarkProfiles: TraceProfile[],
    researchSetId: string
  ): Promise<MyPathComparison> {
    return {
      id: `comparison-${Date.now()}`,
      userProfileId: userProfile.id,
      targetResearchSetId: researchSetId,
      comparedAt: new Date().toISOString(),
      comparisonPoints: [],
      actionItems: [],
      qualitativeSummary: {
        strengths: ['Initial profile established'],
        potentialGaps: ['Benchmark cohort data pending collection'],
        inferredOpportunities: ['Expand research cohort in Research tab'],
        confidence: 'low',
      },
    };
  }
}
