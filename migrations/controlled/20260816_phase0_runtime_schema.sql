-- Phase-0 controlled runtime-schema reconciliation.
--
-- This file is intentionally NOT executed by application startup. It is applied only
-- through the explicit Phase-0 migration runner after the read-only preflight passes.
-- It is additive/data-preserving and raises an exception rather than dropping data
-- when a legacy shape cannot be converted safely.

-- blog_posts.post_status -------------------------------------------------------
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS post_status VARCHAR(20);

UPDATE blog_posts
   SET post_status = 'published'
 WHERE post_status IS NULL;

ALTER TABLE blog_posts
  ALTER COLUMN post_status SET DEFAULT 'published',
  ALTER COLUMN post_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(post_status);

-- blog_generation_queue -------------------------------------------------------
-- New installations get the current application shape. Existing legacy runtime
-- tables are reconciled additively below without dropping old columns or rows.
CREATE TABLE IF NOT EXISTS blog_generation_queue (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  target_date TIMESTAMP NOT NULL,
  topic TEXT,
  category VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  generated_post_id VARCHAR,
  generation_started_at TIMESTAMP,
  generation_completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS target_date TIMESTAMP;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generated_post_id VARCHAR;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

DO $$
DECLARE
  id_type TEXT;
  incoming_fk_count INTEGER;
BEGIN
  SELECT data_type
    INTO id_type
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'blog_generation_queue'
     AND column_name = 'id';

  IF id_type IN ('smallint', 'integer', 'bigint') THEN
    SELECT COUNT(*)::integer
      INTO incoming_fk_count
      FROM pg_constraint
     WHERE contype = 'f'
       AND confrelid = 'public.blog_generation_queue'::regclass;

    IF incoming_fk_count > 0 THEN
      RAISE EXCEPTION
        'Unsafe blog_generation_queue id conversion: % foreign key(s) refer to the legacy numeric id',
        incoming_fk_count;
    END IF;

    ALTER TABLE blog_generation_queue ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE blog_generation_queue ALTER COLUMN id TYPE VARCHAR USING id::text;
    ALTER TABLE blog_generation_queue ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  ELSIF id_type IN ('character varying', 'text') THEN
    ALTER TABLE blog_generation_queue ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  ELSIF id_type = 'uuid' THEN
    -- UUID is application-compatible and already data-safe; retain it rather than
    -- forcing a cosmetic type conversion.
    NULL;
  ELSE
    RAISE EXCEPTION 'Unsupported blog_generation_queue id type: %', id_type;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'blog_generation_queue'
       AND column_name = 'scheduled_for'
  ) THEN
    EXECUTE $sql$
      UPDATE blog_generation_queue
         SET target_date = COALESCE(target_date, scheduled_for, created_at, NOW())
       WHERE target_date IS NULL
    $sql$;
  ELSE
    UPDATE blog_generation_queue
       SET target_date = COALESCE(target_date, created_at, NOW())
     WHERE target_date IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'blog_generation_queue'
       AND column_name = 'processed_at'
  ) THEN
    EXECUTE $sql$
      UPDATE blog_generation_queue
         SET generation_completed_at = COALESCE(generation_completed_at, processed_at)
       WHERE generation_completed_at IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'blog_generation_queue'
       AND column_name = 'error_message'
  ) THEN
    EXECUTE $sql$
      UPDATE blog_generation_queue
         SET error = COALESCE(error, error_message)
       WHERE error IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'blog_generation_queue'
       AND column_name = 'result_post_id'
  ) THEN
    EXECUTE $sql$
      UPDATE blog_generation_queue queue
         SET generated_post_id = post.id
        FROM blog_posts post
       WHERE queue.generated_post_id IS NULL
         AND queue.result_post_id::text = post.id::text
    $sql$;
  END IF;
END
$$;

ALTER TABLE blog_generation_queue
  ALTER COLUMN target_date SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_queue_date ON blog_generation_queue(target_date);
CREATE INDEX IF NOT EXISTS idx_blog_queue_status ON blog_generation_queue(status);

-- api_latency_log -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_latency_log (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  route VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  user_id VARCHAR,
  request_size INTEGER,
  response_size INTEGER,
  error_type VARCHAR(100),
  error_message TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE api_latency_log ADD COLUMN IF NOT EXISTS request_size INTEGER;
ALTER TABLE api_latency_log ADD COLUMN IF NOT EXISTS response_size INTEGER;
ALTER TABLE api_latency_log ADD COLUMN IF NOT EXISTS error_type VARCHAR(100);
ALTER TABLE api_latency_log ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_api_latency_route ON api_latency_log(route);
CREATE INDEX IF NOT EXISTS idx_api_latency_timestamp ON api_latency_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_latency_status ON api_latency_log(status_code);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'api_latency_log_user_id_users_id_fk'
       AND conrelid = 'public.api_latency_log'::regclass
  ) THEN
    ALTER TABLE api_latency_log
      ADD CONSTRAINT api_latency_log_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;
  END IF;
END
$$;

ALTER TABLE api_latency_log VALIDATE CONSTRAINT api_latency_log_user_id_users_id_fk;

-- coins_usage_log -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coins_usage_log (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL,
  change_type VARCHAR(20) NOT NULL,
  amount_changed INTEGER NOT NULL,
  previous_balance INTEGER NOT NULL DEFAULT 0,
  new_balance INTEGER NOT NULL DEFAULT 0,
  reason VARCHAR(100) NOT NULL,
  tool_id VARCHAR(100),
  plan_id VARCHAR,
  order_id VARCHAR,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coins_user ON coins_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_coins_type ON coins_usage_log(change_type);
CREATE INDEX IF NOT EXISTS idx_coins_timestamp ON coins_usage_log(timestamp);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'coins_usage_log_user_id_users_id_fk'
       AND conrelid = 'public.coins_usage_log'::regclass
  ) THEN
    ALTER TABLE coins_usage_log
      ADD CONSTRAINT coins_usage_log_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;
  END IF;
END
$$;

ALTER TABLE coins_usage_log VALIDATE CONSTRAINT coins_usage_log_user_id_users_id_fk;

-- seo_automation_plans --------------------------------------------------------
-- Never drop this table. If legacy rows cannot satisfy strategy_data, abort the
-- transaction so an explicit data mapping can be reviewed instead.
CREATE TABLE IF NOT EXISTS seo_automation_plans (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  strategy_data JSONB NOT NULL,
  business_name VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  total_content_items INTEGER NOT NULL DEFAULT 0,
  queued_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  week_number INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  next_queue_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS strategy_data JSONB;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS total_content_items INTEGER DEFAULT 0;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS queued_items INTEGER DEFAULT 0;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS completed_items INTEGER DEFAULT 0;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT NOW();
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS next_queue_date TIMESTAMP;
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE seo_automation_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

DO $$
DECLARE
  missing_strategy_rows INTEGER;
BEGIN
  SELECT COUNT(*)::integer
    INTO missing_strategy_rows
    FROM seo_automation_plans
   WHERE strategy_data IS NULL;

  IF missing_strategy_rows > 0 THEN
    RAISE EXCEPTION
      'seo_automation_plans has % row(s) without strategy_data; refusing destructive or guessed migration',
      missing_strategy_rows;
  END IF;
END
$$;

UPDATE seo_automation_plans SET status = 'active' WHERE status IS NULL;
UPDATE seo_automation_plans SET total_content_items = 0 WHERE total_content_items IS NULL;
UPDATE seo_automation_plans SET queued_items = 0 WHERE queued_items IS NULL;
UPDATE seo_automation_plans SET completed_items = 0 WHERE completed_items IS NULL;
UPDATE seo_automation_plans SET week_number = 1 WHERE week_number IS NULL;
UPDATE seo_automation_plans SET start_date = NOW() WHERE start_date IS NULL;
UPDATE seo_automation_plans SET created_at = NOW() WHERE created_at IS NULL;
UPDATE seo_automation_plans SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE seo_automation_plans
  ALTER COLUMN strategy_data SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN total_content_items SET DEFAULT 0,
  ALTER COLUMN total_content_items SET NOT NULL,
  ALTER COLUMN queued_items SET DEFAULT 0,
  ALTER COLUMN queued_items SET NOT NULL,
  ALTER COLUMN completed_items SET DEFAULT 0,
  ALTER COLUMN completed_items SET NOT NULL,
  ALTER COLUMN week_number SET DEFAULT 1,
  ALTER COLUMN week_number SET NOT NULL,
  ALTER COLUMN start_date SET DEFAULT NOW(),
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

-- backlink_targets ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backlink_targets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  submission_url VARCHAR(500),
  category VARCHAR(100) NOT NULL DEFAULT 'community',
  platform VARCHAR(100),
  domain_authority INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  effort VARCHAR(20) NOT NULL DEFAULT 'medium',
  expected_impact VARCHAR(20) NOT NULL DEFAULT 'medium',
  strategy TEXT,
  ai_generated_content TEXT,
  content_generated_at TIMESTAMP,
  notes TEXT,
  contact_email VARCHAR(255),
  anchor_text VARCHAR(255),
  link_type VARCHAR(50) DEFAULT 'dofollow',
  submitted_at TIMESTAMP,
  live_checked_at TIMESTAMP,
  is_live BOOLEAN,
  live_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS submission_url VARCHAR(500);
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS ai_generated_content TEXT;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS content_generated_at TIMESTAMP;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS anchor_text VARCHAR(255);
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS link_type VARCHAR(50) DEFAULT 'dofollow';
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS live_checked_at TIMESTAMP;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS is_live BOOLEAN;
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS live_url VARCHAR(500);
ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- user_notification_dismissals ------------------------------------------------
CREATE TABLE IF NOT EXISTS user_notification_dismissals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL,
  notification_id VARCHAR NOT NULL,
  dismissed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT user_notification_dismissals_user_notification_unique
    UNIQUE (user_id, notification_id)
);
