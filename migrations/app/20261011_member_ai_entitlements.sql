-- Phase 2 foundation. Phase 3 payment-verified Stripe fulfilment will create
-- and advance these entitlements; this migration grants NO access or credits.
CREATE TABLE IF NOT EXISTS member_ai_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id VARCHAR(32) NOT NULL CHECK (package_id IN ('founder','founder_pro','founder_pass_90d')),
  billing_kind VARCHAR(16) NOT NULL CHECK (billing_kind IN ('subscription','pass')),
  status VARCHAR(16) NOT NULL CHECK (status IN ('active','cancelled','expired','past_due')),
  provider VARCHAR(16) NOT NULL DEFAULT 'stripe',
  provider_reference VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  period_starts_at TIMESTAMPTZ NOT NULL,
  period_ends_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_member_window CHECK (ends_at > starts_at AND period_ends_at > period_starts_at),
  CONSTRAINT correct_member_kind CHECK (
    (package_id = 'founder_pass_90d' AND billing_kind = 'pass') OR
    (package_id IN ('founder','founder_pro') AND billing_kind = 'subscription')
  ),
  UNIQUE (provider, provider_reference)
);

CREATE INDEX IF NOT EXISTS idx_member_ai_entitlements_active
  ON member_ai_entitlements(user_id, status, ends_at DESC);

CREATE TABLE IF NOT EXISTS member_ai_quota_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id UUID NOT NULL REFERENCES member_ai_entitlements(id) ON DELETE RESTRICT,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation VARCHAR(16) NOT NULL CHECK (operation IN ('generation','revision')),
  source_id VARCHAR(64) NOT NULL,
  period_starts_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved','committed','released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(operation, source_id)
);
CREATE INDEX IF NOT EXISTS idx_member_ai_quota_periods
  ON member_ai_quota_reservations(entitlement_id, period_starts_at, operation, status);
