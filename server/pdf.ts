import type { BusinessPlan } from "@shared/schema";
import { generateSVGChart, type ChartDataPayload } from "./chartGenerator";

export function generatePDFContent(plan: BusinessPlan): string {
  const content = plan.generatedContent || "Business plan content not yet generated.";
  
  let chartHtml = '';
  if (plan.chartData) {
    try {
      const chartData = JSON.parse(plan.chartData) as ChartDataPayload;
      chartHtml = `
        <div class="charts-section" style="page-break-before: always; margin-top: 40px;">
          <h2 style="color: #005EB8; border-bottom: 2px solid #005EB8; padding-bottom: 10px;">Visual Analytics & Charts</h2>
          
          <div class="chart-container" style="margin: 30px 0; text-align: center;">
            <h3>Financial Projections</h3>
            ${generateSVGChart('financial', chartData)}
          </div>
          
          <div class="chart-container" style="margin: 30px 0; text-align: center; page-break-before: always;">
            <h3>Market Size Analysis</h3>
            ${generateSVGChart('market', chartData)}
          </div>
          
          <div class="chart-container" style="margin: 30px 0; text-align: center; page-break-before: always;">
            <h3>Risk Assessment</h3>
            ${generateSVGChart('risk', chartData)}
          </div>
          
          <div class="chart-container" style="margin: 30px 0; text-align: center; page-break-before: always;">
            <h3>Competitive Analysis</h3>
            ${generateSVGChart('competitor', chartData)}
          </div>
        </div>
      `;
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
      margin: 20px 0;
    }
    .chart-container svg {
      max-width: 100%;
      height: auto;
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
    ${formatContent(content)}
  </div>
  
  ${chartHtml}
</body>
</html>
  `;
  
  return html;
}

function formatContent(markdown: string): string {
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
  
  html = '<p>' + html + '</p>';
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ol>$1</ol>');
  html = html.replace(/<\/p>\s*<p>/g, '</p><p>');
  
  return html;
}

export function generatePDFUrl(planId: string): string {
  return `/api/download/pdf/${planId}`;
}
