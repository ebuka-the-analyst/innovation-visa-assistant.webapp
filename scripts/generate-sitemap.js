/**
 * Automated Sitemap Generator for UK Innovator Founder Visa Assistant
 * Generates sitemap.xml with all 109 tool pages + main pages
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://innovatorfoundervisaassistant.co.uk';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// All 109 tool pages (organized by category)
const toolPages = {
  compliance: [
    'compliance-checker',
    'requirement-tracker',
    'eligibility-assessment',
    'document-checklist',
    'regulation-monitor',
    'visa-timeline',
    'fee-calculator',
    'home-office-updates',
    'compliance-score',
    'deadline-manager',
    'rule-interpreter',
    'change-monitor',
    'compliance-report'
  ],
  documentation: [
    'document-organizer',
    'template-library',
    'evidence-builder',
    'letter-generator',
    'cv-optimizer',
    'reference-manager',
    'translation-checker',
    'document-validator',
    'submission-packager',
    'version-control',
    'format-converter',
    'qr-code-generator',
    'digital-signature'
  ],
  team: [
    'co-founder-matcher',
    'team-builder',
    'skills-gap-analysis',
    'hiring-planner',
    'org-chart-designer',
    'equity-calculator',
    'team-dynamics',
    'advisor-network',
    'remote-team-guide',
    'culture-builder',
    'performance-tracker',
    'team-assessment',
    'conflict-resolver'
  ],
  business: [
    'business-plan',
    'market-research',
    'competitor-analysis',
    'business-model-canvas',
    'value-proposition',
    'customer-persona',
    'go-to-market',
    'product-roadmap',
    'pricing-strategy',
    'revenue-model',
    'swot-analysis',
    'risk-assessment',
    'pivot-planner'
  ],
  financial: [
    'financial-projections',
    'cash-flow-forecast',
    'budget-planner',
    'funding-tracker',
    'investor-pitch-deck',
    'cap-table-manager',
    'burn-rate-calculator',
    'unit-economics',
    'financial-metrics',
    'valuation-calculator',
    'scenario-planner',
    'grant-finder',
    'tax-planner'
  ],
  growth: [
    'growth-strategy',
    'marketing-plan',
    'sales-funnel',
    'customer-acquisition',
    'retention-strategy',
    'expansion-planner',
    'partnership-finder',
    'channel-strategy',
    'brand-builder',
    'content-calendar',
    'seo-strategy',
    'social-media-planner',
    'analytics-dashboard'
  ],
  innovation: [
    'innovation-score',
    'ip-strategy',
    'patent-guide',
    'r-and-d-planner',
    'tech-roadmap',
    'prototype-planner',
    'mvp-builder',
    'innovation-metrics',
    'disruption-analyzer',
    'trend-tracker',
    'competitive-moat',
    'innovation-pipeline',
    'ideation-framework'
  ],
  defense: [
    'pitch-coach',
    'interview-prep',
    'objection-handler',
    'endorser-comparison',
    'application-reviewer',
    'rejection-analysis',
    'appeal-builder',
    'rfe-defence-lab',
    'evidence-graph',
    'success-predictor',
    'mock-interview',
    'feedback-analyzer',
    'improvement-tracker'
  ]
};

// Main pages
const mainPages = [
  { url: '', priority: '1.0', changefreq: 'daily' },
  { url: 'pricing', priority: '0.9', changefreq: 'weekly' },
  { url: 'tools-hub', priority: '0.9', changefreq: 'weekly' },
  { url: 'faq', priority: '0.8', changefreq: 'monthly' },
  { url: 'guide', priority: '0.8', changefreq: 'monthly' },
  { url: 'privacy', priority: '0.7', changefreq: 'yearly' },
  { url: 'terms', priority: '0.7', changefreq: 'yearly' },
  { url: 'cookies', priority: '0.7', changefreq: 'yearly' },
  { url: 'login', priority: '0.6', changefreq: 'monthly' },
  { url: 'signup', priority: '0.6', changefreq: 'monthly' },
  { url: 'features', priority: '0.7', changefreq: 'monthly' },
  { url: 'dashboard', priority: '0.5', changefreq: 'monthly' }
];

function generateSitemap() {
  const now = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add main pages
  mainPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add all 109 tool pages
  Object.entries(toolPages).forEach(([category, tools]) => {
    tools.forEach(tool => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/tools/${tool}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
  });
  
  xml += '</urlset>';
  
  // Write to public folder
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  
  // Calculate total URLs
  const toolCount = Object.values(toolPages).reduce((sum, tools) => sum + tools.length, 0);
  const totalUrls = mainPages.length + toolCount;
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📄 Location: ${OUTPUT_PATH}`);
  console.log(`🔗 Total URLs: ${totalUrls}`);
  console.log(`   - Main pages: ${mainPages.length}`);
  console.log(`   - Tool pages: ${toolCount}`);
  console.log(`📅 Last modified: ${now}`);
  console.log('\n📋 Tool breakdown by category:');
  Object.entries(toolPages).forEach(([category, tools]) => {
    console.log(`   - ${category}: ${tools.length} tools`);
  });
}

// Run the generator
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
