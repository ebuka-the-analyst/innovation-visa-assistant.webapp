import { z } from "zod";
import { ALL_TOOLS } from "./tools-data";

export const COMMERCIAL_CATALOG_SETTING_KEY = "commercial.plan-catalog.v1";

export const PLAN_IDS = ["free", "basic", "premium", "enterprise", "ultimate"] as const;
export type PlanId = (typeof PLAN_IDS)[number];
export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
  ultimate: 4,
};

export const UNAVAILABLE_LISTED_TOOL_IDS = [
  "10-year-vision",
  "ai-risk-mitigator",
  "ai-weakness-scanner",
  "document-autopilot",
  "ethics-auditor",
  "founder-evolution",
  "market-disruptor",
  "pivot-simulator",
  "revenue-innovator",
] as const;

export const UNLISTED_RUNNABLE_TOOL_IDS = [
  "advisory-board-profiles",
  "company-history",
  "compensation-planning",
  "cover-letter-builder",
  "culture-framework",
  "diversity-inclusion",
  "founder-bio",
  "leadership-development",
  "market-entry-plan",
  "min-investment-calc",
  "performance-management",
  "personal-statement",
  "product-overview",
  "quality-checklist",
  "retention-strategy",
  "role-designer",
  "skills-matrix",
  "succession-planning",
  "team-assessment",
  "team-bios",
] as const;

export const RUNNABLE_TOOL_IDS = [
  "points-calculator",
  "savings-validator",
  "fee-estimator",
  "funding-checker",
  "income-calculator",
  "compliance-checker",
  "market-analysis",
  "risk-analysis",
  "innovation-score",
  "budget-cost-analyzer",
  "business-plan",
  "company-formation",
  "criteria-scorer",
  "deep-xray",
  "eligibility-validator",
  "endorser-comparison",
  "milestone-timeline",
  "min-investment-calc",
  "red-flag-fixer",
  "rejection-analysis",
  "revenue-forecast",
  "rfe-defense",
  "salary-threshold",
  "settlement-planning",
  "site-strategy",
  "strength-scorer",
  "tax-compliance",
  "tax-planning",
  "tech-stack-assess",
  "timeline-tracker",
  "unit-economics",
  "usp-validator",
  "uvp-generator",
  "validation-report",
  "verification-checklist",
  "viability-checker",
  "visa-status-tracker",
  "weakness-analysis",
  "win-predictor",
  "year-tracker",
  "yoy-projector",
  "zero-approved",
  "zone-planning",
  "advisors-finder",
  "business-model-validator",
  "doc-organizer",
  "due-diligence",
  "data-security",
  "doc-verification",
  "endorsement-readiness",
  "evidence-collection",
  "evidence-validator",
  "financial-projections",
  "funding-strategy",
  "funding-sources",
  "financial-modeling",
  "growth-strategy",
  "gtm-plan",
  "growth-metrics",
  "geographic-expansion",
  "team-scaling",
  "hiring-plan",
  "hr-compliance",
  "org-chart",
  "innovation-validation",
  "ip-strategy",
  "ip-roadmap",
  "ip-audit",
  "visa-timeline",
  "jurisdiction-checker",
  "settlement-guide",
  "kpi-dashboard",
  "milestones-tracker",
  "performance-bench",
  "success-metrics",
  "legal-compliance",
  "lawyer-finder",
  "legal-templates",
  "regulatory-tracker",
  "market-gap",
  "market-research",
  "competitor-bench",
  "market-size",
  "cac-calculator",
  "narrative-builder",
  "pitch-deck",
  "exec-summary",
  "pitch-coach",
  "operations-plan",
  "org-designer",
  "process-docs",
  "supply-chain",
  "success-predictor",
  "contingency-plan",
  "roadmap-builder",
  "pmf-validator",
  "faq-generator",
  "rfe-qa",
  "interview-prep",
  "question-bank",
  "rebuttal-letter",
  "appeal-strategy",
  "scalability-roadmap",
  "scenario-planner",
  "team-assessment",
  "advisor-prep-guide",
  "advisory-board-builder",
  "breakeven-calculator",
  "app-req-checker",
  "advisory-board-profiles",
  "company-history",
  "compensation-planning",
  "compliance-xray",
  "cover-letter-builder",
  "culture-framework",
  "diversity-inclusion",
  "founder-bio",
  "leadership-development",
  "market-entry-plan",
  "performance-management",
  "personal-statement",
  "product-overview",
  "quality-checklist",
  "retention-strategy",
  "role-designer",
  "skills-matrix",
  "succession-planning",
  "team-bios",
  "traction-evidence",
  "founder-portfolio",
  "endorser-cover-letter",
  "commercial-validation",
  "oisc-compliance",
  "market-data-verifier",
  "mvp-demo-guide",
  "financial-resilience",
  "oracle-supervisor",
  "founder-autopilot",
  "neural-twin",
  "regulatory-copilot",
  "economic-impact",
  "knowledge-graph",
  "voice-builder",
  "ilr-tracker",
  "ai-network-builder",
  "ai-patent-generator",
  "ai-funding-negotiator",
] as const;
export type RunnableToolId = (typeof RUNNABLE_TOOL_IDS)[number];
const runnableToolIds = new Set<string>(RUNNABLE_TOOL_IDS);
const listedRunnableTools = ALL_TOOLS.filter((tool) => runnableToolIds.has(tool.id));

export interface ManagedToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  listed: boolean;
  available: true;
}

function titleCaseToolId(toolId: string): string {
  return toolId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const MANAGED_TOOL_DEFINITIONS: ManagedToolDefinition[] = [
  ...listedRunnableTools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    stage: tool.stage,
    listed: true,
    available: true as const,
  })),
  ...UNLISTED_RUNNABLE_TOOL_IDS.map((id) => ({
    id,
    name: titleCaseToolId(id),
    description: "Runnable legacy route not currently listed in the public Tools Hub.",
    category: "unlisted",
    stage: "unspecified",
    listed: false,
    available: true as const,
  })),
];

const plainText = (maximum: number) => z
  .string()
  .trim()
  .min(1)
  .max(maximum)
  .refine((value) => !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), "Plain text only");

const qualitativeFeature = plainText(120).refine(
  (value) => !(/\b\d+\s*(tools?|credits?|coins?|pages?)\b|\b\d+(?:\.\d+)?\s*%|£|\b(GBP|pounds?|pence|quid)\b|\/\s*(month|mo|year|yr|week|day|quarter)\b|\b(monthly|yearly|quarterly|weekly|daily|per\s+(month|year|plan|week|day|quarter)|one[- ]time|subscribe|subscription|recurring|renewals?|annually|annual|instalments?|installments?|billed|half[- ]price|discount(?:ed)?|percent(?:age)?|\d+(?:\.\d+)?\s*off|save\s+\d+|(all|every)\s+(tools?|features?)|(complete|full)\s+access\s+to\s+(all|every)\s+(tools?|features?)|unlimited\s+(tools?|features?|credits?|coins?|pages?))\b/i.test(value)),
  "Feature bullets cannot contain editable price, billing, tool-count, credit, coin, or page-count claims",
);

const commercialCopy = (maximum: number) => plainText(maximum).refine(
  (value) => !(/\b\d+\s*(tools?|credits?|coins?|pages?)\b|\b\d+(?:\.\d+)?\s*%|£|\b(GBP|pounds?|pence|quid)\b|\/\s*(month|mo|year|yr|week|day|quarter)\b|\b(monthly|yearly|quarterly|weekly|daily|per\s+(month|year|plan|week|day|quarter)|one[- ]time|subscribe|subscription|recurring|renewals?|annually|annual|instalments?|installments?|billed|half[- ]price|discount(?:ed)?|percent(?:age)?|\d+(?:\.\d+)?\s*off|save\s+\d+|(all|every)\s+(tools?|features?)|(complete|full)\s+access\s+to\s+(all|every)\s+(tools?|features?)|unlimited\s+(tools?|features?|credits?|coins?|pages?))\b/i.test(value)),
  "Marketing copy cannot contain price, billing, tool-count, credit, coin, or page-count claims",
);

export const commercialPlanSchema = z.object({
  id: z.enum(PLAN_IDS),
  displayName: commercialCopy(60),
  pricePence: z.number().int().min(0).max(1_000_000),
  currency: z.literal("GBP"),
  billingPeriod: z.literal("one_time"),
  description: commercialCopy(240),
  features: z.array(qualitativeFeature).min(1).max(12).superRefine((features, ctx) => {
    const normalized = features.map((feature) => feature.toLocaleLowerCase("en-GB"));
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Feature bullets must be unique" });
    }
  }),
  ctaLabel: commercialCopy(40),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  displayOrder: z.number().int().min(0).max(4),
}).strict().superRefine((plan, ctx) => {
  if (plan.id === "free" && plan.pricePence !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pricePence"], message: "The Free plan must cost £0" });
  }
  if (plan.id !== "free" && plan.pricePence < 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pricePence"], message: "Paid plans must cost between £1 and £10,000" });
  }
  if (
    plan.id !== "free" &&
    /(^|\s)free(?=\s|$|[!.,:;])|\bcomplimentary\b|\b(?:no|without)\s+(?:a\s+)?(?:costs?|charges?|fees?|payments?|paying)\b|\bzero[- ](?:cost|charge|fee)\b/i.test(
      `${plan.displayName} ${plan.description} ${plan.ctaLabel} ${plan.features.join(" ")}`,
    )
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["description"],
      message: "Paid-plan copy cannot describe the plan as free or without charge",
    });
  }
});

export type CommercialPlan = z.infer<typeof commercialPlanSchema>;

const minimumPlanByToolSchema = z.record(z.string(), z.enum(PLAN_IDS));

export const commercialCatalogSchema = z.object({
  revision: z.number().int().nonnegative(),
  plans: z.array(commercialPlanSchema).length(PLAN_IDS.length),
  minimumPlanByTool: minimumPlanByToolSchema,
  updatedAt: z.string().datetime().nullable().optional(),
  updatedBy: z.string().trim().min(1).max(320).nullable().optional(),
}).strict().superRefine((catalog, ctx) => {
  const planIds = catalog.plans.map((plan) => plan.id);
  for (const planId of PLAN_IDS) {
    if (planIds.filter((id) => id === planId).length !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["plans"], message: `Plan ${planId} must appear exactly once` });
    }
  }

  const displayOrders = catalog.plans.map((plan) => plan.displayOrder);
  if (new Set(displayOrders).size !== displayOrders.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["plans"], message: "Display order values must be unique" });
  }
  const displayNames = catalog.plans.map((plan) =>
    plan.displayName.trim().toLocaleLowerCase("en-GB"),
  );
  if (new Set(displayNames).size !== displayNames.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["plans"], message: "Plan display names must be unique" });
  }
  if (catalog.plans.find((plan) => plan.id === "free")?.publicationStatus !== "published") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["plans"], message: "The Free plan must remain published" });
  }
  if (!catalog.plans.some((plan) => plan.id !== "free" && plan.publicationStatus === "published")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["plans"], message: "At least one paid plan must be published" });
  }

  const expectedIds = new Set<string>(RUNNABLE_TOOL_IDS);
  const actualIds = Object.keys(catalog.minimumPlanByTool);
  for (const toolId of RUNNABLE_TOOL_IDS) {
    if (!Object.prototype.hasOwnProperty.call(catalog.minimumPlanByTool, toolId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["minimumPlanByTool", toolId], message: "A minimum plan is required for every runnable tool" });
    }
  }
  for (const toolId of actualIds) {
    if (!expectedIds.has(toolId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["minimumPlanByTool", toolId], message: "Unknown or unavailable tool ID" });
    }
  }

  const publishedRanks = catalog.plans
    .filter((plan) => plan.publicationStatus === "published")
    .map((plan) => PLAN_RANK[plan.id]);
  for (const [toolId, minimumPlanId] of Object.entries(catalog.minimumPlanByTool)) {
    if (!publishedRanks.some((rank) => rank >= PLAN_RANK[minimumPlanId])) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["minimumPlanByTool", toolId], message: "This tool has no published upgrade path" });
    }
  }
});

export type CommercialCatalog = z.infer<typeof commercialCatalogSchema>;

const fallbackMinimumPlanByTool: Record<RunnableToolId, PlanId> = {
  "points-calculator": "free",
  "savings-validator": "free",
  "fee-estimator": "free",
  "funding-checker": "free",
  "income-calculator": "premium",
  "compliance-checker": "basic",
  "market-analysis": "premium",
  "risk-analysis": "premium",
  "innovation-score": "premium",
  "budget-cost-analyzer": "premium",
  "business-plan": "basic",
  "company-formation": "free",
  "criteria-scorer": "premium",
  "deep-xray": "enterprise",
  "eligibility-validator": "free",
  "endorser-comparison": "basic",
  "milestone-timeline": "premium",
  "min-investment-calc": "basic",
  "red-flag-fixer": "enterprise",
  "rejection-analysis": "premium",
  "revenue-forecast": "premium",
  "rfe-defense": "premium",
  "salary-threshold": "premium",
  "settlement-planning": "premium",
  "site-strategy": "premium",
  "strength-scorer": "enterprise",
  "tax-compliance": "premium",
  "tax-planning": "premium",
  "tech-stack-assess": "premium",
  "timeline-tracker": "basic",
  "unit-economics": "premium",
  "usp-validator": "enterprise",
  "uvp-generator": "premium",
  "validation-report": "premium",
  "verification-checklist": "free",
  "viability-checker": "premium",
  "visa-status-tracker": "premium",
  "weakness-analysis": "enterprise",
  "win-predictor": "enterprise",
  "year-tracker": "premium",
  "yoy-projector": "premium",
  "zero-approved": "enterprise",
  "zone-planning": "premium",
  "advisors-finder": "basic",
  "business-model-validator": "premium",
  "doc-organizer": "free",
  "due-diligence": "enterprise",
  "data-security": "premium",
  "doc-verification": "premium",
  "endorsement-readiness": "premium",
  "evidence-collection": "basic",
  "evidence-validator": "enterprise",
  "financial-projections": "basic",
  "funding-strategy": "premium",
  "funding-sources": "enterprise",
  "financial-modeling": "enterprise",
  "growth-strategy": "premium",
  "gtm-plan": "premium",
  "growth-metrics": "premium",
  "geographic-expansion": "enterprise",
  "team-scaling": "premium",
  "hiring-plan": "premium",
  "hr-compliance": "premium",
  "org-chart": "premium",
  "innovation-validation": "enterprise",
  "ip-strategy": "enterprise",
  "ip-roadmap": "enterprise",
  "ip-audit": "enterprise",
  "visa-timeline": "free",
  "jurisdiction-checker": "free",
  "settlement-guide": "premium",
  "kpi-dashboard": "premium",
  "milestones-tracker": "premium",
  "performance-bench": "enterprise",
  "success-metrics": "premium",
  "legal-compliance": "premium",
  "lawyer-finder": "free",
  "legal-templates": "premium",
  "regulatory-tracker": "premium",
  "market-gap": "premium",
  "market-research": "premium",
  "competitor-bench": "premium",
  "market-size": "premium",
  "cac-calculator": "premium",
  "narrative-builder": "premium",
  "pitch-deck": "enterprise",
  "exec-summary": "premium",
  "pitch-coach": "enterprise",
  "operations-plan": "premium",
  "org-designer": "premium",
  "process-docs": "premium",
  "supply-chain": "enterprise",
  "success-predictor": "enterprise",
  "contingency-plan": "premium",
  "roadmap-builder": "premium",
  "pmf-validator": "premium",
  "faq-generator": "premium",
  "rfe-qa": "enterprise",
  "interview-prep": "premium",
  "question-bank": "enterprise",
  "rebuttal-letter": "enterprise",
  "appeal-strategy": "enterprise",
  "scalability-roadmap": "premium",
  "scenario-planner": "premium",
  "team-assessment": "free",
  "advisor-prep-guide": "premium",
  "advisory-board-builder": "premium",
  "breakeven-calculator": "premium",
  "app-req-checker": "free",
  "advisory-board-profiles": "free",
  "company-history": "free",
  "compensation-planning": "free",
  "compliance-xray": "enterprise",
  "cover-letter-builder": "free",
  "culture-framework": "free",
  "diversity-inclusion": "free",
  "founder-bio": "free",
  "leadership-development": "free",
  "market-entry-plan": "free",
  "performance-management": "free",
  "personal-statement": "free",
  "product-overview": "free",
  "quality-checklist": "free",
  "retention-strategy": "free",
  "role-designer": "free",
  "skills-matrix": "free",
  "succession-planning": "free",
  "team-bios": "free",
  "traction-evidence": "premium",
  "founder-portfolio": "premium",
  "endorser-cover-letter": "premium",
  "commercial-validation": "premium",
  "oisc-compliance": "premium",
  "market-data-verifier": "premium",
  "mvp-demo-guide": "premium",
  "financial-resilience": "premium",
  "oracle-supervisor": "ultimate",
  "founder-autopilot": "ultimate",
  "neural-twin": "enterprise",
  "regulatory-copilot": "enterprise",
  "economic-impact": "enterprise",
  "knowledge-graph": "premium",
  "voice-builder": "ultimate",
  "ilr-tracker": "premium",
  "ai-network-builder": "enterprise",
  "ai-patent-generator": "enterprise",
  "ai-funding-negotiator": "enterprise",
};

export const FALLBACK_COMMERCIAL_CATALOG: CommercialCatalog = {
  revision: 0,
  plans: [
    {
      id: "free",
      displayName: "Free Plan",
      pricePence: 0,
      currency: "GBP",
      billingPeriod: "one_time",
      description: "Start your Innovator Founder Visa journey",
      features: ["Basic visa guidance", "Essential compliance checklists", "Document organisation", "Community support"],
      ctaLabel: "Get Started",
      publicationStatus: "published",
      displayOrder: 0,
    },
    {
      id: "basic",
      displayName: "Basic Plan",
      pricePence: 900,
      currency: "GBP",
      billingPeriod: "one_time",
      description: "Perfect for straightforward businesses",
      features: ["Core business plan generation", "PDF download", "Standard business analysis", "Email support"],
      ctaLabel: "Get Started",
      publicationStatus: "published",
      displayOrder: 1,
    },
    {
      id: "premium",
      displayName: "Premium Plan",
      pricePence: 1900,
      currency: "GBP",
      billingPeriod: "one_time",
      description: "Most popular comprehensive coverage",
      features: ["Deeper innovation analysis", "Viability and financial analysis", "Scalability strategy", "Industry-specific frameworks"],
      ctaLabel: "Start Premium",
      publicationStatus: "published",
      displayOrder: 2,
    },
    {
      id: "enterprise",
      displayName: "Enterprise Plan",
      pricePence: 3500,
      currency: "GBP",
      billingPeriod: "one_time",
      description: "Maximum detail for complex ventures",
      features: ["Full innovation deep-dive", "Complete viability assessment", "Multi-market scalability strategy", "Advanced business modelling"],
      ctaLabel: "Go Enterprise",
      publicationStatus: "published",
      displayOrder: 3,
    },
    {
      id: "ultimate",
      displayName: "Ultimate Plan",
      pricePence: 4900,
      currency: "GBP",
      billingPeriod: "one_time",
      description: "Maximum support for serious founders",
      features: ["Priority support and live chat", "Expert-level endorsement preparation", "Multiple business angles", "Personal strategy support"],
      ctaLabel: "Choose Ultimate",
      publicationStatus: "published",
      displayOrder: 4,
    },
  ],
  minimumPlanByTool: fallbackMinimumPlanByTool,
  updatedAt: null,
  updatedBy: null,
};

export interface PublicCommercialCatalog {
  revision: number;
  source: "database" | "fallback";
  plans: CommercialPlan[];
  toolCounts: Record<PlanId, number>;
}

export function getPlanById(catalog: CommercialCatalog, planId: string): CommercialPlan | undefined {
  return catalog.plans.find((plan) => plan.id === planId);
}

export function getMinimumPlanForTool(catalog: CommercialCatalog, toolId: string): PlanId | undefined {
  return Object.prototype.hasOwnProperty.call(catalog.minimumPlanByTool, toolId)
    ? catalog.minimumPlanByTool[toolId]
    : undefined;
}

export function hasToolAccess(catalog: CommercialCatalog, userPlan: string, toolId: string): boolean {
  if (!PLAN_IDS.includes(userPlan as PlanId)) return false;
  const minimumPlan = getMinimumPlanForTool(catalog, toolId);
  return Boolean(minimumPlan && PLAN_RANK[userPlan as PlanId] >= PLAN_RANK[minimumPlan]);
}

export function getToolCounts(catalog: CommercialCatalog): Record<PlanId, number> {
  const counts = Object.fromEntries(PLAN_IDS.map((planId) => [planId, 0])) as Record<PlanId, number>;
  for (const minimumPlanId of Object.values(catalog.minimumPlanByTool)) {
    for (const planId of PLAN_IDS) {
      if (PLAN_RANK[planId] >= PLAN_RANK[minimumPlanId]) counts[planId] += 1;
    }
  }
  return counts;
}

export function toPublicCommercialCatalog(
  catalog: CommercialCatalog,
  source: PublicCommercialCatalog["source"],
): PublicCommercialCatalog {
  return {
    revision: catalog.revision,
    source,
    plans: catalog.plans
      .filter((plan) => plan.publicationStatus === "published")
      .sort((a, b) => a.displayOrder - b.displayOrder),
    toolCounts: getToolCounts(catalog),
  };
}

export function formatPrice(pricePence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pricePence % 100 === 0 ? 0 : 2,
  }).format(pricePence / 100);
}
