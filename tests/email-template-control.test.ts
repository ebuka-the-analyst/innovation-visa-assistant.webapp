import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The template policy is pure; configure the database pool without opening any connection.
process.env.DATABASE_URL ||= "postgresql://unit:unit@localhost:5432/unit";
process.env.RAILWAY_ENVIRONMENT ||= "unit-test";
const { emailBrand, templateKey, normaliseEmailBrand, renderEmailTemplate,
  validateTemplateEdit, EMAIL_TEMPLATES } = await import("../server/services/emailTemplateService");

test("both brands use separate namespaces and the expected Railway service", () => {
  assert.equal(emailBrand({RAILWAY_SERVICE_NAME:"visaassistant-global"}), "global");
  assert.equal(emailBrand({RAILWAY_SERVICE_NAME:"innovation-visa-assistant.webapp"}), "ifva");
  assert.equal(emailBrand({EMAIL_BRAND:"global",RAILWAY_SERVICE_NAME:"innovation-visa-assistant.webapp"}), "global");
});

test("every key is unique and catalogue covers required lifecycle emails", () => {
  const keys=EMAIL_TEMPLATES.map(t=>t.key);
  assert.equal(keys.length,new Set(keys).size);
  for (const key of ["verification","password_reset","welcome","bulk_welcome","member_activated",
    "member_renewed","member_payment_failed","member_cancelled","member_refunded",
    "member_disputed","member_cancellation_scheduled","expert_booking_cancelled","broadcast","test"])
    assert.ok(keys.includes(key),"missing: "+key);
});

test("email branding changes text without breaking the secure verification URL", () => {
  const token="test-token-not-real";
  const html=`<h1>Welcome to Visa Assistant Global</h1><p>Thank you for signing up! You're one step closer to your UK Innovator Founder Visa journey.</p><a href="https://innovatorfoundervisaassistant.co.uk/verify-email?token=${token}">Verify</a><p>support@visaassistant.global</p>`;
  const ifva=normaliseEmailBrand("Verify your email - UK Innovator Founder Visa Assistant",html,"ifva");
  assert.match(ifva.html,/Welcome to Innovator Founder Visa Assistant/);
  assert.match(ifva.html,/Your UK Innovator Founder Visa preparation journey starts here/);
  assert.match(ifva.html,/support@innovatorfoundervisaassistant.co.uk/);
  assert.match(ifva.html,/verify-email\?token=test-token-not-real/);
  const global=normaliseEmailBrand("Verify your email - UK Innovator Founder Visa Assistant",html,"global");
  assert.match(global.html,/Welcome to Visa Assistant Global/);
  assert.match(global.html,/Your global visa preparation journey starts here/);
  assert.doesNotMatch(global.subject,/Innovator Founder Visa Assistant/);
});

test("admin edits can change wording but preserve secured body, tokens and private values", () => {
  const html='<p>Original intro to replace</p><a href="https://example.test/verify?token=never-reveal">Verify</a><p>Amount: £69</p>';
  const built=renderEmailTemplate({
    subject:"Verify your email",subjectTemplate:"{{subject}} for {{recipient_name}}",
    html,recipientName:"Henry",bodyTemplate:"<div><p>Welcome!</p>{{body}}</div>",
    contentReplacements:[{find:"Original intro to replace",replace:"Improved welcome wording"}],
  });
  assert.match(built.subject,/Verify your email for Henry/);
  assert.match(built.html,/Improved welcome wording/);
  assert.match(built.html,/verify\?token=never-reveal/);
  assert.match(built.html,/Amount: £69/);
});

test("template validation rejects dropping dynamic content and unsafe edits", () => {
  assert.match(validateTemplateEdit("Hello","<p>No original email</p>")||"",/{{body}}/);
  assert.match(validateTemplateEdit("{{body}}","{{body}}")||"",/Subjects cannot contain/);
  assert.match(validateTemplateEdit("Subject","<script>alert(1)</script>{{body}}")||"",/Active HTML/);
  assert.match(validateTemplateEdit("Subject","{{body}}",[{find:"token=",replace:"anything"}])||"",/secure URLs/);
  assert.equal(validateTemplateEdit("{{subject}}","<h2>Brand</h2>{{body}}",[{find:"Hello",replace:"Welcome"}]),null);
});

test("verified event queue, admin controls and migrations must remain secured", () => {
  const routes=readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
  const admin=readFileSync(new URL("../server/emailTemplateAdminRoutes.ts",import.meta.url),"utf8");
  const live=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
  const job=readFileSync(new URL("../server/services/memberLifecycleEmail.ts",import.meta.url),"utf8");
  const migration=readFileSync(new URL("../migrations/app/20261019_email_template_control_centre.sql",import.meta.url),"utf8");
  assert.match(routes,/registerEmailTemplateAdminRoutes\(app, requireAdmin\)/);
  assert.match(admin,/app\.put\("\/api\/admin\/email-templates\/\:brand\/\:key",requireAdmin/);
  assert.match(admin,/pg_advisory_xact_lock/);
  assert.match(admin,/content_replacements/);
  assert.match(live,/await queueSignedMemberLifecycleEmail\(decision\.eventId,order\.id\)/);
  assert.match(job,/SELECT e\.decision,e\.event_type,o\.user_id/);
  assert.match(job,/ON CONFLICT\(event_id\) DO NOTHING/);
  assert.match(job,/emailBrand\(\)!=="ifva"/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS email_template_revisions/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS member_lifecycle_email_outbox/);
});
