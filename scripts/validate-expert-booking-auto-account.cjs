const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = read("client/src/App.tsx");
const sidebar = read("client/src/components/app-sidebar.tsx");
const publicUi = read("client/src/components/expert-booking/PublicExpertBooking.tsx");
const routes = read("server/publicExpertBookingRoutes.ts");
const webhook = read("server/expertBookingPaymentWebhook.ts");
const provisioning = read("server/expertBookingAccountProvisioning.ts");
const migration = read("migrations/app/20260821_public_expert_booking_auto_account.sql");

assert(app.includes('const { data: shellUser } = useQuery<{ id: string }>'), "Expert Booking shell must react to the authenticated session");
assert(app.includes("<AppSidebar publicMode={!shellUser} />"), "Expert Booking must switch from public sidebar to the signed-in sidebar after account creation");
assert(sidebar.includes("{!publicMode && <SidebarFooter>"), "Logged-out Expert Booking must hide the guest account/footer block");
assert(!sidebar.includes('displayName: "Guest visitor"'), "Guest visitor label must not be rendered");
assert(!sidebar.includes('email: "No account required"'), "No-account sidebar copy must be removed");

assert(!publicUi.includes("No subscription and no account required"), "No-subscription/no-account hero copy must be removed");
assert(!publicUi.includes("No account required. Confirmation"), "No-account guest form copy must be removed");
assert(publicUi.includes("We'll create your account automatically when your booking is confirmed."), "Booking form must explain automatic account creation");
assert(publicUi.includes('queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });'), "Booking confirmation must refresh authenticated user state");
assert(publicUi.includes("Your account is ready and you are now signed in."), "Payment confirmation must confirm the automatic sign-in");

assert(routes.includes("getOrCreateProvisionedExpertBookingAccount"), "Guest booking creation must provision an account");
assert(routes.includes("activateProvisionedExpertBookingAccount"), "Confirmed guest bookings must activate the provisioned account");
assert(routes.includes("SET provisioned_user_id = $2"), "Guest bookings must be durably linked to the provisioned account before checkout");
assert(routes.includes("requiresSignIn: true"), "Existing account emails must require sign-in rather than being auto-logged-in");
assert(!routes.includes("&& !booking.userId\n    && booking.customerEmail"), "Signed guest access token must remain usable after the booking is attached to the new account");
assert(routes.includes("accountCreated: Boolean(account)"), "Payment confirmation must report account activation");

assert(provisioning.includes("!existing.isEmailVerified"), "Only unverified booking placeholders may be reused");
assert(provisioning.includes("!existing.password"), "Existing password accounts must never be silently taken over");
assert(provisioning.includes("!existing.googleId"), "Existing Google accounts must never be silently taken over");
assert(provisioning.includes("SET is_email_verified = true"), "Provisioned account must be activated only after booking confirmation");
assert(provisioning.includes('request.login({ id: userId }'), "Confirmed booking must establish a Passport login session");
assert(provisioning.includes("request.session.save"), "Automatic login session must be explicitly persisted");
assert(provisioning.includes("Your Expert Booking account is ready"), "New account must receive a password-setup email");
assert(provisioning.includes("account_setup_sent_at"), "Password-setup email must be deduplicated");

assert(webhook.includes('const guestSession = userId === "guest";'), "Guest Stripe webhook must remain valid after account linkage");
assert(webhook.includes("await activateProvisionedExpertBookingAccount(bookingId);"), "Stripe webhook must activate the account even if the browser never returns");

assert(migration.includes("provisioned_user_id"), "Auto-account migration must persist the provisioned user link");
assert(migration.includes("account_setup_sent_at"), "Auto-account migration must persist setup-email delivery state");

console.log("Expert Booking automatic account creation, secure activation, auto-login and guest UI cleanup validation passed.");
