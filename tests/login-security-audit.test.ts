import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { classifyLoginRisk } from "../server/loginSecurityAudit";

test("five failed attempts in 24 hours elevates an account for review", () => {
  const result = classifyLoginRisk(
    {
      failedLogins24h: 5,
      sessionCount24h: 0,
      sessionCount7d: 0,
      distinctCountries7d: 0,
      distinctDevices7d: 0,
      isEmailVerified: true,
      createdAt: "2026-09-01T00:00:00Z",
    },
    new Date("2026-09-24T10:00:00Z"),
  );

  assert.equal(result.level, "elevated");
  assert.match(result.reasons.join(" "), /5 or more failed sign-in attempts/i);
});

test("country changes are treated as review signals without declaring compromise", () => {
  const result = classifyLoginRisk({
    failedLogins24h: 0,
    sessionCount24h: 1,
    sessionCount7d: 2,
    distinctCountries7d: 2,
    distinctDevices7d: 1,
    isEmailVerified: true,
  });

  assert.equal(result.level, "review");
  assert.match(result.reasons.join(" "), /multiple countries/i);
});

test("login audit routes are admin-only and do not return raw session identifiers", () => {
  const source = readFileSync(new URL("../server/loginSecurityAuditRoutes.ts", import.meta.url), "utf8");

  assert.match(source, /app\.get\("\/api\/admin\/security\/login-audit", requireAdmin/);
  assert.match(source, /app\.get\("\/api\/admin\/security\/login-audit\/:userId", requireAdmin/);

  const detailSelect = source.match(
    /SELECT\s+session_started_at,[\s\S]*?FROM user_sessions\s+WHERE user_id =/,
  )?.[0] || "";

  assert.ok(detailSelect.length > 0, "expected explicit recent-session projection");
  assert.doesNotMatch(detailSelect, /session_token/i);
  assert.doesNotMatch(detailSelect, /ip_address/i);
  assert.doesNotMatch(detailSelect, /user_agent/i);
  assert.doesNotMatch(detailSelect, /\bcity\b/i);
  assert.doesNotMatch(detailSelect, /\bregion\b/i);
});

test("admin UI does not consume raw network or session-secret fields", () => {
  const source = readFileSync(
    new URL("../client/src/components/admin/LoginSecurityAudit.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /\.ipAddress\b/);
  assert.doesNotMatch(source, /\.sessionToken\b/);
  assert.doesNotMatch(source, /\.userAgent\b/);
});

test("public security-event ingestion is no longer unauthenticated", () => {
  const source = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  assert.match(
    source,
    /app\.post\("\/api\/security\/log", requireAdmin, async \(req, res\) =>/,
  );
});
