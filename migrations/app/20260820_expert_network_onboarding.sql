-- Expert/lawyer self-onboarding invitations and application review state.
-- Submitted profiles are created in the shared professional directory immediately,
-- but remain non-public until an administrator verifies and publishes them.

CREATE TABLE IF NOT EXISTS expert_network_invites (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  recipient_email VARCHAR(255),
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_network_invite_status CHECK (status IN ('active','used','revoked','expired'))
);

CREATE INDEX IF NOT EXISTS idx_expert_network_invites_status
  ON expert_network_invites(status, expires_at);

CREATE TABLE IF NOT EXISTS expert_network_applications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  invite_id VARCHAR NOT NULL REFERENCES expert_network_invites(id) ON DELETE RESTRICT,
  expert_id VARCHAR REFERENCES immigration_lawyers(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  regulator_type VARCHAR(30),
  regulator_number VARCHAR(100),
  submitted_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_status VARCHAR(30) NOT NULL DEFAULT 'pending_verification',
  reviewed_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_expert_network_application_status CHECK (
    review_status IN ('pending_verification','approved','rejected')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_expert_network_application_invite
  ON expert_network_applications(invite_id);
CREATE INDEX IF NOT EXISTS idx_expert_network_applications_review
  ON expert_network_applications(review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_network_applications_email
  ON expert_network_applications(lower(email));
