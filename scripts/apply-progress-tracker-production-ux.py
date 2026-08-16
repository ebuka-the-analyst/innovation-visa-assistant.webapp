from pathlib import Path
import re

progress_path = Path('client/src/pages/progress.tsx')
feature_nav_path = Path('client/src/components/FeatureNavigation.tsx')

progress = progress_path.read_text()
feature_nav = feature_nav_path.read_text()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)

# Keep the old journey strip on other feature pages, but remove the redundant horizontal
# strip on the Progress Tracker where the phase accordion becomes the journey navigation.
feature_nav = replace_once(
    feature_nav,
    'interface FeatureNavProps {\n  currentPage: "progress" | "questionnaire" | "endorser-comparison" | "document-organizer" | "interview-prep" | "expert-booking" | "rejection-analysis" | "settlement-planning";\n}',
    'interface FeatureNavProps {\n  currentPage: "progress" | "questionnaire" | "endorser-comparison" | "document-organizer" | "interview-prep" | "expert-booking" | "rejection-analysis" | "settlement-planning";\n  showJourneyStrip?: boolean;\n}',
    'FeatureNavigation props',
)
feature_nav = replace_once(
    feature_nav,
    'export default function FeatureNavigation({ currentPage }: FeatureNavProps) {',
    'export default function FeatureNavigation({ currentPage, showJourneyStrip = true }: FeatureNavProps) {',
    'FeatureNavigation signature',
)
feature_nav = replace_once(
    feature_nav,
    '<div className="overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin">',
    '<div className={`${showJourneyStrip ? "block" : "hidden"} overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin`}>',
    'FeatureNavigation journey strip',
)
feature_nav = replace_once(
    feature_nav,
    '<div className="text-xs text-muted-foreground">\n        Phase {currentPhase} of 5:',
    '<div className={showJourneyStrip ? "text-xs text-muted-foreground" : "hidden"}>\n        Phase {currentPhase} of 5:',
    'FeatureNavigation phase indicator',
)
feature_nav = feature_nav.replace('currentPhase === 1 ? "Planning & Assessment"', 'currentPhase === 1 ? "Preparation & Assessment"')

# Icons/state used by the accessible phase accordion.
progress = replace_once(progress, '  Calculator,\n  CheckCircle2,', '  Calculator,\n  CheckCircle2,\n  ChevronDown,', 'Progress icon import')
progress = replace_once(
    progress,
    '  const [autoSyncing, setAutoSyncing] = useState(false);',
    '  const [autoSyncing, setAutoSyncing] = useState(false);\n  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(["preparation"]));',
    'Progress accordion state',
)

# The Progress Tracker now owns its phase navigation, so the old horizontal feature strip is redundant.
progress = progress.replace('<FeatureNavigation currentPage="progress" />', '<FeatureNavigation currentPage="progress" showJourneyStrip={false} />')

# Add derived UX labels and ensure the current phase is always expanded when progress moves forward.
progress = replace_once(
    progress,
    '  const nextRequiredStep = requiredSteps.find((step) => step.status !== "completed") || null;\n  const currentPhase = PHASES.find((phase) => phase.steps.some((step) => step.required && stepMap.get(step.id)?.status !== "completed")) || PHASES[PHASES.length - 1];',
    '''  const nextRequiredStep = requiredSteps.find((step) => step.status !== "completed") || null;
  const currentPhase = PHASES.find((phase) => phase.steps.some((step) => step.required && stepMap.get(step.id)?.status !== "completed")) || PHASES[PHASES.length - 1];
  const requiredRemaining = Math.max(0, requiredSteps.length - requiredCompleted);
  const currentPhaseNumber = Math.max(1, PHASES.findIndex((phase) => phase.id === currentPhase.id) + 1);
  const currentPhaseName = currentPhase.title.replace(/^\\d+\\.\\s*/, "");

  useEffect(() => {
    setExpandedPhases((previous) => {
      if (previous.has(currentPhase.id)) return previous;
      const next = new Set(previous);
      next.add(currentPhase.id);
      return next;
    });
  }, [currentPhase.id]);''',
    'Progress current phase UX derivatives',
)

header_pattern = re.compile(
    r'\n        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">.*?\n        <div className="space-y-5">',
    re.S,
)
header_replacement = r'''
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Application Progress Tracker</h1>
              <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Account-synced</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              See what is complete, what evidence proves it, and the single next action that moves your application forward.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 self-start"
            onClick={() => void refreshEverything()}
            disabled={isFetching || autoSyncing}
            aria-label="Refresh application progress"
            data-testid="refresh-progress"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching || autoSyncing ? "animate-spin" : ""}`} />
            {isFetching || autoSyncing ? "Refreshing…" : "Refresh progress"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert" data-testid="progress-load-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We could not verify your latest server-side progress. Saved browser signals are shown where available, but do not rely on the readiness score until the server connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {nextRequiredStep ? (
          <Card
            className="mb-6 overflow-hidden border-primary/40 bg-primary/[0.035] shadow-sm"
            role="region"
            aria-labelledby="next-required-step-heading"
            data-testid="next-required-step"
          >
            <CardContent className="p-0">
              <div className="border-b border-primary/15 bg-primary/[0.055] px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Next required step</div>
                  <Badge variant="outline" className="border-primary/20 bg-background/80 text-primary">
                    Phase {currentPhaseNumber} of {PHASES.length}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary" aria-hidden="true">
                    <nextRequiredStep.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 id="next-required-step-heading" className="text-xl font-bold tracking-tight md:text-2xl">{nextRequiredStep.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">{nextRequiredStep.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{statusLabel(nextRequiredStep.status)} · {nextRequiredStep.percent}%</span>
                      <span aria-hidden="true">•</span>
                      <span>{requiredRemaining} required milestone{requiredRemaining === 1 ? "" : "s"} remaining</span>
                    </div>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full shrink-0 gap-2 sm:w-auto" data-testid="next-required-step-action">
                  <Link href={nextRequiredStep.href}>Continue <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20" data-testid="all-required-complete">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription>
              All required tracker milestones are complete. Optional preparation tools can still strengthen your evidence pack.
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-7" aria-labelledby="readiness-heading">
          <Card className={applicationReady ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/15" : ""}>
            <CardContent className="p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-center">
                <div data-testid="required-readiness">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div id="readiness-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Required readiness</div>
                      <div className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">{requiredReadiness}%</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">{requiredCompleted} of {requiredSteps.length} required complete</div>
                      <div className="text-muted-foreground">{applicationReady ? "Required journey complete" : `${requiredRemaining} required milestone${requiredRemaining === 1 ? "" : "s"} remaining`}</div>
                    </div>
                  </div>
                  <Progress
                    value={requiredReadiness}
                    className="mt-4 h-3 bg-slate-200 dark:bg-slate-800"
                    aria-label={`Required readiness ${requiredReadiness}%`}
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    This is the primary readiness measure. Optional tools can strengthen preparation, but they do not block application readiness.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-xl border bg-background/80 p-4" data-testid="overall-journey-summary">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall journey</div>
                    <div className="mt-1 text-2xl font-bold">{overallProgress}%</div>
                    <div className="mt-1 text-xs text-muted-foreground">Required + optional work</div>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4" data-testid="current-phase-summary">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current phase</div>
                    <div className="mt-1 text-sm font-bold">Phase {currentPhaseNumber} of {PHASES.length}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{currentPhaseName}</div>
                  </div>
                  <div className={`rounded-xl border p-4 ${applicationReady ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30" : "bg-background/80"}`} data-testid="application-ready-summary">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Application readiness</div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                      {applicationReady ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                      {applicationReady ? "Required journey complete" : `${requiredRemaining} remaining`}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">All required milestones must be complete.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="space-y-4" aria-label="Application journey phases">'''

progress, count = header_pattern.subn('\n' + header_replacement, progress, count=1)
if count != 1:
    raise SystemExit(f'Progress header replacement: expected one match, found {count}')

phase_pattern = re.compile(
    r'\n          \{PHASES\.map\(\(phase\) => \{.*?\n          \}\)\}\n        </div>\n\n        <div className="mt-7 grid gap-4 lg:grid-cols-2">',
    re.S,
)
phase_replacement = r'''
          {PHASES.map((phase) => {
            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);
            const phaseRequired = phaseSteps.filter((step) => step.required);
            const phaseOptional = phaseSteps.filter((step) => !step.required);
            const requiredPercent = phaseRequiredReadiness(phase);
            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;
            const phaseOptionalComplete = phaseOptional.filter((step) => step.status === "completed").length;
            const phaseComplete = phaseRequired.length > 0 && phaseRequiredComplete === phaseRequired.length;
            const isCurrentPhase = phase.id === currentPhase.id;
            const isExpanded = expandedPhases.has(phase.id);
            const phaseNumber = Math.max(1, PHASES.findIndex((item) => item.id === phase.id) + 1);
            const phaseName = phase.title.replace(/^\d+\.\s*/, "");

            return (
              <Card
                key={phase.id}
                className={isCurrentPhase ? "border-primary/30 shadow-sm" : ""}
                data-testid={`phase-card-${phase.id}`}
              >
                <CardHeader className="p-0">
                  <button
                    type="button"
                    className="w-full rounded-t-xl p-5 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:p-6"
                    aria-expanded={isExpanded}
                    aria-controls={`phase-content-${phase.id}`}
                    onClick={() => {
                      setExpandedPhases((previous) => {
                        const next = new Set(previous);
                        if (next.has(phase.id)) next.delete(phase.id);
                        else next.add(phase.id);
                        return next;
                      });
                    }}
                    data-testid={`phase-toggle-${phase.id}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${phaseComplete ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : isCurrentPhase ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`} aria-hidden="true">
                          {phaseComplete ? <CheckCircle2 className="h-4 w-4" /> : phaseNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base sm:text-lg">{phaseName}</CardTitle>
                            {isCurrentPhase && !phaseComplete && <Badge variant="outline" className="border-primary/20 bg-primary/[0.05] text-primary">Current phase</Badge>}
                            {phaseComplete && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">Required complete</Badge>}
                          </div>
                          <CardDescription className="mt-1">{phase.description}</CardDescription>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {phaseRequiredComplete}/{phaseRequired.length} required complete
                            {phaseOptional.length ? ` · ${phaseOptionalComplete}/${phaseOptional.length} optional complete` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 md:min-w-[220px] md:justify-end">
                        <div className="min-w-[150px] flex-1 md:flex-none">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold">Required readiness</span>
                            <span className="font-bold">{requiredPercent}%</span>
                          </div>
                          <Progress value={requiredPercent} className="mt-2 h-2 bg-slate-200 dark:bg-slate-800" aria-label={`${phaseName} required readiness ${requiredPercent}%`} />
                        </div>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                      </div>
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent id={`phase-content-${phase.id}`} className="space-y-3 border-t bg-muted/[0.12] p-4 sm:p-5">
                    {phaseSteps.map((step) => {
                      const Icon = step.icon;
                      const isManualCompleted = step.source === "manual" && step.status === "completed";
                      const actionLabel = step.status === "completed" ? "Review" : step.status === "in-progress" ? "Continue" : "Start";
                      const progressValue = step.status === "completed" ? 100 : step.percent;
                      return (
                        <div
                          key={step.id}
                          className={`rounded-xl border bg-background p-4 ${step.id === nextRequiredStep?.id ? "border-primary/30 ring-1 ring-primary/10" : ""}`}
                          data-testid={`progress-step-${step.id}`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className={`mt-0.5 rounded-lg p-2 ${step.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : step.status === "in-progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-muted text-muted-foreground"}`} aria-hidden="true">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold">{step.title}</h3>
                                  <Badge variant="outline" className={statusBadgeClass(step.status)}>{statusLabel(step.status)}</Badge>
                                  <Badge variant={step.required ? "default" : "secondary"}>{step.required ? "Required" : "Optional"}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>

                                <div className="mt-3 max-w-2xl">
                                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                    <span className="font-medium text-muted-foreground">{sourceLabel(step.source)}</span>
                                    <span className="font-semibold" aria-label={`${step.title} progress ${progressValue}%`}>{progressValue}%</span>
                                  </div>
                                  <Progress value={progressValue} className="h-1.5 bg-slate-200 dark:bg-slate-800" aria-label={`${step.title} progress ${progressValue}%`} />
                                  <details className="group mt-2 text-xs text-muted-foreground">
                                    <summary className="cursor-pointer select-none font-medium text-foreground/75 hover:text-foreground">Why this status?</summary>
                                    <p className="mt-1.5 leading-relaxed">{step.detail}</p>
                                    {step.updatedAt && step.source !== "database" && <p className="mt-1">Account progress updated {formatDate(step.updatedAt)}</p>}
                                  </details>
                                </div>

                                {step.id === "document-organizer" && tracker?.authoritative.documents.missingRequired?.length ? (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Missing required: {tracker.authoritative.documents.missingRequired.slice(0, 4).join(", ")}{tracker.authoritative.documents.missingRequired.length > 4 ? ` +${tracker.authoritative.documents.missingRequired.length - 4} more` : ""}
                                  </div>
                                ) : null}

                                {step.id === "business-plan" && tracker?.authoritative.businessPlans.latest ? (
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>Latest: <strong className="text-foreground">{tracker.authoritative.businessPlans.latest.businessName}</strong> · {tracker.authoritative.businessPlans.latest.status}</span>
                                    {tracker.authoritative.businessPlans.latest.pdfUrl && (
                                      <a href={tracker.authoritative.businessPlans.latest.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                                        <Download className="h-3.5 w-3.5" /> View PDF
                                      </a>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto lg:justify-end">
                              {step.manualCompletion && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  disabled={manualMutation.isPending}
                                  onClick={() => manualMutation.mutate({ step, complete: !isManualCompleted })}
                                >
                                  {isManualCompleted ? "Reset confirmation" : "Confirm completed"}
                                </Button>
                              )}
                              <Button asChild size="sm" variant={step.status === "not-started" ? "default" : "secondary"} className="flex-1 gap-1.5 sm:flex-none">
                                <Link href={step.href} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">'''

progress, count = phase_pattern.subn('\n' + phase_replacement, progress, count=1)
if count != 1:
    raise SystemExit(f'Progress phase replacement: expected one match, found {count}')

# Give the long tracker page breathing room above floating support/feedback controls.
progress = replace_once(
    progress,
    '<div className="responsive-container py-8 md:py-10">',
    '<div className="responsive-container pb-24 pt-6 md:pb-28 md:pt-8">',
    'Progress page outer spacing',
)

progress_path.write_text(progress)
feature_nav_path.write_text(feature_nav)
print('Applied Progress Tracker production UX patch')
