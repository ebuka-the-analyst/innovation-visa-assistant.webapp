-- Expert consultation booking platform
-- Integrates the existing immigration_lawyers directory with a separate,
-- auditable consultation workflow. Document-review capacity remains independent.

CREATE TABLE IF NOT EXISTS expert_consultation_profiles (
  expert_id VARCHAR PRIMARY KEY REFERENCES immigration_lawyers(id) ON DELETE CASCADE,
  public_title VARCHAR(180) NOT NULL,
  public_bio TEXT,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/London',
  consultation_enabled BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  meeting_mode VARCHAR(20) NOT NULL DEFAULT 'video',
  booking_notice_hours INTEGER NOT NULL DEFAULT 24,
  booking_horizon_days INTEGER NOT NULL DEFAULT 60,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  preparation_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_profile_notice CHECK (booking_notice_hours >= 0 AND booking_notice_hours <= 720),
  CONSTRAINT ck_expert_profile_horizon CHECK (booking_horizon_days BETWEEN 1 AND 365),
  CONSTRAINT ck_expert_profile_slot_interval CHECK (slot_interval_minutes BETWEEN 15 AND 120),
  CONSTRAINT ck_expert_profile_buffer CHECK (buffer_minutes BETWEEN 0 AND 120),
  CONSTRAINT ck_expert_profile_meeting_mode CHECK (meeting_mode IN ('video', 'phone', 'either'))
);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_enabled
  ON expert_consultation_profiles(consultation_enabled, featured, sort_order);

CREATE TABLE IF NOT EXISTS expert_consultation_services (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  expert_id VARCHAR NOT NULL REFERENCES immigration_lawyers(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_pence INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  preparation_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_service_duration CHECK (duration_minutes BETWEEN 15 AND 360),
  CONSTRAINT ck_expert_service_price CHECK (price_pence >= 0),
  CONSTRAINT ck_expert_service_currency CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_expert_services_expert
  ON expert_consultation_services(expert_id, active, sort_order);

CREATE TABLE IF NOT EXISTS expert_availability_rules (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  expert_id VARCHAR NOT NULL REFERENCES immigration_lawyers(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_rule_weekday CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT ck_expert_rule_time CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_expert_availability_rule
  ON expert_availability_rules(expert_id, weekday, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_expert_availability_rules_lookup
  ON expert_availability_rules(expert_id, weekday, active);

CREATE TABLE IF NOT EXISTS expert_availability_blocks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  expert_id VARCHAR NOT NULL REFERENCES immigration_lawyers(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_block_time CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_expert_availability_blocks_lookup
  ON expert_availability_blocks(expert_id, start_at, end_at);

CREATE TABLE IF NOT EXISTS expert_consultation_bookings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id VARCHAR NOT NULL REFERENCES immigration_lawyers(id) ON DELETE RESTRICT,
  service_id VARCHAR NOT NULL REFERENCES expert_consultation_services(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  customer_timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/London',
  status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  amount_pence INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  stripe_checkout_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  hold_expires_at TIMESTAMPTZ,
  agenda TEXT,
  meeting_url TEXT,
  meeting_mode VARCHAR(20) NOT NULL DEFAULT 'video',
  admin_notes TEXT,
  cancellation_reason TEXT,
  idempotency_key VARCHAR(100) NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_booking_time CHECK (ends_at > starts_at),
  CONSTRAINT ck_expert_booking_amount CHECK (amount_pence >= 0),
  CONSTRAINT ck_expert_booking_status CHECK (status IN ('pending_payment', 'confirmed', 'completed', 'cancelled', 'expired', 'no_show')),
  CONSTRAINT ck_expert_booking_payment_status CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT ck_expert_booking_meeting_mode CHECK (meeting_mode IN ('video', 'phone'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_expert_booking_user_idempotency
  ON expert_consultation_bookings(user_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_expert_booking_expert_time
  ON expert_consultation_bookings(expert_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_expert_booking_user_time
  ON expert_consultation_bookings(user_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_booking_status
  ON expert_consultation_bookings(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_expert_booking_hold
  ON expert_consultation_bookings(hold_expires_at)
  WHERE status = 'pending_payment';
