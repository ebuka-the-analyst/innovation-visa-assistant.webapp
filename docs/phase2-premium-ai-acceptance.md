# Phase 2 premium AI acceptance plan
Updated: 2026-10-11. Owner: IFVA engineering. Status: **not approved for production**.

## 1. Release prerequisites
- PR CI: green PR build, authentication/security and isolated PostgreSQL migration/quota tests.
- A clean, isolated staging environment with a separate PostgreSQL database; **do not promote** the older Railway environment's 2025 staged changes.
- A direct upstream OpenAI credential stored in protected staging secrets, never in source, issues, chat or CI logs.
- Model: `gpt-6-astra`, Responses API with high reasoning and no silent fallback. Do not claim provider availability until a paid API request succeeds.
- A clean lifecycle for trial/legacy accounts; no existing customer data or paid credits modified.

## 2. Running the one-call live capability probe
The prepared paid probe is `scripts/probe-premium-business-model.ts`.

**Method A: authorised private staging shell**
1. Configure `UPSTREAM_OPENAI_API_KEY` securely as a staging-only secret.
2. Run `IFVA_ENABLE_PAID_AI_PROBE=yes node --import tsx scripts/probe-premium-business-model.ts --live` with the credential supplied only via the environment.
3. Confirm actual model, status, input/output/reasoning tokens, latency and estimated USD. The test prints no business-plan text.
4. Confirm cost in the provider's real usage/billing dashboard.

**Method B: protected GitHub Actions staging environment**
The included `Manual Premium Model Staging Probe` workflow requires explicit paid-test confirmation and `IFVA_STAGING_OPENAI_API_KEY` in the protected `premium-ai-staging` environment. GitHub `workflow_dispatch` may require the workflow file to be present on the default branch before appearing in the Actions list. Do **not** merge this entire development PR just to access the probe; use Method A or a separately reviewed workflow-only change.

A successful short probe establishes only API availability. It does **not** establish 56–80-page output quality or actual per-customer pricing.

## 3. Full-plan validation matrix
At least three **fictional or consented, properly anonymised** founder cases, covering:
- Software/SaaS with no verified revenue or signed customers.
- Physical or climate technology with unconfirmed patent/IP claims.
- Service/marketplace with constrained unit economics, data-protection or employment obligations.

For each case, run Founder (40–55-page target), Founder Pro (56–80+ page target) and the 90-Day Pass (same premium depth). Each must generate the agreed section structure, source-and-assumptions register, three-year finance tables and interview-readiness preparation.

**Mandatory manual acceptance criteria:**
1. Innovation: clear distinction versus existing solutions, evidence where available, specific genuinely testable innovation hypothesis.
2. Viability: consistent market segmentation, practical growth assumptions, plausible acquisition costs, expenses and cash position.
3. Scalability: credible hiring/operations milestones, geographically realistic expansion and constraints.
4. Financial arithmetic: independently recompute profits, cash flow, revenue, unit economics, VAT handling, and table subtotals.
5. Evidence: verify the **original** public sources and their dates; never equate plausible citations with checked evidence; mark every unsourced claim as an assumption or missing evidence.
6. Risk and UK compliance: no guarantee of endorsement, visa, immigration outcome, or approval probability; no invented patents, customers, letters or sales.
7. Consistency: business idea, founder qualifications, customer data, timelines and metrics must agree across sections.
8. Export: inspect both PDF and DOCX; check actual PDF pages, headings, tables, headers, page breaks, currency symbols and readability.
9. Revisions: changes scoped to selected sections, with financial values and linked assumptions reconciled throughout.
10. Reliability: queue retries, timeouts, rate limits, idempotency and safe handling of incomplete model outputs.

Set acceptance to FAILED if material invented evidence, contradictory finance, invisible/garbled tables, missing required sections or unreviewed citations remain. Do not pad pages with filler simply to reach an advertised count.

## 4. Economic viability under the £159 90-Day Pass
Per plan and revision, capture:
- All upstream provider request IDs, input/cached-input/output/reasoning tokens, effective pricing version and billed amount.
- Failed/retried attempts, external research tool calls, output rendering, hosting and support costs.
- For direct OpenAI standard processing, use the effective-dated GPT-6 Astra rates, with >272k-input long-context threshold. For third-party gateways leave cost unverified until reconciled.
- Distinguish expected usage from worst-case all six generations plus 45 major revisions over 90 days.
- Currency translation, applicable VAT and payment-processing fees before declaring a customer-level profit.

Conservative launch gate: no package goes live if fully utilised contribution is negative or costs cannot be measured.

## 5. Production rollout hold
- Stripe purchase/renewal/refund webhook fulfilment and monthly quota renewal are Phase 3 and **not live**.
- Staging migrations and rollback drills must pass before merging application changes.
- Protect legacy purchase entitlements and completed documents.
- Explicit release approval, then staged production rollout with traffic/quality/cost monitoring.
