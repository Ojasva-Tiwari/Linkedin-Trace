/**
 * TRACE - LinkedIn Activity Post Epistemic Classifier
 * 
 * Classifies visible activity posts into grounded professional categories.
 * Strict principle: Does not force a classification when evidence is insufficient;
 * falls back to 'other/unclassified'.
 */

import { PostCategory } from '@shared/index';

interface ClassificationRule {
  category: PostCategory;
  patterns: RegExp[];
  keywordWeight: number;
}

const RULES: ClassificationRule[] = [
  {
    category: 'hackathon/competition',
    patterns: [
      /\bhackathon\b/i,
      /\bhack\b/i,
      /\bdevpost\b/i,
      /\b1st place\b/i,
      /\b2nd place\b/i,
      /\b3rd place\b/i,
      /\bwinner\b/i,
      /\brunner[- ]?up\b/i,
      /\bdatathon\b/i,
      /\bideathon\b/i,
      /\bcode sprint\b/i,
    ],
    keywordWeight: 10,
  },
  {
    category: 'open source',
    patterns: [
      /\bopen[- ]?source\b/i,
      /github\.com/i,
      /\bpull request\b/i,
      /\bpr merged\b/i,
      /\bcontributor\b/i,
      /\bcontributed to\b/i,
      /\bopen source contributor\b/i,
      /\boss\b/i,
      /\bgitlab\.com/i,
    ],
    keywordWeight: 9,
  },
  {
    category: 'internship',
    patterns: [
      /\bintern(?:ship)?\b/i,
      /\bsummer intern\b/i,
      /\bsummer analyst\b/i,
      /\bwinter intern\b/i,
      /\bco[- ]?op\b/i,
      /\bjoining as an intern\b/i,
      /\bcompleted my internship\b/i,
    ],
    keywordWeight: 9,
  },
  {
    category: 'job/career update',
    patterns: [
      /starting a new position/i,
      /started a new position/i,
      /excited to announce that i('m| am) (joining|starting)/i,
      /thrilled to join/i,
      /promoted to/i,
      /happy to share that i('m| am) starting/i,
      /started as/i,
      /career update/i,
      /accepted an offer/i,
      /joining (the team at|as)/i,
    ],
    keywordWeight: 8,
  },
  {
    category: 'DSA/problem solving',
    patterns: [
      /\bleetcode\b/i,
      /\bcodeforces\b/i,
      /\bhackerrank\b/i,
      /\bcodechef\b/i,
      /\bdsa\b/i,
      /\bdata structures\b/i,
      /\bpotd\b/i,
      /\bproblem of the day\b/i,
      /\bcontest rating\b/i,
      /\bsolved\s+\d+\s+(problems|questions)/i,
      /\bknight on leetcode\b/i,
      /\bguardian on leetcode\b/i,
    ],
    keywordWeight: 8,
  },
  {
    category: 'certification/course',
    patterns: [
      /\bcertif(ied|ication)\b/i,
      /\bcoursera\b/i,
      /\budemy\b/i,
      /\bcompleted the course\b/i,
      /\baws certified\b/i,
      /\bazure certified\b/i,
      /\bgcp certified\b/i,
      /\bbadge earned\b/i,
      /\bcredential id\b/i,
      /\bcompleted the specialization\b/i,
    ],
    keywordWeight: 7,
  },
  {
    category: 'project',
    patterns: [
      /\bbuilt a\b/i,
      /\bbuilding a\b/i,
      /\blaunched\b/i,
      /\bside project\b/i,
      /\bdemo:\b/i,
      /\brepo:\b/i,
      /\btech stack:\b/i,
      /\bstack:\b/i,
      /\bdeployed on\b/i,
      /\bcheck out my (new )?project\b/i,
      /\bweb application\b/i,
      /\bmobile app\b/i,
    ],
    keywordWeight: 6,
  },
  {
    category: 'achievement/award',
    patterns: [
      /honored to receive/i,
      /\bawarded\b/i,
      /\brecognition\b/i,
      /\bscholarship\b/i,
      /\bfellowship\b/i,
      /\bdean'?s list\b/i,
      /\bgold medalist\b/i,
    ],
    keywordWeight: 6,
  },
  {
    category: 'technical learning',
    patterns: [
      /\btoday i learned\b/i,
      /\btil:\b/i,
      /\bdeep dive into\b/i,
      /\barchitectural pattern\b/i,
      /\bsystem design\b/i,
      /\bkey takeaways\b/i,
      /\bunderstanding how\b/i,
    ],
    keywordWeight: 5,
  },
];

/**
 * Categorizes a post's content based on conservative grounded evidence.
 */
export function classifyPost(
  visibleText: string,
  links: string[] = [],
  hashtags: string[] = []
): PostCategory {
  if (!visibleText || visibleText.trim().length < 10) {
    return 'other/unclassified';
  }

  const combinedText = `${visibleText} ${links.join(' ')} ${hashtags.join(' ')}`;

  let bestCategory: PostCategory = 'other/unclassified';
  let bestScore = 0;

  for (const rule of RULES) {
    let matches = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(combinedText)) {
        matches++;
      }
    }

    if (matches > 0) {
      const score = matches * rule.keywordWeight;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = rule.category;
      }
    }
  }

  return bestCategory;
}
