import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {isVerifiedUkMembershipCheckout} from "../server/phase3/memberUkOnlyCheckout";

const uk = {
  currency:"gbp",
  customer_details:{address:{country:"GB"}},
  collected_information:{shipping_details:{address:{country:"GB"}}},
};
test("paid membership requires verified GB billing AND Stripe country-restricted service address",()=>{
  assert.equal(isVerifiedUkMembershipCheckout(uk),true);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,customer_details:{address:{country:"US"}}}),false);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,collected_information:{shipping_details:{address:{country:"FR"}}}}),false);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,customer_details:{address:{country:null}}}),false);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,collected_information:null}),false);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,currency:"usd"}),false);
  assert.equal(isVerifiedUkMembershipCheckout({...uk,collected_information:null,shipping_details:{address:{country:"GB"}}}),true);
});
test("UK-only checkout is enforced by Stripe billing country, not by a second UI country checkbox",()=>{
 const route=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 const ui=readFileSync(new URL("../client/src/components/FounderMembershipCheckout.tsx",import.meta.url),"utf8");
 assert.match(route,/IFVA_MEMBER_UK_ONLY_ENABLED === "true"/);
 assert.doesNotMatch(route,/req\.body\?\.acknowledgeUkOnly !== true/);
 assert.match(route,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(route,/billing_address_collection:"required"/);
 assert.match(route,/isVerifiedUkMembershipCheckout\(verifiedSession\)/);
 assert.match(route,/verifiedCustomer\.address\?\.country!=="GB"/);
 assert.doesNotMatch(ui,/acknowledgeUkOnly|ukOnly,setUkOnly|based in the United Kingdom|Available to UK customers only/i);
 assert.doesNotMatch(ui,/displayedProducts|products\.map/);
 const checkIndex=route.indexOf("isVerifiedUkMembershipCheckout(verifiedSession)");
 const ledgerIndex=route.lastIndexOf("processSignedLiveStripeEvent(");
 assert.ok(checkIndex>0&&ledgerIndex>checkIndex,"Provider verification precedes applying ledger event");
});
