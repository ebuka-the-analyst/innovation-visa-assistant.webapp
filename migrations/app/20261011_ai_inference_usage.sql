-- Phase 2: auditable premium AI inference ledger. Applied only by the
-- explicit app migration runner; never by request handling or app startup.
CREATE TABLE IF NOT EXISTS ai_inference_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(32) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'unknown')),
  provider_response_id VARCHAR(160),
  model VARCHAR(160),
  operation VARCHAR(32) NOT NULL,
  workload VARCHAR(40) NOT NULL,
  job_id VARCHAR(64),
  input_tokens BIGINT,
  cached_input_tokens BIGINT,
  output_tokens BIGINT,
  reasoning_tokens BIGINT,
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  cost_usd_estimated NUMERIC(16,8),
  cost_pricing_version VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_inference_usage_positive_tokens CHECK (
    (input_tokens IS NULL OR input_tokens >= 0) AND
    (cached_input_tokens IS NULL OR cached_input_tokens >= 0) AND
    (output_tokens IS NULL OR output_tokens >= 0) AND
    (reasoning_tokens IS NULL OR reasoning_tokens >= 0)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_ai_inference_provider_response
  ON ai_inference_usage(provider, provider_response_id)
  WHERE provider_response_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_inference_usage_workload_job
  ON ai_inference_usage(workload, job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_inference_usage_created_at
  ON ai_inference_usage(created_at DESC);
