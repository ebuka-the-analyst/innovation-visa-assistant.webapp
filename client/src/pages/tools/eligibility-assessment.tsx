import { useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Loader2,
  RefreshCcw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToolRunHistory } from "@/hooks/useToolPlatform";

const POLICY_VERSION = "uk-innovator-founder-2026-08-03";
const CURRENT_ENDORSERS = [
  "UK Endorsing Services",
  "Innovator International",
  "Envestors Limited",
  "The Global Entrepreneurs Programme (GEP)",
] as const;

const SUPPORTED_TOOL_IDS = new Set([
  "points-calculator",
  "eligibility-validator",
  "app-req-checker",
  "jurisdiction-checker",
]);

const TOOL_TITLES: Record<string, { title: string; subtitle: string }> = {
  "points-calculator": {
    title: "Innovator Founder Eligibility & Points Assessment",
    subtitle: "Calculate the statutory 70-point structure from declared evidence, with rule-by-rule explanations.",
  },
  "eligibility-validator": {
    title: "Innovator Founder Eligibility Validator",
    subtitle: "Check mandatory route, endorsement, English, finance and business requirements against current rules.",
  },
  "app-req-checker": {
    title: "Application Requirements Checker",
    subtitle: "Identify current blockers, missing evidence and application-stage requirements before submission.",
  },
  "jurisdiction-checker": {
    title: "Switching & Eligibility Checker",
    subtitle: "Check entry-clearance versus in-country switching rules alongside the Innovator Founder points requirements.",
  },
};

type ApplicationRoute = "entry_clearance" | "permission_to_stay";
type PermissionRoute =
  | "innovator_founder"
  | "innovator"
  | "start_up"
  | "tier1_graduate_entrepreneur"
  | "student"
  | "visitor"
  | "short_term_student"
  | "parent_of_child_student"
  | "seasonal_worker"
  | "domestic_worker_private_household"
  | "outside_immigration_rules"
  | "other"
  | "none";
type YesNoUnsure = "yes" | "no" | "unsure";

type NewBusiness = {
  criteria: "new_business";
  businessPlanExists: boolean;
  generatedOrSignificantlyContributed: boolean;
  dayToDayRole: boolean;
  twoContactPointMeetingsCommitted: boolean;
  soleOrInstrumentalFounder: boolean;
  genuineOriginalPlan: boolean;
  realisticAndAchievable: boolean;
  skillsKnowledgeExperienceMarketAwareness: boolean;
  structuredPlanningJobsNationalInternationalGrowth: boolean;
};

type SameBusiness = {
  criteria: "same_business";
  previousPermissionRoute: PermissionRoute;
  businessPreviouslyAssessed: boolean;
  previousContactPointRequirementMet: boolean;
  twoFutureContactPointMeetingsCommitted: boolean;
  activeTradingSustainable: boolean;
  significantProgressAgainstPlan: boolean;
  companiesHouseRegistered: boolean;
  directorOrMember: boolean;
  dayToDayManagement: boolean;
};

type FormState = {
  applicationRoute: ApplicationRoute;
  age: string;
  endorsement: {
    status: "no_letter" | "business_endorser" | "legacy_endorser" | "unknown";
    bodyName: string;
    issueDate: string;
    withdrawn: boolean;
    legacyEligibilityConfirmed: boolean;
  };
  business: NewBusiness | SameBusiness;
  english: {
    evidenceMethod:
      | "approved_selt"
      | "uk_degree"
      | "overseas_degree_ecctis"
      | "uk_school_qualification"
      | "previous_successful_visa"
      | "exempt_nationality"
      | "none"
      | "unsure";
    seltLevel: "below_b2" | "b2" | "c1" | "c2" | "not_applicable";
    evidenceAvailable: boolean;
  };
  finance: {
    fundsGbp: string;
    heldFor28ConsecutiveDays: boolean;
    mostRecentEvidenceWithin31Days: boolean;
    immediatelyAccessibleAccount: boolean;
    accountHolderHasControl: boolean;
    excludesBusinessInvestmentFunds: boolean;
    excludesUnlawfulUKEarnings: boolean;
    partnerRequiringMaintenanceFunds: boolean;
    childrenRequiringMaintenanceFunds: string;
  };
  documents: {
    validPassportOrTravelDocument: boolean;
    tuberculosisRequirement: "required" | "not_required" | "unsure";
    tuberculosisCertificateAvailable: boolean;
    translationRequirement: "required" | "not_required" | "unsure";
    certifiedTranslationsAvailable: boolean;
  };
  immigrationStatus: {
    currentPermissionRoute: PermissionRoute;
    monthsWithUKPermission: string;
    physicallyInUK: boolean;
    studentCourseCondition: "not_applicable" | "course_completed" | "phd_24_months_completed" | "condition_not_met" | "unsure";
    onImmigrationBail: YesNoUnsure;
    inBreachOfImmigrationLaws: YesNoUnsure;
    governmentScholarshipConsentRequired: boolean;
    governmentScholarshipConsentAvailable: boolean;
  };
};

type CriterionResult = {
  id: string;
  title: string;
  pointsAvailable: number;
  pointsAwarded: number;
  met: boolean;
  evidenceState: string;
  explanation: string;
  ruleRefs: string[];
};

type Assessment = {
  policyVersion: string;
  policyEffectiveDate: string;
  assessedAt: string;
  status: "not_ready" | "review_required" | "ready_on_declared_evidence";
  disclaimer: string;
  points: {
    required: 70;
    awarded: number;
    potentialOnDeclaredBusinessReadiness: number;
    thresholdMet: boolean;
    businessCriteria: "new_business" | "same_business";
    criteria: CriterionResult[];
  };
  endorsement: {
    validForPoints: boolean;
    declaredStatus: string;
    bodyName: string | null;
    ageInDays: number | null;
    currentBusinessEndorsers: string[];
  };
  maintenance: {
    mainApplicantEvidenceRequired: boolean;
    mainApplicantRequiredGbp: number;
    dependantRequiredGbp: number;
    familyTotalRequiredGbp: number;
    declaredMainApplicantFundsGbp: number;
  };
  blockers: string[];
  reviewItems: string[];
  scopeLimitations: string[];
  sources: Array<{ id: string; title: string; url: string }>;
};

type AssessmentResponse = {
  success: true;
  idempotentReplay: boolean;
  runId: string;
  validationState: "validated";
  registryVersion: string;
  policyVersion: string;
  resultSha256: string;
  assessment: Assessment;
};

const defaultNewBusiness = (): NewBusiness => ({
  criteria: "new_business",
  businessPlanExists: false,
  generatedOrSignificantlyContributed: false,
  dayToDayRole: false,
  twoContactPointMeetingsCommitted: false,
  soleOrInstrumentalFounder: false,
  genuineOriginalPlan: false,
  realisticAndAchievable: false,
  skillsKnowledgeExperienceMarketAwareness: false,
  structuredPlanningJobsNationalInternationalGrowth: false,
});

const defaultSameBusiness = (): SameBusiness => ({
  criteria: "same_business",
  previousPermissionRoute: "none",
  businessPreviouslyAssessed: false,
  previousContactPointRequirementMet: false,
  twoFutureContactPointMeetingsCommitted: false,
  activeTradingSustainable: false,
  significantProgressAgainstPlan: false,
  companiesHouseRegistered: false,
  directorOrMember: false,
  dayToDayManagement: false,
});

const createInitialState = (): FormState => ({
  applicationRoute: "entry_clearance",
  age: "",
  endorsement: {
    status: "no_letter",
    bodyName: "",
    issueDate: "",
    withdrawn: false,
    legacyEligibilityConfirmed: false,
  },
  business: defaultNewBusiness(),
  english: {
    evidenceMethod: "none",
    seltLevel: "not_applicable",
    evidenceAvailable: false,
  },
  finance: {
    fundsGbp: "",
    heldFor28ConsecutiveDays: false,
    mostRecentEvidenceWithin31Days: false,
    immediatelyAccessibleAccount: false,
    accountHolderHasControl: false,
    excludesBusinessInvestmentFunds: false,
    excludesUnlawfulUKEarnings: false,
    partnerRequiringMaintenanceFunds: false,
    childrenRequiringMaintenanceFunds: "0",
  },
  documents: {
    validPassportOrTravelDocument: false,
    tuberculosisRequirement: "unsure",
    tuberculosisCertificateAvailable: false,
    translationRequirement: "unsure",
    certifiedTranslationsAvailable: false,
  },
  immigrationStatus: {
    currentPermissionRoute: "none",
    monthsWithUKPermission: "0",
    physicallyInUK: false,
    studentCourseCondition: "not_applicable",
    onImmigrationBail: "no",
    inBreachOfImmigrationLaws: "no",
    governmentScholarshipConsentRequired: false,
    governmentScholarshipConsentAvailable: false,
  },
});

function BooleanField({
  checked,
  onCheckedChange,
  label,
  description,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium leading-5">{label}</span>
        {description && <span className="block text-xs text-muted-foreground leading-5">{description}</span>}
      </span>
    </label>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function outcomeLabel(status: Assessment["status"]) {
  if (status === "ready_on_declared_evidence") return "Requirements met on declared evidence";
  if (status === "review_required") return "Points met, review required";
  return "Not ready to apply";
}

export default function EligibilityAssessment() {
  const params = useParams<{ toolId: string }>();
  const toolId = SUPPORTED_TOOL_IDS.has(params.toolId || "") ? params.toolId : "eligibility-validator";
  const pageCopy = TOOL_TITLES[toolId] || TOOL_TITLES["eligibility-validator"];
  const [form, setForm] = useState<FormState>(createInitialState);
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const runKeyRef = useRef<string | null>(null);
  const history = useToolRunHistory(toolId, true);

  const mutation = useMutation({
    mutationFn: async (): Promise<AssessmentResponse> => {
      if (!runKeyRef.current) runKeyRef.current = crypto.randomUUID();
      const age = Number(form.age);
      const fundsGbp = Number(form.finance.fundsGbp || 0);
      const childrenRequiringMaintenanceFunds = Number(form.finance.childrenRequiringMaintenanceFunds || 0);
      const monthsWithUKPermission = Number(form.immigrationStatus.monthsWithUKPermission || 0);
      if (!Number.isInteger(age) || age < 0 || age > 120) throw new Error("Enter a valid age before running the assessment.");
      if (!Number.isFinite(fundsGbp) || fundsGbp < 0) throw new Error("Enter a valid maintenance-funds amount.");
      if (!Number.isInteger(childrenRequiringMaintenanceFunds) || childrenRequiringMaintenanceFunds < 0) {
        throw new Error("Enter a valid number of dependent children requiring maintenance funds.");
      }
      if (!Number.isInteger(monthsWithUKPermission) || monthsWithUKPermission < 0) {
        throw new Error("Enter a valid number of months with UK permission.");
      }

      const response = await apiRequest("POST", "/api/eligibility/assess", {
        toolId,
        applicationRoute: form.applicationRoute,
        age,
        endorsement: form.endorsement,
        business: form.business,
        english: form.english,
        finance: {
          ...form.finance,
          fundsGbp,
          childrenRequiringMaintenanceFunds,
        },
        documents: form.documents,
        immigrationStatus: {
          ...form.immigrationStatus,
          monthsWithUKPermission,
        },
        clientRunKey: runKeyRef.current,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setAssessment(data);
      runKeyRef.current = null;
      await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", toolId] });
      window.setTimeout(() => document.getElementById("eligibility-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
  });

  const currentPoints = assessment?.assessment.points.awarded ?? 0;
  const pointPercentage = Math.round((currentPoints / 70) * 100);
  const previousRuns = history.data?.runs ?? [];

  const financeExempt = form.applicationRoute === "permission_to_stay"
    && Number(form.immigrationStatus.monthsWithUKPermission || 0) >= 12;

  const businessChecklist = useMemo(() => {
    if (form.business.criteria === "new_business") {
      return (
        <>
          <BooleanField checked={form.business.businessPlanExists} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, businessPlanExists: value } }))} label="I have a business plan" />
          <BooleanField checked={form.business.generatedOrSignificantlyContributed} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, generatedOrSignificantlyContributed: value } }))} label="I generated or made a significant contribution to the ideas in the plan" />
          <BooleanField checked={form.business.dayToDayRole} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, dayToDayRole: value } }))} label="I will have a day-to-day role carrying out the business plan" />
          <BooleanField checked={form.business.twoContactPointMeetingsCommitted} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, twoContactPointMeetingsCommitted: value } }))} label="I will attend at least two endorsing-body contact point meetings during my permission" />
          <BooleanField checked={form.business.soleOrInstrumentalFounder} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, soleOrInstrumentalFounder: value } }))} label="I am the sole founder or an instrumental member of the founding team" />
          <div className="pt-2 border-t text-sm font-semibold">Innovation, Viability and Scalability</div>
          <BooleanField checked={form.business.genuineOriginalPlan} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, genuineOriginalPlan: value } }))} label="The plan is genuine and original and meets market needs or creates competitive advantage" />
          <BooleanField checked={form.business.realisticAndAchievable} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, realisticAndAchievable: value } }))} label="The plan is realistic and achievable with the resources available" />
          <BooleanField checked={form.business.skillsKnowledgeExperienceMarketAwareness} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, skillsKnowledgeExperienceMarketAwareness: value } }))} label="I have or am developing the skills, knowledge, experience and market awareness to run it" />
          <BooleanField checked={form.business.structuredPlanningJobsNationalInternationalGrowth} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as NewBusiness, structuredPlanningJobsNationalInternationalGrowth: value } }))} label="There is structured planning and evidence of potential for job creation and national/international growth" />
        </>
      );
    }

    return (
      <>
        <div className="space-y-2">
          <Label>Previous permission route</Label>
          <Select value={form.business.previousPermissionRoute} onValueChange={(value: PermissionRoute) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, previousPermissionRoute: value } }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="innovator_founder">Innovator Founder</SelectItem>
              <SelectItem value="innovator">Innovator</SelectItem>
              <SelectItem value="start_up">Start-up</SelectItem>
              <SelectItem value="tier1_graduate_entrepreneur">Tier 1 (Graduate Entrepreneur)</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="none">None / not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <BooleanField checked={form.business.businessPreviouslyAssessed} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, businessPreviouslyAssessed: value } }))} label="This business was previously assessed by an endorsing body while I held an eligible route" />
        {form.business.previousPermissionRoute === "innovator_founder" && (
          <BooleanField checked={form.business.previousContactPointRequirementMet} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, previousContactPointRequirementMet: value } }))} label="I attended the required previous contact point meetings" />
        )}
        <BooleanField checked={form.business.twoFutureContactPointMeetingsCommitted} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, twoFutureContactPointMeetingsCommitted: value } }))} label="I will attend at least two future contact point meetings" />
        <BooleanField checked={form.business.activeTradingSustainable} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, activeTradingSustainable: value } }))} label="The business is active, trading and sustainable" />
        <BooleanField checked={form.business.significantProgressAgainstPlan} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, significantProgressAgainstPlan: value } }))} label="The business has made significant progress against the business plan" />
        <BooleanField checked={form.business.companiesHouseRegistered} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, companiesHouseRegistered: value } }))} label="The business is registered with Companies House" />
        <BooleanField checked={form.business.directorOrMember} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, directorOrMember: value } }))} label="I am listed as a director or member of the business" />
        <BooleanField checked={form.business.dayToDayManagement} onCheckedChange={(value) => setForm((current) => ({ ...current, business: { ...current.business as SameBusiness, dayToDayManagement: value } }))} label="I am involved in day-to-day management and development" />
      </>
    );
  }, [form.business]);

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Production rules engine</Badge>
              <Badge variant="outline">Policy {POLICY_VERSION.replace("uk-innovator-founder-", "")}</Badge>
              <Badge variant="outline">Official-source rules</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{pageCopy.title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{pageCopy.subtitle}</p>
          </div>
          {previousRuns.length > 0 && (
            <Card className="min-w-[210px]">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Saved assessments</div>
                <div className="text-2xl font-bold">{previousRuns.length}</div>
                <div className="text-xs text-muted-foreground">Stored securely on your account</div>
              </CardContent>
            </Card>
          )}
        </div>

        <Alert>
          <Scale className="h-4 w-4" />
          <AlertTitle>How this assessment works</AlertTitle>
          <AlertDescription>
            The engine applies the current Appendix Innovator Founder 70-point structure. Business points are not awarded merely because boxes are ticked: a current valid endorsement is also required. The tool does not predict a Home Office or endorsing-body decision.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5 xl:grid-cols-2">
          <FieldGroup title="1. Application route and immigration position">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Application route</Label>
                <Select value={form.applicationRoute} onValueChange={(value: ApplicationRoute) => setForm((current) => ({ ...current, applicationRoute: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry_clearance">Applying from outside the UK</SelectItem>
                    <SelectItem value="permission_to_stay">Switching / extending inside the UK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age on application date</Label>
                <Input type="number" min={0} max={120} value={form.age} onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))} placeholder="e.g. 32" />
              </div>
            </div>

            {form.applicationRoute === "permission_to_stay" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current / last UK permission</Label>
                    <Select value={form.immigrationStatus.currentPermissionRoute} onValueChange={(value: PermissionRoute) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, currentPermissionRoute: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="innovator_founder">Innovator Founder</SelectItem>
                        <SelectItem value="innovator">Innovator</SelectItem>
                        <SelectItem value="start_up">Start-up</SelectItem>
                        <SelectItem value="tier1_graduate_entrepreneur">Tier 1 (Graduate Entrepreneur)</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="short_term_student">Short-term Student</SelectItem>
                        <SelectItem value="parent_of_child_student">Parent of a Child Student</SelectItem>
                        <SelectItem value="seasonal_worker">Seasonal Worker</SelectItem>
                        <SelectItem value="domestic_worker_private_household">Domestic Worker in a Private Household</SelectItem>
                        <SelectItem value="outside_immigration_rules">Outside the Immigration Rules</SelectItem>
                        <SelectItem value="other">Other permission</SelectItem>
                        <SelectItem value="none">None / not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Months in the UK with permission</Label>
                    <Input type="number" min={0} max={600} value={form.immigrationStatus.monthsWithUKPermission} onChange={(event) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, monthsWithUKPermission: event.target.value } }))} />
                  </div>
                </div>
                <BooleanField checked={form.immigrationStatus.physicallyInUK} onCheckedChange={(value) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, physicallyInUK: value } }))} label="I will be physically in the UK on the application date" />
                {form.immigrationStatus.currentPermissionRoute === "student" && (
                  <div className="space-y-2">
                    <Label>Student switching condition</Label>
                    <Select value={form.immigrationStatus.studentCourseCondition} onValueChange={(value: FormState["immigrationStatus"]["studentCourseCondition"]) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, studentCourseCondition: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course_completed">Course completed</SelectItem>
                        <SelectItem value="phd_24_months_completed">PhD: at least 24 months completed</SelectItem>
                        <SelectItem value="condition_not_met">Neither condition is met</SelectItem>
                        <SelectItem value="unsure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Immigration bail</Label>
                <Select value={form.immigrationStatus.onImmigrationBail} onValueChange={(value: YesNoUnsure) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, onImmigrationBail: value } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem><SelectItem value="unsure">Not sure</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currently in breach of immigration laws</Label>
                <Select value={form.immigrationStatus.inBreachOfImmigrationLaws} onValueChange={(value: YesNoUnsure) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, inBreachOfImmigrationLaws: value } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem><SelectItem value="unsure">Not sure</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <BooleanField checked={form.immigrationStatus.governmentScholarshipConsentRequired} onCheckedChange={(value) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, governmentScholarshipConsentRequired: value } }))} label="In the last 12 months, a government/international scholarship covered both my UK study fees and living costs" />
            {form.immigrationStatus.governmentScholarshipConsentRequired && (
              <BooleanField checked={form.immigrationStatus.governmentScholarshipConsentAvailable} onCheckedChange={(value) => setForm((current) => ({ ...current, immigrationStatus: { ...current.immigrationStatus, governmentScholarshipConsentAvailable: value } }))} label="I have written consent from that government or scholarship agency for this application" />
            )}
          </FieldGroup>

          <FieldGroup title="2. Endorsement">
            <div className="space-y-2">
              <Label>Endorsement position</Label>
              <Select value={form.endorsement.status} onValueChange={(value: FormState["endorsement"]["status"]) => setForm((current) => ({ ...current, endorsement: { ...current.endorsement, status: value, bodyName: value === "business_endorser" ? current.endorsement.bodyName : "" } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_letter">I do not yet have an endorsement letter</SelectItem>
                  <SelectItem value="business_endorser">Current Business Endorsing Body</SelectItem>
                  <SelectItem value="legacy_endorser">Legacy Endorsing Body</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.endorsement.status === "business_endorser" && (
              <div className="space-y-2">
                <Label>Endorsing body</Label>
                <Select value={form.endorsement.bodyName || undefined} onValueChange={(value) => setForm((current) => ({ ...current, endorsement: { ...current.endorsement, bodyName: value } }))}>
                  <SelectTrigger><SelectValue placeholder="Select current endorsing body" /></SelectTrigger>
                  <SelectContent>{CURRENT_ENDORSERS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                </Select>
                {form.endorsement.bodyName === "The Global Entrepreneurs Programme (GEP)" && (
                  <p className="text-xs text-muted-foreground">GEP only endorses founders invited to participate in its programme.</p>
                )}
              </div>
            )}
            {form.endorsement.status !== "no_letter" && (
              <div className="space-y-2">
                <Label>Endorsement letter issue date</Label>
                <Input type="date" value={form.endorsement.issueDate} onChange={(event) => setForm((current) => ({ ...current, endorsement: { ...current.endorsement, issueDate: event.target.value } }))} />
                <p className="text-xs text-muted-foreground">The letter must be no more than 3 months old when the application is made.</p>
              </div>
            )}
            <BooleanField checked={form.endorsement.withdrawn} onCheckedChange={(value) => setForm((current) => ({ ...current, endorsement: { ...current.endorsement, withdrawn: value } }))} label="The endorsement has been withdrawn" />
            {form.endorsement.status === "legacy_endorser" && (
              <BooleanField checked={form.endorsement.legacyEligibilityConfirmed} onCheckedChange={(value) => setForm((current) => ({ ...current, endorsement: { ...current.endorsement, legacyEligibilityConfirmed: value } }))} label="I have confirmed that the legacy endorsing-body rules apply to my previously endorsed case" description="Legacy bodies cannot take ordinary new initial applications." />
            )}
          </FieldGroup>

          <FieldGroup title="3. Business points criteria">
            <div className="space-y-2">
              <Label>Which business criteria are you applying under?</Label>
              <Select
                value={form.business.criteria}
                onValueChange={(value: "new_business" | "same_business") => setForm((current) => ({ ...current, business: value === "new_business" ? defaultNewBusiness() : defaultSameBusiness() }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_business">New business criteria</SelectItem>
                  <SelectItem value="same_business">Same business criteria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {businessChecklist}
          </FieldGroup>

          <FieldGroup title="4. English language">
            <div className="space-y-2">
              <Label>How will you meet the English requirement?</Label>
              <Select value={form.english.evidenceMethod} onValueChange={(value: FormState["english"]["evidenceMethod"]) => setForm((current) => ({ ...current, english: { ...current.english, evidenceMethod: value, seltLevel: value === "approved_selt" ? current.english.seltLevel : "not_applicable" } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved_selt">Approved Secure English Language Test</SelectItem>
                  <SelectItem value="uk_degree">UK degree taught in English</SelectItem>
                  <SelectItem value="overseas_degree_ecctis">Overseas degree with Ecctis confirmation</SelectItem>
                  <SelectItem value="uk_school_qualification">Qualifying UK school English qualification</SelectItem>
                  <SelectItem value="previous_successful_visa">Already proved English in a previous successful visa application</SelectItem>
                  <SelectItem value="exempt_nationality">Nationality exemption under Appendix English Language</SelectItem>
                  <SelectItem value="none">No qualifying route yet</SelectItem>
                  <SelectItem value="unsure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.english.evidenceMethod === "approved_selt" && (
              <div className="space-y-2">
                <Label>SELT level</Label>
                <Select value={form.english.seltLevel} onValueChange={(value: FormState["english"]["seltLevel"]) => setForm((current) => ({ ...current, english: { ...current.english, seltLevel: value } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_b2">Below B2</SelectItem>
                    <SelectItem value="b2">B2</SelectItem>
                    <SelectItem value="c1">C1</SelectItem>
                    <SelectItem value="c2">C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <BooleanField checked={form.english.evidenceAvailable} onCheckedChange={(value) => setForm((current) => ({ ...current, english: { ...current.english, evidenceAvailable: value } }))} label="I have the evidence needed for the English route selected above" />
          </FieldGroup>

          <FieldGroup title="5. Financial requirement">
            {financeExempt ? (
              <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Main applicant maintenance evidence not required</AlertTitle>
                <AlertDescription>You declared an in-country application after at least 12 months with UK permission. INNF 12.1 treats the main applicant financial requirement as met.</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Main applicant maintenance funds currently held (£)</Label>
                  <Input type="number" min={0} step="0.01" value={form.finance.fundsGbp} onChange={(event) => setForm((current) => ({ ...current, finance: { ...current.finance, fundsGbp: event.target.value } }))} placeholder="1270" />
                </div>
                <BooleanField checked={form.finance.heldFor28ConsecutiveDays} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, heldFor28ConsecutiveDays: value } }))} label="The required balance has been held for 28 consecutive days" />
                <BooleanField checked={form.finance.mostRecentEvidenceWithin31Days} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, mostRecentEvidenceWithin31Days: value } }))} label="The most recent financial evidence is or will be dated within 31 days before application" />
                <BooleanField checked={form.finance.immediatelyAccessibleAccount} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, immediatelyAccessibleAccount: value } }))} label="The funds are in an account from which they can be accessed immediately" />
                <BooleanField checked={form.finance.accountHolderHasControl} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, accountHolderHasControl: value } }))} label="I or an accepted account holder control the funds" />
                <BooleanField checked={form.finance.excludesBusinessInvestmentFunds} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, excludesBusinessInvestmentFunds: value } }))} label="The £1,270 maintenance amount does not rely on business investment funds" />
                <BooleanField checked={form.finance.excludesUnlawfulUKEarnings} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, excludesUnlawfulUKEarnings: value } }))} label="Any funds earned in the UK were earned lawfully while I had permission" />
              </>
            )}
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
              <BooleanField checked={form.finance.partnerRequiringMaintenanceFunds} onCheckedChange={(value) => setForm((current) => ({ ...current, finance: { ...current.finance, partnerRequiringMaintenanceFunds: value } }))} label="A dependent partner applying needs maintenance funds" />
              <div className="space-y-2">
                <Label>Dependent children who need maintenance funds</Label>
                <Input type="number" min={0} max={20} value={form.finance.childrenRequiringMaintenanceFunds} onChange={(event) => setForm((current) => ({ ...current, finance: { ...current.finance, childrenRequiringMaintenanceFunds: event.target.value } }))} />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="6. Documents and application evidence">
            <BooleanField checked={form.documents.validPassportOrTravelDocument} onCheckedChange={(value) => setForm((current) => ({ ...current, documents: { ...current.documents, validPassportOrTravelDocument: value } }))} label="I have a valid passport or other travel document establishing identity and nationality" />
            {form.applicationRoute === "entry_clearance" && (
              <>
                <div className="space-y-2">
                  <Label>Tuberculosis certificate requirement</Label>
                  <Select value={form.documents.tuberculosisRequirement} onValueChange={(value: FormState["documents"]["tuberculosisRequirement"]) => setForm((current) => ({ ...current, documents: { ...current.documents, tuberculosisRequirement: value } }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="required">Required for my circumstances</SelectItem><SelectItem value="not_required">Not required</SelectItem><SelectItem value="unsure">Not sure</SelectItem></SelectContent>
                  </Select>
                </div>
                {form.documents.tuberculosisRequirement === "required" && (
                  <BooleanField checked={form.documents.tuberculosisCertificateAvailable} onCheckedChange={(value) => setForm((current) => ({ ...current, documents: { ...current.documents, tuberculosisCertificateAvailable: value } }))} label="I have a valid required TB certificate" />
                )}
              </>
            )}
            <div className="space-y-2">
              <Label>Certified translation requirement</Label>
              <Select value={form.documents.translationRequirement} onValueChange={(value: FormState["documents"]["translationRequirement"]) => setForm((current) => ({ ...current, documents: { ...current.documents, translationRequirement: value } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="required">I have documents not in English or Welsh</SelectItem><SelectItem value="not_required">All relevant documents are in English or Welsh</SelectItem><SelectItem value="unsure">Not sure</SelectItem></SelectContent>
              </Select>
            </div>
            {form.documents.translationRequirement === "required" && (
              <BooleanField checked={form.documents.certifiedTranslationsAvailable} onCheckedChange={(value) => setForm((current) => ({ ...current, documents: { ...current.documents, certifiedTranslationsAvailable: value } }))} label="Certified translations are available" />
            )}
          </FieldGroup>
        </div>

        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">Run production assessment</div>
              <p className="text-sm text-muted-foreground">The calculation runs on the server, is schema-validated, is saved to your account and records the policy version used.</p>
              {mutation.error && <p className="mt-2 text-sm text-destructive">{mutation.error.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setForm(createInitialState()); setAssessment(null); runKeyRef.current = null; }} disabled={mutation.isPending}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                {mutation.isPending ? "Assessing..." : "Assess eligibility"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {assessment && (
          <div id="eligibility-results" className="scroll-mt-4 space-y-5">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/40">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={assessment.assessment.status === "ready_on_declared_evidence" ? "default" : "secondary"}>
                        {outcomeLabel(assessment.assessment.status)}
                      </Badge>
                      <Badge variant="outline">Validated rules calculation</Badge>
                    </div>
                    <CardTitle>Assessment result</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Run {assessment.runId.slice(0, 8)} • {new Date(assessment.assessment.assessedAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold">{assessment.assessment.points.awarded}<span className="text-xl text-muted-foreground">/70</span></div>
                    <div className="text-xs text-muted-foreground">statutory points currently evidenced</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-5">
                <Progress value={pointPercentage} className="h-3" />
                {assessment.assessment.points.potentialOnDeclaredBusinessReadiness !== assessment.assessment.points.awarded && (
                  <Alert>
                    <FileCheck2 className="h-4 w-4" />
                    <AlertTitle>Potential points after outstanding endorsement/evidence</AlertTitle>
                    <AlertDescription>
                      Based on the business readiness you declared, the engine calculates up to {assessment.assessment.points.potentialOnDeclaredBusinessReadiness}/70 potential points. Potential points are not awarded statutory points until the relevant conditions, including endorsement where required, are satisfied.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  {assessment.assessment.points.criteria.map((item) => (
                    <Card key={item.id} className={item.met ? "border-emerald-200" : "border-amber-200"}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2">
                            {item.met ? <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />}
                            <div>
                              <div className="font-semibold text-sm">{item.title}</div>
                              <p className="mt-1 text-xs text-muted-foreground leading-5">{item.explanation}</p>
                              <p className="mt-2 text-[11px] text-muted-foreground">Rules: {item.ruleRefs.join(", ")}</p>
                            </div>
                          </div>
                          <Badge variant={item.met ? "default" : "outline"}>{item.pointsAwarded}/{item.pointsAvailable}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground">Main applicant maintenance</div>
                      <div className="text-2xl font-bold">£{assessment.assessment.maintenance.mainApplicantRequiredGbp.toLocaleString("en-GB")}</div>
                      <div className="text-xs text-muted-foreground">{assessment.assessment.maintenance.mainApplicantEvidenceRequired ? "Evidence required" : "Evidence exemption applies"}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground">Dependants requiring funds</div>
                      <div className="text-2xl font-bold">£{assessment.assessment.maintenance.dependantRequiredGbp.toLocaleString("en-GB")}</div>
                      <div className="text-xs text-muted-foreground">Based on the dependants declared</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground">Total declared family requirement</div>
                      <div className="text-2xl font-bold">£{assessment.assessment.maintenance.familyTotalRequiredGbp.toLocaleString("en-GB")}</div>
                      <div className="text-xs text-muted-foreground">Where maintenance evidence applies</div>
                    </CardContent>
                  </Card>
                </div>

                {assessment.assessment.blockers.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Current blockers</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 list-disc pl-5 space-y-1">{assessment.assessment.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
                    </AlertDescription>
                  </Alert>
                )}

                {assessment.assessment.reviewItems.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Needs individual review</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 list-disc pl-5 space-y-1">{assessment.assessment.reviewItems.map((item) => <li key={item}>{item}</li>)}</ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-lg border p-4">
                  <div className="font-semibold text-sm mb-2">Official sources used by this policy version</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {assessment.assessment.sources.map((source) => (
                      <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {source.title}
                      </a>
                    ))}
                  </div>
                </div>

                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Important limitation</AlertTitle>
                  <AlertDescription>
                    {assessment.assessment.disclaimer} Part Suitability and the credibility of business evidence still require individual assessment. Re-check the official rules immediately before applying.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
