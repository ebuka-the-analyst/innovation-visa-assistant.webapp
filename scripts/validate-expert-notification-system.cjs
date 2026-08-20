const fs = require('fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function expect(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Expert notification validation failed: ${label}`);
}

const routes = read('server/routes.ts');
const bookingRoutes = read('server/expertBookingRoutes.ts');
const webhook = read('server/expertBookingPaymentWebhook.ts');
const applications = read('server/expertApplicationRoutes.ts');
const bookingPage = read('client/src/pages/expert-booking.tsx');
const adminNetwork = read('client/src/pages/admin/ExpertNetwork.tsx');
const notificationService = read('server/expertNotificationService.ts');
const migration = read('migrations/app/20260820_expert_notification_delivery.sql');

expect(routes, "n.target_type = 'user' AND n.target_value = ${userId}", 'user-targeted notifications are not visible to NotificationBell/history');
expect(bookingRoutes, 'queueExpertBookingEvent', 'booking routes do not use durable notification events');
expect(bookingRoutes, 'startExpertNotificationWorker();', 'durable email worker is not started');
expect(bookingRoutes, 'queueExpertBookingEvent(parsed.data.status', 'admin booking lifecycle actions are not notification-backed');
expect(bookingRoutes, 'queueExpertBookingEvent("meeting_updated"', 'meeting-link updates are not notification-backed');
expect(bookingRoutes, 'queueExpertBookingEvent(isFree ? "confirmed" : "pending_payment"', 'booking creation is not notification-backed');
expect(webhook, 'queueExpertBookingEvent("confirmed"', 'Stripe confirmation is not notification-backed');
expect(webhook, 'queueExpertBookingEvent("payment_failed"', 'Stripe failure/expiry is not notification-backed');
expect(applications, 'queueAdminExpertNetworkAlert', 'new professional applications do not alert administrators');
expect(applications, 'queueExpertProfileEmail', 'professional application lifecycle is not durable-email backed');
expect(bookingPage, 'Consultation services</h4>', 'admin cannot manage all consultation services');
expect(bookingPage, 'Add consultation', 'admin cannot add another consultation service');
expect(bookingPage, 'servicePreparationNote', 'per-service preparation notes are not editable');
expect(bookingPage, 'serviceActive', 'individual consultation services cannot be enabled/disabled');
expect(bookingPage, 'Reason for cancellation', 'cancellation reason UX is missing');
expect(bookingPage, '>No-show</Button>', 'no-show lifecycle action is missing');
expect(adminNetwork, '<NotificationBell />', 'Admin Expert Network does not expose in-app alerts');
expect(notificationService, 'expert_email_outbox', 'durable email outbox is not used');
expect(notificationService, 'attempts < 10', 'email retry policy is missing');
expect(notificationService, 'ON CONFLICT (source_key)', 'in-app notification deduplication is missing');
expect(migration, 'CREATE TABLE IF NOT EXISTS expert_email_outbox', 'email outbox migration is missing');
expect(migration, 'ux_admin_notifications_source_key', 'in-app notification idempotency migration is missing');

console.log('[expert-notifications] validation passed');
