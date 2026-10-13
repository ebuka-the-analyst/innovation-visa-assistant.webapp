const assert=require("node:assert/strict");
const test=require("node:test");
const {guard,evaluate}=require("../server/scripts/audit-member-lifecycle-qa.cjs");
test("QA lifecycle auditor cannot read any other project or production DB",()=>{
 assert.throws(()=>guard({}),/Refusing read/);
 assert.throws(()=>guard({
  RAILWAY_PROJECT_ID:"22a033f9-9732-4499-ae97-b509b17354d9",
  RAILWAY_ENVIRONMENT_ID:"3a9754e3-575c-4e29-b9a3-8af50a5ef823",
  RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",
  RAILWAY_ENVIRONMENT_NAME:"staging",
  IFVA_MEMBER_STRIPE_QA_ENABLED:"true",NODE_ENV:"production",
  DATABASE_URL:"postgres://qa:qa@postgres.railway.internal/railway",
 }),/Refusing read/);
});
const sample=(expected,entitlementStatus,userStatus,orderActive)=>({
 key:"test",expected,orderCount:1,entitlementStatus,userStatus,orderActive,
 pendingReviews:0,paidThrough:null,userTier:"founder",decisions:[],
});
test("cannot pass if a full refund or cancellation leaves any access flag active",()=>{
 assert.equal(evaluate(sample("revoked","active","past_due",false)).pass,false);
 assert.equal(evaluate(sample("revoked","expired","active",false)).pass,false);
 assert.equal(evaluate(sample("revoked","expired","cancelled",true)).pass,false);
 assert.equal(evaluate(sample("revoked","expired","cancelled",false)).pass,true);
});
test("paid-through cancellation keeps active subscription through its final paid period",()=>{
 assert.equal(evaluate(sample("active","active","active",true)).pass,true);
 assert.equal(evaluate(sample("active","expired","active",true)).pass,false);
 assert.equal(evaluate(sample("active","active","cancelled",true)).pass,false);
});
test("missing order cannot be accepted as passing the lifecycle audit",()=>{
 assert.equal(evaluate({...sample("revoked","expired","cancelled",false),orderCount:0}).pass,false);
});
