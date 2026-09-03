# TRACE Architecture & Data Flow

This document details the system architecture, component relationships, and data contracts for **TRACE** — a local-first professional trajectory and evidence analyzer.

## 1. High-Level Data Flow

```
+-------------------------------------------------------------+
| Chrome Browser (LinkedIn Tab)                                |
|  - Content script injected (passive listener)                |
+------------------------------+------------------------------+
                               | User clicks "Capture Active Page"
                               v
+-------------------------------------------------------------+
| Background Service Worker (Manifest V3)                     |
|  - Validates userInitiated: true                             |
|  - Coordinates active tab messaging                         |
+------------------------------+------------------------------+
                               | Returns RawCapturePackage
                               v
+-------------------------------------------------------------+
| Side Panel UI (React + TypeScript)                          |
|  - Invokes AIProvider.extractEvidence()                     |
|  - Invokes AIProvider.structureProfile()                    |
+------------------------------+------------------------------+
                               | Stores structured artifacts
                               v
+-------------------------------------------------------------+
| Local Storage Layer (IndexedDB + chrome.storage)            |
|  - Stores TraceProfile (one person only)                     |
|  - Stores EvidenceItems (first-class atomic proofs)         |
|  - Stores ResearchSets (explicitly grouped cohorts)          |
|  - Stores MyPathComparisons (grounded personal gap analysis) |
+-------------------------------------------------------------+
```

## 2. Epistemic Status (Observed vs Inferred vs Unknown)

Every claim within TRACE carries a mandatory `FactState`:

1. **Observed**: Explicitly extracted from the captured page DOM or metadata. Guaranteed to match the ground truth of the webpage.
2. **Inferred**: Synthesized via reasoning or AI (e.g. role trajectory mapping, estimated skill clusters). Must cite the exact observed evidence items used as premises.
3. **Unknown**: Acknowledged as unobserved or missing from the page.

### Strict Scoring Invariants
- **No Fabricated Match Percentages**: No "88.7% match" or artificial verification numbers.
- **No Fake Skill Scores**: No "Python: 95/100" proficiency ratings.

## 3. Product Domains

| Product Area | Scope | Core Data Entities |
| :--- | :--- | :--- |
| **Profile** | One person only | `TraceProfile`, `TraceExperience`, `TraceSkill`, `EvidenceItem` |
| **Research** | Multiple explicitly saved profiles | `ResearchSet`, `ResearchProfileRef`, `ResearchCriteria` |
| **My Path** | User's profile vs research benchmark | `MyPathComparison`, `TrajectoryComparisonPoint`, `PreparationActionItem` |

## 4. Unified Views over Profile Data
The **Timeline**, **Skills**, **Preparation**, and **Summary** tabs are dynamic projections over the canonical `TraceProfile` and associated `EvidenceItem` records. Updating the canonical profile propagates changes across all views consistently.

## 5. Storage Architecture
- **IndexedDB (`trace_local_db`)**:
  - `profiles`: Keyed by profile ID.
  - `evidence`: Keyed by atomic evidence ID.
  - `research_sets`: Keyed by research set ID.
  - `mypath_comparisons`: Keyed by comparison ID.
- **chrome.storage.local**:
  - Extension settings, UI theme, active profile pointer, and AI provider selection.
