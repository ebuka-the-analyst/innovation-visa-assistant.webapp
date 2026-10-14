-- PREPARATION ONLY. Isolated Managed Payments orders, NOT the UK-only
-- member_stripe_live_orders table. This migration cannot create payments or
-- memberships, turn on a release switch, or change existing transactions.
-- Future signed-webhook fulfilment MUST check provider mode, customer, SKU,
-- verified product and price, tax-inclusive gross and paid period before writes.
CREATE TABLE IF NOT EXISTS member_stripe_managed_orders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 sku VARCHAR(32) NOT NULL CHECK (sku IN ('founder','founder_pro','founder_pass_90d')),
 buyer_kind VARCHAR(16) NOT NULL CHECK (buyer_kind IN ('individual','business')),
 product_tax_code VARCHAR(24) NOT NULL,
 stripe_product_id VARCHAR(255) NOT NULL,
 livemode BOOLEAN NOT NULL,
 provider_mode VARCHAR(32) NOT NULL DEFAULT 'stripe_managed_payments'
    CHECK(provider_mode='stripe_managed_payments'),
 stripe_customer_id VARCHAR(255) NOT NULL,
 stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
 stripe_subscription_id VARCHAR(255) UNIQUE,
 stripe_payment_intent_id VARCHAR(255),
 stripe_price_id VARCHAR(255) NOT NULL,
 base_pence INTEGER NOT NULL CHECK(base_pence>0),
 tax_pence INTEGER CHECK(tax_pence>=0),
 gross_pence INTEGER CHECK(gross_pence>0),
 currency VARCHAR(3) NOT NULL DEFAULT 'gbp' CHECK(currency='gbp'),
 customer_country CHAR(2) CHECK(customer_country ~ '^[A-Z]{2}$'),
 status VARCHAR(16) NOT NULL DEFAULT 'reserved'
  CHECK(status IN ('reserved','checkout','active','suspended','expired','review')),
 last_applied_event_created BIGINT,
 paid_through TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CONSTRAINT managed_buyer_tax_code CHECK (
   (buyer_kind='individual' AND product_tax_code='txcd_10105001') OR
   (buyer_kind='business' AND product_tax_code='txcd_10105002')
 ),
 CONSTRAINT managed_order_sku_price CHECK(
   (sku='founder' AND base_pence=6900) OR
   (sku='founder_pro' AND base_pence=11900) OR
   (sku='founder_pass_90d' AND base_pence=15900 AND stripe_subscription_id IS NULL)
 ),
 CONSTRAINT managed_invoice_tax_arithmetic CHECK (
   (tax_pence IS NULL AND gross_pence IS NULL) OR
   (tax_pence IS NOT NULL AND gross_pence=base_pence+tax_pence)
 )
);
-- A pending or current managed purchase occupies one slot for that account
-- and test/live mode; prevent parallel Stripe chargeable sessions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_managed_one_current_checkout
 ON member_stripe_managed_orders(user_id,livemode)
 WHERE status IN ('reserved','checkout','active');
CREATE INDEX IF NOT EXISTS idx_managed_orders_customer
 ON member_stripe_managed_orders(stripe_customer_id,livemode);

CREATE TABLE IF NOT EXISTS member_stripe_managed_events (
 stripe_event_id VARCHAR(255) PRIMARY KEY,
 order_id UUID NOT NULL REFERENCES member_stripe_managed_orders(id) ON DELETE RESTRICT,
 event_type VARCHAR(100) NOT NULL,
 event_created BIGINT NOT NULL,
 decision VARCHAR(16) NOT NULL CHECK(decision IN ('activate','suspend','expire','ignore','review')),
 reason TEXT NOT NULL,
 received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_managed_events_order
 ON member_stripe_managed_events(order_id,event_created);

CREATE TABLE IF NOT EXISTS member_stripe_managed_reviews (
 stripe_event_id VARCHAR(255) PRIMARY KEY
 REFERENCES member_stripe_managed_events(stripe_event_id) ON DELETE CASCADE,
 order_id UUID NOT NULL REFERENCES member_stripe_managed_orders(id) ON DELETE RESTRICT,
 reason TEXT NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'pending'
   CHECK(status IN ('pending','resolved','dismissed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_managed_reviews_pending
 ON member_stripe_managed_reviews(status,created_at);
