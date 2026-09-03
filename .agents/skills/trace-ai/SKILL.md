---
name: trace-ai
description: AI provider abstraction, grounded extraction guidelines, credential safety, and provider decoupling rules for TRACE.
---

# TRACE AI Provider Abstraction & Extraction Rules

This skill governs the integration, implementation, and execution of AI capabilities across TRACE.

## 1. Provider Decoupling & The `AIProvider` Interface

All AI interactions must route through the `AIProvider` interface located at `@ai/provider`.
- Neither the UI nor the storage engine may import vendor-specific SDKs (e.g. `@google/genai`, `@anthropic-ai/sdk`, `openai`) directly.
- Supported providers include:
  - `StubAIProvider`: Safe, offline mock provider for local development, builds, and automated tests.
  - `LocalModelProvider`: Local endpoints such as Ollama or LM Studio.
  - `ChromePromptProvider`: Chrome's built-in experimental Prompt API.
  - Cloud providers (OpenAI, Anthropic, Gemini): Configured with user-supplied keys stored strictly in local browser settings.

## 2. Security & Zero-Secret Policy

- **NO Hardcoded API Keys**:
  - Never place API keys, bearer tokens, or service credentials into source code, test files, or mock fixtures.
  - Never commit `.env` or `.env.local` files containing live credentials.
- **Local Key Storage**:
  - If a user configures a cloud AI provider, the key is saved in `chrome.storage.local` on the user's device and used solely for direct client-side calls.

## 3. Grounded Extraction & Anti-Hallucination

- **Strict Schema Enforcement**:
  - Prompts must instruct models to output strictly typed JSON conforming to `TraceProfile` and `EvidenceItem`.
- **Grounded Facts Only**:
  - If an attribute (e.g. graduation year, employment end date) is missing from the captured text, the model must output `factState: 'unknown'` or omit the field.
  - Models are strictly forbidden from guessing, interpolating, or embellishing career claims.
- **Citing Evidence**:
  - Inferred items must explicitly reference the specific evidence IDs that support the conclusion.
