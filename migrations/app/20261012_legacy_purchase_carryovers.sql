-- Legacy purchase compatibility ledger: records existing paid entitlements without
-- inventing a new subscription, creating a Stripe object, or granting credits.
-- This migration creates no customer entries and modifies NO existing users.
CREATE TABLE IF NOT EXISTS legacy_purchase_carryovers (
  user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  source_payment_transaction_id VARCHAR NOT NULL REFERENCES payment_transactions(id),
  legacy_tier VARCHAR(20) NOT NULL CHECK (legacy_tier IN ('basic','premium','enterprise','ultimate')),
  plan_credits_at_conversion INTEGER NOT NULL CHECK (plan_credits_at_conversion >= 0),
  bonus_credits_at_conversion INTEGER NOT NULL CHECK (bonus_credits_at_conversion >= 0),
  credits_used_at_conversion INTEGER NOT NULL CHECK (credits_used_at_conversion >= 0),
  legacy_paid_through TIMESTAMPTZ,
  conversion_kind VARCHAR(25) NOT NULL DEFAULT 'grandfathered_one_time'
    CHECK (conversion_kind = 'grandfathered_one_time'),
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE CHECK (auto_renew = FALSE),
  new_stripe_subscription_id VARCHAR(255),
  converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT legacy_carryover_never_creates_subscription CHECK (new_stripe_subscription_id IS NULL)
);
CREATE INDEX IF NOT EXISTS idx_legacy_purchase_carryovers_source
  ON legacy_purchase_carryovers(source_payment_transaction_id);
