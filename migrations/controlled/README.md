# Controlled migrations

These migrations are deliberately separate from application startup and from the existing Drizzle baseline. The current production Drizzle journal state has not been verified, so `drizzle-kit migrate` must not be pointed at production as part of this Phase-0 change.

## Phase-0 sequence

Run these commands only from an environment intentionally connected to the target database.

### 0. Create a production recovery point

Before the first production write, create and confirm a fresh manual backup of the Railway Postgres volume from the Postgres service's **Backups** tab. Do not begin the controlled migration while that backup is still pending or failed.

### 1. Read-only preflight

```bash
node server/scripts/phase0-db-preflight.cjs
```

A non-zero exit means stop. Resolve every blocker before applying the migration. In particular, the preflight refuses to guess a mapping for legacy `seo_automation_plans` rows, flags unsafe `blog_generation_queue` identifier conversions, blocks orphaned credit/coins ledger references, and blocks duplicate user-notification dismissal keys.

`api_latency_log.user_id` is nullable telemetry. If its only issue is historical references to users that no longer exist, the preflight reports a warning rather than a blocker. The controlled migration preserves the latency records and clears only those invalid user associations before applying the foreign key.

When running these scripts from a local workstation against Railway, `DATABASE_URL` from the Postgres service may use Railway's private `*.railway.internal` hostname. Use the Postgres service's public database URL for the local process without printing it. For example:

```bash
railway run --service Postgres --environment production \
  node -e "process.env.DATABASE_URL=process.env.DATABASE_PUBLIC_URL; require('./server/scripts/phase0-db-preflight.cjs')"
```

### 2. Apply the controlled migration

```bash
PHASE0_MIGRATION_CONFIRM=APPLY_20260816_PHASE0_SCHEMA \
  node server/scripts/apply-phase0-db-migration.cjs
```

From a local workstation using Railway's public database URL, use:

```bash
railway run --service Postgres --environment production \
  node -e "process.env.DATABASE_URL=process.env.DATABASE_PUBLIC_URL; process.env.PHASE0_MIGRATION_CONFIRM='APPLY_20260816_PHASE0_SCHEMA'; require('./server/scripts/apply-phase0-db-migration.cjs')"
```

The runner uses one PostgreSQL transaction, a transaction-scoped advisory lock, a 5-second lock timeout and a 5-minute statement timeout. Any error rolls back the transaction.

### 3. Read-only verification

```bash
node server/scripts/verify-phase0-db-migration.cjs
```

From a local workstation using Railway's public database URL, use:

```bash
railway run --service Postgres --environment production \
  node -e "process.env.DATABASE_URL=process.env.DATABASE_PUBLIC_URL; require('./server/scripts/verify-phase0-db-migration.cjs')"
```

A non-zero exit means the runtime migration system must remain enabled and the discrepancy must be investigated.

### 4. Runtime cut-over

Only after steps 0–3 succeed against the target database should a separate reviewable change remove `runAutoMigrations()` and the startup data-seeding/data-rewrite behaviour from `server/index.ts`.

Before this PR is merged, keep the Drizzle source model aligned with the controlled database constraint: `api_latency_log.user_id` is nullable telemetry and its `references()` declaration in `shared/schema.ts` must specify `onDelete: "set null"`. This source-model alignment is not a prerequisite for executing the explicit SQL migration, but it is a merge gate so future generated schema changes do not drift from the production constraint.

The one-time credit reconciliation script is no longer auto-loaded. If it ever needs to be re-run deliberately, invoke it directly in a production-configured operator environment:

```bash
NODE_ENV=production node server/creditReconciliationReset.cjs
```

Its existing idempotency and balance checks remain in place. Do not run it merely because the application restarted.

## Production safety

Committing or merging these files does not mean the database migration has run, and it does not verify a Railway deployment. Production environment variables, including a strong `SESSION_SECRET`, must be confirmed before merging the startup fail-closed guard.
