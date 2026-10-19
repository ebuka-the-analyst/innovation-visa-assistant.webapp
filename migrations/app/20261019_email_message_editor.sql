ALTER TABLE email_template_overrides ADD COLUMN IF NOT EXISTS message_text TEXT;
ALTER TABLE email_template_revisions ADD COLUMN IF NOT EXISTS message_text TEXT;
