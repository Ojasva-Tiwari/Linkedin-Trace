import { FactState, ProvenanceSource, QualitativeConfidence } from './provenance';

/**
 * Types of evidence that can be extracted or referenced.
 */
export type EvidenceType =
  | 'dom_text'
  | 'dom_attribute'
  | 'structured_json_ld'
  | 'user_note'
  | 'inferred_derivation';

/**
 * EvidenceItem represents an immutable, first-class atomic piece of proof in TRACE.
 * Every profile attribute, timeline event, and skill claims link to one or more EvidenceItems.
 */
export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  factState: FactState;
  rawText: string;
  provenance: ProvenanceSource;
  extractedAt: string;
  confidence: QualitativeConfidence;
  /** Notes on how this evidence was extracted or why it was classified as observed/inferred */
  annotation?: string;
}

/**
 * Reference to an evidence item with optional specific sub-field grounding.
 */
export interface EvidenceRef {
  evidenceId: string;
  field?: string;
  quote?: string;
}
