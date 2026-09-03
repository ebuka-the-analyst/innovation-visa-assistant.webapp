-- The administrator enabled maintenance for the window shown in the Admin
-- Console. Browser datetime-local values were entered in Europe/London (BST),
-- so 10:07 local is stored as 09:07 UTC.
INSERT INTO system_settings (
  key,
  value,
  category,
  description,
  data_type,
  is_public,
  last_modified_at
)
VALUES (
  'maintenance_mode',
  jsonb_build_object(
    'enabled', true,
    'message', 'We are performing scheduled maintenance. Please check back soon.',
    'scheduledStart', '2026-09-03T09:07:00.000Z',
    'scheduledEnd', '2026-09-17T09:07:00.000Z'
  ),
  'maintenance',
  'Platform maintenance access control and schedule',
  'json',
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  data_type = EXCLUDED.data_type,
  is_public = EXCLUDED.is_public,
  last_modified_at = NOW();
