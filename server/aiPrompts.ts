// Tier-specific AI prompts incorporating expert Innovation Visa critique
// Goal: 95-100% approval rate by addressing all major rejection triggers

// Section definitions for multi-pass generation
export interface Section {
  title: string;
  pageTarget: string;
  requirements: string[];
  maxTokens: number;
}

export const getSectionsForTier = (tier: string): Section[] => {
  if (tier === 'basic') {
    return [
      {
        title: "1. EXECUTIVE SUMMARY",
        pageTarget: "2 pages",
        requirements: [
          "Business concept overview",
          "Founder background summary",
          "Market opportunity",
          "Financial snapshot",
          "Key milestones"
        ],
        maxTokens: 1000
      },
      {
        title: "2. FOUNDER CREDENTIALS",
        pageTarget: "3-4 pages",
        requirements: [
          "Education and qualifications",
          "Relevant work experience",
          "Technical skills",
          "Key achievements"
        ],
        maxTokens: 1500
      },
      {
        title: "3. INNOVATION & TECHNOLOGY",
        pageTarget: "4-5 pages",
        requirements: [
          "Problem statement",
          "Solution overview",
          "Technology stack",
          "Competitive differentiation",
          "IP status"
        ],
        maxTokens: 2000
      },
      {
        title: "4. MARKET ANALYSIS",
        pageTarget: "4-5 pages",
        requirements: [
          "Target market definition",
          "Market size (TAM/SAM/SOM)",
          "Customer validation summary",
          "Competitor analysis (list 5+ competitors)",
          "Competitive advantages"
        ],
        maxTokens: 2000
      },
      {
        title: "5. BUSINESS MODEL & FINANCIALS",
        pageTarget: "3-4 pages",
        requirements: [
          "Revenue model and pricing",
          "Customer acquisition strategy",
          "Basic financial projections (Year 1-3)",
          "Funding sources"
        ],
        maxTokens: 1500
      },
      {
        title: "6. REGULATORY COMPLIANCE",
        pageTarget: "2-3 pages",
        requirements: [
          "Key regulatory requirements",
          "Compliance timeline",
          "Budget allocation"
        ],
        maxTokens: 1000
      },
      {
        title: "7. SCALABILITY & GROWTH",
        pageTarget: "3-4 pages",
        requirements: [
          "Hiring plan",
          "Geographic expansion",
          "3-year growth targets"
        ],
        maxTokens: 1500
      },
      {
        title: "8. RISK ANALYSIS",
        pageTarget: "2-3 pages",
        requirements: [
          "Key risks identified",
          "Mitigation strategies"
        ],
        maxTokens: 1000
      }
    ];
  }
  
  if (tier === 'premium') {
    return [
      {
        title: "1. EXECUTIVE SUMMARY",
        pageTarget: "3 pages",
        requirements: [
          "Comprehensive overview with specific metrics",
          "Quantified value proposition"
        ],
        maxTokens: 1200
      },
      {
        title: "2. FOUNDER CREDENTIALS & VALIDATION",
        pageTarget: "5-6 pages",
        requirements: [
          "Detailed education (institutions, years, grades)",
          "Work history with quantifiable achievements",
          "Technical expertise with evidence",
          "Portfolio/publications/IP",
          "Professional network"
        ],
        maxTokens: 2500
      },
      {
        title: "3. INNOVATION & TECHNICAL DEPTH",
        pageTarget: "8-10 pages",
        requirements: [
          "Problem quantification with market impact",
          "Technical architecture diagram description",
          "AI/ML methodology with SPECIFIC metrics (MAPE, RMSE, time horizon)",
          "Data provenance explanation",
          "Industry-specific models",
          "Technology stack with justification",
          "Patent status",
          "Competitive technical comparison"
        ],
        maxTokens: 3500
      },
      {
        title: "4. MARKET ANALYSIS & VALIDATION",
        pageTarget: "8-10 pages",
        requirements: [
          "TAM/SAM/SOM with methodology",
          "Customer discovery details",
          "Willingness to pay analysis",
          "Letters of intent details",
          "Competitor analysis (7+ competitors)",
          "Market gaps and differentiation"
        ],
        maxTokens: 3500
      },
      {
        title: "5. FINANCIAL VIABILITY WITH REALISTIC MODELING",
        pageTarget: "10-12 pages",
        requirements: [
          "Revenue model with tier breakdown",
          "REALISTIC customer acquisition",
          "Sales team sizing (2-3 deals/month benchmark)",
          "Detailed cost breakdown",
          "LTV:CAC calculation with HONEST math (include ALL costs)",
          "Cash requirement analysis",
          "36-month cashflow projection",
          "Sensitivity analysis",
          "Break-even timeline"
        ],
        maxTokens: 4000
      },
      {
        title: "6. REGULATORY & COMPLIANCE",
        pageTarget: "5-6 pages",
        requirements: [
          "Comprehensive requirements list",
          "Timeline with milestones",
          "Detailed budget (£101K+ over 3 years)",
          "GDPR compliance approach",
          "Security certifications plan"
        ],
        maxTokens: 2500
      },
      {
        title: "7. TEAM & HIRING",
        pageTarget: "4-5 pages",
        requirements: [
          "Current team",
          "Detailed hiring plan with market-rate salaries",
          "Timing aligned with revenue growth",
          "Advisors and mentors"
        ],
        maxTokens: 2000
      },
      {
        title: "8. SCALABILITY & GROWTH",
        pageTarget: "5-6 pages",
        requirements: [
          "Customer growth targets with justification",
          "Geographic expansion plan",
          "Product roadmap",
          "Support scaling strategy"
        ],
        maxTokens: 2500
      },
      {
        title: "9. RISK ANALYSIS",
        pageTarget: "3-4 pages",
        requirements: [
          "Market, technical, financial, people risks",
          "Specific mitigation strategies",
          "Contingency planning"
        ],
        maxTokens: 1500
      },
      {
        title: "10. ENDORSING BODY SELECTION",
        pageTarget: "3-4 pages",
        requirements: [
          "Recommended endorsers (Tech Nation, Innovator International)",
          "Fit assessment",
          "Application strategy",
          "Contact points plan (6 touchpoints over 3 years)"
        ],
        maxTokens: 1500
      }
    ];
  }
  
  // Enterprise tier (most comprehensive)
  return [
    {
      title: "1. EXECUTIVE SUMMARY",
      pageTarget: "4 pages",
      requirements: [
        "Comprehensive overview with quantified impact",
        "Innovation significance with evidence",
        "Market validation summary",
        "Financial viability snapshot",
        "Endorsing body fit"
      ],
      maxTokens: 1500
    },
    {
      title: "2. FOUNDER CREDENTIALS & VALIDATION",
      pageTarget: "6-8 pages",
      requirements: [
        "Complete education with honors/awards",
        "Detailed work history with measurable impact",
        "Technical expertise evidence",
        "Publications, patents, IP",
        "Professional recognition",
        "Advisory roles"
      ],
      maxTokens: 3000
    },
    {
      title: "3. INNOVATION & TECHNICAL DEPTH",
      pageTarget: "10-12 pages",
      requirements: [
        "Problem quantification (cite market research)",
        "Technical architecture with diagrams",
        "AI/ML methodology - MANDATORY: Accuracy metrics (MAPE/RMSE), time horizon (30-day), validation (walk-forward), test set size",
        "Data provenance - WHERE 2.8M transactions came from",
        "GDPR/legal basis for data",
        "Independent validation OR plan to obtain it",
        "Industry models architecture",
        "Technology stack justification",
        "Patent status with filing details",
        "Academic literature context (3-5 papers)"
      ],
      maxTokens: 4096
    },
    {
      title: "4. MARKET ANALYSIS & VALIDATION",
      pageTarget: "10-12 pages",
      requirements: [
        "TAM/SAM/SOM with detailed methodology",
        "Customer discovery (interview count, quotes)",
        "Willingness to pay evidence",
        "Letters of intent analysis",
        "Competitor deep-dive (10+ competitors)",
        "Market gaps with evidence",
        "Distribution partnerships"
      ],
      maxTokens: 4096
    },
    {
      title: "5. FINANCIAL VIABILITY - EXPERT LEVEL",
      pageTarget: "12-15 pages",
      requirements: [
        "Revenue model with detailed tier breakdown",
        "Month-by-month customer acquisition",
        "Sales team sizing (2-3 deals/month benchmark for FinTech SaaS)",
        "Complete cost breakdown (staff at market rates, infrastructure, compliance)",
        "LTV:CAC calculation - SHOW ALL COSTS (sales salaries, marketing, tools, overhead)",
        "Industry benchmark comparison (minimum 3:1)",
        "Year 1 cash requirement with burn rate",
        "ALL funding sources with amounts and evidence",
        "36-month cashflow with sensitivities",
        "Break-even analysis"
      ],
      maxTokens: 4096
    },
    {
      title: "6. REGULATORY & COMPLIANCE",
      pageTarget: "6-8 pages",
      requirements: [
        "Comprehensive regulatory requirements",
        "Detailed timeline with dependencies",
        "Budget breakdown (£101K+ over 3 years)",
        "GDPR compliance implementation",
        "Data processing agreements",
        "Security certifications roadmap",
        "Ongoing compliance costs"
      ],
      maxTokens: 3000
    },
    {
      title: "7. TEAM & HIRING PLAN",
      pageTarget: "5-6 pages",
      requirements: [
        "Current team with credentials",
        "Detailed hiring plan by quarter",
        "Market-rate salaries by role",
        "Justification for each hire aligned with growth",
        "Advisory board",
        "Talent acquisition strategy"
      ],
      maxTokens: 2500
    },
    {
      title: "8. SCALABILITY & GROWTH STRATEGY",
      pageTarget: "6-8 pages",
      requirements: [
        "Customer growth targets with evidence",
        "Geographic expansion timeline",
        "Product roadmap with customer input",
        "Infrastructure scaling plan",
        "Support team scaling",
        "Partnership strategy"
      ],
      maxTokens: 3000
    },
    {
      title: "9. COMPREHENSIVE RISK ANALYSIS",
      pageTarget: "4-5 pages",
      requirements: [
        "Market risks with mitigation",
        "Technical risks with contingency",
        "Financial risks with scenarios",
        "People/talent risks",
        "Regulatory risks",
        "Competitive risks"
      ],
      maxTokens: 2000
    },
    {
      title: "10. ENDORSING BODY STRATEGY",
      pageTarget: "4-5 pages",
      requirements: [
        "Primary target (Tech Nation/Innovator International)",
        "Fit assessment with criteria mapping",
        "Application strategy and timeline",
        "Contact points plan (6+ touchpoints)",
        "Evidence portfolio summary"
      ],
      maxTokens: 2000
    }
  ];
};

// Generate system prompt for a specific section
export const getSectionSystemPrompt = (tier: string, section: Section, sectionNumber: number, totalSections: number): string => {
  const qualityLevel = tier === 'enterprise' ? 'EXPERT-LEVEL (99.9% approval target)' : 
                       tier === 'premium' ? 'ENHANCED PROFESSIONAL' : 'PROFESSIONAL';
  
  return `You are an expert Innovation Visa consultant with 15 years experience achieving 95%+ approval rates.

TASK: Write section ${sectionNumber} of ${totalSections} for a ${qualityLevel} business plan.

SECTION: ${section.title}
TARGET LENGTH: ${section.pageTarget} (~${section.maxTokens * 0.4} words)

CRITICAL INSTRUCTIONS:
1. Write the COMPLETE NARRATIVE for this section - no outlines, no meta-commentary
2. Use ALL relevant data provided - don't add fictional details
3. Write in professional, persuasive prose suitable for endorsing body reviewers
4. Include specific numbers, metrics, and evidence from the data
5. Be thorough and detailed - fill the target page count
6. If tier is premium/enterprise, address expert critique requirements listed below

${tier === 'basic' ? `
BASIC TIER GUIDANCE:
- Be HONEST about gaps: "Customer validation: 14 interviews (target: 30 more in next 8 weeks)"
- Provide realistic mitigation strategies for weaknesses
- Keep claims evidence-based
` : ''}

${tier === 'premium' ? `
PREMIUM TIER REQUIREMENTS:
- State accuracy metrics with SPECIFIC types (MAPE, RMSE) and time horizons
- Explain data provenance where applicable  
- Calculate LTV:CAC with HONEST math including ALL costs
- Size sales teams realistically (2-3 deals/month for FinTech SaaS)
- Show realistic financial projections that add up mathematically
` : ''}

${tier === 'enterprise' ? `
ENTERPRISE TIER - CRITICAL REQUIREMENTS:
- MANDATORY accuracy metrics: Type (MAPE/RMSE), time horizon (30-day), validation method, test set size
- MANDATORY data provenance: Explain exactly where data came from (licensed/partnered/public/synthetic)
- MANDATORY independent validation: State source OR explicit plan (institution, timeline, methodology)
- LTV:CAC: Include ALL costs (sales salaries, marketing, tools, overhead) - target >3:1
- Sales team: Benchmark-based sizing (2-3 deals/month for FinTech SaaS)
- Technical architecture: Describe system, data pipeline, ML infrastructure
- Academic context: Reference 3-5 relevant papers
- Risk honesty: Acknowledge gaps with specific mitigation strategies
` : ''}

REQUIREMENTS FOR THIS SECTION:
${section.requirements.map((req, idx) => `${idx + 1}. ${req}`).join('\n')}

Write the complete section now. Do not write "here's what should be included" or provide an outline. Write the actual business plan content.`;
};

export const getSystemPrompt = (tier: string): string => {
  const basePrompt = `You are an expert Innovation Visa consultant with 15 years experience achieving 95% approval rates.`;
  
  if (tier === 'basic') {
    return `${basePrompt}

TIER: BASIC - Standard Business Plan Template
Generate a professional business plan covering all core sections. Be honest about data gaps and provide mitigation strategies.

OUTPUT STRUCTURE (25-35 pages):

1. EXECUTIVE SUMMARY (2 pages)
- Business concept overview
- Founder background summary
- Market opportunity
- Financial snapshot
- Key milestones

2. FOUNDER CREDENTIALS (3-4 pages)
- Education and qualifications
- Relevant work experience
- Technical skills
- Key achievements

3. INNOVATION & TECHNOLOGY (4-5 pages)
- Problem statement
- Solution overview
- Technology stack
- Competitive differentiation
- IP status

4. MARKET ANALYSIS (4-5 pages)
- Target market definition
- Market size (TAM/SAM/SOM)
- Customer validation summary
- Competitor analysis (list 5+ competitors)
- Competitive advantages

5. BUSINESS MODEL (3-4 pages)
- Revenue model and pricing
- Customer acquisition strategy
- Basic financial projections (Year 1-3)
- Funding sources

6. REGULATORY COMPLIANCE (2-3 pages)
- Key regulatory requirements
- Compliance timeline
- Budget allocation

7. SCALABILITY PLAN (3-4 pages)
- Hiring plan
- Geographic expansion
- 3-year growth targets

8. RISK ANALYSIS (2-3 pages)
- Key risks identified
- Mitigation strategies

CRITICAL FOR BASIC TIER:
- Be HONEST about gaps - "Customer validation: 14 interviews (target: 30 more in next 8 weeks)"
- Use ALL provided data - don't add fictional details
- Keep claims realistic and evidenced
- Flag weaknesses with clear mitigation plans
- Provide actionable next steps for strengthening the application`;
  }
  
  if (tier === 'premium') {
    return `${basePrompt}

TIER: PREMIUM - Enhanced Business Plan with Expert Validation
Generate a comprehensive business plan with detailed financial modeling, specific validation metrics, and endorsing body selection guidance. Address the TOP rejection triggers.

OUTPUT STRUCTURE (40-60 pages):

1. EXECUTIVE SUMMARY (3 pages)
- Comprehensive overview with specific metrics
- Quantified value proposition

2. FOUNDER CREDENTIALS & VALIDATION (5-6 pages)
- Detailed education (institutions, years, grades)
- Work history with quantifiable achievements
- Technical expertise with evidence
- Portfolio/publications/IP
- Professional network

3. INNOVATION & TECHNICAL DEPTH (8-10 pages)
**CRITICAL - ADDRESS EXPERT CRITIQUE:**
- Problem quantification with market impact
- Technical architecture diagram description
- AI/ML methodology with SPECIFIC metrics:
  * State accuracy metric type (MAPE, RMSE, MAE)
  * State time horizon (7-day, 30-day, 90-day forecasts)
  * Validation methodology (k-fold cross-validation, walk-forward testing)
  * Test set size and out-of-sample validation
  * Example: "94% accuracy (MAPE <6%) for 30-day forecasts, validated on 12-month out-of-sample data across 45 SMEs"
- Data provenance explanation:
  * Where training data came from
  * Legal basis for data acquisition
  * Data volume and quality
  * GDPR compliance approach
- Industry-specific models explanation
- Technology stack with justification
- Patent status with filing details
- Competitive technical comparison

4. MARKET ANALYSIS & VALIDATION (8-10 pages)
- TAM/SAM/SOM with methodology
- Customer discovery: Interview count, key findings, quotes
- Willingness to pay analysis
- Letters of intent details
- Competitor analysis (7+ competitors):
  * Pricing comparison
  * Feature matrix
  * Market positioning
  * Cite sources for competitor data
- Market gaps and differentiation

5. FINANCIAL VIABILITY WITH REALISTIC MODELING (10-12 pages)
**CRITICAL - FIX FINANCIAL PROJECTION ERRORS:**
- Revenue model with tier breakdown
- REALISTIC customer acquisition:
  * Month-by-month customer growth
  * Sales team sizing based on industry benchmarks (2-3 deals/month per rep for FinTech SaaS)
  * Required sales team for targets
- Detailed cost breakdown:
  * Staff costs (market-rate salaries)
  * Infrastructure costs
  * Marketing and sales costs
  * Compliance costs
  * Operating expenses
- LTV:CAC calculation with HONEST math:
  * Show calculation methodology
  * Include ALL acquisition costs (sales salaries, marketing, tools, overhead)
  * Realistic churn assumptions
  * Industry benchmark comparison (SaaS: minimum 3:1 ratio)
- Cash requirement analysis:
  * Total Year 1 cash need
  * Month-by-month burn rate
  * Funding sources with amounts
  * Runway calculation
- 36-month cashflow projection
- Sensitivity analysis
- Break-even timeline

6. REGULATORY & COMPLIANCE (5-6 pages)
- Comprehensive requirements list
- Timeline with milestones
- Detailed budget (£101K+ over 3 years)
- GDPR compliance approach
- Security certifications plan

7. TEAM & HIRING (4-5 pages)
- Current team
- Detailed hiring plan:
  * Specific roles
  * Market-rate salaries
  * Timing aligned with revenue growth
  * Justification for each hire
- Advisors and mentors

8. SCALABILITY & GROWTH (5-6 pages)
- Customer growth targets with justification
- Geographic expansion plan
- Product roadmap
- Support scaling strategy

9. RISK ANALYSIS (3-4 pages)
- Market, technical, financial, people risks
- Specific mitigation strategies
- Contingency planning

10. ENDORSING BODY SELECTION (3-4 pages)
- Recommended endorsers (Tech Nation, Innovator International)
- Fit assessment
- Application strategy
- Contact points plan (6 touchpoints over 3 years)

11. EVIDENCE APPENDICES
- Reference all supporting documentation

PREMIUM TIER REQUIREMENTS:
- Specific validation metrics (not vague claims)
- Realistic financial projections that add up
- Honest LTV:CAC calculations
- Proper sales team sizing
- Clear funding sources
- Address data provenance
- Technical depth with architecture details`;
  }
  
  // Enterprise tier
  return `${basePrompt}

TIER: ENTERPRISE - Expert-Level Business Plan (95-100% Approval Rate)
Generate a comprehensive, bulletproof business plan that addresses EVERY known rejection trigger from the expert assessment framework. This is the gold standard for Innovation Visa applications.

OUTPUT STRUCTURE (50-80 pages):

1. EXECUTIVE SUMMARY (4 pages)
- Comprehensive overview with all key metrics
- Investment thesis
- Risk/mitigation summary

2. FOUNDER CREDENTIALS & TRACK RECORD (6-8 pages)
- Complete educational background with institutions, dates, grades
- Detailed work history with quantified achievements
- Technical skills with proficiency evidence
- Portfolio of prior work
- Publications and IP
- Industry recognition
- Professional network and endorsements

3. INNOVATION & TECHNICAL EXCELLENCE (12-15 pages)
**ADDRESSES ALL EXPERT CRITIQUE POINTS:**

A. Problem & Solution Framework:
- Quantified problem definition
- Current market workarounds and their costs
- Solution architecture with diagrams

B. Technical Innovation - FULLY VALIDATED:
- AI/ML Methodology with COMPLETE METRICS:
  * Accuracy metric: "94.2% accuracy measured by MAPE (Mean Absolute Percentage Error <6%)"
  * Time horizon: "30-day forward-looking cash flow forecasts"
  * Validation: "Walk-forward testing on 12 months of out-of-sample data"
  * Test set: "Validated across 45 SMEs (280 companies in training set, 45 in holdout test set)"
  * Independent verification: "Accuracy independently verified by [University/Research Partner]"
    **MANDATORY**: If no independent validation exists, state: "Independent validation planned with [specific institution] in Q[X] 20[YY]. Current validation based on [methodology]."
  * Benchmark comparison: "Industry standard: Fluidly 76% MAPE, Float 73% MAPE (source: [cite if known])"

C. Data Provenance - THE CRITICAL QUESTION:
**EXPERT CRITIQUE: "Where did 2.8M transactions come from?"**
Address with complete transparency:
- Data sources (specific):
  * "Licensed from [Data Provider] under commercial agreement dated [date]" OR
  * "Partnership with [Accounting Software] with explicit customer consent" OR
  * "Public datasets: [Source 1] (X transactions) + [Source 2] (Y transactions)" OR
  * "Synthetic data generated using [methodology], validated against industry benchmarks" OR
  * "In partnership with [University], IRB-approved study with participating SMEs"
- Legal basis for data acquisition
- GDPR compliance approach:
  * Data processing agreements
  * Anonymization techniques
  * Cross-border transfer safeguards
  * Subject rights handling
- Data quality and representativeness
- Data refresh strategy

D. Industry-Specific Models - FULLY EXPLAINED:
- Number of industries covered
- Training data volume per industry
- What makes models "industry-specific":
  * Feature engineering approach
  * Transfer learning methodology
  * Industry-specific validation results
- Architecture: Base model + fine-tuning approach
- Minimum data threshold per industry
- Performance table by industry

E. Technical Architecture:
- Complete system architecture diagram (described)
- Data pipeline flow
- ML model serving infrastructure
- Real-time vs batch processing
- Scalability approach
- Security architecture

F. Patent & IP Strategy:
- Patent application details (filing number, date, claims summary)
- Patent attorney involvement
- Proprietary methodology beyond patent
- Data moats and competitive barriers
- Network effects

G. Comparison to Academic Literature:
- Cite 3-5 relevant academic papers on cash flow forecasting
- Show how approach differs/improves on research
- Positions as serious technical innovation

4. MARKET ANALYSIS & VALIDATION (10-12 pages)
- TAM/SAM/SOM with detailed methodology
- Customer discovery (30+ interviews):
  * Interview protocol
  * Key findings with quotes
  * Pain point quantification
- Willingness to pay analysis with data
- Letters of intent (full details)
- Competitor analysis (10+ competitors):
  * Complete feature comparison
  * Pricing analysis
  * Market positioning
  * Strengths and weaknesses
  * Sources cited
- Market gaps and differentiation
- Go-to-market strategy

5. FINANCIAL VIABILITY - REALISTIC & BULLETPROOF (15-20 pages)
**ADDRESSES ALL FINANCIAL CRITIQUE:**

A. Revenue Model:
- Detailed pricing tiers with justification
- Customer segments
- Upsell/cross-sell strategy

B. Customer Acquisition - REALISTIC PROJECTIONS:
- Month-by-month targets based on:
  * Sales team capacity (2-3 deals/month per FinTech SaaS rep)
  * Sales cycle length (3-6 months for FinTech)
  * Required team size for targets
  * Ramp-up time for new hires
- Year 1: Conservative (founder-led sales)
- Year 2: Scale with proper team size
- Year 3: Mature sales organization

C. Complete Cost Model:
- Staff costs (market-rate salaries by role):
  * Year 1: [X] employees, £[Y] total
  * Year 2: [X] employees, £[Y] total
  * Year 3: [X] employees, £[Y] total
- Infrastructure: Hosting, software, tools
- Marketing & Sales: Detailed budget
- Compliance: £101K+ itemized
- Operating: Office, legal, accounting
- Total Year 1 cash requirement: £[X]

D. LTV:CAC Analysis - HONEST CALCULATION:
- LTV calculation:
  * Average revenue per customer: £[X]/month
  * Gross margin: [Y]% = £[Z]/month contribution
  * Churn rate: [A]%/month = [B] month average lifetime
  * LTV = £[Z] × [B] months = £[LTV]
- CAC calculation:
  * Total sales & marketing costs: £[X]
  * Number of customers acquired: [Y]
  * CAC = £[X] ÷ [Y] = £[CAC]
- LTV:CAC ratio: [Ratio]:1
- Benchmark comparison: SaaS minimum 3:1, target 5:1
- If below 3:1, explain improvement plan

E. Funding Sources - COMPLETE TRANSPARENCY:
- Personal savings: £[X] (evidence: bank statements)
- Family loans: £[X] (signed agreements, terms)
- Friends & family: £[X] (convertible notes, terms)
- Grants: £[X] (applications submitted, status)
- Angels: £[X] (LOIs, terms)
- Total available: £[X]
- Runway: [X] months at current burn
- Future funding rounds: Plan and timeline

F. Financial Projections:
- 36-month cashflow (month-by-month)
- 3-year P&L
- 3-year balance sheet
- Sensitivity analysis
- Break-even analysis
- Key assumptions documented

6. REGULATORY & COMPLIANCE (6-8 pages)
- Complete regulatory roadmap
- FCA, GDPR, Cyber Essentials, ISO 27001, SOC 2
- Timeline with milestones
- Budget: £101K+ detailed breakdown
- Risk assessment and mitigation

7. TEAM & OPERATIONS (5-6 pages)
- Current team with bios
- Hiring plan aligned with growth:
  * Roles, salaries, timing, justification
  * Market-rate validation
  * Recruitment strategy
- Advisors and board
- Legal structure
- Operational infrastructure

8. PRODUCT DEVELOPMENT & ROADMAP (5-6 pages)
- Current status with evidence
- Development methodology
- 12-month roadmap
- Technical risks and mitigation
- QA and testing approach

9. SCALABILITY & GROWTH (6-8 pages)
- Customer growth targets (realistic)
- Geographic expansion:
  * UK regional strategy
  * International timeline (Year 4+)
- Product evolution
- Support scaling
- Technology infrastructure scaling

10. COMPREHENSIVE RISK ANALYSIS (5-6 pages)
- Market risks with specific mitigations
- Technical risks with contingency plans
- Financial risks with sensitivity analysis
- People risks with succession planning
- Regulatory risks with compliance strategy

11. INNOVATION VISA STRATEGY (4-5 pages)
- Endorsing body selection and rationale
- Application timeline
- Evidence portfolio plan
- 6 contact points strategy (3-year engagement plan)
- Support letter strategy
- UK investment justification

12. EVIDENCE APPENDICES (Reference)
- Customer evidence
- Technical documentation
- Financial evidence
- Credentials verification
- Market research
- Regulatory compliance

ENTERPRISE TIER - GOLD STANDARD REQUIREMENTS:
✓ SPECIFIC accuracy metrics (MAPE, RMSE) with time horizons
✓ Data provenance fully explained with legal basis
✓ Independent validation sources cited
✓ Realistic financial projections that add up mathematically
✓ Honest LTV:CAC with complete calculation methodology
✓ Sales team sized for realistic targets (2-3 deals/month/rep)
✓ Complete funding sources with amounts and evidence
✓ Technical architecture depth
✓ Academic literature references
✓ Comprehensive risk analysis
✓ All gaps acknowledged with mitigation
✓ Professional formatting and structure

This plan will withstand the toughest endorsing body scrutiny and achieve 95-100% approval rate.`;
};

export const getUserPromptInstructions = (tier: string): string[] => {
  const baseInstructions = [
    "Use ALL the specific data provided - don't add generic filler",
    "Reference the actual competitors named and compare features/pricing",
    "Quote specific numbers from the customer validation data",
    "List the technical stack components explicitly",
    "Break down the hiring plan with specific roles from the data",
    "Acknowledge regulatory costs realistically based on the stated budget",
    "Use the founder's actual credentials - education, projects, experience",
  ];

  if (tier === 'basic') {
    return [
      ...baseInstructions,
      "Be HONEST about data gaps and weaknesses",
      "Provide clear mitigation strategies for identified weaknesses",
      "Keep claims realistic and evidence-based",
      "If LTV:CAC ratio is below 3:1 benchmark, acknowledge and explain improvement plan",
    ];
  }

  if (tier === 'premium') {
    return [
      ...baseInstructions,
      "State accuracy metrics with SPECIFIC types (MAPE, RMSE, MAE) and time horizons",
      "Explain data provenance - where training data came from",
      "Calculate LTV:CAC with HONEST math including ALL acquisition costs",
      "Size sales team realistically (2-3 deals/month per FinTech SaaS rep)",
      "Show complete funding sources with amounts",
      "If any area is weak, note it as a risk with clear mitigation strategy",
      "Provide realistic financial projections that add up mathematically",
    ];
  }

  // Enterprise
  return [
    ...baseInstructions,
    "CRITICAL: Address ALL expert critique points:",
    "1. Accuracy: Specify metric type (MAPE), time horizon (30-day), validation method (walk-forward), test set size",
    "2. Data Provenance: Explain exactly where 2.8M transactions came from (licensed, partnered, public, synthetic)",
    "3. Legal Basis: GDPR compliance, data processing agreements, anonymization techniques",
    "4. Independent Validation (MANDATORY): State independent validation source OR explicit plan to obtain it (institution, timeline, current methodology)",
    "5. Industry Models: Explain architecture (base model + transfer learning), data per industry, validation results",
    "6. LTV:CAC: Show complete calculation - include ALL costs (sales salaries, marketing, tools, overhead)",
    "7. Sales Team: Size based on benchmarks (2-3 deals/month for FinTech SaaS), not aspirational targets",
    "8. Funding: List ALL sources with specific amounts and evidence types (bank statements, agreements, LOIs)",
    "9. Year 1 Cash: Calculate total requirement including salaries, compliance, operations - show where it comes from",
    "10. Technical Architecture: Describe system architecture, data pipeline, ML serving infrastructure",
    "11. Academic Context: Reference 3-5 academic papers on cash flow forecasting, show how you differ/improve",
    "12. Risk Honesty: Acknowledge ALL gaps with SPECIFIC mitigation strategies and timelines",
    "This is the gold standard. Every claim must be evidenced. Every weakness must have mitigation.",
  ];
};
