/**
 * TRACE - Profile Normalizer (Phase 2 & Phase 5)
 * Converts raw extracted DOM records into canonical TraceProfile, EvidenceItems, and TimelineEvents.
 * 
 * Strict Principles:
 * 1. Evidence-first: Every extracted field links to an immutable EvidenceItem.
 * 2. FactState = 'observed': Extraction layer NEVER infers; all visible facts are strictly 'observed'.
 * 3. No fake metrics: All counts strictly decompose to actual stored records.
 * 4. Grounded chronology: Uses actual dates when available; does NOT invent dates or years.
 * 5. Missing-data semantics: Distinguishes observed from legitimately absent/unrendered sections.
 */

import {
  TraceProfile,
  TraceExperience,
  TraceEducation,
  TraceSkill,
  TraceCertification,
  TraceProject,
  TraceAward,
  TraceLanguage,
  TracePost,
  DecomposedMetrics,
  SectionEpistemicStatus,
  EvidenceItem,
  TimelineEvent,
} from '@shared/index';
import { ExtractedRawProfile } from './types';
import { classifyPost } from './activity-classifier';
import { discoverExternalSources } from './external-sources/source-detector';

export interface NormalizationResult {
  profile: TraceProfile;
  evidenceItems: EvidenceItem[];
  timelineEvents: TimelineEvent[];
}

/**
 * Extracts start and end dates from a raw date string without inventing missing years.
 */
function parseDateRange(raw?: string): {
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  startYear?: number;
} {
  if (!raw || !raw.trim()) {
    return { isCurrent: false };
  }

  const clean = raw.replace(/\s+/g, ' ').trim();
  const isCurrent = /present|current|now/i.test(clean);

  // Match years (e.g. 1994, 2021)
  const years = clean.match(/\b(19\d\d|20\d\d)\b/g);
  let startYear: number | undefined;
  if (years && years.length > 0) {
    startYear = parseInt(years[0], 10);
  }

  // Split on hyphen, en-dash, or em-dash
  const parts = clean.split(/[-–—]/);
  if (parts.length >= 2) {
    const startStr = parts[0].trim();
    const endStr = parts[1].trim();
    return {
      startDate: startStr || undefined,
      endDate: isCurrent ? undefined : (endStr || undefined),
      isCurrent,
      startYear,
    };
  }

  if (parts.length === 1 && parts[0]) {
    return {
      startDate: parts[0].trim(),
      endDate: isCurrent ? undefined : undefined,
      isCurrent,
      startYear,
    };
  }

  return { isCurrent };
}

export function normalizeRawProfile(raw: ExtractedRawProfile): NormalizationResult {
  const profileId = `prof-${raw.canonicalIdentifier}`;
  const now = raw.extractedAt || new Date().toISOString();
  const evidenceItems: EvidenceItem[] = [];
  const timelineEvents: TimelineEvent[] = [];
  const profileEvidenceIds: string[] = [];

  // Helper to register an atomic piece of evidence
  const registerEvidence = (
    idSuffix: string,
    rawText: string,
    domSelector?: string,
    annotation?: string
  ): string => {
    const evidenceId = `ev-${raw.canonicalIdentifier}-${idSuffix}`;
    const item: EvidenceItem = {
      id: evidenceId,
      type: 'dom_text',
      factState: 'observed',
      rawText,
      extractedAt: now,
      confidence: 'high',
      provenance: {
        url: raw.url,
        pageTitle: `${raw.fullName} | LinkedIn`,
        capturedAt: now,
        domSelector,
        contextSnippet: rawText.slice(0, 300),
      },
      annotation,
    };
    evidenceItems.push(item);
    profileEvidenceIds.push(evidenceId);
    return evidenceId;
  };

  // 1. Identity Evidence
  const identityText = `${raw.fullName}${raw.headline ? ` · ${raw.headline}` : ''}${
    raw.location ? ` · ${raw.location}` : ''
  }`;
  registerEvidence('identity', identityText, 'h1.text-heading-xlarge', 'Observed from LinkedIn top card');

  // 2. About Evidence
  if (raw.aboutSummary) {
    registerEvidence('about', raw.aboutSummary, '#about', 'Observed from LinkedIn About section');
  }

  // 3. Normalize Experiences
  let internshipCount = 0;
  const experiences: TraceExperience[] = raw.experiences.map((exp, idx) => {
    const expId = `exp-${raw.canonicalIdentifier}-${idx}`;
    const expText = `${exp.title} at ${exp.companyName}${
      exp.dateRangeRaw ? ` (${exp.dateRangeRaw})` : ''
    }${exp.description ? `\n${exp.description}` : ''}`;

    const evId = registerEvidence(
      `exp-${idx}`,
      expText,
      exp.domSelector,
      `Observed from LinkedIn experience item ${idx + 1}`
    );

    const parsedDates = parseDateRange(exp.dateRangeRaw);
    const lowerTitle = exp.title.toLowerCase();
    const isIntern = lowerTitle.includes('intern') || lowerTitle.includes('fellow') || lowerTitle.includes('trainee') || lowerTitle.includes('co-op');
    if (isIntern) {
      internshipCount++;
    }

    // Create corresponding Timeline Event with parsed dates
    const timelineEvId = `tl-exp-${raw.canonicalIdentifier}-${idx}`;
    timelineEvents.push({
      id: timelineEvId,
      sourceItemId: expId,
      category: 'career',
      title: exp.title,
      organization: exp.companyName,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      isCurrent: parsedDates.isCurrent,
      description: exp.description,
      factState: 'observed',
      evidenceIds: [evId],
    });

    return {
      id: expId,
      title: exp.title,
      companyName: exp.companyName,
      companyUrl: exp.companyUrl,
      location: exp.location,
      dateRange: {
        rawString: exp.dateRangeRaw,
        startDate: parsedDates.startDate,
        endDate: parsedDates.endDate,
        isCurrent: parsedDates.isCurrent,
      },
      description: exp.description,
      factState: 'observed',
      evidenceIds: [evId],
      skillsMentioned: [],
    };
  });

  // 4. Normalize Education
  const education: TraceEducation[] = raw.education.map((edu, idx) => {
    const eduId = `edu-${raw.canonicalIdentifier}-${idx}`;
    const eduText = `${edu.schoolName}${edu.degree ? ` · ${edu.degree}` : ''}${
      edu.dateRangeRaw ? ` (${edu.dateRangeRaw})` : ''
    }`;

    const evId = registerEvidence(
      `edu-${idx}`,
      eduText,
      edu.domSelector,
      `Observed from LinkedIn education item ${idx + 1}`
    );

    const parsedDates = parseDateRange(edu.dateRangeRaw);

    // Create corresponding Timeline Event
    const timelineEvId = `tl-edu-${raw.canonicalIdentifier}-${idx}`;
    timelineEvents.push({
      id: timelineEvId,
      sourceItemId: eduId,
      category: 'education',
      title: edu.degree || 'Studies',
      organization: edu.schoolName,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      isCurrent: parsedDates.isCurrent,
      description: edu.description,
      factState: 'observed',
      evidenceIds: [evId],
    });

    return {
      id: eduId,
      schoolName: edu.schoolName,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      dateRange: {
        rawString: edu.dateRangeRaw,
        startDate: parsedDates.startDate,
        endDate: parsedDates.endDate,
      },
      description: edu.description,
      factState: 'observed',
      evidenceIds: [evId],
    };
  });

  // 5. Normalize Skills (STRICT: Observed only, zero fake scores)
  const skills: TraceSkill[] = raw.skills.map((skill, idx) => {
    const skillId = `skill-${raw.canonicalIdentifier}-${idx}`;
    const evId = registerEvidence(
      `skill-${idx}`,
      skill.name,
      skill.domSelector,
      `Observed skill listed on LinkedIn profile`
    );

    return {
      id: skillId,
      name: skill.name,
      factState: 'observed',
      associatedItemIds: [],
      evidenceIds: [evId],
    };
  });

  // 6. Normalize Certifications
  const certifications: TraceCertification[] = raw.certifications.map((cert, idx) => {
    const certId = `cert-${raw.canonicalIdentifier}-${idx}`;
    const certText = `${cert.name} issued by ${cert.issuingOrganization}${
      cert.dateRangeRaw ? ` (${cert.dateRangeRaw})` : ''
    }`;

    const evId = registerEvidence(
      `cert-${idx}`,
      certText,
      cert.domSelector,
      `Observed certification on LinkedIn`
    );

    const parsedDates = parseDateRange(cert.dateRangeRaw);

    timelineEvents.push({
      id: `tl-cert-${raw.canonicalIdentifier}-${idx}`,
      sourceItemId: certId,
      category: 'certification',
      title: cert.name,
      organization: cert.issuingOrganization,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      isCurrent: false,
      factState: 'observed',
      evidenceIds: [evId],
    });

    return {
      id: certId,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      credentialUrl: cert.credentialUrl,
      factState: 'observed',
      evidenceIds: [evId],
    };
  });

  // 7. Normalize Projects
  let hackathonCount = 0;
  let openSourceCount = 0;
  const projects: TraceProject[] = (raw.projects || []).map((proj, idx) => {
    const projId = `proj-${raw.canonicalIdentifier}-${idx}`;
    const projText = `${proj.title}${proj.description ? ` — ${proj.description}` : ''}${
      proj.url ? ` (${proj.url})` : ''
    }`;

    const evId = registerEvidence(
      `proj-${idx}`,
      projText,
      proj.domSelector,
      `Observed project on LinkedIn`
    );

    const isHack = proj.isHackathon || /hackathon|hack\b/i.test(proj.title + ' ' + (proj.description || ''));
    const isOpen = proj.isOpenSource || /open source|github\.com/i.test(proj.title + ' ' + (proj.description || '') + (proj.url || ''));

    if (isHack) hackathonCount++;
    if (isOpen) openSourceCount++;

    const parsedDates = parseDateRange(proj.dateRangeRaw);

    // If date exists, project can appear on timeline as milestone
    if (parsedDates.startDate) {
      timelineEvents.push({
        id: `tl-proj-${raw.canonicalIdentifier}-${idx}`,
        sourceItemId: projId,
        category: 'milestone',
        title: proj.title,
        organization: 'Project Artifact',
        startDate: parsedDates.startDate,
        endDate: parsedDates.endDate,
        isCurrent: false,
        description: proj.description,
        factState: 'observed',
        evidenceIds: [evId],
      });
    }

    return {
      id: projId,
      title: proj.title,
      description: proj.description,
      url: proj.url,
      dateRange: {
        rawString: proj.dateRangeRaw,
        startDate: parsedDates.startDate,
        endDate: parsedDates.endDate,
      },
      isHackathon: isHack,
      isOpenSource: isOpen,
      factState: 'observed',
      evidenceIds: [evId],
    };
  });

  // 8. Normalize Honors & Awards
  const awards: TraceAward[] = (raw.awards || []).map((award, idx) => {
    const awardId = `award-${raw.canonicalIdentifier}-${idx}`;
    const awardText = `${award.title}${award.issuer ? ` by ${award.issuer}` : ''}${
      award.issueDate ? ` (${award.issueDate})` : ''
    }`;

    const evId = registerEvidence(
      `award-${idx}`,
      awardText,
      award.domSelector,
      `Observed award on LinkedIn`
    );

    if (/hackathon|hack\b/i.test(award.title + ' ' + (award.description || ''))) {
      hackathonCount++;
    }

    const parsedDates = parseDateRange(award.issueDate);
    if (parsedDates.startDate) {
      timelineEvents.push({
        id: `tl-award-${raw.canonicalIdentifier}-${idx}`,
        sourceItemId: awardId,
        category: 'milestone',
        title: award.title,
        organization: award.issuer || 'Award',
        startDate: parsedDates.startDate,
        isCurrent: false,
        description: award.description,
        factState: 'observed',
        evidenceIds: [evId],
      });
    }

    return {
      id: awardId,
      title: award.title,
      issuer: award.issuer,
      issueDate: award.issueDate,
      description: award.description,
      factState: 'observed',
      evidenceIds: [evId],
    };
  });

  // 9. Normalize Languages
  const languages: TraceLanguage[] = (raw.languages || []).map((lang, idx) => {
    const langId = `lang-${raw.canonicalIdentifier}-${idx}`;
    const langText = `${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`;

    const evId = registerEvidence(
      `lang-${idx}`,
      langText,
      lang.domSelector,
      `Observed language on LinkedIn`
    );

    return {
      id: langId,
      name: lang.name,
      proficiency: lang.proficiency,
      factState: 'observed',
      evidenceIds: [evId],
    };
  });

  // 10. Normalize Activity & Posts (Grounded & Epistemic)
  const posts: TracePost[] = (raw.posts || []).map((post, idx) => {
    const postId = `post-${raw.canonicalIdentifier}-${idx}`;
    const category = classifyPost(post.visibleText, post.links, post.hashtags);

    const evId = registerEvidence(
      `post-${idx}`,
      post.visibleText,
      post.domSelector,
      `Observed Activity Post (${category})${post.postDateRaw ? ` [${post.postDateRaw}]` : ''}`
    );

    // Link post evidence to timeline event if it reinforces an experience or project
    let linkedTimelineEventId: string | undefined = undefined;
    if (category === 'job/career update' || category === 'internship') {
      const matchingEvent = timelineEvents.find((ev) => {
        if (!ev.organization) return false;
        const orgClean = ev.organization.toLowerCase();
        return post.visibleText.toLowerCase().includes(orgClean);
      });
      if (matchingEvent) {
        linkedTimelineEventId = matchingEvent.id;
        if (!matchingEvent.evidenceIds.includes(evId)) {
          matchingEvent.evidenceIds.push(evId);
        }
      }
    } else if (category === 'hackathon/competition') {
      hackathonCount++;
    } else if (category === 'open source') {
      openSourceCount++;
    }

    return {
      id: postId,
      postUrl: post.postUrl,
      postDate: post.postDateRaw,
      visibleText: post.visibleText,
      authorName: post.authorName,
      category,
      hashtags: post.hashtags || [],
      links: post.links || [],
      hasAttachment: post.hasAttachment || false,
      factState: 'observed',
      evidenceIds: [evId],
      linkedTimelineEventId,
      domSelector: post.domSelector,
      extractedAt: now,
    };
  });

  // 11. Chronological Sorting for Dated Timeline Events
  timelineEvents.sort((a, b) => {
    const getYear = (dateStr?: string) => {
      if (!dateStr) return 0;
      const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
      return match ? parseInt(match[1], 10) : 0;
    };
    const yearA = getYear(a.endDate) || getYear(a.startDate);
    const yearB = getYear(b.endDate) || getYear(b.startDate);
    return yearB - yearA; // Newest first
  });

  // 12. Decomposed Metrics strictly derived from real records
  const decomposedMetrics: DecomposedMetrics = {
    internships: internshipCount,
    projects: projects.length,
    hackathons: hackathonCount,
    opensource: openSourceCount,
  };

  // 13. Automatic External Source Discovery
  const { sources: externalSources, evidenceItems: externalEvidenceItems } = discoverExternalSources({
    canonicalId: profileId,
    posts,
    projects,
    certifications,
    experiences,
    aboutSummary: raw.aboutSummary,
    sourceUrl: raw.url,
  });

  // Append new atomic evidence items
  externalEvidenceItems.forEach((ev) => {
    evidenceItems.push(ev);
    profileEvidenceIds.push(ev.id);
  });

  // 14. Missing-Data Semantics
  const sectionCoverage: Record<string, SectionEpistemicStatus> = {
    about: raw.sectionsRendered?.about ? 'observed' : 'not_rendered',
    experience: raw.sectionsRendered?.experience ? 'observed' : 'not_rendered',
    education: raw.sectionsRendered?.education ? 'observed' : 'not_rendered',
    skills: raw.sectionsRendered?.skills ? 'observed' : 'not_rendered',
    certifications: raw.sectionsRendered?.certifications ? 'observed' : 'not_rendered',
    projects: raw.sectionsRendered?.projects ? 'observed' : 'not_rendered',
    awards: raw.sectionsRendered?.awards ? 'observed' : 'not_rendered',
    languages: raw.sectionsRendered?.languages ? 'observed' : 'not_rendered',
    activity: raw.sectionsRendered?.activity ? 'observed' : 'not_rendered',
    external_sources: externalSources.length > 0 ? 'observed' : 'not_rendered',
  };

  // 15. Compose Canonical Profile
  const profile: TraceProfile = {
    id: profileId,
    sourceUrl: raw.url,
    fullName: raw.fullName,
    headline: raw.headline,
    location: raw.location,
    aboutSummary: raw.aboutSummary,
    capturedAt: now,
    updatedAt: now,
    experiences,
    education,
    skills,
    certifications,
    projects,
    awards,
    languages,
    posts,
    externalSources,
    publications: [],
    decomposedMetrics,
    sectionCoverage,
    evidenceIds: profileEvidenceIds,
    metadata: {
      extractionVersion: 'v1.3.0-external-sources',
      totalEvidenceCount: evidenceItems.length,
      notes: `Extracted via visible DOM collector (${raw.completeness} coverage, ${externalSources.length} external sources discovered)`,
    },
  };

  return {
    profile,
    evidenceItems,
    timelineEvents,
  };
}
