import type { BusinessPlan } from "@shared/schema";
import type { ChartDataPayload } from "./chartGenerator";

export interface BusinessPlanQualityReport {
  overallScore: number;
  blockers: string[];
  warnings: string[];
  strengths: string[];
  criteria: {
    innovation: number;
    viability: number;
    scalability: number;
    evidence: number;
    financials: number;
    charts: number;
  };
}

const FORBIDDEN_APPROVAL_CLAIMS = [
  /\b100%\s+approval\b/gi,
  /\b95\s*-\s*100%\s+approval\b/gi,
  /\bguaranteed\s+(visa\s+)?approval\b/gi,
  /\bapproval\s+guarantee\b/gi,
  /\birrefutable\b/gi,
  /\bwill\s+be\s+approved\b/gi,
];

const WEAK_EVIDENCE_PATTERNS = [
  /\bpatent\s+(GB|US|EP)\d+/i,
  /\bJournal of\b/i,
  /\baccording to research\b/i,
  /\bstudies show\b/i,
  /\bindustry reports show\b/i,
];

function hasMeaningfulText(value: unknown): boolean {
  return typeof value === "string" && value.trim().replace(/n\/a|none|unknown/gi, "").length >= 25;
}

function scoreFromChecks(checks: boolean[]): number {
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / Math.max(checks.length, 1)) * 10);
}

export function sanitizeBusinessPlanClaims(content: string): string {
  let sanitized = content;
  for (const pattern of FORBIDDEN_APPROVAL_CLAIMS) {
    sanitized = sanitized.replace(pattern, "strong endorser-readiness");
  }
  return sanitized;
}

export function assessBusinessPlanQuality(
  plan: BusinessPlan,
  content: string,
  chartData: ChartDataPayload | null,
): BusinessPlanQualityReport {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  const innovation = scoreFromChecks([
    hasMeaningfulText(plan.uniqueness),
    hasMeaningfulText(plan.techStack) || hasMeaningfulText(plan.aiMethodology),
    hasMeaningfulText(plan.patentStatus),
    content.toLowerCase().includes("competitive advantage"),
  ]);

  const viability = scoreFromChecks([
    hasMeaningfulText(plan.problem),
    hasMeaningfulText(plan.customerInterviews) || hasMeaningfulText(plan.tractionEvidence),
    hasMeaningfulText(plan.willingnessToPay),
    Number(plan.customerAcquisitionCost) > 0 && Number(plan.lifetimeValue) > 0,
  ]);

  const scalability = scoreFromChecks([
    Number(plan.jobCreation) > 0,
    hasMeaningfulText(plan.hiringPlan),
    hasMeaningfulText(plan.expansion) || hasMeaningfulText(plan.internationalPlan),
    hasMeaningfulText(plan.specificRegions),
  ]);

  const financials = scoreFromChecks([
    Number(plan.funding) > 0,
    hasMeaningfulText(plan.monthlyProjections),
    hasMeaningfulText(plan.revenue),
    hasMeaningfulText(plan.detailedCosts),
  ]);

  const weakEvidenceMatches = WEAK_EVIDENCE_PATTERNS.filter((pattern) => pattern.test(content));
  const evidence = scoreFromChecks([
    hasMeaningfulText(plan.tractionEvidence),
    hasMeaningfulText(plan.lettersOfIntent),
    hasMeaningfulText(plan.customerInterviews),
    weakEvidenceMatches.length === 0,
  ]);

  const chartWarnings = chartData?.qualityWarnings || [];
  const charts = scoreFromChecks([
    Boolean(chartData),
    chartWarnings.length <= 4,
    Boolean(chartData?.financialProjections?.every((row) => row.revenue >= 0 && row.costs >= 0)),
    Boolean(chartData?.marketSize?.every((row) => row.value > 0)),
  ]);

  if (FORBIDDEN_APPROVAL_CLAIMS.some((pattern) => pattern.test(content))) {
    blockers.push("Plan contained prohibited approval-guarantee wording before sanitisation.");
  }
  if (weakEvidenceMatches.length > 0) {
    warnings.push("Some citations, patents, or research claims may need source verification before submission.");
  }
  if (chartWarnings.length > 0) {
    warnings.push(...chartWarnings.slice(0, 8));
  }
  if (financials < 7) {
    blockers.push("Financial model needs stronger source data before this can be considered submission-ready.");
  }
  if (evidence < 7) {
    warnings.push("Evidence base should be strengthened with named customer validation, LOIs, pilots, or dated research sources.");
  }
  if (innovation >= 8) strengths.push("Innovation narrative contains several endorser-relevant differentiators.");
  if (viability >= 8) strengths.push("Viability narrative includes meaningful customer or commercial validation.");
  if (scalability >= 8) strengths.push("Scalability narrative includes hiring, geography, and growth-path evidence.");

  const criteria = { innovation, viability, scalability, evidence, financials, charts };
  const overallScore = Math.round(
    (innovation + viability + scalability + evidence + financials + charts) / 6,
  );

  return {
    overallScore,
    blockers,
    warnings: Array.from(new Set(warnings)),
    strengths,
    criteria,
  };
}

export function formatQualityReportMarkdown(report: BusinessPlanQualityReport): string {
  const blockerText = report.blockers.length
    ? report.blockers.map((item) => `- ${item}`).join("\n")
    : "- No critical blockers detected by the automated benchmark.";
  const warningText = report.warnings.length
    ? report.warnings.map((item) => `- ${item}`).join("\n")
    : "- No major evidence or chart warnings detected.";
  const strengthText = report.strengths.length
    ? report.strengths.map((item) => `- ${item}`).join("\n")
    : "- Strengths should be confirmed after human review of evidence and supporting documents.";

  return `## ENDORSER READINESS BENCHMARK

**Automated benchmark score:** ${report.overallScore}/10

| Criterion | Score |
| --- | ---: |
| Innovation | ${report.criteria.innovation}/10 |
| Viability | ${report.criteria.viability}/10 |
| Scalability | ${report.criteria.scalability}/10 |
| Evidence quality | ${report.criteria.evidence}/10 |
| Financial defensibility | ${report.criteria.financials}/10 |
| Chart/data consistency | ${report.criteria.charts}/10 |

### Strengths detected
${strengthText}

### Must-review items before submission
${blockerText}

### Evidence and chart warnings
${warningText}

**Important:** This benchmark supports preparation quality only. It does not guarantee endorsement or visa approval.`;
}
