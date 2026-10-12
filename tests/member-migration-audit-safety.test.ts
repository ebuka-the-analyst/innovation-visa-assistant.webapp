import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const routes = fs.readFileSync(path.resolve("server/routes.ts"), "utf8");
const start = routes.indexOf('app.get("/api/admin/member-migration-audit"');
const end = routes.indexOf('app.get("/api/tools/access"', start);
const section = routes.slice(start, end);

test("migration audit is admin-only, GET and read-only", () => {
  assert.ok(start >= 0 && end > start, "audit route must be present");
  assert.match(section, /app\.get\("\/api\/admin\/member-migration-audit",\s*isAuthenticated,\s*requireAdmin/);
  assert.match(section, /SELECT count\(\*\)::int AS "activeLegacyAccounts"/);
  assert.match(section, /"mode":"read-only"/);
  assert.match(section, /"destructive":false/);
  assert.doesNotMatch(section, /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP|ALTER)\s+(?:INTO|FROM|TABLE|users|payment_transactions|credit_transactions)\b/i);
  assert.doesNotMatch(section, /(?:\.email|\.firstName|\.lastName|\.phone|\.password)/);
});
