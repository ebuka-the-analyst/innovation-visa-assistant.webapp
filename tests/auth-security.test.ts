import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { toPublicAuthUser } from "../server/publicAuthUser";

test("auth API response exposes only the explicitly approved fields", () => {
  const publicUser = toPublicAuthUser({
    id: "account-1",
    email: "founder@example.test",
    firstName: "Example",
    lastName: "Founder",
    isAdmin: false,
    isEmailVerified: false,
    hasCompletedOnboarding: true,
    subscriptionTier: "free",
    password: "password-hash",
    verificationToken: "email-verification-secret",
    resetToken: "password-reset-secret",
    tokenExpiry: new Date(),
    resetTokenExpiry: new Date(),
    stripeCustomerId: "customer-internal-id",
    adminNotes: "internal note",
  } as any);

  assert.equal(publicUser.id, "account-1");
  assert.equal(publicUser.isEmailVerified, false);
  assert.equal(publicUser.hasCompletedOnboarding, true);
  const response = JSON.parse(JSON.stringify(publicUser));
  for (const secretField of [
    "password",
    "verificationToken",
    "tokenExpiry",
    "resetToken",
    "resetTokenExpiry",
    "stripeCustomerId",
    "adminNotes",
  ]) {
    assert.equal(Object.hasOwn(response, secretField), false, `${secretField} must not leave the server`);
  }
});

test("registration and password login both use the public user serializer", () => {
  const source = readFileSync(new URL("../server/auth.ts", import.meta.url), "utf8");
  assert.match(source, /const safeUser = toPublicAuthUser\(newUser\);/);
  assert.match(source, /const safeUser = toPublicAuthUser\(user\);/);
  assert.doesNotMatch(source, /\.\.\.safeUser\s*}\s*=\s*(?:newUser|user)/);
});

test("admin force logout uses the same table as the PostgreSQL session store", () => {
  const auth = readFileSync(new URL("../server/auth.ts", import.meta.url), "utf8");
  const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  assert.match(auth, /tableName:\s*["']sessions["']/);
  assert.match(routes, /DELETE FROM sessions WHERE sess::jsonb->'passport'->>'user'/);
  assert.doesNotMatch(routes, /DELETE FROM session WHERE sess::jsonb->'passport'->>'user'/);
});

test("successful password logins are recorded for subsequent incident review", () => {
  const source = readFileSync(new URL("../server/auth.ts", import.meta.url), "utf8");
  assert.match(source, /logSecurityEvent\(\s*["']successful_login["']/);
});
