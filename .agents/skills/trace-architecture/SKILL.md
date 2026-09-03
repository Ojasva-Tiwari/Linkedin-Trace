---
name: trace-architecture
description: Core architectural principles, domain separation, and local-first data model rules for the TRACE project.
---

# TRACE Architectural Rules & System Design

This skill defines the non-negotiable architectural invariants and domain separations for the **TRACE** project.

## 1. The Three Product Areas

TRACE is structured into three distinct product areas:

1. **Profile**: Represents **one person only**.
   - Contains the canonical `TraceProfile` for a single candidate or professional.
   - Never blends multiple people into a single profile.
2. **Research**: Represents **multiple explicitly saved profiles**.
   - Used for cohort analysis, role trajectory comparisons, and market benchmarking.
   - Profiles are saved intentionally by the user into named `ResearchSet` cohorts.
3. **My Path**: Represents **the user's own profile compared against selected research**.
   - Compares the user's canonical profile against benchmark trajectories in a ResearchSet.
   - Produces grounded preparation action items and trajectory gap analysis.

## 2. Views Over Unified Data

In TRACE, the following are **not** separate silos or independent data copies:
- **Timeline**
- **Skills**
- **Preparation**
- **Summary**

They are **projections and views over the same underlying canonical data model** (`TraceProfile` and associated `EvidenceItem` records).
- Modifying or adding a milestone updates the canonical profile; the Timeline and Summary views project this change automatically.
- No view is permitted to invent, mutate, or contradict facts stored in the underlying profile.

## 3. Local-First Guarantees

- **No Cloud Database**: The personal version of TRACE operates entirely on the user's machine.
- **IndexedDB**: Used for structured, high-volume local storage (`TraceProfile`, `EvidenceItem`, `ResearchSet`, `MyPathComparison`).
- **chrome.storage**: Used strictly for lightweight extension state and user preferences (active profile ID, UI theme, AI provider preference).
- **Data Privacy**: Raw page captures and extracted profiles never leave the user's device unless the user explicitly routes extraction through a chosen external AI provider.
