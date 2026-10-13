import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  isVerifiedMemberLegalSeller,
  MEMBER_SELLER_LEGAL_NAME,
  MEMBER_SELLER_COMPANIES_HOUSE_NUMBER,
} from "../server/phase3/memberLegalSeller";

const verified={
  id:"acct_1SdAGzK9BSTYpDOq",
  country:"GB",
  business_type:"company",
  company:{name:"Stackrise Ltd"},
};

test("membership seller is UK registered Stackrise Ltd, not any Stripe account label",()=>{
  assert.equal(MEMBER_SELLER_LEGAL_NAME,"STACKRISE LTD");
  assert.equal(MEMBER_SELLER_COMPANIES_HOUSE_NUMBER,"16909181");
  assert.equal(isVerifiedMemberLegalSeller(verified),true);
  assert.equal(isVerifiedMemberLegalSeller({...verified,company:{name:" STACKRISE   LTD "}}),true);
  assert.equal(isVerifiedMemberLegalSeller({...verified,business_type:"individual"}),false);
  assert.equal(isVerifiedMemberLegalSeller({...verified,company:{name:"IFV-Assistant"}}),false);
  assert.equal(isVerifiedMemberLegalSeller({...verified,company:{name:null}}),false);
  assert.equal(isVerifiedMemberLegalSeller({...verified,country:"US"}),false);
  assert.equal(isVerifiedMemberLegalSeller({...verified,id:"acct_other"}),false);
});

test("checkout and readiness preflight must verify legal supplier before enabling charges",()=>{
  const route=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
  const preflight=readFileSync(new URL("../server/scripts/check-live-membership-readiness.cjs",import.meta.url),"utf8");
  const terms=readFileSync(new URL("../client/src/pages/terms.tsx",import.meta.url),"utf8");
  const guard=route.indexOf("isVerifiedMemberLegalSeller(account)");
  const customerCreate=route.indexOf("cfg.stripe.customers.create(");
  assert.ok(guard>0&&customerCreate>guard,"Identity check must precede new Stripe Customer creation or charge");
  assert.match(preflight,/acct\.business_type!=="company"/);
  assert.match(preflight,/acct\.country!=="GB"/);
  assert.match(preflight,/acct\.company\?\.name/);
  assert.match(preflight,/STACKRISE LTD/);
  assert.match(terms,/STACKRISE LTD/);
  assert.match(terms,/16909181/);
});
