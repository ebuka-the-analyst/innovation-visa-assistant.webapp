BEGIN;

CREATE TABLE IF NOT EXISTS expert_booking_notifications (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipient_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id varchar REFERENCES expert_consultation_bookings(id) ON DELETE CASCADE,
  event_type varchar(80) NOT NULL,
  type varchar(30) NOT NULL DEFAULT 'info',
  title varchar(255) NOT NULL,
  message text NOT NULL,
  action_url text,
  action_text varchar(100),
  dedupe_key varchar(255) NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_expert_booking_notifications_dedupe UNIQUE (dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_expert_booking_notifications_user_unread
  ON expert_booking_notifications(recipient_user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_booking_notifications_booking
  ON expert_booking_notifications(booking_id, created_at DESC);

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
