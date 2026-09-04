import {
  UserPathJourney,
  CohortComparison,
  MyPathDescriptiveComparison,
  MyPathDescriptiveDimension,
  MyPathDescriptiveGap,
  MyPathRecommendation,
} from '@shared/index';

/**
 * Pure function to compare a UserPathJourney against a CohortComparison.
 * STRICT PRINCIPLE: Strictly descriptive, zero fake percentages/probabilities,
 * no predictive ranking, grounded non-prescriptive recommendations.
 */
export function computeMyPathDescriptiveComparison(
  userJourney: UserPathJourney,
  cohort: CohortComparison
): MyPathDescriptiveComparison {
  const totalProfiles = cohort.aggregateMetrics.totalProfiles;
  const dimensions: MyPathDescriptiveDimension[] = [];
  const gaps: MyPathDescriptiveGap[] = [];
  const recommendations: MyPathRecommendation[] = [];

  if (totalProfiles === 0) {
    return {
      id: `mypath-comp-${Date.now()}`,
      comparedAt: new Date().toISOString(),
      researchSetId: cohort.researchSetId,
      researchSetTitle: cohort.researchSetTitle,
      cohortSize: 0,
      dimensions: [],
      gaps: [],
      recommendations: [],
    };
  }

  // 1. Projects Dimension
  const userProjectsCount = userJourney.projects?.length || 0;
  const cohortProjectsCount = cohort.aggregateMetrics.profilesWithProjects;
  const projectPattern = cohort.patterns.find((p) => p.dimension === 'projects');
  dimensions.push({
    id: 'dim-projects',
    dimension: 'projects',
    label: 'Independent Project Work',
    cohortObservation: `${cohortProjectsCount} of ${totalProfiles} researched profiles show documented project evidence.`,
    userPathStatus:
      userProjectsCount > 0
        ? `Your path currently contains ${userProjectsCount} documented project(s).`
        : `Your current path has no documented projects.`,
    factState: 'observed',
    supportingProfileNames: projectPattern?.supportingProfileNames || [],
    evidenceIds: projectPattern?.evidenceIds || [],
  });

  if (userProjectsCount === 0 && cohortProjectsCount > 0) {
    gaps.push({
      id: 'gap-projects',
      dimension: 'projects',
      observedDifference:
        'Researched profiles frequently maintain verifiable standalone project artifacts.',
      cohortPrecedent: `${cohortProjectsCount} of ${totalProfiles} selected profiles have project evidence.`,
      userCurrentState: 'No documented project in your current path.',
    });
    recommendations.push({
      id: 'rec-projects',
      dimension: 'projects',
      title: 'Consider documenting independent engineering projects',
      recommendation:
        'Consider building and linking a standalone production project with clean repository commits and architecture documentation.',
      precedentSummary: 'Appears repeatedly before career milestones across selected profiles.',
      factState: 'observed',
      supportingProfileNames: projectPattern?.supportingProfileNames || [],
      evidenceIds: projectPattern?.evidenceIds || [],
    });
  }

  // 2. Internships Dimension
  const userInternshipsCount = (userJourney.experiences || []).filter(
    (e) => e.isInternship || e.title.toLowerCase().includes('intern')
  ).length;
  const cohortInternshipsCount = cohort.aggregateMetrics.profilesWithInternships;
  const internshipPattern = cohort.patterns.find((p) => p.dimension === 'internships');
  dimensions.push({
    id: 'dim-internships',
    dimension: 'internships',
    label: 'Pre-Graduate Industry Internships',
    cohortObservation: `${cohortInternshipsCount} of ${totalProfiles} researched profiles had an internship before full-time placement.`,
    userPathStatus:
      userInternshipsCount > 0
        ? `Your path documents ${userInternshipsCount} internship(s).`
        : `Your current path has no documented internship at this stage.`,
    factState: 'observed',
    supportingProfileNames: internshipPattern?.supportingProfileNames || [],
    evidenceIds: internshipPattern?.evidenceIds || [],
  });

  if (userInternshipsCount === 0 && cohortInternshipsCount > 0) {
    gaps.push({
      id: 'gap-internships',
      dimension: 'internships',
      observedDifference:
        'Industry internship experience appears repeatedly among the majority of selected profiles.',
      cohortPrecedent: `${cohortInternshipsCount} of ${totalProfiles} researched profiles had prior internships.`,
      userCurrentState: '0 documented internships in your trajectory.',
    });
    recommendations.push({
      id: 'rec-internships',
      dimension: 'internships',
      title: 'Consider targeting pre-graduate internship opportunities',
      recommendation:
        'Consider seeking apprenticeship or internship roles to establish verified industry references on your timeline.',
      precedentSummary: 'Commonly observed across researched cohort profiles.',
      factState: 'observed',
      supportingProfileNames: internshipPattern?.supportingProfileNames || [],
      evidenceIds: internshipPattern?.evidenceIds || [],
    });
  }

  // 3. Open Source Dimension
  const userOpenSourceCount = userJourney.openSource?.length || 0;
  const cohortOpenSourceCount = cohort.aggregateMetrics.profilesWithOpenSource;
  const osPattern = cohort.patterns.find((p) => p.dimension === 'opensource');
  dimensions.push({
    id: 'dim-opensource',
    dimension: 'opensource',
    label: 'Open Source & Public Repositories',
    cohortObservation: `${cohortOpenSourceCount} of ${totalProfiles} researched profiles demonstrate open source contributions or GitHub repositories.`,
    userPathStatus:
      userOpenSourceCount > 0
        ? `Your path documents ${userOpenSourceCount} open source contribution(s).`
        : `No open source contributions documented in your path.`,
    factState: 'observed',
    supportingProfileNames: osPattern?.supportingProfileNames || [],
    evidenceIds: osPattern?.evidenceIds || [],
  });

  if (userOpenSourceCount === 0 && cohortOpenSourceCount > 0) {
    recommendations.push({
      id: 'rec-opensource',
      dimension: 'opensource',
      title: 'Consider publishing code or contributing to open-source libraries',
      recommendation:
        'Consider making relevant repository code public or contributing minor bugfixes to upstream tools.',
      precedentSummary: 'Observed among selected profiles with public repository evidence.',
      factState: 'observed',
      supportingProfileNames: osPattern?.supportingProfileNames || [],
      evidenceIds: osPattern?.evidenceIds || [],
    });
  }

  // 4. DSA / Problem Solving Dimension
  const userDsaCount = userJourney.dsa?.problemCount || 0;
  const cohortDsaCount = cohort.aggregateMetrics.profilesWithDSA;
  const dsaPattern = cohort.patterns.find((p) => p.dimension === 'dsa');
  dimensions.push({
    id: 'dim-dsa',
    dimension: 'dsa',
    label: 'Algorithmic Problem Solving',
    cohortObservation: `${cohortDsaCount} of ${totalProfiles} researched profiles document algorithmic practice or competitive problem solving.`,
    userPathStatus:
      userDsaCount > 0
        ? `Documented ${userDsaCount} verified problems (${userJourney.dsa.platform || 'DSA'}).`
        : `No verified algorithmic problem-solving footprint documented.`,
    factState: 'observed',
    supportingProfileNames: dsaPattern?.supportingProfileNames || [],
    evidenceIds: dsaPattern?.evidenceIds || [],
  });

  // 5. Hackathons Dimension
  const userHackathonsCount = userJourney.hackathons?.length || 0;
  const cohortHackathonsCount = cohort.aggregateMetrics.profilesWithHackathons;
  const hackPattern = cohort.patterns.find((p) => p.dimension === 'hackathons');
  dimensions.push({
    id: 'dim-hackathons',
    dimension: 'hackathons',
    label: 'Hackathons & Competitions',
    cohortObservation: `${cohortHackathonsCount} of ${totalProfiles} researched profiles participate in hackathons or engineering contests.`,
    userPathStatus:
      userHackathonsCount > 0
        ? `Your path includes ${userHackathonsCount} hackathon entry/entries.`
        : `No hackathon participation documented in your path.`,
    factState: 'observed',
    supportingProfileNames: hackPattern?.supportingProfileNames || [],
    evidenceIds: hackPattern?.evidenceIds || [],
  });

  // 6. Skills Adjacency Dimension
  const userSkillSet = new Set((userJourney.skills || []).map((s) => s.toLowerCase().trim()));
  const missingCohortSkills = cohort.aggregateMetrics.topSkills
    .filter((s) => !userSkillSet.has(s.skill.toLowerCase().trim()))
    .slice(0, 5);

  if (missingCohortSkills.length > 0) {
    const missingSkillNames = missingCohortSkills.map((s) => s.skill).join(', ');
    dimensions.push({
      id: 'dim-skills',
      dimension: 'skills',
      label: 'Technical Skill Footprint',
      cohortObservation: `Commonly shared skills across cohort: ${cohort.aggregateMetrics.topSkills
        .slice(0, 4)
        .map((s) => s.skill)
        .join(', ')}.`,
      userPathStatus: `Your documented skills: ${
        userJourney.skills.slice(0, 4).join(', ') || 'None documented'
      }.`,
      factState: 'observed',
      supportingProfileNames: cohort.patterns.find((p) => p.dimension === 'skills')?.supportingProfileNames || [],
      evidenceIds: [],
    });

    recommendations.push({
      id: 'rec-skills',
      dimension: 'skills',
      title: `Consider exploring adjacent technologies: ${missingSkillNames}`,
      recommendation: `Consider hands-on exploration or incorporating technologies like ${missingSkillNames} into your upcoming project work.`,
      precedentSummary: 'Appears frequently across researched profiles with similar trajectories.',
      factState: 'observed',
      supportingProfileNames: [],
      evidenceIds: [],
    });
  }

  return {
    id: `mypath-comp-${Date.now()}`,
    comparedAt: new Date().toISOString(),
    researchSetId: cohort.researchSetId,
    researchSetTitle: cohort.researchSetTitle,
    cohortSize: totalProfiles,
    dimensions,
    gaps,
    recommendations,
  };
}
