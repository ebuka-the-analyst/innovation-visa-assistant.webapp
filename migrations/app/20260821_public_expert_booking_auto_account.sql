ALTER TABLE expert_consultation_bookings
  ADD COLUMN IF NOT EXISTS provisioned_user_id varchar REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE expert_consultation_bookings
  ADD COLUMN IF NOT EXISTS account_setup_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_expert_booking_provisioned_user
  ON expert_consultation_bookings(provisioned_user_id)
  WHERE provisioned_user_id IS NOT NULL;
