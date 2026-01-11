/**
 * TIER-BASED DOCUMENT CONTENT CONFIGURATION
 * 
 * Controls exact page output for each subscription tier:
 * - FREE: 10-15 pages (capped - no more)
 * - BASIC: 25-35 pages
 * - PREMIUM: 40-60 pages
 * - ENTERPRISE: 50-80 pages
 * - ULTIMATE: 80+ pages
 */

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise' | 'ultimate';

export interface TierContentConfig {
  tier: SubscriptionTier;
  minPages: number;
  maxPages: number;
  sections: TierSectionConfig;
  contentDepth: 'minimal' | 'basic' | 'detailed' | 'comprehensive' | 'exhaustive';
  includeAppendices: boolean;
  appendixTypes: string[];
  includeExecutiveSummary: boolean;
  executiveSummaryLength: 'brief' | 'standard' | 'extended';
  includeFinancialTables: boolean;
  financialTableDepth: 'annual' | 'quarterly' | 'monthly';
  includeRiskAnalysis: boolean;
  includeImplementationTimeline: boolean;
  includeMarketResearchAppendix: boolean;
  includeEvidenceAppendix: boolean;
  includeTeamBiographies: boolean;
  includeRegulatoryChecklist: boolean;
  includeBenchmarkComparison: boolean;
  includeScenarioAnalysis: boolean;
  includeGlossary: boolean;
  includeSourceCitations: boolean;
}

export interface TierSectionConfig {
  executiveSummary: { include: boolean; wordLimit: number };
  businessOverview: { include: boolean; wordLimit: number; depth: 'summary' | 'standard' | 'detailed' };
  problemStatement: { include: boolean; wordLimit: number };
  solution: { include: boolean; wordLimit: number };
  innovation: { include: boolean; wordLimit: number; includePatents: boolean };
  technology: { include: boolean; wordLimit: number; includeArchitecture: boolean };
  founderCredentials: { include: boolean; wordLimit: number; includeFullCV: boolean };
  financialModel: { include: boolean; wordLimit: number; includeProjections: boolean; projectionMonths: number };
  marketAnalysis: { include: boolean; wordLimit: number; includeCompetitorMatrix: boolean };
  customerValidation: { include: boolean; wordLimit: number; includeInterviewSummaries: boolean };
  regulatoryCompliance: { include: boolean; wordLimit: number; includeChecklist: boolean };
  growthStrategy: { include: boolean; wordLimit: number; includeTimeline: boolean };
  teamPlan: { include: boolean; wordLimit: number; includeOrgChart: boolean };
  endorserStrategy: { include: boolean; wordLimit: number };
  riskMitigation: { include: boolean; wordLimit: number };
  exitStrategy: { include: boolean; wordLimit: number };
}

// TIER CONFIGURATIONS

export const TIER_CONFIGS: Record<SubscriptionTier, TierContentConfig> = {
  // FREE TIER: 10-15 pages MAXIMUM (capped to encourage upgrades)
  free: {
    tier: 'free',
    minPages: 10,
    maxPages: 15, // HARD CAP - never exceed
    contentDepth: 'minimal',
    includeAppendices: false,
    appendixTypes: [],
    includeExecutiveSummary: true,
    executiveSummaryLength: 'brief',
    includeFinancialTables: false,
    financialTableDepth: 'annual',
    includeRiskAnalysis: false,
    includeImplementationTimeline: false,
    includeMarketResearchAppendix: false,
    includeEvidenceAppendix: false,
    includeTeamBiographies: false,
    includeRegulatoryChecklist: false,
    includeBenchmarkComparison: false,
    includeScenarioAnalysis: false,
    includeGlossary: false,
    includeSourceCitations: false,
    sections: {
      executiveSummary: { include: true, wordLimit: 200 },
      businessOverview: { include: true, wordLimit: 300, depth: 'summary' },
      problemStatement: { include: true, wordLimit: 200 },
      solution: { include: true, wordLimit: 250 },
      innovation: { include: true, wordLimit: 200, includePatents: false },
      technology: { include: true, wordLimit: 150, includeArchitecture: false },
      founderCredentials: { include: true, wordLimit: 200, includeFullCV: false },
      financialModel: { include: true, wordLimit: 250, includeProjections: false, projectionMonths: 12 },
      marketAnalysis: { include: true, wordLimit: 200, includeCompetitorMatrix: false },
      customerValidation: { include: true, wordLimit: 150, includeInterviewSummaries: false },
      regulatoryCompliance: { include: true, wordLimit: 150, includeChecklist: false },
      growthStrategy: { include: true, wordLimit: 200, includeTimeline: false },
      teamPlan: { include: true, wordLimit: 150, includeOrgChart: false },
      endorserStrategy: { include: true, wordLimit: 150 },
      riskMitigation: { include: false, wordLimit: 0 },
      exitStrategy: { include: false, wordLimit: 0 },
    },
  },

  // BASIC TIER: 25-35 pages
  basic: {
    tier: 'basic',
    minPages: 25,
    maxPages: 35,
    contentDepth: 'basic',
    includeAppendices: true,
    appendixTypes: ['financial_summary'],
    includeExecutiveSummary: true,
    executiveSummaryLength: 'standard',
    includeFinancialTables: true,
    financialTableDepth: 'quarterly',
    includeRiskAnalysis: false,
    includeImplementationTimeline: true,
    includeMarketResearchAppendix: false,
    includeEvidenceAppendix: false,
    includeTeamBiographies: false,
    includeRegulatoryChecklist: true,
    includeBenchmarkComparison: false,
    includeScenarioAnalysis: false,
    includeGlossary: false,
    includeSourceCitations: false,
    sections: {
      executiveSummary: { include: true, wordLimit: 400 },
      businessOverview: { include: true, wordLimit: 500, depth: 'standard' },
      problemStatement: { include: true, wordLimit: 400 },
      solution: { include: true, wordLimit: 500 },
      innovation: { include: true, wordLimit: 400, includePatents: true },
      technology: { include: true, wordLimit: 350, includeArchitecture: false },
      founderCredentials: { include: true, wordLimit: 400, includeFullCV: false },
      financialModel: { include: true, wordLimit: 600, includeProjections: true, projectionMonths: 24 },
      marketAnalysis: { include: true, wordLimit: 500, includeCompetitorMatrix: true },
      customerValidation: { include: true, wordLimit: 400, includeInterviewSummaries: false },
      regulatoryCompliance: { include: true, wordLimit: 350, includeChecklist: true },
      growthStrategy: { include: true, wordLimit: 450, includeTimeline: true },
      teamPlan: { include: true, wordLimit: 350, includeOrgChart: false },
      endorserStrategy: { include: true, wordLimit: 350 },
      riskMitigation: { include: true, wordLimit: 300 },
      exitStrategy: { include: true, wordLimit: 250 },
    },
  },

  // PREMIUM TIER: 40-60 pages
  premium: {
    tier: 'premium',
    minPages: 40,
    maxPages: 60,
    contentDepth: 'detailed',
    includeAppendices: true,
    appendixTypes: ['financial_projections', 'market_research', 'regulatory_checklist'],
    includeExecutiveSummary: true,
    executiveSummaryLength: 'extended',
    includeFinancialTables: true,
    financialTableDepth: 'monthly',
    includeRiskAnalysis: true,
    includeImplementationTimeline: true,
    includeMarketResearchAppendix: true,
    includeEvidenceAppendix: true,
    includeTeamBiographies: true,
    includeRegulatoryChecklist: true,
    includeBenchmarkComparison: true,
    includeScenarioAnalysis: false,
    includeGlossary: false,
    includeSourceCitations: true,
    sections: {
      executiveSummary: { include: true, wordLimit: 800 },
      businessOverview: { include: true, wordLimit: 800, depth: 'detailed' },
      problemStatement: { include: true, wordLimit: 600 },
      solution: { include: true, wordLimit: 800 },
      innovation: { include: true, wordLimit: 700, includePatents: true },
      technology: { include: true, wordLimit: 600, includeArchitecture: true },
      founderCredentials: { include: true, wordLimit: 700, includeFullCV: true },
      financialModel: { include: true, wordLimit: 1000, includeProjections: true, projectionMonths: 36 },
      marketAnalysis: { include: true, wordLimit: 900, includeCompetitorMatrix: true },
      customerValidation: { include: true, wordLimit: 700, includeInterviewSummaries: true },
      regulatoryCompliance: { include: true, wordLimit: 600, includeChecklist: true },
      growthStrategy: { include: true, wordLimit: 700, includeTimeline: true },
      teamPlan: { include: true, wordLimit: 600, includeOrgChart: true },
      endorserStrategy: { include: true, wordLimit: 500 },
      riskMitigation: { include: true, wordLimit: 600 },
      exitStrategy: { include: true, wordLimit: 500 },
    },
  },

  // ENTERPRISE TIER: 50-80 pages
  enterprise: {
    tier: 'enterprise',
    minPages: 50,
    maxPages: 80,
    contentDepth: 'comprehensive',
    includeAppendices: true,
    appendixTypes: ['financial_projections', 'market_research', 'regulatory_checklist', 'evidence_portfolio', 'team_bios', 'implementation_plan'],
    includeExecutiveSummary: true,
    executiveSummaryLength: 'extended',
    includeFinancialTables: true,
    financialTableDepth: 'monthly',
    includeRiskAnalysis: true,
    includeImplementationTimeline: true,
    includeMarketResearchAppendix: true,
    includeEvidenceAppendix: true,
    includeTeamBiographies: true,
    includeRegulatoryChecklist: true,
    includeBenchmarkComparison: true,
    includeScenarioAnalysis: true,
    includeGlossary: true,
    includeSourceCitations: true,
    sections: {
      executiveSummary: { include: true, wordLimit: 1200 },
      businessOverview: { include: true, wordLimit: 1200, depth: 'detailed' },
      problemStatement: { include: true, wordLimit: 900 },
      solution: { include: true, wordLimit: 1100 },
      innovation: { include: true, wordLimit: 1000, includePatents: true },
      technology: { include: true, wordLimit: 900, includeArchitecture: true },
      founderCredentials: { include: true, wordLimit: 1000, includeFullCV: true },
      financialModel: { include: true, wordLimit: 1500, includeProjections: true, projectionMonths: 36 },
      marketAnalysis: { include: true, wordLimit: 1300, includeCompetitorMatrix: true },
      customerValidation: { include: true, wordLimit: 1000, includeInterviewSummaries: true },
      regulatoryCompliance: { include: true, wordLimit: 900, includeChecklist: true },
      growthStrategy: { include: true, wordLimit: 1000, includeTimeline: true },
      teamPlan: { include: true, wordLimit: 900, includeOrgChart: true },
      endorserStrategy: { include: true, wordLimit: 700 },
      riskMitigation: { include: true, wordLimit: 900 },
      exitStrategy: { include: true, wordLimit: 700 },
    },
  },

  // ULTIMATE TIER: 80+ pages (PhD-level comprehensive)
  ultimate: {
    tier: 'ultimate',
    minPages: 80,
    maxPages: 120,
    contentDepth: 'exhaustive',
    includeAppendices: true,
    appendixTypes: [
      'financial_projections', 
      'market_research', 
      'regulatory_checklist', 
      'evidence_portfolio', 
      'team_bios', 
      'implementation_plan',
      'scenario_analysis',
      'benchmark_comparison',
      'risk_register',
      'stakeholder_analysis',
      'competitive_intelligence',
      'ip_portfolio',
      'customer_research',
      'technical_architecture',
    ],
    includeExecutiveSummary: true,
    executiveSummaryLength: 'extended',
    includeFinancialTables: true,
    financialTableDepth: 'monthly',
    includeRiskAnalysis: true,
    includeImplementationTimeline: true,
    includeMarketResearchAppendix: true,
    includeEvidenceAppendix: true,
    includeTeamBiographies: true,
    includeRegulatoryChecklist: true,
    includeBenchmarkComparison: true,
    includeScenarioAnalysis: true,
    includeGlossary: true,
    includeSourceCitations: true,
    sections: {
      executiveSummary: { include: true, wordLimit: 2000 },
      businessOverview: { include: true, wordLimit: 1800, depth: 'detailed' },
      problemStatement: { include: true, wordLimit: 1400 },
      solution: { include: true, wordLimit: 1600 },
      innovation: { include: true, wordLimit: 1500, includePatents: true },
      technology: { include: true, wordLimit: 1400, includeArchitecture: true },
      founderCredentials: { include: true, wordLimit: 1500, includeFullCV: true },
      financialModel: { include: true, wordLimit: 2500, includeProjections: true, projectionMonths: 36 },
      marketAnalysis: { include: true, wordLimit: 2000, includeCompetitorMatrix: true },
      customerValidation: { include: true, wordLimit: 1500, includeInterviewSummaries: true },
      regulatoryCompliance: { include: true, wordLimit: 1400, includeChecklist: true },
      growthStrategy: { include: true, wordLimit: 1500, includeTimeline: true },
      teamPlan: { include: true, wordLimit: 1400, includeOrgChart: true },
      endorserStrategy: { include: true, wordLimit: 1000 },
      riskMitigation: { include: true, wordLimit: 1400 },
      exitStrategy: { include: true, wordLimit: 1000 },
    },
  },
};

/**
 * Get tier configuration
 */
export function getTierConfig(tier: SubscriptionTier): TierContentConfig {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.free;
}

/**
 * Estimate word count for tier
 */
export function getEstimatedWordCount(tier: SubscriptionTier): { min: number; max: number } {
  const config = getTierConfig(tier);
  const sections = config.sections;
  
  let totalWords = 0;
  Object.values(sections).forEach(section => {
    if (section.include) {
      totalWords += section.wordLimit;
    }
  });
  
  // Add appendix estimates
  const appendixWordsPerType = 1500;
  totalWords += config.appendixTypes.length * appendixWordsPerType;
  
  return {
    min: Math.floor(totalWords * 0.85),
    max: Math.ceil(totalWords * 1.15),
  };
}

/**
 * Estimate page count for tier (250-300 words per page)
 */
export function getEstimatedPageCount(tier: SubscriptionTier): { min: number; max: number } {
  const wordCount = getEstimatedWordCount(tier);
  return {
    min: Math.floor(wordCount.min / 300),
    max: Math.ceil(wordCount.max / 250),
  };
}

/**
 * Cap content to tier limits (for FREE tier especially)
 */
export function shouldCapContent(tier: SubscriptionTier, currentWordCount: number): boolean {
  const config = getTierConfig(tier);
  const maxWords = config.maxPages * 300; // 300 words per page max
  return currentWordCount >= maxWords;
}

/**
 * Get upgrade message for capped content
 */
export function getUpgradeMessage(tier: SubscriptionTier): string {
  if (tier === 'free') {
    return 'Upgrade to Basic (£9) for 25-35 pages with detailed financial projections and regulatory checklists.';
  }
  if (tier === 'basic') {
    return 'Upgrade to Premium (£19) for 40-60 pages with comprehensive market research and evidence appendices.';
  }
  if (tier === 'premium') {
    return 'Upgrade to Enterprise (£29) for 50-80 pages with scenario analysis and full implementation planning.';
  }
  if (tier === 'enterprise') {
    return 'Upgrade to Ultimate (£39) for 80+ pages - our most comprehensive visa package.';
  }
  return '';
}

/**
 * Calculate content expansion multiplier for tier
 */
export function getContentExpansionMultiplier(tier: SubscriptionTier): number {
  switch (tier) {
    case 'free': return 0.5;      // Minimal - cap at 50%
    case 'basic': return 1.0;     // Standard
    case 'premium': return 1.5;   // 50% more detail
    case 'enterprise': return 2.0; // Double detail
    case 'ultimate': return 3.0;  // Triple detail (PhD-level)
    default: return 0.5;
  }
}

/**
 * Get sections to include for tier
 */
export function getIncludedSections(tier: SubscriptionTier): string[] {
  const config = getTierConfig(tier);
  const included: string[] = [];
  
  Object.entries(config.sections).forEach(([key, value]) => {
    if (value.include) {
      included.push(key);
    }
  });
  
  return included;
}

/**
 * Truncate content to word limit for section
 */
export function truncateToWordLimit(content: string, sectionKey: keyof TierSectionConfig, tier: SubscriptionTier): string {
  const config = getTierConfig(tier);
  const sectionConfig = config.sections[sectionKey];
  
  if (!sectionConfig || !sectionConfig.include) {
    return '';
  }
  
  const words = content.split(/\s+/);
  if (words.length <= sectionConfig.wordLimit) {
    return content;
  }
  
  return words.slice(0, sectionConfig.wordLimit).join(' ') + '...';
}

/**
 * Expand content to meet minimum word requirement for section
 */
export function expandContent(
  content: string, 
  sectionKey: keyof TierSectionConfig, 
  tier: SubscriptionTier,
  expansionData?: Record<string, string>
): string {
  const config = getTierConfig(tier);
  const sectionConfig = config.sections[sectionKey];
  
  if (!sectionConfig || !sectionConfig.include) {
    return content;
  }
  
  const currentWords = content.split(/\s+/).length;
  const targetWords = sectionConfig.wordLimit;
  
  if (currentWords >= targetWords) {
    return content;
  }
  
  // Add expansion content based on section type and tier
  let expanded = content;
  
  if (tier === 'premium' || tier === 'enterprise' || tier === 'ultimate') {
    // Add detailed analysis sections
    const finSection = config.sections.financialModel as { include: boolean; wordLimit: number; includeProjections?: boolean };
    const mktSection = config.sections.marketAnalysis as { include: boolean; wordLimit: number; includeCompetitorMatrix?: boolean };
    const credSection = config.sections.founderCredentials as { include: boolean; wordLimit: number; includeFullCV?: boolean };
    
    if (sectionKey === 'financialModel' && finSection.includeProjections) {
      expanded += generateFinancialExpansion(tier, expansionData);
    }
    if (sectionKey === 'marketAnalysis' && mktSection.includeCompetitorMatrix) {
      expanded += generateMarketExpansion(tier, expansionData);
    }
    if (sectionKey === 'founderCredentials' && credSection.includeFullCV) {
      expanded += generateCredentialsExpansion(tier, expansionData);
    }
  }
  
  return expanded;
}

// Helper functions for content expansion
function generateFinancialExpansion(tier: SubscriptionTier, data?: Record<string, string>): string {
  const months = tier === 'ultimate' ? 36 : tier === 'enterprise' ? 36 : 24;
  return `

DETAILED ${months}-MONTH FINANCIAL PROJECTIONS

Month-by-Month Revenue Forecast:
This section provides a granular breakdown of expected revenue streams over the projection period. Each month's forecast is based on customer acquisition targets, pricing tiers, and seasonal adjustments specific to the UK market.

Key Financial Metrics Analysis:
- Customer Acquisition Cost (CAC): Detailed breakdown by channel
- Lifetime Value (LTV): Cohort analysis and retention modeling
- Payback Period: Cash flow recovery timeline
- Gross Margin Analysis: Unit economics breakdown
- Operating Expense Ratios: Fixed vs variable cost structure

Sensitivity Analysis:
Multiple scenarios have been modeled to account for market variability:
- Base Case: ${data?.monthlyProjections || 'Conservative growth assumptions'}
- Upside Case: Accelerated market penetration
- Downside Case: Extended sales cycle and higher churn

Cash Flow Management:
Working capital requirements, funding milestones, and runway analysis are detailed to demonstrate financial prudence and planning sophistication.
`;
}

function generateMarketExpansion(tier: SubscriptionTier, data?: Record<string, string>): string {
  return `

COMPREHENSIVE MARKET ANALYSIS

Total Addressable Market (TAM):
${data?.marketSize || 'The UK market presents significant opportunity for innovation-driven growth.'}

Competitive Landscape Matrix:
A detailed comparison of key competitors including:
${data?.competitors || '- Established players with market share analysis\n- Emerging competitors and their differentiation\n- Potential market entrants and barriers'}

Customer Segmentation:
Primary target segments have been identified based on:
- Demographics and psychographics
- Buying behavior patterns
- Pain point severity
- Willingness to pay validation

Market Entry Strategy:
The go-to-market approach leverages identified competitive advantages while building sustainable market position through:
- Strategic partnerships
- Channel development
- Brand positioning

Market Trends and Dynamics:
Analysis of key trends affecting market growth, regulatory changes, and technological shifts that create opportunity for innovative solutions.
`;
}

function generateCredentialsExpansion(tier: SubscriptionTier, data?: Record<string, string>): string {
  return `

FOUNDER CREDENTIALS - DETAILED CURRICULUM VITAE

Education Background:
${data?.founderEducation || 'Comprehensive educational qualifications demonstrating expertise and commitment to excellence.'}

Professional Experience:
${data?.founderWorkHistory || 'Detailed career progression showing relevant industry experience and leadership capabilities.'}

Key Achievements:
${data?.founderAchievements || 'Measurable accomplishments demonstrating ability to execute and deliver results.'}

Domain Expertise:
Deep technical and industry knowledge gained through:
- Hands-on project experience
- Continuous professional development
- Industry recognition and thought leadership

Leadership & Management:
Demonstrated ability to build and lead teams, manage stakeholders, and drive organizational success through:
- Team building and mentorship
- Strategic decision making
- Cross-functional collaboration

Relevant Publications & Speaking:
Industry contributions including research, publications, conference presentations, and media appearances that establish credibility and expertise.
`;
}

export default TIER_CONFIGS;
