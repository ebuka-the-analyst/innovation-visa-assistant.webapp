import type { BusinessPlan } from "@shared/schema";

export function generatePDFContent(plan: BusinessPlan): string {
  const content = plan.generatedContent || "Business plan content not yet generated.";
  
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
      color: #11b6e9;
      border-bottom: 3px solid #11b6e9;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 20pt;
      color: #0093d9;
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
      color: #11b6e9;
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
