const fs = require("fs");
const path = require("path");

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), "utf8");
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const finder = read("client/src/pages/tools/lawyer-finder.tsx");
const booking = read("client/src/components/expert-booking/PublicExpertBooking.tsx");
const bookingRoutes = read("server/expertBookingRoutes.ts");
const guestRoutes = read("server/publicExpertBookingRoutes.ts");
const applications = read("server/expertApplicationRoutes.ts");

for (const demoMarker of [
  "const LAWYERS",
  "Sarah Mitchell",
  "James Chen",
  "Priya Sharma",
  "Michael O'Brien",
  "Emma Williams",
  "Mitchell & Partners Immigration",
  "Highest Rated",
]) {
  assert(!finder.includes(demoMarker), `Lawyer Finder still contains demo content: ${demoMarker}`);
}

assert(finder.includes('["/api/expert-booking/experts"]'), "Lawyer Finder must use the real expert booking directory");
assert(finder.includes("/expert-booking?expertId="), "Lawyer Finder booking action must pass the selected professional");
assert(finder.includes("No cached or demo profiles are being substituted"), "Lawyer Finder must fail closed when the API is unavailable");
assert(finder.includes("Only administrator-approved professionals"), "Lawyer Finder empty state must explain approval gating");
assert(!finder.includes("success rate"), "Lawyer Finder must not display unverified success-rate claims");

assert(booking.includes("const requestedExpertId = useMemo("), "Expert Booking must read the requested expert from the URL");
assert(booking.includes("experts.find((expert) => expert.id === requestedExpertId)"), "Expert Booking must preselect the requested professional");

for (const routes of [bookingRoutes, guestRoutes]) {
  assert(routes.includes("a.review_status = 'approved'"), "Booking routes must require an approved onboarding application");
}
assert(bookingRoutes.includes("p.consultation_enabled = true"), "Public directory must require an enabled consultation profile");
assert(bookingRoutes.includes("l.status = 'active'"), "Public directory must require an active professional");
assert(bookingRoutes.includes("l.is_available = true"), "Public directory must require an available professional");

assert(applications.includes("$10,false,'inactive',$11"), "New professional profiles must not be public before admin approval");
assert(applications.includes("SET is_available = $2, status = $3"), "Admin review must activate/deactivate the professional atomically");
assert(applications.includes("SET consultation_enabled = $2"), "Admin review must activate/deactivate consultation booking");
assert(applications.includes('decision: z.enum(["approved", "rejected"])'), "Admin onboarding review decisions must remain explicit");

console.log(JSON.stringify({
  ok: true,
  demoProfilesRemoved: true,
  liveDirectory: true,
  selectedExpertDeepLink: true,
  approvalGate: true,
  preApprovalPublicVisibility: false,
}, null, 2));
