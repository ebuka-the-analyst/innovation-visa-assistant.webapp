# Phase-0 Runtime Database Mutation Inventory

This inventory records the startup-time database mutations that were historically performed by `runAutoMigrations()` and maps each to its controlled Phase-0 disposition.

The runtime migrator has now been removed from the Phase-0 branch. Required schema changes are represented by explicit controlled migrations; unsafe data seeding and bulk data rewrites are not retained at application startup.

## Rules for this remediation

- Do not run schema or data migrations automatically from application startup.
- Do not replay the existing Drizzle baseline against production until its migration journal state is verified.
- Do not drop or rebuild tables to correct schema drift.
- Required schema changes must be applied explicitly and verified before the new application version is released.
- Data seeding and one-time data corrections must be operator-invoked, not application-startup behaviour.

## Inventory and disposition

| Historical startup behaviour | Classification | Phase-0 disposition |
| --- | --- | --- |
| Add `blog_posts.post_status` | Required schema | Reconciled explicitly and indexed. |
| Create `blog_generation_queue` | Required schema with legacy drift | Reconciled additively to the shape used by `shared/schema.ts`; legacy rows/columns are preserved and unsafe ID conversions abort. |
| Create `FREECOVER100` using the first user as `created_by` | Data seed | Retired from startup. If still required commercially, create/manage it through an authenticated administrator workflow with an intentional owner. |
| Create `admin_audit_logs` | Required schema | Already represented in `0000_secret_patch.sql`; Phase-0 verifies it exists and does not replay the baseline. |
| Create `api_latency_log` | Required schema | Reconciled explicitly. Historical orphan user associations are preserved as telemetry with only invalid `user_id` values cleared to `NULL`; the FK uses `ON DELETE SET NULL`. |
| Create `coins_usage_log` | Required schema | Reconciled explicitly with a strict validated user FK; orphan ledger ownership remains a blocker rather than being guessed. |
| Drop/recreate `seo_automation_plans` if `strategy_data` is missing | Destructive schema repair | Retired. Controlled migration is additive and aborts instead of dropping or inventing legacy data. |
| Create/patch `backlink_targets` | Required schema | Reconciled additively while preserving existing data. |
| Rewrite blog `featured_image` values to `/api/blog/cover...` | One-time data transformation | Retired from startup. Run only as an explicit operator data migration if later proven necessary. |
| Create `user_notification_dismissals` | Required schema | Reconciled explicitly; uniqueness is preflighted and verified. |
| Restore tier credits on startup | Retired data mutation | Remains retired by the earlier Phase-0 fix. |
| One-time credit reconciliation reset on startup | One-time data correction | No longer auto-loaded. The guarded script remains available only for deliberate operator execution. |

## Important schema drift found

`blog_generation_queue` was especially important. The old runtime DDL created a `SERIAL` primary key and columns such as `scheduled_for`, `processed_at` and `result_post_id`, while current application code uses `target_date`, `generated_post_id`, `generation_started_at`, `generation_completed_at` and `error`, with a string/UUID-style identifier in `shared/schema.ts`.

The controlled migration preserves old rows, backfills `target_date` from `scheduled_for`/`created_at` where possible, retains unmapped legacy columns, and refuses unsafe conversions rather than replacing the table.

`seo_automation_plans` was the other high-risk case. The old startup code could execute `DROP TABLE IF EXISTS seo_automation_plans`. Phase-0 never does this. If a pre-existing table has rows but lacks usable `strategy_data`, the migration stops and requires an explicit data-mapping decision.

## Production preflight observation

The revised read-only production preflight on 16 August 2026 returned no blockers. It observed:

- `blog_generation_queue`: 4 rows, legacy integer ID, zero incoming foreign keys.
- `seo_automation_plans`: 0 rows, `strategy_data` present.
- `api_latency_log`: 34,696 rows, including 166 telemetry rows across 4 deleted/unknown user IDs; `user_id` is nullable.
- `coins_usage_log`: 0 rows and zero orphan user references.
- `backlink_targets`: present.
- `user_notification_dismissals`: present, 0 rows, zero duplicate `(user_id, notification_id)` pairs.
- `admin_audit_logs`: present from the existing baseline/current database state.

## Release cut-over

Railway is configured to run the following before releasing the new application version:

1. Read-only runtime-schema preflight.
2. Read-only legacy Railway startup-bootstrap preflight.
3. Both controlled Phase-0 SQL files inside one PostgreSQL transaction under an advisory lock and explicit confirmation token.
4. Read-only runtime-schema verification.
5. Read-only startup-bootstrap verification.
6. Only after every step succeeds, start the application with `npm run start`.

If any preflight, migration or verification command exits non-zero, Railway does not proceed with the new deployment.

`runAutoMigrations()` and the separate `scripts/db-migrate.js` restart hook are both removed from the Phase-0 branch. The formal `0000_secret_patch.sql` baseline is not replayed or journal-guessed by this process.
