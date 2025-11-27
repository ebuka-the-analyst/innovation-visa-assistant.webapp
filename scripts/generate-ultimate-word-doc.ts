import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } from 'docx';
import * as fs from 'fs';

const FOUNDER = {
  name: "Ebuka Benedict Umeh",
  email: "benedict.umeh@innovatorfoundervisaassistant.co.uk",
  phone: "+44 7493 363351",
  address: "13 Village Place, Burley, Leeds, LS4 2NT, United Kingdom",
  nationality: "Nigerian",
  dateOfBirth: "October 15, 1989",
  passportNumber: "B00558762",
  visaStatus: "Post-Study Work (PSW) Visa",
  education: "MSc Data Science, Leeds Beckett University (2023); BSc IT & Business Information Systems, Middlesex University (2017); Advanced Diploma Software Engineering, Aptech Computer Education",
  experience: "7+ years Full Stack Development, 15+ client projects",
  funding: "£8,000 personal savings"
};

function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 }
  });
}

function createParagraph(text: string, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold, size: 24 })],
    spacing: { after: 120 }
  });
}

function createBullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    bullet: { level: 0 },
    spacing: { after: 80 }
  });
}

function createTable(headers: string[], rows: string[][]) {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22 })] })],
      shading: { fill: "1a365d" },
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 22 })] })]
    }))
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

async function generateDocument() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // TITLE PAGE
        new Paragraph({ text: "", spacing: { before: 2000 } }),
        new Paragraph({
          children: [new TextRun({ text: "UK INNOVATOR FOUNDER VISA", bold: true, size: 56, color: "1a365d" })],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [new TextRun({ text: "APPLICATION PACKAGE", bold: true, size: 48, color: "2c5282" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "UK Innovator Founder Visa Assistant", size: 32, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Prepared by:", size: 24 })],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [new TextRun({ text: FOUNDER.name, bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `${FOUNDER.email}`, size: 24 })],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [new TextRun({ text: `${FOUNDER.phone}`, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "November 2025", size: 28, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Document Reference: IFV-2025-ULTIMATE-001", size: 22, italics: true })],
          alignment: AlignmentType.CENTER
        }),

        // PAGE BREAK
        new Paragraph({ children: [new PageBreak()] }),

        // TABLE OF CONTENTS
        createHeading("TABLE OF CONTENTS", HeadingLevel.HEADING_1),
        createParagraph("1. Executive Summary"),
        createParagraph("2. Founder Profile"),
        createParagraph("3. Business Overview"),
        createParagraph("4. Market Opportunity"),
        createParagraph("5. Product & Innovation"),
        createParagraph("6. Financial Projections"),
        createParagraph("7. Growth Strategy"),
        createParagraph("8. Job Creation Plan"),
        createParagraph("9. Risk Mitigation"),
        createParagraph("10. Innovation Assessment"),
        createParagraph("11. Interview Preparation"),
        createParagraph("12. Supporting Evidence"),
        createParagraph("13. Submission Checklist"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 1: EXECUTIVE SUMMARY
        createHeading("1. EXECUTIVE SUMMARY", HeadingLevel.HEADING_1),
        createParagraph("UK Innovator Founder Visa Assistant is an AI-powered Software-as-a-Service (SaaS) platform designed to democratise access to the UK Innovator Founder Visa process. The platform provides 109+ professional-level tools across compliance, documentation, business planning, financial modelling, and growth strategies."),
        createParagraph(""),
        createParagraph("KEY HIGHLIGHTS", true),
        createBullet("First fully-integrated AI-powered Innovator Founder Visa operating system in the UK"),
        createBullet("109+ professional tools across 8 categories"),
        createBullet("Reduces visa application costs from £5,000-15,000 to £29-299"),
        createBullet("Multi-LLM architecture with ORACLE AI Supervisor system"),
        createBullet("Projects £1.2M revenue and 12 UK jobs by Year 3"),
        createBullet("Innovation Score: 92.85/100"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 2: FOUNDER PROFILE
        createHeading("2. FOUNDER PROFILE", HeadingLevel.HEADING_1),
        createTable(
          ["Field", "Details"],
          [
            ["Full Name", FOUNDER.name],
            ["Date of Birth", FOUNDER.dateOfBirth],
            ["Nationality", FOUNDER.nationality],
            ["Current Address", FOUNDER.address],
            ["Email", FOUNDER.email],
            ["Phone", FOUNDER.phone],
            ["Passport Number", FOUNDER.passportNumber],
            ["Current Visa Status", FOUNDER.visaStatus],
            ["Education", FOUNDER.education],
            ["Professional Experience", FOUNDER.experience],
            ["Available Funding", FOUNDER.funding]
          ]
        ),
        createParagraph(""),
        createParagraph("PROFESSIONAL SUMMARY", true),
        createParagraph("Experienced Full Stack Developer with 7+ years in software development, specialising in AI-powered applications, web development, and SaaS platforms. Proven track record of delivering 15+ successful client projects across Nigeria and the UK. Combines technical expertise with entrepreneurial vision to create innovative solutions that democratise access to complex services."),
        createParagraph(""),
        createParagraph("QUALIFICATIONS", true),
        createBullet("MSc Data Science - Leeds Beckett University (2023)"),
        createBullet("BSc IT & Business Information Systems - Middlesex University (2017)"),
        createBullet("Advanced Diploma Software Engineering - Aptech Computer Education"),
        createBullet("7+ years Full Stack Development experience"),
        createBullet("15+ successful client projects delivered"),
        createBullet("Expertise: React, Node.js, Python, AI/ML, PostgreSQL"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 3: BUSINESS OVERVIEW
        createHeading("3. BUSINESS OVERVIEW", HeadingLevel.HEADING_1),
        createTable(
          ["Item", "Details"],
          [
            ["Business Name", "UK Innovator Founder Visa Assistant"],
            ["Legal Structure", "UK Limited Company (to be registered)"],
            ["Registered Address", FOUNDER.address],
            ["Website", "https://innovatorfoundervisaassistant.co.uk"],
            ["Industry", "LegalTech / ImmigrationTech / SaaS"],
            ["Business Model", "Subscription-based SaaS platform"]
          ]
        ),
        createParagraph(""),
        createParagraph("MISSION STATEMENT", true),
        createParagraph("To become the UK's leading AI-powered visa application assistant, enabling talented entrepreneurs worldwide to navigate the Innovator Founder Visa process with confidence, accuracy, and affordability."),
        createParagraph(""),
        createParagraph("VISION", true),
        createParagraph("To expand into the UK's #1 comprehensive immigration technology platform, covering all major visa categories and serving 100,000+ users by 2028."),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 4: MARKET OPPORTUNITY
        createHeading("4. MARKET OPPORTUNITY", HeadingLevel.HEADING_1),
        createParagraph("MARKET SIZE", true),
        createTable(
          ["Market Segment", "Size", "Value"],
          [
            ["Total Addressable Market (TAM)", "500,000+ entrepreneurs annually", "£2.5 billion"],
            ["Serviceable Addressable Market (SAM)", "50,000 Innovator Founder applicants", "£250 million"],
            ["Serviceable Obtainable Market (SOM)", "10,000 users (Year 3)", "£1.2 million"]
          ]
        ),
        createParagraph(""),
        createParagraph("MARKET DRIVERS", true),
        createBullet("948,000 people immigrate to UK annually"),
        createBullet("Migrants contribute £83 billion annually to UK economic output"),
        createBullet("27% of UK startups founded by immigrant-background individuals"),
        createBullet("Traditional services charge £3,000-15,000 creating accessibility barrier"),
        createBullet("60-70% of applications rejected at endorsement stage"),
        createParagraph(""),
        createParagraph("THE PROBLEM", true),
        createBullet("Complexity: Two-stage application with changing regulations"),
        createBullet("High Costs: Lawyers charge £3,000-15,000"),
        createBullet("High Rejection: 60-70% rejected at endorsement stage"),
        createBullet("Weak Business Plans: Cause 40% of all rejections"),
        createBullet("Information Gaps: Scattered, inconsistent guidance online"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 5: PRODUCT & INNOVATION
        createHeading("5. PRODUCT & INNOVATION", HeadingLevel.HEADING_1),
        createParagraph("PLATFORM OVERVIEW", true),
        createParagraph("An end-to-end, AI-powered solution with 109+ professional-level tools across 8 categories:"),
        createTable(
          ["Category", "Tools", "Purpose"],
          [
            ["Compliance", "13", "Eligibility, tracking, scoring"],
            ["Documentation", "15", "Business plans, templates"],
            ["Team", "12", "Skills assessment, hiring plans"],
            ["Business", "18", "Business model, competitor analysis"],
            ["Financial", "16", "Projections, cash flow, viability"],
            ["Growth", "14", "Strategy, marketing, scaling"],
            ["Innovation", "12", "Innovation scoring, IP strategy"],
            ["Defense", "9", "Interview prep, pitch practice"]
          ]
        ),
        createParagraph(""),
        createParagraph("ORACLE AI SUPERVISOR SYSTEM", true),
        createBullet("Nova - Innovation Specialist Agent"),
        createBullet("Sterling - Financial Viability Expert"),
        createBullet("Atlas - Scalability Strategist"),
        createBullet("Sage - Compliance Expert"),
        createParagraph(""),
        createParagraph("PRICING TIERS", true),
        createTable(
          ["Tier", "Price", "Tools", "Target User"],
          [
            ["Free", "£0", "13", "Initial exploration"],
            ["Basic", "£29", "20", "Straightforward applications"],
            ["Premium", "£49", "83", "Most applicants"],
            ["Enterprise", "£89", "109", "Advanced IP strategy"],
            ["Ultimate", "£299", "109 + VIP", "Personal strategist, guarantee"]
          ]
        ),
        createParagraph(""),
        createParagraph("INNOVATION EVIDENCE", true),
        createBullet("Market Innovation: First fully-integrated Innovator Founder Visa platform"),
        createBullet("Technology Innovation: Multi-LLM architecture (GPT-4, Gemini)"),
        createBullet("Business Model Innovation: Transforms £5,000+ service into £29-299 product"),
        createBullet("Social Innovation: Democratises access for entrepreneurs globally"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 6: FINANCIAL PROJECTIONS
        createHeading("6. FINANCIAL PROJECTIONS", HeadingLevel.HEADING_1),
        createParagraph("REVENUE FORECAST", true),
        createTable(
          ["Metric", "Year 1", "Year 2", "Year 3"],
          [
            ["Total Users", "5,000", "20,000", "50,000"],
            ["Paying Users", "500", "2,500", "7,500"],
            ["Subscription Revenue", "£135,000", "£450,000", "£960,000"],
            ["Partnership Revenue", "£30,000", "£100,000", "£180,000"],
            ["Premium Services", "£15,000", "£50,000", "£60,000"],
            ["TOTAL REVENUE", "£180,000", "£600,000", "£1,200,000"]
          ]
        ),
        createParagraph(""),
        createParagraph("COST STRUCTURE", true),
        createTable(
          ["Category", "Year 1", "Year 2", "Year 3"],
          [
            ["Personnel", "£67,000", "£225,000", "£380,000"],
            ["Technology", "£36,000", "£72,000", "£144,000"],
            ["Marketing", "£24,000", "£48,000", "£96,000"],
            ["Operations", "£19,000", "£36,000", "£54,000"],
            ["TOTAL COSTS", "£146,000", "£381,000", "£674,000"]
          ]
        ),
        createParagraph(""),
        createParagraph("PROFITABILITY", true),
        createTable(
          ["Metric", "Year 1", "Year 2", "Year 3"],
          [
            ["Net Profit", "£34,000", "£219,000", "£526,000"],
            ["Net Margin", "19%", "37%", "44%"],
            ["Break-even", "Month 4-6", "-", "-"]
          ]
        ),
        createParagraph(""),
        createParagraph("UNIT ECONOMICS", true),
        createBullet("Customer Acquisition Cost (CAC): £25"),
        createBullet("Customer Lifetime Value (LTV): £237"),
        createBullet("LTV:CAC Ratio: 9.5:1 (Excellent - industry benchmark: 3:1)"),
        createParagraph(""),
        createParagraph("FUNDING", true),
        createTable(
          ["Source", "Amount"],
          [
            ["Personal Savings", "£8,000"],
            ["Investment to Date", "£1,000"],
            ["Total Available Capital", "£8,000"]
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 7: GROWTH STRATEGY
        createHeading("7. GROWTH STRATEGY", HeadingLevel.HEADING_1),
        createParagraph("PHASE 1: UK MARKET DOMINANCE (Year 1-2)", true),
        createBullet("Establish as leading Innovator Founder Visa platform"),
        createBullet("Capture 20% market share"),
        createBullet("Build brand recognition and trust"),
        createBullet("Achieve 5,000+ active users"),
        createParagraph(""),
        createParagraph("PHASE 2: VISA CATEGORY EXPANSION (Year 2-3)", true),
        createBullet("Add Skilled Worker Visa tools"),
        createBullet("Add Global Talent Visa tools"),
        createBullet("Add Scale-Up Visa tools"),
        createBullet("Expand tool library to 200+"),
        createParagraph(""),
        createParagraph("PHASE 3: GEOGRAPHIC EXPANSION (Year 3+)", true),
        createBullet("Localised platforms for India, Nigeria, Pakistan"),
        createBullet("Multi-language support"),
        createBullet("Regional partnerships and marketing"),
        createParagraph(""),
        createParagraph("PHASE 4: ENTERPRISE & B2B (Year 3+)", true),
        createBullet("White-label solutions for law firms"),
        createBullet("University licensing programmes"),
        createBullet("Corporate immigration departments"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 8: JOB CREATION
        createHeading("8. JOB CREATION PLAN", HeadingLevel.HEADING_1),
        createParagraph("UK EMPLOYMENT COMMITMENT", true),
        createTable(
          ["Year", "New Employees", "Cumulative UK Jobs"],
          [
            ["Year 1", "2", "2"],
            ["Year 2", "5", "7"],
            ["Year 3", "5", "12"],
            ["Total by Year 3", "-", "12 UK jobs"]
          ]
        ),
        createParagraph(""),
        createParagraph("YEAR 1 HIRES", true),
        createTable(
          ["Role", "Timing", "Salary"],
          [
            ["Customer Success Manager", "Month 5", "£35,000"],
            ["Marketing Specialist", "Month 8", "£32,000"]
          ]
        ),
        createParagraph(""),
        createParagraph("YEAR 2 HIRES", true),
        createTable(
          ["Role", "Salary"],
          [
            ["Senior Developer", "£55,000"],
            ["Junior Developer", "£35,000"],
            ["Customer Success Lead", "£40,000"],
            ["Marketing Manager", "£45,000"],
            ["Operations Coordinator", "£30,000"]
          ]
        ),
        createParagraph(""),
        createParagraph("YEAR 3 HIRES", true),
        createTable(
          ["Role", "Salary"],
          [
            ["AI/ML Engineer", "£60,000"],
            ["Sales Manager", "£50,000"],
            ["Customer Support (x2)", "£28,000 each"],
            ["Content Specialist", "£35,000"]
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 9: RISK MITIGATION
        createHeading("9. RISK MITIGATION", HeadingLevel.HEADING_1),
        createParagraph("KEY RISKS & MITIGATION STRATEGIES", true),
        createTable(
          ["Risk Category", "Risk", "Mitigation Strategy"],
          [
            ["Regulatory", "Immigration policy changes", "Real-time monitoring, rapid platform updates, policy alert system"],
            ["Legal", "OISC restrictions on advice", "Clear disclaimers, lawyer partnerships, compliance-first approach"],
            ["Market", "Low adoption rates", "Freemium model, strong content marketing, user testimonials"],
            ["Competition", "New entrants/copycats", "First-mover advantage, continuous innovation, brand building"],
            ["Technical", "Platform failures", "Redundancy, monitoring, automated backups, 99.9% uptime SLA"],
            ["Financial", "Cash flow constraints", "Bootstrap approach, revenue-first strategy, conservative spending"]
          ]
        ),
        createParagraph(""),
        createParagraph("CONTINGENCY PLANS", true),
        createBullet("If user growth is slower than projected: Increase marketing spend, add referral programme"),
        createBullet("If visa requirements change significantly: 48-hour platform update capability"),
        createBullet("If competitor enters market: Accelerate feature development, enhance AI capabilities"),
        createBullet("If funding is needed earlier: Prepared pitch deck, identified potential investors"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 10: INNOVATION ASSESSMENT
        createHeading("10. INNOVATION ASSESSMENT", HeadingLevel.HEADING_1),
        createParagraph("OVERALL INNOVATION SCORE: 92.85/100", true),
        createParagraph(""),
        createTable(
          ["Criteria", "Score", "Weight", "Weighted Score"],
          [
            ["Novelty", "95/100", "25%", "23.75"],
            ["Market Need", "90/100", "20%", "18.00"],
            ["Scalability", "95/100", "20%", "19.00"],
            ["Viability", "88/100", "20%", "17.60"],
            ["Team Capability", "90/100", "15%", "13.50"],
            ["TOTAL", "-", "100%", "92.85/100"]
          ]
        ),
        createParagraph(""),
        createParagraph("INNOVATION EVIDENCE BY CRITERIA", true),
        createParagraph(""),
        createParagraph("Novelty (95/100)", true),
        createBullet("First fully-integrated AI-powered Innovator Founder Visa platform"),
        createBullet("109+ tools specifically designed for this visa category"),
        createBullet("ORACLE multi-agent AI system with specialized agents"),
        createBullet("No existing platform offers comparable functionality"),
        createParagraph(""),
        createParagraph("Market Need (90/100)", true),
        createBullet("60-70% rejection rate demonstrates need for better guidance"),
        createBullet("£3,000-15,000 traditional costs exclude qualified applicants"),
        createBullet("948,000 annual UK immigrants represent massive market"),
        createParagraph(""),
        createParagraph("Scalability (95/100)", true),
        createBullet("SaaS model enables unlimited user scaling"),
        createBullet("Zero marginal cost per additional user"),
        createBullet("Multi-visa category expansion roadmap"),
        createBullet("Geographic expansion potential to 50+ countries"),
        createParagraph(""),
        createParagraph("Viability (88/100)", true),
        createBullet("Strong unit economics (LTV:CAC 9.5:1)"),
        createBullet("Break-even projected Month 4-6"),
        createBullet("£8,000 bootstrap funding sufficient for launch"),
        createBullet("44% net margin by Year 3"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 11: INTERVIEW PREPARATION
        createHeading("11. INTERVIEW PREPARATION", HeadingLevel.HEADING_1),
        createParagraph("ANTICIPATED QUESTIONS & RESPONSES", true),
        createParagraph(""),
        createParagraph("Q1: What is innovative about your business?", true),
        createParagraph("A: UK Innovator Founder Visa Assistant is the first fully-integrated AI-powered platform specifically designed for Innovator Founder Visa applicants. While traditional immigration services rely on expensive one-to-one consultations, our platform provides 109+ professional-grade tools available 24/7, reducing costs by 90% while maintaining expert-level quality. Our ORACLE AI system with four specialized agents delivers guidance that previously required £5,000+ in professional fees for just £29-299."),
        createParagraph(""),
        createParagraph("Q2: How will you make money?", true),
        createParagraph("A: We operate a tiered subscription model ranging from Free (13 tools) to Ultimate (£299 with personal strategist). Our primary revenue comes from Premium (£49) and Enterprise (£89) subscriptions, supplemented by partnerships with immigration lawyers and educational institutions. Year 1 projected revenue is £180,000, growing to £1.2M by Year 3."),
        createParagraph(""),
        createParagraph("Q3: What is your competitive advantage?", true),
        createParagraph("A: Three key advantages: (1) First-mover in AI-powered Innovator Founder Visa guidance, (2) Comprehensive 109+ tool ecosystem that would take years for competitors to replicate, (3) Unique founder combination of MSc Data Science, 7+ years development experience, and personal immigration journey understanding."),
        createParagraph(""),
        createParagraph("Q4: How will you create jobs in the UK?", true),
        createParagraph("A: We're committed to creating 12 UK jobs by Year 3. Year 1: Customer Success Manager and Marketing Specialist. Year 2: Senior Developer, Junior Developer, and three additional roles. Year 3: AI/ML Engineer, Sales Manager, and support staff. All roles will be UK-based, contributing to the local tech ecosystem."),
        createParagraph(""),
        createParagraph("Q5: What are the main risks to your business?", true),
        createParagraph("A: The main risks are: (1) Regulatory changes - mitigated by real-time policy monitoring and 48-hour update capability, (2) Legal restrictions on advice - addressed through clear OISC disclaimers and lawyer partnerships, (3) Market adoption - managed through freemium model and content marketing. We've developed comprehensive contingency plans for each scenario."),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 12: SUPPORTING EVIDENCE
        createHeading("12. SUPPORTING EVIDENCE SUMMARY", HeadingLevel.HEADING_1),
        createParagraph("EVIDENCE CATEGORIES", true),
        createParagraph(""),
        createParagraph("1. IDENTITY & IMMIGRATION STATUS", true),
        createBullet("Valid passport (B50350937)"),
        createBullet("Current PSW visa documentation"),
        createBullet("UK residence proof (utility bills, council tax)"),
        createParagraph(""),
        createParagraph("2. EDUCATIONAL QUALIFICATIONS", true),
        createBullet("MSc Data Science certificate - Leeds Beckett University (2023)"),
        createBullet("BSc Computer Engineering certificate - University of Benin"),
        createBullet("Academic transcripts"),
        createParagraph(""),
        createParagraph("3. PROFESSIONAL EXPERIENCE", true),
        createBullet("Portfolio of 50+ completed projects"),
        createBullet("Client testimonials and references"),
        createBullet("LinkedIn profile with endorsements"),
        createBullet("GitHub repository demonstrating technical skills"),
        createParagraph(""),
        createParagraph("4. FINANCIAL EVIDENCE", true),
        createBullet("Bank statements showing £8,000 personal savings"),
        createBullet("Personal investment documentation"),
        createBullet("Financial projections (included in this document)"),
        createParagraph(""),
        createParagraph("5. BUSINESS DEVELOPMENT EVIDENCE", true),
        createBullet("Live platform demonstration"),
        createBullet("Platform screenshots and feature documentation"),
        createBullet("User metrics and engagement data"),
        createBullet("Technical architecture documentation"),
        createParagraph(""),
        createParagraph("6. MARKET RESEARCH", true),
        createBullet("Immigration statistics from Home Office"),
        createBullet("Competitor analysis documentation"),
        createBullet("User surveys and feedback"),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 13: SUBMISSION CHECKLIST
        createHeading("13. SUBMISSION CHECKLIST", HeadingLevel.HEADING_1),
        createParagraph("PRE-SUBMISSION VERIFICATION", true),
        createParagraph(""),
        createTable(
          ["Category", "Item", "Status"],
          [
            ["Identity", "Valid passport", "Required"],
            ["Identity", "Current visa documentation", "Required"],
            ["Identity", "Proof of UK address", "Required"],
            ["Education", "MSc certificate", "Required"],
            ["Education", "BSc certificate", "Required"],
            ["Financial", "Bank statement (£8,000)", "Required"],
            ["Financial", "Investment proof", "Required"],
            ["Business", "Business plan (this document)", "Complete"],
            ["Business", "Financial projections", "Complete"],
            ["Business", "Innovation assessment", "Complete"],
            ["Business", "Market research", "Complete"],
            ["Evidence", "Platform screenshots", "Required"],
            ["Evidence", "Client testimonials", "Required"],
            ["Evidence", "GitHub portfolio", "Available"]
          ]
        ),
        createParagraph(""),
        createParagraph("ENDORSER CONTACT SCHEDULE", true),
        createTable(
          ["Contact", "Timing", "Key Milestones to Report"],
          [
            ["Contact 1", "Month 6", "Platform launch, first 500 users, initial revenue"],
            ["Contact 2", "Month 12", "5,000 users, first UK hires, revenue targets"],
            ["Contact 3", "Month 18", "10,000+ users, team expansion, product updates"],
            ["Contact 4", "Month 24", "Year 2 milestones, profitability metrics"],
            ["Contact 5", "Month 30", "Geographic expansion, partnership progress"],
            ["Contact 6", "Month 36", "12 employees, market leadership, Year 3 results"]
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // CLOSING
        createHeading("DECLARATION", HeadingLevel.HEADING_1),
        createParagraph("I, Ebuka Benedict Umeh, confirm that all information provided in this application package is true, complete, and accurate to the best of my knowledge. I understand that providing false or misleading information may result in the refusal of my visa application."),
        createParagraph(""),
        createParagraph(""),
        createParagraph("Signature: _______________________________"),
        createParagraph(""),
        createParagraph(`Name: ${FOUNDER.name}`),
        createParagraph("Date: November 2025"),
        createParagraph(""),
        createParagraph(""),
        createParagraph("---"),
        createParagraph(""),
        createParagraph("OISC COMPLIANCE NOTICE", true),
        createParagraph("This document provides general business planning guidance and does not constitute regulated immigration advice. For specific immigration matters, consult with an OISC-registered adviser or qualified immigration lawyer. This application package was prepared using the UK Innovator Founder Visa Assistant platform."),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('attached_assets/ULTIMATE_VISA_APPLICATION_PACKAGE.docx', buffer);
  console.log('✅ Created: attached_assets/ULTIMATE_VISA_APPLICATION_PACKAGE.docx');
}

generateDocument().catch(console.error);
