import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseQuestionnaireEvidenceDraft } from "../client/src/lib/questionnaireEvidenceImport";

const format="ifva-questionnaire-evidence-draft";
const fields=["fullLegalName","businessName","problem","funding"];
const file=(email:string,fields:Record<string,unknown>)=>JSON.stringify({
  format,version:1,application_email:email,fields,
  review_required:["Confirm immigration status","Confirm available funding"],
});
test("only imports supported, nonempty strings for a matching account without touching existing answers",()=>{
  const result=parseQuestionnaireEvidenceDraft(
    file("  FOUNDER@example.com  ", {
      fullLegalName:"Preferred legal name",
      businessName:"Proposed brand",
      problem:"Test evidence",
      funding:"",tier:"ultimate",
      impossibleKey:"secret",
      __proto__:"ignore",
      unexpected: {nested:"not allowed"},
    }),
    "founder@example.com",fields,
    {fullLegalName:"Do not overwrite",problem:"",tier:"premium"},
  );
  assert.equal(result.added,2);
  assert.equal(result.skippedExisting,1);
  assert.equal(result.merged.fullLegalName,"Do not overwrite");
  assert.equal(result.merged.businessName,"Proposed brand");
  assert.equal(result.merged.problem,"Test evidence");
  assert.equal(result.merged.tier,"premium");
  assert.equal(result.reviewRequired,2);
  assert.equal((result.merged as any).impossibleKey,undefined);
});
test("rejects other customers' files even if JSON structure is valid",()=>{
  assert.throws(
    ()=>parseQuestionnaireEvidenceDraft(file("other@example.com",{businessName:"Venture"}),
      "founder@example.com",fields,{}),
    /different account/,
  );
});
test("rejects wrong format, invalid JSON and unsupported field types",()=>{
  assert.throws(()=>parseQuestionnaireEvidenceDraft("not json","founder@example.com",fields,{}),
    /Invalid JSON/);
  assert.throws(()=>parseQuestionnaireEvidenceDraft(
    JSON.stringify({format:"something-else",version:1,
      application_email:"founder@example.com",fields:{}}),
    "founder@example.com",fields,{}),/not a supported/);
  const res=parseQuestionnaireEvidenceDraft(file("founder@example.com",{
    businessName:{nested:true},funding:100,problem:"A supported long-form answer",
  }),"founder@example.com",fields,{});
  assert.equal(res.added,1);
  assert.equal(res.merged.problem,"A supported long-form answer");
});
test("component includes an actual file import, saves through account-owned auto-save and never submits",()=>{
  const ui=readFileSync(new URL("../client/src/components/QuestionnaireForm.tsx",import.meta.url),"utf8");
  assert.match(ui,/parseQuestionnaireEvidenceDraft/);
  assert.match(ui,/user\?\.email \?\? ""/);
  assert.match(ui,/data-testid="button-import-evidence-draft"/);
  assert.match(ui,/file\.text\(\)/);
  assert.match(ui,/saveAllFields\(draft\.merged\)/);
  assert.match(ui,/setCurrentStep\(0\)/);
  const handler=ui.slice(ui.indexOf("const importEvidenceDraft ="),ui.indexOf("const handleClearSavedData ="));
  assert.doesNotMatch(handler,/\/api\/questionnaire\/submit|\/api\/business-plans/);
});
