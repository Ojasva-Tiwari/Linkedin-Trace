/**
 * TRACE - Extraction Types
 * Multi-surface raw extraction schema for visible profiles and evidence grounding.
 */

export interface RawExperienceItem {
  title: string;
  companyName: string;
  companyUrl?: string;
  dateRangeRaw?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawEducationItem {
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  dateRangeRaw?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawSkillItem {
  name: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawProjectItem {
  title: string;
  description?: string;
  url?: string;
  dateRangeRaw?: string;
  isHackathon?: boolean;
  isOpenSource?: boolean;
  domSelector?: string;
  snippet?: string;
}

export interface RawCertificationItem {
  name: string;
  issuingOrganization: string;
  dateRangeRaw?: string;
  credentialUrl?: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawAwardItem {
  title: string;
  issuer?: string;
  issueDate?: string;
  description?: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawLanguageItem {
  name: string;
  proficiency?: string;
  domSelector?: string;
  snippet?: string;
}

export interface RawActivityPostItem {
  id: string;
  postUrl?: string;
  postDateRaw?: string;
  visibleText: string;
  authorName?: string;
  hashtags: string[];
  links: string[];
  hasAttachment: boolean;
  domSelector?: string;
  rawText: string;
  sourcePageTitle?: string;
}

export interface ExtractedRawProfile {
  url: string;
  canonicalIdentifier: string; // e.g. "satyanadella"
  fullName: string;
  headline?: string;
  location?: string;
  aboutSummary?: string;
  currentRole?: string;
  avatarUrl?: string;
  
  experiences: RawExperienceItem[];
  education: RawEducationItem[];
  skills: RawSkillItem[];
  certifications: RawCertificationItem[];
  projects: RawProjectItem[];
  awards: RawAwardItem[];
  languages: RawLanguageItem[];
  posts: RawActivityPostItem[];

  /** Sections legitimately rendered in the page vs absent */
  sectionsRendered: {
    about: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    certifications: boolean;
    projects: boolean;
    awards: boolean;
    languages: boolean;
    activity: boolean;
  };

  extractedAt: string;
  sourceType: 'linkedin_dom' | 'linkedin_jsonld' | 'multi_surface';
  completeness: 'full' | 'partial' | 'header_only';
}

export type ExtractionStatus =
  | 'idle'
  | 'profile_detected'
  | 'analyzing'
  | 'ready'
  | 'partial'
  | 'error';

export interface ProfileDetectionResult {
  isProfile: boolean;
  canonicalIdentifier?: string;
  url?: string;
  fullName?: string;
  headline?: string;
}
