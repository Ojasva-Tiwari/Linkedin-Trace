import { FactState } from './provenance';

/**
 * Reference to a profile included in a research set.
 */
export interface ResearchProfileRef {
  profileId: string;
  fullName: string;
  headline?: string;
  addedAt: string;
  tags: string[];
  notes?: string;
}

/**
 * Comparison criteria or filters used for analyzing a group of profiles in Research.
 */
export interface ResearchCriteria {
  targetRoles: string[];
  targetCompanies: string[];
  keySkills: string[];
  experienceLevel?: string;
}

/**
 * ResearchSet represents a collection of multiple explicitly saved profiles grouped for cohort analysis.
 */
export interface ResearchSet {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  criteria?: ResearchCriteria;
  profileRefs: ResearchProfileRef[];
  tags: string[];
  notes?: string;
}

/**
 * Grounded summary of a single profile within a cohort comparison.
 * Every count is strictly derived from stored records.
 */
export interface ResearchProfileComparisonSummary {
  profileId: string;
  fullName: string;
  headline?: string;
  currentRole?: string;
  educationSummary?: string;
  milestoneCount: number;
  internshipCount: number;
  projectCount: number;
  hackathonCount: number;
  openSourceCount: number;
  dsaProblemCount?: number;
  observedSkills: string[];
  evidenceCount: number;
  sourceCount: number;
  evidenceIds: string[];
}

/**
 * A cross-profile pattern identified across selected profiles in a ResearchSet.
 * STRICT PRINCIPLE: Never claims causality. Clearly tags observed vs inferred.
 */
export interface CohortPattern {
  id: string;
  dimension: 'projects' | 'internships' | 'opensource' | 'hackathons' | 'dsa' | 'skills' | 'education';
  title: string;
  observation: string; // e.g. "Observed in 3 of 4 selected profiles"
  factState: FactState; // 'observed' | 'inferred' | 'unknown'
  supportingProfileIds: string[];
  supportingProfileNames: string[];
  evidenceIds: string[];
  rationale?: string;
}

/**
 * Complete cross-profile comparison produced from an active ResearchSet.
 */
export interface CohortComparison {
  researchSetId: string;
  researchSetTitle: string;
  comparedAt: string;
  profileSummaries: ResearchProfileComparisonSummary[];
  patterns: CohortPattern[];
  aggregateMetrics: {
    totalProfiles: number;
    profilesWithInternships: number;
    profilesWithProjects: number;
    profilesWithOpenSource: number;
    profilesWithHackathons: number;
    profilesWithDSA: number;
    topSkills: { skill: string; count: number; profileCount: number }[];
  };
  epistemicDemarcation: {
    observedCount: number;
    inferredCount: number;
    unknownCount: number;
  };
}
