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

  /** All atomic pieces of evidence captured for this profile */
  evidenceIds: string[];

  /** High-level profile metadata */
  metadata: {
    extractionVersion: string;
    totalEvidenceCount: number;
    notes?: string;
  };
}
