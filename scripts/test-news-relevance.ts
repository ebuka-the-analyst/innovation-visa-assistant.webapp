import assert from "node:assert/strict";
import { isStrictInnovatorFounderNews } from "../server/newsRelevance";

const now = Date.parse("2026-08-25T12:00:00Z");

const accepted = [
  {
    title: "Innovator Founder and Scale-up visas endorsing bodies",
    url: "https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder-and-scale-up-visas",
    publishedAt: "2026-08-07T09:00:00Z",
  },
  {
    title: "Immigration Rules Appendix Innovator Founder",
    url: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder",
    publishedAt: "2026-08-03T09:00:00Z",
  },
];

for (const article of accepted) {
  assert.equal(isStrictInnovatorFounderNews(article, now), true, `Expected accepted: ${article.title}`);
}

const rejected = [
  {
    title: "Diplomatic visa arrangement: caseworker guidance",
    url: "https://www.gov.uk/government/publications/diplomatic-visa-arrangements",
    publishedAt: "2026-08-20T09:00:00Z",
  },
  {
    title: "Egypt: country policy and information notes",
    url: "https://www.gov.uk/government/collections/country-policy-and-information-notes",
    publishedAt: "2026-08-20T09:00:00Z",
  },
  {
    title: "Register of licensed sponsors: workers",
    url: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers",
    publishedAt: "2026-08-20T09:00:00Z",
  },
  {
    title: "Innovator Founder visa update",
    url: "https://example.com/innovator-founder",
    publishedAt: "2026-08-20T09:00:00Z",
  },
  {
    title: "Innovator Founder visa guidance",
    url: "https://www.gov.uk/innovator-founder-visa",
    publishedAt: "2023-01-01T09:00:00Z",
  },
  {
    title: "Innovator Founder visa guidance",
    url: "https://www.gov.uk/innovator-founder-visa",
    publishedAt: null,
  },
];

for (const article of rejected) {
  assert.equal(isStrictInnovatorFounderNews(article, now), false, `Expected rejected: ${article.title}`);
}

console.log(JSON.stringify({
  ok: true,
  accepted: accepted.map((item) => item.title),
  rejected: rejected.map((item) => item.title),
  policy: "direct Innovator Founder headline + GOV.UK + current timestamp",
}, null, 2));
