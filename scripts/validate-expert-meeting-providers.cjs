const fs = require('fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function expect(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Expert meeting-provider validation failed: ${label}`);
}

const index = read('server/index.ts');
const routes = read('server/expertBookingRoutes.ts');
const meetingRoutes = read('server/expertMeetingProviderRoutes.ts');
const page = read('client/src/pages/expert-booking.tsx');
const migration = read('migrations/app/20260820_expert_meeting_providers.sql');

expect(index, 'registerExpertMeetingProviderRoutes(app);', 'meeting provider routes are not registered');
expect(routes, 'b.meeting_provider AS "meetingProvider"', 'admin bookings do not expose meeting provider state');
expect(meetingRoutes, 'GOOGLE_CALENDAR_REFRESH_TOKEN', 'Google Calendar OAuth refresh-token configuration is missing');
expect(meetingRoutes, 'conferenceDataVersion=1&sendUpdates=all', 'Google Meet conference creation/invitations are not enabled');
expect(meetingRoutes, 'conferenceSolutionKey: { type: "hangoutsMeet" }', 'Google Meet conference type is missing');
expect(meetingRoutes, 'MICROSOFT_TEAMS_TENANT_ID', 'Microsoft Teams tenant configuration is missing');
expect(meetingRoutes, 'isOnlineMeeting: true', 'Teams calendar event is not configured as an online meeting');
expect(meetingRoutes, 'onlineMeetingProvider: "teamsForBusiness"', 'Teams online meeting provider is missing');
expect(meetingRoutes, 'sendUpdates=all', 'Google attendee updates are not enabled');
expect(meetingRoutes, 'syncPendingProviderMeetings', 'provider synchronisation worker is missing');
expect(meetingRoutes, 'status = \'cancelled\'', 'cancelled booking cleanup is missing');
expect(meetingRoutes, 'queueExpertBookingEvent("meeting_updated"', 'meeting creation does not trigger platform notifications');
expect(meetingRoutes, 'queueAdminExpertNetworkAlert', 'meeting synchronisation failures do not alert admins');
expect(page, 'admin-expert-meeting-providers', 'provider health query is missing from Admin UI');
expect(page, 'provider: "google_meet"', 'Google Meet action is missing from Admin UI');
expect(page, 'provider: "microsoft_teams"', 'Microsoft Teams action is missing from Admin UI');
expect(page, 'provider: "custom"', 'custom meeting-link fallback is missing from Admin UI');
expect(page, 'Save custom', 'custom meeting-link action is not labelled clearly');
expect(migration, 'ADD COLUMN IF NOT EXISTS meeting_provider', 'meeting provider database column is missing');
expect(migration, 'provider_event_id', 'external provider event identifier is not persisted');
expect(migration, 'provider_sync_status', 'meeting provider synchronisation state is not persisted');
expect(migration, 'idx_expert_booking_provider_sync', 'meeting synchronisation index is missing');

console.log('[expert-meetings] validation passed');
