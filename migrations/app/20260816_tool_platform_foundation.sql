-- Production tool-platform foundation.
-- Additive, forward-only and executed transactionally by server/scripts/run-app-migrations.cjs.

CREATE TABLE IF NOT EXISTS tool_case_contexts (
  user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL DEFAULT 0,
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_tool_case_contexts_revision CHECK (revision >= 0),
  CONSTRAINT ck_tool_case_contexts_context_object CHECK (jsonb_typeof(context_data) = 'object'),
  CONSTRAINT ck_tool_case_contexts_evidence_array CHECK (jsonb_typeof(evidence_refs) = 'array')
);

CREATE TABLE IF NOT EXISTS tool_case_context_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  previous_sha256 VARCHAR(64),
  new_sha256 VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_tool_case_context_events_revision CHECK (revision > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tool_case_context_events_user_revision
  ON tool_case_context_events(user_id, revision);
CREATE INDEX IF NOT EXISTS idx_tool_case_context_events_user_created
  ON tool_case_context_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tool_runs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id VARCHAR(120) NOT NULL,
  client_run_key VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'started',
  execution_mode VARCHAR(30) NOT NULL DEFAULT 'legacy_client',
  registry_version VARCHAR(60) NOT NULL,
  policy_version VARCHAR(60),
  case_context_revision INTEGER,
  input_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_payload JSONB,
  result_sha256 VARCHAR(64),
  validation_state VARCHAR(20) NOT NULL DEFAULT 'unverified',
  validation_summary JSONB,
  confidence_score INTEGER,
  error_code VARCHAR(80),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_tool_runs_status CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
  CONSTRAINT ck_tool_runs_execution_mode CHECK (execution_mode IN ('legacy_client', 'server_engine')),
  CONSTRAINT ck_tool_runs_validation_state CHECK (validation_state IN ('unverified', 'validated', 'rejected')),
  CONSTRAINT ck_tool_runs_confidence CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 100),
  CONSTRAINT ck_tool_runs_context_revision CHECK (case_context_revision IS NULL OR case_context_revision >= 0),
  CONSTRAINT ck_tool_runs_input_object CHECK (jsonb_typeof(input_snapshot) = 'object'),
  CONSTRAINT ck_tool_runs_evidence_array CHECK (jsonb_typeof(evidence_refs) = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tool_runs_user_tool_client_key
  ON tool_runs(user_id, tool_id, client_run_key)
  WHERE client_run_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tool_runs_user_created
  ON tool_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_runs_user_tool_created
  ON tool_runs(user_id, tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_runs_status_created
  ON tool_runs(status, created_at);

CREATE TABLE IF NOT EXISTS tool_run_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  run_id VARCHAR NOT NULL REFERENCES tool_runs(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_tool_run_events_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_tool_run_events_run_created
  ON tool_run_events(run_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tool_run_events_user_created
  ON tool_run_events(user_id, created_at DESC);
