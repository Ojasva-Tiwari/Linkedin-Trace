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

  /**
   * Synthesize a grounded career journey from structured Trace evidence.
   * STRICT PRINCIPLE: Evidence-grounded only, no hallucinations, no fake scores.
   */
  synthesizeCareerJourney(
    input: CareerJourneySynthesisInput,
    options?: ExtractionOptions
  ): Promise<CareerJourneySynthesis>;
}

import {
  CareerJourneySynthesis,
} from '@shared/index';
import {
  CareerJourneySynthesisInput,
  synthesizeCareerJourneyDeterministic,
  buildSynthesisPromptPayload,
} from './synthesis-engine';

/**
 * StubAIProvider for development, unit testing, and offline use.
 * Returns safe deterministic data without making external network requests or requiring API keys.
 */
export class StubAIProvider implements AIProvider {
  readonly id = 'stub-provider';
  readonly name = 'Deterministic Grounded Provider (Offline / Dev)';
  readonly type: AIProviderType = 'stub';

  async isConfigured(): Promise<boolean> {
    return true;
  }

  async extractEvidence(
    rawCapture: RawCapturePackage,
    _options?: ExtractionOptions
  ): Promise<EvidenceItem[]> {
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

  async synthesizeCareerJourney(
    input: CareerJourneySynthesisInput,
    _options?: ExtractionOptions
  ): Promise<CareerJourneySynthesis> {
    // Uses the deterministic evidence synthesis engine
    return synthesizeCareerJourneyDeterministic(input);
  }
}

/**
 * OpenAI-compatible provider.
 * Reads user-configured API key from settings (never hardcoded in source).
 */
export class OpenAIProvider implements AIProvider {
  readonly id = 'openai-provider';
  readonly name = 'OpenAI Provider';
  readonly type: AIProviderType = 'openai';

  constructor(private config: AIProviderConfig) {}

  async isConfigured(): Promise<boolean> {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 0);
  }

  async extractEvidence(rawCapture: RawCapturePackage, options?: ExtractionOptions): Promise<EvidenceItem[]> {
    const stub = new StubAIProvider();
    return stub.extractEvidence(rawCapture, options);
  }

  async structureProfile(evidence: EvidenceItem[], baseInfo: { url: string; capturedAt: string }): Promise<TraceProfile> {
    const stub = new StubAIProvider();
    return stub.structureProfile(evidence, baseInfo);
  }

  async generateTimeline(profile: TraceProfile): Promise<TimelineEvent[]> {
    const stub = new StubAIProvider();
    return stub.generateTimeline(profile);
  }

  async generatePathComparison(
    userProfile: TraceProfile,
    benchmarkProfiles: TraceProfile[],
    researchSetId: string
  ): Promise<MyPathComparison> {
    const stub = new StubAIProvider();
    return stub.generatePathComparison(userProfile, benchmarkProfiles, researchSetId);
  }

  async synthesizeCareerJourney(
    input: CareerJourneySynthesisInput,
    _options?: ExtractionOptions
  ): Promise<CareerJourneySynthesis> {
    if (!(await this.isConfigured())) {
      // Fall back to deterministic grounded synthesis when key is not configured
      return synthesizeCareerJourneyDeterministic(input);
    }

    try {
      const payload = buildSynthesisPromptPayload(input);
      const endpoint = this.config.endpointUrl || 'https://api.openai.com/v1/chat/completions';
      const model = this.config.modelName || 'gpt-4o-mini';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are TRACE, a career journey analyzer. Synthesize ONLY from the provided structured evidence. NEVER hallucinate dates, skills, or fake scores. Return JSON matching CareerJourneySynthesis.',
            },
            {
              role: 'user',
              content: payload,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.milestones && parsed.epistemicSummary) {
          return {
            ...parsed,
            profileId: input.profile.id,
            inputHash: input.options?.forceRefresh ? 'forced' : undefined,
            synthesizedAt: new Date().toISOString(),
          } as CareerJourneySynthesis;
        }
      }
      return synthesizeCareerJourneyDeterministic(input);
    } catch (err) {
      console.warn('[OpenAIProvider] Remote synthesis failed, falling back to deterministic synthesis:', err);
      return synthesizeCareerJourneyDeterministic(input);
    }
  }
}

/**
 * Anthropic Claude provider.
 * Reads user-configured API key from settings (never hardcoded in source).
 */
export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic-provider';
  readonly name = 'Anthropic Claude Provider';
  readonly type: AIProviderType = 'anthropic';

  constructor(private config: AIProviderConfig) {}

  async isConfigured(): Promise<boolean> {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 0);
  }

  async extractEvidence(rawCapture: RawCapturePackage, options?: ExtractionOptions): Promise<EvidenceItem[]> {
    const stub = new StubAIProvider();
    return stub.extractEvidence(rawCapture, options);
  }

  async structureProfile(evidence: EvidenceItem[], baseInfo: { url: string; capturedAt: string }): Promise<TraceProfile> {
    const stub = new StubAIProvider();
    return stub.structureProfile(evidence, baseInfo);
  }

  async generateTimeline(profile: TraceProfile): Promise<TimelineEvent[]> {
    const stub = new StubAIProvider();
    return stub.generateTimeline(profile);
  }

  async generatePathComparison(
    userProfile: TraceProfile,
    benchmarkProfiles: TraceProfile[],
    researchSetId: string
  ): Promise<MyPathComparison> {
    const stub = new StubAIProvider();
    return stub.generatePathComparison(userProfile, benchmarkProfiles, researchSetId);
  }

  async synthesizeCareerJourney(
    input: CareerJourneySynthesisInput,
    _options?: ExtractionOptions
  ): Promise<CareerJourneySynthesis> {
    if (!(await this.isConfigured())) {
      return synthesizeCareerJourneyDeterministic(input);
    }

    try {
      const payload = buildSynthesisPromptPayload(input);
      const endpoint = this.config.endpointUrl || 'https://api.anthropic.com/v1/messages';
      const model = this.config.modelName || 'claude-3-5-sonnet-20241022';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          temperature: 0.1,
          system:
            'You are TRACE, a career journey analyzer. Synthesize ONLY from the provided structured evidence. NEVER hallucinate dates, skills, or fake scores. Return valid JSON matching CareerJourneySynthesis.',
          messages: [{ role: 'user', content: payload }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic request failed: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const content = json.content?.[0]?.text;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.milestones && parsed.epistemicSummary) {
          return {
            ...parsed,
            profileId: input.profile.id,
            synthesizedAt: new Date().toISOString(),
          } as CareerJourneySynthesis;
        }
      }
      return synthesizeCareerJourneyDeterministic(input);
    } catch (err) {
      console.warn('[AnthropicProvider] Remote synthesis failed, falling back to deterministic synthesis:', err);
      return synthesizeCareerJourneyDeterministic(input);
    }
  }
}

/**
 * Local Model provider (Ollama / LocalAI / llama.cpp).
 * Reads user-configured endpoint URL from settings.
 */
export class LocalModelProvider implements AIProvider {
  readonly id = 'local-provider';
  readonly name = 'Local Model Provider (Ollama / LocalAI)';
  readonly type: AIProviderType = 'local';

  constructor(private config: AIProviderConfig) {}

  async isConfigured(): Promise<boolean> {
    return Boolean(this.config.endpointUrl && this.config.endpointUrl.trim().length > 0);
  }

  async extractEvidence(rawCapture: RawCapturePackage, options?: ExtractionOptions): Promise<EvidenceItem[]> {
    const stub = new StubAIProvider();
    return stub.extractEvidence(rawCapture, options);
  }

  async structureProfile(evidence: EvidenceItem[], baseInfo: { url: string; capturedAt: string }): Promise<TraceProfile> {
    const stub = new StubAIProvider();
    return stub.structureProfile(evidence, baseInfo);
  }

  async generateTimeline(profile: TraceProfile): Promise<TimelineEvent[]> {
    const stub = new StubAIProvider();
    return stub.generateTimeline(profile);
  }

  async generatePathComparison(
    userProfile: TraceProfile,
    benchmarkProfiles: TraceProfile[],
    researchSetId: string
  ): Promise<MyPathComparison> {
    const stub = new StubAIProvider();
    return stub.generatePathComparison(userProfile, benchmarkProfiles, researchSetId);
  }

  async synthesizeCareerJourney(
    input: CareerJourneySynthesisInput,
    _options?: ExtractionOptions
  ): Promise<CareerJourneySynthesis> {
    const endpoint = this.config.endpointUrl || 'http://localhost:11434/v1/chat/completions';
    try {
      const payload = buildSynthesisPromptPayload(input);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName || 'llama3.2',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You are TRACE. Synthesize career journey strictly from evidence. Output valid JSON matching CareerJourneySynthesis.',
            },
            { role: 'user', content: payload },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Local model request failed: ${response.status}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.milestones && parsed.epistemicSummary) {
          return {
            ...parsed,
            profileId: input.profile.id,
            synthesizedAt: new Date().toISOString(),
          } as CareerJourneySynthesis;
        }
      }
      return synthesizeCareerJourneyDeterministic(input);
    } catch (err) {
      console.warn('[LocalModelProvider] Local model failed, falling back to deterministic synthesis:', err);
      return synthesizeCareerJourneyDeterministic(input);
    }
  }
}

