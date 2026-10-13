const test=require("node:test");
const assert=require("node:assert/strict");
const {approved}=require("../server/scripts/check-live-membership-readiness.cjs");
const complete={
 IFVA_MEMBER_LIVE_ENABLED:"true",IFVA_MEMBER_LIVE_RELEASE_APPROVED:"true",
 IFVA_MEMBER_LIVE_TAX_SIGNOFF:"approved",IFVA_MEMBER_LIVE_CONSUMER_TERMS_SIGNOFF:"approved",
 IFVA_MEMBER_LIVE_TERMS_VERSION:"consumer-2026-10-v1",
 RAILWAY_PROJECT_ID:"22a033f9-9732-4499-ae97-b509b17354d9",
 RAILWAY_ENVIRONMENT_ID:"3a9754e3-575c-4e29-b9a3-8af50a5ef823",
 RAILWAY_SERVICE_ID:"a1aa2612-9af3-481a-8e67-4ddb488c56a0",
 RAILWAY_ENVIRONMENT_NAME:"production",NODE_ENV:"production",
};
test("production preflight denies release by default or any missing sign-off",()=>{
 assert.equal(approved({}),false);
 for(const field of Object.keys(complete)){
  assert.equal(approved({...complete,[field]:undefined}),false,field+" required");
 }
 assert.equal(approved(complete),true);
});
test("production preflight rejects QA project and secondary production app",()=>{
 assert.equal(approved({...complete,RAILWAY_PROJECT_ID:"dbec1752-9b2a-4473-8fab-ddae38310c26"}),false);
 assert.equal(approved({...complete,RAILWAY_SERVICE_ID:"af33a267-7266-4893-b310-5f63c6275dbe"}),false);
});
