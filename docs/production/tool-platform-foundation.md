# Production tool-platform foundation

## Objective

The Tools Hub must behave as a production application platform rather than a collection of disconnected forms. Every upgraded tool should use the same durable case context, evidence references, run ledger, policy versioning and validation state.

## Invariants

1. A tool shown as available in the production Tools Hub must have a runnable client route.
2. A runnable route that is intentionally not public must be explicitly classified as internal.
3. A listed tool without an implementation must be explicitly disabled and must not appear in the production Tools Hub.
4. Catalogue/route drift is a CI failure.
5. Tool access is re-checked server-side when a durable run is created. Client-side gating is not treated as an authorisation boundary.
6. Shared user case context is server-side, revisioned and protected with optimistic concurrency.
7. Every case-context mutation writes an immutable revision/hash audit event.
8. Every durable tool run records the registry version, policy version, case-context revision, input snapshot and evidence references used for that run.
9. Client-computed legacy outputs can be persisted, but they are always marked `unverified`. The client cannot promote its own output to `validated`.
10. Tool results are content-hashed before persistence so later integrity checks have a stable fingerprint.
11. Tool run lifecycle changes are append-audited in `tool_run_events`.
12. Large or invalid JSON payloads are rejected before persistence.
13. Tool-platform schema changes are forward-only application migrations and are covered by Railway pre-deploy verification.
14. Existing tools are treated as beta by default until they receive an explicit production review. Promotion must be intentional in `shared/tool-platform-registry.json`.
15. High-stakes immigration, legal, financial and eligibility tools must use versioned official-source policy rules and deterministic calculations where rules are deterministic. AI may explain or analyse evidence but must not silently invent policy.

## Registry

`shared/tool-platform-registry.json` records release classification policy. The CI validator cross-checks it against:

- `shared/tools-data.ts` public catalogue entries;
- `client/src/lib/toolRoutes.ts` actual runnable client routes;
- the runnable/unavailable/internal IDs already enforced by the commercial catalogue.

This prevents a tool from being advertised without an implementation or becoming public accidentally.

## Durable data model

### `tool_case_contexts`

One current context record per user. Stores reusable structured case data and evidence references with a monotonically increasing revision.

### `tool_case_context_events`

Immutable revision/hash history for context changes.

### `tool_runs`

One durable execution record per run. Stores input provenance, policy and registry versions, context revision, evidence references, result payload/hash and explicit validation state.

### `tool_run_events`

Append-only lifecycle events for a run.

## Legacy-to-production migration path

The foundation deliberately does not pretend existing client-side calculations are authoritative. Existing tools can adopt the new API incrementally:

1. Read shared case context and prefill known facts.
2. Create a durable run before calculation/analysis.
3. Execute deterministic rules server-side where possible.
4. Execute AI analysis only against structured, validated inputs.
5. Persist citations/evidence provenance.
6. Complete the run with a structured result.
7. Promote the tool from beta to production only after policy, calculation, security, failure-mode and UX tests pass.

## First production review wave

The first wave should cover the tools with the greatest decision impact:

1. Eligibility / application requirements.
2. Endorsement readiness and Innovation, Viability and Scalability assessment.
3. Financial projections and viability.
4. Market analysis and source verification.
5. Evidence quality and diagnostics.
6. Endorser comparison.
7. Interview preparation, RFE defence and rejection analysis.
