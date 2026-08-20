BEGIN;

ALTER TABLE expert_consultation_bookings
  ADD COLUMN IF NOT EXISTS meeting_provider varchar(30),
  ADD COLUMN IF NOT EXISTS provider_event_id text,
  ADD COLUMN IF NOT EXISTS provider_event_url text,
  ADD COLUMN IF NOT EXISTS provider_sync_status varchar(30) NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS provider_sync_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS provider_next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_last_error text,
  ADD COLUMN IF NOT EXISTS provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS provider_updated_at timestamptz;

ALTER TABLE expert_consultation_bookings
  DROP CONSTRAINT IF EXISTS ck_expert_booking_meeting_provider;
ALTER TABLE expert_consultation_bookings
  ADD CONSTRAINT ck_expert_booking_meeting_provider CHECK (
    meeting_provider IS NULL OR meeting_provider IN ('custom','google_meet','microsoft_teams')
  );

ALTER TABLE expert_consultation_bookings
  DROP CONSTRAINT IF EXISTS ck_expert_booking_provider_sync_status;
ALTER TABLE expert_consultation_bookings
  ADD CONSTRAINT ck_expert_booking_provider_sync_status CHECK (
    provider_sync_status IN ('none','creating','active','failed','cancel_pending','cancelled','cancel_failed')
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_expert_booking_provider_event
  ON expert_consultation_bookings(meeting_provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expert_booking_provider_sync
  ON expert_consultation_bookings(provider_sync_status, provider_next_attempt_at, status)
  WHERE meeting_provider IN ('google_meet','microsoft_teams');

COMMIT;
