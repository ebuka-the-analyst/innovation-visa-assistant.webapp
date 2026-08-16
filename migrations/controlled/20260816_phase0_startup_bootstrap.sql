-- Phase-0 reconciliation for the legacy Railway startup bootstrap migrator.
--
-- Replaces the ad-hoc DDL in scripts/db-migrate.js. This file deliberately does
-- NOT replay migrations/0000_secret_patch.sql. The baseline is already present in
-- production and its Drizzle journal state is not being guessed or rewritten here.

-- business_plans columns historically added by scripts/db-migrate.js -----------
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS chart_data TEXT;
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS theme_id VARCHAR(50);
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS theme_primary_color VARCHAR(20);
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS theme_secondary_color VARCHAR(20);
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS theme_font VARCHAR(50);
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS theme_applied_at TIMESTAMP;
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS use_full_cover_image BOOLEAN DEFAULT FALSE;
ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS text_elements TEXT;

-- cover_designs ---------------------------------------------------------------
-- Create the current application shape if the table does not yet exist, then
-- reconcile older runtime-created copies additively without deleting data.
CREATE TABLE IF NOT EXISTS cover_designs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  theme_id VARCHAR(50),
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  font VARCHAR(50),
  background_image TEXT,
  use_full_cover_image BOOLEAN NOT NULL DEFAULT FALSE,
  text_elements JSONB,
  logo_element JSONB,
  palette_id VARCHAR(50),
  palette_colors JSONB,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  name VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS theme_id VARCHAR(50);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS font VARCHAR(50);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS use_full_cover_image BOOLEAN DEFAULT FALSE;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS text_elements JSONB;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS logo_element JSONB;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS palette_id VARCHAR(50);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS palette_colors JSONB;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_cover_user ON cover_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_default ON cover_designs(user_id, is_default);

-- premium_cover_purchases -----------------------------------------------------
CREATE TABLE IF NOT EXISTS premium_cover_purchases (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  template_id VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);
ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS price INTEGER;
ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE premium_cover_purchases ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_premium_cover_user ON premium_cover_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_cover_template ON premium_cover_purchases(user_id, template_id);
CREATE INDEX IF NOT EXISTS idx_premium_cover_stripe ON premium_cover_purchases(stripe_session_id);

-- blog_posts ------------------------------------------------------------------
-- scripts/db-migrate.js also attempted to CREATE blog_posts if absent. That
-- table is owned by the existing formal baseline and is already required by the
-- Phase-0 runtime migration. Recreating the baseline here would be unsafe and is
-- intentionally not repeated.
