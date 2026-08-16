# Durable business-plan generation

## Production invariants

1. A paid business plan is charged for generation at most once.
2. Generation work is represented by a durable PostgreSQL job before processing begins.
3. A worker claim is leased and can be recovered after process or container loss.
4. Only the current lease holder may persist progress or finalise a plan.
5. Every completed business-plan section is checkpointed in PostgreSQL before the next section starts.
6. A restart resumes from the first missing checkpoint rather than regenerating completed sections.
7. Multiple application replicas can claim work safely through `FOR UPDATE SKIP LOCKED` plus lease tokens.
8. Long AI calls heartbeat their lease. A worker that loses its lease stops before persisting output.
9. Transient provider failures use bounded retries and exponential backoff; permanent configuration/invariant errors fail explicitly.
10. Existing plans left in `generating` by the legacy in-process worker are queued by the controlled migration without consuming another credit.
11. HTTP status polling reads persisted state only. It does not own or drive generation work.
12. Database changes are forward-only, checksum-tracked migrations executed before the application release starts.
13. Applied migration files are immutable. Any further schema change requires a new migration file.

## Durable tables

### `business_plan_generation_jobs`

One job per business plan. Stores queue/running/completed/failed state, claim/failure counts, current section, generator version, lease owner/token/expiry, heartbeat, retry availability and terminal errors.

### `business_plan_generation_sections`

One checkpoint per `(plan_id, section_index)`. Stores canonical section title, generated prose, SHA-256 content hash and generator version. The unique key makes checkpoint persistence idempotent.

## Credit lifecycle

`POST /api/generate/start` runs its payment/credit transition in a database transaction and locks the business-plan row. For paid tiers, it also locks the user credit row. An existing generation transaction for the same plan is treated as proof that the plan has already been charged, so a retry or legacy crash cannot deduct another credit. A partial unique index provides database-level defence in depth.

## Worker lifecycle

The application starts one worker loop per process after routes are registered. A claim statement selects one eligible job with `FOR UPDATE SKIP LOCKED` and assigns a time-limited lease. While AI work is running, the worker extends the lease. If a deploy or crash kills the process, the lease expires and another worker claims the same job. Existing section checkpoints are loaded first, so only missing sections are generated.

Final assembly and plan completion happen inside a lease-checked transaction. Completion email failure does not roll back a successfully generated plan.

## Migration lifecycle

Railway pre-deploy runs, in order:

1. Read-only application-schema preflight.
2. Checksum-tracked forward migration runner under a PostgreSQL advisory transaction lock.
3. Read-only post-migration verifier.

A non-zero result prevents the new release from starting. The runner records each migration in `app_schema_migrations`; future deploys skip already-applied files only when their SHA-256 checksum still matches.

## Retired startup behaviour

`server/db.ts` no longer changes schema or rewrites data when imported. The schema responsibilities that were previously hidden there are represented in the explicit go-live migration. The old blog image URL rewrite and automatic unique-image reassignment are deliberately not retained because they are data transformations, not safe application-startup responsibilities.
