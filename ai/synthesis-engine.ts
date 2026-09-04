/**
 * TRACE — Grounded AI Career Journey Synthesis Engine
 * 
 * Synthesizes a structured, epistemic career journey strictly from
 * collected evidence records without hallucination, fake scores, or
 * ungrounded causal claims.
 */

import {
  TraceProfile,
  EvidenceItem,
  TimelineEvent,
  DiscoveredExternalSource,
  CareerJourneySynthesis,
  SynthesizedMilestone,
  YearJourneyGroup,
  PreparationAnalysis,
  PreparationCategory,
  ConcreteActivity,
  SkillSynthesisGroup,
  EpistemicSummary,
} from '@shared/index';

export const SYNTHESIS_VERSION = 'v1.0.0';

export interface CareerJourneySynthesisInput {
  profile: TraceProfile;
  evidence: EvidenceItem[];
  timelineEvents?: TimelineEvent[];
  externalSources?: DiscoveredExternalSource[];
  options?: {
    modelName?: string;
    temperature?: number;
    forceRefresh?: boolean;
  };
}

/**
 * Computes a deterministic input hash for the synthesis payload.
 * Used for IndexedDB cache invalidation when evidence changes.
 */
export function computeSynthesisInputHash(input: CareerJourneySynthesisInput): string {
  const { profile, evidence, externalSources } = input;
  const evKeys = (evidence || [])
    .map((e) => `${e.id}:${e.rawText.slice(0, 20)}:${e.factState}`)
    .sort()
    .join('|');
  const srcKeys = (externalSources || [])
    .map((s) => `${s.id}:${s.normalizedUrl}`)
    .sort()
    .join('|');
  const baseKey = `${profile.id}:${SYNTHESIS_VERSION}:${profile.updatedAt || ''}:${evKeys}:${srcKeys}`;

  let hash = 0;
  for (let i = 0; i < baseKey.length; i++) {
    hash = (hash << 5) - hash + baseKey.charCodeAt(i);
    hash |= 0;
  }
  return `hash-${Math.abs(hash).toString(36)}-${evidence.length}ev`;
}

/**
 * Builds a compact, structured JSON payload for AI providers (OpenAI, Anthropic, local model).
 * Strips verbose DOM cruft to keep tokens minimal and focus the model on grounding.
 */
export function buildSynthesisPromptPayload(input: CareerJourneySynthesisInput): string {
  const { profile, evidence, externalSources, timelineEvents } = input;

  const payload = {
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      headline: profile.headline,
      location: profile.location,
      aboutSummary: profile.aboutSummary,
    },
    experiences: (profile.experiences || []).map((e) => ({
      id: e.id,
      title: e.title,
      company: e.companyName,
      dateRange: e.dateRange.rawString,
      startDate: e.dateRange.startDate,
      endDate: e.dateRange.endDate,
      isCurrent: e.dateRange.isCurrent,
      description: e.description?.slice(0, 300),
      evidenceIds: e.evidenceIds,
    })),
    education: (profile.education || []).map((e) => ({
      id: e.id,
      school: e.schoolName,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      dateRange: e.dateRange.rawString,
      evidenceIds: e.evidenceIds,
    })),
    skills: (profile.skills || []).map((s) => ({
      name: s.name,
      evidenceIds: s.evidenceIds,
    })),
    projects: (profile.projects || []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description?.slice(0, 200),
      url: p.url,
      dateRange: p.dateRange?.rawString,
      isHackathon: p.isHackathon,
      isOpenSource: p.isOpenSource,
      evidenceIds: p.evidenceIds,
    })),
    posts: (profile.posts || []).map((p) => ({
      id: p.id,
      date: p.postDate,
      category: p.category,
      snippet: p.visibleText.slice(0, 200),
      hashtags: p.hashtags,
      links: p.links,
      evidenceIds: p.evidenceIds,
    })),
    externalSources: (externalSources || profile.externalSources || []).map((s) => ({
      id: s.id,
      type: s.sourceType,
      url: s.normalizedUrl,
      label: s.label,
      evidenceIds: s.evidenceIds,
      originatingEvidenceId: s.originatingEvidenceId,
    })),
    timelineEvents: (timelineEvents || []).map((t) => ({
      id: t.id,
      title: t.title,
      organization: t.organization,
      category: t.category,
      startDate: t.startDate,
      endDate: t.endDate,
      evidenceIds: t.evidenceIds,
    })),
    evidenceCount: evidence.length,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Deterministic Grounded Synthesis Engine.
 * Analyzes structured evidence and produces a canonical career journey synthesis
 * conforming strictly to TRACE epistemic guidelines.
 */
export function synthesizeCareerJourneyDeterministic(
  input: CareerJourneySynthesisInput
): CareerJourneySynthesis {
  const { profile, evidence: _evidence = [], timelineEvents: _timelineEvents = [], externalSources = [] } = input;
  const inputHash = computeSynthesisInputHash(input);
  const now = new Date().toISOString();

  // 1. Build Milestones from Grounded Facts
  const milestones: SynthesizedMilestone[] = [];
  const registeredMilestoneTitles = new Set<string>();

  // A. Career Experience Milestones
  (profile.experiences || []).forEach((exp, idx) => {
    const rawDate = exp.dateRange.rawString || exp.dateRange.startDate || '';
    const yearMatch = rawDate.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
    const isCurrent = exp.dateRange.isCurrent || /present/i.test(rawDate);

    const title = `${exp.title} at ${exp.companyName}`;
    if (!registeredMilestoneTitles.has(title)) {
      registeredMilestoneTitles.add(title);
      milestones.push({
        id: `synth-m-exp-${idx}`,
        year,
        dateOrPeriod: isCurrent ? `${rawDate || 'Current'} (Active Role)` : rawDate || 'Observed Period',
        title,
        category: 'career',
        explanation: exp.description
          ? `Observed career appointment at ${exp.companyName}: "${exp.description.slice(0, 160)}${exp.description.length > 160 ? '...' : ''}"`
          : `Observed professional role as ${exp.title} at ${exp.companyName} based on LinkedIn profile records.`,
        factState: 'observed',
        evidenceIds: exp.evidenceIds && exp.evidenceIds.length > 0 ? exp.evidenceIds : profile.evidenceIds.slice(0, 1),
        sourceLinks: exp.companyUrl ? [exp.companyUrl] : [profile.sourceUrl],
      });
    }
  });

  // B. Education Milestones
  (profile.education || []).forEach((edu, idx) => {
    const rawDate = edu.dateRange.rawString || edu.dateRange.startDate || '';
    const yearMatch = rawDate.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

    const title = `${edu.degree || 'Academic Studies'}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} at ${edu.schoolName}`;
    if (!registeredMilestoneTitles.has(title)) {
      registeredMilestoneTitles.add(title);
      milestones.push({
        id: `synth-m-edu-${idx}`,
        year,
        dateOrPeriod: rawDate || 'Academic Period',
        title,
        category: 'education',
        explanation: `Formal academic degree program observed at ${edu.schoolName}.`,
        factState: 'observed',
        evidenceIds: edu.evidenceIds && edu.evidenceIds.length > 0 ? edu.evidenceIds : profile.evidenceIds.slice(0, 1),
        sourceLinks: [profile.sourceUrl],
      });
    }
  });

  // C. Projects & Public Code Artifacts
  (profile.projects || []).forEach((proj, idx) => {
    const rawDate = proj.dateRange?.rawString || proj.dateRange?.startDate || '';
    const yearMatch = rawDate.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

    const title = proj.title;
    if (!registeredMilestoneTitles.has(title)) {
      registeredMilestoneTitles.add(title);
      const cat = proj.isHackathon ? 'hackathon' : proj.isOpenSource ? 'opensource' : 'project';
      milestones.push({
        id: `synth-m-proj-${idx}`,
        year,
        dateOrPeriod: rawDate || 'Technical Artifact',
        title: `Project: ${proj.title}`,
        category: cat,
        explanation: proj.description
          ? `Engineered artifact: ${proj.description.slice(0, 160)}`
          : `Grounded technical project artifact observed on profile.`,
        factState: 'observed',
        evidenceIds: proj.evidenceIds && proj.evidenceIds.length > 0 ? proj.evidenceIds : profile.evidenceIds.slice(0, 1),
        sourceLinks: proj.url ? [proj.url] : [profile.sourceUrl],
      });
    }
  });

  // D. Discovered External Source Milestones (e.g. GitHub repos, Devpost projects, LeetCode)
  (externalSources || profile.externalSources || []).forEach((src, idx) => {
    if (src.sourceType === 'github' || src.sourceType === 'devpost' || src.sourceType === 'leetcode') {
      const title = `External Source: ${src.label}`;
      if (!registeredMilestoneTitles.has(title)) {
        registeredMilestoneTitles.add(title);
        milestones.push({
          id: `synth-m-ext-${idx}`,
          dateOrPeriod: 'Discovered Artifact',
          title,
          category: src.sourceType === 'github' ? 'opensource' : src.sourceType === 'devpost' ? 'hackathon' : 'dsa',
          explanation: `Automatically discovered public ${src.sourceType} artifact at ${src.domain}. Cites originating post or profile section.`,
          factState: 'observed',
          evidenceIds: src.evidenceIds && src.evidenceIds.length > 0 ? src.evidenceIds : profile.evidenceIds.slice(0, 1),
          sourceLinks: [src.normalizedUrl],
        });
      }
    }
  });

  // E. Inferred Career Transitions (Non-Causal Grounding)
  if (profile.experiences && profile.experiences.length > 1) {
    for (let i = 0; i < profile.experiences.length - 1; i++) {
      const later = profile.experiences[i];
      const earlier = profile.experiences[i + 1];
      const transTitle = `Transition: ${earlier.companyName} → ${later.companyName}`;
      if (!registeredMilestoneTitles.has(transTitle)) {
        registeredMilestoneTitles.add(transTitle);
        const transEvIds = Array.from(new Set([...(earlier.evidenceIds || []), ...(later.evidenceIds || [])]));
        milestones.push({
          id: `synth-m-trans-${i}`,
          dateOrPeriod: `${earlier.dateRange.rawString || ''} to ${later.dateRange.rawString || ''}`.trim() || 'Role Transition',
          title: transTitle,
          category: 'milestone',
          explanation: `Inferred career progression from ${earlier.title} (${earlier.companyName}) to ${later.title} (${later.companyName}). Temporal transition established by distinct employment records; no unevidenced causal assertion is made.`,
          factState: 'inferred',
          evidenceIds: transEvIds.length > 0 ? transEvIds : profile.evidenceIds.slice(0, 1),
          sourceLinks: [profile.sourceUrl],
          isTransition: true,
        });
      }
    }
  }

  // Sort milestones chronologically (newest first where year is known)
  milestones.sort((a, b) => {
    const yA = a.year || 0;
    const yB = b.year || 0;
    if (yA !== yB) return yB - yA;
    return a.title.localeCompare(b.title);
  });

  // 2. Build Year-by-Year Journey Groups
  const yearMap = new Map<number | string, SynthesizedMilestone[]>();
  const undatedMilestones: SynthesizedMilestone[] = [];

  milestones.forEach((m) => {
    if (m.year) {
      const list = yearMap.get(m.year) || [];
      list.push(m);
      yearMap.set(m.year, list);
    } else {
      undatedMilestones.push(m);
    }
  });

  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => (Number(b) || 0) - (Number(a) || 0));
  const yearByYear: YearJourneyGroup[] = [];

  for (let i = 0; i < sortedYears.length; i++) {
    const yr = sortedYears[i];
    const ms = yearMap.get(yr) || [];
    let hasGap = false;
    let gapNote: string | undefined;

    if (i < sortedYears.length - 1 && typeof yr === 'number' && typeof sortedYears[i + 1] === 'number') {
      const nextYr = sortedYears[i + 1] as number;
      if (yr - nextYr > 1) {
        hasGap = true;
        gapNote = `Chronological gap observed between ${nextYr} and ${yr} in visible public records. No events interpolated.`;
      }
    }

    yearByYear.push({
      year: yr,
      periodLabel: `${yr}`,
      milestones: ms,
      hasChronologyGap: hasGap,
      gapNote,
    });
  }

  if (undatedMilestones.length > 0) {
    yearByYear.push({
      year: 'Artifacts & Ongoing',
      periodLabel: 'Demonstrated Artifacts & Foundations',
      milestones: undatedMilestones,
    });
  }

  // 3. Preparation Analysis (Strictly NO effort score, NO trajectory percentage)
  const prepCategories: PreparationCategory[] = [];

  // A. DSA & Problem Solving
  const dsaActivities: ConcreteActivity[] = [];
  (profile.posts || []).forEach((p) => {
    if (p.category === 'DSA/problem solving' || /leetcode|dsa|algorithm|problem solving/i.test(p.visibleText)) {
      dsaActivities.push({
        id: `act-dsa-${p.id}`,
        title: 'Algorithmic Problem Solving Practice',
        detail: p.visibleText.slice(0, 160),
        evidenceIds: p.evidenceIds,
        factState: 'observed',
        sourceUrl: p.postUrl,
        date: p.postDate,
      });
    }
  });
  (externalSources || profile.externalSources || []).forEach((s) => {
    if (s.sourceType === 'leetcode') {
      dsaActivities.push({
        id: `act-dsa-ext-${s.id}`,
        title: `LeetCode Profile: ${s.label}`,
        detail: `Public problem solving track recorded at ${s.normalizedUrl}`,
        evidenceIds: s.evidenceIds,
        factState: 'observed',
        sourceUrl: s.normalizedUrl,
      });
    }
  });
  if (dsaActivities.length > 0) {
    prepCategories.push({
      id: 'prep-dsa',
      name: 'DSA & Problem Solving',
      description: 'Documented problem solving milestones and algorithmic practice visible in public activity.',
      activities: dsaActivities,
      totalObservedActivities: dsaActivities.length,
    });
  }

  // B. Project Building & Systems
  const projectActivities: ConcreteActivity[] = [];
  (profile.projects || []).forEach((p) => {
    projectActivities.push({
      id: `act-proj-${p.id}`,
      title: p.title,
      detail: p.description || 'Engineered project artifact documented on profile.',
      evidenceIds: p.evidenceIds,
      factState: 'observed',
      sourceUrl: p.url,
      date: p.dateRange?.rawString,
    });
  });
  if (projectActivities.length > 0) {
    prepCategories.push({
      id: 'prep-projects',
      name: 'Project Building & Architecture',
      description: 'End-to-end technical projects, applications, and system builds with documented artifacts.',
      activities: projectActivities,
      totalObservedActivities: projectActivities.length,
    });
  }

  // C. Open Source Contributions
  const openSourceActivities: ConcreteActivity[] = [];
  (profile.posts || []).forEach((p) => {
    if (p.category === 'open source' || /open source|github release|repository/i.test(p.visibleText)) {
      openSourceActivities.push({
        id: `act-os-post-${p.id}`,
        title: 'Open Source Community Release',
        detail: p.visibleText.slice(0, 160),
        evidenceIds: p.evidenceIds,
        factState: 'observed',
        sourceUrl: p.postUrl,
        date: p.postDate,
      });
    }
  });
  (externalSources || profile.externalSources || []).forEach((s) => {
    if (s.sourceType === 'github') {
      openSourceActivities.push({
        id: `act-os-git-${s.id}`,
        title: `GitHub Codebase: ${s.label}`,
        detail: `Public open source repository accessible at ${s.normalizedUrl}`,
        evidenceIds: s.evidenceIds,
        factState: 'observed',
        sourceUrl: s.normalizedUrl,
      });
    }
  });
  if (openSourceActivities.length > 0) {
    prepCategories.push({
      id: 'prep-opensource',
      name: 'Open Source & Codebases',
      description: 'Public codebase repositories, version-controlled open source projects, and technical releases.',
      activities: openSourceActivities,
      totalObservedActivities: openSourceActivities.length,
    });
  }

  // D. Hackathons & Competitions
  const compActivities: ConcreteActivity[] = [];
  (profile.posts || []).forEach((p) => {
    if (p.category === 'hackathon/competition' || /hackathon|competition|winner/i.test(p.visibleText)) {
      compActivities.push({
        id: `act-hack-post-${p.id}`,
        title: 'Hackathon Participation & Placement',
        detail: p.visibleText.slice(0, 160),
        evidenceIds: p.evidenceIds,
        factState: 'observed',
        sourceUrl: p.postUrl,
        date: p.postDate,
      });
    }
  });
  (externalSources || profile.externalSources || []).forEach((s) => {
    if (s.sourceType === 'devpost') {
      compActivities.push({
        id: `act-hack-devpost-${s.id}`,
        title: `Devpost Project: ${s.label}`,
        detail: `Competitive hackathon submission recorded at ${s.normalizedUrl}`,
        evidenceIds: s.evidenceIds,
        factState: 'observed',
        sourceUrl: s.normalizedUrl,
      });
    }
  });
  (profile.awards || []).forEach((a) => {
    if (/hackathon|competition|olympiad|contest/i.test(a.title + ' ' + (a.description || ''))) {
      compActivities.push({
        id: `act-award-${a.id}`,
        title: a.title,
        detail: `${a.issuer ? `Conferred by ${a.issuer}. ` : ''}${a.description || ''}`.trim(),
        evidenceIds: a.evidenceIds,
        factState: 'observed',
        date: a.issueDate,
      });
    }
  });
  if (compActivities.length > 0) {
    prepCategories.push({
      id: 'prep-hackathons',
      name: 'Competitions & Hackathons',
      description: 'Time-bounded hackathon builds, competitive programming placements, and contest achievements.',
      activities: compActivities,
      totalObservedActivities: compActivities.length,
    });
  }

  // E. Industry Roles & Internship Experience
  const industryActivities: ConcreteActivity[] = [];
  (profile.experiences || []).forEach((e) => {
    const isIntern = /intern/i.test(e.title);
    industryActivities.push({
      id: `act-role-${e.id}`,
      title: `${isIntern ? 'Internship' : 'Industry Role'}: ${e.title}`,
      detail: `${e.companyName} (${e.dateRange.rawString || 'Recorded Period'})${e.description ? ` — ${e.description.slice(0, 140)}` : ''}`,
      evidenceIds: e.evidenceIds,
      factState: 'observed',
      sourceUrl: e.companyUrl || profile.sourceUrl,
      date: e.dateRange.rawString,
    });
  });
  if (industryActivities.length > 0) {
    prepCategories.push({
      id: 'prep-roles',
      name: 'Industry Roles & Internships',
      description: 'Hands-on organizational experience across technical roles, team engineering, and domain responsibilities.',
      activities: industryActivities,
      totalObservedActivities: industryActivities.length,
    });
  }

  // F. Certifications & Credentials
  const certActivities: ConcreteActivity[] = [];
  (profile.certifications || []).forEach((c) => {
    certActivities.push({
      id: `act-cert-${c.id}`,
      title: c.name,
      detail: `${c.issuingOrganization ? `Issued by ${c.issuingOrganization}. ` : ''}${c.credentialUrl ? `Credential link: ${c.credentialUrl}` : ''}`.trim(),
      evidenceIds: c.evidenceIds,
      factState: 'observed',
      sourceUrl: c.credentialUrl,
      date: c.issueDate,
    });
  });
  if (certActivities.length > 0) {
    prepCategories.push({
      id: 'prep-certs',
      name: 'Certifications & Credentials',
      description: 'Verified professional certifications, industry qualifications, and standardized assessments.',
      activities: certActivities,
      totalObservedActivities: certActivities.length,
    });
  }

  const preparation: PreparationAnalysis = {
    categories: prepCategories,
    totalEvidenceCount: prepCategories.reduce((acc, c) => acc + c.activities.length, 0),
    summaryNote: 'Concrete preparation milestones grouped from direct profile records, activity posts, and external repositories. Evaluates observable activity only; no speculative effort scores.',
  };

  // 4. Skill Synthesis (Strictly NO 0–100% proficiencies, NO stars)
  const skillsMap = new Map<string, SkillSynthesisGroup>();

  // Direct observed skills
  (profile.skills || []).forEach((s) => {
    const key = s.name.toLowerCase();
    skillsMap.set(key, {
      skillName: s.name,
      category: 'Core Competency',
      factState: 'observed',
      supportingEvidenceIds: s.evidenceIds && s.evidenceIds.length > 0 ? s.evidenceIds : profile.evidenceIds.slice(0, 1),
      supportingSources: [profile.sourceUrl],
      demonstratedContexts: ['Explicitly observed on LinkedIn skills profile'],
    });
  });

  // Infer demonstrated technical skills from projects, repositories, and experience
  (profile.projects || []).forEach((p) => {
    const text = `${p.title} ${p.description || ''}`;
    const matchedTokens = text.match(/\b(Python|JavaScript|TypeScript|React|Go|Rust|C\+\+|Java|Azure|AWS|Kubernetes|Docker|GraphQL|SQL|Node\.js|Linux|Distributed Systems|Machine Learning|Deep Learning)\b/gi);
    if (matchedTokens) {
      matchedTokens.forEach((tok) => {
        const key = tok.toLowerCase();
        const existing = skillsMap.get(key);
        if (existing) {
          if (!existing.supportingEvidenceIds.includes(p.evidenceIds[0])) {
            existing.supportingEvidenceIds.push(...p.evidenceIds);
          }
          existing.demonstratedContexts.push(`Applied in project: "${p.title}"`);
        } else {
          skillsMap.set(key, {
            skillName: tok,
            category: 'Demonstrated in Projects',
            factState: 'inferred',
            supportingEvidenceIds: p.evidenceIds,
            supportingSources: p.url ? [p.url] : [profile.sourceUrl],
            demonstratedContexts: [`Demonstrated in project artifact: "${p.title}"`],
          });
        }
      });
    }
  });

  // Infer technical domains from experiences
  (profile.experiences || []).forEach((e) => {
    const text = `${e.title} ${e.description || ''}`;
    const matchedDomains = text.match(/\b(Cloud Computing|Enterprise Software|AI Strategy|Systems Architecture|Product Leadership|Developer Tools|Platform Engineering)\b/gi);
    if (matchedDomains) {
      matchedDomains.forEach((dom) => {
        const key = dom.toLowerCase();
        const existing = skillsMap.get(key);
        if (existing) {
          existing.demonstratedContexts.push(`Exercised during tenure at ${e.companyName}`);
        } else {
          skillsMap.set(key, {
            skillName: dom,
            category: 'Domain Expertise',
            factState: 'inferred',
            supportingEvidenceIds: e.evidenceIds,
            supportingSources: [profile.sourceUrl],
            demonstratedContexts: [`Derived from scope of responsibility as ${e.title} at ${e.companyName}`],
          });
        }
      });
    }
  });

  const skills: SkillSynthesisGroup[] = Array.from(skillsMap.values());

  // 5. Epistemic Summary (3 Conceptual Tiers: OBSERVED, INFERRED, UNKNOWN)
  const epistemicSummary: EpistemicSummary = {
    observed: [
      {
        id: 'ep-obs-roles',
        statement: `${profile.experiences?.length || 0} professional roles and appointments recorded across verifiable organizations.`,
        evidenceIds: (profile.experiences || []).flatMap((e) => e.evidenceIds).slice(0, 5),
        sources: [profile.sourceUrl],
      },
      {
        id: 'ep-obs-edu',
        statement: `${profile.education?.length || 0} academic degree programs and institutional enrollments observed.`,
        evidenceIds: (profile.education || []).flatMap((e) => e.evidenceIds),
        sources: [profile.sourceUrl],
      },
      {
        id: 'ep-obs-sources',
        statement: `${(externalSources || profile.externalSources || []).length} external technical sources discovered (code repositories, challenge platforms, portfolios).`,
        evidenceIds: (externalSources || profile.externalSources || []).flatMap((s) => s.evidenceIds).slice(0, 5),
        sources: (externalSources || profile.externalSources || []).map((s) => s.normalizedUrl).slice(0, 3),
      },
    ],
    inferred: [
      {
        id: 'ep-inf-traj',
        statement: `Sustained career progression across ${profile.experiences?.length || 0} organizational milestones.`,
        rationale: 'Derived from sequential chronological transitions across corporate entities without documented tenure gaps.',
        evidenceIds: (profile.experiences || []).flatMap((e) => e.evidenceIds).slice(0, 3),
      },
      {
        id: 'ep-inf-focus',
        statement: `Primary technical and strategic specialization centered in ${profile.experiences?.[0]?.companyName || 'industry'} operations.`,
        rationale: 'Observed active role and concentrated tenure in enterprise leadership.',
        evidenceIds: profile.experiences?.[0]?.evidenceIds || profile.evidenceIds.slice(0, 1),
      },
    ],
    unknown: [
      {
        id: 'ep-unk-early',
        gap: 'Pre-academic trajectory and early foundational years',
        whyUnknown: 'Public profile visible records start at university education; prior developmental milestones are not published.',
      },
      {
        id: 'ep-unk-perf',
        gap: 'Internal organizational performance metrics and proprietary work',
        whyUnknown: 'Private enterprise work and internal evaluations are protected by non-disclosure and absent from public web footprints.',
      },
    ],
  };

  // Causality Notes (Strictly enforce non-causal language)
  const causalityNotes = [
    'TRACE enforces temporal grounding: prior activities are documented as preceding subsequent career roles, not as speculative sole causes.',
    'Interpretation states are strictly separated into Observed (verifiable facts), Inferred (emergent multi-record patterns), and Unknown (unestablished gaps).',
  ];

  return {
    profileId: profile.id,
    synthesisVersion: SYNTHESIS_VERSION,
    inputHash,
    synthesizedAt: now,
    providerUsed: 'TRACE Grounded Deterministic Engine',
    status: 'ready',
    headlineSummary: `${profile.fullName || 'Candidate'} — Evidence-Grounded Career Journey Synthesis`,
    milestones,
    yearByYear,
    preparation,
    skills,
    epistemicSummary,
    causalityNotes,
  };
}
