-- Application-context document extraction storage.
--
-- Forward-only, additive and data-preserving. The application-context endpoint may
-- reuse completed document extractions, so this runtime dependency must be owned by
-- the explicit app migration system rather than assumed from the Drizzle schema.

CREATE TABLE IF NOT EXISTS document_extractions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  user_id VARCHAR NOT NULL,
  document_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  extracted_data JSONB,
  confidence JSONB,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reconcile legacy copies additively. Existing data is never deleted or guessed.
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS user_id VARCHAR;
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS document_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS extracted_data JSONB;
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS confidence JSONB;
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE document_extractions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_extraction_user ON document_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_extraction_user_status_created
  ON document_extractions(user_id, status, created_at DESC);
