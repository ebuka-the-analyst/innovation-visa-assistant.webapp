import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync,existsSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=(path:string)=>readFileSync(new URL(path,root),"utf8");

test("homepage and pricing share exactly one API-fed Founder membership component",()=>{
 const component=read("client/src/components/FounderMembershipPlans.tsx");
 const homepage=read("client/src/components/PricingSection.tsx");
 const pricing=read("client/src/pages/pricing.tsx");
 assert.match(homepage,/<FounderMembershipPlans\s*\/>/);
 assert.match(pricing,/<FounderMembershipPlans\s*\/>/);
 assert.match(component,/fetch\("\/api\/member-offers"/);
 assert.match(component,/data\.offers\.map/);
 assert.match(component,/offer\.benefits\.map/);
 assert.match(component,/offer\.pricePence/);
 assert.match(component,/offer\.billingLabel/);
 assert.match(component,/offer\.ctaText/);
 for(const old of ["Free Plan","Basic Plan","Premium Plan","Enterprise Plan","Ultimate Plan"]){
   assert.ok(!component.includes(old) && !homepage.includes(old) && !pricing.includes(old),
     "Old sales tier appears in updated view: "+old);
 }
 assert.equal(existsSync(new URL("client/src/components/UpcomingMemberships.tsx",root)),false);
 assert.doesNotMatch(component,/£69|£119|£159|Coming soon|upcomingMemberships/);
 assert.doesNotMatch(homepage,/useCommercialCatalog|PLAN_FEATURE_COPY|TIER_CREDITS/);
 assert.doesNotMatch(pricing,/useCommercialCatalog|PLAN_PAGES|directSubscribeMutation|checkoutMutation/);
});

test("missing live gateway cannot silently create Stripe checkout or revive old purchases",()=>{
 const catalogue=read("server/services/memberOfferCatalogue.ts");
 const routes=read("server/routes.ts");
 const component=read("client/src/components/FounderMembershipPlans.tsx");
 assert.match(catalogue,/IFVA_MEMBERSHIP_PAYMENTS_LIVE_ENABLED/);
 assert.match(catalogue,/IFVA_MEMBERSHIP_LIVE_WEBHOOK_VERIFIED/);
 assert.match(catalogue,/IFVA_MEMBERSHIP_LIVE_FULFILMENT_VERIFIED/);
 assert.match(component,/disabled=\{!data\.purchasable\}/);
 assert.match(routes,/app\.get\("\/api\/member-offers"/);
 assert.match(routes,/app\.get\("\/api\/admin\/member-migration-audit"/);
 assert.equal((routes.match(/app\.get\("\/api\/admin\/member-migration-audit"/g)||[]).length,1,"Duplicate legacy credit audit route");
 assert.equal((routes.match(/app\.get\("\/api\/pricing"/g)||[]).length,1,"Duplicate original pricing API route");
 assert.match(routes,/IFVA_LEGACY_NEW_PURCHASES_DISABLED === "true"/);
 assert.doesNotMatch(component,/sk_live_|price_1UP/);
});

test("new pricing and consumer-facing benefits originate from the server only",()=>{
 const server=read("server/services/memberOfferCatalogue.ts");
 assert.match(server,/pricePence:6900/);
 assert.match(server,/pricePence:11900/);
 assert.match(server,/pricePence:15900/);
 assert.match(server,/MEMBER_OFFER_CATALOG_KEY/);
 assert.match(server,/systemSettings/);
 assert.match(server,/parseMemberOfferCatalogue/);
 assert.match(server,/legacyNotice/);
 assert.match(server,/purchasable:canStartLiveMembershipCheckout/);
});
