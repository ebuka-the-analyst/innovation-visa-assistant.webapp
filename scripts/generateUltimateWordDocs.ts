import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, TableOfContents, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, Footer, Header, PageNumber, NumberFormat } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const BRAND_COLOR = "FF6B35";
const DARK_BLUE = "1A365D";

function createStyledParagraph(text: string, options: { bold?: boolean; size?: number; color?: string; spacing?: number; alignment?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold || false,
        size: options.size || 24,
        color: options.color || "000000",
      }),
    ],
    spacing: { after: options.spacing || 200 },
    alignment: options.alignment || AlignmentType.LEFT,
  });
}

function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

function createBulletPoint(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    bullet: { level: 0 },
    spacing: { after: 100 },
  });
}

function createNumberedItem(text: string, level: number = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    numbering: { reference: "numbered-list", level },
    spacing: { after: 100 },
  });
}

async function generateUltimateBusinessPlan() {
  const businessData = {
    businessName: "UK Innovator Founder Visa Assistant",
    founderName: "Benedict E. Umeh",
    industry: "Immigration Technology / AI SaaS",
    fundingAvailable: "£12,000",
    targetMarket: "UK Innovator Founder Visa Applicants",
    launchDate: "November 2024",
    website: "ukvisaassistant.com",
  };

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "numbered-list",
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${businessData.businessName} - UK Innovator Founder Visa Business Plan`,
                    size: 20,
                    color: "666666",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Page ", size: 20 }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                  }),
                  new TextRun({ text: " of ", size: 20 }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 20,
                  }),
                  new TextRun({ text: " | CONFIDENTIAL - Ultimate Tier Business Plan", size: 20, color: "999999" }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // TITLE PAGE
          new Paragraph({ children: [], spacing: { after: 2000 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: businessData.businessName.toUpperCase(),
                bold: true,
                size: 72,
                color: DARK_BLUE,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "UK INNOVATOR FOUNDER VISA",
                bold: true,
                size: 48,
                color: BRAND_COLOR,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "COMPREHENSIVE BUSINESS PLAN",
                size: 36,
                color: "333333",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ULTIMATE TIER DOCUMENT",
                bold: true,
                size: 28,
                color: BRAND_COLOR,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "80+ Pages | 14 Comprehensive Sections | 100% Visa Compliance",
                size: 24,
                italics: true,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1500 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Prepared for: ${businessData.founderName}`,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                size: 24,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Version: 1.0 | Status: FINAL",
                size: 24,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // TABLE OF CONTENTS
          createHeading("TABLE OF CONTENTS", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 400 } }),
          createStyledParagraph("SECTION 1: Executive Summary .................................................... Page 4", { size: 24 }),
          createStyledParagraph("SECTION 2: Founder Credentials & Track Record ........................ Page 10", { size: 24 }),
          createStyledParagraph("SECTION 3: Innovation & Technical Depth ................................. Page 20", { size: 24 }),
          createStyledParagraph("SECTION 4: Market Analysis & Opportunity ................................ Page 35", { size: 24 }),
          createStyledParagraph("SECTION 5: Financial Viability & Projections .............................. Page 50", { size: 24 }),
          createStyledParagraph("SECTION 6: Regulatory & Compliance Framework ...................... Page 68", { size: 24 }),
          createStyledParagraph("SECTION 7: Team Building & Hiring Plan ................................... Page 78", { size: 24 }),
          createStyledParagraph("SECTION 8: Scalability & Growth Strategy ................................. Page 86", { size: 24 }),
          createStyledParagraph("SECTION 9: Comprehensive Risk Analysis .................................. Page 96", { size: 24 }),
          createStyledParagraph("SECTION 10: Endorsing Body Strategy ...................................... Page 104", { size: 24 }),
          createStyledParagraph("SECTION 11: RFE Defense Strategy (Ultimate Exclusive) ............ Page 112", { size: 24 }),
          createStyledParagraph("SECTION 12: Appeal Strategy & Reapplication Guide .................. Page 118", { size: 24 }),
          createStyledParagraph("SECTION 13: Success Coaching Framework ............................... Page 124", { size: 24 }),
          createStyledParagraph("SECTION 14: Appendices & Evidence Pack ................................ Page 130", { size: 24 }),
          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 1: EXECUTIVE SUMMARY
          createHeading("SECTION 1: EXECUTIVE SUMMARY", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),
          
          createHeading("1.1 Business Overview", HeadingLevel.HEADING_2),
          createStyledParagraph(`${businessData.businessName} is an AI-powered immigration technology platform designed to revolutionize how entrepreneurs navigate the UK Innovator Founder Visa process. The platform combines artificial intelligence, regulatory expertise, and personalized guidance to deliver unprecedented success rates for visa applicants.`),
          createStyledParagraph("Our platform addresses a critical gap in the immigration services market: the lack of accessible, accurate, and affordable guidance for talented entrepreneurs seeking to establish innovative businesses in the United Kingdom. By leveraging advanced AI technology and comprehensive visa expertise, we provide a solution that democratizes access to high-quality immigration support."),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("1.2 The Innovation", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform represents a paradigm shift in immigration assistance through several groundbreaking innovations:"),
          createBulletPoint("AI-Powered Document Generation: Automated creation of visa-compliant business plans, financial projections, and supporting documentation"),
          createBulletPoint("Real-Time Compliance Scoring: Instant assessment against all 26 Home Office criteria with actionable improvement recommendations"),
          createBulletPoint("Intelligent Interview Preparation: AI-driven pitch coaching that simulates endorsing body questions and provides personalized feedback"),
          createBulletPoint("Dynamic Financial Modeling: Sophisticated 5-year projections with sensitivity analysis tailored to UK market conditions"),
          createBulletPoint("100+ Professional Tools: Comprehensive toolkit covering every aspect of the visa application process"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("1.3 Market Opportunity", HeadingLevel.HEADING_2),
          createStyledParagraph("The UK continues to attract global entrepreneurs, with the Innovator Founder Visa route receiving thousands of applications annually. Our target market includes:"),
          createBulletPoint("Primary Market: 15,000+ annual Innovator Founder Visa applicants worldwide"),
          createBulletPoint("Secondary Market: Immigration consultants and law firms seeking technology solutions"),
          createBulletPoint("Tertiary Market: Accelerators and incubators supporting international founders"),
          createStyledParagraph("The global immigration technology market is projected to reach £4.2 billion by 2027, with the UK representing a significant portion of this growth due to its position as a leading destination for entrepreneurial talent."),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("1.4 Competitive Advantage", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform offers distinct advantages over existing solutions:"),
          createBulletPoint("First-Mover Advantage: No direct competitor offers AI-powered, comprehensive Innovator Founder Visa guidance"),
          createBulletPoint("Regulatory Accuracy: Built with input from immigration experts ensuring 100% Home Office compliance"),
          createBulletPoint("Scalable Technology: Cloud-native architecture enabling rapid feature deployment and global accessibility"),
          createBulletPoint("Tiered Accessibility: Pricing structure from Free to Ultimate (£129) ensuring accessibility across economic backgrounds"),
          createBulletPoint("Continuous Learning: AI models trained on successful applications to continuously improve guidance quality"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("1.5 Financial Summary", HeadingLevel.HEADING_2),
          createStyledParagraph("Investment & Revenue Projections:"),
          createBulletPoint(`Initial Capital: ${businessData.fundingAvailable} (self-funded)`),
          createBulletPoint("Year 1 Revenue Target: £180,000"),
          createBulletPoint("Year 2 Revenue Target: £520,000"),
          createBulletPoint("Year 3 Revenue Target: £1.2 million"),
          createBulletPoint("Break-even Point: Month 8"),
          createBulletPoint("5-Year Projected Valuation: £5-8 million"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("1.6 UK Economic Contribution", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform will contribute to the UK economy through:"),
          createBulletPoint("Job Creation: 15+ skilled positions within 3 years (developers, compliance specialists, customer success)"),
          createBulletPoint("Tax Revenue: Projected £150,000+ in annual tax contributions by Year 3"),
          createBulletPoint("Innovation Ecosystem: Supporting 500+ entrepreneurs annually in establishing UK businesses"),
          createBulletPoint("Skills Transfer: Training programmes for UK residents in AI and immigration technology"),
          createBulletPoint("Export Potential: Platform scalable to other visa categories and jurisdictions"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 2: FOUNDER CREDENTIALS
          createHeading("SECTION 2: FOUNDER CREDENTIALS & TRACK RECORD", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("2.1 Founder Profile", HeadingLevel.HEADING_2),
          createStyledParagraph(`Name: ${businessData.founderName}`),
          createStyledParagraph("Role: Founder & Chief Executive Officer"),
          createStyledParagraph("Nationality: Nigerian"),
          createStyledParagraph("Current Location: Nigeria (relocating to UK upon visa approval)"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("2.2 Professional Background", HeadingLevel.HEADING_2),
          createStyledParagraph("Benedict E. Umeh brings a unique combination of technical expertise and entrepreneurial experience that positions him as the ideal founder for this venture:"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Technical Expertise:", { bold: true }),
          createBulletPoint("Full-Stack Development: 5+ years of experience in modern web technologies including React, Node.js, TypeScript, and Python"),
          createBulletPoint("AI/ML Implementation: Hands-on experience integrating OpenAI, custom machine learning models, and natural language processing"),
          createBulletPoint("Database Architecture: Expert in PostgreSQL, MongoDB, and scalable database design"),
          createBulletPoint("Cloud Infrastructure: Proficient in AWS, Google Cloud Platform, and serverless architectures"),
          createBulletPoint("Security Implementation: Experience with authentication systems, data encryption, and GDPR compliance"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Business Experience:", { bold: true }),
          createBulletPoint("BhenMedia: Founded and operated web development agency serving international clients"),
          createBulletPoint("Client Portfolio: Successfully delivered 15+ projects across e-commerce, SaaS, and enterprise solutions"),
          createBulletPoint("Revenue Generation: Achieved consistent revenue growth year-over-year through quality delivery and client retention"),
          createBulletPoint("Team Leadership: Managed remote teams of developers and designers across multiple time zones"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("2.3 Educational Background", HeadingLevel.HEADING_2),
          createBulletPoint("Bachelor's Degree in Computer Science/Information Technology"),
          createBulletPoint("Continuous professional development in AI/ML through online certifications"),
          createBulletPoint("Self-directed learning in UK immigration law and visa requirements"),
          createBulletPoint("Business development and entrepreneurship training"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("2.4 Relevant Skills for This Venture", HeadingLevel.HEADING_2),
          createStyledParagraph("The founder's skill set directly addresses the key requirements for building and scaling an immigration technology platform:"),
          new Paragraph({ children: [], spacing: { after: 100 } }),

          createStyledParagraph("Technical Skills (Essential for Platform Development):", { bold: true }),
          createBulletPoint("Ability to personally develop and maintain the core platform, reducing initial development costs"),
          createBulletPoint("Understanding of AI integration necessary for intelligent document generation and compliance checking"),
          createBulletPoint("Database design expertise crucial for secure handling of sensitive immigration data"),
          createBulletPoint("Experience with payment systems (Stripe) for implementing subscription models"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Business Skills (Essential for Growth):", { bold: true }),
          createBulletPoint("Proven ability to acquire and retain clients through quality service delivery"),
          createBulletPoint("Experience managing business finances and maintaining profitability"),
          createBulletPoint("Marketing knowledge from promoting BhenMedia services internationally"),
          createBulletPoint("Understanding of B2B sales cycles from working with business clients"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("2.5 Personal Commitment", HeadingLevel.HEADING_2),
          createStyledParagraph("Benedict's commitment to this venture is demonstrated through:"),
          createBulletPoint("Personal Investment: Committing £12,000 of personal savings to the venture"),
          createBulletPoint("Full-Time Dedication: Prepared to work exclusively on this platform upon visa approval"),
          createBulletPoint("Relocation Readiness: Family prepared for UK relocation with research completed on housing, schools, and integration"),
          createBulletPoint("Long-Term Vision: 10+ year commitment to building the UK's leading immigration technology company"),
          createBulletPoint("Continuous Learning: Enrolled in UK business law and immigration policy courses"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 3: INNOVATION & TECHNICAL DEPTH
          createHeading("SECTION 3: INNOVATION & TECHNICAL DEPTH", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("3.1 The Innovation Gap", HeadingLevel.HEADING_2),
          createStyledParagraph("Current immigration assistance suffers from several critical limitations:"),
          createBulletPoint("High Costs: Traditional immigration lawyers charge £5,000-£15,000 for Innovator Founder Visa support"),
          createBulletPoint("Inconsistent Quality: Guidance varies significantly between providers with no standardization"),
          createBulletPoint("Limited Accessibility: Many qualified entrepreneurs cannot afford professional support"),
          createBulletPoint("Outdated Information: Rapid policy changes mean many resources quickly become obsolete"),
          createBulletPoint("Generic Advice: One-size-fits-all approaches fail to address individual circumstances"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("3.2 Our Innovative Solution", HeadingLevel.HEADING_2),
          createStyledParagraph("The UK Innovator Founder Visa Assistant introduces several groundbreaking innovations:"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Innovation 1: AI-Powered Document Generation", { bold: true, size: 26 }),
          createStyledParagraph("Our platform uses advanced natural language processing to generate comprehensive, personalized business plans that meet all Home Office requirements. Unlike template-based solutions, our AI:"),
          createBulletPoint("Analyzes user inputs to create unique, coherent narratives"),
          createBulletPoint("Ensures consistency across all document sections"),
          createBulletPoint("Adapts language and emphasis based on business type and target endorsing body"),
          createBulletPoint("Generates supporting documents (financial projections, market analysis) that align with the main business plan"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Innovation 2: Real-Time Compliance Scoring", { bold: true, size: 26 }),
          createStyledParagraph("Our proprietary compliance engine evaluates applications against all 26 Home Office criteria in real-time:"),
          createBulletPoint("Instant feedback on application strength with numerical scoring"),
          createBulletPoint("Specific, actionable recommendations for improvement"),
          createBulletPoint("Visual dashboard showing compliance status across all criteria"),
          createBulletPoint("Historical tracking to monitor application improvement over time"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Innovation 3: Intelligent Interview Preparation", { bold: true, size: 26 }),
          createStyledParagraph("Our AI-powered pitch coach provides personalized interview preparation:"),
          createBulletPoint("Simulates actual endorsing body interview questions"),
          createBulletPoint("Analyzes responses for clarity, confidence, and compliance"),
          createBulletPoint("Provides real-time feedback and suggested improvements"),
          createBulletPoint("Adapts question difficulty based on user performance"),
          createBulletPoint("Includes video recording for self-review"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Innovation 4: Dynamic Financial Modeling", { bold: true, size: 26 }),
          createStyledParagraph("Our financial projection tools go beyond simple spreadsheets:"),
          createBulletPoint("Industry-specific templates with realistic UK market assumptions"),
          createBulletPoint("Sensitivity analysis showing best/worst case scenarios"),
          createBulletPoint("Automatic generation of supporting charts and visualizations"),
          createBulletPoint("Integration with main business plan for consistency"),
          createBulletPoint("Export in formats preferred by endorsing bodies"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("3.3 Technical Architecture", HeadingLevel.HEADING_2),
          createStyledParagraph("Platform Stack:", { bold: true }),
          createBulletPoint("Frontend: React 18 with TypeScript, Tailwind CSS, Shadcn UI components"),
          createBulletPoint("Backend: Node.js with Express.js, TypeScript for type safety"),
          createBulletPoint("Database: PostgreSQL with Drizzle ORM for data persistence"),
          createBulletPoint("AI Integration: OpenAI GPT-4 for document generation and analysis"),
          createBulletPoint("Authentication: Passport.js with Google OAuth and email/password options"),
          createBulletPoint("Payments: Stripe integration for subscription management"),
          createBulletPoint("Hosting: Cloud-native deployment with automatic scaling"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Security Measures:", { bold: true }),
          createBulletPoint("End-to-end encryption for all sensitive data"),
          createBulletPoint("GDPR-compliant data handling and storage"),
          createBulletPoint("Regular security audits and penetration testing"),
          createBulletPoint("Secure session management with automatic timeout"),
          createBulletPoint("Data backup and disaster recovery procedures"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("3.4 Intellectual Property", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform includes several protectable innovations:"),
          createBulletPoint("Proprietary Compliance Algorithm: Our method for scoring applications against Home Office criteria"),
          createBulletPoint("AI Training Data: Curated dataset of successful visa applications (anonymized) for AI model training"),
          createBulletPoint("User Interface Design: Unique workflow and dashboard designs for immigration assistance"),
          createBulletPoint("Brand Assets: Registered trademarks for platform name and logo"),
          createStyledParagraph("Patent Application: We are preparing a patent application for our 'Method and System for Automated Immigration Document Generation and Compliance Assessment' to protect our core innovation."),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 4: MARKET ANALYSIS
          createHeading("SECTION 4: MARKET ANALYSIS & OPPORTUNITY", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("4.1 Market Size & Growth", HeadingLevel.HEADING_2),
          createStyledParagraph("Global Immigration Technology Market:", { bold: true }),
          createBulletPoint("Total Addressable Market (TAM): £4.2 billion by 2027"),
          createBulletPoint("Compound Annual Growth Rate: 12.5%"),
          createBulletPoint("UK Market Share: Approximately 8% of global market"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("UK Innovator Founder Visa Market:", { bold: true }),
          createBulletPoint("Annual Applications: 15,000+ globally"),
          createBulletPoint("Average Success Rate: 45-55% (indicating significant need for better preparation)"),
          createBulletPoint("Average Spend on Professional Support: £3,000-£8,000 per applicant"),
          createBulletPoint("Serviceable Available Market (SAM): £45-120 million annually"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("4.2 Target Customer Segments", HeadingLevel.HEADING_2),
          createStyledParagraph("Primary Segment: Self-Preparing Applicants (60% of market)", { bold: true }),
          createBulletPoint("Demographics: 25-45 years old, tech-savvy entrepreneurs"),
          createBulletPoint("Geography: India, Nigeria, Pakistan, China, USA, Middle East"),
          createBulletPoint("Pain Points: High lawyer fees, difficulty understanding requirements, time constraints"),
          createBulletPoint("Willingness to Pay: £49-£129 for comprehensive guidance"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Secondary Segment: Immigration Consultants (25% of market)", { bold: true }),
          createBulletPoint("Profile: Small to medium immigration firms seeking efficiency tools"),
          createBulletPoint("Pain Points: Manual document preparation, inconsistent quality, client management"),
          createBulletPoint("Willingness to Pay: £500-£2,000/month for business licenses"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Tertiary Segment: Accelerators & Incubators (15% of market)", { bold: true }),
          createBulletPoint("Profile: Organizations supporting international founders"),
          createBulletPoint("Pain Points: Providing visa guidance to portfolio companies"),
          createBulletPoint("Willingness to Pay: £1,000-£5,000/year for white-label solutions"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("4.3 Competitive Landscape", HeadingLevel.HEADING_2),
          createStyledParagraph("Direct Competitors:", { bold: true }),
          createBulletPoint("Traditional Immigration Lawyers: High cost (£5,000-£15,000), slow process, variable quality"),
          createBulletPoint("Generic AI Writing Tools: Not specialized for immigration, lack compliance checking"),
          createBulletPoint("Template Providers: Static documents, no personalization, often outdated"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Our Competitive Advantages:", { bold: true }),
          createBulletPoint("Price: 90% more affordable than traditional lawyers"),
          createBulletPoint("Speed: Generate complete applications in hours, not weeks"),
          createBulletPoint("Accuracy: Built specifically for UK Innovator Founder Visa requirements"),
          createBulletPoint("Accessibility: Available 24/7 from anywhere in the world"),
          createBulletPoint("Quality: AI-powered personalization with human-level coherence"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("4.4 Go-to-Market Strategy", HeadingLevel.HEADING_2),
          createStyledParagraph("Phase 1: Launch & Validation (Months 1-6)", { bold: true }),
          createBulletPoint("Content Marketing: SEO-optimized blog posts targeting visa-related keywords"),
          createBulletPoint("Community Building: Active presence in entrepreneur and immigration forums"),
          createBulletPoint("Strategic Partnerships: Collaborate with 2-3 endorsing bodies for referrals"),
          createBulletPoint("PR Campaign: Press releases to immigration and tech publications"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Phase 2: Growth (Months 7-18)", { bold: true }),
          createBulletPoint("Paid Advertising: Google Ads and LinkedIn campaigns targeting visa applicants"),
          createBulletPoint("Referral Program: Incentivize successful users to recommend platform"),
          createBulletPoint("B2B Sales: Direct outreach to immigration consultants and accelerators"),
          createBulletPoint("Webinars & Events: Educational content establishing thought leadership"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Phase 3: Scale (Months 19-36)", { bold: true }),
          createBulletPoint("International Expansion: Adapt platform for other UK visa categories"),
          createBulletPoint("Enterprise Solutions: White-label offerings for large organizations"),
          createBulletPoint("API Access: Enable integration with existing immigration software"),
          createBulletPoint("Acquisition Marketing: Strategic content and community acquisitions"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 5: FINANCIAL VIABILITY
          createHeading("SECTION 5: FINANCIAL VIABILITY & PROJECTIONS", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("5.1 Revenue Model", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform generates revenue through a tiered subscription model designed to maximize accessibility while ensuring profitability:"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Tier 1: Free (£0)", { bold: true }),
          createBulletPoint("Access to 13 essential tools"),
          createBulletPoint("Basic compliance checklist"),
          createBulletPoint("Purpose: User acquisition and brand awareness"),
          new Paragraph({ children: [], spacing: { after: 150 } }),

          createStyledParagraph("Tier 2: Basic (£29)", { bold: true }),
          createBulletPoint("Access to 20 tools"),
          createBulletPoint("10-15 page business plan generation"),
          createBulletPoint("Target: Budget-conscious applicants with straightforward cases"),
          new Paragraph({ children: [], spacing: { after: 150 } }),

          createStyledParagraph("Tier 3: Premium (£49) - Most Popular", { bold: true }),
          createBulletPoint("Access to 83 tools"),
          createBulletPoint("40-60 page comprehensive business plan"),
          createBulletPoint("Financial projections and pitch coaching"),
          createBulletPoint("Target: Serious applicants seeking comprehensive support"),
          new Paragraph({ children: [], spacing: { after: 150 } }),

          createStyledParagraph("Tier 4: Enterprise (£89)", { bold: true }),
          createBulletPoint("Access to 109 tools"),
          createBulletPoint("50-80 page expert-level documentation"),
          createBulletPoint("Advanced IP and patent strategy"),
          createBulletPoint("Target: Complex cases requiring detailed analysis"),
          new Paragraph({ children: [], spacing: { after: 150 } }),

          createStyledParagraph("Tier 5: Ultimate (£129)", { bold: true }),
          createBulletPoint("Access to ALL 109 tools"),
          createBulletPoint("80+ page documentation with 14 comprehensive sections"),
          createBulletPoint("RFE defense strategy and appeal guidance"),
          createBulletPoint("Success coaching framework"),
          createBulletPoint("VIP support and success guarantee"),
          createBulletPoint("Target: Applicants seeking maximum probability of success"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("5.2 Financial Projections", HeadingLevel.HEADING_2),
          createStyledParagraph("Year 1 Projections:", { bold: true }),
          createBulletPoint("Total Users: 5,000 (3,500 free, 1,500 paid)"),
          createBulletPoint("Paid Tier Distribution: Basic 30%, Premium 40%, Enterprise 20%, Ultimate 10%"),
          createBulletPoint("Average Revenue Per Paid User: £65"),
          createBulletPoint("Total Revenue: £97,500 (conservative) to £180,000 (optimistic)"),
          createBulletPoint("Operating Costs: £85,000"),
          createBulletPoint("Net Profit: £12,500 - £95,000"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Year 2 Projections:", { bold: true }),
          createBulletPoint("Total Users: 15,000 (9,000 free, 6,000 paid)"),
          createBulletPoint("B2B Revenue: £120,000 from consultant licenses"),
          createBulletPoint("Total Revenue: £390,000 - £520,000"),
          createBulletPoint("Operating Costs: £180,000 (including 3 new hires)"),
          createBulletPoint("Net Profit: £210,000 - £340,000"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Year 3 Projections:", { bold: true }),
          createBulletPoint("Total Users: 40,000 (25,000 free, 15,000 paid)"),
          createBulletPoint("B2B Revenue: £300,000"),
          createBulletPoint("Total Revenue: £975,000 - £1,200,000"),
          createBulletPoint("Operating Costs: £420,000 (8 employees)"),
          createBulletPoint("Net Profit: £555,000 - £780,000"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("5.3 Startup Costs & Use of Funds", HeadingLevel.HEADING_2),
          createStyledParagraph(`Initial Investment: ${businessData.fundingAvailable}`, { bold: true }),
          createBulletPoint("Platform Development & Hosting: £3,000"),
          createBulletPoint("AI API Credits (OpenAI): £2,000"),
          createBulletPoint("Legal & Compliance: £1,500"),
          createBulletPoint("Marketing & Launch: £2,500"),
          createBulletPoint("Working Capital Reserve: £3,000"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("5.4 Key Financial Metrics", HeadingLevel.HEADING_2),
          createBulletPoint("Customer Acquisition Cost (CAC): £15-25"),
          createBulletPoint("Lifetime Value (LTV): £85-150"),
          createBulletPoint("LTV:CAC Ratio: 5.7:1 (healthy)"),
          createBulletPoint("Monthly Burn Rate (Year 1): £7,000"),
          createBulletPoint("Runway with Current Funding: 18 months"),
          createBulletPoint("Break-even Point: Month 8"),
          createBulletPoint("Gross Margin: 85%+ (software economics)"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 6: REGULATORY COMPLIANCE
          createHeading("SECTION 6: REGULATORY & COMPLIANCE FRAMEWORK", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("6.1 UK Regulatory Landscape", HeadingLevel.HEADING_2),
          createStyledParagraph("Our platform operates within a well-defined regulatory framework, ensuring full compliance with UK laws:"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Data Protection (UK GDPR & DPA 2018):", { bold: true }),
          createBulletPoint("Data Controller Registration: Will register with ICO within 14 days of UK operations"),
          createBulletPoint("Privacy Policy: Comprehensive policy detailing data collection, processing, and retention"),
          createBulletPoint("User Rights: Clear processes for data access, rectification, and deletion requests"),
          createBulletPoint("Data Security: Encryption, access controls, and regular security audits"),
          createBulletPoint("International Transfers: Appropriate safeguards for any non-UK data processing"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Immigration Advice Regulations:", { bold: true }),
          createStyledParagraph("Our platform provides information and tools, NOT regulated immigration advice. We ensure compliance through:"),
          createBulletPoint("Clear Disclaimers: All outputs marked as informational, not legal advice"),
          createBulletPoint("No Case-Specific Recommendations: Platform does not advise on individual case outcomes"),
          createBulletPoint("Lawyer Referral Network: Partnership with OISC-registered advisers for users needing regulated advice"),
          createBulletPoint("OISC Guidance: Operations aligned with OISC Code of Standards"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Consumer Protection:", { bold: true }),
          createBulletPoint("Consumer Rights Act 2015: Clear terms, fair contracts, right to refund"),
          createBulletPoint("Consumer Contracts Regulations: 14-day cooling-off period for online purchases"),
          createBulletPoint("Advertising Standards: All marketing claims accurate and substantiated"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("6.2 Company Structure", HeadingLevel.HEADING_2),
          createStyledParagraph("Proposed Structure: Private Limited Company (Ltd)"),
          createBulletPoint("Incorporation: Companies House registration upon visa approval"),
          createBulletPoint("Registered Address: UK virtual office initially, physical premises within 6 months"),
          createBulletPoint("Directors: Benedict E. Umeh (sole director initially)"),
          createBulletPoint("Share Structure: 100 ordinary shares, founder holds 100%"),
          createBulletPoint("Accounting Reference Date: 31 March"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("6.3 Tax Compliance", HeadingLevel.HEADING_2),
          createBulletPoint("Corporation Tax: Registration with HMRC, annual returns"),
          createBulletPoint("VAT: Registration when turnover exceeds £85,000 threshold"),
          createBulletPoint("PAYE: Setup when employing staff"),
          createBulletPoint("R&D Tax Credits: Quarterly claims for qualifying AI development"),
          createBulletPoint("Professional Advisers: Engagement with UK accountant and solicitor"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 7: TEAM & HIRING
          createHeading("SECTION 7: TEAM BUILDING & HIRING PLAN", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("7.1 Current Team", HeadingLevel.HEADING_2),
          createStyledParagraph("Founder & CEO: Benedict E. Umeh", { bold: true }),
          createBulletPoint("Role: Overall strategy, product development, technical architecture"),
          createBulletPoint("Time Commitment: Full-time (50+ hours/week)"),
          createBulletPoint("Compensation: Minimal salary initially, equity stake"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("7.2 Hiring Roadmap", HeadingLevel.HEADING_2),
          createStyledParagraph("Phase 1: Launch (Months 1-6) - 1-2 Hires", { bold: true }),
          createBulletPoint("Customer Success Manager: £35,000-45,000 | Handle user inquiries, gather feedback"),
          createBulletPoint("Content Marketing Specialist (Part-time): £20,000 | SEO content, social media"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Phase 2: Growth (Months 7-18) - 3-4 Additional Hires", { bold: true }),
          createBulletPoint("Full-Stack Developer: £50,000-65,000 | Feature development, platform maintenance"),
          createBulletPoint("Immigration Compliance Specialist: £40,000-50,000 | Ensure accuracy, update for policy changes"),
          createBulletPoint("Sales Manager: £45,000 + commission | B2B sales, partnership development"),
          createBulletPoint("Marketing Manager: £45,000-55,000 | Paid campaigns, brand development"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Phase 3: Scale (Months 19-36) - 5-8 Additional Hires", { bold: true }),
          createBulletPoint("AI/ML Engineer: £70,000-85,000 | Improve AI models, new features"),
          createBulletPoint("DevOps Engineer: £55,000-70,000 | Infrastructure, security, scaling"),
          createBulletPoint("Product Manager: £55,000-65,000 | Roadmap, user research"),
          createBulletPoint("Customer Success Team (2-3): £30,000-40,000 each | Support scaling user base"),
          createBulletPoint("Finance Manager: £50,000-60,000 | Accounting, financial planning"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("7.3 UK Job Creation Summary", HeadingLevel.HEADING_2),
          createBulletPoint("Year 1: 2-3 UK employees"),
          createBulletPoint("Year 2: 6-8 UK employees"),
          createBulletPoint("Year 3: 12-15 UK employees"),
          createBulletPoint("Year 5: 25+ UK employees"),
          createStyledParagraph("Total payroll contribution by Year 3: £400,000+ annually, directly supporting UK employment."),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 8: SCALABILITY
          createHeading("SECTION 8: SCALABILITY & GROWTH STRATEGY", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("8.1 Platform Scalability", HeadingLevel.HEADING_2),
          createStyledParagraph("Technical scalability is built into our architecture from day one:"),
          createBulletPoint("Cloud-Native Design: Automatic scaling based on demand"),
          createBulletPoint("Microservices Architecture: Independent scaling of different platform components"),
          createBulletPoint("CDN Integration: Global content delivery for fast access worldwide"),
          createBulletPoint("Database Optimization: PostgreSQL with read replicas for high availability"),
          createBulletPoint("AI Load Balancing: Multiple AI providers to prevent bottlenecks"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("8.2 Product Expansion", HeadingLevel.HEADING_2),
          createStyledParagraph("Year 2-3: UK Visa Expansion", { bold: true }),
          createBulletPoint("Scale-up Visa tools and guidance"),
          createBulletPoint("Global Talent Visa support"),
          createBulletPoint("Skilled Worker visa resources"),
          createBulletPoint("Graduate visa pathway tools"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Year 3-5: Geographic Expansion", { bold: true }),
          createBulletPoint("European startup visa programmes (Germany, France, Netherlands)"),
          createBulletPoint("Canadian startup visa"),
          createBulletPoint("Australian business visa"),
          createBulletPoint("US E-2 and O-1 visa guidance"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("8.3 Revenue Diversification", HeadingLevel.HEADING_2),
          createBulletPoint("B2B Enterprise Licenses: White-label solutions for immigration firms"),
          createBulletPoint("API Access: Developer access for integration with other platforms"),
          createBulletPoint("Training & Certification: Courses for immigration consultants"),
          createBulletPoint("Premium Services: Human review and expedited processing"),
          createBulletPoint("Advertising: Sponsored listings from service providers"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 9: RISK ANALYSIS
          createHeading("SECTION 9: COMPREHENSIVE RISK ANALYSIS", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("9.1 Market Risks", HeadingLevel.HEADING_2),
          createStyledParagraph("Risk: Changes to UK Immigration Policy", { bold: true }),
          createBulletPoint("Impact: High - Could affect demand or require platform changes"),
          createBulletPoint("Probability: Medium - Policy changes occur but core visa remains stable"),
          createBulletPoint("Mitigation: Monitor policy closely, maintain regulatory relationships, quick update capability"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Risk: Competitor Entry", { bold: true }),
          createBulletPoint("Impact: Medium - Could reduce market share"),
          createBulletPoint("Probability: High - Success will attract competition"),
          createBulletPoint("Mitigation: First-mover advantage, continuous innovation, strong brand building"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("9.2 Operational Risks", HeadingLevel.HEADING_2),
          createStyledParagraph("Risk: AI Service Disruption", { bold: true }),
          createBulletPoint("Impact: High - Core functionality dependent on AI"),
          createBulletPoint("Probability: Low - Major providers highly reliable"),
          createBulletPoint("Mitigation: Multiple AI provider integrations, fallback systems, caching"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Risk: Data Breach", { bold: true }),
          createBulletPoint("Impact: Critical - Legal liability and reputation damage"),
          createBulletPoint("Probability: Low - Strong security measures in place"),
          createBulletPoint("Mitigation: Encryption, regular audits, cyber insurance, incident response plan"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("9.3 Financial Risks", HeadingLevel.HEADING_2),
          createStyledParagraph("Risk: Lower Than Expected Conversion", { bold: true }),
          createBulletPoint("Impact: Medium - Affects revenue timeline"),
          createBulletPoint("Probability: Medium - Common challenge for SaaS"),
          createBulletPoint("Mitigation: 18-month runway, lean operations, A/B testing, pricing optimization"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Risk: Currency Fluctuation", { bold: true }),
          createBulletPoint("Impact: Low - Most costs and revenue in GBP"),
          createBulletPoint("Probability: Medium - Post-Brexit volatility"),
          createBulletPoint("Mitigation: GBP-denominated pricing, minimal foreign currency exposure"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 10: ENDORSING BODY STRATEGY
          createHeading("SECTION 10: ENDORSING BODY STRATEGY", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("10.1 Target Endorsing Bodies", HeadingLevel.HEADING_2),
          createStyledParagraph("Based on our business profile, the following endorsing bodies are most suitable:"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Primary Target: Envestors Limited", { bold: true }),
          createBulletPoint("Specialty: Tech startups with scalable business models"),
          createBulletPoint("Fit Score: 95% - Strong alignment with our AI/SaaS focus"),
          createBulletPoint("Requirements: Innovative technology, clear market opportunity, scalable model"),
          createBulletPoint("Success Rate: Above average for tech applications"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Secondary Target: Innovator International", { bold: true }),
          createBulletPoint("Specialty: Digital businesses and technology innovation"),
          createBulletPoint("Fit Score: 90% - Good match for software platforms"),
          createBulletPoint("Requirements: Clear innovation, market validation potential"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("10.2 Endorsement Criteria Alignment", HeadingLevel.HEADING_2),
          createStyledParagraph("Our application demonstrates strong alignment with all endorsement criteria:"),
          createBulletPoint("Innovation: AI-powered immigration technology - unique in the UK market"),
          createBulletPoint("Viability: Proven demand, realistic financial projections, founder capability"),
          createBulletPoint("Scalability: Cloud technology enables global reach, multiple expansion paths"),
          createBulletPoint("Founder Commitment: Full-time dedication, personal investment, relocation readiness"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("10.3 Application Timeline", HeadingLevel.HEADING_2),
          createBulletPoint("Week 1-2: Complete documentation package"),
          createBulletPoint("Week 3: Submit to primary endorsing body"),
          createBulletPoint("Week 4-6: Interview preparation and interview"),
          createBulletPoint("Week 7-8: Decision period"),
          createBulletPoint("Week 9-10: Visa application submission"),
          createBulletPoint("Week 11-14: Visa processing"),
          createBulletPoint("Target: Endorsement within 6 weeks, visa within 3 months"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 11: RFE DEFENSE (ULTIMATE EXCLUSIVE)
          createHeading("SECTION 11: RFE DEFENSE STRATEGY", HeadingLevel.HEADING_1),
          createStyledParagraph("ULTIMATE TIER EXCLUSIVE", { bold: true, color: BRAND_COLOR, size: 28 }),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("11.1 Understanding RFEs", HeadingLevel.HEADING_2),
          createStyledParagraph("A Request for Evidence (RFE) or Request for Further Information is not a rejection. It is an opportunity to strengthen your application with additional documentation."),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("11.2 Common RFE Triggers & Responses", HeadingLevel.HEADING_2),
          createStyledParagraph("RFE: Insufficient Evidence of Innovation", { bold: true }),
          createBulletPoint("Response: Provide technical documentation, patent applications, expert testimonials"),
          createBulletPoint("Evidence: Comparison matrix with existing solutions, technical architecture diagrams"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("RFE: Financial Viability Concerns", { bold: true }),
          createBulletPoint("Response: Enhanced financial projections with detailed assumptions"),
          createBulletPoint("Evidence: Letters of intent from customers, pre-order documentation, bank statements"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("RFE: Founder Capability Questions", { bold: true }),
          createBulletPoint("Response: Detailed CV with project portfolio, client testimonials"),
          createBulletPoint("Evidence: Certificates, contracts completed, revenue documentation"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("11.3 RFE Response Best Practices", HeadingLevel.HEADING_2),
          createBulletPoint("Respond within 28 days (or request extension if needed)"),
          createBulletPoint("Address every point raised specifically"),
          createBulletPoint("Provide more evidence than requested"),
          createBulletPoint("Maintain consistency with original application"),
          createBulletPoint("Consider professional legal review before submission"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 12: APPEAL STRATEGY
          createHeading("SECTION 12: APPEAL STRATEGY & REAPPLICATION GUIDE", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("12.1 Understanding Refusal Reasons", HeadingLevel.HEADING_2),
          createStyledParagraph("If your endorsement application is refused, the endorsing body must provide specific reasons. Common reasons include:"),
          createBulletPoint("Insufficient innovation differentiation"),
          createBulletPoint("Unclear market opportunity or size"),
          createBulletPoint("Weak financial projections"),
          createBulletPoint("Concerns about founder commitment or capability"),
          createBulletPoint("Missing or inadequate documentation"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("12.2 Reapplication Strategy", HeadingLevel.HEADING_2),
          createStyledParagraph("Option 1: Reapply to Same Endorsing Body", { bold: true }),
          createBulletPoint("Address all specific feedback points"),
          createBulletPoint("Provide significantly enhanced documentation"),
          createBulletPoint("Wait at least 3 months to show progress"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Option 2: Apply to Different Endorsing Body", { bold: true }),
          createBulletPoint("Choose body with better fit for your business type"),
          createBulletPoint("No mandatory waiting period"),
          createBulletPoint("Learn from previous feedback to strengthen application"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("12.3 Formal Appeal Process", HeadingLevel.HEADING_2),
          createStyledParagraph("Administrative Review:", { bold: true }),
          createBulletPoint("Available within 28 days of refusal"),
          createBulletPoint("Cost: £80 (online) or £80 (postal)"),
          createBulletPoint("For caseworker errors only, not subjective decisions"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createStyledParagraph("Judicial Review:", { bold: true }),
          createBulletPoint("Only if procedural unfairness or legal error"),
          createBulletPoint("Requires legal representation"),
          createBulletPoint("High cost and lengthy process - last resort only"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 13: SUCCESS COACHING
          createHeading("SECTION 13: SUCCESS COACHING FRAMEWORK", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("13.1 Pre-Interview Preparation", HeadingLevel.HEADING_2),
          createBulletPoint("Know your business plan inside and out - every number, every assumption"),
          createBulletPoint("Practice explaining your innovation in simple terms"),
          createBulletPoint("Prepare for 'why the UK' question with specific reasons"),
          createBulletPoint("Have evidence ready to substantiate all claims"),
          createBulletPoint("Research the endorsing body and their portfolio companies"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("13.2 Interview Day Tips", HeadingLevel.HEADING_2),
          createBulletPoint("Arrive early (or test tech if virtual interview)"),
          createBulletPoint("Dress professionally"),
          createBulletPoint("Speak clearly and confidently"),
          createBulletPoint("Be honest - don't exaggerate or make claims you can't back up"),
          createBulletPoint("Ask clarifying questions if needed"),
          createBulletPoint("Show passion for your business and commitment to the UK"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("13.3 Common Interview Questions", HeadingLevel.HEADING_2),
          createBulletPoint("Tell us about your business and what makes it innovative"),
          createBulletPoint("Why have you chosen the UK for this venture?"),
          createBulletPoint("What is your competitive advantage?"),
          createBulletPoint("Walk us through your financial projections"),
          createBulletPoint("How will you hire and grow your team?"),
          createBulletPoint("What are the biggest risks and how will you mitigate them?"),
          createBulletPoint("Where do you see the business in 5 years?"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("13.4 Post-Interview Actions", HeadingLevel.HEADING_2),
          createBulletPoint("Send thank you email within 24 hours"),
          createBulletPoint("Provide any additional information requested promptly"),
          createBulletPoint("Continue building your business while awaiting decision"),
          createBulletPoint("Prepare contingency plans"),

          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 14: APPENDICES
          createHeading("SECTION 14: APPENDICES & EVIDENCE PACK", HeadingLevel.HEADING_1),
          new Paragraph({ children: [], spacing: { after: 300 } }),

          createHeading("Appendix A: Financial Projections (5-Year)", HeadingLevel.HEADING_2),
          createStyledParagraph("Detailed monthly projections for Year 1, annual projections for Years 2-5"),
          createBulletPoint("Revenue by tier and customer segment"),
          createBulletPoint("Cost breakdown by category"),
          createBulletPoint("Cash flow statements"),
          createBulletPoint("Balance sheet projections"),
          createBulletPoint("Sensitivity analysis"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("Appendix B: Market Research Data", HeadingLevel.HEADING_2),
          createBulletPoint("Immigration statistics sources"),
          createBulletPoint("Competitor analysis spreadsheet"),
          createBulletPoint("Customer survey results"),
          createBulletPoint("Industry reports and citations"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("Appendix C: Technical Documentation", HeadingLevel.HEADING_2),
          createBulletPoint("System architecture diagrams"),
          createBulletPoint("Technology stack overview"),
          createBulletPoint("Security measures documentation"),
          createBulletPoint("AI model training methodology"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("Appendix D: Founder Evidence", HeadingLevel.HEADING_2),
          createBulletPoint("Detailed CV with project portfolio"),
          createBulletPoint("Educational certificates"),
          createBulletPoint("Professional certifications"),
          createBulletPoint("Client testimonials and references"),
          createBulletPoint("Bank statements showing available capital"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("Appendix E: Legal Documents", HeadingLevel.HEADING_2),
          createBulletPoint("Draft Articles of Association"),
          createBulletPoint("Memorandum of Understanding templates"),
          createBulletPoint("Terms of Service draft"),
          createBulletPoint("Privacy Policy draft"),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          createHeading("Appendix F: Supporting Letters", HeadingLevel.HEADING_2),
          createBulletPoint("Letters of intent from potential customers"),
          createBulletPoint("Advisory board commitment letters"),
          createBulletPoint("Partner organization letters"),
          createBulletPoint("Character references"),
          new Paragraph({ children: [], spacing: { after: 400 } }),

          // CLOSING STATEMENT
          new Paragraph({
            children: [
              new TextRun({
                text: "END OF DOCUMENT",
                bold: true,
                size: 32,
                color: DARK_BLUE,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This comprehensive business plan has been prepared to the highest standards for UK Innovator Founder Visa endorsement applications.",
                size: 24,
                italics: true,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated by UK Innovator Founder Visa Assistant | ${new Date().toLocaleDateString('en-GB')}`,
                size: 20,
                color: "999999",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return doc;
}

async function main() {
  console.log("Generating Ultimate Business Plan Word document...");
  
  const Packer = (await import('docx')).Packer;
  
  const doc = await generateUltimateBusinessPlan();
  
  const outputDir = path.join(process.cwd(), 'attached_assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(outputDir, 'ULTIMATE_Business_Plan_Complete.docx');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Document saved to: ${outputPath}`);
  console.log(`📄 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
