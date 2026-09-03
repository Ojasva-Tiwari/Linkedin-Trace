---
name: trace-evidence
description: Epistemic rigor, first-class evidence schemas, provenance tracking, and strict prohibitions against fake scores in TRACE.
---

# TRACE Evidence & Epistemic Rigor

Evidence is a first-class citizen in TRACE. Every claim, skill, experience, and milestone must trace back to concrete proof.

## 1. The Epistemic Triad (`FactState`)

Every fact or claim in TRACE is classified into exactly one epistemic state:

- **`observed`**:
  - The fact was directly visible and extracted from the captured page DOM, meta tags, or structured text.
  - Must include physical `ProvenanceSource` (URL, captured timestamp, context snippet, and DOM selector if available).
- **`inferred`**:
  - The fact was derived or synthesized by reasoning or an AI provider (e.g. estimating a domain skill from years of responsibilities, or detecting a role transition).
  - Must include an explanatory rationale and cite the underlying observed evidence IDs.
- **`unknown`**:
  - Information that was checked for but is explicitly absent, ambiguous, or unverifiable from the available source material.

## 2. Absolute Prohibitions

When generating, processing, or displaying data in TRACE, you must adhere strictly to these rules:

1. **NO Fabricated Verification Percentages**:
   - Never generate pseudo-scientific scores like "94.8% profile verification" or "82% authenticity score".
   - Confidence must be represented qualitatively (`high`, `medium`, `low`) accompanied by the factual basis.
2. **NO Fake Skill Scores**:
   - Never generate arbitrary proficiency numbers like "Python: 92/100" or "Leadership: 85%".
   - Document skills as either observed (explicitly listed on the profile) or inferred (demonstrated through specific role responsibilities), accompanied by verbatim context quotes.
3. **Immutable Evidence Links**:
   - Deleting or editing a profile item must never silently orphan or corrupt the underlying atomic evidence records in IndexedDB.
