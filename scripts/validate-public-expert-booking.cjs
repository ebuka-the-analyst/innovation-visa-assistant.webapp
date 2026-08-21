const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = read("client/src/App.tsx");
const toolsHub = read("client/src/pages/tools-hub.tsx");
const expertPage = read("client/src/pages/expert-booking.tsx");
const publicUi = read("client/src/components/expert-booking/PublicExpertBooking.tsx");
const serverIndex = read("server/index.ts");
const guestRoutes = read("server/publicExpertBookingRoutes.ts");
const notificationService = read("server/expertNotificationService.ts");
const webhook = read("server/expertBookingPaymentWebhook.ts");
const migration = read("migrations/app/20260821_public_expert_booking.sql");

assert(app.match(/SIDEBAR_HIDDEN_ROUTES[^\n]+"\/expert-booking"/), "Expert Booking must use the clean public layout");
assert(expertPage.includes("export default PublicExpertBooking;"), "Modern public Expert Booking must be the rendered page");
assert(publicUi.includes("No account required"), "Guest booking UX must explicitly allow booking without an account");
assert(publicUi.includes("/api/expert-booking/guest-bookings"), "Guest booking UI must use the public booking API");
assert(publicUi.includes("scrollBy({ left: direction * 310"), "Availability must use the horizontal schedule slider");
assert(publicUi.includes("overflow-x-auto"), "Schedule slider must support touch/trackpad horizontal scrolling");

assert(toolsHub.includes('id: "expert-booking"'), "Expert Booking must appear in Tools Hub");
assert(toolsHub.includes('id: "blog"'), "Blog must appear in Tools Hub");
assert(toolsHub.includes('OPEN_ACCESS_ROUTES'), "Free public tool routes must bypass account entitlements");
assert(toolsHub.includes('tierFilter === "free" ? OPEN_ACCESS_TOOL_IDS.has(tool.id)'), "Free filter must show the two open-access tools");

assert(serverIndex.includes('registerPublicExpertBookingRoutes(app);'), "Public Expert Booking server routes must be registered");
assert(guestRoutes.includes('app.post("/api/expert-booking/guest-bookings"'), "Guest booking creation endpoint is missing");
assert(guestRoutes.includes('userId: "guest"'), "Guest Stripe sessions must be identifiable by the webhook");
assert(guestRoutes.includes("SELECT id FROM immigration_lawyers WHERE id = $1 FOR UPDATE"), "Guest booking must lock the expert during slot revalidation");
assert(guestRoutes.includes("expert_availability_blocks"), "Guest booking must respect availability blocks");
assert(guestRoutes.includes("status = 'confirmed' OR (status = 'pending_payment'"), "Guest booking must prevent double booking");
assert(guestRoutes.includes("verifyGuestBookingAccessToken"), "Guest booking reads and payment confirmation must use signed access tokens");

assert(migration.includes("ALTER COLUMN user_id DROP NOT NULL"), "Guest booking migration must allow bookings without a user account");
assert(migration.includes("customer_email"), "Guest booking migration must store customer email");
assert(migration.includes("ux_expert_booking_guest_idempotency"), "Guest idempotency protection is missing");

assert(notificationService.includes('COALESCE(u.email, b.customer_email) AS "userEmail"'), "Lifecycle emails must support guest customers");
assert(notificationService.includes("LEFT JOIN users u ON u.id = b.user_id"), "Guest lifecycle notifications must not require a users row");
assert(webhook.includes('const guestSession = userId === "guest" && !booking?.userId;'), "Stripe webhook must accept validated guest bookings");
assert(
  webhook.includes('COALESCE(u.email, b.customer_email) AS "userEmail"')
    || webhook.includes('queueExpertBookingEvent("confirmed"'),
  "Webhook confirmation must use a guest-aware email/notification path",
);

console.log("Public Expert Booking access, guest checkout, free-tool and redesign validation passed.");
