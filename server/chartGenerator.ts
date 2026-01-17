import type { BusinessPlan } from "@shared/schema";

export interface ChartDataPayload {
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
}

export function generateChartData(plan: BusinessPlan): ChartDataPayload {
  const funding = plan.funding || 50000;
  const jobCreation = plan.jobCreation || 10;
  const cac = plan.customerAcquisitionCost || 500;
  const ltv = plan.lifetimeValue || 2000;
  
  const year1Revenue = Math.round(funding * 1.5);
  const year2Revenue = Math.round(year1Revenue * 2.2);
  const year3Revenue = Math.round(year2Revenue * 1.8);
  
  const financialProjections = [
    { year: "Year 1", revenue: year1Revenue, costs: Math.round(year1Revenue * 0.8), profit: Math.round(year1Revenue * 0.2) },
    { year: "Year 2", revenue: year2Revenue, costs: Math.round(year2Revenue * 0.65), profit: Math.round(year2Revenue * 0.35) },
    { year: "Year 3", revenue: year3Revenue, costs: Math.round(year3Revenue * 0.55), profit: Math.round(year3Revenue * 0.45) },
  ];

  const tamMatch = plan.marketSize?.match(/(\d+(?:\.\d+)?)\s*(billion|million|B|M)/i);
  let tamValue = 5000000000;
  if (tamMatch) {
    const num = parseFloat(tamMatch[1]);
    const unit = tamMatch[2].toLowerCase();
    if (unit.includes('b')) tamValue = num * 1000000000;
    else if (unit.includes('m')) tamValue = num * 1000000;
  }
  
  const marketSize = [
    { label: "TAM", value: Math.round(tamValue / 1000000), description: "Total Addressable Market (£M)" },
    { label: "SAM", value: Math.round(tamValue / 10000000), description: "Serviceable Available Market (£M)" },
    { label: "SOM", value: Math.round(tamValue / 100000000), description: "Serviceable Obtainable Market (£M)" },
  ];

  const timeline = [
    { 
      phase: "MVP & Launch", 
      startMonth: 1, 
      duration: 6,
      tasks: ["Product development", "Beta testing", "Market launch"]
    },
    { 
      phase: "Growth Phase", 
      startMonth: 7, 
      duration: 12,
      tasks: ["Customer acquisition", "Team expansion", "Feature development"]
    },
    { 
      phase: "Scale Phase", 
      startMonth: 19, 
      duration: 18,
      tasks: ["Market expansion", "Enterprise sales", "International growth"]
    },
  ];

  const riskMatrix = [
    { risk: "Market Competition", likelihood: 4, impact: 3, category: "Market" },
    { risk: "Regulatory Changes", likelihood: 2, impact: 5, category: "Compliance" },
    { risk: "Technical Scalability", likelihood: 3, impact: 4, category: "Technical" },
    { risk: "Funding Gap", likelihood: 3, impact: 5, category: "Financial" },
    { risk: "Key Person Risk", likelihood: 2, impact: 4, category: "Operational" },
    { risk: "Customer Churn", likelihood: 3, impact: 3, category: "Market" },
  ];

  const competitorNames = extractCompetitors(plan.competitors || "");
  const competitorComparison = competitorNames.slice(0, 5).map((name, index) => ({
    name: name.substring(0, 15),
    innovation: Math.max(1, 5 - index),
    price: 3 + (index % 3),
    features: 4 - (index % 2),
    support: 3 + (index % 2),
    market: 5 - Math.floor(index / 2),
  }));
  
  competitorComparison.unshift({
    name: plan.businessName?.substring(0, 15) || "Our Solution",
    innovation: 5,
    price: 4,
    features: 5,
    support: 5,
    market: 3,
  });

  const kpiMetrics = [
    { label: "Target Customers", value: `${Math.round(funding / 100)}+`, trend: 'up' as const, color: '#10B981' },
    { label: "Year 3 Revenue", value: `£${Math.round(year3Revenue / 1000)}K`, trend: 'up' as const, color: '#3B82F6' },
    { label: "Team Size", value: `${jobCreation}`, trend: 'up' as const, color: '#8B5CF6' },
    { label: "LTV/CAC Ratio", value: `${(ltv / cac).toFixed(1)}x`, trend: 'up' as const, color: '#F59E0B' },
  ];

  const fundingAllocation = [
    { category: "Product Development", amount: Math.round(funding * 0.35), percentage: 35 },
    { category: "Marketing & Sales", amount: Math.round(funding * 0.25), percentage: 25 },
    { category: "Operations", amount: Math.round(funding * 0.20), percentage: 20 },
    { category: "Team Hiring", amount: Math.round(funding * 0.15), percentage: 15 },
    { category: "Contingency", amount: Math.round(funding * 0.05), percentage: 5 },
  ];

  const revenueStreams = [
    { stream: "Subscriptions", year1: Math.round(year1Revenue * 0.6), year2: Math.round(year2Revenue * 0.55), year3: Math.round(year3Revenue * 0.5) },
    { stream: "Transaction Fees", year1: Math.round(year1Revenue * 0.25), year2: Math.round(year2Revenue * 0.3), year3: Math.round(year3Revenue * 0.35) },
    { stream: "Enterprise", year1: Math.round(year1Revenue * 0.15), year2: Math.round(year2Revenue * 0.15), year3: Math.round(year3Revenue * 0.15) },
  ];

  const unitEconomics = [
    { metric: "CAC", value: cac, benchmark: cac * 1.3 },
    { metric: "LTV", value: ltv, benchmark: ltv * 0.8 },
    { metric: "LTV/CAC", value: Math.round(ltv / cac * 10) / 10, benchmark: 3 },
    { metric: "Payback (months)", value: Math.round(cac / (ltv / 36)), benchmark: 12 },
  ];

  const hiringTimeline = [
    { role: "Engineering", quarter: "Q1", count: 2 },
    { role: "Sales", quarter: "Q2", count: 1 },
    { role: "Marketing", quarter: "Q3", count: 1 },
    { role: "Customer Success", quarter: "Q4", count: 2 },
    { role: "Operations", quarter: "Q2 Y2", count: 2 },
    { role: "Leadership", quarter: "Q4 Y2", count: 2 },
  ];

  const techStack = [
    { layer: "Frontend", technologies: ["React", "TypeScript", "Tailwind"] },
    { layer: "Backend", technologies: ["Node.js", "Express", "PostgreSQL"] },
    { layer: "Cloud", technologies: ["AWS", "Docker", "CI/CD"] },
    { layer: "AI/ML", technologies: ["OpenAI", "TensorFlow", "Analytics"] },
  ];

  const customerJourney = [
    { stage: "Awareness", conversion: 100, description: "Marketing reach" },
    { stage: "Interest", conversion: 35, description: "Website visits" },
    { stage: "Trial", conversion: 12, description: "Free trial signups" },
    { stage: "Purchase", conversion: 4, description: "Paid conversions" },
    { stage: "Retention", conversion: 3.2, description: "Active customers" },
  ];

  const goToMarketChannels = [
    { channel: "Content Marketing", budget: Math.round(funding * 0.08), expectedROI: 4.2 },
    { channel: "Paid Ads", budget: Math.round(funding * 0.10), expectedROI: 2.8 },
    { channel: "Partnerships", budget: Math.round(funding * 0.05), expectedROI: 5.5 },
    { channel: "Events", budget: Math.round(funding * 0.02), expectedROI: 3.0 },
  ];

  const milestones = [
    { milestone: "MVP Launch", month: 1, status: 'completed' as const },
    { milestone: "First 100 Users", month: 4, status: 'in_progress' as const },
    { milestone: "Seed Funding", month: 6, status: 'planned' as const },
    { milestone: "1000 Customers", month: 12, status: 'planned' as const },
    { milestone: "Break-even", month: 18, status: 'planned' as const },
    { milestone: "Series A", month: 24, status: 'planned' as const },
  ];

  const complianceRoadmap = [
    { requirement: "GDPR Compliance", deadline: "Month 1", status: 'done' as const, priority: 'high' as const },
    { requirement: "ICO Registration", deadline: "Month 2", status: 'done' as const, priority: 'high' as const },
    { requirement: "Data Protection", deadline: "Month 3", status: 'in_progress' as const, priority: 'high' as const },
    { requirement: "Industry Certification", deadline: "Month 6", status: 'pending' as const, priority: 'medium' as const },
    { requirement: "Security Audit", deadline: "Month 9", status: 'pending' as const, priority: 'medium' as const },
  ];

  const growthMetrics = [
    { month: "M1", users: 50, revenue: Math.round(year1Revenue / 12 * 0.1), mrr: Math.round(year1Revenue / 12 * 0.08) },
    { month: "M3", users: 200, revenue: Math.round(year1Revenue / 12 * 0.3), mrr: Math.round(year1Revenue / 12 * 0.25) },
    { month: "M6", users: 500, revenue: Math.round(year1Revenue / 12 * 0.6), mrr: Math.round(year1Revenue / 12 * 0.5) },
    { month: "M9", users: 900, revenue: Math.round(year1Revenue / 12 * 0.85), mrr: Math.round(year1Revenue / 12 * 0.75) },
    { month: "M12", users: 1500, revenue: Math.round(year1Revenue / 12), mrr: Math.round(year1Revenue / 12 * 0.9) },
  ];

  const pricingTiers = [
    { tier: "Starter", price: 49, features: 5, target: "Solo founders" },
    { tier: "Professional", price: 99, features: 12, target: "Small teams" },
    { tier: "Business", price: 199, features: 20, target: "Growing companies" },
    { tier: "Enterprise", price: 499, features: 30, target: "Large organizations" },
  ];

  return {
    financialProjections,
    marketSize,
    timeline,
    riskMatrix,
    competitorComparison,
    kpiMetrics,
    fundingAllocation,
    revenueStreams,
    unitEconomics,
    hiringTimeline,
    techStack,
    customerJourney,
    goToMarketChannels,
    milestones,
    complianceRoadmap,
    growthMetrics,
    pricingTiers,
  };
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

export type ChartType = 'financial' | 'market' | 'risk' | 'competitor' | 'kpi' | 'funding' | 'revenue_streams' | 'unit_economics' | 'hiring' | 'tech_stack' | 'customer_journey' | 'gtm_channels' | 'milestones' | 'compliance' | 'growth' | 'pricing' | 'timeline';

export const SECTION_CHART_MAP: Record<string, ChartType[]> = {
  "Executive Summary": ["kpi"],
  "Business Overview": ["funding"],
  "Problem & Solution": [],
  "Innovation & Technology": ["tech_stack"],
  "Market Analysis": ["market"],
  "Market Size": ["market"],
  "Target Market": ["customer_journey"],
  "Competitive Analysis": ["competitor"],
  "Competition": ["competitor"],
  "Competitive Landscape": ["competitor"],
  "Business Model": ["pricing", "revenue_streams"],
  "Revenue Model": ["revenue_streams", "pricing"],
  "Financial Projections": ["financial", "unit_economics"],
  "Financial Plan": ["financial", "unit_economics"],
  "Financials": ["financial"],
  "Go-to-Market Strategy": ["gtm_channels"],
  "Marketing Strategy": ["gtm_channels"],
  "Growth Strategy": ["growth"],
  "Team & Hiring": ["hiring"],
  "Team": ["hiring"],
  "Hiring Plan": ["hiring"],
  "Risk Assessment": ["risk"],
  "Risk Analysis": ["risk"],
  "Risks": ["risk"],
  "Regulatory Compliance": ["compliance"],
  "Compliance": ["compliance"],
  "Milestones": ["milestones", "timeline"],
  "Implementation Timeline": ["timeline", "milestones"],
  "Roadmap": ["timeline"],
  "Funding Requirements": ["funding"],
  "Use of Funds": ["funding"],
};

export function generateSVGChart(type: ChartType, data: ChartDataPayload): string {
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
  
  const quarters = [...new Set(data.map(d => d.quarter))];
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
