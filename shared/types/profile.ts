import { FactState, QualitativeConfidence } from './provenance';

/**
 * Standard date range representation for career and academic milestones.
 */
export interface DateRange {
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  rawString?: string;
}

/**
 * Single professional experience entry.
 */
export interface TraceExperience {
  id: string;
  title: string;
  companyName: string;
  companyUrl?: string;
  location?: string;
  dateRange: DateRange;
  description?: string;
  factState: FactState;
  evidenceIds: string[];
  skillsMentioned: string[];
}

/**
 * Education entry.
 */
export interface TraceEducation {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  dateRange: DateRange;
  activities?: string;
  description?: string;
  factState: FactState;
  evidenceIds: string[];
}

/**
 * Skill entry.
 * STRICT PRINCIPLE: No fake skill scores (e.g., "95% proficiency").
 * Skills are documented as observed in source or inferred from role responsibilities.
 */
export interface TraceSkill {
  id: string;
  name: string;
  category?: string;
  factState: FactState;
  /** Experience or education IDs where this skill was demonstrated or mentioned */
  associatedItemIds: string[];
  evidenceIds: string[];
  qualitativeAssessment?: {
    confidence: QualitativeConfidence;
    context: string;
  };
}

/**
 * Certification entry.
 */
export interface TraceCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  factState: FactState;
  evidenceIds: string[];
}

/**
 * Publication entry.
 */
export interface TracePublication {
  id: string;
  title: string;
  publisher?: string;
  publicationDate?: string;
  url?: string;
  description?: string;
  evidenceIds: string[];
}

/**
 * Project entry (e.g. engineering artifacts, hackathons, open-source).
 */
export interface TraceProject {
  id: string;
  title: string;
  description?: string;
  url?: string;
  dateRange?: DateRange;
  isHackathon?: boolean;
  isOpenSource?: boolean;
  factState: FactState;
  evidenceIds: string[];
}

/**
 * Honors and awards entry.
 */
export interface TraceAward {
  id: string;
  title: string;
  issuer?: string;
  issueDate?: string;
  description?: string;
  factState: FactState;
  evidenceIds: string[];
}

/**
 * Language entry.
 */
export interface TraceLanguage {
  id: string;
  name: string;
  proficiency?: string;
  factState: FactState;
  evidenceIds: string[];
}

/**
 * Legitimate grounded activity post categories.
 */
export type PostCategory =
  | 'project'
  | 'internship'
  | 'job/career update'
  | 'hackathon/competition'
  | 'DSA/problem solving'
  | 'certification/course'
  | 'achievement/award'
  | 'open source'
  | 'technical learning'
  | 'other/unclassified';

/**
 * Grounded activity post extracted from LinkedIn Activity surface.
 */
export interface TracePost {
  id: string;
  postUrl?: string;
  postDate?: string;
  visibleText: string;
  authorName?: string;
  category: PostCategory;
  hashtags: string[];
  links: string[];
  hasAttachment: boolean;
  factState: FactState;
  evidenceIds: string[];
  linkedTimelineEventId?: string;
  domSelector?: string;
  extractedAt: string;
}

/**
 * External source types discovered from candidate profile and activity evidence.
 */
export type ExternalSourceType =
  | 'github'
  | 'portfolio'
  | 'devpost'
  | 'leetcode'
  | 'certification'
  | 'document'
  | 'other';

/**
 * First-class external source discovered automatically from existing evidence.
 */
export interface DiscoveredExternalSource {
  id: string;
  sourceType: ExternalSourceType;
  url: string;
  normalizedUrl: string;
  domain: string;
  label: string;
  originatingEvidenceId: string;
  originatingContext: string;
  discoveredAt: string;
  factState: FactState;
  evidenceIds: string[];
  metadata?: {
    title?: string;
    description?: string;
    authorOrOwner?: string;
    platformSpecific?: Record<string, any>;
  };
}

/**
 * Decomposable metric counts strictly backed by stored atomic evidence records.
 */
export interface DecomposedMetrics {
  internships: number;
  projects: number;
  hackathons: number;
  opensource: number;
}

/**
 * Missing-data semantics: distinguishes directly observed from legitimately absent/unrendered sections.
 */
export type SectionEpistemicStatus = 'observed' | 'not_rendered' | 'not_yet_analyzed';

/**
 * Canonical TraceProfile schema.
 * Represents exactly ONE individual's professional trajectory.
 */
export interface TraceProfile {
  id: string;
  sourceUrl: string;
  fullName: string;
  headline?: string;
  location?: string;
  aboutSummary?: string;
  capturedAt: string;
  updatedAt: string;
  
  experiences: TraceExperience[];
  education: TraceEducation[];
  skills: TraceSkill[];
  certifications: TraceCertification[];
  publications: TracePublication[];
  projects?: TraceProject[];
  awards?: TraceAward[];
  languages?: TraceLanguage[];
  posts?: TracePost[];
  externalSources?: DiscoveredExternalSource[];

  /** Decomposable metrics strictly derived from stored evidence records */
  decomposedMetrics?: DecomposedMetrics;

  /** Missing-data semantics: Section status without fabricating unknown facts */
  sectionCoverage?: Record<string, SectionEpistemicStatus>;

  /** All atomic pieces of evidence captured for this profile */
  evidenceIds: string[];

  /** High-level profile metadata */
  metadata: {
    extractionVersion: string;
    totalEvidenceCount: number;
    notes?: string;
  };
}
