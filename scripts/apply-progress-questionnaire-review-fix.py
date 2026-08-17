from pathlib import Path

progress_path = Path('client/src/pages/progress.tsx')
progress = progress_path.read_text()

old_state = '''                      const actionLabel = step.status === "completed" ? "Review" : step.status === "in-progress" ? "Continue" : "Start";
                      const progressValue = step.status === "completed" ? 100 : step.percent;
                      return ('''
new_state = '''                      const actionLabel = step.status === "completed" ? "Review" : step.status === "in-progress" ? "Continue" : "Start";
                      const progressValue = step.status === "completed" ? 100 : step.percent;
                      const questionnaireReviewPlanId = step.id === "questionnaire" && step.status === "completed"
                        ? tracker?.authoritative.businessPlans.evidence?.planId || null
                        : null;
                      const questionnaireReviewHref = questionnaireReviewPlanId
                        ? `/api/view/html/${encodeURIComponent(questionnaireReviewPlanId)}`
                        : null;
                      const isQuestionnaireReviewUnavailable = step.id === "questionnaire" && step.status === "completed" && !questionnaireReviewHref;
                      const actionHref = questionnaireReviewHref || step.href;
                      return ('''
if old_state not in progress:
    raise SystemExit('Progress Tracker action-state marker not found')
progress = progress.replace(old_state, new_state, 1)

old_button = '''                              <Button asChild size="sm" variant={step.status === "completed" ? "outline" : "default"} className={`flex-1 gap-1.5 sm:flex-none ${step.status === "completed" ? "" : "bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700"}`}>
                                <Link href={step.href} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link>
                              </Button>'''
new_button = '''                              {isQuestionnaireReviewUnavailable ? (
                                <Button size="sm" variant="outline" className="flex-1 gap-1.5 sm:flex-none" disabled aria-label="Review Complete Business Questionnaire unavailable until progress is refreshed">
                                  Review unavailable
                                </Button>
                              ) : (
                                <Button asChild size="sm" variant={step.status === "completed" ? "outline" : "default"} className={`flex-1 gap-1.5 sm:flex-none ${step.status === "completed" ? "" : "bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700"}`}>
                                  {questionnaireReviewHref ? (
                                    <a href={actionHref} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></a>
                                  ) : (
                                    <Link href={actionHref} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link>
                                  )}
                                </Button>
                              )}'''
if old_button not in progress:
    raise SystemExit('Progress Tracker action-button marker not found')
progress = progress.replace(old_button, new_button, 1)
progress_path.write_text(progress)

test_path = Path('tests/e2e/progress-tracker.spec.ts')
tests = test_path.read_text()
api_marker = '''    if (url.pathname.startsWith("/api/progress-tracker/steps/")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });'''
api_replacement = '''    if (url.pathname.startsWith("/api/progress-tracker/steps/")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }

    if (url.pathname === "/api/view/html/plan-test-1") {
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><body><h1>Existing completed plan review</h1></body></html>",
      });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });'''
if api_marker not in tests:
    raise SystemExit('Progress Tracker E2E API marker not found')
tests = tests.replace(api_marker, api_replacement, 1)

test_marker = '''test("phase accordions are keyboard operable", async ({ page }) => {'''
review_test = '''test("completed questionnaire Review opens the existing plan instead of the new-plan credit flow", async ({ page }) => {
  await mockTrackerApi(page);
  await page.goto("/progress-e2e.html");

  const reviewLink = page.getByRole("link", { name: "Review Complete Business Questionnaire" });
  await expect(reviewLink).toHaveAttribute("href", "/api/view/html/plan-test-1");
  await expect(reviewLink).not.toHaveAttribute("href", "/questionnaire");

  await reviewLink.click();
  await expect(page).toHaveURL(/\\/api\\/view\\/html\\/plan-test-1$/);
  await expect(page.getByRole("heading", { name: "Existing completed plan review" })).toBeVisible();
  await expect(page.getByText("Get Credits")).toHaveCount(0);
});

'''
if test_marker not in tests:
    raise SystemExit('Progress Tracker E2E insertion marker not found')
tests = tests.replace(test_marker, review_test + test_marker, 1)
test_path.write_text(tests)

validator_path = Path('scripts/validate-progress-tracker-plan-link.cjs')
validator = validator_path.read_text()
read_marker = "const tracker = fs.readFileSync('server/progressTracker.cjs', 'utf8');\n"
if read_marker not in validator:
    raise SystemExit('Plan-link validator read marker not found')
validator = validator.replace(read_marker, read_marker + "const client = fs.readFileSync('client/src/pages/progress.tsx', 'utf8');\n", 1)

validation_marker = '''if (process.exitCode) {
  process.exit(process.exitCode);
}
'''
client_checks = '''if (!client.includes('tracker?.authoritative.businessPlans.evidence?.planId')) {
  fail('Completed questionnaire review must use the authoritative completed-plan ID');
}
if (!client.includes('`/api/view/html/${encodeURIComponent(questionnaireReviewPlanId)}`')) {
  fail('Completed questionnaire review must use the authenticated existing-plan HTML view');
}
if (!client.includes('isQuestionnaireReviewUnavailable')) {
  fail('Completed questionnaire review must fail closed when its authoritative plan ID is unavailable');
}
if (client.includes('<Link href={step.href} aria-label={`${actionLabel} ${step.title}`}>')) {
  fail('Progress step actions must not blindly reuse the new-workflow href after a step is complete');
}

'''
if validation_marker not in validator:
    raise SystemExit('Plan-link validator insertion marker not found')
validator = validator.replace(validation_marker, client_checks + validation_marker, 1)
validator_path.write_text(validator)
