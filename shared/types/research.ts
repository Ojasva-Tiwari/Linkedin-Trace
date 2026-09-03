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
