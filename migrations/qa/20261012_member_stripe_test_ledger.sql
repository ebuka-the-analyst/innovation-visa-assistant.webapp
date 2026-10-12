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
    (sku = 'founder' AND expected_pence = 6900) OR
    (sku = 'founder_pro' AND expected_pence = 11900) OR
    (sku = 'founder_pass_90d' AND expected_pence = 15900 AND stripe_subscription_id IS NULL)
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


-- A durable manual-review inbox for provider events that cannot be safely
-- applied automatically. NEVER transform these into paid entitlements.
CREATE TABLE IF NOT EXISTS member_stripe_test_reviews (
  stripe_event_id VARCHAR(255) PRIMARY KEY
    REFERENCES member_stripe_test_events(stripe_event_id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES member_stripe_test_orders(id) ON DELETE RESTRICT,
  event_type VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','resolved','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT test_review_resolution_consistent CHECK (
    (status = 'pending' AND resolved_at IS NULL) OR
    (status <> 'pending' AND resolved_at IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_member_stripe_test_reviews_pending
  ON member_stripe_test_reviews(status,created_at);


-- Signed webhook events that cannot yet be joined to ONE trusted order
-- must be visible to QA ops, never discarded silently or granted access.
CREATE TABLE IF NOT EXISTS member_stripe_test_unmatched_events (
  stripe_event_id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retries INTEGER NOT NULL DEFAULT 1 CHECK(retries >= 1),
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','resolved','dismissed'))
);
CREATE INDEX IF NOT EXISTS idx_member_stripe_test_unmatched_pending
 ON member_stripe_test_unmatched_events(status,first_seen_at);


-- TEST-ONLY invoice-to-PaymentIntent map. One provider-confirmed invoice
-- must have exactly one automatically collected, paid GBP PaymentIntent.
-- Store every renewal, not merely the initial subscription checkout intent.
CREATE TABLE IF NOT EXISTS member_stripe_test_invoice_payments (
  stripe_invoice_id VARCHAR(255) PRIMARY KEY,
  stripe_invoice_payment_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES member_stripe_test_orders(id) ON DELETE RESTRICT,
  amount_paid INTEGER NOT NULL CHECK(amount_paid>0),
  currency VARCHAR(3) NOT NULL CHECK(currency='gbp'),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT member_invoice_paid_period CHECK(period_end > period_start)
);
CREATE INDEX IF NOT EXISTS idx_member_stripe_test_invoice_payments_order
 ON member_stripe_test_invoice_payments(order_id,period_end);
