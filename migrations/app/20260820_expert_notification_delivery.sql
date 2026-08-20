BEGIN;

-- Reuse the platform's existing admin_notifications + NotificationBell pipeline for
-- recipient-specific Expert Support notifications. source_key makes event creation
-- idempotent so webhook retries or repeated admin actions cannot duplicate alerts.
ALTER TABLE admin_notifications
  ADD COLUMN IF NOT EXISTS source_key varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_notifications_source_key
  ON admin_notifications(source_key)
  WHERE source_key IS NOT NULL;

-- Email delivery is durable. Events are queued in PostgreSQL first, then a worker
-- retries transient provider failures with backoff instead of relying on fire-and-forget.
CREATE TABLE IF NOT EXISTS expert_email_outbox (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id varchar REFERENCES expert_consultation_bookings(id) ON DELETE SET NULL,
  event_type varchar(80) NOT NULL,
  recipient_email varchar(320) NOT NULL,
  recipient_name varchar(255),
  recipient_user_id varchar REFERENCES users(id) ON DELETE SET NULL,
  subject varchar(500) NOT NULL,
  html text NOT NULL,
  email_type varchar(80) NOT NULL DEFAULT 'expert_booking',
  dedupe_key varchar(320) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_expert_email_outbox_dedupe UNIQUE (dedupe_key),
  CONSTRAINT ck_expert_email_outbox_status CHECK (status IN ('pending','sending','sent','failed'))
);

CREATE INDEX IF NOT EXISTS idx_expert_email_outbox_delivery
  ON expert_email_outbox(status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS idx_expert_email_outbox_booking
  ON expert_email_outbox(booking_id, created_at DESC);

COMMIT;
