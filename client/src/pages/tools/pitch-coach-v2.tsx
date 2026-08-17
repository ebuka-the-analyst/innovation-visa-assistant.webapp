import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  Mic2,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  type ApplicationBusinessPlan,
  useApplicationContextPrefill,
  useCompleteToolRun,
  useStartToolRun,
} from "@/hooks/useToolPlatform";
import { queryClient } from "@/lib/queryClient";

const STORAGE_KEY = "pitch-coach-v2-state";
const STATE_VERSION = 2;
const WORDS_PER_SECOND = 2.15;

const DEFAULT_DURATIONS = [
  { id: "30s", title: "30-Second Elevator Pitch", targetSeconds: 30, context: "Quick introduction or opening answer" },
  { id: "3min", title: "3-Minute Pitch", targetSeconds: 180, context: "Initial endorser discussion or screening call" },
  { id: "10min", title: "10-Minute Presentation", targetSeconds: 600, context: "Detailed endorser interview or panel presentation" },
  { id: "20min", title: "20-Minute Full Pitch", targetSeconds: 1200, context: "Comprehensive presentation before extended Q&A" },
] as const;

type DurationUnit = "seconds" | "minutes";

type PitchScript = {
  id: string;
  title: string;
  targetSeconds: number;
  context: string;
  content: string;
  keyPoints: string[];
  completed: boolean;
  custom: boolean;
};

type QAItem = {
  id: string;
  question: string;
  answer: string;
  evidence: string;
  prepared: boolean;
  difficulty: "easy" | "medium" | "hard";
};

type PracticeSession = {
  id: string;
  date: string;
  pitchId: string;
  pitchTitle: string;
  targetSeconds: number;
  actualSeconds: number;
  confidence: number;
  strengths: string;
  improvements: string;
};

type DeliveryTip = {
  id: string;
  label: string;
  mastered: boolean;
};

type PreparationAsset = {
  id: string;
  title: string;
  content: string;
  ready: boolean;
  source: string;
};

type PitchCoachState = {
  version: 2;
  pitchScripts: PitchScript[];
  qaItems: QAItem[];
  practiceSessions: PracticeSession[];
  deliveryTips: DeliveryTip[];
  activeTab: string;
  selectedPracticePitchId: string;
  savedAt: string;
  businessPlanId: string | null;
};

const DELIVERY_TIPS: DeliveryTip[] = [
  { id: "eye-contact", label: "Maintain steady eye contact and rotate naturally between panel members.", mastered: false },
  { id: "pace", label: "Use a measured pace and pause after important figures or claims.", mastered: false },
  { id: "voice", label: "Vary tone and emphasis so key points do not sound memorised or flat.", mastered: false },
  { id: "opening", label: "Lead with the problem, the innovation and the founder fit in the opening minute.", mastered: false },
  { id: "evidence", label: "Use specific figures only when they match the evidence in the application pack.", mastered: false },
  { id: "interruptions", label: "Handle interruptions calmly, answer directly, then return to the pitch structure.", mastered: false },
  { id: "clarity", label: "Avoid jargon unless you immediately explain why the technology matters commercially.", mastered: false },
  { id: "ask", label: "Finish with a clear endorsement ask and the next milestone the business will execute.", mastered: false },
  { id: "timing", label: "Finish within the agreed time without rushing the final section.", mastered: false },
  { id: "risk", label: "Acknowledge real risks and explain practical mitigations rather than claiming there are none.", mastered: false },
  { id: "founder", label: "Connect founder experience directly to execution capability and the venture's needs.", mastered: false },
  { id: "scaling", label: "Explain UK job creation and scaling as operational steps, not just ambition.", mastered: false },
];

function clean(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function present(value: unknown): boolean {
  const text = clean(value).toLowerCase();
  return Boolean(text && !["n/a", "none", "not applicable", "not provided", "unknown"].includes(text));
}

function ensureStop(value: string): string {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function words(text: string): string[] {
  return clean(text).split(" ").filter(Boolean);
}

function trimToWords(text: string, target: number): string {
  const tokens = words(text);
  if (tokens.length <= target) return text.trim();
  return `${tokens.slice(0, Math.max(1, target)).join(" ").replace(/[,:;]$/, "")}.`;
}

function targetWordCount(seconds: number): number {
  return Math.max(35, Math.round(seconds * WORDS_PER_SECOND));
}

function estimatedSeconds(text: string): number {
  return Math.max(0, Math.round(words(text).length / WORDS_PER_SECOND));
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

function fallback(label: string): string {
  return `The current account record does not yet contain a complete ${label}. I would not invent this point; I would update the application record and use the verified figure or evidence before the endorsement conversation.`;
}

function planValue(value: unknown, label: string): string {
  return present(value) ? clean(value) : fallback(label);
}

function tractionSummary(plan: ApplicationBusinessPlan): string {
  const parts = [
    clean(plan.existingCustomers),
    clean(plan.betaTesters),
    clean(plan.tractionEvidence),
    clean(plan.customerInterviews),
    clean(plan.lettersOfIntent),
    clean(plan.willingnessToPay),
  ].filter(Boolean);
  return parts.length ? parts.map(ensureStop).join(" ") : fallback("traction evidence");
}

function founderSummary(plan: ApplicationBusinessPlan): string {
  const parts = [
    clean(plan.experience),
    clean(plan.founderEducation),
    clean(plan.founderWorkHistory),
    clean(plan.founderAchievements),
    clean(plan.relevantProjects),
  ].filter(Boolean);
  return parts.length ? parts.map(ensureStop).join(" ") : fallback("founder capability evidence");
}

function technologySummary(plan: ApplicationBusinessPlan): string {
  const parts = [
    clean(plan.technology),
    clean(plan.techStack),
    clean(plan.dataArchitecture),
    clean(plan.aiMethodology),
    clean(plan.complianceDesign),
  ].filter(Boolean);
  return parts.length ? parts.map(ensureStop).join(" ") : fallback("technology and defensibility detail");
}

function financialSummary(plan: ApplicationBusinessPlan): string {
  const parts = [
    clean(plan.revenue),
    clean(plan.monthlyProjections),
    plan.funding ? `The current funding requirement recorded in the application is £${Number(plan.funding).toLocaleString("en-GB")}.` : "",
    clean(plan.fundingSources),
    clean(plan.detailedCosts),
  ].filter(Boolean);
  return parts.length ? parts.map(ensureStop).join(" ") : fallback("financial projection");
}

function scalingSummary(plan: ApplicationBusinessPlan): string {
  const parts = [
    plan.jobCreation ? `The application currently plans for ${plan.jobCreation} UK jobs.` : "",
    clean(plan.hiringPlan),
    clean(plan.specificRegions),
    clean(plan.expansion),
    clean(plan.internationalPlan),
    clean(plan.vision),
  ].filter(Boolean);
  return parts.length ? parts.map(ensureStop).join(" ") : fallback("UK scaling and job-creation plan");
}

function buildPitch(plan: ApplicationBusinessPlan, targetSeconds: number): string {
  const businessName = clean(plan.businessName) || "the venture";
  const problem = planValue(plan.problem, "problem statement");
  const solution = present(plan.uniqueness)
    ? clean(plan.uniqueness)
    : planValue(plan.technology, "innovation statement");
  const market = planValue(plan.marketSize, "market-size and target-customer evidence");
  const differentiation = present(plan.competitiveDifferentiation)
    ? clean(plan.competitiveDifferentiation)
    : planValue(plan.competitors, "competitive differentiation");
  const founder = founderSummary(plan);
  const traction = tractionSummary(plan);
  const finance = financialSummary(plan);
  const scaling = scalingSummary(plan);
  const technology = technologySummary(plan);
  const endorser = clean(plan.targetEndorser);
  const ask = endorser
    ? `I am seeking endorsement and constructive challenge from ${endorser}, with a clear focus on executing the evidence-backed milestones already set out in the application.`
    : "I am seeking endorsement for the venture and constructive challenge on the evidence-backed milestones already set out in the application.";

  const core = [
    `I am the founder of ${businessName}. ${problem}`,
    `${businessName} addresses that problem through a differentiated solution: ${ensureStop(solution)}`,
    `The commercial opportunity is grounded in the market evidence in my application. ${market}`,
    `The evidence of demand and progress so far is as follows. ${traction}`,
    `The business model and financial case are supported by the current projections. ${finance}`,
    `The technology and defensibility case is practical rather than just conceptual. ${technology}`,
    `Against existing alternatives, my differentiation is clear. ${ensureStop(differentiation)}`,
    `I am positioned to execute because my background is directly relevant to the build, delivery and commercialisation of this venture. ${founder}`,
    `The UK scaling plan links growth to operational capacity and employment. ${scaling}`,
    present(plan.regulatoryRequirements) || present(plan.complianceTimeline)
      ? `I have also planned for regulatory and compliance execution. ${ensureStop(clean(plan.regulatoryRequirements))} ${ensureStop(clean(plan.complianceTimeline))}`
      : "I will keep regulatory and compliance obligations explicit in the delivery plan and will not treat them as an afterthought.",
    ask,
  ].map(clean).filter(Boolean);

  let selected: string[];
  if (targetSeconds <= 45) {
    selected = [core[0], core[1], core[2], ask];
  } else if (targetSeconds <= 240) {
    selected = [core[0], core[1], core[2], core[3], core[6], core[7], core[8], ask];
  } else if (targetSeconds <= 720) {
    selected = core.slice(0, 10).concat(ask);
  } else {
    selected = core.concat([
      present(plan.contactPointsStrategy) ? `My endorser engagement strategy is ${ensureStop(clean(plan.contactPointsStrategy))}` : "",
      present(plan.supportingEvidence) ? `The supporting evidence register also records ${ensureStop(clean(plan.supportingEvidence))}` : "",
      present(plan.productStatus) ? `The current product status is ${ensureStop(clean(plan.productStatus))}` : "",
      present(plan.innovationStage) ? `The innovation is currently at the following stage: ${ensureStop(clean(plan.innovationStage))}` : "",
    ].filter(Boolean));
  }

  const narrative = selected.join("\n\n");
  return trimToWords(narrative, targetWordCount(targetSeconds));
}

function keyPointsFor(plan: ApplicationBusinessPlan): string[] {
  return [
    clean(plan.businessName) || "Business",
    "Problem",
    "Innovation",
    "Market",
    "Traction",
    "Business model",
    "Founder capability",
    "UK scaling",
    "Endorsement ask",
  ];
}

function buildQa(plan: ApplicationBusinessPlan): QAItem[] {
  const businessName = clean(plan.businessName) || "the venture";
  const jobText = plan.jobCreation
    ? `The current application plan is to create ${plan.jobCreation} UK jobs. ${ensureStop(clean(plan.hiringPlan))}`
    : fallback("UK job-creation figure");
  const ip = present(plan.patentStatus)
    ? `My current IP position is: ${ensureStop(clean(plan.patentStatus))} I distinguish between registered rights, protectable know-how, data, software implementation and commercial defensibility rather than claiming IP that does not exist.`
    : "I am not going to claim a patent or registered right that is not evidenced. The defensibility case currently rests on the implementation, data/technology architecture, product execution and competitive differentiation recorded in the application.";

  const items: Array<Omit<QAItem, "id" | "prepared">> = [
    {
      question: "What problem does your business solve?",
      answer: `The problem ${businessName} solves is: ${planValue(plan.problem, "problem statement")}`,
      evidence: "Application fields: problem, industry. Any quantitative pain-point claim should match the supporting market evidence.",
      difficulty: "easy",
    },
    {
      question: "Who are your target customers and what is your market size?",
      answer: `My target market is the segment described in the application, and the current market case is: ${planValue(plan.marketSize, "market-size evidence")} ${present(plan.existingCustomers) ? `Current customer evidence includes ${ensureStop(clean(plan.existingCustomers))}` : ""}`,
      evidence: "Application fields: marketSize, existingCustomers, customerInterviews, willingnessToPay.",
      difficulty: "medium",
    },
    {
      question: "How is your solution innovative compared with existing alternatives?",
      answer: `The innovation is not simply that technology is being used. The differentiated element is: ${planValue(plan.uniqueness, "innovation and uniqueness statement")} The competitive case is: ${planValue(plan.competitiveDifferentiation, "competitive differentiation")}`,
      evidence: "Application fields: uniqueness, technology, competitors, competitiveDifferentiation.",
      difficulty: "medium",
    },
    {
      question: "What is your business model and revenue strategy?",
      answer: `The revenue model recorded in my application is: ${planValue(plan.revenue, "revenue model")} The financial assumptions and cost structure are: ${financialSummary(plan)}`,
      evidence: "Application fields: revenue, monthlyProjections, detailedCosts, fundingSources, CAC/LTV where available.",
      difficulty: "medium",
    },
    {
      question: "What traction have you achieved so far?",
      answer: `I separate genuine traction from forecasts. The traction currently recorded in my application is: ${tractionSummary(plan)}`,
      evidence: "Application fields: existingCustomers, betaTesters, tractionEvidence, customerInterviews, lettersOfIntent, willingnessToPay. External proof remains separately verifiable.",
      difficulty: "medium",
    },
    {
      question: "Why are you the right founder to execute this business?",
      answer: `My founder fit comes from the combination of relevant technical, commercial and delivery experience already recorded in the application. ${founderSummary(plan)}`,
      evidence: "Application fields: experience, founderEducation, founderWorkHistory, founderAchievements, relevantProjects. Supporting CV/certificates should match these claims.",
      difficulty: "easy",
    },
    {
      question: "What are your financial projections for the next three years?",
      answer: `I would answer this from the same financial model used in the application rather than quote a different set of numbers in the interview. ${financialSummary(plan)}`,
      evidence: "Application fields: monthlyProjections, revenue, funding, fundingSources, detailedCosts. Use the saved 36-month model where available.",
      difficulty: "hard",
    },
    {
      question: "How will you use investment or funding?",
      answer: `The funding requirement and intended use are based on the cost plan rather than an arbitrary figure. ${plan.funding ? `The application records a funding requirement of £${Number(plan.funding).toLocaleString("en-GB")}.` : fallback("funding requirement")} ${ensureStop(clean(plan.detailedCosts))} ${ensureStop(clean(plan.fundingSources))}`,
      evidence: "Application fields: funding, detailedCosts, fundingSources. Funding evidence should be provided separately where claimed.",
      difficulty: "medium",
    },
    {
      question: "What are the key risks and how will you mitigate them?",
      answer: `The main risks I would discuss are customer adoption, execution capacity, funding discipline, technical delivery and any applicable regulatory obligations. My mitigation is to tie hiring and expenditure to validated demand, maintain measurable delivery milestones, keep financial downside scenarios visible and execute the compliance plan recorded in the application. ${ensureStop(clean(plan.regulatoryRequirements))} ${ensureStop(clean(plan.complianceTimeline))}`,
      evidence: "Application fields: regulatoryRequirements, complianceTimeline, complianceBudget, detailedCosts, hiringPlan plus the financial downside model.",
      difficulty: "hard",
    },
    {
      question: "Why the UK specifically?",
      answer: `The UK opportunity is linked to the target market, customer access and scaling plan already set out in my application. ${planValue(plan.marketSize, "UK market opportunity")} ${ensureStop(clean(plan.specificRegions))} ${ensureStop(clean(plan.expansion))}`,
      evidence: "Application fields: marketSize, specificRegions, expansion, regulatoryRequirements.",
      difficulty: "medium",
    },
    {
      question: "How many jobs will you create in the UK?",
      answer: jobText,
      evidence: "Application fields: jobCreation, hiringPlan. The interview answer should match the financial model and hiring timetable.",
      difficulty: "easy",
    },
    {
      question: "What is your competitive advantage and how defensible is it?",
      answer: `My competitive advantage is: ${planValue(plan.competitiveDifferentiation, "competitive differentiation")} The supporting technology and operating defensibility are: ${technologySummary(plan)}`,
      evidence: "Application fields: competitors, competitiveDifferentiation, technology, techStack, dataArchitecture, aiMethodology.",
      difficulty: "hard",
    },
    {
      question: "Do you have intellectual property or patents?",
      answer: ip,
      evidence: "Application field: patentStatus. Do not overstate registered or pending rights without the underlying documents.",
      difficulty: "medium",
    },
    {
      question: "What are your key milestones for the next 12 to 24 months?",
      answer: `The milestones follow the product, customer, hiring and expansion plan already in the application. ${ensureStop(clean(plan.productStatus))} ${ensureStop(clean(plan.innovationStage))} ${ensureStop(clean(plan.contactPointsStrategy))} ${ensureStop(clean(plan.hiringPlan))} ${ensureStop(clean(plan.expansion))}`,
      evidence: "Application fields: productStatus, innovationStage, contactPointsStrategy, hiringPlan, expansion.",
      difficulty: "medium",
    },
    {
      question: "How will you scale the business?",
      answer: `The scaling plan is staged rather than relying on a single growth assumption. ${scalingSummary(plan)}`,
      evidence: "Application fields: expansion, specificRegions, internationalPlan, hiringPlan, jobCreation, vision.",
      difficulty: "hard",
    },
  ];

  return items.map((item, index) => {
    const prepared = item.answer.length >= 80 && !item.answer.includes("does not yet contain");
    return { id: `q${index + 1}`, ...item, prepared };
  });
}

function buildAssets(plan: ApplicationBusinessPlan): PreparationAsset[] {
  const assets = [
    {
      id: "market",
      title: "Market proof talking points",
      content: [clean(plan.marketSize), clean(plan.customerInterviews), clean(plan.willingnessToPay), clean(plan.competitors)].filter(Boolean).map(ensureStop).join(" "),
      source: "Market size, customer interviews, willingness-to-pay and competitor fields",
    },
    {
      id: "financial",
      title: "Financial talking points",
      content: financialSummary(plan),
      source: "Revenue, projections, funding and detailed-cost fields",
    },
    {
      id: "founder",
      title: "Founder capability summary",
      content: founderSummary(plan),
      source: "Founder education, work history, achievements and relevant projects",
    },
    {
      id: "technology",
      title: "Technology & defensibility summary",
      content: technologySummary(plan),
      source: "Technology, stack, architecture, AI methodology and compliance design",
    },
    {
      id: "scaling",
      title: "UK scaling & jobs summary",
      content: scalingSummary(plan),
      source: "Hiring, job creation, regions, expansion and vision",
    },
    {
      id: "endorser",
      title: "Endorsement ask",
      content: present(plan.targetEndorser)
        ? `Target endorser: ${clean(plan.targetEndorser)}. ${ensureStop(clean(plan.contactPointsStrategy))}`
        : "Seek endorsement based on the innovation, viability and scalability evidence in the application, and keep the ask focused on the venture rather than immigration advice.",
      source: "Target endorser and contact strategy",
    },
  ];

  return assets.map((asset) => ({ ...asset, ready: asset.content.length >= 60 && !asset.content.includes("does not yet contain") }));
}

function defaultScripts(plan?: ApplicationBusinessPlan | null): PitchScript[] {
  return DEFAULT_DURATIONS.map((item) => {
    const content = plan ? buildPitch(plan, item.targetSeconds) : "";
    return {
      id: item.id,
      title: item.title,
      targetSeconds: item.targetSeconds,
      context: item.context,
      content,
      keyPoints: plan ? keyPointsFor(plan) : [],
      completed: content.length >= 80,
      custom: false,
    };
  });
}

function snapshotState(input: Omit<PitchCoachState, "savedAt">): PitchCoachState {
  return { ...input, savedAt: new Date().toISOString() };
}

export default function PitchCoachV2() {
  const { toast } = useToast();
  const prefill = useApplicationContextPrefill("pitch-coach", true);
  const startRun = useStartToolRun();
  const completeRun = useCompleteToolRun();
  const autoPersistedRef = useRef(false);

  const [pitchScripts, setPitchScripts] = useState<PitchScript[]>(defaultScripts());
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [deliveryTips, setDeliveryTips] = useState<DeliveryTip[]>(DELIVERY_TIPS);
  const [activeTab, setActiveTab] = useState("scripts");
  const [selectedPracticePitchId, setSelectedPracticePitchId] = useState("3min");
  const [customAmount, setCustomAmount] = useState("5");
  const [customUnit, setCustomUnit] = useState<DurationUnit>("minutes");
  const [hydrated, setHydrated] = useState(false);
  const [autoGenerated, setAutoGenerated] = useState(false);
  const [lastAccountSave, setLastAccountSave] = useState<string | null>(null);

  const plan = prefill.data?.businessPlan || null;
  const assets = useMemo(() => (plan ? buildAssets(plan) : []), [plan]);

  const scriptsReady = pitchScripts.filter((script) => script.completed && script.content.length >= 80).length;
  const qaReady = qaItems.filter((item) => item.prepared && item.answer.length >= 80).length;
  const assetsReady = assets.filter((asset) => asset.ready).length;
  const preparationCompleteness = Math.min(
    100,
    Math.round(
      (pitchScripts.length ? (scriptsReady / pitchScripts.length) * 45 : 0) +
      (qaItems.length ? (qaReady / qaItems.length) * 40 : 0) +
      (assets.length ? (assetsReady / assets.length) * 15 : 0),
    ),
  );

  const validSessions = practiceSessions.filter((session) => session.actualSeconds > 0 && session.confidence > 0);
  const averageConfidence = validSessions.length
    ? validSessions.reduce((sum, session) => sum + session.confidence, 0) / validSessions.length
    : 0;
  const timingAccuracy = validSessions.length
    ? validSessions.reduce((sum, session) => {
        const deviation = Math.abs(session.actualSeconds - session.targetSeconds);
        return sum + Math.max(0, 100 - (deviation / Math.max(1, session.targetSeconds)) * 100);
      }, 0) / validSessions.length
    : 0;
  const masteredTips = deliveryTips.filter((tip) => tip.mastered).length;
  const practiceReadiness = Math.min(
    100,
    Math.round(
      Math.min(1, validSessions.length / 5) * 40 +
      (averageConfidence / 10) * 30 +
      (timingAccuracy / 100) * 20 +
      (masteredTips / deliveryTips.length) * 10,
    ),
  );

  const businessPlanId = plan?.id || null;

  const getState = (): PitchCoachState => snapshotState({
    version: STATE_VERSION,
    pitchScripts,
    qaItems,
    practiceSessions,
    deliveryTips,
    activeTab,
    selectedPracticePitchId,
    businessPlanId,
  });

  const applyState = (state: PitchCoachState) => {
    if (state.version !== STATE_VERSION) return false;
    setPitchScripts(state.pitchScripts || []);
    setQaItems(state.qaItems || []);
    setPracticeSessions(state.practiceSessions || []);
    setDeliveryTips(state.deliveryTips?.length ? state.deliveryTips : DELIVERY_TIPS);
    setActiveTab(state.activeTab || "scripts");
    setSelectedPracticePitchId(state.selectedPracticePitchId || state.pitchScripts?.[0]?.id || "3min");
    setLastAccountSave(state.savedAt || null);
    return true;
  };

  const buildFromApplication = (sourcePlan: ApplicationBusinessPlan) => {
    const scripts = defaultScripts(sourcePlan);
    const qas = buildQa(sourcePlan);
    setPitchScripts(scripts);
    setQaItems(qas);
    setPracticeSessions([]);
    setDeliveryTips(DELIVERY_TIPS);
    setSelectedPracticePitchId("3min");
    setActiveTab("scripts");
    setAutoGenerated(true);
    return { scripts, qas };
  };

  useEffect(() => {
    if (hydrated || prefill.isLoading) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PitchCoachState;
        if (applyState(parsed)) {
          setHydrated(true);
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const previousState = prefill.data?.previousToolRun?.inputSnapshot?.pitchCoachV2 as PitchCoachState | undefined;
    if (previousState && previousState.version === STATE_VERSION && applyState(previousState)) {
      setHydrated(true);
      return;
    }

    if (plan) {
      buildFromApplication(plan);
    }
    setHydrated(true);
  }, [hydrated, plan, prefill.data?.previousToolRun?.inputSnapshot, prefill.isLoading]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  }, [hydrated, pitchScripts, qaItems, practiceSessions, deliveryTips, activeTab, selectedPracticePitchId, businessPlanId]);

  const persistDurableRun = async (reason: "automatic" | "manual") => {
    if (!plan) return;
    const state = getState();
    const evidenceRefs = (prefill.data?.documents || []).map((document) => document.reference);
    const started = await startRun.mutateAsync({
      toolId: "pitch-coach",
      inputSnapshot: {
        pitchCoachV2: state,
        businessPlanId: plan.id,
        generationReason: reason,
        preparationCompleteness,
        practiceReadiness,
        externalEvidenceVerifiedByThisTool: false,
      },
      evidenceRefs,
      clientRunKey: crypto.randomUUID(),
    });

    await completeRun.mutateAsync({
      runId: started.runId,
      evidenceRefs,
      resultPayload: {
        pitchCoachV2: state,
        preparationCompleteness,
        practiceReadiness,
        scriptsReady,
        scriptsTotal: pitchScripts.length,
        qasPrepared: qaReady,
        qasTotal: qaItems.length,
        preparationAssetsReady: assetsReady,
        preparationAssetsTotal: assets.length,
        generatedFromApplicationContext: true,
        externalEvidenceVerifiedByThisTool: false,
        note: "Preparation completion does not assert that practice sessions occurred or that external evidence has been independently verified.",
      },
    });

    setLastAccountSave(new Date().toISOString());
    await queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", "pitch-coach"] });
  };

  useEffect(() => {
    if (
      !hydrated ||
      !autoGenerated ||
      preparationCompleteness < 100 ||
      autoPersistedRef.current ||
      prefill.data?.previousToolRun
    ) {
      return;
    }

    autoPersistedRef.current = true;
    void persistDurableRun("automatic").catch((error) => {
      console.error("Pitch Coach automatic account save failed", error);
      autoPersistedRef.current = false;
    });
  }, [autoGenerated, hydrated, preparationCompleteness, prefill.data?.previousToolRun]);

  const handleSave = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    try {
      await persistDurableRun("manual");
      toast({
        title: "Pitch preparation saved",
        description: "Your current pitch pack is now stored in your account and linked to Progress Tracker.",
      });
    } catch (error) {
      toast({
        title: "Saved locally, account sync failed",
        description: error instanceof Error ? error.message : "Please try the account save again.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      toast({ title: "No local pitch save found" });
      return;
    }
    try {
      const parsed = JSON.parse(saved) as PitchCoachState;
      if (!applyState(parsed)) throw new Error("Unsupported saved format");
      toast({ title: "Pitch preparation restored" });
    } catch {
      toast({ title: "Could not restore the saved pitch", variant: "destructive" });
    }
  };

  const handleRebuild = () => {
    if (!plan) return;
    buildFromApplication(plan);
    toast({
      title: "Pitch pack rebuilt from your application",
      description: "Scripts, Q&A and talking points have been regenerated from the latest account data.",
    });
  };

  const updateScript = (id: string, patch: Partial<PitchScript>) => {
    setPitchScripts((current) => current.map((script) => {
      if (script.id !== id) return script;
      const next = { ...script, ...patch };
      if (patch.content !== undefined) next.completed = patch.content.trim().length >= 80;
      return next;
    }));
  };

  const addCustomPitch = () => {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter a valid pitch duration", variant: "destructive" });
      return;
    }
    const seconds = Math.round(customUnit === "minutes" ? amount * 60 : amount);
    if (seconds < 10 || seconds > 3600) {
      toast({ title: "Choose between 10 seconds and 60 minutes", variant: "destructive" });
      return;
    }
    const id = `custom-${seconds}-${Date.now()}`;
    const title = `${formatDuration(seconds)} Custom Pitch`;
    const content = plan ? buildPitch(plan, seconds) : "";
    const script: PitchScript = {
      id,
      title,
      targetSeconds: seconds,
      context: "User-defined pitch duration",
      content,
      keyPoints: plan ? keyPointsFor(plan) : [],
      completed: content.length >= 80,
      custom: true,
    };
    setPitchScripts((current) => [...current, script]);
    setSelectedPracticePitchId(id);
    setActiveTab("scripts");
    toast({ title: `${title} added` });
  };

  const removeCustomPitch = (id: string) => {
    setPitchScripts((current) => current.filter((script) => script.id !== id));
    if (selectedPracticePitchId === id) setSelectedPracticePitchId("3min");
  };

  const updateQa = (id: string, field: "answer" | "evidence", value: string) => {
    setQaItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      next.prepared = next.answer.trim().length >= 80 && !next.answer.includes("does not yet contain");
      return next;
    }));
  };

  const addPracticeSession = () => {
    const pitch = pitchScripts.find((script) => script.id === selectedPracticePitchId) || pitchScripts[0];
    if (!pitch) return;
    setPracticeSessions((current) => [
      ...current,
      {
        id: `practice-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        pitchId: pitch.id,
        pitchTitle: pitch.title,
        targetSeconds: pitch.targetSeconds,
        actualSeconds: 0,
        confidence: 0,
        strengths: "",
        improvements: "",
      },
    ]);
  };

  const updatePractice = (id: string, patch: Partial<PracticeSession>) => {
    setPracticeSessions((current) => current.map((session) => session.id === id ? { ...session, ...patch } : session));
  };

  const toggleTip = (id: string) => {
    setDeliveryTips((current) => current.map((tip) => tip.id === id ? { ...tip, mastered: !tip.mastered } : tip));
  };

  const exportSections = useMemo(() => {
    const sections = [
      {
        title: "Pitch preparation summary",
        content: `Preparation completeness: ${preparationCompleteness}%\nPractice readiness: ${practiceReadiness}%\nQ&A prepared: ${qaReady}/${qaItems.length}\nScripts ready: ${scriptsReady}/${pitchScripts.length}\n\nPreparation completion does not independently verify external evidence or claim that practice sessions occurred.`,
        score: preparationCompleteness,
      },
      ...pitchScripts.map((script) => ({
        title: script.title,
        content: `${script.content}\n\nKey points: ${script.keyPoints.join(", ")}\nTarget: ${formatDuration(script.targetSeconds)}\nEstimated delivery: ${formatDuration(estimatedSeconds(script.content))}`,
      })),
      {
        title: "Endorser Q&A preparation",
        content: qaItems.map((item, index) => `${index + 1}. ${item.question}\n${item.answer}\nEvidence map: ${item.evidence}`).join("\n\n"),
      },
      {
        title: "Application talking-point pack",
        content: assets.map((asset) => `${asset.title}\n${asset.content}\nSource: ${asset.source}`).join("\n\n"),
      },
    ];
    return sections;
  }, [assets, pitchScripts, preparationCompleteness, practiceReadiness, qaItems, qaReady, scriptsReady]);

  const isSaving = startRun.isPending || completeRun.isPending;
  const sourceLabel = prefill.isLoading
    ? "Loading your application context..."
    : plan
      ? `Using ${clean(plan.businessName) || "your latest completed business plan"}`
      : "No completed business plan was available for automatic pitch generation.";

  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Pitch Practice Coach" toolId="pitch-coach">
      <div className="min-h-screen bg-background py-6">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 md:px-6">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline">Account-synced</Badge>
                <Badge variant="outline">Custom timing</Badge>
                <Badge variant="outline">Evidence-aware</Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Endorser Pitch Coach</h1>
              <p className="mt-2 text-muted-foreground">
                Your pitch scripts and common endorser answers are built from the application information already saved in your account. You can still edit every word and create any pitch length you need.
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{sourceLabel}</p>
            </div>
            <Button variant="outline" onClick={handleRebuild} disabled={!plan || prefill.isLoading}>
              <RefreshCcw className="h-4 w-4" />
              Rebuild from my application
            </Button>
          </header>

          <Alert className="border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Preparation can be completed for you; practice cannot be invented.</AlertTitle>
            <AlertDescription>
              A 100% preparation score means the scripts, Q&A and application talking points are ready. Practice sessions, confidence and timing remain separate so the platform never claims you practised when you did not, and it never treats generated text as external evidence.
            </AlertDescription>
          </Alert>

          <ToolUtilityBar
            toolId="pitch-coach"
            toolName="Endorser Pitch Coach"
            onSave={handleSave}
            onRestore={handleRestore}
            getSerializedState={getState}
            exportSections={exportSections}
            exportTitle="Endorser Pitch Preparation Pack"
            exportSubtitle={plan ? `${clean(plan.businessName)} • account-synced preparation` : "Pitch preparation"}
            autoSaveStatus={{
              isSaving,
              lastSaved: lastAccountSave ? new Date(lastAccountSave).toLocaleString("en-GB") : null,
            }}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className={preparationCompleteness === 100 ? "border-emerald-300" : "border-amber-300"}>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Pitch preparation</div>
                <div className="mt-1 text-3xl font-bold">{preparationCompleteness}%</div>
                <Progress value={preparationCompleteness} className="mt-3" />
                <div className="mt-2 text-xs text-muted-foreground">Scripts + Q&A + talking points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Practice readiness</div>
                <div className="mt-1 text-3xl font-bold">{practiceReadiness}%</div>
                <Progress value={practiceReadiness} className="mt-3" />
                <div className="mt-2 text-xs text-muted-foreground">Based only on real logged practice</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Q&A prepared</div>
                <div className="mt-1 text-3xl font-bold">{qaReady}/{qaItems.length || 15}</div>
                <div className="mt-3 text-xs text-muted-foreground">Common endorser questions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Practice sessions</div>
                <div className="mt-1 text-3xl font-bold">{validSessions.length}</div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {averageConfidence ? `Average confidence ${averageConfidence.toFixed(1)}/10` : "Confidence not yet assessed"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 md:grid-cols-5">
              <TabsTrigger value="scripts" data-testid="tab-scripts">Pitch Scripts</TabsTrigger>
              <TabsTrigger value="qa" data-testid="tab-qa">Q&A Prep</TabsTrigger>
              <TabsTrigger value="practice" data-testid="tab-practice">Practice Log</TabsTrigger>
              <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery</TabsTrigger>
              <TabsTrigger value="review" data-testid="tab-review">Final Review</TabsTrigger>
            </TabsList>

            <TabsContent value="scripts" className="space-y-5">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Create any pitch duration</CardTitle>
                  <CardDescription>
                    Enter exactly how many seconds or minutes you have. The script is generated from the same account data as the standard pitch versions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:max-w-[180px]">
                    <Label htmlFor="custom-pitch-duration">Duration</Label>
                    <Input
                      id="custom-pitch-duration"
                      type="number"
                      min={customUnit === "seconds" ? 10 : 0.2}
                      max={customUnit === "seconds" ? 3600 : 60}
                      step={customUnit === "seconds" ? 1 : 0.5}
                      value={customAmount}
                      onChange={(event) => setCustomAmount(event.target.value)}
                    />
                  </div>
                  <div className="w-full sm:max-w-[180px]">
                    <Label htmlFor="custom-pitch-unit">Unit</Label>
                    <select
                      id="custom-pitch-unit"
                      value={customUnit}
                      onChange={(event) => setCustomUnit(event.target.value as DurationUnit)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </div>
                  <Button onClick={addCustomPitch}>
                    <Plus className="h-4 w-4" />
                    Add custom pitch
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {pitchScripts.map((script) => {
                  const estimate = estimatedSeconds(script.content);
                  const withinRange = script.content.length > 0 && Math.abs(estimate - script.targetSeconds) <= Math.max(15, script.targetSeconds * 0.2);
                  return (
                    <Card key={script.id} className={script.completed ? "border-emerald-200" : "border-amber-200"}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-lg">{script.title}</CardTitle>
                            <CardDescription>{script.context}</CardDescription>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Target {formatDuration(script.targetSeconds)}</Badge>
                            <Badge variant="outline" className={script.completed ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800"}>
                              {script.completed ? "Draft ready" : "Needs content"}
                            </Badge>
                            {script.custom && (
                              <Button variant="ghost" size="icon" onClick={() => removeCustomPitch(script.id)} aria-label={`Remove ${script.title}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Pitch script</Label>
                          <Textarea
                            rows={Math.min(18, Math.max(5, Math.ceil(script.targetSeconds / 90) + 4))}
                            value={script.content}
                            onChange={(event) => updateScript(script.id, { content: event.target.value })}
                            placeholder={`Write your ${formatDuration(script.targetSeconds)} pitch here...`}
                          />
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{words(script.content).length} words</span>
                            <span>Estimated {formatDuration(estimate)}</span>
                            <span className={withinRange ? "text-emerald-700" : "text-amber-700"}>
                              {withinRange ? "Timing is close to target" : "Practise and adjust for your speaking pace"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label>Key points</Label>
                          <Input
                            value={script.keyPoints.join(", ")}
                            onChange={(event) => updateScript(script.id, { keyPoints: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
              {qaItems.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>A completed business plan is needed to build account-specific Q&A answers automatically.</AlertDescription>
                </Alert>
              )}
              {qaItems.map((item, index) => (
                <Card key={item.id} className={item.prepared ? "border-emerald-200" : "border-amber-200"}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{index + 1}. {item.question}</CardTitle>
                        <CardDescription className="mt-1 capitalize">{item.difficulty} difficulty</CardDescription>
                      </div>
                      <Badge variant="outline" className={item.prepared ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800"}>
                        {item.prepared ? "Prepared" : "Review needed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>My answer</Label>
                      <Textarea rows={5} value={item.answer} onChange={(event) => updateQa(item.id, "answer", event.target.value)} />
                    </div>
                    <div>
                      <Label>Evidence map</Label>
                      <Textarea rows={2} value={item.evidence} onChange={(event) => updateQa(item.id, "evidence", event.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="practice" className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Log a real practice session</CardTitle>
                  <CardDescription>
                    Choose any standard or custom pitch. A session only affects practice readiness after you enter an actual delivery time and confidence score.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:max-w-md">
                    <Label htmlFor="practice-pitch">Pitch version</Label>
                    <select
                      id="practice-pitch"
                      value={selectedPracticePitchId}
                      onChange={(event) => setSelectedPracticePitchId(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {pitchScripts.map((script) => (
                        <option key={script.id} value={script.id}>{script.title} ({formatDuration(script.targetSeconds)})</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={addPracticeSession}>
                    <Mic2 className="h-4 w-4" />
                    Add practice session
                  </Button>
                </CardContent>
              </Card>

              {practiceSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Clock3 className="mx-auto mb-3 h-8 w-8" />
                    No practice has been logged yet. Your preparation pack can still be complete without pretending a practice session occurred.
                  </CardContent>
                </Card>
              ) : (
                practiceSessions.map((session, index) => (
                  <Card key={session.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">Session {index + 1}: {session.pitchTitle}</CardTitle>
                          <CardDescription>Target {formatDuration(session.targetSeconds)}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setPracticeSessions((current) => current.filter((item) => item.id !== session.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={session.date} onChange={(event) => updatePractice(session.id, { date: event.target.value })} />
                        </div>
                        <div>
                          <Label>Actual time (seconds)</Label>
                          <Input type="number" min={0} value={session.actualSeconds || ""} onChange={(event) => updatePractice(session.id, { actualSeconds: Number(event.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label>Confidence (1-10)</Label>
                          <Input type="number" min={1} max={10} value={session.confidence || ""} onChange={(event) => updatePractice(session.id, { confidence: Math.min(10, Math.max(0, Number(event.target.value) || 0)) })} />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>What went well?</Label>
                          <Textarea rows={3} value={session.strengths} onChange={(event) => updatePractice(session.id, { strengths: event.target.value })} />
                        </div>
                        <div>
                          <Label>What will I improve?</Label>
                          <Textarea rows={3} value={session.improvements} onChange={(event) => updatePractice(session.id, { improvements: event.target.value })} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <Alert>
                <Mic2 className="h-4 w-4" />
                <AlertTitle>Self-confirm only after practising</AlertTitle>
                <AlertDescription>These checks improve the separate practice-readiness score. They are not automatically marked complete by the platform.</AlertDescription>
              </Alert>
              <div className="grid gap-3 md:grid-cols-2">
                {deliveryTips.map((tip) => (
                  <button
                    key={tip.id}
                    type="button"
                    onClick={() => toggleTip(tip.id)}
                    className={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left transition-colors ${tip.mastered ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20" : "border-border bg-card"}`}
                  >
                    {tip.mastered ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2" />}
                    <span className="text-sm leading-relaxed">{tip.label}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Application talking-point pack</CardTitle>
                  <CardDescription>These summaries come from account data. They help you stay consistent across the pitch, business plan and Q&A.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className={`rounded-lg border p-4 ${asset.ready ? "border-emerald-200" : "border-amber-200"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold">{asset.title}</div>
                        <Badge variant="outline" className={asset.ready ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800"}>
                          {asset.ready ? "Ready" : "Needs source data"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{asset.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Source: {asset.source}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className={preparationCompleteness === 100 ? "border-emerald-300" : "border-amber-300"}>
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {preparationCompleteness === 100 ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
                        <h2 className="text-lg font-semibold">{preparationCompleteness === 100 ? "Pitch preparation pack complete" : "Pitch preparation still has gaps"}</h2>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {preparationCompleteness === 100
                          ? "All standard pitch versions, the common Q&A bank and the application talking points are prepared. You can now focus on genuine practice and evidence consistency."
                          : "Review the amber items. Missing account data is deliberately left visible instead of being invented."}
                      </p>
                    </div>
                    <Button onClick={handleSave} disabled={!plan || isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save to my account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <MessageSquareText className="mr-1 h-3.5 w-3.5" />
            Generated preparation should be reviewed against genuine supporting evidence before an endorsement conversation.
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
