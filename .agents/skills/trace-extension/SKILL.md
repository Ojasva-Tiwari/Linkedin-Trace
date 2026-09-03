---
name: trace-extension
description: Chrome Manifest V3 extension lifecycle, message passing, side panel integration, and user-triggered capture guardrails for TRACE.
---

# TRACE Chrome Extension Architecture & Rules

This skill governs all code interacting with Chrome Extension APIs, Manifest V3 constraints, and content/background scripts.

## 1. User-Triggered Capture Invariant

- **NO Background Crawling**:
  - The extension must NEVER crawl, poll, scrape, or observe LinkedIn pages automatically in the background.
  - Background processes must never proactively trigger page requests or automate navigation.
- **Explicit User Action Required**:
  - Capturing a profile occurs ONLY when the user explicitly clicks the "Capture Active Page" button in the TRACE Side Panel or triggers the action shortcut.
  - The message envelope must enforce `userInitiated: true`. Any capture message lacking this flag is discarded by the service worker.

## 2. Manifest V3 Service Worker Lifecycle

- Background scripts run as ephemeral service workers (`extension/service-worker.ts`).
- They can be terminated by the browser at any time when idle.
- Never store in-memory state in the service worker across turns; persist any operational state in `chrome.storage.local` or IndexedDB.
- Configure side panel behavior via `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.

## 3. Communication Pattern

```
[Side Panel UI (React)]
       │
       ▼  chrome.runtime.sendMessage({ action: 'TRIGGER_PAGE_CAPTURE', payload: { userInitiated: true } })
[Background Service Worker]
       │
       ▼  chrome.tabs.sendMessage(activeTabId, { action: 'CAPTURE_PAGE' })
[Content Script (LinkedIn DOM)]
       │  (Extracts sanitized page content and metadata)
       ▼
[Background Service Worker]
       │
       ▼
[Side Panel UI] ──► [AI Provider Extraction] ──► [IndexedDB Storage]
```

## 4. Extension Build & Packaging

- Vite builds the extension into the `/dist` directory.
- `extension/manifest.json` is copied to `/dist/manifest.json`.
- In Chrome (`chrome://extensions`):
  1. Enable **Developer mode**.
  2. Click **Load unpacked**.
  3. Select the `dist/` directory inside `D:\Linkedin-Trace`.
