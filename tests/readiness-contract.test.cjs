const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const tracker = require(path.join(root, "server/progressTracker.cjs"));
const questionnaire = require(path.join(root, "server/questionnaireDraftSync.cjs"));
const businessPlanStatus = require(path.join(root, "server/businessPlanStatus.cjs"));

function captureApp() {
  const routes = { get: [], post: [], put: [], delete: [] };
  const app = {
    get(pathname, ...handlers) { routes.get.push([pathname, ...handlers]); },
    post(pathname, ...handlers) { routes.post.push([pathname, ...handlers]); },
    put(pathname, ...handlers) { routes.put.push([pathname, ...handlers]); },
    delete(pathname, ...handlers) { routes.delete.push([pathname, ...handlers]); },
  };
  return { app, routes };
}

function responseCapture() {
  const result = { statusCode: 200, body: null, headers: {} };
  return {
    result,
    res: {
      setHeader(name, value) { result.headers[name] = value; },
      status(code) { result.statusCode = code; return this; },
      json(body) { result.body = body; return this; },
    },
  };
}

test("Progress Tracker and questionnaire modules use explicit registration, not express.application monkey patches", () => {
  const trackerSource = read("server/progressTracker.cjs");
  const draftSource = read("server/questionnaireDraftSync.cjs");
  assert.match(trackerSource, /function registerProgressTrackerRoutes\(app\)/);
  assert.match(draftSource, /function registerQuestionnaireDraftRoutes\(app\)/);
  assert.doesNotMatch(trackerSource, /express\.application/);
  assert.doesNotMatch(draftSource, /express\.application/);
});

test("protected readiness routes are registered only at the known auth-ready boundary", () => {
  const guard = read("server/retiredRouteGuard.cjs");
  assert.match(guard, /CUSTOMER360_AUTH_READY_ROUTE = "\/api\/pricing"/);
  assert.match(guard, /registerBusinessPlanStatusRoutes\(this\)/);
  assert.match(guard, /registerProgressTrackerRoutes\(this\)/);
  assert.match(guard, /registerQuestionnaireDraftRoutes\(this\)/);
  const routes = read("server/routes.ts");
  assert.ok(routes.indexOf("await setupAuth(app);") < routes.indexOf('app.get("/api/pricing"'), "auth must be installed before the auth-ready boundary");
});

test("unauthenticated Progress Tracker and questionnaire reads fail closed", async () => {
  const trackerCapture = captureApp();
  tracker.registerProgressTrackerRoutes(trackerCapture.app);
  const trackerGet = trackerCapture.routes.get.find(([route]) => route === "/api/progress-tracker")?.[1];
  assert.equal(typeof trackerGet, "function");
  const trackerResponse = responseCapture();
  await trackerGet({}, trackerResponse.res);
  assert.equal(trackerResponse.result.statusCode, 401);
  assert.equal(trackerResponse.result.body.error, "Authentication required");

  const draftCapture = captureApp();
  questionnaire.registerQuestionnaireDraftRoutes(draftCapture.app);
  const draftGet = draftCapture.routes.get.find(([route]) => route === "/api/questionnaire/draft")?.[1];
  assert.equal(typeof draftGet, "function");
  const draftResponse = responseCapture();
  await draftGet({}, draftResponse.res);
  assert.equal(draftResponse.result.statusCode, 401);
  assert.equal(draftResponse.result.body.code, "AUTHENTICATION_REQUIRED");
});

test("required readiness rules cover all ten required milestones", () => {
  const expected = [
    "questionnaire",
    "innovation-score",
    "eligibility",
    "business-plan",
    "financial-projections",
    "endorser-comparison",
    "pitch-coach",
    "document-organizer",
    "final-review",
    "compliance-check",
  ];
  assert.deepEqual([...tracker.REQUIRED_STEP_IDS].sort(), expected.sort());
  for (const step of expected) assert.equal(typeof tracker.REQUIRED_EVIDENCE_POLICY[step], "string", `${step} needs an evidence policy`);
});

test("stale or browser-only required evidence cannot create 100 percent readiness", () => {
  const stored = [{
    stepId: "innovation-score",
    completionPercent: 100,
    status: "completed",
    progressData: { source: "auto" },
    updatedAt: new Date().toISOString(),
  }];
  const milestones = tracker.buildMilestones({
    storedRows: stored,
    planStatus: { latestCompleted: null },
    planEvidence: null,
    documents: { requiredTotal: 10, requiredSatisfied: 0, latestUpdatedAt: null },
    interviews: { completed: 0 },
    reviews: { completed: 0, latest: null },
    toolRuns: [],
  });
  const innovation = milestones.find((item) => item.id === "innovation-score");
  assert.equal(innovation.status, "in_progress");
  assert.equal(innovation.completionPercent, 95);
  assert.equal(innovation.needsRevalidation, true);
  const summary = tracker.readinessSummary(milestones);
  assert.equal(summary.applicationReady, false);
});

test("fresh durable tool runs carry auditable version and fingerprint metadata", () => {
  const run = {
    id: "run-1234567890123456",
    tool_id: "innovation-score",
    registry_version: "registry-2",
    policy_version: "policy-3",
    validation_state: "unverified",
    result_payload: { overallScore: 82 },
    result_sha256: "abc123",
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const audit = tracker.toolRunAudit(run);
  assert.equal(audit.hasDurableResult, true);
  assert.equal(audit.freshness, "current");
  assert.equal(audit.registryVersion, "registry-2");
  assert.equal(audit.policyVersion, "policy-3");
  assert.equal(audit.resultSha256, "abc123");
  assert.equal(audit.rulesetVersion, tracker.READINESS_RULESET_VERSION);
});

test("business-plan status is a single reusable service and startup preload no longer owns reconciliation", () => {
  assert.equal(typeof businessPlanStatus.getBusinessPlanStatusForUser, "function");
  assert.equal(typeof businessPlanStatus.reconcileCompletedBusinessPlansForUser, "function");
  const notice = read("client/src/components/ContextualDocumentNotice.tsx");
  const trackerSource = read("server/progressTracker.cjs");
  const packageJson = JSON.parse(read("package.json"));
  assert.match(notice, /\/api\/business-plan\/status/);
  assert.match(trackerSource, /getBusinessPlanStatusForUser/);
  assert.doesNotMatch(String(packageJson.scripts.start), /businessPlanCompletionReconciliation/);
  assert.doesNotMatch(String(packageJson.scripts.dev), /businessPlanCompletionReconciliation/);
});

test("Node 22 is the declared production runtime", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.engines.node, "22.x");
});
