# Phase-0 Runtime Database Mutation Inventory

This inventory records the database changes currently performed by `runAutoMigrations()` and the production startup preload. The objective is to replace startup-time mutation with an explicit, controlled migration process without deleting data or assuming the production schema state.

## Rules for this remediation

- Do not run schema or data migrations automatically from application startup.
- Do not replay the existing Drizzle baseline against production until its migration journal state is verified.
- Do not drop or rebuild tables to correct schema drift.
- Required schema changes must be applied explicitly and verified before `runAutoMigrations()` is disabled.
- Data seeding and one-time data corrections must be operator-invoked, not application-startup behaviour.

## Inventory

| Startup behaviour | Classification | Formal migration status | Phase-0 treatment |
| --- | --- | --- | --- |
| Add `blog_posts.post_status` | Required schema | Not represented in `0000_secret_patch.sql` | Add explicitly and index it. |
| Create `blog_generation_queue` | Required schema | Not represented in `0000_secret_patch.sql` | Reconcile to the schema used by `shared/schema.ts`. Preserve legacy rows and columns; do not drop the table. |
| Create `FREECOVER100` using the first user as `created_by` | Data seed | Not a schema migration | Remove from startup. If still required commercially, create it through an explicit administrator/operator action with an intentional owner. |
| Create `admin_audit_logs` | Required schema | Already represented in `0000_secret_patch.sql` | Do not duplicate it in the new migration. Preflight must confirm it exists before runtime DDL is retired. |
| Create `api_latency_log` | Required schema | Not represented in `0000_secret_patch.sql` | Add explicitly, including indexes and a safe user FK where existing data allows validation. |
| Create `coins_usage_log` | Required schema | Not represented in `0000_secret_patch.sql` | Add explicitly, including indexes and a safe user FK where existing data allows validation. |
| Drop/recreate `seo_automation_plans` if `strategy_data` is missing | Required schema implemented destructively | Not represented in `0000_secret_patch.sql` | Replace with additive migration. If legacy rows cannot be mapped safely, abort the migration rather than drop data. |
| Create/patch `backlink_targets` | Required schema | Not represented in `0000_secret_patch.sql` | Add explicitly and preserve any legacy columns/data. |
| Rewrite blog `featured_image` values to `/api/blog/cover...` | One-time data transformation | Not a schema migration | Remove from startup. Keep as a separate operator-controlled data migration only if the transformation is still required. |
| Create `user_notification_dismissals` | Required schema | Not represented in `0000_secret_patch.sql` | Add explicitly; live notification history/delete routes depend on it. |
| Restore tier credits on startup | Retired data mutation | Removed by earlier Phase-0 fix | Must remain retired. |
| One-time startup credit reconciliation reset | One-time data correction | Not a schema migration | No longer auto-loaded on production startup. Script remains available for deliberate operator execution only. |

## Important schema drift found

`blog_generation_queue` is especially important. The old runtime DDL created a `SERIAL` primary key and columns such as `scheduled_for`, `processed_at` and `result_post_id`, while current application code uses `target_date`, `generated_post_id`, `generation_started_at`, `generation_completed_at` and `error`, with a string/UUID-style identifier in `shared/schema.ts`.

The controlled migration must therefore preserve old rows, backfill `target_date` from `scheduled_for`/`created_at` where possible, retain unmapped legacy columns, and refuse unsafe conversions rather than replacing the table.

`seo_automation_plans` is the other high-risk case. The current startup code can execute `DROP TABLE IF EXISTS seo_automation_plans`. The controlled migration must never do this. If a pre-existing table has rows but lacks usable `strategy_data`, the migration must stop and require an explicit data-mapping decision.

## Cut-over gate

`runAutoMigrations()` must remain enabled until all of the following are true for the target database:

1. The controlled Phase-0 preflight completes successfully.
2. The controlled schema migration completes successfully.
3. Post-migration verification confirms every required table/column/index is present.
4. `admin_audit_logs` is confirmed present from the existing baseline/current database state.
5. Any required one-time data migrations are deliberately run or explicitly abandoned.
6. Only then is startup-time schema/data mutation removed from `server/index.ts` in a separate reviewable change.

No Railway deployment or production database migration is implied by committing these files to GitHub.
