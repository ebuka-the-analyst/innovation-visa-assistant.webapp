-- Configurable branded email templates. No live email is sent or altered during migration.
CREATE TABLE IF NOT EXISTS email_template_overrides (
  brand VARCHAR(16) NOT NULL CHECK (brand IN ('global', 'ifva')),
  template_key VARCHAR(96) NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (brand, template_key)
);

CREATE TABLE IF NOT EXISTS email_template_revisions (
  id BIGSERIAL PRIMARY KEY,
  brand VARCHAR(16) NOT NULL,
  template_key VARCHAR(96) NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (brand, template_key, revision)
);
CREATE INDEX IF NOT EXISTS email_template_revisions_lookup
  ON email_template_revisions(brand, template_key, revision DESC);

-- Safe, event-deduplicated email delivery jobs, independent of paid entitlements.
CREATE TABLE IF NOT EXISTS member_lifecycle_email_outbox (
  event_id VARCHAR(255) PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES member_stripe_live_orders(id) ON DELETE RESTRICT,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  event_type VARCHAR(120) NOT NULL,
  decision VARCHAR(16) NOT NULL CHECK (decision IN ('activate','suspend','expire')),
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS member_lifecycle_email_outbox_ready
  ON member_lifecycle_email_outbox(status, next_attempt_at)
  WHERE status IN ('pending','failed');
