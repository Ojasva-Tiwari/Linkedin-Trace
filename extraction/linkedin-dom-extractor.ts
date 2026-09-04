/**
 * TRACE - LinkedIn DOM Extractor (Phase 1)
 * 
 * Principles:
 * 1. Strictly visible page reading: Only accesses legitimately rendered DOM in the user's active session.
 * 2. No private bypass: Never circumvents authentication, anti-bot mechanisms, or hidden paywalls.
 * 3. Passive extraction: Does not simulate aggressive scrolling or rate-limited network scraping.
 * 4. Grounded provenance: Attaches DOM selectors and snippet anchors for every extracted field.
 * 5. Epistemic rigor: All extracted fields remain strictly factState = 'observed'.
 */

import {
  ExtractedRawProfile,
  ProfileDetectionResult,
  RawExperienceItem,
  RawEducationItem,
  RawSkillItem,
  RawProjectItem,
  RawCertificationItem,
  RawAwardItem,
  RawLanguageItem,
} from './types';
import {
  extractActivityPostsFromDoc,
  isActivitySectionRendered,
} from './surfaces/linkedin-activity-surface';

/**
 * Checks if the current document is legitimately a LinkedIn individual profile.
 */
export function detectLinkedInProfile(url = window.location.href): ProfileDetectionResult {
  try {
    const parsed = new URL(url);
    const isLinkedIn = parsed.hostname.includes('linkedin.com');
    const path = parsed.pathname;

    if (!isLinkedIn || !path.includes('/in/')) {
      return { isProfile: false };
    }

    // Extract canonical username from /in/<username>/...
    const match = path.match(/\/in\/([^/?#]+)/);
    const canonicalIdentifier = match ? match[1] : undefined;

    if (!canonicalIdentifier) {
      return { isProfile: false };
    }

    // Quick identity check from DOM
    const nameEl = document.querySelector<HTMLElement>(
      'h1.text-heading-xlarge, .pv-text-details__left-panel h1, h1[class*="v-align-middle"], .top-card-layout__title, main h1'
    );
    const headlineEl = document.querySelector<HTMLElement>(
      '.text-body-medium.break-words, .pv-text-details__left-panel div.text-body-medium, .top-card-layout__headline, main div.ph5 .text-body-medium'
    );

    const fullName = nameEl?.innerText.trim() || document.title.split('|')[0]?.trim() || canonicalIdentifier;
    const headline = headlineEl?.innerText.trim() || undefined;

    return {
      isProfile: true,
      canonicalIdentifier,
      url: `https://www.linkedin.com/in/${canonicalIdentifier}/`,
      fullName,
      headline,
    };
  } catch {
    return { isProfile: false };
  }
}

/**
 * Extracts visible profile details from the current rendered DOM and schema metadata.
 */
export function extractLinkedInProfileFromDom(): ExtractedRawProfile | null {
  const detection = detectLinkedInProfile();
  if (!detection.isProfile || !detection.canonicalIdentifier) {
    return null;
  }

  const canonicalIdentifier = detection.canonicalIdentifier;
  const canonicalUrl = detection.url || window.location.href;

  const sectionsRendered = {
    about: false,
    experience: false,
    education: false,
    skills: false,
    certifications: false,
    projects: false,
    awards: false,
    languages: false,
    activity: false,
  };

  // 1. Identity & Top Card
  const nameEl = document.querySelector<HTMLElement>(
    'h1.text-heading-xlarge, .pv-text-details__left-panel h1, h1[class*="v-align-middle"], .top-card-layout__title, main h1'
  );
  let fullName = nameEl?.innerText.trim() || detection.fullName || canonicalIdentifier;

  const headlineEl = document.querySelector<HTMLElement>(
    '.text-body-medium.break-words, .pv-text-details__left-panel div.text-body-medium, .top-card-layout__headline, main div.ph5 .text-body-medium'
  );
  let headline = headlineEl?.innerText.trim() || undefined;

  const locationEl = document.querySelector<HTMLElement>(
    '.pv-text-details__left-panel span.text-body-small.inline, .pv-text-details__left-panel span.text-body-small, span.text-body-small[class*="break-words"], .top-card__subline-item, .profile-info-subheader'
  );
  let location = locationEl?.innerText.trim() || undefined;

  const avatarEl = document.querySelector<HTMLImageElement>(
    'img.pv-top-card-profile-picture__image, img.evi-image[alt*="' + fullName + '"], img[class*="profile-photo"], img[class*="top-card-layout__entity-image"]'
  );
  const avatarUrl = avatarEl?.src || undefined;

  // 2. About Summary
  let aboutSummary: string | undefined;
  const aboutSection = findSectionByHeading(['about', 'summary']);
  if (aboutSection) {
    sectionsRendered.about = true;
    const textEl = aboutSection.querySelector<HTMLElement>(
      '.inline-show-more-text, .pv-about__summary-text, .core-section-container__content, span[aria-hidden="true"]'
    );
    if (textEl) {
      aboutSummary = textEl.innerText.trim();
    }
  }

  // 3. Experience Section (with multi-role grouping support)
  const experiences: RawExperienceItem[] = [];
  const expSection = findSectionByHeading(['experience', 'work experience']);
  if (expSection) {
    sectionsRendered.experience = true;
    const items = expSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity, li.experience-item');
    items.forEach((item, idx) => {
      const parsedList = parseExperienceItem(item as HTMLElement, idx);
      parsedList.forEach((parsed) => {
        if (parsed) experiences.push(parsed);
      });
    });
  }

  // 4. Education Section
  const education: RawEducationItem[] = [];
  const eduSection = findSectionByHeading(['education', 'academic']);
  if (eduSection) {
    sectionsRendered.education = true;
    const items = eduSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity, li.education-item, li.education__item');
    items.forEach((item, idx) => {
      const parsed = parseEducationItem(item as HTMLElement, idx);
      if (parsed) {
        education.push(parsed);
      }
    });
  }

  // 5. Skills Section
  const skills: RawSkillItem[] = [];
  const skillSection = findSectionByHeading(['skills', 'featured skills', 'top skills']);
  if (skillSection) {
    sectionsRendered.skills = true;
    const items = skillSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity, li.skills__item, li.skill-item');
    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const skillNameEl = el.querySelector<HTMLElement>('span[aria-hidden="true"], .mr1.hoverable-link-text, .skill-name');
      const name = skillNameEl?.innerText.trim();
      if (name && !skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        skills.push({
          name,
          domSelector: `#skills li:nth-child(${idx + 1})`,
          snippet: el.innerText.slice(0, 120),
        });
      }
    });
  }

  // 6. Certifications Section
  const certifications: RawCertificationItem[] = [];
  const certSection = findSectionByHeading(['licenses & certifications', 'licenses and certifications', 'certifications']);
  if (certSection) {
    sectionsRendered.certifications = true;
    const items = certSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity, li.certifications__item');
    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const textSpans = Array.from(el.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
        .map((s) => s.innerText.trim())
        .filter(Boolean);

      const linkEl = el.querySelector<HTMLAnchorElement>('a[href*="credential"], a[href*="cert"], a.optional-action-target-wrapper');
      const credentialUrl = linkEl?.href || undefined;

      if (textSpans.length > 0) {
        const name = textSpans[0];
        const issuer = textSpans[1] || 'Issuing Organization';
        const dateRangeRaw = textSpans[2] || undefined;
        certifications.push({
          name,
          issuingOrganization: issuer,
          dateRangeRaw,
          credentialUrl,
          domSelector: `#licenses_and_certifications li:nth-child(${idx + 1})`,
          snippet: el.innerText.slice(0, 150),
        });
      }
    });
  }

  // 7. Projects Section
  const projects: RawProjectItem[] = [];
  const projSection = findSectionByHeading(['projects']);
  if (projSection) {
    sectionsRendered.projects = true;
    const items = projSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity, li.projects__item');
    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const textSpans = Array.from(el.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
        .map((s) => s.innerText.trim())
        .filter(Boolean);

      const linkEl = el.querySelector<HTMLAnchorElement>('a[href]');
      const url = linkEl?.href || undefined;

      if (textSpans.length > 0) {
        const title = textSpans[0];
        const description = textSpans.slice(1).join(' · ');
        const dateRangeRaw = textSpans.find((t) => /\d{4}/.test(t));
        const lowerDesc = (title + ' ' + description).toLowerCase();

        projects.push({
          title,
          description,
          url,
          dateRangeRaw,
          isHackathon: lowerDesc.includes('hackathon') || lowerDesc.includes('hack '),
          isOpenSource: lowerDesc.includes('open source') || (url?.includes('github.com') ?? false),
          domSelector: `#projects li:nth-child(${idx + 1})`,
          snippet: el.innerText.slice(0, 160),
        });
      }
    });
  }

  // 8. Honors & Awards Section
  const awards: RawAwardItem[] = [];
  const awardSection = findSectionByHeading(['honors & awards', 'honors and awards', 'honors', 'awards']);
  if (awardSection) {
    sectionsRendered.awards = true;
    const items = awardSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity');
    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const textSpans = Array.from(el.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
        .map((s) => s.innerText.trim())
        .filter(Boolean);

      if (textSpans.length > 0) {
        const title = textSpans[0];
        const issuer = textSpans[1] || undefined;
        const issueDate = textSpans[2] || undefined;
        const description = textSpans.slice(3).join(' · ') || undefined;

        awards.push({
          title,
          issuer,
          issueDate,
          description,
          domSelector: `#honors_and_awards li:nth-child(${idx + 1})`,
          snippet: el.innerText.slice(0, 160),
        });
      }
    });
  }

  // 9. Languages Section
  const languages: RawLanguageItem[] = [];
  const langSection = findSectionByHeading(['languages']);
  if (langSection) {
    sectionsRendered.languages = true;
    const items = langSection.querySelectorAll('li.artdeco-list__item, div.pvs-entity');
    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const textSpans = Array.from(el.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
        .map((s) => s.innerText.trim())
        .filter(Boolean);

      if (textSpans.length > 0) {
        const name = textSpans[0];
        const proficiency = textSpans[1] || undefined;
        languages.push({
          name,
          proficiency,
          domSelector: `#languages li:nth-child(${idx + 1})`,
          snippet: el.innerText.slice(0, 120),
        });
      }
    });
  }

  // 10. Supplement from JSON-LD Schema.org Person (canonical metadata fallback)
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
        for (const item of graph) {
          if (item['@type'] === 'Person') {
            if (!aboutSummary && item.description) {
              aboutSummary = item.description;
              sectionsRendered.about = true;
            }
            if (!location && item.address?.addressLocality) {
              location = item.address.addressLocality;
            }
            if (!headline && item.jobTitle) {
              const titles = Array.isArray(item.jobTitle)
                ? item.jobTitle.filter((t: string) => !t.includes('*'))
                : [item.jobTitle];
              if (titles.length > 0 && titles[0]) {
                headline = titles[0];
              }
            }
            if (experiences.length === 0 && Array.isArray(item.worksFor)) {
              sectionsRendered.experience = true;
              for (let i = 0; i < item.worksFor.length; i++) {
                const org = item.worksFor[i];
                if (org && org.name && !org.name.includes('***')) {
                  experiences.push({
                    title: headline || 'Role',
                    companyName: org.name,
                    location: org.location || undefined,
                    domSelector: `script[type="application/ld+json"] worksFor[${i}]`,
                    snippet: `${org.name} - ${headline || 'Professional'}`,
                  });
                }
              }
            }
            if (education.length === 0 && Array.isArray(item.alumniOf)) {
              sectionsRendered.education = true;
              for (let i = 0; i < item.alumniOf.length; i++) {
                const edu = item.alumniOf[i];
                if (edu && edu.name) {
                  const startYear = edu.member?.startDate ? String(edu.member.startDate) : undefined;
                  const endYear = edu.member?.endDate ? String(edu.member.endDate) : undefined;
                  const dateRangeRaw = startYear && endYear ? `${startYear} - ${endYear}` : (startYear || endYear || undefined);
                  education.push({
                    schoolName: edu.name,
                    dateRangeRaw,
                    domSelector: `script[type="application/ld+json"] alumniOf[${i}]`,
                    snippet: `${edu.name} (${dateRangeRaw || 'Alumnus'})`,
                  });
                }
              }
            }
            if (skills.length === 0 && Array.isArray(item.knowsAbout)) {
              sectionsRendered.skills = true;
              for (let i = 0; i < item.knowsAbout.length; i++) {
                const skillName = typeof item.knowsAbout[i] === 'string' ? item.knowsAbout[i] : item.knowsAbout[i]?.name;
                if (skillName) {
                  skills.push({
                    name: skillName,
                    domSelector: `script[type="application/ld+json"] knowsAbout[${i}]`,
                    snippet: skillName,
                  });
                }
              }
            }
          }
        }
      } catch {
        // Ignore JSON-LD parse errors
      }
    });
  } catch {
    // Ignore JSON-LD query errors
  }

  // Determine current role from experiences or headline
  let currentRole: string | undefined;
  const activeExp = experiences.find((e) => e.isCurrent || (e.dateRangeRaw && /present/i.test(e.dateRangeRaw)));
  if (activeExp) {
    currentRole = `${activeExp.title} at ${activeExp.companyName}`;
  } else if (experiences.length > 0) {
    currentRole = `${experiences[0].title} at ${experiences[0].companyName}`;
  } else if (headline) {
    currentRole = headline;
  }

  // Extract Activity & Posts
  const posts = extractActivityPostsFromDoc(document, canonicalUrl);
  sectionsRendered.activity = isActivitySectionRendered(document) || posts.length > 0;

  const completeness = experiences.length > 0 || education.length > 0 || posts.length > 0 ? 'full' : 'header_only';

  return {
    url: canonicalUrl,
    canonicalIdentifier,
    fullName,
    headline,
    location,
    aboutSummary,
    currentRole,
    avatarUrl,
    experiences,
    education,
    skills,
    certifications,
    projects,
    awards,
    languages,
    posts,
    sectionsRendered,
    extractedAt: new Date().toISOString(),
    sourceType: 'linkedin_dom',
    completeness,
  };
}

/**
 * Helper to locate sections by semantic heading or element ID.
 */
function findSectionByHeading(possibleHeadings: string[]): HTMLElement | null {
  for (const h of possibleHeadings) {
    const idSafe = h.replace(/\s+/g, '_').toLowerCase();
    const el = document.getElementById(idSafe);
    if (el) {
      return el.closest('section') || el;
    }
  }

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
  for (const section of sections) {
    const heading = section.querySelector<HTMLElement>(
      'h2, .pvs-header__title, h2 span[aria-hidden="true"], h2.core-section-container__title'
    );
    if (heading) {
      const text = heading.innerText.toLowerCase().trim();
      if (possibleHeadings.some((candidate) => text.includes(candidate))) {
        return section;
      }
    }
  }

  return null;
}

/**
 * Parse an experience item element from LinkedIn's list structure.
 * Supports both single-role cards and grouped multi-role cards at the same company.
 */
function parseExperienceItem(item: HTMLElement, index: number): RawExperienceItem[] {
  // Check for nested sub-roles (LinkedIn multi-role grouped company format)
  const nestedList = item.querySelectorAll<HTMLElement>('li.pvs-list__item, li.pvs-entity__sub-components, ul.pvs-list li');
  if (nestedList.length > 1) {
    // Extract outer company name
    const outerSpans = Array.from(item.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
      .map((s) => s.innerText.trim())
      .filter(Boolean);
    const companyName = outerSpans[0] || 'Company';

    const results: RawExperienceItem[] = [];
    nestedList.forEach((subItem, subIdx) => {
      const subSpans = Array.from(subItem.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
        .map((s) => s.innerText.trim())
        .filter(Boolean);

      if (subSpans.length > 0) {
        const title = subSpans[0] || 'Role';
        const dateRangeRaw = subSpans[1] || undefined;
        const location = subSpans[2] || undefined;
        const description = subSpans.slice(3).join('\n') || undefined;
        const isCurrent = dateRangeRaw?.toLowerCase().includes('present') || false;

        results.push({
          title,
          companyName,
          dateRangeRaw,
          isCurrent,
          location,
          description,
          domSelector: `#experience li:nth-child(${index + 1}) sub-item:nth-child(${subIdx + 1})`,
          snippet: subItem.innerText.slice(0, 200),
        });
      }
    });

    if (results.length > 0) return results;
  }

  // Public profile class checks
  const publicTitle = item.querySelector<HTMLElement>('.experience-item__title, .profile-section-card__title');
  const publicCompany = item.querySelector<HTMLElement>('.experience-item__subtitle, .profile-section-card__subtitle');
  const publicDuration = item.querySelector<HTMLElement>('.experience-item__duration, .date-range');
  const publicLocation = item.querySelector<HTMLElement>('.experience-item__location');
  const publicDescription = item.querySelector<HTMLElement>('.experience-item__description, .show-more-less-text');

  if (publicTitle || publicCompany) {
    const title = publicTitle?.innerText.trim() || 'Role';
    const companyName = publicCompany?.innerText.trim() || 'Company';
    const dateRangeRaw = publicDuration?.innerText.trim();
    const isCurrent = dateRangeRaw?.toLowerCase().includes('present') || false;

    return [
      {
        title,
        companyName,
        dateRangeRaw,
        isCurrent,
        location: publicLocation?.innerText.trim(),
        description: publicDescription?.innerText.trim(),
        domSelector: `.experience-item:nth-child(${index + 1})`,
        snippet: item.innerText.slice(0, 200),
      },
    ];
  }

  // Logged-in flat role check
  const textSpans = Array.from(item.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
    .map((s) => s.innerText.trim())
    .filter(Boolean);

  if (textSpans.length === 0) {
    const fallbackText = item.innerText.trim().split('\n').filter(Boolean);
    if (fallbackText.length === 0) return [];
    return [
      {
        title: fallbackText[0] || 'Role',
        companyName: fallbackText[1] || 'Company',
        domSelector: `#experience li:nth-child(${index + 1})`,
        snippet: item.innerText.slice(0, 160),
      },
    ];
  }

  const title = textSpans[0] || 'Role';
  let companyRaw = textSpans[1] || '';
  const dateRangeRaw = textSpans[2] || undefined;
  const location = textSpans[3] || undefined;
  const description = textSpans.slice(4).join('\n') || undefined;

  const companyParts = companyRaw.split('·');
  const companyName = (companyParts[0] || companyRaw).trim() || 'Company';
  const isCurrent = dateRangeRaw?.toLowerCase().includes('present') || false;

  return [
    {
      title,
      companyName,
      dateRangeRaw,
      isCurrent,
      location,
      description,
      domSelector: `#experience li:nth-child(${index + 1})`,
      snippet: item.innerText.slice(0, 200),
    },
  ];
}

/**
 * Parse an education item element from LinkedIn's list structure.
 */
function parseEducationItem(item: HTMLElement, index: number): RawEducationItem | null {
  // Public profile class checks
  const publicSchool = item.querySelector<HTMLElement>('.education__item--school-name, .profile-section-card__title');
  const publicDegree = item.querySelector<HTMLElement>('.education__item--degree-info, .profile-section-card__subtitle');
  const publicDuration = item.querySelector<HTMLElement>('.education__item--duration, .date-range');

  if (publicSchool || publicDegree) {
    const degreeRaw = publicDegree?.innerText.trim();
    let degree = degreeRaw;
    let fieldOfStudy: string | undefined;
    if (degreeRaw && degreeRaw.includes(',')) {
      const parts = degreeRaw.split(',');
      degree = parts[0]?.trim();
      fieldOfStudy = parts.slice(1).join(',').trim();
    }

    return {
      schoolName: publicSchool?.innerText.trim() || 'Institution',
      degree,
      fieldOfStudy,
      dateRangeRaw: publicDuration?.innerText.trim(),
      domSelector: `.education-item:nth-child(${index + 1})`,
      snippet: item.innerText.slice(0, 180),
    };
  }

  const textSpans = Array.from(item.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
    .map((s) => s.innerText.trim())
    .filter(Boolean);

  if (textSpans.length === 0) {
    const fallbackText = item.innerText.trim().split('\n').filter(Boolean);
    if (fallbackText.length === 0) return null;
    return {
      schoolName: fallbackText[0] || 'Institution',
      degree: fallbackText[1] || undefined,
      domSelector: `#education li:nth-child(${index + 1})`,
      snippet: item.innerText.slice(0, 160),
    };
  }

  const schoolName = textSpans[0] || 'Institution';
  const degreeRaw = textSpans[1] || undefined;
  let degree = degreeRaw;
  let fieldOfStudy: string | undefined;
  if (degreeRaw && degreeRaw.includes(',')) {
    const parts = degreeRaw.split(',');
    degree = parts[0]?.trim();
    fieldOfStudy = parts.slice(1).join(',').trim();
  }
  const dateRangeRaw = textSpans[2] || undefined;
  const description = textSpans.slice(3).join('\n') || undefined;

  return {
    schoolName,
    degree,
    fieldOfStudy,
    dateRangeRaw,
    description,
    domSelector: `#education li:nth-child(${index + 1})`,
    snippet: item.innerText.slice(0, 180),
  };
}
