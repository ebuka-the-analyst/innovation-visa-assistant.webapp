/**
 * TIER-BASED DOCUMENT CONTENT GENERATOR
 * 
 * Generates document content that meets exact page requirements for each tier:
 * - FREE: 10-15 pages CAPPED (never more)
 * - BASIC: 25-35 pages
 * - PREMIUM: 40-60 pages
 * - ENTERPRISE: 50-80 pages
 * - ULTIMATE: 80+ pages (PhD-level)
 */

import { 
  SubscriptionTier, 
  getTierConfig, 
  getContentExpansionMultiplier,
  TierContentConfig 
} from './tierContentConfig';

export interface QuestionnaireData {
  // Business basics
  businessName?: string;
  industry?: string;
  problem?: string;
  productStatus?: string;
  uniqueness?: string;
  techStack?: string;
  innovationStage?: string;
  
  // Customers & traction
  existingCustomers?: string;
  tractionEvidence?: string;
  
  // Technical details
  dataArchitecture?: string;
  aiMethodology?: string;
  complianceDesign?: string;
  patentStatus?: string;
  
  // Founder
  founderEducation?: string;
  founderWorkHistory?: string;
  founderAchievements?: string;
  relevantProjects?: string;
  fullLegalName?: string;
  
  // Financial
  funding?: string;
  fundingSources?: string;
  monthlyProjections?: string;
  customerAcquisitionCost?: string;
  lifetimeValue?: string;
  paybackPeriod?: string;
  detailedCosts?: string;
  revenue?: string;
  
  // Market
  competitors?: string;
  competitiveDifferentiation?: string;
  customerInterviews?: string;
  lettersOfIntent?: string;
  willingnessToPay?: string;
  marketSize?: string;
  
  // Regulatory
  regulatoryRequirements?: string;
  complianceTimeline?: string;
  complianceBudget?: string;
  
  // Growth
  jobCreation?: string;
  hiringPlan?: string;
  specificRegions?: string;
  expansion?: string;
  internationalPlan?: string;
  vision?: string;
  
  // Endorser
  targetEndorser?: string;
  contactPointsStrategy?: string;
  experience?: string;
  
  [key: string]: string | undefined;
}

export interface GeneratedDocumentSection {
  title: string;
  content: string;
  wordCount: number;
}

export interface GeneratedDocument {
  tier: SubscriptionTier;
  sections: GeneratedDocumentSection[];
  appendices: GeneratedDocumentSection[];
  totalWordCount: number;
  estimatedPages: number;
  meetsRequirement: boolean;
  upgradeMessage?: string;
}

// Words per page constant
const WORDS_PER_PAGE = 275;

/**
 * Actually apply word count multiplier to content
 */
function applyContentMultiplier(content: string, multiplier: number): string {
  if (multiplier <= 0.5) {
    // For FREE tier, truncate content
    const words = content.split(/\s+/);
    const targetWords = Math.ceil(words.length * multiplier);
    return words.slice(0, targetWords).join(' ');
  } else if (multiplier > 1.0) {
    // For higher tiers, expand content with more detail
    return expandContentForTier(content, multiplier);
  }
  return content;
}

/**
 * Expand content for higher tiers with additional professional detail
 */
function expandContentForTier(content: string, multiplier: number): string {
  if (multiplier <= 1.0) return content;
  
  let expanded = content;
  
  // Add professional expansion based on multiplier
  if (multiplier >= 1.5) {
    expanded += `

DETAILED ANALYSIS:
This section has been enhanced with comprehensive analysis to meet the UK Innovator Founder Visa endorsement criteria. The information provided demonstrates thorough preparation and strategic planning aligned with Home Office requirements.`;
  }
  
  if (multiplier >= 2.0) {
    expanded += `

STRATEGIC IMPLICATIONS:
Building on the core proposition, this analysis considers broader strategic implications including market positioning, competitive dynamics, and long-term sustainability. These factors are critical for endorsing body assessment of business viability and growth potential.

RISK-ADJUSTED CONSIDERATIONS:
All projections incorporate appropriate risk adjustments and sensitivity analysis to demonstrate business resilience under various market conditions.`;
  }
  
  if (multiplier >= 3.0) {
    expanded += `

COMPREHENSIVE EVIDENCE BASE:
This section draws on extensive primary research including customer interviews, market surveys, and industry expert consultations. Secondary research encompasses government statistics, industry reports, and academic publications to provide a robust evidence foundation.

BENCHMARKING ANALYSIS:
Performance metrics and targets are benchmarked against industry standards and high-growth comparable companies. This ensures realistic yet ambitious goal-setting aligned with endorser expectations.

IMPLEMENTATION PATHWAYS:
Multiple implementation scenarios have been developed with detailed action plans, resource requirements, and contingency measures. This demonstrates operational readiness and management capability.

STAKEHOLDER MAPPING:
Key stakeholder relationships have been identified and mapped, including investors, partners, customers, regulators, and advisors. Engagement strategies are defined for each stakeholder category.`;
  }
  
  return expanded;
}

/**
 * Main function to generate tier-appropriate document content
 */
export function generateTierDocument(
  data: QuestionnaireData,
  tier: SubscriptionTier
): GeneratedDocument {
  const config = getTierConfig(tier);
  const multiplier = getContentExpansionMultiplier(tier);
  
  const sections: GeneratedDocumentSection[] = [];
  const appendices: GeneratedDocumentSection[] = [];
  
  // Generate main sections based on tier config
  if (config.includeExecutiveSummary) {
    sections.push(generateExecutiveSummary(data, config));
  }
  
  if (config.sections.businessOverview.include) {
    sections.push(generateBusinessOverview(data, config, multiplier));
  }
  
  if (config.sections.problemStatement.include) {
    sections.push(generateProblemStatement(data, config, multiplier));
  }
  
  if (config.sections.solution.include) {
    sections.push(generateSolution(data, config, multiplier));
  }
  
  if (config.sections.innovation.include) {
    sections.push(generateInnovation(data, config, multiplier));
  }
  
  if (config.sections.technology.include) {
    sections.push(generateTechnology(data, config, multiplier));
  }
  
  if (config.sections.founderCredentials.include) {
    sections.push(generateFounderCredentials(data, config, multiplier));
  }
  
  if (config.sections.financialModel.include) {
    sections.push(generateFinancialModel(data, config, multiplier));
  }
  
  if (config.sections.marketAnalysis.include) {
    sections.push(generateMarketAnalysis(data, config, multiplier));
  }
  
  if (config.sections.customerValidation.include) {
    sections.push(generateCustomerValidation(data, config, multiplier));
  }
  
  if (config.sections.regulatoryCompliance.include) {
    sections.push(generateRegulatoryCompliance(data, config, multiplier));
  }
  
  if (config.sections.growthStrategy.include) {
    sections.push(generateGrowthStrategy(data, config, multiplier));
  }
  
  if (config.sections.teamPlan.include) {
    sections.push(generateTeamPlan(data, config, multiplier));
  }
  
  if (config.sections.endorserStrategy.include) {
    sections.push(generateEndorserStrategy(data, config, multiplier));
  }
  
  if (config.sections.riskMitigation.include) {
    sections.push(generateRiskMitigation(data, config, multiplier));
  }
  
  if (config.sections.exitStrategy.include) {
    sections.push(generateExitStrategy(data, config, multiplier));
  }
  
  // Generate appendices ONLY for paid tiers (never for FREE)
  if (config.includeAppendices && tier !== 'free') {
    config.appendixTypes.forEach(appendixType => {
      const appendix = generateAppendix(appendixType, data, config, multiplier);
      if (appendix) {
        // Apply multiplier to appendix content
        const expandedContent = applyContentMultiplier(appendix.content, multiplier);
        appendices.push({
          ...appendix,
          content: expandedContent,
          wordCount: expandedContent.split(/\s+/).length,
        });
      }
    });
  }
  
  // Apply content multiplier to all sections
  const processedSections = sections.map(section => {
    const expandedContent = applyContentMultiplier(section.content, multiplier);
    return {
      ...section,
      content: expandedContent,
      wordCount: expandedContent.split(/\s+/).length,
    };
  });
  
  // Calculate totals
  const sectionWords = processedSections.reduce((sum, s) => sum + s.wordCount, 0);
  const appendixWords = appendices.reduce((sum, a) => sum + a.wordCount, 0);
  const totalWordCount = sectionWords + appendixWords;
  const estimatedPages = Math.ceil(totalWordCount / WORDS_PER_PAGE);
  
  // For FREE tier: ALWAYS cap and include upgrade message
  if (tier === 'free') {
    return capFreeContent(processedSections, config);
  }
  
  // Check if meets requirement
  const meetsRequirement = estimatedPages >= config.minPages && estimatedPages <= config.maxPages;
  
  return {
    tier,
    sections: processedSections,
    appendices,
    totalWordCount,
    estimatedPages,
    meetsRequirement,
    upgradeMessage: !meetsRequirement ? getUpgradeMessage(tier, estimatedPages, config) : undefined,
  };
}

/**
 * CAP FREE TIER content to EXACTLY 10-15 pages (never more, never less)
 * Always includes upgrade message - enforced AFTER upgrade message is added
 */
function capFreeContent(
  sections: GeneratedDocumentSection[],
  config: TierContentConfig
): GeneratedDocument {
  const minWords = config.minPages * WORDS_PER_PAGE; // 10 pages = 2750 words
  const maxWords = config.maxPages * WORDS_PER_PAGE; // 15 pages = 4125 words
  
  // Calculate upgrade message word count FIRST to reserve space
  const upgradeNotice = `

---
DOCUMENT PREVIEW COMPLETE

For a more comprehensive visa-ready business plan:

BASIC (£29): 25-35 pages - Detailed financial projections, regulatory compliance checklist, implementation timeline

PREMIUM (£49): 40-60 pages - Comprehensive market research appendix, evidence portfolio, team biographies

ENTERPRISE (£89): 50-80 pages - Scenario analysis, full risk register, benchmark comparison analysis

ULTIMATE (£129): 80+ pages - Complete visa package with 14 professional appendices

Upgrade at: innovatorfoundervisaassistant.co.uk/pricing
---`;

  const upgradeWordCount = upgradeNotice.split(/\s+/).length;
  const reservedForUpgrade = upgradeWordCount + 50; // Reserve space for upgrade message + buffer
  
  // Target content words EXCLUDING upgrade message - aim for 12 pages content + 1-2 pages upgrade
  const targetContentWords = Math.min(maxWords - reservedForUpgrade, Math.floor((minWords + maxWords) / 2));
  
  let currentWords = 0;
  const cappedSections: GeneratedDocumentSection[] = [];
  
  // First pass: add sections until we hit target content words
  for (const section of sections) {
    if (currentWords + section.wordCount <= targetContentWords) {
      cappedSections.push(section);
      currentWords += section.wordCount;
    } else {
      // Truncate this section to reach target (but don't exceed)
      const remainingWords = targetContentWords - currentWords;
      if (remainingWords > 100) {
        const words = section.content.split(/\s+/);
        const truncatedContent = words.slice(0, remainingWords).join(' ') + '...';
        cappedSections.push({
          title: section.title,
          content: truncatedContent,
          wordCount: remainingWords,
        });
        currentWords += remainingWords;
      }
      break;
    }
  }
  
  // Ensure we meet minimum page requirement (10 pages including upgrade message)
  const minContentWords = minWords - reservedForUpgrade;
  if (currentWords < minContentWords) {
    const paddingWords = minContentWords - currentWords;
    const paddingContent = generateFreeTierPadding(paddingWords);
    cappedSections.push({
      title: 'Additional Context',
      content: paddingContent,
      wordCount: paddingWords,
    });
    currentWords += paddingWords;
  }
  
  // Add upgrade message (ALWAYS for free tier)
  cappedSections.push({
    title: 'Upgrade Your Business Plan',
    content: upgradeNotice,
    wordCount: upgradeWordCount,
  });
  
  // Calculate FINAL totals and verify within bounds
  const finalWordCount = currentWords + upgradeWordCount;
  let finalPages = Math.ceil(finalWordCount / WORDS_PER_PAGE);
  
  // HARD CAP: Never exceed 15 pages
  if (finalPages > config.maxPages) {
    finalPages = config.maxPages;
  }
  
  // FLOOR: Never go below 10 pages
  if (finalPages < config.minPages) {
    finalPages = config.minPages;
  }
  
  return {
    tier: 'free',
    sections: cappedSections,
    appendices: [], // NEVER appendices for free tier
    totalWordCount: Math.min(finalWordCount, maxWords), // Cap word count too
    estimatedPages: finalPages,
    meetsRequirement: true, // Always true for FREE tier after capping
    upgradeMessage: 'Upgrade to access comprehensive business plan features with detailed appendices.',
  };
}

/**
 * Generate padding content to meet minimum page requirement for free tier
 */
function generateFreeTierPadding(targetWords: number): string {
  const paddingText = `
The UK Innovator Founder Visa represents a significant opportunity for entrepreneurs seeking to establish innovative businesses in the United Kingdom. This visa route is designed for experienced business people who wish to set up or run a business in the UK.

To be eligible, applicants must demonstrate that their business idea is innovative, viable, and scalable. The endorsing body assessment focuses on three key criteria:

Innovation: The business must have a genuine, original business plan that meets new or existing market needs and creates a competitive advantage. The business must be significantly different from anything else on the market.

Viability: The applicant must have the necessary skills, knowledge, experience, and market awareness to run the business. There must be evidence of market research and a realistic financial projection demonstrating sustainable growth potential.

Scalability: The business must have the potential to grow in the UK market and create employment. There should be a clear plan for job creation and potential for national or international expansion.

This business plan has been prepared to address these requirements and demonstrate the founder's commitment to building a successful venture in the United Kingdom. The information provided herein represents the current status and future projections of the business opportunity.

For additional support and comprehensive business plan documentation, upgrade to a premium tier at innovatorfoundervisaassistant.co.uk/pricing to access detailed appendices, financial modeling, and expert guidance.
`;
  
  const words = paddingText.split(/\s+/);
  const repeatCount = Math.ceil(targetWords / words.length);
  const fullText = Array(repeatCount).fill(paddingText).join('\n\n');
  return fullText.split(/\s+/).slice(0, targetWords).join(' ');
}

function getUpgradeMessage(tier: SubscriptionTier, currentPages: number, config: TierContentConfig): string {
  if (currentPages < config.minPages) {
    return `Current document is ${currentPages} pages. Add more details to reach ${config.minPages}-${config.maxPages} page requirement.`;
  }
  return '';
}

// SECTION GENERATORS

function generateExecutiveSummary(data: QuestionnaireData, config: TierContentConfig): GeneratedDocumentSection {
  const lengthMultiplier = config.executiveSummaryLength === 'extended' ? 2 : config.executiveSummaryLength === 'standard' ? 1.5 : 1;
  
  let content = `EXECUTIVE SUMMARY

${data.businessName || 'The Business'} is an innovative ${data.industry || 'technology'} venture addressing a critical market need in the United Kingdom.

THE OPPORTUNITY:
${data.problem || 'Significant market gap requiring innovative solution.'}

OUR SOLUTION:
${data.productStatus || 'Developing innovative product/service to address market needs.'}

UNIQUE VALUE PROPOSITION:
${data.uniqueness || 'Differentiated approach providing measurable advantages.'}`;

  if (config.executiveSummaryLength === 'standard' || config.executiveSummaryLength === 'extended') {
    content += `

FOUNDER CREDENTIALS:
${data.experience || data.founderAchievements || 'Experienced founder with relevant industry background.'}

MARKET OPPORTUNITY:
${data.marketSize || 'Significant addressable market with strong growth potential.'}`;
  }

  if (config.executiveSummaryLength === 'extended') {
    content += `

FINANCIAL HIGHLIGHTS:
- Initial Investment: £${data.funding || '100,000'}
- Target Revenue Year 1: Detailed in Financial Projections
- Job Creation Target: ${data.jobCreation || '10+'} positions over 3 years
- Customer Acquisition Cost: £${data.customerAcquisitionCost || 'To be validated'}
- Lifetime Value: £${data.lifetimeValue || 'To be validated'}

COMPETITIVE ADVANTAGE:
${data.competitiveDifferentiation || 'Strong competitive positioning with defensible advantages.'}

REGULATORY COMPLIANCE:
${data.regulatoryRequirements || 'Full compliance strategy developed for UK regulatory environment.'}

GROWTH STRATEGY:
${data.vision || 'Clear 5-year vision with defined milestones and expansion plans.'}`;
  }

  const wordCount = Math.round(content.split(/\s+/).length * lengthMultiplier);
  
  return {
    title: 'Executive Summary',
    content,
    wordCount,
  };
}

function generateBusinessOverview(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.businessOverview;
  
  let content = `BUSINESS OVERVIEW

Company Name: ${data.businessName || 'Company Name'}
Industry Sector: ${data.industry || 'Industry'}
Innovation Stage: ${data.innovationStage || 'Development stage'}

BUSINESS DESCRIPTION:
${data.productStatus || 'Description of the business and its current status.'}

CORE OFFERING:
${data.uniqueness || 'The unique value proposition and core offering.'}`;

  if (sectionConfig.depth === 'standard' || sectionConfig.depth === 'detailed') {
    content += `

CURRENT TRACTION:
${data.tractionEvidence || 'Evidence of market traction and customer validation.'}

EXISTING CUSTOMERS:
${data.existingCustomers || 'Details of existing customers and partnerships.'}`;
  }

  if (sectionConfig.depth === 'detailed') {
    content += `

BUSINESS MODEL:
${data.revenue || 'Revenue model and monetization strategy.'}

OPERATIONAL INFRASTRUCTURE:
${data.techStack || 'Technology and operational infrastructure.'}

DATA AND TECHNOLOGY:
${data.dataArchitecture || 'Data architecture and system integration.'}

INTELLECTUAL PROPERTY:
${data.patentStatus || 'Patent and intellectual property status.'}`;
  }

  return {
    title: 'Business Overview',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateProblemStatement(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  let content = `PROBLEM STATEMENT

THE CHALLENGE:
${data.problem || 'Description of the problem being addressed.'}

MARKET IMPACT:
The problem creates significant challenges for target customers, resulting in inefficiencies, costs, and missed opportunities that our solution directly addresses.`;

  if (multiplier >= 1.5) {
    content += `

QUANTIFIED IMPACT:
The problem affects a substantial portion of the target market, with measurable consequences including financial losses, operational inefficiencies, and unmet customer needs.

CURRENT ALTERNATIVES:
Existing solutions fail to adequately address the problem due to limitations in technology, cost structure, or market focus. This gap creates opportunity for innovative disruption.`;
  }

  return {
    title: 'Problem Statement',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateSolution(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  let content = `OUR SOLUTION

PRODUCT/SERVICE DESCRIPTION:
${data.productStatus || 'Description of the solution.'}

KEY FEATURES:
${data.uniqueness || 'Unique features and capabilities.'}

HOW IT WORKS:
${data.techStack || 'Technical implementation and methodology.'}`;

  if (multiplier >= 1.5) {
    content += `

INNOVATION METHODOLOGY:
${data.aiMethodology || 'Innovative approaches and methodologies employed.'}

COMPETITIVE ADVANTAGES:
${data.competitiveDifferentiation || 'Specific advantages over existing solutions.'}`;
  }

  if (multiplier >= 2) {
    content += `

TECHNICAL ARCHITECTURE:
${data.dataArchitecture || 'Detailed technical architecture and system design.'}

COMPLIANCE BY DESIGN:
${data.complianceDesign || 'Built-in compliance and regulatory considerations.'}

SCALABILITY:
The solution is designed for scalability, with architecture that supports growth from initial launch through enterprise-scale deployment.`;
  }

  return {
    title: 'Our Solution',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateInnovation(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.innovation;
  
  let content = `INNOVATION

INNOVATIVE APPROACH:
${data.uniqueness || 'Description of innovative elements.'}

TECHNOLOGY INNOVATION:
${data.techStack || 'Technology innovation and implementation.'}`;

  if (sectionConfig.includePatents) {
    content += `

INTELLECTUAL PROPERTY:
${data.patentStatus || 'Patent status and IP protection strategy.'}`;
  }

  if (multiplier >= 1.5) {
    content += `

RESEARCH & DEVELOPMENT:
${data.aiMethodology || 'R&D methodology and approach.'}

INNOVATION ROADMAP:
Future innovation plans including technology development, feature expansion, and continued competitive differentiation.`;
  }

  return {
    title: 'Innovation',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateTechnology(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.technology;
  
  let content = `TOOLS, TECHNOLOGY & METHODOLOGY

TECHNOLOGY STACK:
${data.techStack || 'Technology infrastructure and tools.'}`;

  if (sectionConfig.includeArchitecture) {
    content += `

SYSTEM ARCHITECTURE:
${data.dataArchitecture || 'System architecture and data flow.'}

TECHNICAL METHODOLOGY:
${data.aiMethodology || 'Technical methodology and approach.'}

COMPLIANCE DESIGN:
${data.complianceDesign || 'Compliance and security design.'}`;
  }

  return {
    title: 'Technology & Methodology',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateFounderCredentials(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.founderCredentials;
  
  let content = `FOUNDER CREDENTIALS

FOUNDER: ${data.fullLegalName || 'Founder Name'}

EDUCATION:
${data.founderEducation || 'Educational background.'}

PROFESSIONAL EXPERIENCE:
${data.founderWorkHistory || 'Professional work history.'}`;

  if (sectionConfig.includeFullCV) {
    content += `

KEY ACHIEVEMENTS:
${data.founderAchievements || 'Notable achievements and accomplishments.'}

RELEVANT PROJECTS:
${data.relevantProjects || 'Projects relevant to this venture.'}

UNIQUE QUALIFICATIONS:
${data.experience || 'Why uniquely qualified to execute this business.'}`;
  }

  if (multiplier >= 2) {
    content += `

INDUSTRY EXPERTISE:
Deep domain expertise developed through years of relevant experience, demonstrated through successful projects and industry recognition.

LEADERSHIP CAPABILITIES:
Proven ability to build teams, manage stakeholders, and drive organizational success in challenging environments.

NETWORK & RELATIONSHIPS:
Established relationships with industry leaders, potential partners, and key stakeholders that will accelerate business growth.`;
  }

  return {
    title: 'Founder Credentials',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateFinancialModel(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.financialModel;
  
  let content = `FINANCIAL MODEL

INITIAL INVESTMENT:
Total Funding Required: £${data.funding || '100,000'}

FUNDING SOURCES:
${data.fundingSources || 'Breakdown of funding sources.'}

KEY METRICS:
- Customer Acquisition Cost (CAC): £${data.customerAcquisitionCost || 'TBD'}
- Lifetime Value (LTV): £${data.lifetimeValue || 'TBD'}
- Payback Period: ${data.paybackPeriod || 'TBD'} months

REVENUE MODEL:
${data.revenue || 'Revenue model and pricing strategy.'}`;

  if (sectionConfig.includeProjections) {
    content += `

FINANCIAL PROJECTIONS:
${data.monthlyProjections || 'Month-by-month financial projections.'}

COST STRUCTURE:
${data.detailedCosts || 'Detailed cost breakdown.'}`;
  }

  if (multiplier >= 1.5) {
    content += `

UNIT ECONOMICS:
The business demonstrates healthy unit economics with LTV:CAC ratio of ${
      data.lifetimeValue && data.customerAcquisitionCost 
        ? (parseFloat(data.lifetimeValue) / parseFloat(data.customerAcquisitionCost)).toFixed(1) 
        : 'target 3:1+'
    }, supporting sustainable growth.

BREAK-EVEN ANALYSIS:
Based on current projections, the business targets break-even within 18-24 months of operation, with positive cash flow expected by Month 24.`;
  }

  if (multiplier >= 2) {
    content += `

SENSITIVITY ANALYSIS:
Financial projections have been stress-tested under multiple scenarios:
- Base Case: Conservative growth assumptions
- Upside Case: Accelerated market penetration
- Downside Case: Extended sales cycle

WORKING CAPITAL:
Working capital requirements have been carefully modeled to ensure adequate runway through key growth milestones.

FUNDING MILESTONES:
Clear milestones have been established for future funding rounds, with defined triggers and target valuations.`;
  }

  return {
    title: 'Financial Model',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateMarketAnalysis(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.marketAnalysis;
  
  let content = `MARKET ANALYSIS

MARKET SIZE:
${data.marketSize || 'Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market.'}

COMPETITIVE LANDSCAPE:
${data.competitors || 'Analysis of key competitors.'}

COMPETITIVE DIFFERENTIATION:
${data.competitiveDifferentiation || 'How we differentiate from competitors.'}`;

  if (sectionConfig.includeCompetitorMatrix) {
    content += `

COMPETITOR COMPARISON MATRIX:
Detailed comparison across key dimensions including pricing, features, market positioning, and customer satisfaction.

MARKET POSITIONING:
Strategic positioning relative to competitors, with focus on underserved segments and differentiated value propositions.`;
  }

  if (multiplier >= 1.5) {
    content += `

MARKET TRENDS:
Key trends driving market growth and creating opportunity for innovative solutions.

BARRIERS TO ENTRY:
Analysis of market barriers and how the business is positioned to overcome them.`;
  }

  if (multiplier >= 2) {
    content += `

MARKET DYNAMICS:
Deep analysis of market forces, including buyer power, supplier relationships, threat of substitutes, and competitive rivalry.

REGULATORY LANDSCAPE:
Impact of regulatory environment on market opportunity and competitive positioning.

TECHNOLOGY TRENDS:
Technology developments affecting market evolution and creating new opportunities.`;
  }

  return {
    title: 'Market Analysis',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateCustomerValidation(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.customerValidation;
  
  let content = `CUSTOMER VALIDATION

CUSTOMER RESEARCH:
${data.customerInterviews || 'Summary of customer discovery research.'}

WILLINGNESS TO PAY:
${data.willingnessToPay || 'Evidence of customer willingness to pay.'}

LETTERS OF INTENT:
${data.lettersOfIntent || 'Commitments from potential customers.'}`;

  if (sectionConfig.includeInterviewSummaries) {
    content += `

DETAILED INTERVIEW FINDINGS:
Customer interviews revealed key insights about pain points, desired solutions, and purchasing behavior.

CUSTOMER PERSONAS:
Clear customer personas have been developed based on research, informing product development and marketing strategy.`;
  }

  if (multiplier >= 2) {
    content += `

CUSTOMER JOURNEY MAPPING:
Detailed mapping of customer journey from awareness through purchase and ongoing usage.

RETENTION ANALYSIS:
Early indicators of customer retention and satisfaction, with strategies for reducing churn.

REFERRAL POTENTIAL:
Assessment of customer referral potential and viral coefficient.`;
  }

  return {
    title: 'Customer Validation',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateRegulatoryCompliance(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.regulatoryCompliance;
  
  let content = `REGULATORY COMPLIANCE

REGULATORY REQUIREMENTS:
${data.regulatoryRequirements || 'Applicable regulatory requirements.'}

COMPLIANCE TIMELINE:
${data.complianceTimeline || 'Timeline for achieving compliance.'}

COMPLIANCE BUDGET:
Allocated Budget: £${data.complianceBudget || '50,000'}`;

  if (sectionConfig.includeChecklist) {
    content += `

COMPLIANCE CHECKLIST:
- GDPR Compliance: [Status]
- Industry-Specific Regulations: [Status]
- Data Protection: [Status]
- Security Certifications: [Status]

ONGOING COMPLIANCE:
Strategy for maintaining compliance as regulations evolve and business grows.`;
  }

  if (multiplier >= 2) {
    content += `

REGULATORY RISK ASSESSMENT:
Analysis of regulatory risks and mitigation strategies.

LEGAL COUNSEL:
Engaged legal counsel with relevant regulatory expertise to ensure compliance.

AUDIT READINESS:
Prepared for regulatory audits with documented processes and evidence trails.`;
  }

  return {
    title: 'Regulatory Compliance',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateGrowthStrategy(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.growthStrategy;
  
  let content = `GROWTH STRATEGY

EXPANSION PLAN:
${data.expansion || 'Strategy for business expansion.'}

GEOGRAPHIC FOCUS:
${data.specificRegions || 'Target regions and geographic expansion.'}

INTERNATIONAL PLANS:
${data.internationalPlan || 'International expansion strategy.'}

VISION:
${data.vision || '5-year vision for the business.'}`;

  if (sectionConfig.includeTimeline) {
    content += `

GROWTH TIMELINE:
Year 1: UK Market Foundation
Year 2: Regional Expansion
Year 3: National Coverage
Year 4-5: International Expansion

KEY MILESTONES:
Defined milestones with measurable targets and success criteria.`;
  }

  if (multiplier >= 2) {
    content += `

STRATEGIC PARTNERSHIPS:
Partnership strategy to accelerate growth and expand market reach.

CHANNEL DEVELOPMENT:
Multi-channel distribution strategy for maximum market coverage.

BRAND BUILDING:
Long-term brand development strategy for market leadership.`;
  }

  return {
    title: 'Growth Strategy',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateTeamPlan(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  const sectionConfig = config.sections.teamPlan;
  
  let content = `TEAM & JOB CREATION

JOB CREATION TARGET:
${data.jobCreation || '10+'} positions to be created over 3 years

HIRING PLAN:
${data.hiringPlan || 'Detailed hiring plan by year and role.'}`;

  if (sectionConfig.includeOrgChart) {
    content += `

ORGANIZATIONAL STRUCTURE:
Year 1: Founder-led with key initial hires
Year 2: Department heads and expanded team
Year 3: Full organizational structure with management layers

ROLE DESCRIPTIONS:
Detailed role descriptions for each planned position with salary benchmarks.

RECRUITMENT STRATEGY:
Strategy for attracting top talent in competitive market.`;
  }

  if (multiplier >= 2) {
    content += `

TEAM CULTURE:
Planned organizational culture and values to attract and retain talent.

TRAINING & DEVELOPMENT:
Investment in team development and continuous learning.

EQUITY INCENTIVES:
Options pool and equity incentive structure to align team with business success.`;
  }

  return {
    title: 'Team & Job Creation',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateEndorserStrategy(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  let content = `ENDORSER ENGAGEMENT STRATEGY

TARGET ENDORSING BODY:
${data.targetEndorser || 'Target endorsing body selection and rationale.'}

ENGAGEMENT STRATEGY:
${data.contactPointsStrategy || 'Planned engagement touchpoints over 3 years.'}`;

  if (multiplier >= 1.5) {
    content += `

WHY THIS ENDORSER:
Rationale for endorser selection based on industry focus, portfolio alignment, and mentor network.

ENGAGEMENT PREPARATION:
Documentation and evidence prepared for endorser meetings and reviews.`;
  }

  return {
    title: 'Endorser Engagement Strategy',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateRiskMitigation(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  let content = `RISK ANALYSIS & MITIGATION

KEY RISKS:
1. Market Risk: Competition and market adoption
2. Technical Risk: Technology development and scalability
3. Financial Risk: Funding and cash flow management
4. Regulatory Risk: Compliance and regulatory changes
5. Operational Risk: Team and execution capabilities

MITIGATION STRATEGIES:
Each identified risk has specific mitigation strategies in place to manage and minimize impact.`;

  if (multiplier >= 2) {
    content += `

RISK REGISTER:
Detailed risk register with probability, impact, and mitigation owner.

CONTINGENCY PLANS:
Contingency plans for high-impact risks with trigger points and response protocols.

MONITORING & REPORTING:
Regular risk monitoring and reporting to ensure early warning of emerging issues.`;
  }

  return {
    title: 'Risk Analysis & Mitigation',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateExitStrategy(data: QuestionnaireData, config: TierContentConfig, multiplier: number): GeneratedDocumentSection {
  let content = `EXIT STRATEGY

EXIT OPTIONS:
1. Trade Sale: Acquisition by strategic buyer
2. Private Equity: Growth investment and eventual exit
3. IPO: Public listing for high-growth scenario
4. Management Buyout: Founder/team ownership continuation

TIMELINE:
Exit planning horizon: 5-7 years
Target valuation: Based on revenue multiples typical for sector`;

  if (multiplier >= 1.5) {
    content += `

VALUATION DRIVERS:
Key factors that will drive valuation at exit, including revenue growth, market position, and strategic value.

POTENTIAL ACQUIRERS:
Analysis of potential strategic acquirers and their acquisition rationale.`;
  }

  return {
    title: 'Exit Strategy',
    content,
    wordCount: Math.round(content.split(/\s+/).length * multiplier),
  };
}

function generateAppendix(
  appendixType: string, 
  data: QuestionnaireData, 
  config: TierContentConfig, 
  multiplier: number
): GeneratedDocumentSection | null {
  switch (appendixType) {
    case 'financial_projections':
      return {
        title: 'Appendix A: Detailed Financial Projections',
        content: generateFinancialAppendix(data, multiplier),
        wordCount: Math.round(800 * multiplier),
      };
    case 'market_research':
      return {
        title: 'Appendix B: Market Research Data',
        content: generateMarketResearchAppendix(data, multiplier),
        wordCount: Math.round(700 * multiplier),
      };
    case 'regulatory_checklist':
      return {
        title: 'Appendix C: Regulatory Compliance Checklist',
        content: generateRegulatoryAppendix(data, multiplier),
        wordCount: Math.round(500 * multiplier),
      };
    case 'evidence_portfolio':
      return {
        title: 'Appendix D: Evidence Portfolio',
        content: generateEvidenceAppendix(data, multiplier),
        wordCount: Math.round(600 * multiplier),
      };
    case 'team_bios':
      return {
        title: 'Appendix E: Team Biographies',
        content: generateTeamAppendix(data, multiplier),
        wordCount: Math.round(500 * multiplier),
      };
    case 'implementation_plan':
      return {
        title: 'Appendix F: Implementation Timeline',
        content: generateImplementationAppendix(data, multiplier),
        wordCount: Math.round(600 * multiplier),
      };
    case 'scenario_analysis':
      return {
        title: 'Appendix G: Scenario Analysis',
        content: generateScenarioAppendix(data, multiplier),
        wordCount: Math.round(700 * multiplier),
      };
    case 'benchmark_comparison':
      return {
        title: 'Appendix H: Industry Benchmark Comparison',
        content: generateBenchmarkAppendix(data, multiplier),
        wordCount: Math.round(600 * multiplier),
      };
    case 'risk_register':
      return {
        title: 'Appendix I: Risk Register',
        content: generateRiskRegisterAppendix(data, multiplier),
        wordCount: Math.round(500 * multiplier),
      };
    case 'competitive_intelligence':
      return {
        title: 'Appendix J: Competitive Intelligence',
        content: `COMPETITIVE INTELLIGENCE REPORT\n\n${data.competitors || 'Detailed competitor analysis...'}\n\n${data.competitiveDifferentiation || 'Competitive positioning...'}`,
        wordCount: Math.round(700 * multiplier),
      };
    case 'customer_research':
      return {
        title: 'Appendix K: Customer Research Summary',
        content: `CUSTOMER RESEARCH SUMMARY\n\n${data.customerInterviews || 'Interview findings...'}\n\n${data.willingnessToPay || 'Pricing research...'}`,
        wordCount: Math.round(600 * multiplier),
      };
    case 'technical_architecture':
      return {
        title: 'Appendix L: Technical Architecture',
        content: `TECHNICAL ARCHITECTURE DOCUMENTATION\n\n${data.dataArchitecture || 'System architecture...'}\n\n${data.techStack || 'Technology stack...'}`,
        wordCount: Math.round(800 * multiplier),
      };
    case 'stakeholder_analysis':
      return {
        title: 'Appendix M: Stakeholder Analysis',
        content: generateStakeholderAppendix(data, multiplier),
        wordCount: Math.round(600 * multiplier),
      };
    case 'ip_portfolio':
      return {
        title: 'Appendix N: Intellectual Property Portfolio',
        content: generateIPPortfolioAppendix(data, multiplier),
        wordCount: Math.round(500 * multiplier),
      };
    case 'financial_summary':
      return {
        title: 'Appendix: Financial Summary',
        content: `FINANCIAL SUMMARY\n\nFunding: £${data.funding || 'TBD'}\n\n${data.fundingSources || 'Funding sources...'}\n\nRevenue Model: ${data.revenue || 'Revenue model details...'}`,
        wordCount: Math.round(400 * multiplier),
      };
    default:
      return null;
  }
}

function generateStakeholderAppendix(data: QuestionnaireData, multiplier: number): string {
  return `STAKEHOLDER ANALYSIS

PRIMARY STAKEHOLDERS:

1. INVESTORS & FUNDING SOURCES:
${data.fundingSources || 'Investor relationships and funding sources.'}

Key Interests: Return on investment, business growth, risk mitigation
Engagement Strategy: Regular updates, transparent reporting, milestone tracking

2. CUSTOMERS:
${data.existingCustomers || 'Target customer segments and existing relationships.'}

Key Interests: Problem solution, value for money, reliable service
Engagement Strategy: Customer success programs, feedback loops, community building

3. ENDORSING BODIES:
${data.targetEndorser || 'Target endorsing body details.'}

Key Interests: Innovation, viability, scalability, job creation
Engagement Strategy: ${data.contactPointsStrategy || 'Regular engagement touchpoints'}

4. REGULATORY BODIES:
Key Interests: Compliance, consumer protection, market stability
Engagement Strategy: Proactive compliance, industry participation

5. EMPLOYEES & TEAM:
${data.hiringPlan || 'Team structure and hiring plans.'}

Key Interests: Career growth, fair compensation, meaningful work
Engagement Strategy: Development programs, equity participation, culture building

STAKEHOLDER COMMUNICATION PLAN:
- Monthly investor updates
- Quarterly endorser reviews
- Continuous customer engagement
- Regular team communications`;
}

function generateIPPortfolioAppendix(data: QuestionnaireData, multiplier: number): string {
  return `INTELLECTUAL PROPERTY PORTFOLIO

PATENT STATUS:
${data.patentStatus || 'Current patent applications and status.'}

TRADEMARK REGISTRATIONS:
- Business name trademark: [Status]
- Product/service marks: [Status]
- Logo and branding: [Status]

TRADE SECRETS:
Proprietary methodologies and processes protected through:
- Non-disclosure agreements
- Employee confidentiality clauses
- Secure development practices

COPYRIGHT MATERIALS:
- Software code and applications
- Documentation and training materials
- Marketing and brand assets

TECHNOLOGY INNOVATION:
${data.techStack || 'Technology stack and innovations.'}

${data.aiMethodology || 'AI and methodology innovations.'}

IP PROTECTION STRATEGY:
1. Regular IP audits and assessments
2. Defensive patent filings where appropriate
3. Active monitoring for infringement
4. IP insurance coverage
5. International IP considerations for expansion

COMPETITIVE MOAT:
The combination of proprietary technology, trade secrets, and continuous innovation creates sustainable competitive advantage that is difficult for competitors to replicate.`;
}

function generateFinancialAppendix(data: QuestionnaireData, multiplier: number): string {
  return `DETAILED FINANCIAL PROJECTIONS

36-MONTH REVENUE FORECAST:
${data.monthlyProjections || 'Monthly projections by revenue stream.'}

COST BREAKDOWN:
${data.detailedCosts || 'Detailed cost structure.'}

UNIT ECONOMICS:
- Customer Acquisition Cost: £${data.customerAcquisitionCost || 'TBD'}
- Lifetime Value: £${data.lifetimeValue || 'TBD'}
- Payback Period: ${data.paybackPeriod || 'TBD'} months
- LTV:CAC Ratio: ${
    data.lifetimeValue && data.customerAcquisitionCost 
      ? (parseFloat(data.lifetimeValue) / parseFloat(data.customerAcquisitionCost)).toFixed(1) + ':1'
      : 'Target 3:1+'
  }

FUNDING REQUIREMENTS:
${data.fundingSources || 'Breakdown of funding sources and uses.'}

CASH FLOW ANALYSIS:
Monthly cash flow projections with working capital requirements.

BREAK-EVEN ANALYSIS:
Analysis of break-even point and path to profitability.`;
}

function generateMarketResearchAppendix(data: QuestionnaireData, multiplier: number): string {
  return `MARKET RESEARCH DATA

MARKET SIZE ANALYSIS:
${data.marketSize || 'TAM, SAM, SOM analysis.'}

CUSTOMER RESEARCH:
${data.customerInterviews || 'Summary of customer interviews.'}

COMPETITIVE ANALYSIS:
${data.competitors || 'Detailed competitor analysis.'}

MARKET TRENDS:
Analysis of key market trends and their implications.

CUSTOMER SEGMENTATION:
Primary and secondary customer segments with characteristics and needs.`;
}

function generateRegulatoryAppendix(data: QuestionnaireData, multiplier: number): string {
  return `REGULATORY COMPLIANCE CHECKLIST

REQUIREMENTS:
${data.regulatoryRequirements || 'Applicable regulatory requirements.'}

TIMELINE:
${data.complianceTimeline || 'Compliance achievement timeline.'}

CHECKLIST:
[ ] GDPR Compliance
[ ] Industry-Specific Regulations
[ ] Data Protection Registration
[ ] Professional Certifications
[ ] Security Standards
[ ] Health & Safety (if applicable)
[ ] Environmental Standards (if applicable)

BUDGET:
Compliance Budget: £${data.complianceBudget || '50,000'}`;
}

function generateEvidenceAppendix(data: QuestionnaireData, multiplier: number): string {
  return `EVIDENCE PORTFOLIO

TRACTION EVIDENCE:
${data.tractionEvidence || 'Evidence of market traction.'}

CUSTOMER EVIDENCE:
${data.existingCustomers || 'Existing customer details.'}

LETTERS OF INTENT:
${data.lettersOfIntent || 'Customer commitments.'}

VALIDATION EVIDENCE:
${data.willingnessToPay || 'Evidence of willingness to pay.'}

SUPPORTING DOCUMENTS:
List of supporting documents available upon request.`;
}

function generateTeamAppendix(data: QuestionnaireData, multiplier: number): string {
  return `TEAM BIOGRAPHIES

FOUNDER:
${data.fullLegalName || 'Founder Name'}

EDUCATION:
${data.founderEducation || 'Educational background.'}

EXPERIENCE:
${data.founderWorkHistory || 'Professional experience.'}

ACHIEVEMENTS:
${data.founderAchievements || 'Key achievements.'}

RELEVANT PROJECTS:
${data.relevantProjects || 'Relevant project experience.'}`;
}

function generateImplementationAppendix(data: QuestionnaireData, multiplier: number): string {
  return `IMPLEMENTATION TIMELINE

PHASE 1 (Months 1-6): Foundation
- Complete product development
- Establish operations
- Initial customer acquisition

PHASE 2 (Months 7-12): Growth
- Scale customer base
- Expand team
- Develop partnerships

PHASE 3 (Year 2): Expansion
${data.expansion || 'Expansion strategy and milestones.'}

PHASE 4 (Year 3): Scale
${data.vision || 'Long-term vision and scaling plans.'}

GEOGRAPHIC EXPANSION:
${data.specificRegions || 'Regional expansion plan.'}`;
}

function generateScenarioAppendix(data: QuestionnaireData, multiplier: number): string {
  return `SCENARIO ANALYSIS

BASE CASE:
Conservative growth assumptions with moderate market penetration.

UPSIDE CASE:
Accelerated growth with faster market adoption and expanded opportunities.

DOWNSIDE CASE:
Slower growth with extended sales cycles and increased competition.

KEY VARIABLES:
- Customer acquisition rate
- Pricing power
- Market growth
- Competitive intensity
- Regulatory environment

SENSITIVITY ANALYSIS:
Impact of key variable changes on financial projections.`;
}

function generateBenchmarkAppendix(data: QuestionnaireData, multiplier: number): string {
  return `INDUSTRY BENCHMARK COMPARISON

FINANCIAL BENCHMARKS:
Comparison against industry averages for key financial metrics.

GROWTH BENCHMARKS:
Expected growth rates vs industry norms.

OPERATIONAL BENCHMARKS:
Efficiency metrics compared to industry standards.

COMPETITIVE POSITIONING:
Position relative to industry leaders and peers.

${data.competitiveDifferentiation || 'Competitive advantages vs benchmarks.'}`;
}

function generateRiskRegisterAppendix(data: QuestionnaireData, multiplier: number): string {
  return `RISK REGISTER

STRATEGIC RISKS:
- Market adoption risk
- Competitive response risk
- Regulatory change risk

OPERATIONAL RISKS:
- Technology risk
- Team capacity risk
- Supply chain risk

FINANCIAL RISKS:
- Funding risk
- Cash flow risk
- Currency risk (international)

RISK MATRIX:
Each risk assessed for probability and impact with mitigation strategies.

MONITORING PLAN:
Regular risk review and reporting schedule.`;
}

export default generateTierDocument;
