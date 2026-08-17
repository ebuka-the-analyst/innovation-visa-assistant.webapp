const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function requireText(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`Founder portfolio validation failed: missing ${label}`);
  }
}

const server = read("server/founderPortfolio.cjs");
const preload = read("server/retiredRouteGuard.cjs");
const client = read("client/src/pages/founder-portfolio.tsx");

requireText(preload, 'require("./founderPortfolio.cjs")', "runtime route preload");
requireText(server, 'const ROUTE = "/api/founder-portfolio"', "account API route");
requireText(server, "if (!isAuthenticated(req))", "authentication guard");
requireText(server, "WHERE user_id = $1 AND tool_id = $2", "user-scoped persistence");
requireText(server, "github-public-api", "public GitHub provenance");
requireText(server, "latestCompletedPlan", "completed-plan evidence bridge");
requireText(client, 'requestJson<PortfolioResponse>("/api/founder-portfolio")', "client account load");
requireText(client, 'method: "PUT"', "client account save");
requireText(client, '"/api/founder-portfolio/import-account"', "saved-evidence import");
requireText(client, '"/api/founder-portfolio/import-github"', "GitHub import");
requireText(client, "They are intentionally not auto-generated from a CV or business plan", "reference anti-fabrication guardrail");
requireText(client, "it does not silently complete separate required diagnostics", "progress separation guardrail");

if (client.includes("useState<GithubProject[]>([])") || client.includes("useState<DemoVideo[]>([])") || client.includes("useState<PastProject[]>([])")) {
  throw new Error("Founder portfolio validation failed: browser-only empty evidence arrays remain");
}

console.log("Founder portfolio account-sync validation passed.");
