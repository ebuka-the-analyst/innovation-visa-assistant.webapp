const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function writeIfChanged(relativePath, before, after) {
  if (after !== before) {
    fs.writeFileSync(path.join(process.cwd(), relativePath), after, "utf8");
    console.log(`[customer360-auth-order] removed stale runtime injection from ${relativePath}`);
  }
}

// PR #68 temporarily solved the auth-order issue by injecting runtime dynamic
// imports into server/index.ts during the build. Railway's subsequent deployment
// failed its healthcheck, so production now keeps Customer 360 on the normal CJS
// preload path and defers those modules inside retiredRouteGuard.cjs until the
// /api/pricing registration boundary, which occurs after setupAuth(app).
//
// Keep this preparation script idempotent because package.json and CI already call
// it. Its only mutation is to remove the old generated block if it is ever present.
const indexPath = "server/index.ts";
const indexBefore = read(indexPath);
const legacyBlock = `  // Customer 360 depends on session + Passport middleware installed by registerRoutes/setupAuth.\n  // Load these hooks only now so the read-only admin route cannot be registered ahead of authentication.\n  await import(\"./customer360LocationContext.cjs\");\n  await import(\"./customer360Admin.cjs\");\n`;
const indexAfter = indexBefore.replace(legacyBlock, "");
writeIfChanged(indexPath, indexBefore, indexAfter);

const retired = read("server/retiredRouteGuard.cjs");
const index = read(indexPath);

if (!retired.includes('const CUSTOMER360_AUTH_READY_ROUTE = "/api/pricing";')) {
  throw new Error("Customer 360 deferred auth-ready boundary is missing");
}
if (!retired.includes('require("./customer360LocationContext.cjs");') || !retired.includes('require("./customer360Admin.cjs");')) {
  throw new Error("Customer 360 deferred modules are missing from the production preload guard");
}
if (index.includes('await import("./customer360Admin.cjs");') || index.includes('await import("./customer360LocationContext.cjs");')) {
  throw new Error("Customer 360 runtime dynamic imports must not be present in server/index.ts");
}

for (const relativePath of [
  "server/retiredRouteGuard.cjs",
  "server/customer360LocationContext.cjs",
  "server/customer360Admin.cjs",
]) {
  execFileSync(process.execPath, ["--check", relativePath], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

console.log("[customer360-auth-order] deferred CommonJS bootstrap ready after authentication");
