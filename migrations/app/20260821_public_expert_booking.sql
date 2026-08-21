-- Public/guest Expert Booking support.
-- Forward-only migration: existing expert-booking migrations remain immutable.

ALTER TABLE expert_consultation_bookings
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE expert_consultation_bookings
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(320),
  ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(120);

-- Backfill customer contact details for existing account-backed bookings so all
-- notification/reporting queries can use the same customer-facing fields.
UPDATE expert_consultation_bookings b
SET customer_email = COALESCE(b.customer_email, u.email),
    customer_first_name = COALESCE(b.customer_first_name, u.first_name),
    customer_last_name = COALESCE(b.customer_last_name, u.last_name)
FROM users u
WHERE b.user_id = u.id
  AND (b.customer_email IS NULL OR b.customer_first_name IS NULL OR b.customer_last_name IS NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ck_expert_booking_customer_identity'
  ) THEN
    ALTER TABLE expert_consultation_bookings
      ADD CONSTRAINT ck_expert_booking_customer_identity
      CHECK (
        user_id IS NOT NULL
        OR (customer_email IS NOT NULL AND length(trim(customer_email)) >= 5)
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_expert_booking_guest_idempotency
  ON expert_consultation_bookings(lower(customer_email), idempotency_key)
  WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_expert_booking_guest_email_time
  ON expert_consultation_bookings(lower(customer_email), starts_at DESC)
  WHERE user_id IS NULL;
