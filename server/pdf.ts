import type { BusinessPlan } from "@shared/schema";
import { generateSVGChart, SECTION_CHART_MAP, type ChartDataPayload, type ChartType } from "./chartGenerator";

export function generatePDFContent(plan: BusinessPlan): string {
  const content = plan.generatedContent || "Business plan content not yet generated.";
  
  let chartData: ChartDataPayload | null = null;
  if (plan.chartData) {
    try {
      chartData = JSON.parse(plan.chartData) as ChartDataPayload;
    } catch (e) {
      console.error('Failed to parse chart data:', e);
    }
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.businessName} - Business Plan</title>
  <style>
    @page {
      margin: 2.5cm;
    }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 28pt;
      color: #005EB8;
      border-bottom: 3px solid #005EB8;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 20pt;
      color: #005EB8;
      margin-top: 40px;
      margin-bottom: 15px;
    }
    h3 {
      font-size: 16pt;
      color: #1a1a1a;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    p {
      font-size: 11pt;
      text-align: justify;
      margin-bottom: 12px;
    }
    .cover-page {
      text-align: center;
      padding: 100px 0;
      page-break-after: always;
    }
    .cover-title {
      font-size: 36pt;
      font-weight: bold;
      color: #005EB8;
      margin-bottom: 20px;
    }
    .cover-subtitle {
      font-size: 18pt;
      color: #666;
      margin-bottom: 40px;
    }
    .metadata {
      font-size: 12pt;
      color: #888;
      margin-top: 60px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
      color: #005EB8;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin-bottom: 8px;
      font-size: 11pt;
    }
    .section-break {
      margin-top: 50px;
      border-top: 2px solid #e0e0e0;
      padding-top: 30px;
    }
    strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    .chart-container {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    .chart-container svg {
      max-width: 100%;
      height: auto;
    }
    .inline-chart {
      margin: 20px auto;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-title">${plan.businessName}</div>
    <div class="cover-subtitle">UK Innovation Visa Business Plan</div>
    <div class="metadata">
      <p>Industry: ${plan.industry}</p>
      <p>Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>Tier: ${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}</p>
    </div>
  </div>
  
  <div class="content">
    ${formatContentWithCharts(content, chartData)}
  </div>
</body>
</html>
  `;
  
  return html;
}

function formatContentWithCharts(markdown: string, chartData: ChartDataPayload | null): string {
  const lines = markdown.split('\n');
  let html = '';
  let currentSection = '';
  const usedCharts = new Set<ChartType>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ')) {
      const sectionTitle = line.slice(3).trim();
      currentSection = sectionTitle;
      html += `<h2>${sectionTitle}</h2>\n`;
      
      if (chartData) {
        const chartsForSection = findChartsForSection(sectionTitle);
        for (const chartType of chartsForSection) {
          if (!usedCharts.has(chartType)) {
            usedCharts.add(chartType);
            try {
              const svg = generateSVGChart(chartType, chartData);
              if (svg) {
                html += `<div class="chart-container inline-chart">${svg}</div>\n`;
              }
            } catch (e) {
              console.error(`Failed to generate ${chartType} chart:`, e);
            }
          }
        }
      }
    } else if (line.startsWith('# ')) {
      html += `<h1>${line.slice(2)}</h1>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>\n`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!html.endsWith('</ul>\n') && !html.includes('<ul>') || html.lastIndexOf('</ul>') > html.lastIndexOf('<ul>')) {
        html += '<ul>\n';
      }
      html += `<li>${formatInline(line.slice(2))}</li>\n`;
      const nextLine = lines[i + 1]?.trim() || '';
      if (!nextLine.startsWith('- ') && !nextLine.startsWith('* ')) {
        html += '</ul>\n';
      }
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^\d+\.\s(.+)$/);
      if (match) {
        if (!html.endsWith('</ol>\n') && (!html.includes('<ol>') || html.lastIndexOf('</ol>') > html.lastIndexOf('<ol>'))) {
          html += '<ol>\n';
        }
        html += `<li>${formatInline(match[1])}</li>\n`;
        const nextLine = lines[i + 1]?.trim() || '';
        if (!/^\d+\.\s/.test(nextLine)) {
          html += '</ol>\n';
        }
      }
    } else if (line === '---') {
      html += '<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">\n';
    } else if (line.length > 0) {
      html += `<p>${formatInline(line)}</p>\n`;
    }
  }
  
  if (chartData) {
    const remainingCharts: ChartType[] = [];
    const allChartTypes: ChartType[] = ['kpi', 'funding', 'financial', 'market', 'revenue_streams', 'unit_economics', 
      'customer_journey', 'competitor', 'gtm_channels', 'growth', 'hiring', 'tech_stack', 
      'risk', 'compliance', 'milestones', 'timeline', 'pricing'];
    
    for (const chartType of allChartTypes) {
      if (!usedCharts.has(chartType)) {
        remainingCharts.push(chartType);
      }
    }
    
    if (remainingCharts.length > 0) {
      html += '<div style="page-break-before: always;"><h2 style="color: #005EB8;">Additional Visual Analytics</h2>\n';
      for (const chartType of remainingCharts) {
        try {
          const svg = generateSVGChart(chartType, chartData);
          if (svg) {
            html += `<div class="chart-container inline-chart">${svg}</div>\n`;
          }
        } catch (e) {
          console.error(`Failed to generate ${chartType} chart:`, e);
        }
      }
      html += '</div>';
    }
  }
  
  return html;
}

function findChartsForSection(sectionTitle: string): ChartType[] {
  for (const [key, charts] of Object.entries(SECTION_CHART_MAP)) {
    if (sectionTitle.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(sectionTitle.toLowerCase().split(' ')[0])) {
      return charts;
    }
  }
  
  const keywords: Record<string, ChartType[]> = {
    'executive': ['kpi'],
    'summary': ['kpi'],
    'overview': ['funding', 'kpi'],
    'financial': ['financial', 'unit_economics'],
    'finance': ['financial', 'unit_economics'],
    'revenue': ['revenue_streams', 'pricing'],
    'money': ['financial', 'funding'],
    'market': ['market', 'customer_journey'],
    'customer': ['customer_journey'],
    'target': ['customer_journey', 'market'],
    'competitor': ['competitor'],
    'competition': ['competitor'],
    'pricing': ['pricing'],
    'business model': ['pricing', 'revenue_streams'],
    'team': ['hiring'],
    'hiring': ['hiring'],
    'people': ['hiring'],
    'technology': ['tech_stack'],
    'tech': ['tech_stack'],
    'innovation': ['tech_stack'],
    'risk': ['risk'],
    'compliance': ['compliance'],
    'regulatory': ['compliance'],
    'legal': ['compliance'],
    'growth': ['growth'],
    'scale': ['growth', 'timeline'],
    'marketing': ['gtm_channels'],
    'go-to-market': ['gtm_channels'],
    'gtm': ['gtm_channels'],
    'milestone': ['milestones'],
    'roadmap': ['timeline', 'milestones'],
    'timeline': ['timeline'],
    'plan': ['milestones'],
    'funding': ['funding'],
    'investment': ['funding'],
  };
  
  const lowerTitle = sectionTitle.toLowerCase();
  for (const [keyword, charts] of Object.entries(keywords)) {
    if (lowerTitle.includes(keyword)) {
      return charts;
    }
  }
  
  return [];
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>');
}

export function generatePDFUrl(planId: string): string {
  return `/api/download/pdf/${planId}`;
}
