const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const preflight=require("../server/scripts/check-member-precharge-readiness.cjs");
const src=fs.readFileSync(require.resolve("../server/scripts/check-member-precharge-readiness.cjs"),"utf8");
test("account requires STACKRISE LTD actual company identity",()=>{
 const good={id:"acct_1SdAGzK9BSTYpDOq",business_type:"company",country:"GB",company:{name:"Stackrise Ltd"}};
 assert.equal(preflight.validLegalSeller(good),true);
 assert.equal(preflight.validLegalSeller({...good,business_type:"individual"}),false);
 assert.equal(preflight.validLegalSeller({...good,company:{name:"IFV-Assistant"}}),false);
});
test("precharge readiness reads but never creates Stripe orders, customers or charges",()=>{
 assert.match(src,/stripe\.accounts\.retrieve/);
 assert.match(src,/stripe\.prices\.retrieve/);
 assert.match(src,/stripe\.webhookEndpoints\.list/);
 assert.match(src,/to_regclass/);
 assert.doesNotMatch(src,/stripe\.checkout\.sessions\.create\(/);
 assert.doesNotMatch(src,/stripe\.customers\.create\(/);
 assert.doesNotMatch(src,/stripe\.charges\.create\(/);
 assert.doesNotMatch(src,/INSERT INTO|UPDATE member_stripe|DELETE FROM/);
 assert.match(src,/IFVA_MEMBER_STRIPE_LIVE_SECRET_KEY/);
 assert.match(src,/IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET/);
 assert.equal(preflight.REQUIRED_TABLES.length,8);
 assert.equal(preflight.LIVE_PRICE_CHECKS.length,3);
});