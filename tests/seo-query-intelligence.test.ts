import assert from "node:assert/strict";
import test from "node:test";
import {
  analyseSeoQuery,
  chooseSeoContentDecision,
  normaliseSearchConsolePath,
} from "../server/seoQueryIntelligence";

test("filters obvious Search Console noise", () => {
  assert.equal(analyseSeoQuery("yes").qualified, false);
  assert.equal(analyseSeoQuery("2").qualified, false);
  assert.equal(analyseSeoQuery("ai assistant for business uk").qualified, false);
});

test("qualifies Innovator Founder mission queries", () => {
  assert.equal(analyseSeoQuery("innovator founder visa assistance").qualified, true);
  assert.equal(analyseSeoQuery("innovator founder visa business plan").qualified, true);
  assert.equal(analyseSeoQuery("founder visa support").qualified, true);
});

test("clusters business plan and support intent", () => {
  const businessPlan = analyseSeoQuery("innovator founder visa business plan help");
  assert.equal(businessPlan.cluster, "business-plan");
  assert.equal(businessPlan.recommendedPath, "/business-plan-template");

  const support = analyseSeoQuery("innovator founder visa assistance");
  assert.equal(support.cluster, "application-support");
  assert.equal(support.recommendedPath, "/");
});

test("normalises Search Console landing-page URLs", () => {
  assert.equal(
    normaliseSearchConsolePath("https://innovatorfoundervisaassistant.co.uk/business-plan-template/"),
    "/business-plan-template",
  );
});

test("does not create competing content when an existing target page should be optimised", () => {
  const intelligence = analyseSeoQuery("innovator founder visa business plan");
  const decision = chooseSeoContentDecision({
    ...intelligence,
    actualPath: "/business-plan-template",
    position: 33.3,
  });
  assert.equal(decision, "optimise-existing");
});

test("allows support content for broader qualified growth queries", () => {
  const intelligence = analyseSeoQuery("innovator founder visa success rate");
  const decision = chooseSeoContentDecision({
    ...intelligence,
    actualPath: "/guide",
    position: 42,
  });
  assert.equal(decision, "optimise-existing");
});


test("keeps high-impression business-plan searches on the dedicated existing page", () => {
  const intelligence = analyseSeoQuery("innovator founder visa business plan");
  assert.equal(intelligence.recommendedPath, "/business-plan-template");
  const decision = chooseSeoContentDecision({
    ...intelligence,
    actualPath: "/",
    position: 33.3,
  });
  assert.equal(decision, "optimise-existing");
});

test("maps endorsement and eligibility intent to their dedicated public pages", () => {
  assert.equal(
    analyseSeoQuery("innovator founder visa endorsement support").recommendedPath,
    "/endorsing-bodies",
  );
  assert.equal(
    analyseSeoQuery("innovator founder visa requirements uk").recommendedPath,
    "/eligibility",
  );
});


test("maps UKES query to endorsement intent and dedicated endorsing-bodies page", () => {
  const intelligence = analyseSeoQuery("ukes innovator founder");
  assert.equal(intelligence.qualified, true);
  assert.equal(intelligence.cluster, "endorsement");
  assert.equal(intelligence.recommendedPath, "/endorsing-bodies");
});
