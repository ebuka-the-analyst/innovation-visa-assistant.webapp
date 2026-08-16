-- Production business-plan revision management.
--
-- Invariants:
-- 1. An accepted business-plan version is immutable.
-- 2. A revision never overwrites the currently accepted plan until the owner accepts it.
-- 3. Only one active revision may exist for a plan at a time.
-- 4. Revision work is durable and lease-based so deploys/process loss are recoverable.
-- 5. Every state transition is recorded in an append-only event stream.

CREATE TABLE IF NOT EXISTS business_plan_versions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'candidate',
  generated_content TEXT NOT NULL,
  chart_data TEXT,
  content_sha256 VARCHAR(64) NOT NULL,
  created_by_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT ck_business_plan_versions_number CHECK (version_number >= 1),
  CONSTRAINT ck_business_plan_versions_status
    CHECK (status IN ('accepted', 'candidate', 'superseded'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_versions_plan_number
  ON business_plan_versions(plan_id, version_number);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_versions_one_accepted
  ON business_plan_versions(plan_id)
  WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_business_plan_versions_plan_created
  ON business_plan_versions(plan_id, created_at DESC);

CREATE TABLE IF NOT EXISTS business_plan_version_sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  version_id VARCHAR NOT NULL REFERENCES business_plan_versions(id) ON DELETE CASCADE,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  section_index INTEGER NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_sha256 VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_version_sections_index CHECK (section_index >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_version_sections_version_index
  ON business_plan_version_sections(version_id, section_index);
CREATE INDEX IF NOT EXISTS idx_business_plan_version_sections_plan
  ON business_plan_version_sections(plan_id, version_id, section_index);

CREATE TABLE IF NOT EXISTS business_plan_revisions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  source_version_id VARCHAR NOT NULL REFERENCES business_plan_versions(id),
  target_version_id VARCHAR REFERENCES business_plan_versions(id),
  request_type VARCHAR(40) NOT NULL,
  instructions TEXT NOT NULL,
  selected_section_indexes INTEGER[] NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  consistency_report JSONB,
  assigned_admin_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  idempotency_key VARCHAR(100) NOT NULL,
  last_error TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_revisions_number CHECK (revision_number >= 1),
  CONSTRAINT ck_business_plan_revisions_type CHECK (
    request_type IN ('factual_correction', 'updated_information', 'content_improvement', 'section_regeneration')
  ),
  CONSTRAINT ck_business_plan_revisions_status CHECK (
    status IN ('submitted', 'in_progress', 'ready_for_review', 'accepted', 'cancelled', 'failed')
  ),
  CONSTRAINT ck_business_plan_revisions_sections CHECK (cardinality(selected_section_indexes) > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_revisions_plan_number
  ON business_plan_revisions(plan_id, revision_number);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_revisions_user_idempotency
  ON business_plan_revisions(user_id, idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_revisions_one_active
  ON business_plan_revisions(plan_id)
  WHERE status IN ('submitted', 'in_progress', 'ready_for_review');
CREATE INDEX IF NOT EXISTS idx_business_plan_revisions_user_created
  ON business_plan_revisions(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_plan_revisions_status_created
  ON business_plan_revisions(status, submitted_at ASC);

CREATE TABLE IF NOT EXISTS business_plan_revision_sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  revision_id VARCHAR NOT NULL REFERENCES business_plan_revisions(id) ON DELETE CASCADE,
  section_index INTEGER NOT NULL,
  section_title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  original_sha256 VARCHAR(64) NOT NULL,
  revised_content TEXT,
  revised_sha256 VARCHAR(64),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_revision_sections_index CHECK (section_index >= 0),
  CONSTRAINT ck_business_plan_revision_sections_status
    CHECK (status IN ('pending', 'generating', 'completed', 'failed'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_revision_sections_revision_index
  ON business_plan_revision_sections(revision_id, section_index);
CREATE INDEX IF NOT EXISTS idx_business_plan_revision_sections_revision
  ON business_plan_revision_sections(revision_id, section_index);

CREATE TABLE IF NOT EXISTS business_plan_revision_jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  revision_id VARCHAR NOT NULL REFERENCES business_plan_revisions(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  claim_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  lease_owner VARCHAR(255),
  lease_token VARCHAR(64),
  lease_expires_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_revision_jobs_status
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  CONSTRAINT ck_business_plan_revision_jobs_counts
    CHECK (claim_count >= 0 AND failure_count >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_business_plan_revision_jobs_revision
  ON business_plan_revision_jobs(revision_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_revision_jobs_claim
  ON business_plan_revision_jobs(status, available_at, lease_expires_at);

CREATE TABLE IF NOT EXISTS business_plan_revision_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  revision_id VARCHAR NOT NULL REFERENCES business_plan_revisions(id) ON DELETE CASCADE,
  plan_id VARCHAR NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  actor_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  actor_type VARCHAR(20) NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_business_plan_revision_events_actor
    CHECK (actor_type IN ('customer', 'admin', 'system', 'worker'))
);
CREATE INDEX IF NOT EXISTS idx_business_plan_revision_events_revision
  ON business_plan_revision_events(revision_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_business_plan_revision_events_plan
  ON business_plan_revision_events(plan_id, created_at DESC);
