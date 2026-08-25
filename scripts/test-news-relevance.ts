import assert from "node:assert/strict";
import {
  isCurrentCalendarYearTimestamp,
  isCurrentYearInnovatorFounderUpdate,
} from "../server/newsRelevance";

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
  {
    title: "Innovator Founder: caseworker guidance",
    url: "https://www.gov.uk/government/publications/innovator-appendix-w-workers",
    publishedAt: "2026-08-05T09:00:00Z",
  },
];

for (const article of accepted) {
  assert.equal(isCurrentYearInnovatorFounderUpdate(article, now), true, `Expected accepted: ${article.title}`);
}

// This is the bug we are guarding against: an official page may have been first
// published years ago but still have a genuine 2026 GOV.UK update timestamp.
assert.equal(isCurrentCalendarYearTimestamp(Date.parse("2026-02-27T09:00:00Z"), now), true);
assert.equal(isCurrentCalendarYearTimestamp(Date.parse("2025-12-31T23:59:59Z"), now), false);

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
    publishedAt: "2025-12-31T09:00:00Z",
  },
  {
    title: "Innovator Founder visa guidance",
    url: "https://www.gov.uk/innovator-founder-visa",
    publishedAt: null,
  },
];

for (const article of rejected) {
  assert.equal(isCurrentYearInnovatorFounderUpdate(article, now), false, `Expected rejected: ${article.title}`);
}

console.log(JSON.stringify({
  ok: true,
  accepted: accepted.map((item) => item.title),
  rejected: rejected.map((item) => item.title),
  policy: "direct Innovator Founder title + GOV.UK + official current-calendar-year update timestamp",
}, null, 2));
