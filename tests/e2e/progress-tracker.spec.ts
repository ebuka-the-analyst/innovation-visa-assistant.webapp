import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const now = "2026-08-23T19:00:00.000Z";

const milestone = (
  id: string,
  required: boolean,
  completionPercent: number,
  status: "completed" | "in_progress" | "not_started",
  source: string,
  detail: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  required,
  completionPercent,
  status,
  source,
  detail,
  updatedAt: now,
  needsRevalidation: false,
  evidencePolicy: required ? `Evidence policy for ${id}` : null,
  audit: { rulesetVersion: "2026-08-23.1", ...((extra.audit as object) || {}) },
  ...extra,
});

const trackerFixture = {
  generatedAt: now,
  readinessRulesetVersion: "2026-08-23.1",
  requiredEvidencePolicy: {},
  milestones: [
    milestone("questionnaire", true, 100, "completed", "database", "Completed plan confirms questionnaire submission.", { audit: { recordId: "plan-test-1", recordType: "business_plan", completedAt: now } }),
    milestone("innovation-score", true, 0, "not_started", "none", "No durable Innovation Score result exists."),
    milestone("eligibility", true, 95, "in_progress", "synced", "Previous account progress is preserved but must be revalidated.", { needsRevalidation: true, audit: { recordId: "journey:eligibility", completedAt: "2026-08-16T10:15:00.000Z" } }),
    milestone("business-plan", true, 100, "completed", "database", "Completed plan exists.", { audit: { recordId: "plan-test-1", completedAt: now } }),
    milestone("financial-projections", true, 100, "completed", "plan", "Structured financial evidence is complete.", { audit: { recordId: "plan-test-1", completedAt: now } }),
    milestone("market-research", false, 100, "completed", "plan", "Market evidence is complete.", { audit: { recordId: "plan-test-1", completedAt: now } }),
    milestone("endorser-comparison", true, 0, "not_started", "none", "No endorser confirmation yet."),
    milestone("pitch-coach", true, 0, "not_started", "none", "No durable Pitch Coach run exists."),
    milestone("interview-prep", false, 0, "not_started", "none", "No interview session exists."),
    milestone("document-organizer", true, 100, "completed", "database", "All required documents are satisfied."),
    milestone("cover-letter", false, 0, "not_started", "none", "No cover letter run exists."),
    milestone("evidence-prep", false, 0, "not_started", "none", "No evidence run exists."),
    milestone("final-review", true, 100, "completed", "database", "A completed final review exists.", { audit: { recordId: "review-1", completedAt: now } }),
    milestone("compliance-check", true, 0, "not_started", "none", "No durable compliance run exists."),
  ],
  summary: {
    requiredCompleted: 5,
    requiredTotal: 10,
    requiredRemaining: 5,
    requiredReadiness: 60,
    optionalCompleted: 1,
    optionalTotal: 4,
    overallPreparation: 50,
    applicationReady: false,
    revalidationRequired: ["eligibility"],
  },
  storedProgress: [],
  authoritative: {
    businessPlans: {
      total: 1,
      completed: 1,
      active: 0,
      state: "completed",
      latest: {
        id: "plan-test-1",
        businessName: "Example Innovation Ltd",
        status: "completed",
        pdfUrl: "/api/pdf/plan-test-1",
        createdAt: now,
      },
      evidence: {
        planId: "plan-test-1",
        financial: { satisfied: true, completedSignals: 6, totalSignals: 6, missing: [] },
        market: { satisfied: true, percent: 100, completedSignals: 5, totalSignals: 5, missing: [] },
      },
    },
    toolRuns: { latestByTool: {} },
    documents: {
      totalUploaded: 8,
      requiredUploaded: 8,
      requiredSatisfied: 10,
      requiredTotal: 10,
      completionPercent: 100,
      uploadedRequiredNames: [],
      generatedRequiredNames: ["Business Plan", "Financial Projections"],
      missingRequired: [],
    },
    interviews: { total: 0, completed: 0, active: 0, latestStatus: null },
    documentReviews: { total: 1, completed: 1, active: 0, failed: 0, latest: { id: "review-1", status: "completed", completedAt: now } },
  },
};

function cloneFixture() {
  return JSON.parse(JSON.stringify(trackerFixture));
}

async function mockTrackerApi(page: Page, options?: { failTracker?: boolean; fixture?: any }) {
  const fixture = options?.fixture || trackerFixture;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/api/progress-tracker") {
      if (options?.failTracker) {
        return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary tracker outage" }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fixture) });
    }

    if (url.pathname.startsWith("/api/progress-tracker/steps/")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }

    if (url.pathname === "/api/view/html/plan-test-1") {
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><body><h1>Existing completed plan review</h1></body></html>",
      });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("puts the next required action before analytics and separates readiness from overall preparation", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");

  await expect(page.getByRole("heading", { name: "Application Progress Tracker" })).toBeVisible();
  const nextStep = page.getByTestId("next-required-step");
  await expect(nextStep).toBeVisible();
  await expect(nextStep).toContainText("Innovation Score");
  await expect(nextStep).toContainText("5 required milestones remaining");

  const readiness = page.getByTestId("required-readiness");
  await expect(readiness).toContainText("60%");
  await expect(readiness).toContainText("5 of 10 required complete");
  await expect(readiness).toContainText("Required application readiness");

  const overall = page.getByTestId("overall-journey-summary");
  await expect(overall).toContainText("Overall preparation");
  await expect(overall).toContainText("50%");
  await expect(page.getByText("Overall journey")).toHaveCount(0);
});

test("legacy synced required completion is preserved but does not count as complete", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");

  await expect(page.getByTestId("revalidation-warning")).toContainText("1 required milestone");
  const eligibility = page.getByTestId("progress-step-eligibility");
  await expect(eligibility).toContainText("Needs revalidation");
  await expect(eligibility).toContainText("Previous account-synced progress");
  await expect(eligibility).toContainText("95%");
});

test("fresh durable tool run is shown as verified with audit details", async ({ page }) => {
  const fixture = cloneFixture();
  fixture.milestones[1] = milestone(
    "innovation-score",
    true,
    100,
    "completed",
    "tool-run",
    "Fresh durable Innovation Score run recorded.",
    {
      audit: {
        runId: "run-innovation-123456",
        toolId: "innovation-score",
        completedAt: now,
        registryVersion: "registry-2",
        policyVersion: "policy-3",
        validationState: "unverified",
        resultSha256: "abc123",
        freshness: "current",
        ageDays: 0,
        maxAgeDays: 180,
      },
    },
  );
  fixture.summary.requiredCompleted = 6;
  fixture.summary.requiredRemaining = 4;
  fixture.summary.requiredReadiness = 70;
  fixture.summary.overallPreparation = 57;

  await mockTrackerApi(page, { fixture });
  await page.goto("/progress-e2e.html");
  const innovation = page.getByTestId("progress-step-innovation-score");
  await expect(innovation).toContainText("Completed");
  await expect(innovation).toContainText("Verified from durable tool run");
  await innovation.getByText("Why this status?").click();
  await expect(innovation).toContainText("run-innovation-123456");
  await expect(innovation).toContainText("policy-3");
  await expect(innovation).toContainText("abc123");
  await expect(innovation).toContainText("Current");
});

test("stale durable compliance evidence is visibly blocked pending revalidation", async ({ page }) => {
  const fixture = cloneFixture();
  fixture.milestones[13] = milestone(
    "compliance-check",
    true,
    95,
    "in_progress",
    "tool-run",
    "Compliance result is older than the readiness window.",
    {
      needsRevalidation: true,
      audit: {
        runId: "run-compliance-old",
        toolId: "compliance-checker",
        completedAt: "2026-04-01T12:00:00.000Z",
        resultSha256: "oldhash",
        freshness: "stale",
        ageDays: 144,
        maxAgeDays: 90,
      },
    },
  );
  fixture.summary.requiredReadiness = 69;
  fixture.summary.revalidationRequired = ["eligibility", "compliance-check"];

  await mockTrackerApi(page, { fixture });
  await page.goto("/progress-e2e.html");
  await page.getByTestId("phase-toggle-final-submission").click();
  const compliance = page.getByTestId("progress-step-compliance-check");
  await expect(compliance).toContainText("Needs revalidation");
  await compliance.getByText("Why this status?").click();
  await expect(compliance).toContainText("Stale, revalidation required");
  await expect(compliance).toContainText("90-day window");
});

test("completed questionnaire Review opens the existing plan instead of the new-plan flow", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");
  const reviewLink = page.getByRole("link", { name: "Review Complete Business Questionnaire" });
  await expect(reviewLink).toHaveAttribute("href", "/api/view/html/plan-test-1");
  await reviewLink.click();
  await expect(page).toHaveURL(/\/api\/view\/html\/plan-test-1$/);
  await expect(page.getByRole("heading", { name: "Existing completed plan review" })).toBeVisible();
});

test("phase accordions are keyboard operable", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");
  const phaseButton = page.getByTestId("phase-toggle-business-planning");
  await phaseButton.focus();
  await expect(phaseButton).toBeFocused();
  await expect(phaseButton).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(phaseButton).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(phaseButton).toHaveAttribute("aria-expanded", "false");
});

test("mobile and zoom-equivalent layouts do not create horizontal page overflow", async ({ page }) => {
  await mockTrackerApi(page);
  for (const viewport of [{ width: 390, height: 844 }, { width: 640, height: 600 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/progress-e2e.html");
    await expect(page.getByTestId("next-required-step-action")).toBeVisible();
    const overflow = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
  }
});

test("shows a clear warning when authoritative progress cannot be verified", async ({ page }) => {
  await mockTrackerApi(page, { failTracker: true });
  await page.goto("/progress-e2e.html");
  const warning = page.getByTestId("progress-load-warning");
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("Do not rely on the readiness score");
});

test("has no serious or critical accessibility violations in the primary tracker state", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");
  await expect(page.getByTestId("next-required-step")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const seriousOrCritical = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""));
  expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
});
