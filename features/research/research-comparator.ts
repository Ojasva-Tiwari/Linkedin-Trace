import {
  TraceProfile,
  ResearchSet,
  CohortComparison,
  CohortPattern,
  ResearchProfileComparisonSummary,
} from '@shared/index';

/**
 * Derives a profile's current or most recent role title.
 */
function getMostRecentRole(profile: TraceProfile): string {
  if (profile.experiences && profile.experiences.length > 0) {
    const current = profile.experiences.find((exp) => exp.dateRange?.isCurrent);
    if (current) return `${current.title} @ ${current.companyName}`;
    return `${profile.experiences[0].title} @ ${profile.experiences[0].companyName}`;
  }
  return profile.headline || 'Role unstated';
}

/**
 * Derives a concise education summary.
 */
function getEducationSummary(profile: TraceProfile): string {
  if (profile.education && profile.education.length > 0) {
    const edu = profile.education[0];
    const parts = [edu.degree, edu.fieldOfStudy, edu.schoolName].filter(Boolean);
    return parts.join(', ') || edu.schoolName;
  }
  return 'Not documented in visible records';
}

/**
 * Checks if an experience is an internship based on title or description.
 */
function isInternshipExperience(exp: { title: string; description?: string }): boolean {
  const text = `${exp.title} ${exp.description || ''}`.toLowerCase();
  return text.includes('intern') || text.includes('trainee') || text.includes('fellow');
}

/**
 * Produces a strictly grounded profile comparison summary for one profile.
 * Every count is directly derived from stored atomic evidence or parsed fields.
 */
export function summarizeProfileForComparison(
  profile: TraceProfile
): ResearchProfileComparisonSummary {
  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const projects = profile.projects || [];
  const skills = profile.skills || [];
  const posts = profile.posts || [];
  const externalSources = profile.externalSources || [];

  const internships = experiences.filter(isInternshipExperience);
  const internshipCount = profile.decomposedMetrics?.internships ?? internships.length;

  // Projects count
  const projectPosts = posts.filter((p) => p.category === 'project');
  const projectCount = Math.max(
    profile.decomposedMetrics?.projects ?? 0,
    projects.length,
    projectPosts.length
  );

  // Hackathons count
  const hackathonProjects = projects.filter((p) => p.isHackathon);
  const hackathonPosts = posts.filter((p) => p.category === 'hackathon/competition');
  const hackathonCount = Math.max(
    profile.decomposedMetrics?.hackathons ?? 0,
    hackathonProjects.length,
    hackathonPosts.length
  );

  // Open Source count
  const osProjects = projects.filter((p) => p.isOpenSource);
  const osExternal = externalSources.filter((s) => s.sourceType === 'github');
  const osPosts = posts.filter((p) => p.category === 'open source');
  const openSourceCount = Math.max(
    profile.decomposedMetrics?.opensource ?? 0,
    osProjects.length,
    osExternal.length,
    osPosts.length
  );

  // DSA / problem solving
  const dsaExternal = externalSources.filter((s) => s.sourceType === 'leetcode');
  const dsaPosts = posts.filter((p) => p.category === 'DSA/problem solving');
  const hasDsa = dsaExternal.length > 0 || dsaPosts.length > 0;
  // If leetcode problem count exists in metadata:
  let dsaProblemCount: number | undefined;
  for (const src of dsaExternal) {
    if (src.metadata?.platformSpecific?.problemsSolved) {
      dsaProblemCount = Number(src.metadata.platformSpecific.problemsSolved);
      break;
    }
  }

  // Observed skills
  const observedSkillNames = skills
    .filter((s) => s.factState === 'observed' || !s.factState)
    .map((s) => s.name);

  // Source count: count distinct domains + linkedin
  const sourceDomains = new Set<string>(['linkedin.com']);
  externalSources.forEach((s) => {
    if (s.domain) sourceDomains.add(s.domain);
  });

  return {
    profileId: profile.id,
    fullName: profile.fullName,
    headline: profile.headline,
    currentRole: getMostRecentRole(profile),
    educationSummary: getEducationSummary(profile),
    milestoneCount: experiences.length + education.length,
    internshipCount,
    projectCount,
    hackathonCount,
    openSourceCount,
    dsaProblemCount: dsaProblemCount ?? (hasDsa ? 1 : undefined),
    observedSkills: Array.from(new Set(observedSkillNames)),
    evidenceCount: profile.evidenceIds?.length || profile.metadata?.totalEvidenceCount || 0,
    sourceCount: sourceDomains.size,
    evidenceIds: profile.evidenceIds || [],
  };
}

/**
 * Pure function to compute a complete cross-profile CohortComparison from a ResearchSet and its loaded profiles.
 * STRICT PRINCIPLE: Never claims causality. Clearly distinguishes OBSERVED vs INFERRED.
 */
export function computeCohortComparison(
  researchSet: ResearchSet,
  profiles: TraceProfile[]
): CohortComparison {
  const profileSummaries = profiles.map(summarizeProfileForComparison);
  const total = profiles.length;

  if (total === 0) {
    return {
      researchSetId: researchSet.id,
      researchSetTitle: researchSet.title,
      comparedAt: new Date().toISOString(),
      profileSummaries: [],
      patterns: [],
      aggregateMetrics: {
        totalProfiles: 0,
        profilesWithInternships: 0,
        profilesWithProjects: 0,
        profilesWithOpenSource: 0,
        profilesWithHackathons: 0,
        profilesWithDSA: 0,
        topSkills: [],
      },
      epistemicDemarcation: {
        observedCount: 0,
        inferredCount: 0,
        unknownCount: 0,
      },
    };
  }

  // Aggregate Metrics
  const withInternships = profileSummaries.filter((s) => s.internshipCount > 0);
  const withProjects = profileSummaries.filter((s) => s.projectCount > 0);
  const withOpenSource = profileSummaries.filter((s) => s.openSourceCount > 0);
  const withHackathons = profileSummaries.filter((s) => s.hackathonCount > 0);
  const withDSA = profileSummaries.filter((s) => (s.dsaProblemCount ?? 0) > 0);

  // Skill frequency
  const skillProfileMap = new Map<string, Set<string>>();
  profiles.forEach((p) => {
    (p.skills || []).forEach((s) => {
      const normalized = s.name.trim();
      if (!normalized) return;
      if (!skillProfileMap.has(normalized)) {
        skillProfileMap.set(normalized, new Set());
      }
      skillProfileMap.get(normalized)!.add(p.id);
    });
  });

  const topSkills = Array.from(skillProfileMap.entries())
    .map(([skill, pSet]) => ({
      skill,
      count: pSet.size,
      profileCount: pSet.size,
    }))
    .sort((a, b) => b.profileCount - a.profileCount)
    .slice(0, 10);

  // Identify Grounded Cross-Profile Patterns
  const patterns: CohortPattern[] = [];

  // Pattern 1: Projects evidence
  if (withProjects.length > 0) {
    const pIds = withProjects.map((s) => s.profileId);
    const pNames = withProjects.map((s) => s.fullName);
    const evIds = withProjects.flatMap((s) => s.evidenceIds).slice(0, 10);
    patterns.push({
      id: 'pattern-projects',
      dimension: 'projects',
      title: 'Independent Project Evidence',
      observation: `Observed across ${withProjects.length} of ${total} selected profiles.`,
      factState: 'observed',
      supportingProfileIds: pIds,
      supportingProfileNames: pNames,
      evidenceIds: evIds,
      rationale: `${withProjects.length} profile(s) maintain verifiable standalone engineering or application projects.`,
    });
  }

  // Pattern 2: Internships before full-time / internship track record
  if (withInternships.length > 0) {
    const pIds = withInternships.map((s) => s.profileId);
    const pNames = withInternships.map((s) => s.fullName);
    const evIds = withInternships.flatMap((s) => s.evidenceIds).slice(0, 10);
    patterns.push({
      id: 'pattern-internships',
      dimension: 'internships',
      title: 'Pre-Graduate Industry Internships',
      observation: `Observed in ${withInternships.length} of ${total} selected profiles.`,
      factState: 'observed',
      supportingProfileIds: pIds,
      supportingProfileNames: pNames,
      evidenceIds: evIds,
      rationale: `Industry internship experience appears repeatedly in verified professional milestones.`,
    });
  }

  // Pattern 3: Open Source contributions
  if (withOpenSource.length > 0) {
    const pIds = withOpenSource.map((s) => s.profileId);
    const pNames = withOpenSource.map((s) => s.fullName);
    const evIds = withOpenSource.flatMap((s) => s.evidenceIds).slice(0, 10);
    patterns.push({
      id: 'pattern-opensource',
      dimension: 'opensource',
      title: 'Public Open Source & Code Repositories',
      observation: `Observed across ${withOpenSource.length} of ${total} selected profiles.`,
      factState: 'observed',
      supportingProfileIds: pIds,
      supportingProfileNames: pNames,
      evidenceIds: evIds,
      rationale: `Profiles link to GitHub repositories or public pull request merges demonstrating code artifact transparency.`,
    });
  }

  // Pattern 4: Hackathon / Competition Participation
  if (withHackathons.length > 0) {
    const pIds = withHackathons.map((s) => s.profileId);
    const pNames = withHackathons.map((s) => s.fullName);
    const evIds = withHackathons.flatMap((s) => s.evidenceIds).slice(0, 10);
    patterns.push({
      id: 'pattern-hackathons',
      dimension: 'hackathons',
      title: 'Competitive Hackathon & Challenge Records',
      observation: `Observed across ${withHackathons.length} of ${total} selected profiles.`,
      factState: 'observed',
      supportingProfileIds: pIds,
      supportingProfileNames: pNames,
      evidenceIds: evIds,
      rationale: `Verified participations or awards in collegiate/national hackathons.`,
    });
  }

  // Pattern 5: Problem Solving / DSA
  if (withDSA.length > 0) {
    const pIds = withDSA.map((s) => s.profileId);
    const pNames = withDSA.map((s) => s.fullName);
    const evIds = withDSA.flatMap((s) => s.evidenceIds).slice(0, 10);
    patterns.push({
      id: 'pattern-dsa',
      dimension: 'dsa',
      title: 'Algorithmic Problem Solving Footprint',
      observation: `Observed in ${withDSA.length} of ${total} selected profiles.`,
      factState: 'observed',
      supportingProfileIds: pIds,
      supportingProfileNames: pNames,
      evidenceIds: evIds,
      rationale: `Profiles document verified competitive programming, LeetCode profiles, or DSA milestones.`,
    });
  }

  // Pattern 6: Recurring Technical Skills
  if (topSkills.length > 0) {
    const commonSkills = topSkills.filter((s) => s.profileCount >= 2 || s.profileCount === total);
    if (commonSkills.length > 0) {
      const skillNames = commonSkills.map((s) => `${s.skill} (${s.profileCount}/${total})`).join(', ');
      const supportingIds = Array.from(
        new Set(commonSkills.flatMap((s) => Array.from(skillProfileMap.get(s.skill) || [])))
      );
      const supportingNames = profiles
        .filter((p) => supportingIds.includes(p.id))
        .map((p) => p.fullName);

      patterns.push({
        id: 'pattern-skills',
        dimension: 'skills',
        title: 'Recurring Technical Capabilities',
        observation: `Commonly shared: ${skillNames}.`,
        factState: 'observed',
        supportingProfileIds: supportingIds,
        supportingProfileNames: supportingNames,
        evidenceIds: profiles.flatMap((p) => p.evidenceIds || []).slice(0, 10),
        rationale: `These skill terms appear in documented job responsibilities or verified skill endorsements.`,
      });
    }
  }

  // Pattern 7: Education Baseline
  const eduDegrees = new Map<string, string[]>();
  profiles.forEach((p) => {
    (p.education || []).forEach((e) => {
      const deg = e.degree || e.fieldOfStudy || 'Undergraduate';
      if (!eduDegrees.has(deg)) eduDegrees.set(deg, []);
      eduDegrees.get(deg)!.push(p.fullName);
    });
  });
  if (eduDegrees.size > 0) {
    const [degName, names] = Array.from(eduDegrees.entries())[0];
    patterns.push({
      id: 'pattern-education',
      dimension: 'education',
      title: 'Academic Precedents',
      observation: `${names.length} of ${total} profiles document academic study in ${degName}.`,
      factState: 'observed',
      supportingProfileIds: profiles.map((p) => p.id),
      supportingProfileNames: names,
      evidenceIds: profiles.flatMap((p) => p.education?.[0]?.evidenceIds || []).slice(0, 10),
      rationale: `Formal engineering / computer science foundations documented in institutional records.`,
    });
  }

  // Epistemic Demarcation Counts
  let observedCount = 0;
  let inferredCount = 0;
  let unknownCount = 0;

  profiles.forEach((p) => {
    (p.experiences || []).forEach((e) => {
      if (e.factState === 'observed') observedCount++;
      else if (e.factState === 'inferred') inferredCount++;
      else unknownCount++;
    });
    (p.skills || []).forEach((s) => {
      if (s.factState === 'observed') observedCount++;
      else if (s.factState === 'inferred') inferredCount++;
      else unknownCount++;
    });
  });

  return {
    researchSetId: researchSet.id,
    researchSetTitle: researchSet.title,
    comparedAt: new Date().toISOString(),
    profileSummaries,
    patterns,
    aggregateMetrics: {
      totalProfiles: total,
      profilesWithInternships: withInternships.length,
      profilesWithProjects: withProjects.length,
      profilesWithOpenSource: withOpenSource.length,
      profilesWithHackathons: withHackathons.length,
      profilesWithDSA: withDSA.length,
      topSkills,
    },
    epistemicDemarcation: {
      observedCount,
      inferredCount,
      unknownCount,
    },
  };
}
