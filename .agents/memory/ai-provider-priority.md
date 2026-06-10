---
name: AI provider priority
description: Which AI providers are used where, and in what order across the platform
---

# AI Provider Priority (June 2026)

**Rule:** OpenAI is the PRIMARY provider for ALL AI generation. Gemini is fallback for blog only. Qwen is not used as primary anywhere.

**Why:** All Gemini free-tier keys hit 429 quota exhaustion from the blog pipeline. Qwen was causing failures on the questionnaire enhance endpoint in production. OpenAI has a paid account with reliable uptime.

**How to apply:** Any new AI generation endpoint must call `openaiClient` (gpt-4o-mini or gpt-4o) first. Add Gemini as fallback only for blog generation (it already has the infrastructure).

## Current mapping (after June 2026 migration)

| Endpoint / file | Primary | Fallback |
|---|---|---|
| `callAI()` in routes.ts | OpenAI gpt-4o-mini | none |
| Questionnaire enhance (`/api/questionnaire/enhance`) | OpenAI gpt-4o → gpt-4o-mini | none |
| Document extraction (routes.ts ~8685) | OpenAI gpt-4o-mini | none |
| AI Interview enhance/draft/autofill | OpenAI gpt-4o-mini | none |
| Chat (`chatService.ts`) | OpenAI gpt-4o-mini | intelligent fallback (static) |
| AI Orchestrator (`ai-orchestrator.ts`) | OpenAI gpt-4o-mini | none |
| Blog generation (`blogGenerator.ts`) | OpenAI gpt-4o → gpt-4o-mini | Gemini 4-key × 3-model matrix |
| Blog auto-fixer (`blogAutoFixer.ts`) | OpenAI gpt-4o → gpt-4o-mini | Gemini 4-key × 2-model matrix |
| Blog verifier (`blogMultiVerifier.ts`) | OpenAI gpt-4o-mini | Gemini (independent verifier) |

## `openaiClient` singleton in routes.ts

Defined at the top of routes.ts (after imports) as:
```ts
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
```
All routes in routes.ts use this shared singleton — no dynamic imports needed.
