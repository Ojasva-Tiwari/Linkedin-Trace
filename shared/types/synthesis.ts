import { FactState } from './provenance';

/**
 * Category of a synthesized milestone.
 */
export type SynthesizedMilestoneCategory =
  | 'career'
  | 'education'
  | 'project'
  | 'hackathon'
  | 'opensource'
  | 'dsa'
  | 'certification'
  | 'milestone';

/**
 * A single evidence-grounded milestone in the candidate's career progression.
 */
export interface SynthesizedMilestone {
  id: string;
  year?: number;
  dateOrPeriod: string; // approximate date or period established by evidence
  title: string;
  category: SynthesizedMilestoneCategory;
  explanation: string; // concise grounded explanation of the milestone
  factState: FactState; // strictly 'observed' | 'inferred' | 'unknown'
  evidenceIds: string[]; // supporting atomic evidence IDs
  sourceLinks?: string[]; // direct source URLs (e.g. GitHub repo, post URL)
  isTransition?: boolean; // indicates an inferred transition between stages
}

/**
 * Milestones grouped chronologically by calendar year or period.
 */
export interface YearJourneyGroup {
  year: number | string;
  periodLabel: string; // e.g. "2024" or "2021–2023"
  milestones: SynthesizedMilestone[];
  hasChronologyGap?: boolean;
  gapNote?: string;
}

/**
 * Concrete preparation activity visible in the evidence.
 * Answers: "What concrete activities are visible in the evidence?"
 * Strictly NO effort score, NO trajectory percentage.
 */
export interface ConcreteActivity {
  id: string;
  title: string;
  detail: string;
  evidenceIds: string[];
  factState: FactState;
  sourceUrl?: string;
  date?: string;
}

/**
 * Preparation category grouping concrete activities.
 */
export interface PreparationCategory {
  id: string;
  name: string; // e.g. "DSA & Problem Solving", "Project Building", "Open Source", "Internships", "Competitions"
  description: string;
  activities: ConcreteActivity[];
  totalObservedActivities: number;
}

/**
 * Full preparation analysis derived from collected evidence.
 */
export interface PreparationAnalysis {
  categories: PreparationCategory[];
  totalEvidenceCount: number;
  summaryNote: string;
}

/**
 * Evidence-derived skill group.
 * Strictly NO 0–100% proficiencies, NO stars, NO fake skill scores.
 */
export interface SkillSynthesisGroup {
  skillName: string;
  category?: string;
  factState: FactState; // 'observed' if directly listed/observed; 'inferred' if demonstrated across responsibilities
  supportingEvidenceIds: string[];
  supportingSources: string[];
  demonstratedContexts: string[]; // e.g. ["Observed in LinkedIn skills", "GitHub repository codebase", "Project description"]
}

/**
 * Three explicit conceptual sections forming the epistemic triad.
 */
export interface EpistemicSummary {
  observed: Array<{
    id: string;
    statement: string;
    evidenceIds: string[];
    sources: string[];
  }>;
  inferred: Array<{
    id: string;
    statement: string;
    rationale: string;
    evidenceIds: string[];
  }>;
  unknown: Array<{
    id: string;
    gap: string;
    whyUnknown: string;
  }>;
}

/**
 * Full canonical career journey synthesis result.
 */
export interface CareerJourneySynthesis {
  profileId: string;
  synthesisVersion: string;
  inputHash: string; // deterministic hash of evidence items to enable smart cache reuse
  synthesizedAt: string;
  providerUsed: string;
  status: 'ready' | 'partial' | 'error';
  headlineSummary: string;
  milestones: SynthesizedMilestone[];
  yearByYear: YearJourneyGroup[];
  preparation: PreparationAnalysis;
  skills: SkillSynthesisGroup[];
  epistemicSummary: EpistemicSummary;
  causalityNotes: string[]; // explicit disclaimers confirming temporal correlation rather than ungrounded causation
  error?: string;
}
