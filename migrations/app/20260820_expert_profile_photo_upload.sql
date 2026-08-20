-- Durable profile-photo storage for invited Expert Support professionals.
-- Images are resized/compressed before storage and served through a public, opaque-id endpoint.

CREATE TABLE IF NOT EXISTS expert_profile_images (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  invite_id VARCHAR NOT NULL REFERENCES expert_network_invites(id) ON DELETE CASCADE,
  expert_id VARCHAR REFERENCES immigration_lawyers(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL DEFAULT 'image/webp',
  image_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_profile_images_invite
  ON expert_profile_images(invite_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_profile_images_expert
  ON expert_profile_images(expert_id)
  WHERE expert_id IS NOT NULL;
