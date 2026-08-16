# Phase-0 Railway startup bootstrap inventory

The production Railway config previously used this start command:

```text
node scripts/db-migrate.js && npm run start
```

That made `scripts/db-migrate.js` a second startup-time database mutation system in addition to `runAutoMigrations()` in `server/index.ts`.

## Inventory

`db-migrate.js` performed the following work on every application restart:

1. Read `migrations/0000_secret_patch.sql`, removed Drizzle breakpoints, split the file on semicolons and attempted to replay every statement.
2. Suppressed selected "already exists" errors and logged many other statement failures without failing the overall migration, allowing partial/repeated baseline execution.
3. Added `business_plans.chart_data`.
4. Added `business_plans` theme/cover columns: `theme_id`, `theme_primary_color`, `theme_secondary_color`, `theme_font`, `theme_applied_at`, `background_image`, `use_full_cover_image`, and `text_elements`.
5. Created `cover_designs` and indexes if absent.
6. Created `premium_cover_purchases` and indexes if absent.
7. Created a legacy/core `blog_posts` shape and indexes if absent.

## Controlled replacement

The formal baseline is **not replayed** by Phase-0. Its production journal state is not being guessed.

The ad-hoc schema responsibilities from items 3–6 are represented explicitly in:

`migrations/controlled/20260816_phase0_startup_bootstrap.sql`

`blog_posts` remains baseline-owned. Production already contains it, and the main Phase-0 migration reconciles the required runtime blog changes. Recreating the whole baseline table from an application start hook is deliberately retired.

The Railway cut-over uses a pre-deploy chain that runs inside Railway's private network:

1. Runtime-schema read-only preflight.
2. Legacy-startup-bootstrap read-only preflight.
3. Both controlled SQL files in one database transaction with the existing advisory lock and explicit confirmation token.
4. Runtime-schema read-only verification.
5. Legacy-startup-bootstrap read-only verification.
6. Only if all steps succeed does Railway start the new application version.

The new start command is `npm run start`; it no longer runs `scripts/db-migrate.js`.

## Data operations intentionally not retained at startup

- `FREECOVER100` auto-seeding is retired. It selected the oldest user as `created_by`, which is not an acceptable ownership rule for a production promotion. If the campaign is needed, it should be created or managed deliberately through an authenticated administrative workflow.
- The bulk blog `featured_image` rewrite is retired from startup. Existing blog image routes already have runtime fallback/healing behaviour, and a bulk data rewrite should only be run as an explicit operator data migration if it is later shown to be necessary.

## Safety property

If any preflight, migration or verification command exits non-zero, Railway's pre-deploy stage fails and the new deployment is not released. The currently running deployment remains the rollback boundary.
