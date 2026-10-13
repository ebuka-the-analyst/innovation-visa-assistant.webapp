const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const cfg=JSON.parse(fs.readFileSync(require.resolve("../railway.json"),"utf8"));
test("one-time precharge smoke is main IFVA only and retains normal startup",()=>{
 const cmd=cfg.deploy.startCommand;
 assert.match(cmd,/RAILWAY_SERVICE_ID/);
 assert.match(cmd,/a1aa2612-9af3-481a-8e67-4ddb488c56a0/);
 assert.match(cmd,/if \[.*\]; then/);
 assert.match(cmd,/check-member-precharge-readiness\.cjs/);
 assert.match(cmd,/check-member-live-checkout-nocharge\.cjs/);
 assert.match(cmd,/\|\| exit 1; fi;/);
 assert.match(cmd,/BASE_URL=.*npm run start/);
 assert.match(cfg.deploy.preDeployCommand,/run-app-migrations\.cjs/);
 assert.match(cfg.deploy.preDeployCommand,/verify-app-schema\.cjs/);
});