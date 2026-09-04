import { FactState, QualitativeConfidence } from './provenance';

/**
 * User's own self-curated education record in My Path.
 */
export interface UserPathEducation {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * User's own self-curated experience / internship record in My Path.
 */
export interface UserPathExperience {
  id: string;
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isInternship?: boolean;
}

/**
 * User's own project record in My Path.
 */
export interface UserPathProject {
  id: string;
  title: string;
  description?: string;
  technologies: string[];
  url?: string;
  date?: string;
  isOpenSource?: boolean;
  isHackathon?: boolean;
}

/**
 * User's own hackathon / competition participation.
 */
export interface UserPathHackathon {
  id: string;
  name: string;
  projectTitle?: string;
  date?: string;
  award?: string;
}

/**
 * User's own open source contributions.
 */
export interface UserPathOpenSource {
  id: string;
  repoName: string;
  contributionSummary: string;
  url?: string;
}

/**
 * User's DSA / problem-solving metrics.
 */
export interface UserPathDSA {
  problemCount?: number;
  platform?: string; // e.g. "LeetCode", "Codeforces"
  contestRating?: string;
  verifiedUrl?: string;
}

/**
 * User's certifications.
 */
export interface UserPathCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  url?: string;
}

/**
 * Complete self-curated user trajectory model for My Path.
 * STRICT PRINCIPLE: Distinct from candidate profiles.
 * The only place where manual input is intentional.
 */
export interface UserPathJourney {
  id: string; // Typically 'user-my-path'
  fullName: string;
  targetRole?: string;
  currentStage: 'student' | 'early_career' | 'transitioning' | 'experienced';
  education: UserPathEducation[];
  experiences: UserPathExperience[];
  projects: UserPathProject[];
  hackathons: UserPathHackathon[];
  openSource: UserPathOpenSource[];
  dsa: UserPathDSA;
  skills: string[];
  certifications: UserPathCertification[];
  notes: string;
  updatedAt: string;
}

/**
 * Single descriptive comparison dimension between User Path and Researched Cohort.
 * STRICT PRINCIPLE: Strictly descriptive, zero fake percentages/scores.
 */
export interface MyPathDescriptiveDimension {
  id: string;
  dimension: 'projects' | 'internships' | 'opensource' | 'hackathons' | 'dsa' | 'skills' | 'education';
  label: string;
  cohortObservation: string; // e.g. "3 of 3 researched profiles show substantial project work before their first internship"
  userPathStatus: string; // e.g. "Your current path has 1 documented project"
  factState: FactState;
  supportingProfileNames: string[];
  evidenceIds: string[];
}

/**
 * Descriptive gap identified between user path and cohort precedents.
 * Never prescribes guaranteed outcomes.
 */
export interface MyPathDescriptiveGap {
  id: string;
  dimension: string;
  observedDifference: string;
  cohortPrecedent: string;
  userCurrentState: string;
}

/**
 * Non-prescriptive recommendation grounded in observed research patterns.
 * Phrased as "Consider...", "Commonly observed...", never "Do X to succeed".
 */
export interface MyPathRecommendation {
  id: string;
  dimension: string;
  title: string;
  recommendation: string; // e.g. "Consider building a multi-service or distributed systems project..."
  precedentSummary: string; // e.g. "Observed in 3 of 4 selected cohort profiles before entering enterprise engineering."
  factState: FactState;
  supportingProfileNames: string[];
  evidenceIds?: string[];
}

/**
 * Full descriptive comparison result between User Path and Research Cohort.
 */
export interface MyPathDescriptiveComparison {
  id: string;
  comparedAt: string;
  researchSetId: string;
  researchSetTitle: string;
  cohortSize: number;
  dimensions: MyPathDescriptiveDimension[];
  gaps: MyPathDescriptiveGap[];
  recommendations: MyPathRecommendation[];
}

/**
 * Legacy / Structured comparison point (retained for backward compatibility).
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

export interface PreparationActionItem {
  id: string;
  skillOrCapability: string;
  currentStatus: 'demonstrated' | 'adjacent' | 'unverified';
  evidenceIds: string[];
  concreteRecommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

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

