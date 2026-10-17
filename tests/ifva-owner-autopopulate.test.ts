import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isEligibleQuestionnaireDraftOwner, parseOwnerQuestionnaireDraft } from "../server/questionnaireOwnerAutopopulate";
import { mergeOwnerQuestionnaireDraft } from "../client/src/lib/mergeOwnerQuestionnaire";

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
    previousFields:{businessName:"Visa Assistant Global",problem:"A substantive evidence-grounded business problem"},
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
  assert.match(handler,/saveAllFields\(change\.merged\)/);
  assert.match(handler,/mergeOwnerQuestionnaireDraft/);
  assert.match(ui,/hasRefreshedOwnerDraft\.current = true/);
  assert.doesNotMatch(handler,/\/api\/business-plans|\/api\/questionnaire\/submit|generatePlan/);
});


test("Only unchanged earlier AutoPopulate wording is upgraded to first person", () => {
  const original = {
    founderAchievements: "The CV reports work on multiple applications.",
    industryExperience: "I wrote this myself and it is different.",
    funding: "5000",
    tier: "founder_pro",
  };
  const change = mergeOwnerQuestionnaireDraft(
    original,
    {
      founderAchievements: "I have worked on multiple applications.",
      industryExperience: "I have more than seven years of technical experience.",
      businessName: "Visa Assistant Global",
      tier: "ultimate",
    },
    {
      founderAchievements: "The CV reports work on multiple applications.",
      industryExperience: "The founder worked in technology.",
    },
    ["founderAchievements", "industryExperience", "businessName", "tier"],
  );
  assert.equal(change.merged.founderAchievements, "I have worked on multiple applications.");
  assert.equal(change.merged.industryExperience, original.industryExperience);
  assert.equal(change.merged.funding, "5000");
  assert.equal(change.merged.tier, "founder_pro");
  assert.equal(change.merged.businessName, "Visa Assistant Global");
  assert.deepEqual([change.added,change.refreshed,change.skippedExisting],[1,1,1]);
});

test("Private founder voice overrides keep original draft available for exact-match updates",()=>{
  const key="QUESTIONNAIRE_FOUNDER_VOICE_1";
  const old=process.env[key];
  try {
    process.env[key]=JSON.stringify({industryExperience:"I have delivered software for seven years."});
    const fixture=JSON.stringify({
      format:"ifva-owner-autopopulate-v1",
      fields:{industryExperience:"The founder's CV reports seven years of software engineering."},
    });
    const out=parseOwnerQuestionnaireDraft(fixture);
    assert.match(out.fields.industryExperience,/^I have/);
    assert.match(out.previousFields.industryExperience,/^The founder/);
  } finally {
    if(old===undefined) delete process.env[key]; else process.env[key]=old;
  }
});


test("Global Visa Assistant focus updates both first-person and earlier automated answers without overwriting founder edits", () => {
  const sourceKey = "QUESTIONNAIRE_FOUNDER_VOICE_1";
  const focusKey = "QUESTIONNAIRE_BUSINESS_FOCUS_V2";
  const previousSource = process.env[sourceKey];
  const previousFocus = process.env[focusKey];
  try {
    process.env[sourceKey] = JSON.stringify({
      productStatus: "I launched the UK route and a global portal.",
      businessName: "Visa Assistant Global",
    });
    process.env[focusKey] = JSON.stringify({
      productStatus: "I launched Visa Assistant globally and completed its first UK route.",
      businessName: "Visa Assistant Global",
      foreign: "Should not be imported",
    });
    const original = JSON.stringify({
      format: "ifva-owner-autopopulate-v1",
      fields: {
        productStatus: "The founder launched the UK route.",
        businessName: "Visa Assistant Global",
        tier: "ultimate",
      },
    });
    const parsed = parseOwnerQuestionnaireDraft(original);
    assert.equal(parsed.fields.productStatus, "I launched Visa Assistant globally and completed its first UK route.");
    assert.equal(parsed.previousFields.productStatus, "The founder launched the UK route.");
    assert.equal(parsed.intermediateFields?.productStatus, "I launched the UK route and a global portal.");
    assert.ok(!("foreign" in parsed.fields));
    const permitted = ["productStatus","businessName","tier"];
    const mid = mergeOwnerQuestionnaireDraft(
      {productStatus: "I launched the UK route and a global portal.",businessName: "Visa Assistant Global",tier: "founder"},
      parsed.fields,parsed.previousFields,permitted,parsed.intermediateFields,
    );
    assert.equal(mid.refreshed,1);
    assert.equal(mid.merged.productStatus, parsed.fields.productStatus);
    assert.equal(mid.merged.tier, "founder");
    const old = mergeOwnerQuestionnaireDraft(
      {productStatus: "The founder launched the UK route."},
      parsed.fields,parsed.previousFields,permitted,parsed.intermediateFields,
    );
    assert.equal(old.refreshed,1);
    const edited = mergeOwnerQuestionnaireDraft(
      {productStatus: "My edited explanation of the main platform."},
      parsed.fields,parsed.previousFields,permitted,parsed.intermediateFields,
    );
    assert.equal(edited.refreshed,0);
    assert.equal(edited.merged.productStatus,"My edited explanation of the main platform.");
  } finally {
    if (previousSource === undefined) delete process.env[sourceKey];
    else process.env[sourceKey] = previousSource;
    if (previousFocus === undefined) delete process.env[focusKey];
    else process.env[focusKey] = previousFocus;
  }
});
