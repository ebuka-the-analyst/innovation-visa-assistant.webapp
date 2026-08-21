const fs = require("fs");
const path = require("path");

function source(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

const retired = source("server/retiredRouteGuard.cjs");
const index = source("server/index.ts");
const routes = source("server/routes.ts");
const customer360 = source("server/customer360Admin.cjs");
const locationContext = source("server/customer360LocationContext.cjs");
const client = source("client/src/components/admin/Customer360Enhancer.tsx");
const packageJson = JSON.parse(source("package.json"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const setupAuthIndex = routes.indexOf("await setupAuth(app);");
const pricingIndex = routes.indexOf('app.get("/api/pricing"');

assert(setupAuthIndex >= 0, "registerRoutes must install authentication");
assert(pricingIndex > setupAuthIndex, "/api/pricing must register after setupAuth");

assert(
  retired.includes('const CUSTOMER360_AUTH_READY_ROUTE = "/api/pricing";'),
  "Customer 360 must defer to the auth-ready /api/pricing boundary",
);
assert(
  retired.includes('require("./customer360LocationContext.cjs");'),
  "Customer 360 location context must be loaded by the deferred bootstrap",
);
assert(
  retired.includes('require("./customer360Admin.cjs");'),
  "Customer 360 admin route must be loaded by the deferred bootstrap",
);
assert(
  retired.indexOf('require("./customer360LocationContext.cjs");') <
    retired.indexOf('require("./customer360Admin.cjs");'),
  "Customer 360 location context must load before the admin route",
);
assert(
  retired.includes("path === CUSTOMER360_AUTH_READY_ROUTE"),
  "Customer 360 modules must only load at the auth-ready route boundary",
);
assert(
  retired.includes("return application.get.call(this, path, ...handlers);"),
  "Deferred bootstrap must re-enter the Customer 360 route wrappers",
);

assert(
  !index.includes('await import("./customer360Admin.cjs");') &&
    !index.includes('await import("./customer360LocationContext.cjs");'),
  "Production server source must not use Customer 360 runtime dynamic imports",
);
assert(
  String(packageJson.scripts?.start || "").includes("server/retiredRouteGuard.cjs"),
  "Production start must preload the deferred Customer 360 bootstrap",
);

assert(
  customer360.includes("req.isAuthenticated()"),
  "Customer 360 must require an authenticated Passport session",
);
assert(
  customer360.includes("SELECT is_admin FROM users WHERE id = $1 LIMIT 1"),
  "Customer 360 must verify current admin authority in the database",
);
assert(
  locationContext.includes("requesting_admin.is_admin = true"),
  "Customer 360 location enrichment must remain admin-scoped",
);
assert(
  client.includes('credentials: "include"'),
  "Customer 360 browser request must include the authenticated session cookie",
);

console.log("Customer 360 deferred authentication-order validation passed.");
