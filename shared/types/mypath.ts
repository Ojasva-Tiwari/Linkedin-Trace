import { FactState, QualitativeConfidence } from './provenance';

/**
 * Qualitative comparison point between the user's profile and benchmark/target profiles.
 */
export interface TrajectoryComparisonPoint {
  dimension: 'experience_depth' | 'skill_coverage' | 'transition_velocity' | 'education_foundation';
  userObservedFact: string;
  benchmarkPattern: string;
  status: 'aligned' | 'developing' | 'divergent' | 'unobserved';
  factState: FactState;
  evidenceIds: string[];
  qualitativeNotes: string;
}

/**
 * Skill preparation / readiness item grounded in concrete evidence.
 * STRICT PRINCIPLE: No fake readiness percentage score (e.g. "87% ready").
 */
export interface PreparationActionItem {
  id: string;
  skillOrCapability: string;
  currentStatus: 'demonstrated' | 'adjacent' | 'unverified';
  evidenceIds: string[];
  concreteRecommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * MyPathComparison aggregates the user's profile comparison against a target ResearchSet.
 */
export interface MyPathComparison {
  id: string;
  userProfileId: string;
  targetResearchSetId: string;
  comparedAt: string;
  comparisonPoints: TrajectoryComparisonPoint[];
  actionItems: PreparationActionItem[];
  qualitativeSummary: {
    strengths: string[];
    potentialGaps: string[];
    inferredOpportunities: string[];
    confidence: QualitativeConfidence;
  };
}
