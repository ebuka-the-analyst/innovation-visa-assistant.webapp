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

  return {
    financialProjections,
    marketSize,
    timeline,
    riskMatrix,
    competitorComparison,
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

export function generateSVGChart(type: 'financial' | 'market' | 'risk' | 'competitor', data: ChartDataPayload): string {
  switch (type) {
    case 'financial':
      return generateFinancialChart(data.financialProjections);
    case 'market':
      return generateMarketChart(data.marketSize);
    case 'risk':
      return generateRiskMatrix(data.riskMatrix);
    case 'competitor':
      return generateCompetitorChart(data.competitorComparison);
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
