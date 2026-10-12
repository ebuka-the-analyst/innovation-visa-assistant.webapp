import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {registerMemberStripeTestPage} from "../server/phase3/memberStripeTestPage";
import {isMemberTestGatewayAllowed} from "../server/phase3/memberStripeProviderTestRoutes";

const require=createRequire(import.meta.url);
const seed=require("../server/scripts/seed-qa-stripe-founders.cjs");
const source=readFileSync(new URL("../server/phase3/memberStripeProviderTestRoutes.ts",import.meta.url),"utf8");

test("QA checkout helper never mounts in production and cannot skip explicit signed-in user consent",()=>{
 assert.equal(isMemberTestGatewayAllowed({
   RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",
   RAILWAY_ENVIRONMENT_NAME:"production",
   IFVA_MEMBER_STRIPE_QA_ENABLED:"true",
   NODE_ENV:"production",
 } as any),false);
 assert.match(source,/if\(!isMemberTestGatewayAllowed\(\)\)return;\s*registerMemberStripeTestPage\(app\)/);
 assert.match(source,/app\.post\("\/api\/member-stripe-test\/checkout",isAuthenticated/);
 assert.match(source,/confirmedNewTestMembershipPurchase\(req\.body\)/);
 assert.match(source,/\/qa\/membership-test\?orderId=/);
});

test("QA-only signup seeding is impossible outside exact isolated Railway environment",()=>{
 assert.throws(()=>seed.guard({}),/Refusing to seed/);
 assert.throws(()=>seed.guard({
  RAILWAY_PROJECT_ID:"22a033f9-9732-4499-ae97-b509b17354d9",
  RAILWAY_ENVIRONMENT_ID:"3a9754e3-575c-4e29-b9a3-8af50a5ef823",
  RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",
  RAILWAY_ENVIRONMENT_NAME:"staging",
  IFVA_MEMBER_STRIPE_QA_ENABLED:"true",
  NODE_ENV:"production",
 }),/Refusing to seed/);
});

test("QA acceptance page is signed-in and scoped to synthetic non-admin founder accounts",()=>{
 let callback:any;
 const app={get:(route:string,fn:any)=>{
   assert.equal(route,"/qa/membership-test");callback=fn;
 }};
 registerMemberStripeTestPage(app as any);
 const response=()=>({
  statusCode:200,body:"",contentType:"",headers:{} as Record<string,string>,
  setHeader(k:string,v:string){this.headers[k]=v;return this;},
  status(code:number){this.statusCode=code;return this;},
  type(v:string){this.contentType=v;return this;},
  send(v:string){this.body=v;return this;},
 });
 const anonymous=response();
 callback({isAuthenticated:()=>false},anonymous);
 assert.equal(anonymous.statusCode,401);
 const unauthorised=response();
 callback({isAuthenticated:()=>true,user:{email:"other@example.com",isAdmin:false}},unauthorised);
 assert.equal(unauthorised.statusCode,403);
 const admin=response();
 callback({isAuthenticated:()=>true,user:{email:"ifva-qa-founder-20261012@example.com",isAdmin:true}},admin);
 assert.equal(admin.statusCode,403);
 const tester=response();
 callback({isAuthenticated:()=>true,user:{email:"ifva-qa-founder-20261012@example.com",isAdmin:false}},tester);
 assert.equal(tester.statusCode,200);
 assert.match(tester.body,/4242 4242 4242 4242/);
 assert.match(tester.body,/acknowledgeNewPayment:true/);
 assert.match(tester.body,/acknowledgeMonthlyRenewal:recurring/);
 assert.match(tester.body,/\/api\/member-stripe-test\/order\//);
 assert.equal(tester.headers["Cache-Control"],"no-store");
});
