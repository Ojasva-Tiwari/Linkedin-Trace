# TRACE - Professional Trajectory & Evidence Analyzer

TRACE is a Chrome Manifest V3 extension and React/TypeScript application for capturing, structuring, and analyzing professional trajectories grounded in first-class, verifiable evidence.

## Core Architectural Guarantees

- **Local-First**: All captured profiles, evidence records, cohorts, and comparisons reside exclusively in local browser storage (`IndexedDB` + `chrome.storage`). No cloud database is required or contacted for the personal version.
- **First-Class Evidence**: Every claim, milestone, and skill references immutable, atomic evidence items.
- **Epistemic Rigor**: Data points are explicitly classified as **Observed**, **Inferred**, or **Unknown**.
- **No Fabricated Metrics**: Strictly zero artificial verification percentages (e.g. "94% verified") and zero fake skill scores (e.g. "React: 90/100").
- **User-Triggered Capture**: No automated or background LinkedIn crawling. Capture executes strictly upon explicit user interaction.
- **AI Provider Abstraction**: LLM extraction is decoupled behind an `AIProvider` interface supporting local models (Ollama), browser Prompt APIs, and external providers with zero hardcoded API keys.

---

## Three Product Areas

1. **Profile**: Represents exactly **one person**. Provides unified views over the underlying data:
   - **Timeline**: Chronological milestone view.
   - **Skills**: Observed & inferred capabilities linked to role evidence.
   - **Summary**: Canonical trajectory narrative.
   - **Evidence Log**: Verifiable DOM and text provenance.
2. **Research**: Multiple **explicitly saved profiles** grouped into cohorts (`ResearchSet`) for market benchmarking and career path analysis.
3. **My Path**: Compares the **user's own profile** against a benchmark research cohort, generating qualitative gap analysis and actionable preparation items.

---

## Repository Structure

```
D:\Linkedin-Trace
├── .agents/skills/          # TRACE-specific Antigravity agent skills
│   ├── trace-architecture/  # System architecture & local-first invariants
│   ├── trace-evidence/      # First-class evidence schema & epistemic rules
│   ├── trace-extension/     # Chrome Manifest V3 lifecycle & capture safeguards
│   ├── trace-ai/            # AI provider abstraction & extraction guidelines
│   └── trace-ui/            # Frontend guidelines & Stitch integration shell
├── extension/               # Chrome Manifest V3 extension assets
│   ├── manifest.json        # Extension manifest
│   ├── service-worker.ts    # Background service worker (event-driven)
│   ├── content-script.ts    # User-triggered content script placeholder
│   └── sidepanel.html       # Side panel HTML container
├── frontend/                # React + TypeScript UI shell
│   └── sidepanel/
│       ├── main.tsx         # React entry point
│       ├── App.tsx          # Structural shell (Profile / Research / My Path)
│       └── index.css        # Core design tokens & epistemic badge styling
├── shared/                  # Canonical domain types & schemas
│   ├── types/
│   │   ├── provenance.ts    # FactState (observed/inferred/unknown) & confidence
│   │   ├── evidence.ts      # Atomic EvidenceItem schema
│   │   ├── profile.ts       # Canonical TraceProfile schema
│   │   ├── timeline.ts      # TimelineEvent & milestone views
│   │   ├── research.ts      # ResearchSet cohort schema
│   │   ├── mypath.ts        # TrajectoryComparisonPoint & preparation items
│   │   └── messages.ts      # Typed extension message envelopes
│   └── index.ts
├── ai/                      # AI provider abstraction
│   ├── provider.ts          # AIProvider interface & StubAIProvider
│   └── index.ts             # AIService registry
├── storage/                 # Local-first persistence
│   ├── indexeddb.ts         # IndexedDB repository for profiles, evidence, research
│   ├── chrome-storage.ts    # chrome.storage adapter for settings & active pointers
│   └── index.ts
├── docs/                    # Architectural specifications
│   └── architecture.md
├── .env.example             # Sanitized environment template
├── .gitignore               # Credential and artifact exclusions
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Development & Build

### Prerequisites
- Node.js `v20+` (tested on Node `v24.19.0`)
- npm `v10+`

### Installation
```bash
npm install
```

### Typechecking & Building
```bash
npm run typecheck
npm run build
```
Build outputs are generated in the `/dist` directory.

### Loading into Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the `dist/` directory inside `D:\Linkedin-Trace`.
5. Open LinkedIn and click the TRACE extension icon to open the side panel.
