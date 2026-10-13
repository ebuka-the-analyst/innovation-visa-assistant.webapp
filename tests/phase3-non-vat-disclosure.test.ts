import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("public membership wording says No VAT charged without exposing VAT registration status",()=>{
 const plans=readFileSync(new URL("../client/src/components/FounderMembershipCheckout.tsx",import.meta.url),"utf8");
 const terms=readFileSync(new URL("../client/src/pages/terms.tsx",import.meta.url),"utf8");
 assert.doesNotMatch(plans,/No VAT charged/);
 assert.match(terms,/no VAT charged/i);
 assert.doesNotMatch(plans,/supplier not VAT registered/i);
 assert.doesNotMatch(terms,/supplier not VAT registered/i);
 assert.doesNotMatch(plans,/VAT included|VAT-inclusive/i);
 assert.doesNotMatch(terms,/VAT-inclusive/i);
 assert.match(plans,/acknowledgeNoVatPrice:true/);
});
test("non-VAT checkout never configures Stripe Tax and rejects VAT inclusive candidates",()=>{
 const route=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 const preflight=readFileSync(new URL("../server/scripts/check-live-membership-readiness.cjs",import.meta.url),"utf8");
 assert.match(route,/IFVA_MEMBER_LIVE_TAX_BASIS === "uk_not_vat_registered"/);
 assert.match(preflight,/IFVA_MEMBER_LIVE_TAX_BASIS==="uk_not_vat_registered"/);
 assert.match(route,/automatic_tax:\{enabled:false\}/);
 assert.match(route,/price\.tax_behavior!=="unspecified"/);
 assert.match(preflight,/p\.tax_behavior!=="unspecified"/);
 assert.doesNotMatch(route,/automatic_tax:\{enabled:true\}/);
});
