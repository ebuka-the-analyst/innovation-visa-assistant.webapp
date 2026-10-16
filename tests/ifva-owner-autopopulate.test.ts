import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isEligibleQuestionnaireDraftOwner, parseOwnerQuestionnaireDraft } from "../server/questionnaireOwnerAutopopulate";

const owner = "founder@example.test";
const draft = JSON.stringify({
  format: "ifva-owner-autopopulate-v1",
  application_email: owner,
  fields: { businessName: "Visa Assistant Global", problem: "A substantive evidence-grounded business problem", funding: "", tier: "founder_pro", unknown: 123 },
  needsEvidence: ["visaExpiryDate","funding","customerAcquisitionCost"],
});

test("The account-specific owner check is exact, nonempty and normalises case",()=>{
  assert.ok(isEligibleQuestionnaireDraftOwner("Founder@Example.Test",owner));
  for(const candidate of [undefined,"","other@example.test","attacker+founder@example.test"]) {
    assert.equal(isEligibleQuestionnaireDraftOwner(candidate,owner),false);
  }
  assert.equal(isEligibleQuestionnaireDraftOwner(owner,undefined),false);
});

test("Private draft parser rejects unrelated content and strips tiers, empty data and unknown types",()=>{
  assert.deepEqual(parseOwnerQuestionnaireDraft(draft), {
    fields:{businessName:"Visa Assistant Global",problem:"A substantive evidence-grounded business problem"},
    needsEvidence:["visaExpiryDate","funding","customerAcquisitionCost"],
  });
  assert.throws(()=>parseOwnerQuestionnaireDraft("{}"),/Unrecognised/);
  assert.throws(()=>parseOwnerQuestionnaireDraft(""),/not configured/);
});

test("AutoPopulate account restriction is server-side and does not expose founder email or draft in client source",()=>{
  const ui=readFileSync(new URL("../client/src/components/QuestionnaireForm.tsx",import.meta.url),"utf8");
  const api=readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
  assert.match(ui,/ownerDraftEligibility\?\.eligible === true/);
  assert.match(ui,/data-testid="button-owner-prefill"/);
  assert.match(ui,/AutoPopulate\s*<\/Button>/);
  assert.ok(ui.indexOf("button-open-autofill") < ui.indexOf("button-owner-prefill"));
  assert.ok(ui.indexOf("button-owner-prefill") < ui.indexOf("button-clear-saved"));
  assert.doesNotMatch(ui,/founder@example.test|benedict9211@gmail.com|VISA_ASSISTANT_GLOBAL_DRAFT/);
  assert.match(api,/app\.post\("\/api\/questionnaire\/owner-autopopulate", isAuthenticated/);
  assert.match(api,/app\.get\("\/api\/questionnaire\/owner-autopopulate\/eligibility", isAuthenticated/);
  assert.match(api,/isEligibleQuestionnaireDraftOwner\(email, process\.env\[OWNER_DRAFT_EMAIL_ENV\]\)/);
  const handler=ui.slice(ui.indexOf("const handleOwnerPrefill ="),ui.indexOf("// Auto-fill from documents states"));
  assert.match(handler,/saveAllFields\(merged\)/);
  assert.match(handler,/validFields\.has\(field\)/);
  assert.match(handler,/merged\[field\]\.trim\(\)/);
  assert.doesNotMatch(handler,/\/api\/business-plans|\/api\/questionnaire\/submit|generatePlan/);
});
