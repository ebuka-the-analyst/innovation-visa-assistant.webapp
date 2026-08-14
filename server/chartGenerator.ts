import type { BusinessPlan } from "@shared/schema";

export interface ChartDataPayload {
  qualityWarnings?: string[];
  dataSourceNotes?: string[];
  financialProjections: {
    year: string;
    revenue: number;
    costs: number;
    profit: number;
  }[];
  marketSize: {
    label: string;
    value: number;
    description: string;
  }[];
  timeline: {
    phase: string;
    startMonth: number;
    duration: number;
    tasks: string[];
  }[];
  riskMatrix: {
    risk: string;
    likelihood: number;
    impact: number;
    category: string;
  }[];
  competitorComparison: {
    name: string;
    innovation: number;
    price: number;
    features: number;
    support: number;
    market: number;
  }[];
  kpiMetrics: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    color: string;
  }[];
  fundingAllocation: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  revenueStreams: {
    stream: string;
    year1: number;
    year2: number;
    year3: number;
  }[];
  unitEconomics: {
    metric: string;
    value: number;
    benchmark: number;
  }[];
  hiringTimeline: {
    role: string;
    quarter: string;
    count: number;
  }[];
  techStack: {
    layer: string;
    technologies: string[];
  }[];
  customerJourney: {
    stage: string;
    conversion: number;
    description: string;
  }[];
  goToMarketChannels: {
    channel: string;
    budget: number;
    expectedROI: number;
  }[];
  milestones: {
    milestone: string;
    month: number;
    status: 'completed' | 'in_progress' | 'planned';
  }[];
  complianceRoadmap: {
    requirement: string;
    deadline: string;
    status: 'done' | 'pending' | 'in_progress';
    priority: 'high' | 'medium' | 'low';
  }[];
  growthMetrics: {
    month: string;
    users: number;
    revenue: number;
    mrr: number;
  }[];
  pricingTiers: {
    tier: string;
    price: number;
    features: number;
    target: string;
  }[];
  swotAnalysis: {
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
    items: string[];
  }[];
  customerPersonas: {
    name: string;
    role: string;
    age: string;
    painPoints: string[];
    goals: string[];
  }[];
  marketingChannels: {
    channel: string;
    budget: number;
    expectedLeads: number;
    cac: number;
  }[];
  processFlow: {
    step: number;
    title: string;
    description: string;
  }[];
  customerSilhouettes: {
    segment: string;
    percentage: number;
    color: string;
  }[];
  valueProposition: {
    quadrant: number;
    title: string;
    points: string[];
  }[];
  inspirationalQuote: {
    quote: string;
    author: string;
    role: string;
  };
  researchGrid: {
    category: string;
    findings: string[];
    color: string;
  }[];
  businessJourney: {
    phase: string;
    activities: string[];
    icon: string;
  }[];
}

const STRICT_CHART_SOURCE_NOTE = "Charts are generated only from explicit plan inputs or the final generated business plan text.";
const CHART_EVIDENCE_NOTES = {
  financial: "Financial projection chart is based on explicit revenue, cost, and profit figures found in the final business plan text.",
  market: "Market-size chart is based on explicit TAM, SAM, or SOM figures found in the final business plan text.",
  kpi: "KPI chart is based on explicit plan fields or explicit figures found in the final business plan text.",
  milestones: "Milestone chart is based on explicit month-labelled milestones found in the final business plan text.",
  timeline: "Timeline chart is based on explicit month-labelled roadmap or implementation milestones found in the final business plan text.",
  swot: "SWOT chart is based on the generated SWOT section text.",
  marketing_channels: "Marketing channel chart is based on explicit channel budget, lead, and CAC figures found in the final business plan text.",
};

export function generateChartData(plan: BusinessPlan, generatedContent: string = ""): ChartDataPayload {
  const qualityWarnings: string[] = [];
  const dataSourceNotes: string[] = [];
  const parsedRevenues = parseThreeYearRevenue(plan.revenue || plan.monthlyProjections || "");
  const finalText = generatedContent || "";

  dataSourceNotes.push(STRICT_CHART_SOURCE_NOTE);

  const financialProjections = extractFinancialProjectionsFromContent(finalText);
  if (financialProjections.length >= 3) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.financial);
  }

  const marketSize = extractMarketSizeFromContent(finalText);
  if (marketSize.length >= 2) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.market);
  }

  const kpiMetrics = buildEvidenceBackedKpis(plan, parsedRevenues);
  if (kpiMetrics.length > 0) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.kpi);
  }

  const milestones = extractMilestonesFromContent(finalText);
  if (milestones.length > 0) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.milestones);
  }

  const timeline = extractTimelineFromMilestones(milestones);
  if (timeline.length > 0) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.timeline);
  }

  const swotAnalysis = extractSWOTFromContent(finalText);
  if (swotAnalysis.some((item) => item.items.length > 0)) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.swot);
  }

  const marketingChannels = extractMarketingChannelsFromContent(finalText);
  if (marketingChannels.length > 0) {
    dataSourceNotes.push(CHART_EVIDENCE_NOTES.marketing_channels);
  }

  return {
    qualityWarnings: Array.from(new Set([
      ...qualityWarnings,
      "Assumption-based visual charts are disabled; unsupported charts are skipped instead of filled with default data.",
    ])),
    dataSourceNotes: Array.from(new Set(dataSourceNotes)),
    financialProjections,
    marketSize,
    timeline,
    riskMatrix: [],
    competitorComparison: [],
    kpiMetrics,
    fundingAllocation: [],
    revenueStreams: [],
    unitEconomics: [],
    hiringTimeline: [],
    techStack: [],
    customerJourney: [],
    goToMarketChannels: [],
    milestones,
    complianceRoadmap: [],
    growthMetrics: [],
    pricingTiers: [],
    swotAnalysis,
    customerPersonas: [],
    marketingChannels,
    processFlow: [],
    customerSilhouettes: [],
    valueProposition: [],
    inspirationalQuote: { quote: "", author: "", role: "" },
    researchGrid: [],
    businessJourney: [],
  };

}

function buildEvidenceBackedKpis(
  plan: BusinessPlan,
  parsedRevenues: [number, number, number] | null,
): ChartDataPayload["kpiMetrics"] {
  const kpis: ChartDataPayload["kpiMetrics"] = [];

  if (typeof plan.jobCreation === "number" && plan.jobCreation > 0) {
    kpis.push({ label: "Jobs Created", value: `${plan.jobCreation}`, trend: "up", color: "#8B5CF6" });
  }

  if (typeof plan.funding === "number" && plan.funding > 0) {
    kpis.push({ label: "Funding Required", value: formatPounds(plan.funding), trend: "stable", color: "#10B981" });
  }

  if (parsedRevenues) {
    kpis.push({ label: "Year 3 Revenue", value: formatPounds(parsedRevenues[2]), trend: "up", color: "#3B82F6" });
  }

  if (plan.customerAcquisitionCost && plan.lifetimeValue) {
    kpis.push({
      label: "LTV/CAC Ratio",
      value: `${(plan.lifetimeValue / plan.customerAcquisitionCost).toFixed(1)}x`,
      trend: "up",
      color: "#F59E0B",
    });
  }

  return kpis;
}

function formatPounds(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `£${Math.round(value / 1_000)}K`;
  return `£${value}`;
}

function extractFinancialProjectionsFromContent(content: string): ChartDataPayload["financialProjections"] {
  const section = extractSection(content, /financial|revenue|projection|forecast/i) || content;
  const revenue = extractThreeYearMetric(section, /revenue|sales|turnover/i);
  const costs = extractThreeYearMetric(section, /costs?|expenses?|expenditure|operating costs?/i);
  const profit = extractThreeYearMetric(section, /profit|net income|surplus|ebitda/i);

  if (!revenue || !costs) return [];

  return revenue.map((revenueValue, index) => {
    const costValue = costs[index] || 0;
    const explicitProfit = profit?.[index];
    return {
      year: `Year ${index + 1}`,
      revenue: revenueValue,
      costs: costValue,
      profit: explicitProfit !== undefined ? explicitProfit : revenueValue - costValue,
    };
  });
}

function extractThreeYearMetric(content: string, labelPattern: RegExp): [number, number, number] | null {
  const lines = content.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!labelPattern.test(line)) continue;
    const values = extractCurrencyValues(line);
    if (values.length >= 3) return [values[0], values[1], values[2]];
  }
  return null;
}

function extractCurrencyValues(text: string): number[] {
  const values: number[] = [];
  const currencyPattern = /(?:£|Â£|Ã‚Â£)\s*([\d,.]+)\s*(k|m|million|thousand)?/gi;
  let match: RegExpExecArray | null;
  while ((match = currencyPattern.exec(text)) !== null) {
    const value = normaliseCurrencyNumber(match[1], match[2]);
    if (value > 0) values.push(value);
  }
  return values;
}

function extractMarketSizeFromContent(content: string): ChartDataPayload["marketSize"] {
  const section = extractSection(content, /market/i);
  if (!section) return [];

  const rows: ChartDataPayload["marketSize"] = [];
  const definitions: Array<{ label: string; pattern: RegExp; description: string }> = [
    { label: "TAM", pattern: /\b(TAM|total addressable market)\b/i, description: "Total Addressable Market" },
    { label: "SAM", pattern: /\b(SAM|serviceable available market)\b/i, description: "Serviceable Available Market" },
    { label: "SOM", pattern: /\b(SOM|serviceable obtainable market)\b/i, description: "Serviceable Obtainable Market" },
  ];

  for (const rawLine of section.split("\n")) {
    const line = rawLine.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const value = extractCurrencyValues(line)[0];
    if (!value) continue;
    const definition = definitions.find((item) => item.pattern.test(line));
    if (!definition) continue;
    rows.push({
      label: definition.label,
      value: Math.max(1, Math.round(value / 1_000_000)),
      description: `${definition.description} (GBP millions)`,
    });
  }

  return uniqueByLabel(rows, (item) => item.label).slice(0, 3);
}

function extractSWOTFromContent(content: string): ChartDataPayload["swotAnalysis"] {
  const section = extractSection(content, /swot/i);
  if (!section) return [];

  const categories: ChartDataPayload["swotAnalysis"] = [
    { category: "strengths", items: [] },
    { category: "weaknesses", items: [] },
    { category: "opportunities", items: [] },
    { category: "threats", items: [] },
  ];
  let current: ChartDataPayload["swotAnalysis"][number] | null = null;

  for (const rawLine of section.split("\n")) {
    const line = rawLine.trim();
    const category = categories.find((item) => new RegExp(item.category, "i").test(line));
    if (category && /^#{1,4}\s|\*\*|:/.test(line)) {
      current = category;
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet && current) {
      current.items.push(cleanChartLabel(bullet[1]));
    }
  }

  return categories.filter((item) => item.items.length > 0);
}

function extractMilestonesFromContent(content: string): ChartDataPayload["milestones"] {
  const section = extractSection(content, /milestone|roadmap|timeline|implementation/i);
  if (!section) return [];

  const milestones: ChartDataPayload["milestones"] = [];
  const monthPattern = /\b(?:M|month)\s*(\d{1,2})\b/i;

  for (const rawLine of section.split("\n")) {
    const line = rawLine.trim();
    const monthMatch = line.match(monthPattern);
    if (!monthMatch) continue;

    const month = Number(monthMatch[1]);
    const label = cleanChartLabel(
      line
        .replace(/^[-*•]\s+/, "")
        .replace(/\|/g, " ")
        .replace(monthPattern, "")
        .replace(/[:–—-]+/g, " ")
        .trim(),
    );

    if (month > 0 && label.length > 2) {
      milestones.push({ milestone: label.slice(0, 36), month, status: "planned" });
    }
  }

  return uniqueByLabel(milestones, (item) => `${item.month}:${item.milestone}`).slice(0, 8);
}

function extractTimelineFromContent(content: string): ChartDataPayload["timeline"] {
  return extractTimelineFromMilestones(extractMilestonesFromContent(content));
}

function extractTimelineFromMilestones(milestones: ChartDataPayload["milestones"]): ChartDataPayload["timeline"] {
  if (milestones.length < 2) return [];

  return milestones.slice(0, 6).map((item, index, items) => {
    const nextMonth = items[index + 1]?.month;
    const duration = nextMonth && nextMonth > item.month ? nextMonth - item.month : 3;
    return {
      phase: item.milestone.slice(0, 24),
      startMonth: item.month,
      duration,
      tasks: [],
    };
  });
}

function extractMarketingChannelsFromContent(content: string): ChartDataPayload["marketingChannels"] {
  const section = extractSection(content, /marketing|go-to-market|channel/i);
  if (!section) return [];

  const rows: ChartDataPayload["marketingChannels"] = [];
  const currencyPattern = /(?:£|Â£|Ã‚Â£)\s*([\d,.]+)\s*(k|m|million|thousand)?/i;
  const leadsPattern = /([\d,.]+)\s*(?:leads|lead|customers|users)/i;
  const cacPattern = /CAC\s*:?\s*(?:£|Â£|Ã‚Â£)?\s*([\d,.]+)\s*(k|m|million|thousand)?/i;

  for (const rawLine of section.split("\n")) {
    const line = rawLine.trim();
    if (!line || /allocation|performance|budget/i.test(line) && !currencyPattern.test(line)) continue;

    const budgetMatch = line.match(currencyPattern);
    const leadsMatch = line.match(leadsPattern);
    const cacMatch = line.match(cacPattern);
    if (!budgetMatch || !leadsMatch || !cacMatch) continue;

    const channel = cleanChartLabel(line.split("|")[0].replace(/^[-*•]\s+/, "").replace(/[:–—-].*$/, ""));
    const budget = normaliseCurrencyNumber(budgetMatch[1], budgetMatch[2]);
    const expectedLeads = Math.round(Number(leadsMatch[1].replace(/,/g, "")));
    const cac = normaliseCurrencyNumber(cacMatch[1], cacMatch[2]);

    if (channel.length > 1 && budget > 0 && expectedLeads > 0 && cac > 0) {
      rows.push({ channel: channel.slice(0, 28), budget, expectedLeads, cac });
    }
  }

  return uniqueByLabel(rows, (item) => item.channel).slice(0, 6);
}

function extractSection(content: string, headingPattern: RegExp): string {
  const lines = content.split("\n");
  let collecting = false;
  const captured: string[] = [];

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (collecting) break;
      collecting = headingPattern.test(line);
      continue;
    }
    if (collecting) captured.push(line);
  }

  return captured.join("\n").trim();
}

function cleanChartLabel(value: string): string {
  return value.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function uniqueByLabel<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseThreeYearRevenue(text: string): [number, number, number] | null {
  const matches: RegExpExecArray[] = [];
  const revenuePattern = /(?:year|yr|y)\s*([123])[^£\d]{0,20}£?\s*([\d,.]+)\s*(k|m|million|thousand)?/gi;
  let match: RegExpExecArray | null;
  while ((match = revenuePattern.exec(text)) !== null) {
    matches.push(match);
  }

  const values = matches
    .map((item) => ({
      year: Number(item[1]),
      value: normaliseCurrencyNumber(item[2], item[3]),
    }))
    .filter((entry) => entry.year >= 1 && entry.year <= 3 && entry.value > 0);

  const byYear = new Map<number, number>();
  for (const entry of values) {
    if (!byYear.has(entry.year)) byYear.set(entry.year, entry.value);
  }

  if (byYear.has(1) && byYear.has(2) && byYear.has(3)) {
    return [byYear.get(1)!, byYear.get(2)!, byYear.get(3)!];
  }

  return null;
}

function normaliseCurrencyNumber(value: string, unit?: string): number {
  const base = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(base)) return 0;
  const cleanUnit = (unit || "").toLowerCase();
  if (cleanUnit === "m" || cleanUnit === "million") return Math.round(base * 1_000_000);
  if (cleanUnit === "k" || cleanUnit === "thousand") return Math.round(base * 1_000);
  return Math.round(base);
}

function buildRevenueStreams(
  plan: BusinessPlan,
  year1Revenue: number,
  year2Revenue: number,
  year3Revenue: number,
  qualityWarnings: string[],
): ChartDataPayload["revenueStreams"] {
  const revenueText = `${plan.revenue || ""} ${(plan as any).businessModel || ""} ${plan.industry || ""}`.toLowerCase();
  const isSubscription = /subscription|saas|monthly|annual|licen[cs]e/.test(revenueText);
  const isTransactional = /transaction|commission|marketplace|fee per|usage/.test(revenueText);
  const isProduct = /manufactur|product|hardware|retail|wholesale|unit sales|equipment|material/.test(revenueText);

  if (!isSubscription && !isTransactional && !isProduct) {
    qualityWarnings.push("Revenue-stream chart uses generic revenue buckets because the revenue model was not specific enough to classify.");
    return [
      { stream: "Core Sales", year1: Math.round(year1Revenue * 0.7), year2: Math.round(year2Revenue * 0.65), year3: Math.round(year3Revenue * 0.6) },
      { stream: "Services", year1: Math.round(year1Revenue * 0.2), year2: Math.round(year2Revenue * 0.25), year3: Math.round(year3Revenue * 0.3) },
      { stream: "Partnerships", year1: Math.round(year1Revenue * 0.1), year2: Math.round(year2Revenue * 0.1), year3: Math.round(year3Revenue * 0.1) },
    ];
  }

  if (isProduct) {
    return [
      { stream: "Product Sales", year1: Math.round(year1Revenue * 0.75), year2: Math.round(year2Revenue * 0.7), year3: Math.round(year3Revenue * 0.65) },
      { stream: "B2B Contracts", year1: Math.round(year1Revenue * 0.2), year2: Math.round(year2Revenue * 0.25), year3: Math.round(year3Revenue * 0.3) },
      { stream: "Services & Support", year1: Math.round(year1Revenue * 0.05), year2: Math.round(year2Revenue * 0.05), year3: Math.round(year3Revenue * 0.05) },
    ];
  }

  return [
    { stream: isSubscription ? "Subscriptions" : "Core Fees", year1: Math.round(year1Revenue * 0.6), year2: Math.round(year2Revenue * 0.55), year3: Math.round(year3Revenue * 0.5) },
    { stream: isTransactional ? "Transaction Fees" : "Usage Fees", year1: Math.round(year1Revenue * 0.25), year2: Math.round(year2Revenue * 0.3), year3: Math.round(year3Revenue * 0.35) },
    { stream: "Enterprise / B2B", year1: Math.round(year1Revenue * 0.15), year2: Math.round(year2Revenue * 0.15), year3: Math.round(year3Revenue * 0.15) },
  ];
}

function extractCompetitors(competitorsText: string): string[] {
  const competitors: string[] = [];
  
  const lines = competitorsText.split(/[,;\n]+/);
  for (const line of lines) {
    const cleaned = line.trim().replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '');
    if (cleaned.length > 0 && cleaned.length < 50) {
      const firstWord = cleaned.split(/[:\-–]/)[0].trim();
      if (firstWord.length > 0) {
        competitors.push(firstWord);
      }
    }
    if (competitors.length >= 5) break;
  }
  
  if (competitors.length === 0) {
    return ["Competitor A", "Competitor B", "Competitor C", "Competitor D"];
  }
  
  return competitors;
}

export type ChartType = 'financial' | 'market' | 'risk' | 'competitor' | 'kpi' | 'funding' | 'revenue_streams' | 'unit_economics' | 'hiring' | 'tech_stack' | 'customer_journey' | 'gtm_channels' | 'milestones' | 'compliance' | 'growth' | 'pricing' | 'timeline' | 'swot' | 'customer_personas' | 'marketing_channels' | 'process_flow' | 'customer_silhouettes' | 'value_proposition' | 'inspirational_quote' | 'research_grid' | 'business_journey';

export const SECTION_CHART_MAP: Record<string, ChartType[]> = {
  "Executive Summary": ["kpi", "process_flow"],
  "Business Overview": ["funding", "value_proposition"],
  "Problem & Solution": ["value_proposition"],
  "Innovation & Technology": ["tech_stack"],
  "Market Analysis": ["market", "research_grid"],
  "Market Size": ["market", "customer_silhouettes"],
  "Target Market": ["customer_journey", "customer_silhouettes"],
  "Competitive Analysis": ["competitor"],
  "Competition": ["competitor"],
  "Competitive Landscape": ["competitor"],
  "Business Model": ["pricing", "revenue_streams"],
  "Revenue Model": ["revenue_streams", "pricing"],
  "Financial Projections": ["financial", "unit_economics"],
  "Financial Plan": ["financial", "unit_economics"],
  "Financials": ["financial"],
  "Go-to-Market Strategy": ["gtm_channels", "process_flow"],
  "Marketing Strategy": ["gtm_channels", "marketing_channels"],
  "Growth Strategy": ["growth", "business_journey"],
  "Team & Hiring": ["hiring"],
  "Team": ["hiring", "inspirational_quote"],
  "Hiring Plan": ["hiring"],
  "Risk Assessment": ["risk"],
  "Risk Analysis": ["risk"],
  "Risks": ["risk"],
  "Regulatory Compliance": ["compliance"],
  "Compliance": ["compliance"],
  "Milestones": ["milestones", "timeline", "business_journey"],
  "Implementation Timeline": ["timeline", "milestones"],
  "Roadmap": ["timeline", "business_journey"],
  "Funding Requirements": ["funding"],
  "Use of Funds": ["funding"],
  "SWOT Analysis": ["swot"],
  "SWOT": ["swot"],
  "Customer Analysis": ["customer_personas", "customer_journey", "customer_silhouettes"],
  "Customer Personas": ["customer_personas", "customer_silhouettes"],
  "Tailored Marketing Plan": ["marketing_channels", "gtm_channels"],
  "Marketing Plan": ["marketing_channels", "gtm_channels"],
  "Products & Services": ["value_proposition"],
  "What We Offer": ["value_proposition"],
  "About the Founder": ["inspirational_quote"],
  "Founder Background": ["inspirational_quote"],
  "All About You": ["inspirational_quote"],
  "Market Research": ["research_grid", "market"],
  "Do You Know What It's Like Out There": ["research_grid"],
  "The Market": ["customer_silhouettes", "market"],
  "Who Are Your Customers": ["customer_silhouettes", "customer_personas"],
  "Business Journey": ["business_journey", "timeline"],
  "How It Works": ["process_flow"],
  "Our Process": ["process_flow"],
  "The Quick Pitch": ["process_flow", "kpi"],
  "Elevator Pitch": ["process_flow"],
};

export function chartHasEvidence(type: ChartType, data: ChartDataPayload): boolean {
  const hasStrictEvidencePolicy = data.dataSourceNotes?.includes(STRICT_CHART_SOURCE_NOTE) === true;
  if (!hasStrictEvidencePolicy) return false;
  const hasEvidenceNote = (note: string) => data.dataSourceNotes?.includes(note) === true;

  switch (type) {
    case 'financial':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.financial) && data.financialProjections.length >= 3;
    case 'market':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.market) && data.marketSize.length >= 2;
    case 'risk':
      return false;
    case 'competitor':
      return false;
    case 'kpi':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.kpi) && data.kpiMetrics.length > 0;
    case 'funding':
      return false;
    case 'revenue_streams':
      return false;
    case 'unit_economics':
      return false;
    case 'hiring':
      return false;
    case 'tech_stack':
      return false;
    case 'customer_journey':
      return false;
    case 'gtm_channels':
      return false;
    case 'milestones':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.milestones) && data.milestones.length > 0;
    case 'compliance':
      return false;
    case 'growth':
      return false;
    case 'pricing':
      return false;
    case 'timeline':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.timeline) && data.timeline.length > 0;
    case 'swot':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.swot) && data.swotAnalysis.some((item) => item.items.length > 0);
    case 'customer_personas':
      return false;
    case 'marketing_channels':
      return hasEvidenceNote(CHART_EVIDENCE_NOTES.marketing_channels) && data.marketingChannels.length > 0;
    case 'process_flow':
      return false;
    case 'customer_silhouettes':
      return false;
    case 'value_proposition':
      return false;
    case 'inspirational_quote':
      return false;
    case 'research_grid':
      return false;
    case 'business_journey':
      return false;
    default:
      return false;
  }
}

export function generateSVGChart(type: ChartType, data: ChartDataPayload): string {
  if (!chartHasEvidence(type, data)) return '';

  switch (type) {
    case 'financial':
      return generateFinancialChart(data.financialProjections);
    case 'market':
      return generateMarketChart(data.marketSize);
    case 'risk':
      return generateRiskMatrix(data.riskMatrix);
    case 'competitor':
      return generateCompetitorChart(data.competitorComparison);
    case 'kpi':
      return generateKPIChart(data.kpiMetrics);
    case 'funding':
      return generateFundingChart(data.fundingAllocation);
    case 'revenue_streams':
      return generateRevenueStreamsChart(data.revenueStreams);
    case 'unit_economics':
      return generateUnitEconomicsChart(data.unitEconomics);
    case 'hiring':
      return generateHiringChart(data.hiringTimeline);
    case 'tech_stack':
      return generateTechStackChart(data.techStack);
    case 'customer_journey':
      return generateCustomerJourneyChart(data.customerJourney);
    case 'gtm_channels':
      return generateGTMChannelsChart(data.goToMarketChannels);
    case 'milestones':
      return generateMilestonesChart(data.milestones);
    case 'compliance':
      return generateComplianceChart(data.complianceRoadmap);
    case 'growth':
      return generateGrowthChart(data.growthMetrics);
    case 'pricing':
      return generatePricingChart(data.pricingTiers);
    case 'timeline':
      return generateTimelineChart(data.timeline);
    case 'swot':
      return generateSWOTChart(data.swotAnalysis);
    case 'customer_personas':
      return generateCustomerPersonasChart(data.customerPersonas);
    case 'marketing_channels':
      return generateMarketingChannelsChart(data.marketingChannels);
    case 'process_flow':
      return generateProcessFlowChart(data.processFlow);
    case 'customer_silhouettes':
      return generateCustomerSilhouettesChart(data.customerSilhouettes);
    case 'value_proposition':
      return generateValuePropositionChart(data.valueProposition);
    case 'inspirational_quote':
      return generateInspirationalQuoteChart(data.inspirationalQuote);
    case 'research_grid':
      return generateResearchGridChart(data.researchGrid);
    case 'business_journey':
      return generateBusinessJourneyChart(data.businessJourney);
    default:
      return '';
  }
}

function generateFinancialChart(data: { year: string; revenue: number; costs: number; profit: number }[]): string {
  const width = 600;
  const height = 350;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const maxValue = Math.max(...data.flatMap(d => [d.revenue, d.costs, d.profit]));
  const scale = chartHeight / maxValue;
  const barWidth = chartWidth / data.length / 4;
  const groupWidth = chartWidth / data.length;
  
  const colors = { revenue: '#10B981', costs: '#EF4444', profit: '#3B82F6' };
  
  let bars = '';
  let labels = '';
  
  data.forEach((d, i) => {
    const x = padding + i * groupWidth + groupWidth / 4;
    
    bars += `<rect x="${x}" y="${padding + chartHeight - d.revenue * scale}" width="${barWidth}" height="${d.revenue * scale}" fill="${colors.revenue}" rx="4"/>`;
    bars += `<rect x="${x + barWidth + 5}" y="${padding + chartHeight - d.costs * scale}" width="${barWidth}" height="${d.costs * scale}" fill="${colors.costs}" rx="4"/>`;
    bars += `<rect x="${x + (barWidth + 5) * 2}" y="${padding + chartHeight - d.profit * scale}" width="${barWidth}" height="${d.profit * scale}" fill="${colors.profit}" rx="4"/>`;
    
    labels += `<text x="${x + groupWidth / 4}" y="${height - 20}" text-anchor="middle" font-size="12" fill="#374151">${d.year}</text>`;
  });
  
  const legend = `
    <rect x="${width - 150}" y="20" width="12" height="12" fill="${colors.revenue}" rx="2"/>
    <text x="${width - 132}" y="30" font-size="11" fill="#374151">Revenue</text>
    <rect x="${width - 150}" y="38" width="12" height="12" fill="${colors.costs}" rx="2"/>
    <text x="${width - 132}" y="48" font-size="11" fill="#374151">Costs</text>
    <rect x="${width - 150}" y="56" width="12" height="12" fill="${colors.profit}" rx="2"/>
    <text x="${width - 132}" y="66" font-size="11" fill="#374151">Profit</text>
  `;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">3-Year Financial Projections</text>
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#E5E7EB" stroke-width="1"/>
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#E5E7EB" stroke-width="1"/>
    ${bars}
    ${labels}
    ${legend}
  </svg>`;
}

function generateMarketChart(data: { label: string; value: number; description: string }[]): string {
  const width = 500;
  const height = 300;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = chartHeight / maxValue;
  const barWidth = chartWidth / data.length * 0.6;
  const gap = chartWidth / data.length;
  
  const colors = ['#005EB8', '#41B6E6', '#10B981'];
  
  let bars = '';
  let labels = '';
  
  data.forEach((d, i) => {
    const x = padding + i * gap + gap * 0.2;
    const barHeight = d.value * scale;
    
    bars += `<rect x="${x}" y="${padding + chartHeight - barHeight}" width="${barWidth}" height="${barHeight}" fill="${colors[i]}" rx="6"/>`;
    bars += `<text x="${x + barWidth / 2}" y="${padding + chartHeight - barHeight - 8}" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">£${d.value}M</text>`;
    labels += `<text x="${x + barWidth / 2}" y="${height - 20}" text-anchor="middle" font-size="14" font-weight="600" fill="#374151">${d.label}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Market Size Analysis (TAM/SAM/SOM)</text>
    ${bars}
    ${labels}
  </svg>`;
}

function generateRiskMatrix(data: { risk: string; likelihood: number; impact: number; category: string }[]): string {
  const width = 500;
  const height = 400;
  const padding = 60;
  const gridSize = 60;
  
  const categoryColors: Record<string, string> = {
    Market: '#3B82F6',
    Technical: '#8B5CF6',
    Financial: '#EF4444',
    Compliance: '#F59E0B',
    Operational: '#10B981',
  };
  
  let grid = '';
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 5; j++) {
      const x = padding + (i - 1) * gridSize;
      const y = padding + (5 - j) * gridSize;
      const severity = i * j;
      let color = '#D1FAE5';
      if (severity > 12) color = '#FEE2E2';
      else if (severity > 6) color = '#FEF3C7';
      grid += `<rect x="${x}" y="${y}" width="${gridSize}" height="${gridSize}" fill="${color}" stroke="#E5E7EB" stroke-width="1"/>`;
    }
  }
  
  let points = '';
  data.forEach((d, i) => {
    const x = padding + (d.likelihood - 0.5) * gridSize;
    const y = padding + (5 - d.impact + 0.5) * gridSize;
    const color = categoryColors[d.category] || '#6B7280';
    points += `<circle cx="${x}" cy="${y}" r="12" fill="${color}" stroke="white" stroke-width="2"/>`;
    points += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${i + 1}</text>`;
  });
  
  let legend = '<g transform="translate(380, 60)">';
  data.forEach((d, i) => {
    const color = categoryColors[d.category] || '#6B7280';
    legend += `<circle cx="10" cy="${i * 22}" r="8" fill="${color}"/>`;
    legend += `<text x="24" y="${i * 22 + 4}" font-size="10" fill="#374151">${i + 1}. ${d.risk.substring(0, 15)}</text>`;
  });
  legend += '</g>';
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2 - 40}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Risk Assessment Matrix</text>
    ${grid}
    ${points}
    <text x="${padding + gridSize * 2.5}" y="${height - 15}" text-anchor="middle" font-size="12" fill="#374151">Likelihood →</text>
    <text x="15" y="${padding + gridSize * 2.5}" text-anchor="middle" font-size="12" fill="#374151" transform="rotate(-90, 15, ${padding + gridSize * 2.5})">Impact →</text>
    ${legend}
  </svg>`;
}

function generateCompetitorChart(data: { name: string; innovation: number; price: number; features: number; support: number; market: number }[]): string {
  const width = 600;
  const height = 350;
  const padding = 80;
  const chartWidth = width - padding * 2;
  const barHeight = 20;
  const groupHeight = barHeight * 5 + 30;
  
  const colors = { innovation: '#10B981', price: '#3B82F6', features: '#8B5CF6', support: '#F59E0B', market: '#EF4444' };
  const metrics = ['innovation', 'price', 'features', 'support', 'market'] as const;
  
  let bars = '';
  let labels = '';
  
  const competitors = data.slice(0, 4);
  
  competitors.forEach((comp, i) => {
    const yBase = padding + i * groupHeight;
    
    labels += `<text x="${padding - 10}" y="${yBase + groupHeight / 2 - 10}" text-anchor="end" font-size="11" font-weight="600" fill="#374151">${comp.name}</text>`;
    
    metrics.forEach((metric, j) => {
      const barWidth = (comp[metric] / 5) * chartWidth * 0.8;
      const y = yBase + j * (barHeight + 2);
      bars += `<rect x="${padding}" y="${y}" width="${barWidth}" height="${barHeight - 2}" fill="${colors[metric]}" rx="3" opacity="0.85"/>`;
    });
  });
  
  let legend = `<g transform="translate(${width - 100}, 40)">`;
  metrics.forEach((metric, i) => {
    legend += `<rect x="0" y="${i * 18}" width="12" height="12" fill="${colors[metric]}" rx="2"/>`;
    legend += `<text x="16" y="${i * 18 + 10}" font-size="10" fill="#374151">${metric.charAt(0).toUpperCase() + metric.slice(1)}</text>`;
  });
  legend += '</g>';
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Competitive Analysis</text>
    ${bars}
    ${labels}
    ${legend}
  </svg>`;
}

function generateKPIChart(data: { label: string; value: string; trend: string; color: string }[]): string {
  const width = 600;
  const height = 120;
  const cardWidth = (width - 40) / data.length - 10;
  
  let cards = '';
  data.forEach((d, i) => {
    const x = 20 + i * (cardWidth + 10);
    cards += `<rect x="${x}" y="20" width="${cardWidth}" height="80" fill="white" stroke="${d.color}" stroke-width="2" rx="8"/>`;
    cards += `<text x="${x + cardWidth / 2}" y="50" text-anchor="middle" font-size="20" font-weight="bold" fill="${d.color}">${d.value}</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="75" text-anchor="middle" font-size="11" fill="#6B7280">${d.label}</text>`;
    if (d.trend === 'up') {
      cards += `<text x="${x + cardWidth / 2}" y="95" text-anchor="middle" font-size="14" fill="#10B981">↑</text>`;
    }
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F9FAFB"/>
    ${cards}
  </svg>`;
}

function generateFundingChart(data: { category: string; amount: number; percentage: number }[]): string {
  const width = 500;
  const height = 300;
  const centerX = 160;
  const centerY = 150;
  const radius = 100;
  
  const colors = ['#005EB8', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  let startAngle = 0;
  let slices = '';
  let legend = '';
  
  data.forEach((d, i) => {
    const angle = (d.percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;
    
    const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
    
    slices += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}"/>`;
    
    legend += `<rect x="320" y="${40 + i * 45}" width="16" height="16" fill="${colors[i % colors.length]}" rx="2"/>`;
    legend += `<text x="345" y="${52 + i * 45}" font-size="11" font-weight="600" fill="#374151">${d.category}</text>`;
    legend += `<text x="345" y="${68 + i * 45}" font-size="10" fill="#6B7280">£${(d.amount / 1000).toFixed(0)}K (${d.percentage}%)</text>`;
    
    startAngle = endAngle;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Funding Allocation</text>
    ${slices}
    ${legend}
  </svg>`;
}

function generateRevenueStreamsChart(data: { stream: string; year1: number; year2: number; year3: number }[]): string {
  const width = 550;
  const height = 280;
  const padding = 80;
  const chartWidth = width - padding - 40;
  const chartHeight = height - 80;
  
  const maxValue = Math.max(...data.flatMap(d => [d.year1, d.year2, d.year3]));
  const scale = chartHeight / maxValue;
  const barWidth = chartWidth / (data.length * 4);
  const colors = ['#005EB8', '#41B6E6', '#10B981'];
  
  let bars = '';
  let labels = '';
  
  data.forEach((d, i) => {
    const groupX = padding + i * (chartWidth / data.length) + 20;
    
    bars += `<rect x="${groupX}" y="${60 + chartHeight - d.year1 * scale}" width="${barWidth}" height="${d.year1 * scale}" fill="${colors[0]}" rx="3"/>`;
    bars += `<rect x="${groupX + barWidth + 3}" y="${60 + chartHeight - d.year2 * scale}" width="${barWidth}" height="${d.year2 * scale}" fill="${colors[1]}" rx="3"/>`;
    bars += `<rect x="${groupX + (barWidth + 3) * 2}" y="${60 + chartHeight - d.year3 * scale}" width="${barWidth}" height="${d.year3 * scale}" fill="${colors[2]}" rx="3"/>`;
    
    labels += `<text x="${groupX + barWidth * 1.5 + 3}" y="${height - 15}" text-anchor="middle" font-size="10" fill="#374151">${d.stream}</text>`;
  });
  
  const legend = `
    <rect x="${width - 100}" y="30" width="12" height="12" fill="${colors[0]}" rx="2"/>
    <text x="${width - 82}" y="40" font-size="10" fill="#374151">Year 1</text>
    <rect x="${width - 100}" y="48" width="12" height="12" fill="${colors[1]}" rx="2"/>
    <text x="${width - 82}" y="58" font-size="10" fill="#374151">Year 2</text>
    <rect x="${width - 100}" y="66" width="12" height="12" fill="${colors[2]}" rx="2"/>
    <text x="${width - 82}" y="76" font-size="10" fill="#374151">Year 3</text>
  `;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Revenue Streams Breakdown</text>
    ${bars}
    ${labels}
    ${legend}
  </svg>`;
}

function generateUnitEconomicsChart(data: { metric: string; value: number; benchmark: number }[]): string {
  const width = 500;
  const height = 220;
  const padding = 120;
  const chartWidth = width - padding - 40;
  const barHeight = 35;
  
  const maxValue = Math.max(...data.flatMap(d => [d.value, d.benchmark]));
  const scale = chartWidth / maxValue;
  
  let bars = '';
  
  data.forEach((d, i) => {
    const y = 50 + i * (barHeight + 15);
    const valueWidth = d.value * scale;
    const benchmarkWidth = d.benchmark * scale;
    
    bars += `<text x="${padding - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="11" font-weight="600" fill="#374151">${d.metric}</text>`;
    bars += `<rect x="${padding}" y="${y}" width="${valueWidth}" height="${barHeight / 2 - 2}" fill="#005EB8" rx="3"/>`;
    bars += `<rect x="${padding}" y="${y + barHeight / 2 + 2}" width="${benchmarkWidth}" height="${barHeight / 2 - 2}" fill="#E5E7EB" rx="3"/>`;
    bars += `<text x="${padding + valueWidth + 5}" y="${y + barHeight / 4 + 2}" font-size="9" fill="#005EB8">${d.value.toLocaleString()}</text>`;
  });
  
  const legend = `
    <rect x="${width - 120}" y="15" width="12" height="12" fill="#005EB8" rx="2"/>
    <text x="${width - 102}" y="25" font-size="10" fill="#374151">Your Value</text>
    <rect x="${width - 120}" y="33" width="12" height="12" fill="#E5E7EB" rx="2"/>
    <text x="${width - 102}" y="43" font-size="10" fill="#374151">Benchmark</text>
  `;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Unit Economics</text>
    ${bars}
    ${legend}
  </svg>`;
}

function generateHiringChart(data: { role: string; quarter: string; count: number }[]): string {
  const width = 550;
  const height = 250;
  const padding = 100;
  const chartWidth = width - padding - 40;
  const barHeight = 28;
  
  const quarters = Array.from(new Set(data.map(d => d.quarter)));
  const colors = ['#005EB8', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#41B6E6'];
  
  let bars = '';
  let labels = '';
  
  data.forEach((d, i) => {
    const y = 50 + i * (barHeight + 8);
    const quarterIndex = quarters.indexOf(d.quarter);
    const barWidth = (chartWidth / quarters.length) * (quarterIndex + 1) * 0.7;
    
    bars += `<rect x="${padding}" y="${y}" width="${barWidth}" height="${barHeight - 4}" fill="${colors[i % colors.length]}" rx="4"/>`;
    bars += `<text x="${padding - 10}" y="${y + barHeight / 2}" text-anchor="end" font-size="10" fill="#374151">${d.role}</text>`;
    bars += `<text x="${padding + barWidth + 8}" y="${y + barHeight / 2}" font-size="10" font-weight="600" fill="#374151">${d.quarter} (+${d.count})</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Hiring Timeline</text>
    ${bars}
  </svg>`;
}

function generateTechStackChart(data: { layer: string; technologies: string[] }[]): string {
  const width = 500;
  const height = 220;
  const layerHeight = 45;
  const colors = ['#005EB8', '#10B981', '#F59E0B', '#8B5CF6'];
  
  let layers = '';
  
  data.forEach((d, i) => {
    const y = 50 + i * layerHeight;
    
    layers += `<rect x="40" y="${y}" width="420" height="${layerHeight - 5}" fill="${colors[i % colors.length]}15" stroke="${colors[i % colors.length]}" stroke-width="2" rx="8"/>`;
    layers += `<text x="60" y="${y + layerHeight / 2}" font-size="12" font-weight="bold" fill="${colors[i % colors.length]}">${d.layer}</text>`;
    layers += `<text x="160" y="${y + layerHeight / 2}" font-size="11" fill="#374151">${d.technologies.join(' • ')}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Technology Architecture</text>
    ${layers}
  </svg>`;
}

function generateCustomerJourneyChart(data: { stage: string; conversion: number; description: string }[]): string {
  const width = 550;
  const height = 180;
  const stageWidth = (width - 60) / data.length;
  const maxConversion = Math.max(...data.map(d => d.conversion));
  
  let funnel = '';
  
  data.forEach((d, i) => {
    const x = 30 + i * stageWidth;
    const barHeight = (d.conversion / maxConversion) * 80;
    const y = 100 - barHeight / 2;
    const color = `hsl(${200 - i * 30}, 70%, 50%)`;
    
    funnel += `<rect x="${x + 5}" y="${y}" width="${stageWidth - 10}" height="${barHeight}" fill="${color}" rx="6"/>`;
    funnel += `<text x="${x + stageWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">${d.conversion}%</text>`;
    funnel += `<text x="${x + stageWidth / 2}" y="145" text-anchor="middle" font-size="10" font-weight="600" fill="#374151">${d.stage}</text>`;
    funnel += `<text x="${x + stageWidth / 2}" y="160" text-anchor="middle" font-size="8" fill="#6B7280">${d.description}</text>`;
    
    if (i < data.length - 1) {
      funnel += `<text x="${x + stageWidth}" y="105" text-anchor="middle" font-size="14" fill="#9CA3AF">→</text>`;
    }
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Customer Acquisition Funnel</text>
    ${funnel}
  </svg>`;
}

function generateGTMChannelsChart(data: { channel: string; budget: number; expectedROI: number }[]): string {
  const width = 500;
  const height = 230;
  const padding = 140;
  const chartWidth = width - padding - 40;
  const barHeight = 40;
  
  const maxBudget = Math.max(...data.map(d => d.budget));
  
  let bars = '';
  
  data.forEach((d, i) => {
    const y = 50 + i * (barHeight + 10);
    const barWidth = (d.budget / maxBudget) * chartWidth;
    const roiColor = d.expectedROI >= 4 ? '#10B981' : d.expectedROI >= 3 ? '#F59E0B' : '#6B7280';
    
    bars += `<text x="${padding - 10}" y="${y + barHeight / 2}" text-anchor="end" font-size="11" fill="#374151">${d.channel}</text>`;
    bars += `<rect x="${padding}" y="${y}" width="${barWidth}" height="${barHeight - 8}" fill="#005EB8" rx="4"/>`;
    bars += `<text x="${padding + barWidth + 8}" y="${y + barHeight / 2 - 5}" font-size="10" fill="#374151">£${(d.budget / 1000).toFixed(0)}K</text>`;
    bars += `<text x="${padding + barWidth + 8}" y="${y + barHeight / 2 + 8}" font-size="9" fill="${roiColor}">ROI: ${d.expectedROI}x</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Marketing Channel Allocation</text>
    ${bars}
  </svg>`;
}

function generateMilestonesChart(data: { milestone: string; month: number; status: string }[]): string {
  const width = 550;
  const height = 200;
  const padding = 40;
  const lineY = 100;
  const timelineWidth = width - padding * 2;
  
  const maxMonth = Math.max(...data.map(d => d.month));
  const statusColors = {
    completed: '#10B981',
    in_progress: '#F59E0B',
    planned: '#005EB8',
  };
  
  let line = `<line x1="${padding}" y1="${lineY}" x2="${width - padding}" y2="${lineY}" stroke="#E5E7EB" stroke-width="4"/>`;
  let points = '';
  
  data.forEach((d, i) => {
    const x = padding + (d.month / maxMonth) * timelineWidth;
    const color = statusColors[d.status as keyof typeof statusColors] || '#6B7280';
    const yOffset = i % 2 === 0 ? -40 : 40;
    
    points += `<circle cx="${x}" cy="${lineY}" r="10" fill="${color}" stroke="white" stroke-width="2"/>`;
    points += `<line x1="${x}" y1="${lineY + (yOffset > 0 ? 12 : -12)}" x2="${x}" y2="${lineY + yOffset * 0.6}" stroke="${color}" stroke-width="1"/>`;
    points += `<text x="${x}" y="${lineY + yOffset}" text-anchor="middle" font-size="9" font-weight="600" fill="#374151">${d.milestone}</text>`;
    points += `<text x="${x}" y="${lineY + yOffset + (yOffset > 0 ? 12 : -12)}" text-anchor="middle" font-size="8" fill="#6B7280">M${d.month}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Key Milestones</text>
    ${line}
    ${points}
  </svg>`;
}

function generateComplianceChart(data: { requirement: string; deadline: string; status: string; priority: string }[]): string {
  const width = 500;
  const height = 220;
  const padding = 30;
  const rowHeight = 32;
  
  const statusColors = { done: '#10B981', in_progress: '#F59E0B', pending: '#E5E7EB' };
  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };
  
  let rows = '';
  
  rows += `<rect x="${padding}" y="45" width="${width - padding * 2}" height="25" fill="#F3F4F6" rx="4"/>`;
  rows += `<text x="${padding + 10}" y="62" font-size="10" font-weight="bold" fill="#374151">Requirement</text>`;
  rows += `<text x="280" y="62" font-size="10" font-weight="bold" fill="#374151">Deadline</text>`;
  rows += `<text x="360" y="62" font-size="10" font-weight="bold" fill="#374151">Status</text>`;
  rows += `<text x="440" y="62" font-size="10" font-weight="bold" fill="#374151">Priority</text>`;
  
  data.forEach((d, i) => {
    const y = 75 + i * rowHeight;
    const statusColor = statusColors[d.status as keyof typeof statusColors] || '#6B7280';
    const priorityColor = priorityColors[d.priority as keyof typeof priorityColors] || '#6B7280';
    
    rows += `<text x="${padding + 10}" y="${y + 18}" font-size="10" fill="#374151">${d.requirement.substring(0, 25)}</text>`;
    rows += `<text x="280" y="${y + 18}" font-size="10" fill="#6B7280">${d.deadline}</text>`;
    rows += `<circle cx="370" cy="${y + 14}" r="6" fill="${statusColor}"/>`;
    rows += `<rect x="420" y="${y + 6}" width="50" height="16" fill="${priorityColor}15" stroke="${priorityColor}" stroke-width="1" rx="8"/>`;
    rows += `<text x="445" y="${y + 17}" text-anchor="middle" font-size="8" fill="${priorityColor}">${d.priority.toUpperCase()}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Compliance Roadmap</text>
    ${rows}
  </svg>`;
}

function generateGrowthChart(data: { month: string; users: number; revenue: number; mrr: number }[]): string {
  const width = 550;
  const height = 280;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - 100;
  
  const maxUsers = Math.max(...data.map(d => d.users));
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const scaleUsers = chartHeight / maxUsers;
  const scaleRevenue = chartHeight / maxRevenue;
  
  let usersPath = `M ${padding} ${60 + chartHeight}`;
  let revenuePath = `M ${padding} ${60 + chartHeight}`;
  let points = '';
  
  data.forEach((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const yUsers = 60 + chartHeight - d.users * scaleUsers;
    const yRevenue = 60 + chartHeight - d.revenue * scaleRevenue;
    
    usersPath += ` L ${x} ${yUsers}`;
    revenuePath += ` L ${x} ${yRevenue}`;
    
    points += `<circle cx="${x}" cy="${yUsers}" r="4" fill="#005EB8"/>`;
    points += `<circle cx="${x}" cy="${yRevenue}" r="4" fill="#10B981"/>`;
    points += `<text x="${x}" y="${60 + chartHeight + 20}" text-anchor="middle" font-size="10" fill="#6B7280">${d.month}</text>`;
  });
  
  const legend = `
    <line x1="${width - 120}" y1="35" x2="${width - 100}" y2="35" stroke="#005EB8" stroke-width="3"/>
    <text x="${width - 92}" y="38" font-size="10" fill="#374151">Users</text>
    <line x1="${width - 120}" y1="52" x2="${width - 100}" y2="52" stroke="#10B981" stroke-width="3"/>
    <text x="${width - 92}" y="55" font-size="10" fill="#374151">Revenue</text>
  `;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Growth Trajectory</text>
    <path d="${usersPath}" fill="none" stroke="#005EB8" stroke-width="3"/>
    <path d="${revenuePath}" fill="none" stroke="#10B981" stroke-width="3"/>
    ${points}
    ${legend}
  </svg>`;
}

function generatePricingChart(data: { tier: string; price: number; features: number; target: string }[]): string {
  const width = 550;
  const height = 200;
  const cardWidth = (width - 60) / data.length - 10;
  
  const colors = ['#E5E7EB', '#41B6E6', '#005EB8', '#10B981'];
  
  let cards = '';
  
  data.forEach((d, i) => {
    const x = 30 + i * (cardWidth + 10);
    const color = colors[i % colors.length];
    const isPopular = i === 1;
    
    cards += `<rect x="${x}" y="${isPopular ? 35 : 45}" width="${cardWidth}" height="${isPopular ? 145 : 135}" fill="white" stroke="${color}" stroke-width="${isPopular ? 3 : 2}" rx="8"/>`;
    
    if (isPopular) {
      cards += `<rect x="${x}" y="35" width="${cardWidth}" height="20" fill="${color}" rx="8 8 0 0"/>`;
      cards += `<text x="${x + cardWidth / 2}" y="49" text-anchor="middle" font-size="9" font-weight="bold" fill="white">POPULAR</text>`;
    }
    
    cards += `<text x="${x + cardWidth / 2}" y="${isPopular ? 80 : 75}" text-anchor="middle" font-size="14" font-weight="bold" fill="#111827">${d.tier}</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="${isPopular ? 110 : 105}" text-anchor="middle" font-size="20" font-weight="bold" fill="${color}">£${d.price}</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="${isPopular ? 125 : 120}" text-anchor="middle" font-size="9" fill="#6B7280">/month</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="${isPopular ? 150 : 145}" text-anchor="middle" font-size="10" fill="#374151">${d.features} features</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="${isPopular ? 168 : 163}" text-anchor="middle" font-size="9" fill="#6B7280">${d.target}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F9FAFB"/>
    <text x="${width/2}" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Pricing Tiers</text>
    ${cards}
  </svg>`;
}

function generateTimelineChart(data: { phase: string; startMonth: number; duration: number; tasks: string[] }[]): string {
  const width = 550;
  const height = 180;
  const padding = 40;
  const barHeight = 35;
  const chartWidth = width - padding * 2;
  
  const totalMonths = Math.max(...data.map(d => d.startMonth + d.duration));
  const colors = ['#005EB8', '#10B981', '#F59E0B'];
  
  let bars = '';
  let labels = '';
  
  labels += `<line x1="${padding}" y1="45" x2="${width - padding}" y2="45" stroke="#E5E7EB" stroke-width="1"/>`;
  for (let m = 0; m <= totalMonths; m += 6) {
    const x = padding + (m / totalMonths) * chartWidth;
    labels += `<text x="${x}" y="38" text-anchor="middle" font-size="9" fill="#6B7280">M${m}</text>`;
    labels += `<line x1="${x}" y1="45" x2="${x}" y2="${50 + data.length * (barHeight + 10)}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="3,3"/>`;
  }
  
  data.forEach((d, i) => {
    const y = 55 + i * (barHeight + 10);
    const x = padding + (d.startMonth / totalMonths) * chartWidth;
    const barWidth = (d.duration / totalMonths) * chartWidth;
    
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight - 5}" fill="${colors[i % colors.length]}" rx="4"/>`;
    bars += `<text x="${x + barWidth / 2}" y="${y + barHeight / 2}" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${d.phase}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Implementation Timeline</text>
    ${labels}
    ${bars}
  </svg>`;
}

function generateSWOTChart(data: { category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'; items: string[] }[]): string {
  const width = 600;
  const height = 400;
  const quadrantWidth = (width - 30) / 2;
  const quadrantHeight = (height - 60) / 2;
  
  const colors = {
    strengths: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    weaknesses: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
    opportunities: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
    threats: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  };
  
  const positions = {
    strengths: { x: 15, y: 45 },
    weaknesses: { x: 15 + quadrantWidth + 5, y: 45 },
    opportunities: { x: 15, y: 45 + quadrantHeight + 5 },
    threats: { x: 15 + quadrantWidth + 5, y: 45 + quadrantHeight + 5 },
  };
  
  const labels = {
    strengths: 'STRENGTHS',
    weaknesses: 'WEAKNESSES',
    opportunities: 'OPPORTUNITIES',
    threats: 'THREATS',
  };
  
  let quadrants = '';
  
  data.forEach(d => {
    const pos = positions[d.category];
    const color = colors[d.category];
    
    quadrants += `<rect x="${pos.x}" y="${pos.y}" width="${quadrantWidth}" height="${quadrantHeight}" fill="${color.bg}" stroke="${color.border}" stroke-width="2" rx="8"/>`;
    quadrants += `<text x="${pos.x + 10}" y="${pos.y + 22}" font-size="12" font-weight="bold" fill="${color.text}">${labels[d.category]}</text>`;
    
    d.items.slice(0, 4).forEach((item, i) => {
      quadrants += `<circle cx="${pos.x + 18}" cy="${pos.y + 42 + i * 20}" r="3" fill="${color.border}"/>`;
      quadrants += `<text x="${pos.x + 28}" y="${pos.y + 46 + i * 20}" font-size="10" fill="${color.text}">${item.substring(0, 30)}</text>`;
    });
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">SWOT Analysis</text>
    ${quadrants}
  </svg>`;
}

function generateCustomerPersonasChart(data: { name: string; role: string; age: string; painPoints: string[]; goals: string[] }[]): string {
  const width = 600;
  const cardWidth = (width - 40) / data.length - 10;
  const height = 320;
  
  const colors = ['#005EB8', '#10B981', '#F59E0B'];
  
  let cards = '';
  
  data.forEach((d, i) => {
    const x = 20 + i * (cardWidth + 10);
    const color = colors[i % colors.length];
    
    cards += `<rect x="${x}" y="45" width="${cardWidth}" height="${height - 60}" fill="white" stroke="${color}" stroke-width="2" rx="10"/>`;
    
    cards += `<circle cx="${x + cardWidth / 2}" cy="75" r="20" fill="${color}"/>`;
    cards += `<text x="${x + cardWidth / 2}" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${d.name.charAt(0)}</text>`;
    
    cards += `<text x="${x + cardWidth / 2}" y="110" text-anchor="middle" font-size="13" font-weight="bold" fill="#111827">${d.name}</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="125" text-anchor="middle" font-size="10" fill="${color}">${d.role}</text>`;
    cards += `<text x="${x + cardWidth / 2}" y="140" text-anchor="middle" font-size="9" fill="#6B7280">Age: ${d.age}</text>`;
    
    cards += `<line x1="${x + 10}" y1="150" x2="${x + cardWidth - 10}" y2="150" stroke="#E5E7EB" stroke-width="1"/>`;
    
    cards += `<text x="${x + 10}" y="168" font-size="9" font-weight="bold" fill="#EF4444">Pain Points:</text>`;
    d.painPoints.slice(0, 2).forEach((p, pi) => {
      cards += `<text x="${x + 10}" y="${182 + pi * 14}" font-size="8" fill="#6B7280">• ${p.substring(0, 20)}</text>`;
    });
    
    cards += `<text x="${x + 10}" y="218" font-size="9" font-weight="bold" fill="#10B981">Goals:</text>`;
    d.goals.slice(0, 2).forEach((g, gi) => {
      cards += `<text x="${x + 10}" y="${232 + gi * 14}" font-size="8" fill="#6B7280">• ${g.substring(0, 20)}</text>`;
    });
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F9FAFB"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Customer Personas</text>
    ${cards}
  </svg>`;
}

function generateMarketingChannelsChart(data: { channel: string; budget: number; expectedLeads: number; cac: number }[]): string {
  const width = 600;
  const height = 350;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const barHeight = 40;
  
  const maxBudget = Math.max(...data.map(d => d.budget));
  const colors = ['#005EB8', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  
  let bars = '';
  let labels = '';
  
  data.forEach((d, i) => {
    const y = padding + i * (barHeight + 15);
    const barWidth = (d.budget / maxBudget) * (chartWidth * 0.6);
    const color = colors[i % colors.length];
    
    labels += `<text x="${padding - 5}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="11" fill="#374151">${d.channel}</text>`;
    
    bars += `<rect x="${padding}" y="${y}" width="${barWidth}" height="${barHeight - 5}" fill="${color}" rx="4"/>`;
    bars += `<text x="${padding + barWidth + 8}" y="${y + 15}" font-size="10" font-weight="bold" fill="#374151">£${(d.budget / 1000).toFixed(1)}K</text>`;
    bars += `<text x="${padding + barWidth + 8}" y="${y + 28}" font-size="9" fill="#6B7280">${d.expectedLeads} leads</text>`;
    
    bars += `<rect x="${width - 80}" y="${y + 5}" width="65" height="24" fill="#F3F4F6" rx="4"/>`;
    bars += `<text x="${width - 48}" y="${y + 22}" text-anchor="middle" font-size="10" fill="#374151">CAC: £${d.cac}</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Marketing Channel Performance</text>
    <text x="${width/2}" y="42" text-anchor="middle" font-size="11" fill="#6B7280">Budget allocation, expected leads, and customer acquisition cost</text>
    ${bars}
    ${labels}
  </svg>`;
}

function generateProcessFlowChart(data: { step: number; title: string; description: string }[]): string {
  const width = 600;
  const height = 300;
  const circleRadius = 52;
  const spacing = width / (data.length + 1);
  const cy = 110; // circle center Y — gives room for title above and description below

  let circles = '';
  let arrows = '';
  let labels = '';

  const colors = ['#F59E0B', '#F97316', '#EF4444'];

  // Helper: split a string into two lines of at most maxLen chars each
  const splitTwo = (text: string, maxLen = 22): [string, string] => {
    if (text.length <= maxLen) return [text, ''];
    const cut = text.lastIndexOf(' ', maxLen);
    const breakAt = cut > 0 ? cut : maxLen;
    return [text.substring(0, breakAt).trim(), text.substring(breakAt).trim().substring(0, maxLen)];
  };

  data.forEach((d, i) => {
    const x = spacing * (i + 1);
    const color = colors[i % colors.length];

    circles += `<circle cx="${x}" cy="${cy}" r="${circleRadius}" fill="${color}" opacity="0.9"/>`;
    circles += `<circle cx="${x}" cy="${cy}" r="${circleRadius - 8}" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4,4"/>`;
    circles += `<text x="${x}" y="${cy - 10}" text-anchor="middle" font-size="22" font-weight="bold" fill="white">${d.step}</text>`;
    circles += `<text x="${x}" y="${cy + 12}" text-anchor="middle" font-size="10" font-weight="600" fill="white">${d.title}</text>`;

    if (i < data.length - 1) {
      const nextX = spacing * (i + 2);
      arrows += `<path d="M${x + circleRadius + 5} ${cy} L${nextX - circleRadius - 15} ${cy}" stroke="#374151" stroke-width="3" marker-end="url(#arrowhead)"/>`;
    }

    const [line1, line2] = splitTwo(d.description);
    labels += `<text x="${x}" y="${cy + circleRadius + 28}" text-anchor="middle" font-size="9" fill="#6B7280">${line1}</text>`;
    if (line2) {
      labels += `<text x="${x}" y="${cy + circleRadius + 44}" text-anchor="middle" font-size="9" fill="#6B7280">${line2}</text>`;
    }
  });

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="#111827">Your Business Journey</text>
    ${arrows}
    ${circles}
    ${labels}
  </svg>`;
}

function generateCustomerSilhouettesChart(data: { segment: string; percentage: number; color: string }[]): string {
  const width = 600;
  const height = 350;
  const padding = 60;
  const barWidth = 80;
  const spacing = (width - padding * 2) / data.length;
  const maxHeight = height - 140;
  
  let bars = '';
  
  data.forEach((d, i) => {
    const x = padding + spacing * i + (spacing - barWidth) / 2;
    const barHeight = Math.max((d.percentage / 100) * maxHeight, 34);
    const y = height - 60 - barHeight;
    const centerX = x + barWidth / 2;
    const headY = Math.max(y - 25, 78);
    const torsoY = headY + 24;
    const torsoHeight = 34;
    const armY = torsoY + 18;
    const legTopY = torsoY + torsoHeight;
    const legBottomY = Math.min(legTopY + 28, height - 72);
    
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${d.color}" rx="4"/>`;
    
    bars += `<circle cx="${centerX}" cy="${headY}" r="15" fill="${d.color}"/>`;
    bars += `<rect x="${centerX - 13}" y="${torsoY}" width="26" height="${torsoHeight}" fill="${d.color}" rx="5"/>`;
    bars += `<line x1="${centerX - 18}" y1="${armY}" x2="${centerX - 40}" y2="${armY}" stroke="${d.color}" stroke-width="8" stroke-linecap="round"/>`;
    bars += `<line x1="${centerX + 18}" y1="${armY}" x2="${centerX + 40}" y2="${armY}" stroke="${d.color}" stroke-width="8" stroke-linecap="round"/>`;
    bars += `<line x1="${centerX - 9}" y1="${legTopY}" x2="${centerX - 14}" y2="${legBottomY}" stroke="${d.color}" stroke-width="8" stroke-linecap="round"/>`;
    bars += `<line x1="${centerX + 9}" y1="${legTopY}" x2="${centerX + 14}" y2="${legBottomY}" stroke="${d.color}" stroke-width="8" stroke-linecap="round"/>`;
    
    bars += `<text x="${centerX}" y="${height - 35}" text-anchor="middle" font-size="11" font-weight="bold" fill="#111827">${d.segment}</text>`;
    bars += `<text x="${centerX}" y="${height - 18}" text-anchor="middle" font-size="14" font-weight="bold" fill="${d.color}">${d.percentage}%</text>`;
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F9FAFB"/>
    <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Who Are Your Customers?</text>
    <text x="${width/2}" y="48" text-anchor="middle" font-size="11" fill="#6B7280">Customer segment distribution</text>
    ${bars}
  </svg>`;
}

function generateValuePropositionChart(data: { quadrant: number; title: string; points: string[] }[]): string {
  const width = 600;
  const height = 400;
  const quadrantWidth = (width - 50) / 2;
  const quadrantHeight = (height - 80) / 2;
  
  const positions = [
    { x: 20, y: 50 },
    { x: 20 + quadrantWidth + 10, y: 50 },
    { x: 20, y: 50 + quadrantHeight + 10 },
    { x: 20 + quadrantWidth + 10, y: 50 + quadrantHeight + 10 },
  ];
  
  const colors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3'];
  const borderColors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899'];
  const textColors = ['#92400E', '#1E40AF', '#065F46', '#9D174D'];
  
  let quadrants = '';
  
  data.forEach((d, i) => {
    const pos = positions[i];
    const bg = colors[i];
    const border = borderColors[i];
    const text = textColors[i];
    
    quadrants += `<rect x="${pos.x}" y="${pos.y}" width="${quadrantWidth}" height="${quadrantHeight}" fill="${bg}" stroke="${border}" stroke-width="2" rx="8"/>`;
    
    quadrants += `<circle cx="${pos.x + 25}" cy="${pos.y + 25}" r="18" fill="${border}"/>`;
    quadrants += `<text x="${pos.x + 25}" y="${pos.y + 30}" text-anchor="middle" font-size="16" font-weight="bold" fill="white">${d.quadrant}</text>`;
    
    quadrants += `<text x="${pos.x + 55}" y="${pos.y + 30}" font-size="13" font-weight="bold" fill="${text}">${d.title}</text>`;
    
    d.points.slice(0, 3).forEach((point, pi) => {
      quadrants += `<circle cx="${pos.x + 25}" cy="${pos.y + 55 + pi * 22}" r="4" fill="${border}"/>`;
      quadrants += `<text x="${pos.x + 38}" y="${pos.y + 59 + pi * 22}" font-size="10" fill="${text}">${point}</text>`;
    });
  });
  
  quadrants += `<line x1="${width/2}" y1="50" x2="${width/2}" y2="${height - 30}" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="8,4"/>`;
  quadrants += `<line x1="20" y1="${50 + quadrantHeight + 5}" x2="${width - 20}" y2="${50 + quadrantHeight + 5}" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="8,4"/>`;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">What Are You Going To Sell?</text>
    ${quadrants}
  </svg>`;
}

function generateInspirationalQuoteChart(data: { quote: string; author: string; role: string }): string {
  const width = 600;
  const height = 220;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="quoteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1E3A5F;stop-opacity:1"/>
        <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#quoteGradient)" rx="12"/>
    
    <text x="40" y="55" font-size="60" fill="#F59E0B" opacity="0.8">"</text>
    
    <text x="${width/2}" y="90" text-anchor="middle" font-size="16" font-style="italic" fill="white">${data.quote.substring(0, 60)}</text>
    <text x="${width/2}" y="115" text-anchor="middle" font-size="14" font-style="italic" fill="white">${data.quote.substring(60, 120)}</text>
    
    <line x1="200" y1="145" x2="400" y2="145" stroke="#F59E0B" stroke-width="2"/>
    
    <text x="${width/2}" y="175" text-anchor="middle" font-size="14" font-weight="bold" fill="#F59E0B">${data.author}</text>
    <text x="${width/2}" y="195" text-anchor="middle" font-size="11" fill="#94A3B8">${data.role}</text>
  </svg>`;
}

function generateResearchGridChart(data: { category: string; findings: string[]; color: string }[]): string {
  const width = 600;
  const height = 280;
  const cellWidth = (width - 40) / data.length - 10;
  
  let cells = '';
  
  data.forEach((d, i) => {
    const x = 20 + i * (cellWidth + 10);
    
    cells += `<rect x="${x}" y="50" width="${cellWidth}" height="40" fill="${d.color}" rx="4 4 0 0"/>`;
    cells += `<text x="${x + cellWidth/2}" y="75" text-anchor="middle" font-size="12" font-weight="bold" fill="white">${d.category}</text>`;
    
    cells += `<rect x="${x}" y="90" width="${cellWidth}" height="${height - 110}" fill="white" stroke="${d.color}" stroke-width="2" rx="0 0 4 4"/>`;
    
    d.findings.forEach((f, fi) => {
      cells += `<circle cx="${x + 18}" cy="${115 + fi * 28}" r="4" fill="${d.color}"/>`;
      cells += `<text x="${x + 30}" y="${119 + fi * 28}" font-size="10" fill="#374151">${f.substring(0, 22)}</text>`;
    });
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#F0F9FF"/>
    <text x="${width/2}" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Market Research Findings</text>
    ${cells}
  </svg>`;
}

function generateBusinessJourneyChart(data: { phase: string; activities: string[]; icon: string }[]): string {
  const width = 600;
  const height = 250;
  const phaseWidth = (width - 60) / data.length;
  
  const colors = ['#005EB8', '#10B981', '#F59E0B', '#8B5CF6'];
  
  let phases = '';
  
  phases += `<rect x="30" y="80" width="${width - 60}" height="8" fill="#E5E7EB" rx="4"/>`;
  
  data.forEach((d, i) => {
    const x = 30 + phaseWidth * i + phaseWidth / 2;
    const color = colors[i % colors.length];
    
    phases += `<circle cx="${x}" cy="84" r="18" fill="${color}" stroke="white" stroke-width="3"/>`;
    phases += `<text x="${x}" y="89" text-anchor="middle" font-size="12" font-weight="bold" fill="white">${i + 1}</text>`;
    
    phases += `<text x="${x}" y="125" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">${d.phase}</text>`;
    
    d.activities.slice(0, 3).forEach((a, ai) => {
      phases += `<text x="${x}" y="${148 + ai * 16}" text-anchor="middle" font-size="9" fill="#6B7280">• ${a}</text>`;
    });
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="${width/2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#111827">Your Business Journey</text>
    <text x="${width/2}" y="50" text-anchor="middle" font-size="11" fill="#6B7280">Key phases and activities for success</text>
    ${phases}
  </svg>`;
}
