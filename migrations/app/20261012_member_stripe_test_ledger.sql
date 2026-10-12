-- Phase 3: NON-PRODUCTION test-mode acceptance ledger.
-- Does not grant member_ai_entitlements, users.subscription_tier, or customer quotas.
-- Never use this migration alone as authorisation to enable Stripe products.
CREATE TABLE IF NOT EXISTS member_stripe_test_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sku VARCHAR(32) NOT NULL CHECK (sku IN ('founder','founder_pro','founder_pass_90d')),
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  stripe_price_id VARCHAR(255) NOT NULL,
  expected_pence INTEGER NOT NULL CHECK (expected_pence > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'gbp' CHECK (currency = 'gbp'),
  last_applied_event_created BIGINT,
  currently_active BOOLEAN NOT NULL DEFAULT FALSE,
  paid_through TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT test_order_price_matches_sku CHECK (
    (sku = 'founder' AND expected_pence = 6900 AND stripe_subscription_id IS NOT NULL) OR
    (sku = 'founder_pro' AND expected_pence = 11900 AND stripe_subscription_id IS NOT NULL) OR
    (sku = 'founder_pass_90d' AND expected_pence = 15900 AND stripe_subscription_id IS NULL
      AND stripe_payment_intent_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_member_stripe_test_orders_user
  ON member_stripe_test_orders(user_id);

CREATE TABLE IF NOT EXISTS member_stripe_test_events (
  stripe_event_id VARCHAR(255) PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES member_stripe_test_orders(id) ON DELETE RESTRICT,
  event_type VARCHAR(100) NOT NULL,
  event_created BIGINT NOT NULL,
  decision VARCHAR(16) NOT NULL CHECK (decision IN ('activate','suspend','expire','ignore','review')),
  reason TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_member_stripe_test_events_order
  ON member_stripe_test_events(order_id, event_created);
