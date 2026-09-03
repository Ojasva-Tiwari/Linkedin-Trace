import { FactState } from './provenance';

/**
 * Categories of timeline events.
 */
export type TimelineCategory =
  | 'career'
  | 'education'
  | 'certification'
  | 'publication'
  | 'milestone';

/**
 * TimelineEvent is a structured projection/view over the canonical profile data.
 * It provides chronological ordering and milestone analysis without duplicating or mutating raw facts.
 */
export interface TimelineEvent {
  id: string;
  sourceItemId: string; // references TraceExperience, TraceEducation, or TraceCertification id
  category: TimelineCategory;
  title: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  factState: FactState;
  evidenceIds: string[];
  inferredMilestones?: string[];
}

/**
 * Summary view over a candidate or professional profile trajectory.
 */
export interface TrajectorySummaryView {
  profileId: string;
  totalYearsExperienceEstimated?: number;
  domainTenure: Array<{ domain: string; estimatedDuration: string }>;
  keyTransitions: Array<{
    fromRole: string;
    toRole: string;
    date: string;
    factState: FactState;
  }>;
}
