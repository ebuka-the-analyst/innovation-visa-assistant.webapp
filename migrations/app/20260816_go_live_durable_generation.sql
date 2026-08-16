-- Go-live production hardening: retire the remaining startup-time DDL and
-- introduce durable, resumable business-plan generation.
-- This migration is additive/idempotent and is executed transactionally by
-- server/scripts/run-app-migrations.cjs.

-- ---------------------------------------------------------------------------
-- Schema responsibilities formerly hidden in server/db.ts startup side effects
-- ---------------------------------------------------------------------------
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS logo_element JSONB;

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS post_status VARCHAR(20) NOT NULL DEFAULT 'published';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS was_edited BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS edited_by VARCHAR;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS original_content TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS shares INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comments INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS avg_time_on_page INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS bounce_rate REAL NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_shares JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS google_ranking INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS organic_traffic INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS click_through_rate REAL NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS readability_score REAL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_verification_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS gemini_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS openai_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS qwen_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS claude_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_details JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS human_review_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS contradiction_flags INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sources_cited INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

CREATE TABLE IF NOT EXISTS blog_generation_queue (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  target_date TIMESTAMP NOT NULL DEFAULT NOW(),
  topic TEXT,
  category VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  generated_post_id VARCHAR,
  generation_started_at TIMESTAMP,
  generation_completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS target_date TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generated_post_id VARCHAR;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS error TEXT;
CREATE INDEX IF NOT EXISTS idx_blog_queue_date ON blog_generation_queue(target_date);
CREATE INDEX IF NOT EXISTS idx_blog_queue_status ON blog_generation_queue(status);

ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS toc_style INTEGER;
ALTER TABLE floating_feedback ADD COLUMN IF NOT EXISTS rating INTEGER;

CREATE TABLE IF NOT EXISTS export_analytics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  plan_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  export_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'started',
  export_time_ms INTEGER,
  pages_count INTEGER,
  file_size_bytes INTEGER,
  charts_expected INTEGER DEFAULT 0,
  charts_embedded INTEGER DEFAULT 0,
  missing_charts TEXT[],
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_code VARCHAR(50),
  error_message TEXT,
  failure_stage VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_export_analytics_plan ON export_analytics(plan_id);
CREATE INDEX IF NOT EXISTS idx_export_analytics_user ON export_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_export_analytics_type ON export_analytics(export_type);
CREATE INDEX IF NOT EXISTS idx_export_analytics_status ON export_analytics(status);

CREATE TABLE IF NOT EXISTS conversion_funnel_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  user_id VARCHAR REFERENCES users(id),
  session_id VARCHAR(100),
  funnel_name VARCHAR(100) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_index INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  dropped_off BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INTEGER,
  entry_source VARCHAR(100),
  device_type VARCHAR(20),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_funnel_name ON conversion_funnel_events(funnel_name);
CREATE INDEX IF NOT EXISTS idx_funnel_user ON conversion_funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_step ON conversion_funnel_events(funnel_name, step_index);
CREATE INDEX IF NOT EXISTS idx_funnel_timestamp ON conversion_funnel_events(timestamp);

CREATE TABLE IF NOT EXISTS hourly_activity_aggregates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  hour_timestamp TIMESTAMP NOT NULL,
  active_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  events INTEGER NOT NULL DEFAULT 0,
  tool_runs INTEGER NOT NULL DEFAULT 0,
  plans_created INTEGER NOT NULL DEFAULT 0,
  plans_completed INTEGER NOT NULL DEFAULT 0,
  exports INTEGER NOT NULL DEFAULT 0,
  revenue REAL NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hourly_timestamp ON hourly_activity_aggregates(hour_timestamp);

-- The old startup code also rewrote blog image URLs and reassigned images.
-- Those are data transformations, not schema migrations, and are intentionally
-- NOT carried forward into application startup or this go-live migration.

-- ---------------------------------------------------------------------------
-- Durable business-plan generation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_plan_generation_jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  claim_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  current_section INTEGER NOT NULL DEFAULT 0,
  total_sections INTEGER NOT NULL DEFAULT 0,
  generator_version VARCHAR(100) NOT NULL,
  lease_owner VARCHAR(255),
  lease_token VARCHAR(64),
  lease_expires_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_generation_jobs_status
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT ck_business_plan_generation_jobs_counts
    CHECK (claim_count >= 0 AND failure_count >= 0 AND current_section >= 0 AND total_sections >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_generation_jobs_plan
  ON business_plan_generation_jobs(plan_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_generation_jobs_claim
  ON business_plan_generation_jobs(status, available_at, lease_expires_at);

CREATE TABLE IF NOT EXISTS business_plan_generation_sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  section_index INTEGER NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_sha256 VARCHAR(64) NOT NULL,
  generator_version VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_generation_sections_index CHECK (section_index >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_generation_sections_plan_index
  ON business_plan_generation_sections(plan_id, section_index);
CREATE INDEX IF NOT EXISTS idx_business_plan_generation_sections_plan
  ON business_plan_generation_sections(plan_id);

-- Defence in depth: a business-plan ID may be charged for generation at most once.
-- Fail with a clear message rather than allowing a unique-index error to obscure
-- a pre-existing billing-integrity problem.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM credit_transactions
    WHERE type = 'generation'
      AND reference_type = 'business_plan'
      AND reference_id IS NOT NULL
    GROUP BY reference_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Go-live migration blocked: duplicate generation charges exist for one or more business plans';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_credit_transactions_generation_plan_once
  ON credit_transactions(reference_id)
  WHERE type = 'generation'
    AND reference_type = 'business_plan'
    AND reference_id IS NOT NULL;

-- Recover plans orphaned by the legacy fire-and-forget worker. They have already
-- passed payment/credit handling, so this deliberately creates only a queue job.
INSERT INTO business_plan_generation_jobs (
  id, plan_id, status, available_at, generator_version, created_at, updated_at
)
SELECT
  gen_random_uuid()::varchar,
  bp.id,
  'queued',
  NOW(),
  'business-plan-v1-2026-08-16',
  NOW(),
  NOW()
FROM business_plans bp
WHERE bp.status = 'generating'
  AND bp.generated_content IS NULL
ON CONFLICT (plan_id) DO NOTHING;

UPDATE business_plans bp
SET current_generation_stage = 'Queued - recovering interrupted generation safely...'
WHERE bp.status = 'generating'
  AND bp.generated_content IS NULL
  AND EXISTS (
    SELECT 1 FROM business_plan_generation_jobs job WHERE job.plan_id = bp.id
  );
