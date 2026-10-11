import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const block = routes.split('// Admin: Force logout user (invalidate sessions)')[1]?.split('// Admin: Export user data')[0] || "";

test("force logout is administrator-only and validates target user", () => {
  assert.match(block, /"\/api\/admin\/users\/:userId\/force-logout",\s*requireAdmin/);
  assert.match(block, /if \(!targetUser\)/);
});

test("revokes Passport sessions and reconciles active analytics sessions", () => {
  assert.match(block, /DELETE FROM sessions WHERE sess::jsonb->'passport'->>'user' = \$\{userId\}/);
  assert.match(block, /UPDATE user_sessions/);
  assert.match(block, /SET is_active = false/);
  assert.match(block, /WHERE user_id = \$\{userId\} AND is_active = true/);
});

test("returns actual revoked session count without exposing session secrets", () => {
  assert.match(block, /sessionsTerminated = Number\(\(result as any\)\.rowCount \|\| 0\)/);
  assert.doesNotMatch(block, /sessionToken|sessionSecret/);
});
