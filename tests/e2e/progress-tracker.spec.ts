import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const trackerFixture = {
  generatedAt: "2026-08-16T20:45:00.000Z",
  storedProgress: [
    {
      stepId: "eligibility",
      completionPercent: 100,
      status: "completed",
      progressData: { source: "auto", detail: "Eligibility complete" },
      updatedAt: "2026-08-16T10:15:00.000Z",
    },
  ],
  authoritative: {
    businessPlans: {
      total: 1,
      completed: 1,
      active: 0,
      latest: {
        id: "plan-test-1",
        businessName: "Example Innovation Ltd",
        status: "completed",
        pdfUrl: "/api/pdf/plan-test-1",
        createdAt: "2026-08-16T16:30:00.000Z",
      },
      evidence: {
        planId: "plan-test-1",
        financial: {
          satisfied: true,
          completedSignals: 6,
          totalSignals: 6,
          missing: [],
        },
        market: {
          satisfied: true,
          percent: 100,
          completedSignals: 5,
          totalSignals: 5,
          missing: [],
        },
      },
    },
    documents: {
      totalUploaded: 5,
      requiredUploaded: 5,
      requiredTotal: 5,
      completionPercent: 100,
      missingRequired: [],
    },
    interviews: {
      total: 0,
      completed: 0,
      active: 0,
      latestStatus: null,
    },
    documentReviews: {
      total: 0,
      completed: 0,
      active: 0,
      failed: 0,
      latest: null,
    },
  },
};

async function mockTrackerApi(page: Page, options?: { failTracker?: boolean }) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/api/progress-tracker") {
      if (options?.failTracker) {
        return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary tracker outage" }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(trackerFixture) });
    }

    if (url.pathname.startsWith("/api/progress-tracker/steps/")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("puts the next required action before analytics and explains readiness", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");

  await expect(page.getByRole("heading", { name: "Application Progress Tracker" })).toBeVisible();

  const nextStep = page.getByTestId("next-required-step");
  await expect(nextStep).toBeVisible();
  await expect(nextStep).toContainText("Innovation Score");
  await expect(nextStep).toContainText("5 required milestones remaining");

  const readiness = page.getByTestId("required-readiness");
  await expect(readiness).toContainText("50%");
  await expect(readiness).toContainText("5 of 10 required complete");

  await expect(page.getByTestId("overall-journey-summary")).toContainText("43%");
  await expect(page.getByTestId("current-phase-summary")).toContainText("Phase 1 of 5");
  await expect(page.getByTestId("current-phase-summary")).toContainText("Preparation & Assessment");

  const nextTop = await nextStep.boundingBox();
  const readinessBox = await readiness.boundingBox();
  expect(nextTop).not.toBeNull();
  expect(readinessBox).not.toBeNull();
  expect(nextTop!.y).toBeLessThan(readinessBox!.y);
});

test("keeps completed evidence visible without falsely completing Innovation Score", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");

  const preparation = page.getByTestId("phase-card-preparation");
  await expect(preparation).toContainText("Innovation Score");
  await expect(page.getByTestId("progress-step-innovation-score")).toContainText("Not started");

  const planningToggle = page.getByTestId("phase-toggle-business-planning");
  await expect(planningToggle).toHaveAttribute("aria-expanded", "false");
  await planningToggle.click();
  await expect(planningToggle).toHaveAttribute("aria-expanded", "true");

  await expect(page.getByTestId("progress-step-business-plan")).toContainText("Completed");
  await expect(page.getByTestId("progress-step-financial-projections")).toContainText("Completed");
  await expect(page.getByTestId("progress-step-market-research")).toContainText("Completed");
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

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 640, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/progress-e2e.html");
    await expect(page.getByTestId("next-required-step-action")).toBeVisible();

    const overflow = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
  }
});

test("shows a clear warning when authoritative progress cannot be verified", async ({ page }) => {
  await mockTrackerApi(page, { failTracker: true });
  await page.goto("/progress-e2e.html");

  const warning = page.getByTestId("progress-load-warning");
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("do not rely on the readiness score");
});

test("has no serious or critical accessibility violations in the primary tracker state", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");
  await expect(page.getByTestId("next-required-step")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const seriousOrCritical = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""));
  expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
});
