BEGIN;

CREATE TABLE IF NOT EXISTS ai_provider_settings (
  provider VARCHAR(32) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  priority INTEGER NOT NULL,
  model VARCHAR(160) NOT NULL,
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_provider_settings_priority_positive CHECK (priority > 0),
  CONSTRAINT ai_provider_settings_provider_nonempty CHECK (length(trim(provider)) > 0),
  CONSTRAINT ai_provider_settings_model_nonempty CHECK (length(trim(model)) > 0)
);

INSERT INTO ai_provider_settings (provider, enabled, priority, model)
VALUES
  ('openai', TRUE, 1, 'platform-latest'),
  ('anthropic', FALSE, 2, 'claude-sonnet-4-20250514')
ON CONFLICT (provider) DO NOTHING;

CREATE INDEX IF NOT EXISTS ai_provider_settings_priority_idx
  ON ai_provider_settings (priority, provider);

COMMIT;
