# Expert Support automated meeting providers

The Expert Support admin booking screen supports three meeting modes:

- Google Meet: creates a Google Calendar event with a Meet conference and invites the customer and professional.
- Microsoft Teams: creates an Outlook calendar event with a Teams online meeting and invites the customer and professional.
- Custom link: stores any HTTPS meeting URL supplied by an administrator.

The application never stores provider access tokens in the database. Provider credentials stay in Railway environment variables and short-lived access tokens are cached in memory only.

## Google Meet

Required Railway variables:

- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (use `primary` or the calendar email/id)
- `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET`

If the calendar-specific client ID/secret are omitted, the application falls back to the existing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values.

The Google OAuth grant used to obtain the refresh token must include Calendar write access (`https://www.googleapis.com/auth/calendar`). The selected calendar must allow Google Meet conference creation.

The application creates events with `conferenceDataVersion=1`, requests a `hangoutsMeet` conference, and uses `sendUpdates=all` so attendees receive Google Calendar invitations/updates.

## Microsoft Teams

Required Railway variables:

- `MICROSOFT_TEAMS_TENANT_ID`
- `MICROSOFT_TEAMS_CLIENT_ID`
- `MICROSOFT_TEAMS_CLIENT_SECRET`
- `MICROSOFT_TEAMS_ORGANIZER` (organiser mailbox UPN/email or user ID)

The Microsoft Entra application requires Microsoft Graph `Calendars.ReadWrite` application permission with administrator consent. The organiser mailbox must support Microsoft Teams online meetings.

The application creates the event in the organiser's default calendar with `isOnlineMeeting=true` and `onlineMeetingProvider=teamsForBusiness`.

## Reliability behaviour

- Provider availability is verified server-side before the Admin UI enables a provider button.
- External event IDs are persisted against the consultation booking.
- Google event IDs and Microsoft transaction IDs are deterministic to reduce duplicate meeting creation during retries.
- If the provider creates the calendar event before the join URL is ready, the booking remains in `creating` state and the background synchronisation worker polls until the join URL appears.
- Meeting-link creation triggers the Expert Support in-app/email notification pipeline.
- When a booking is cancelled, the worker cancels/deletes the external calendar event and retries transient failures with backoff.
- Calendar synchronisation failures raise a deduplicated administrator alert.
- Saving a custom link first cancels an existing provider-generated event to avoid leaving a stale calendar invitation behind.

## Verification checklist

After configuring a provider in Railway:

1. Open Admin Console -> Lawyer Review Center -> Manage Network.
2. Confirm the provider button is enabled. A disabled button exposes a non-secret readiness reason in its tooltip.
3. Create a confirmed test consultation.
4. Click Google Meet or Teams.
5. Confirm a join URL appears on the booking.
6. Confirm the customer and professional receive the calendar invitation and platform email.
7. Confirm the customer sees the meeting link under My Consultations and the generated ICS export contains the same URL.
8. Cancel the test consultation and confirm the external calendar event is cancelled/removed and the cancellation notifications are delivered.
