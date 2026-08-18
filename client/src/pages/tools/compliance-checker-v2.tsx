import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileSearch,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useToast } from "@/hooks/use-toast";
import {
  type ApplicationDocumentReference,
  useApplicationContextPrefill,
  useCompleteToolRun,
  useStartToolRun,
} from "@/hooks/useToolPlatform";

const STORAGE_KEY = "innovator-founder-compliance-v2";
const POLICY_VERSION = "innovator-founder-2026-02-27";
const GOV_RULES_URL = "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder";
const GOV_DOCS_URL = "https://www.gov.uk/innovator-founder-visa/documents-youll-need-to-apply";

type Choice = "" | "ready" | "not-required" | "needs-action" | "uk-12-months" | "funds-28-days";

type ComplianceState = {
  endorsementIssueDate: string;
  endorsementConfirmed: boolean;
  identityConfirmed: boolean;
  ageConfirmed: boolean;
  englishStatus: Choice;
  financeStatus: Choice;
  tbStatus: Choice;
  translationStatus: Choice;
  scholarshipStatus: Choice;
  updatedAt: string | null;
};

const EMPTY_STATE: ComplianceState = {
  endorsementIssueDate: "",
  endorsementConfirmed: false,
  identityConfirmed: false,
  ageConfirmed: false,
  englishStatus: "",
  financeStatus: "",
  tbStatus: "",
  translationStatus: "",
  scholarshipStatus: "",
  updatedAt: null,
};

function normaliseName(document: ApplicationDocumentReference): string {
  return `${document.name || ""} ${document.category || ""}`.toLowerCase();
}

function matchingDocuments(documents: ApplicationDocumentReference[], terms: string[]): ApplicationDocumentReference[] {
  return documents.filter((document) => {
    const haystack = normaliseName(document);
    return terms.some((term) => haystack.includes(term));
  });
}

function isEndorsementDateCurrent(value: string): boolean {
  if (!value) return false;
  const issued = new Date(`${value}T12:00:00`);
  if (Number.isNaN(issued.getTime())) return false;
  const now = new Date();
  if (issued.getTime() > now.getTime()) return false;
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 3);
  return issued.getTime() >= cutoff.getTime();
}

function choiceReady(value: Choice): boolean {
  return value === "ready" || value === "not-required" || value === "uk-12-months" || value === "funds-28-days";
}

function calculateReadiness(state: ComplianceState): boolean[] {
  return [
    Boolean(state.endorsementConfirmed && isEndorsementDateCurrent(state.endorsementIssueDate)),
    state.identityConfirmed,
    state.ageConfirmed,
    state.englishStatus === "ready",
    state.financeStatus === "uk-12-months" || state.financeStatus === "funds-28-days",
    state.tbStatus === "ready" || state.tbStatus === "not-required",
    state.translationStatus === "ready" || state.translationStatus === "not-required",
    state.scholarshipStatus === "ready" || state.scholarshipStatus === "not-required",
  ];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not yet saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet saved";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function OptionButtons({
  value,
  onChange,
  options,
}: {
  value: Choice;
  onChange: (value: Choice) => void;
  options: Array<{ value: Choice; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        const ready = choiceReady(option.value);
        return (
          <Button
            key={option.value}
            type="button"
            variant={selected ? "default" : "outline"}
            className={selected && ready ? "border-emerald-700 bg-emerald-700 hover:bg-emerald-800" : selected && option.value === "needs-action" ? "border-red-600 bg-red-600 hover:bg-red-700" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

function EvidenceFound({ documents }: { documents: ApplicationDocumentReference[] }) {
  if (!documents.length) {
    return <span className="text-xs text-muted-foreground">No matching uploaded file was detected. You can still confirm this item if you hold the required evidence outside the platform.</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {documents.slice(0, 4).map((document) => (
        <Badge key={document.id} variant="outline" className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <FileSearch className="mr-1 h-3 w-3" />
          {document.name}
        </Badge>
      ))}
      {documents.length > 4 && <Badge variant="outline">+{documents.length - 4} more</Badge>}
    </div>
  );
}

export default function ComplianceCheckerV2() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prefill = useApplicationContextPrefill("compliance-checker", true);
  const startRun = useStartToolRun();
  const completeRun = useCompleteToolRun();

  const [state, setState] = useState<ComplianceState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const documents = prefill.data?.documents || [];
  const plan = prefill.data?.businessPlan || null;

  const endorsementDocs = useMemo(() => matchingDocuments(documents, ["endorsement", "endorser letter", "endorsement letter"]), [documents]);
  const identityDocs = useMemo(() => matchingDocuments(documents, ["passport", "identity", "travel document"]), [documents]);
  const englishDocs = useMemo(() => matchingDocuments(documents, ["english", "ielts", "selt", "degree", "ecctis"]), [documents]);
  const financeDocs = useMemo(() => matchingDocuments(documents, ["bank statement", "maintenance", "savings", "financial evidence"]), [documents]);
  const tbDocs = useMemo(() => matchingDocuments(documents, ["tuberculosis", "tb test", "tb certificate"]), [documents]);
  const translationDocs = useMemo(() => matchingDocuments(documents, ["translation", "translated", "certified translation"]), [documents]);
  const scholarshipDocs = useMemo(() => matchingDocuments(documents, ["scholarship", "sponsor consent", "government consent"]), [documents]);

  useEffect(() => {
    if (hydrated || prefill.isLoading) return;

    const local = window.localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.version === 2 && parsed.state) {
          setState({ ...EMPTY_STATE, ...parsed.state });
          setSavedAt(parsed.savedAt || parsed.state.updatedAt || null);
          setHydrated(true);
          return;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const previous = prefill.data?.previousToolRun?.inputSnapshot?.complianceV2 as { version?: number; state?: ComplianceState } | undefined;
    if (previous?.version === 2 && previous.state) {
      setState({ ...EMPTY_STATE, ...previous.state });
      setSavedAt(prefill.data?.previousToolRun?.completedAt || null);
    }
    setHydrated(true);
  }, [hydrated, prefill.data?.previousToolRun, prefill.isLoading]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = { version: 2, state: { ...state, updatedAt: new Date().toISOString() }, savedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, state]);

  const readiness = calculateReadiness(state);
  const readyCount = readiness.filter(Boolean).length;
  const score = Math.round((readyCount / readiness.length) * 100);
  const allReady = readyCount === readiness.length;
  const isSaving = startRun.isPending || completeRun.isPending;

  const saveLocally = () => {
    const now = new Date().toISOString();
    const next = { ...state, updatedAt: now };
    setState(next);
    setSavedAt(now);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state: next, savedAt: now }));
    toast({ title: "Checklist progress saved", description: "Your current route-readiness answers are saved on this device." });
  };

  const completeChecklist = async () => {
    if (!allReady) {
      toast({ title: "Eight checks are required", description: "Resolve the red or amber items before completing the final route checklist.", variant: "destructive" });
      return;
    }

    const evidenceRefs = [
      ...endorsementDocs,
      ...identityDocs,
      ...englishDocs,
      ...financeDocs,
      ...tbDocs,
      ...translationDocs,
      ...scholarshipDocs,
    ].map((document) => document.reference).filter(Boolean);
    const uniqueEvidenceRefs = Array.from(new Set(evidenceRefs));
    const now = new Date().toISOString();
    const savedState = { ...state, updatedAt: now };

    try {
      const started = await startRun.mutateAsync({
        toolId: "compliance-checker",
        inputSnapshot: {
          complianceV2: { version: 2, state: savedState },
          businessPlanId: plan?.id || null,
          route: "Innovator Founder",
          policyVersion: POLICY_VERSION,
          selfConfirmed: true,
          externalEvidenceIndependentlyVerifiedByThisTool: false,
        },
        evidenceRefs: uniqueEvidenceRefs,
        clientRunKey: crypto.randomUUID(),
        policyVersion: POLICY_VERSION,
      });

      await completeRun.mutateAsync({
        runId: started.runId,
        evidenceRefs: uniqueEvidenceRefs,
        resultPayload: {
          complianceV2: { version: 2, state: savedState },
          readyCount,
          requiredCount: 8,
          readinessPercent: 100,
          route: "Innovator Founder",
          policyVersion: POLICY_VERSION,
          evidenceRefsDetected: uniqueEvidenceRefs.length,
          selfConfirmed: true,
          externalEvidenceIndependentlyVerifiedByThisTool: false,
          note: "This records completion of the platform route-readiness checklist. It is not legal advice, an endorsement decision, a Home Office decision, or independent verification of external evidence.",
        },
      });

      setState(savedState);
      setSavedAt(now);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state: savedState, savedAt: now }));
      await queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", "compliance-checker"] });
      toast({
        title: "Final route checklist completed",
        description: "All eight checks have been saved to your account. Progress Tracker is being refreshed.",
      });
    } catch (error) {
      toast({
        title: "Could not save the completed checklist",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportSections = [
    {
      title: "Final route-readiness summary",
      content: `Route: Innovator Founder\nReadiness: ${readyCount}/8 (${score}%)\nPolicy basis: ${POLICY_VERSION}\nLast saved: ${formatDate(savedAt)}\n\nThis is a preparation checklist, not legal advice or a Home Office decision.`,
      score,
    },
    {
      title: "Checks",
      content: [
        `Endorsement letter current and not withdrawn: ${readiness[0] ? "Ready" : "Needs action"}`,
        `Valid passport / identity evidence: ${readiness[1] ? "Ready" : "Needs action"}`,
        `Age 18 or over: ${readiness[2] ? "Ready" : "Needs action"}`,
        `English B2 requirement / valid evidence: ${readiness[3] ? "Ready" : "Needs action"}`,
        `Financial requirement: ${readiness[4] ? "Ready" : "Needs action"}`,
        `TB evidence if applicable: ${readiness[5] ? "Ready" : "Needs action"}`,
        `Certified translations if applicable: ${readiness[6] ? "Ready" : "Needs action"}`,
        `Government/international scholarship consent if applicable: ${readiness[7] ? "Ready" : "Needs action"}`,
      ].join("\n"),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        <header className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Account-synced</Badge>
            <Badge variant="outline">8 route checks</Badge>
            <Badge variant="outline">GOV.UK policy basis</Badge>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Final Route Compliance Check</h1>
            <p className="mt-2 max-w-4xl text-muted-foreground">
              This final checklist focuses on the Innovator Founder application requirements that can be checked before submission. It replaces the old corporate-accounts and HR checklist, which was not an appropriate blanket test for every Innovator Founder applicant.
            </p>
          </div>
        </header>

        <Alert className="border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Preparation check, not legal certification</AlertTitle>
          <AlertDescription>
            The platform can organise evidence and record your confirmations, but it does not independently verify every external document and does not replace an endorsing body, UKVI or a regulated immigration adviser. Requirements can depend on personal circumstances.
          </AlertDescription>
        </Alert>

        <ToolUtilityBar
          toolId="compliance-checker"
          toolName="Final Route Compliance Check"
          onSave={saveLocally}
          getSerializedState={() => ({ version: 2, state })}
          exportSections={exportSections}
          exportTitle="Innovator Founder Final Route Checklist"
          exportSubtitle="Account-synced preparation record"
          autoSaveStatus={{ isSaving, lastSaved: savedAt ? formatDate(savedAt) : null }}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className={allReady ? "border-emerald-300" : "border-amber-300"}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">Route readiness</div>
              <div className="mt-1 text-3xl font-bold">{score}%</div>
              <Progress value={score} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">Checks ready</div>
              <div className="mt-1 text-3xl font-bold">{readyCount}/8</div>
              <div className="mt-2 text-xs text-muted-foreground">All eight must be resolved for this final platform milestone.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">Application context</div>
              <div className="mt-1 text-lg font-semibold">{plan?.businessName || (prefill.isLoading ? "Loading..." : "No completed plan selected")}</div>
              <div className="mt-2 text-xs text-muted-foreground">{documents.length} uploaded document reference{documents.length === 1 ? "" : "s"} available to this checklist.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><FileCheck2 className="h-5 w-5 text-primary" />Eight final checks</CardTitle>
            <CardDescription>Green means the requirement is resolved for this checklist. Amber/red means you still need to confirm something or obtain evidence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section className={`rounded-xl border p-4 ${readiness[0] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : "border-red-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">1. Endorsement letter</h2>
                  <p className="mt-1 text-sm text-muted-foreground">For an application, the endorsement letter must still be valid on the application date. The route rules require it to have been issued no more than 3 months before the application and not withdrawn.</p>
                </div>
                <Badge className={readiness[0] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{readiness[0] ? "Ready" : "Action needed"}</Badge>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="endorsement-date">Endorsement issue date</Label>
                  <Input id="endorsement-date" type="date" value={state.endorsementIssueDate} onChange={(event) => setState((current) => ({ ...current, endorsementIssueDate: event.target.value }))} />
                  {state.endorsementIssueDate && !isEndorsementDateCurrent(state.endorsementIssueDate) && <p className="mt-1 text-xs text-red-600">This date is not within the last three calendar months. Check the letter date and intended application date.</p>}
                </div>
                <label className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox checked={state.endorsementConfirmed} onCheckedChange={(checked) => setState((current) => ({ ...current, endorsementConfirmed: checked === true }))} />
                  <span className="text-sm">I have the endorsement letter and, to the best of my knowledge, it has not been withdrawn.</span>
                </label>
              </div>
              <div className="mt-3"><EvidenceFound documents={endorsementDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[1] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-semibold">2. Valid passport / identity document</h2><p className="mt-1 text-sm text-muted-foreground">A passport or other travel document must satisfactorily establish identity and nationality.</p></div>
                <Badge className={readiness[1] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[1] ? "Ready" : "Confirm"}</Badge>
              </div>
              <label className="mt-4 flex items-start gap-3 rounded-lg border p-3"><Checkbox checked={state.identityConfirmed} onCheckedChange={(checked) => setState((current) => ({ ...current, identityConfirmed: checked === true }))} /><span className="text-sm">I have a valid passport or travel document that establishes my identity and nationality.</span></label>
              <div className="mt-3"><EvidenceFound documents={identityDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[2] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">3. Age requirement</h2><p className="mt-1 text-sm text-muted-foreground">Innovator Founder applicants must be at least 18 on the date of application.</p></div><Badge className={readiness[2] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[2] ? "Ready" : "Confirm"}</Badge></div>
              <label className="mt-4 flex items-start gap-3 rounded-lg border p-3"><Checkbox checked={state.ageConfirmed} onCheckedChange={(checked) => setState((current) => ({ ...current, ageConfirmed: checked === true }))} /><span className="text-sm">I will be 18 or over on the date I submit the application.</span></label>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[3] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : state.englishStatus === "needs-action" ? "border-red-200" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">4. English language requirement</h2><p className="mt-1 text-sm text-muted-foreground">Unless an exemption applies, the route requires English at B2 in reading, writing, speaking and listening, using an accepted way of proving it.</p></div><Badge className={readiness[3] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[3] ? "Ready" : "Choose status"}</Badge></div>
              <div className="mt-4"><OptionButtons value={state.englishStatus} onChange={(value) => setState((current) => ({ ...current, englishStatus: value }))} options={[{ value: "ready", label: "Evidence / exemption ready" }, { value: "needs-action", label: "I still need to arrange this" }]} /></div>
              <div className="mt-3"><EvidenceFound documents={englishDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[4] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : state.financeStatus === "needs-action" ? "border-red-200" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">5. Financial requirement</h2><p className="mt-1 text-sm text-muted-foreground">Applicants applying from inside the UK after at least 12 months with permission meet the financial requirement automatically. Otherwise the main applicant normally needs at least £1,270 held for the required 28-day period. Dependants can create additional requirements.</p></div><Badge className={readiness[4] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[4] ? "Ready" : "Choose status"}</Badge></div>
              <div className="mt-4"><OptionButtons value={state.financeStatus} onChange={(value) => setState((current) => ({ ...current, financeStatus: value }))} options={[{ value: "uk-12-months", label: "UK permission for 12+ months" }, { value: "funds-28-days", label: "£1,270 / required funds held for 28 days" }, { value: "needs-action", label: "I still need to meet this" }]} /></div>
              <div className="mt-3"><EvidenceFound documents={financeDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[5] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : state.tbStatus === "needs-action" ? "border-red-200" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">6. Tuberculosis test, if applicable</h2><p className="mt-1 text-sm text-muted-foreground">A TB certificate is only required in circumstances covered by the UK rules.</p></div><Badge className={readiness[5] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[5] ? "Resolved" : "Choose status"}</Badge></div>
              <div className="mt-4"><OptionButtons value={state.tbStatus} onChange={(value) => setState((current) => ({ ...current, tbStatus: value }))} options={[{ value: "not-required", label: "Not required for my circumstances" }, { value: "ready", label: "Required and result ready" }, { value: "needs-action", label: "Required but not ready" }]} /></div>
              <div className="mt-3"><EvidenceFound documents={tbDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[6] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : state.translationStatus === "needs-action" ? "border-red-200" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">7. Certified translations, if applicable</h2><p className="mt-1 text-sm text-muted-foreground">Documents not in English or Welsh generally need a certified translation when submitted.</p></div><Badge className={readiness[6] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[6] ? "Resolved" : "Choose status"}</Badge></div>
              <div className="mt-4"><OptionButtons value={state.translationStatus} onChange={(value) => setState((current) => ({ ...current, translationStatus: value }))} options={[{ value: "not-required", label: "All relevant documents are English / Welsh" }, { value: "ready", label: "Certified translations ready" }, { value: "needs-action", label: "Translations still needed" }]} /></div>
              <div className="mt-3"><EvidenceFound documents={translationDocs} /></div>
            </section>

            <section className={`rounded-xl border p-4 ${readiness[7] ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : state.scholarshipStatus === "needs-action" ? "border-red-200" : "border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">8. Scholarship sponsor consent, if applicable</h2><p className="mt-1 text-sm text-muted-foreground">If a government or international scholarship agency paid both fees and living costs for UK study within the relevant 12-month period, written consent may be required.</p></div><Badge className={readiness[7] ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{readiness[7] ? "Resolved" : "Choose status"}</Badge></div>
              <div className="mt-4"><OptionButtons value={state.scholarshipStatus} onChange={(value) => setState((current) => ({ ...current, scholarshipStatus: value }))} options={[{ value: "not-required", label: "Not applicable to me" }, { value: "ready", label: "Written consent ready" }, { value: "needs-action", label: "I need written consent" }]} /></div>
              <div className="mt-3"><EvidenceFound documents={scholarshipDocs} /></div>
            </section>
          </CardContent>
        </Card>

        <Card className={allReady ? "border-emerald-300" : "border-amber-300"}>
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {allReady ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
                  <h2 className="text-lg font-semibold">{allReady ? "All eight route checks are ready" : `${8 - readyCount} check${8 - readyCount === 1 ? "" : "s"} still need attention`}</h2>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {allReady
                    ? "Complete the checklist to save a durable account record and move the required Progress Tracker journey to 100%."
                    : "Work through only the unresolved cards. Evidence detected by the platform is shown as a convenience, but an upload is not treated as independent verification."}
                </p>
              </div>
              <Button size="lg" onClick={completeChecklist} disabled={!allReady || isSaving} className="min-w-56">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Complete final checklist
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" />Policy basis reviewed against current GOV.UK Innovator Founder rules and application-document guidance.</div>
          <div className="flex flex-wrap gap-3">
            <a href={GOV_RULES_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Immigration Rules <ExternalLink className="h-3.5 w-3.5" /></a>
            <a href={GOV_DOCS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Documents guidance <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
