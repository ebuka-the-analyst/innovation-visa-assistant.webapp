const test=require("node:test");
const assert=require("node:assert/strict");
const {qaGuard}=require("../server/scripts/bootstrap-isolated-qa-schema.cjs");
const safe={
 RAILWAY_PROJECT_ID:"dbec1752-9b2a-4473-8fab-ddae38310c26",
 RAILWAY_ENVIRONMENT_ID:"5b20a1f5-8784-4463-bfe8-b435fa086a64",
 RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",
 RAILWAY_ENVIRONMENT_NAME:"staging",
 IFVA_QA_SCHEMA_BOOTSTRAP_ENABLED:"true",
 NODE_ENV:"production",
 DATABASE_URL:"postgresql://qa:password@postgres.railway.internal:5432/qa",
};
test("QA bootstrap allows only exact isolated project and private database",()=>{
 assert.equal(qaGuard(safe).hostname,"postgres.railway.internal");
 for(const bad of [
 {RAILWAY_PROJECT_ID:"22a033f9-9732-4499-ae97-b509b17354d9"},
 {RAILWAY_PROJECT_NAME:"IFVA production"},
 {RAILWAY_ENVIRONMENT_ID:"3a9754e3-575c-4e29-b9a3-8af50a5ef823"},
 {RAILWAY_ENVIRONMENT_NAME:"production"},
 {IFVA_QA_SCHEMA_BOOTSTRAP_ENABLED:"false"},
 {NODE_ENV:"development"},
 {DATABASE_URL:"postgres://qa:password@some-public-host.example.com/qa"},
 {DATABASE_URL:"postgres://qa:password@localhost:5432/qa"},
 {DATABASE_URL:"postgres://qa:password@postgres.railway.app:5432/qa"},
 ]) assert.throws(()=>qaGuard({...safe,...bad}),/QA schema bootstrap blocked/);
});
test("QA bootstrap refuses empty or absent credentials",()=>{
 assert.throws(()=>qaGuard({...safe,DATABASE_URL:""}),/database endpoint/);
 assert.throws(()=>qaGuard({...safe,DATABASE_URL:"undefined"}),/database endpoint/);
});
