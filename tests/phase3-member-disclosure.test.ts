import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
test("Founder membership legal copy discloses monthly renewals and one-time 90-day pass",()=>{
 const terms=readFileSync(new URL("../client/src/pages/terms.tsx",import.meta.url),"utf8");
 assert.match(terms,/Founder \(£69\/month\) and Founder Pro \(£119\/month\)/);
 assert.match(terms,/renew automatically each month until cancelled/);
 assert.match(terms,/90-Day Pass is a one-time payment and does not renew/);
 assert.match(terms,/Statutory consumer cancellation and refund rights remain unaffected/);
 assert.doesNotMatch(terms,/Current plan purchases are one-time payments rather than recurring subscriptions/);
});
