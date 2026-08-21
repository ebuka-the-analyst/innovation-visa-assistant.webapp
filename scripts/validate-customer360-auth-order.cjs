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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!retired.includes('require("./customer360Admin.cjs")'), "Customer 360 admin route must not preload before auth");
assert(!retired.includes('require("./customer360LocationContext.cjs")'), "Customer 360 location middleware must not preload before auth");
assert(routes.includes("await setupAuth(app);"), "registerRoutes must install auth before API routes");

const registerRoutesIndex = index.indexOf("const server = await registerRoutes(app);");
const locationImportIndex = index.indexOf('await import("./customer360LocationContext.cjs");');
const customerImportIndex = index.indexOf('await import("./customer360Admin.cjs");');
const nextRegistrationIndex = index.indexOf("registerAIProviderGatewayRoutes(app);", registerRoutesIndex);

assert(registerRoutesIndex >= 0, "server/index.ts must call registerRoutes(app)");
assert(locationImportIndex > registerRoutesIndex, "Customer 360 location context must load after registerRoutes/auth");
assert(customerImportIndex > locationImportIndex, "Customer 360 admin route must load after its location context");
assert(nextRegistrationIndex < 0 || customerImportIndex < nextRegistrationIndex, "Customer 360 hook must be active before the next route registration");

assert(customer360.includes("req.isAuthenticated()"), "Customer 360 must require an authenticated Passport session");
assert(customer360.includes("SELECT is_admin FROM users WHERE id = $1 LIMIT 1"), "Customer 360 must verify current admin authority in the database");
assert(locationContext.includes("requesting_admin.is_admin = true"), "Customer 360 location enrichment must remain admin-scoped");
assert(client.includes('credentials: "include"'), "Customer 360 browser request must include the authenticated session cookie");

console.log("Customer 360 authentication-order validation passed.");
