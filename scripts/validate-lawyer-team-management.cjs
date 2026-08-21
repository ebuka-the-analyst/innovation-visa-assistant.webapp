const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const component = read("client/src/components/admin/LawyerTeamManagement.tsx");
const admin = read("client/src/pages/admin-dashboard.tsx");
const routes = read("server/routes.ts");
const storage = read("server/storage.ts");

assert(admin.includes('from "@/components/admin/LawyerTeamManagement"'), "Admin dashboard must import LawyerTeamManagement");
assert(admin.includes("<LawyerTeamManagement />"), "Lawyer Team section must render LawyerTeamManagement");
assert(!admin.includes("Math.round(((lawyer.totalReviewsCompleted || 0) * 0.85)"), "Fabricated 85% Lawyer Team approval rate must be removed");

for (const label of ["View Profile", "Edit Details", "View Performance", "Set Availability", "Remove", "Add Lawyer"]) {
  assert(component.includes(label), `Lawyer Team action missing: ${label}`);
}
assert(component.includes('apiRequest("DELETE", `/api/admin/lawyers/${lawyer.id}`)'), "Remove must call the lawyer DELETE endpoint");
assert(component.includes('current.filter((item) => item.id !== lawyer.id)'), "Remove must immediately evict the lawyer from the UI cache");
assert(component.includes('apiRequest("PATCH", `/api/admin/lawyers/${selected.id}`'), "Availability must persist through PATCH");
assert(component.includes('apiRequest("GET", `/api/admin/lawyers/${lawyer.id}/performance`)'), "Performance action must load real performance data");
assert(component.includes('mode === "add" ? "POST" : "PATCH"'), "Add/Edit must persist through POST/PATCH");
assert(component.includes("approvalDisplay(lawyer.successRate)"), "Lawyer card must use real successRate instead of a fabricated percentage");
assert(component.includes("Historical reviews and bookings are preserved"), "Remove confirmation must explain historical record preservation");

assert(storage.includes(".where(sql`${immigrationLawyers.status} <> 'inactive'`)"), "Inactive removed lawyers must be hidden from active team reads");
assert(storage.includes("Preserve historical reviews/bookings"), "Lawyer removal must be a soft removal");
assert(!storage.includes("async deleteImmigrationLawyer(id: string): Promise<void> {\n    await db.delete(immigrationLawyers)"), "Lawyer removal must not hard-delete the professional row");

assert(routes.includes("lawyerProfileInputSchema"), "Lawyer create/update endpoints must validate payloads");
assert(routes.includes("Inactive historical records are restored instead of duplicated"), "Re-adding a removed email must safely restore the historical professional record");
assert(routes.includes("Get all active/suspended immigration lawyers with real review metrics"), "Lawyer list route must expose real review metrics");
assert(routes.includes("successRate: completedReviews.length ? Math.round((approvedReviews.length / completedReviews.length) * 100) : null"), "Team approval rate must be computed from completed review outcomes");
assert(routes.includes("Remove a lawyer from active use without destroying historical review/booking relationships"), "Delete endpoint must use safe removal semantics");
assert(routes.includes('removalMode: "inactive"'), "Delete response must confirm soft-removal mode");
assert(routes.includes("Get lawyer performance from review records (no fabricated approval values)"), "Performance endpoint must use review records");
assert(routes.includes("approvalRate: completedReviews.length ? Math.round((approvedReviews.length / completedReviews.length) * 100) : 0"), "Performance approval rate must be derived from completed reviews");

console.log("Lawyer Team management validation passed: all menu actions are wired, metrics are real, and removal is history-safe.");
