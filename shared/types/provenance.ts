/**
 * Epistemic status of a piece of data or claim in TRACE.
 *
 * - OBSERVED: Directly present in the user-captured source page (DOM, text, structured metadata).
 * - INFERRED: Derived or synthesized through reasoning/AI; must contain an explanation or chain of logic.
 * - UNKNOWN: Explicitly missing, unconfirmed, or conflicting in the source material.
 */
export type FactState = 'observed' | 'inferred' | 'unknown';

/**
 * Qualitative confidence level.
 * STRICT PRINCIPLE: TRACE rejects fabricated percentages (e.g. "97.4% match") and fake skill scores (e.g. "Python: 89/100").
 * Confidence is represented qualitatively alongside verifiable justification.
 */
export type QualitativeConfidence = 'high' | 'medium' | 'low';

/**
 * Epistemic confidence and grounding metadata.
 */
export interface GroundingMetadata {
  factState: FactState;
  confidence: QualitativeConfidence;
  rationale?: string;
  sourceUrl?: string;
  capturedAt: string;
}

/**
 * Physical provenance of a raw piece of evidence from the page.
 */
export interface ProvenanceSource {
  url: string;
  pageTitle?: string;
  capturedAt: string;
  domSelector?: string;
  xpath?: string;
  contextSnippet?: string;
  sourceHash?: string;
}
