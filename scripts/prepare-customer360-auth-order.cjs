const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function writeIfChanged(relativePath, before, after) {
  if (after !== before) {
    fs.writeFileSync(path.join(process.cwd(), relativePath), after, "utf8");
    console.log(`[customer360-auth-order] prepared ${relativePath}`);
  }
}

const retiredPath = "server/retiredRouteGuard.cjs";
const retiredBefore = read(retiredPath);
const retiredAfter = retiredBefore
  .replace('require("./customer360Admin.cjs");\n', "")
  .replace('require("./customer360LocationContext.cjs");\n', "");
writeIfChanged(retiredPath, retiredBefore, retiredAfter);

const indexPath = "server/index.ts";
const indexBefore = read(indexPath);
let indexAfter = indexBefore;
const anchor = "  const server = await registerRoutes(app);\n";
const registrationBlock = `${anchor}  // Customer 360 depends on session + Passport middleware installed by registerRoutes/setupAuth.\n  // Load these hooks only now so the read-only admin route cannot be registered ahead of authentication.\n  await import(\"./customer360LocationContext.cjs\");\n  await import(\"./customer360Admin.cjs\");\n`;

if (!indexAfter.includes('await import("./customer360Admin.cjs");')) {
  if (!indexAfter.includes(anchor)) {
    throw new Error("Could not locate registerRoutes(app) in server/index.ts");
  }
  indexAfter = indexAfter.replace(anchor, registrationBlock);
}
writeIfChanged(indexPath, indexBefore, indexAfter);

const finalRetired = read(retiredPath);
const finalIndex = read(indexPath);
if (finalRetired.includes('require("./customer360Admin.cjs")') || finalRetired.includes('require("./customer360LocationContext.cjs")')) {
  throw new Error("Customer 360 is still preloaded before authentication");
}

const routesIndex = finalIndex.indexOf("const server = await registerRoutes(app);");
const locationIndex = finalIndex.indexOf('await import("./customer360LocationContext.cjs");');
const customerIndex = finalIndex.indexOf('await import("./customer360Admin.cjs");');
const nextRouteRegistration = finalIndex.indexOf("registerAIProviderGatewayRoutes(app);", routesIndex);

if (routesIndex < 0 || locationIndex <= routesIndex || customerIndex <= locationIndex) {
  throw new Error("Customer 360 hooks are not loaded after registerRoutes/authentication");
}
if (nextRouteRegistration >= 0 && customerIndex >= nextRouteRegistration) {
  throw new Error("Customer 360 hooks must load before the next app route registration");
}

console.log("[customer360-auth-order] Customer 360 will register after session/Passport authentication");
