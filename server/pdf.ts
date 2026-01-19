import type { BusinessPlan } from "@shared/schema";
import { generateSVGChart, SECTION_CHART_MAP, type ChartDataPayload, type ChartType } from "./chartGenerator";

// Font family mappings for Google Fonts
const FONT_FAMILIES: Record<string, string> = {
  'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Poppins': "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
  'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Open Sans': "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Source Sans Pro': "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// Generate professional cover page SVG decorations based on theme
function generateCoverPageSVG(themeId: string | null, primaryColor: string, secondaryColor?: string): { topRight: string; bottomLeft: string; bottomRight: string; topLeft: string; middleSection: string; style: string } {
  const isBlueTheme = themeId === 'blue-modern' || primaryColor.includes('1d4ed8') || primaryColor.includes('2563eb') || primaryColor.includes('3b82f6');
  const isCorporateTheme = themeId === 'white-red-corporate';
  const isNavyDiagonal = themeId === 'navy-diagonal';
  const isCyanModern = themeId === 'cyan-modern';
  const accentColor = secondaryColor || '#1e293b';
  
  if (isNavyDiagonal) {
    // Navy Corporate Profile - diagonal stripes with dark overlay
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="100" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 400,0 400,120 50,120" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="0,30 400,30 400,90 30,90" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 600,100 600,200 0,100" fill="${accentColor}" opacity="0.85"/>
        </svg>
      `,
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,50 200,200 0,200" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,100 150,200 0,200" fill="${primaryColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,0 400,200 400,0" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="200,0 400,150 400,0" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'navy-diagonal'
    };
  } else if (isCyanModern) {
    // Cyan Modern Proposal - cyan with black geometric accents
    return {
      topLeft: `
        <svg class="cover-decoration-top-left" viewBox="0 0 150 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="150" height="80" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
          <polygon points="80,0 400,0 400,300 200,350" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="150,30 380,30 380,280 220,320" fill="white" stroke="${primaryColor}" stroke-width="3" opacity="0.3"/>
          <polygon points="200,60 360,60 360,250 240,280" fill="white" stroke="${primaryColor}" stroke-width="2" opacity="0.2"/>
        </svg>
      `,
      middleSection: `
        <svg class="cover-decoration-middle" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,50 350,150 600,150 600,50 400,0 0,0" fill="${accentColor}" opacity="0.95"/>
        </svg>
      `,
      bottomLeft: '',
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,150 200,150 200,50" fill="${primaryColor}" opacity="0.95"/>
          <polygon points="50,150 200,150 200,80" fill="${primaryColor}" opacity="0.7"/>
        </svg>
      `,
      style: 'cyan-modern'
    };
  } else if (isCorporateTheme) {
    // Corporate Geometric Theme - triangles and diagonal stripes
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,0 400,0 400,250" fill="${accentColor}" opacity="0.95"/>
          <polygon points="280,0 400,0 400,120" fill="${primaryColor}" opacity="0.9"/>
          <polygon points="200,0 280,0 400,80 400,0" fill="${primaryColor}" opacity="0.6"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,250 0,400 150,400" fill="${accentColor}" opacity="0.95"/>
          <polygon points="0,320 0,400 80,400" fill="${accentColor}" opacity="0.8"/>
        </svg>
      `,
      bottomRight: `
        <svg class="cover-decoration-corner" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,200 300,200 300,0" fill="${accentColor}" opacity="0.95"/>
          <g transform="translate(150, 80)">
            <rect x="0" y="0" width="8" height="40" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="20" y="0" width="8" height="50" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="40" y="0" width="8" height="60" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
            <rect x="60" y="0" width="8" height="70" fill="${primaryColor}" transform="rotate(-45)" opacity="0.8"/>
          </g>
        </svg>
      `,
      style: 'corporate-geometric'
    };
  } else if (isBlueTheme) {
    // Blue Modern Theme - curved shapes with circles
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.6" />
            </linearGradient>
          </defs>
          <path d="M400,0 L400,400 C300,380 200,300 150,200 C100,100 50,50 0,0 Z" fill="url(#blueGrad1)" opacity="0.3"/>
          <path d="M400,0 L400,350 C320,330 240,270 180,180 C120,90 60,40 0,0 Z" fill="${primaryColor}" opacity="0.5"/>
          <path d="M400,0 L400,280 C340,260 280,220 220,150 C160,80 80,30 0,0 Z" fill="${primaryColor}" opacity="0.8"/>
          <circle cx="350" cy="120" r="40" fill="${primaryColor}" opacity="0.9"/>
          <circle cx="280" cy="60" r="20" fill="${primaryColor}" opacity="0.7"/>
          <circle cx="380" cy="200" r="15" fill="${primaryColor}" opacity="0.5"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.4" />
            </linearGradient>
          </defs>
          <path d="M0,400 L0,0 C100,20 200,100 250,200 C300,300 350,350 400,400 Z" fill="url(#blueGrad2)" opacity="0.3"/>
          <path d="M0,400 L0,50 C80,70 160,130 220,220 C280,310 340,360 400,400 Z" fill="${primaryColor}" opacity="0.5"/>
          <path d="M0,400 L0,120 C60,140 120,180 180,250 C240,320 320,370 400,400 Z" fill="${primaryColor}" opacity="0.8"/>
          <path d="M0,400 L150,400 L0,250 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      bottomRight: '',
      style: 'blue-modern'
    };
  } else {
    // Red/Default Modern Theme - wave patterns
    return {
      topLeft: '',
      topRight: `
        <svg class="cover-decoration-top" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.7" />
            </linearGradient>
          </defs>
          <path d="M400,0 C350,50 300,80 250,100 C180,130 120,180 100,250 C80,320 100,360 150,400 L400,400 Z" fill="url(#redGrad1)" opacity="0.15"/>
          <path d="M400,0 C360,30 320,50 280,70 C220,100 170,150 150,220 C130,290 160,350 220,400 L400,400 Z" fill="${primaryColor}" opacity="0.4"/>
          <path d="M400,0 C380,20 350,35 320,50 C270,80 230,130 220,200 C210,270 250,340 320,400 L400,400 Z" fill="${primaryColor}" opacity="0.7"/>
          <path d="M400,0 L400,400 C360,350 340,280 340,200 C340,120 360,60 400,0 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      middleSection: '',
      bottomLeft: `
        <svg class="cover-decoration-bottom" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.7" />
            </linearGradient>
          </defs>
          <path d="M0,400 C50,350 80,300 100,250 C130,180 180,120 250,100 C320,80 360,100 400,150 L400,400 Z" fill="url(#redGrad2)" opacity="0.15"/>
          <path d="M0,400 C30,360 50,320 70,280 C100,220 150,170 220,150 C290,130 350,160 400,220 L400,400 Z" fill="${primaryColor}" opacity="0.4"/>
          <path d="M0,400 C20,380 35,350 50,320 C80,270 130,230 200,220 C270,210 340,250 400,320 L400,400 Z" fill="${primaryColor}" opacity="0.7"/>
          <path d="M0,400 L0,0 C60,40 80,120 80,200 C80,280 60,340 0,400 Z" fill="${primaryColor}" opacity="0.95"/>
        </svg>
      `,
      bottomRight: '',
      style: 'red-modern'
    };
  }
}

export function generatePDFContent(plan: BusinessPlan): string {
  const content = plan.generatedContent || "Business plan content not yet generated.";
  
  // Theme settings - use plan's theme or defaults
  const primaryColor = plan.themePrimaryColor || '#005EB8';
  const secondaryColor = plan.themeSecondaryColor || '#1e3a5f';
  const themeFont = plan.themeFont || 'Inter';
  const fontFamily = FONT_FAMILIES[themeFont] || FONT_FAMILIES['Inter'];
  
  let chartData: ChartDataPayload | null = null;
  if (plan.chartData) {
    try {
      chartData = JSON.parse(plan.chartData) as ChartDataPayload;
    } catch (e) {
      console.error('Failed to parse chart data:', e);
    }
  }
  
  // Generate Google Fonts import URL for the selected font
  const fontImport = `https://fonts.googleapis.com/css2?family=${themeFont.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.businessName} - Business Plan</title>
  <link rel="stylesheet" href="${fontImport}">
  <style>
    @page {
      margin: 2.5cm;
    }
    @page cover {
      margin: 0;
    }
    body {
      font-family: ${fontFamily};
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 28pt;
      color: ${primaryColor};
      border-bottom: 3px solid ${primaryColor};
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 20pt;
      color: ${primaryColor};
      margin-top: 40px;
      margin-bottom: 15px;
    }
    h3 {
      font-size: 16pt;
      color: ${secondaryColor};
      margin-top: 25px;
      margin-bottom: 10px;
    }
    h4 {
      font-size: 13pt;
      color: #333;
      margin-top: 20px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    p {
      font-size: 11pt;
      text-align: justify;
      margin-bottom: 12px;
    }
    .cover-page {
      position: relative;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
      page: cover;
      page-break-before: avoid;
      page-break-after: always;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0;
      margin: -20px;
      margin-bottom: 40px;
      box-sizing: border-box;
    }
    .cover-decoration-top {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 280px;
      z-index: 1;
    }
    .cover-decoration-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 250px;
      height: 250px;
      z-index: 1;
    }
    .cover-decoration-corner {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 200px;
      height: 140px;
      z-index: 1;
    }
    .cover-decoration-top-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;
      height: 70px;
      z-index: 1;
    }
    .cover-decoration-middle {
      position: absolute;
      top: 45%;
      left: 0;
      width: 100%;
      height: 120px;
      z-index: 1;
    }
    .cover-content {
      position: relative;
      z-index: 10;
      padding: 50px 60px;
      text-align: left;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .cover-header {
      margin-bottom: 40px;
    }
    .cover-main-title {
      font-size: 60pt;
      font-weight: 800;
      line-height: 1;
      margin: 0;
      letter-spacing: -2px;
    }
    .cover-main-title .word-business {
      color: #1a1a2e;
      display: block;
    }
    .cover-main-title .word-plan {
      color: ${primaryColor};
      display: block;
    }
    .cover-subtitle-line {
      width: 80px;
      height: 3px;
      background: #1a1a2e;
      margin: 20px 0;
    }
    .cover-business-name {
      font-size: 18pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cover-tagline {
      font-size: 12pt;
      color: #555;
      margin-bottom: 30px;
    }
    .cover-year {
      font-size: 52pt;
      font-weight: 800;
      color: #1a1a2e;
      margin: 20px 0;
      letter-spacing: -2px;
    }
    .cover-metadata {
      position: absolute;
      bottom: 60px;
      left: 60px;
      z-index: 10;
    }
    .cover-prepared-by {
      font-size: 10pt;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .cover-industry {
      font-size: 14pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
    }
    .cover-contact {
      font-size: 10pt;
      color: #666;
      line-height: 1.8;
    }
    .cover-contact span {
      display: block;
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
      background-color: ${primaryColor};
      font-weight: bold;
      color: white;
    }
    .financial-table th {
      background-color: ${primaryColor};
      color: white;
    }
    .financial-table td {
      padding: 12px;
    }
    .financial-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .toc {
      background: #f8fafc;
      padding: 30px;
      border-radius: 8px;
      margin: 30px 0;
      page-break-after: always;
      border-left: 4px solid ${primaryColor};
    }
    .toc h2 {
      color: ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .toc ol {
      list-style: none;
      padding: 0;
      counter-reset: toc-counter;
    }
    .toc li {
      counter-increment: toc-counter;
      padding: 8px 0;
      border-bottom: 1px dotted #ddd;
      font-size: 12pt;
    }
    .toc li::before {
      content: counter(toc-counter) ". ";
      color: ${primaryColor};
      font-weight: bold;
    }
    .toc a {
      color: #1a1a1a;
      text-decoration: none;
    }
    .toc a:hover {
      color: ${primaryColor};
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
      border-top: 2px solid ${primaryColor};
      padding-top: 30px;
    }
    strong {
      color: ${secondaryColor};
      font-weight: 600;
    }
    .chart-container {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
      border-top: 3px solid ${primaryColor};
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
  ${generateCoverPageHTML(plan, primaryColor, secondaryColor)}
  
  <div class="content">
    ${formatContentWithCharts(content, chartData, primaryColor)}
  </div>
</body>
</html>
  `;
  
  return html;
}

function generateCoverPageHTML(plan: BusinessPlan, primaryColor: string, secondaryColor: string): string {
  const themeId = plan.themeId || null;
  const decorations = generateCoverPageSVG(themeId, primaryColor, secondaryColor);
  const currentYear = new Date().getFullYear();
  const generatedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const tierDisplay = plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1);
  
  return `
  <div class="cover-page">
    ${decorations.topLeft || ''}
    ${decorations.topRight}
    ${decorations.middleSection || ''}
    ${decorations.bottomLeft}
    ${decorations.bottomRight || ''}
    
    <div class="cover-content">
      <div class="cover-header">
        <h1 class="cover-main-title">
          <span class="word-business">BUSINESS</span>
          <span class="word-plan">PLAN</span>
        </h1>
        <div class="cover-subtitle-line"></div>
        <div class="cover-business-name">${plan.businessName}</div>
        <div class="cover-tagline">UK Innovator Founder Visa Application</div>
      </div>
      
      <div class="cover-year">${currentYear}</div>
    </div>
    
    <div class="cover-metadata">
      <div class="cover-prepared-by">Prepared By:</div>
      <div class="cover-industry">${plan.industry}</div>
      <div class="cover-contact">
        <span>Tier: ${tierDisplay}</span>
        <span>Generated: ${generatedDate}</span>
      </div>
    </div>
  </div>
  `;
}

function formatContentWithCharts(markdown: string, chartData: ChartDataPayload | null, primaryColor: string): string {
  const lines = markdown.split('\n');
  let html = '';
  let currentSection = '';
  let lastH2Title = '';
  const usedCharts = new Set<ChartType>();
  
  let inToc = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ')) {
      const sectionTitle = line.slice(3).trim();
      const normalizedTitle = sectionTitle.replace(/^\d+\.\s*/, '').toLowerCase().trim();
      const normalizedLast = lastH2Title.replace(/^\d+\.\s*/, '').toLowerCase().trim();
      
      if (normalizedTitle === normalizedLast) {
        continue;
      }
      
      // Handle TABLE OF CONTENTS section specially
      if (sectionTitle.toUpperCase() === 'TABLE OF CONTENTS') {
        inToc = true;
        html += `<div class="toc"><h2>${sectionTitle}</h2><ol>\n`;
        continue;
      } else if (inToc) {
        // Close TOC section when we hit the next section
        html += `</ol></div>\n`;
        inToc = false;
      }
      
      currentSection = sectionTitle;
      lastH2Title = sectionTitle;
      const sectionId = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      html += `<h2 id="${sectionId}">${sectionTitle}</h2>\n`;
      
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
    } else if (line.startsWith('#### ')) {
      html += `<h4>${line.slice(5)}</h4>\n`;
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
        // If we're in the Table of Contents, format as TOC item with link
        if (inToc) {
          // Extract link text from markdown link format [text](#anchor)
          const linkMatch = match[1].match(/\[([^\]]+)\]\(#([^)]+)\)/);
          if (linkMatch) {
            html += `<li><a href="#${linkMatch[2]}">${linkMatch[1]}</a></li>\n`;
          } else {
            html += `<li>${formatInline(match[1])}</li>\n`;
          }
        } else {
          if (!html.endsWith('</ol>\n') && (!html.includes('<ol>') || html.lastIndexOf('</ol>') > html.lastIndexOf('<ol>'))) {
            html += '<ol>\n';
          }
          html += `<li>${formatInline(match[1])}</li>\n`;
          const nextLine = lines[i + 1]?.trim() || '';
          if (!/^\d+\.\s/.test(nextLine)) {
            html += '</ol>\n';
          }
        }
      }
    } else if (line === '---') {
      // Close TOC if we hit a separator while still in TOC
      if (inToc) {
        html += `</ol></div>\n`;
        inToc = false;
      }
      html += '<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">\n';
    } else if (line.length > 0) {
      html += `<p>${formatInline(line)}</p>\n`;
    }
  }
  
  // Close TOC if we're still in it at the end of content
  if (inToc) {
    html += `</ol></div>\n`;
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
      html += `<div style="page-break-before: always;"><h2 style="color: ${primaryColor};">Additional Visual Analytics</h2>\n`;
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
