const test=require("node:test");
const assert=require("node:assert/strict");
const config=require("../railway.json");
test("original Railway app-migration checks run before optional live no-charge smoke",()=>{
 const pre=config.deploy.preDeployCommand;
 for(const item of [
   "node server/scripts/preflight-app-schema.cjs",
   "node server/scripts/run-app-migrations.cjs",
   "node server/scripts/verify-application-context-schema.cjs",
   "node server/scripts/verify-app-schema.cjs",
 ]){
   assert.ok(pre.includes(item),"Required app migration missing "+item);
 }
 assert.ok(pre.indexOf("verify-app-schema.cjs")<pre.indexOf("IFVA_MEMBER_NOCHARGE_SMOKE_RUN"),
   "Production database schema must be checked before Stripe test");
 assert.match(pre,/RAILWAY_SERVICE_ID.*a1aa2612-9af3-481a-8e67-4ddb488c56a0/);
 assert.match(pre,/RAILWAY_ENVIRONMENT_NAME.*production/);
 assert.match(pre,/IFVA_MEMBER_NOCHARGE_SMOKE_RUN/);
 assert.match(pre,/node server\/scripts\/check-member-precharge-readiness\.cjs && node server\/scripts\/check-member-live-checkout-nocharge\.cjs/);
 assert.equal(config.deploy.startCommand,
   "BASE_URL=${BASE_URL:-https://$RAILWAY_PUBLIC_DOMAIN} npm run start");
});