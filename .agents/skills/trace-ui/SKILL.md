---
name: trace-ui
description: Frontend guidelines for TRACE, Stitch component integration, epistemic badge display, and state management rules.
---

# TRACE Frontend & UI Integration Rules

This skill governs the presentation layer, Stitch UI integrations, and React state management for TRACE.

## 1. Structural Shell & Stitch Integration

The TRACE UI is organized around a clean structural shell ready to receive rich frontend components from Stitch:
- When importing or adapting screens from Stitch, **do not alter or weaken the canonical data model** (`TraceProfile`, `EvidenceItem`, `ResearchSet`, `MyPathComparison`).
- Map Stitch UI component props directly to the corresponding fields in `@shared/types`.
- Maintain the three primary tabs: **Profile**, **Research**, and **My Path**.

## 2. Displaying Epistemic Status

Every visual component presenting career facts must make epistemic grounding immediately obvious to the user:
- Use standardized badges:
  - **`Observed`** (Green/Emerald): Directly verified in DOM or source text. Hovering should display the quote or DOM selector.
  - **`Inferred`** (Amber/Yellow): Synthesized by reasoning or model. Must show an inspection popover with the AI's rationale and evidence links.
  - **`Unknown`** (Slate/Gray): Acknowledged unobserved field.
- Never present an inferred claim as an established observed fact.

## 3. Ban on Fake Metrics

- Do NOT design or render circular percentage progress rings (e.g. "89% profile fit").
- Do NOT render quantitative star ratings or fake numerical skill scores (e.g. "React: 95/100").
- Render qualitative indicators (e.g. "Demonstrated", "Adjacent", "Unobserved") backed by concrete evidence action items.

## 4. State Management & Storage Sync

- Read and persist data through `@storage/indexeddb` (`localDB`) and `@storage/chrome-storage` (`extensionStorage`).
- The UI should react immediately to local updates and provide clear feedback when capture or extraction is in progress.
