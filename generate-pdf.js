const { jsPDF } = require('jspdf');
const fs = require('fs');

const doc = new jsPDF();
let y = 20;

const addTitle = (text, size = 16) => {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 20, y);
  y += size / 2 + 4;
};

const addSubtitle = (text) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 20, y);
  y += 8;
};

const addText = (text, indent = 20) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, 170);
  doc.text(lines, indent, y);
  y += lines.length * 5 + 3;
};

const addBullet = (text) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, 165);
  doc.text('-', 20, y);
  doc.text(lines, 25, y);
  y += lines.length * 5 + 2;
};

const checkPage = () => {
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
};

// Title
addTitle('UK INNOVATOR FOUNDER VISA ASSISTANT', 18);
addTitle('Influencer Marketing Brief', 14);
y += 5;

// About
addSubtitle('ABOUT THE PLATFORM');
addText("The UK Innovator Founder Visa Assistant is Britain's first AI-powered visa application platform, launched November 2025. It transforms the complex 5,000-15,000 GBP immigration lawyer process into an accessible, guided experience for entrepreneurs worldwide.");
y += 5;

// Problem
checkPage();
addSubtitle('THE PROBLEM WE SOLVE');
addBullet('UK visa applications are notoriously complex with 50+ page requirements');
addBullet('Immigration lawyers charge 5,000-15,000+ GBP per application');
addBullet('40% of applications fail due to documentation errors');
addBullet('Applicants often wait months only to be rejected for preventable mistakes');
y += 5;

// Target Audience
checkPage();
addSubtitle('TARGET AUDIENCE');
addBullet('International Entrepreneurs - Founders from US, India, Nigeria, UAE, China wanting UK market access');
addBullet('Tech Startup Founders - Those seeking London fintech/AI ecosystem');
addBullet('E-commerce Entrepreneurs - Business owners wanting UK/EU distribution base');
addBullet('Professionals Seeking Change - Corporate employees ready to launch their own venture');
addBullet('Students and Graduates - Recent grads wanting to stay and build in the UK');
y += 5;

// Features
checkPage();
addSubtitle('PLATFORM FEATURES (109+ PROFESSIONAL TOOLS)');
y += 3;

addText('1. COMPLIANCE TOOLS', 20);
addBullet('Endorsing Body Matcher - matches your business to the right visa sponsor');
addBullet('Compliance Checker - ensures 100% OISC regulatory compliance');
addBullet('Document Validator - catches errors before submission');
checkPage();

addText('2. BUSINESS PLANNING SUITE', 20);
addBullet('AI Business Plan Generator - creates investor-ready plans');
addBullet('Market Analysis Tool - UK market research and sizing');
addBullet('Financial Projections Builder - 3-5 year forecasts');
checkPage();

addText('3. DOCUMENTATION CENTRE', 20);
addBullet('Personal Statement Writer - compelling founder narratives');
addBullet('CV/Resume Builder - UK-formatted professional profiles');
addBullet('Supporting Evidence Organizer - document management');
checkPage();

addText('4. AI-POWERED GUIDANCE', 20);
addBullet('4 Specialist AI Agents (Nova, Sterling, Atlas, Sage)');
addBullet('24/7 instant answers to visa questions');
addBullet('Interview preparation simulations');
addBullet('Real-time compliance scoring');

// New page for selling points
doc.addPage();
y = 20;

addSubtitle('KEY SELLING POINTS');
addBullet('Save 10,000+ GBP - Replaces expensive immigration lawyers');
addBullet('93.1% Quality Score - Professional-grade outputs');
addBullet('100% Submission-Ready - Documents meet Home Office standards');
addBullet('109 Expert Tools - Every aspect of the application covered');
addBullet('OISC Compliant - Meets UK regulatory requirements');
addBullet('AI-Powered - Instant, intelligent guidance 24/7');
addBullet('Progress Tracking - Never lose your work, auto-saves everything');
addBullet('Export Everything - PDF, Word, QR code sharing');
y += 5;

// Pricing
addSubtitle('TIER PRICING STRUCTURE');
addBullet('Free Tier - Basic tools to get started');
addBullet('Basic - Essential documentation tools');
addBullet('Premium - Full business planning suite');
addBullet('Enterprise - Complete visa package with priority support');
addBullet('Ultimate - White-glove service with lawyer review');
y += 5;

// Content Angles
checkPage();
addSubtitle('CONTENT ANGLES FOR PROMOTION');
y += 2;
addText('Educational Content:', 20);
addBullet('The 5 reasons UK visa applications get rejected');
addBullet('What is an Innovator Founder Visa? Explained in 60 seconds');
addBullet('Documents you NEED for a UK business visa');

checkPage();
addText('Transformation Stories:', 20);
addBullet('From idea to UK visa approval - the journey');
addBullet('How entrepreneurs are moving to London in 2025');

addText('Problem/Solution:', 20);
addBullet('Lawyers wanted 8,000 GBP for this... I did it myself');
addBullet('The tool that is replacing visa lawyers');

// New page
doc.addPage();
y = 20;

addSubtitle('SUGGESTED HASHTAGS');
addText('#UKVisa #InnovatorFounderVisa #MoveToLondon #StartupUK #UKBusiness #Entrepreneur #ImmigrationTips #BusinessVisa #UKImmigration #FounderLife #StartupLife #TechFounder #GlobalEntrepreneur #LondonStartups #VisaGuide #UKDreams');
y += 5;

addSubtitle('CALL-TO-ACTION OPTIONS');
addBullet('Start your free visa assessment at [link]');
addBullet('See if you qualify for a UK visa - link in bio');
addBullet('Build your UK business plan free at [link]');
addBullet('Join 1000s of founders using [link] to get their UK visa');
y += 5;

addSubtitle('BRAND VOICE GUIDELINES');
addBullet('Tone: Professional yet approachable, empowering, optimistic');
addBullet('Avoid: Legal jargon, false promises, guaranteeing visa approval');
addBullet('Emphasize: Simplicity, savings, expert-quality results');

// Save
const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync('./attached_assets/Influencer_Marketing_Brief.pdf', Buffer.from(pdfOutput));
console.log('PDF created: attached_assets/Influencer_Marketing_Brief.pdf');
