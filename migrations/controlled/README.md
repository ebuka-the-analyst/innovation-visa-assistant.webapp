# Controlled migrations

These migrations are deliberately separate from application startup and from the existing Drizzle baseline. The current production Drizzle journal state has not been verified, so `drizzle-kit migrate` must not be pointed at production as part of this Phase-0 change.

## Phase-0 sequence

Run these commands only from an environment intentionally connected to the target database.

### 1. Read-only preflight

```bash
node server/scripts/phase0-db-preflight.cjs
```

A non-zero exit means stop. Resolve every blocker before applying the migration. In particular, the preflight refuses to guess a mapping for legacy `seo_automation_plans` rows and flags unsafe `blog_generation_queue` identifier conversions.

### 2. Apply the controlled migration

```bash
PHASE0_MIGRATION_CONFIRM=APPLY_20260816_PHASE0_SCHEMA \
  node server/scripts/apply-phase0-db-migration.cjs
```

The runner uses one PostgreSQL transaction, a transaction-scoped advisory lock, a 5-second lock timeout and a 5-minute statement timeout. Any error rolls back the transaction.

### 3. Read-only verification

```bash
node server/scripts/verify-phase0-db-migration.cjs
```

A non-zero exit means the runtime migration system must remain enabled and the discrepancy must be investigated.

### 4. Runtime cut-over

Only after steps 1–3 succeed against the target database should a separate reviewable change remove `runAutoMigrations()` and the startup data-seeding/data-rewrite behaviour from `server/index.ts`.

The one-time credit reconciliation script is no longer auto-loaded. If it ever needs to be re-run deliberately, invoke it directly in a production-configured operator environment:

```bash
NODE_ENV=production node server/creditReconciliationReset.cjs
```

Its existing idempotency and balance checks remain in place. Do not run it merely because the application restarted.

## Production safety

Committing or merging these files does not mean the database migration has run, and it does not verify a Railway deployment. Production environment variables, including a strong `SESSION_SECRET`, must be confirmed before merging the startup fail-closed guard.
