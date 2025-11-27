/**
 * Ultimate Tier Quality Standards
 * 
 * These standards define the exact requirements for all Ultimate tier
 * visa application packages. Every document must meet these criteria.
 */

export const ULTIMATE_TIER_STANDARDS = {
  // Page Count Requirements
  pageRequirements: {
    minimum: 60,
    target: 70,
    maximum: 84,
    coverAndExecutiveSummary: { min: 3, max: 4 },
    innovation: { min: 8, max: 10 },
    viability: { min: 8, max: 10 },
    scalability: { min: 8, max: 10 },
    founderCapability: { min: 6, max: 8 },
    marketUnderstanding: { min: 8, max: 10 },
    financialPlanning: { min: 8, max: 10 },
    riskAwareness: { min: 4, max: 6 },
    ukCommitment: { min: 4, max: 6 },
    appendices: { min: 5, max: 10 }
  },

  // Quality Score Requirements
  qualityScore: {
    minimum: 93.1,
    target: 95,
    breakdown: {
      innovation: { max: 15, minimum: 12 },
      viability: { max: 15, minimum: 12 },
      scalability: { max: 15, minimum: 12 },
      founderCapability: { max: 10, minimum: 8 },
      marketUnderstanding: { max: 15, minimum: 12 },
      financialPlanning: { max: 15, minimum: 12 },
      riskAwareness: { max: 8, minimum: 6 },
      ukCommitment: { max: 7, minimum: 6 }
    }
  },

  // Document Structure Requirements
  documentStructure: {
    coverPage: {
      required: true,
      elements: [
        'Founder full legal name',
        'Document title',
        'ULTIMATE TIER badge',
        'Submission date',
        'Reference number',
        'Professional branding'
      ]
    },
    executiveSummary: {
      required: true,
      minPages: 2,
      maxPages: 3,
      elements: [
        'Business concept',
        'Innovation differentiators',
        'Market opportunity with figures',
        'Founder credentials snapshot',
        '3-year vision statement',
        'Investment/funding requirements'
      ]
    },
    tableOfContents: {
      required: true,
      elements: [
        'All 8 main sections with page numbers',
        'Sub-sections indented',
        'Appendices referenced'
      ]
    }
  },

  // Formatting Standards
  formatting: {
    fonts: {
      primary: ['Calibri', 'Arial', 'Helvetica'],
      bodySize: '11-12pt',
      headingH1: '18-20pt',
      headingH2: '14-16pt',
      headingH3: '12-14pt'
    },
    margins: {
      top: '1 inch',
      bottom: '1 inch',
      left: '1 inch',
      right: '1 inch'
    },
    spacing: {
      lineSpacing: 1.15,
      paragraphSpacing: '6pt after'
    },
    colors: {
      primary: '#1e40af', // Professional blue
      accent: '#f97316', // Brand orange
      text: '#1f2937',
      headings: '#111827'
    }
  },

  // Section Requirements (Lawyer's 8 Criteria)
  sectionRequirements: {
    innovation: {
      minSubsections: 8,
      requiredElements: [
        'Clear problem statement with market evidence',
        'Unique solution description with technical depth',
        'Innovation differentiation matrix',
        'Intellectual property strategy',
        'Technology stack/approach details',
        'R&D roadmap with milestones',
        'Patent/trademark considerations',
        'Disruptive potential analysis'
      ]
    },
    viability: {
      minSubsections: 8,
      requiredElements: [
        'Business model canvas or detailed explanation',
        'Revenue streams breakdown',
        'Pricing strategy with market justification',
        'Unit economics analysis',
        'Customer acquisition strategy',
        'Operational plan for first 12 months',
        'Key partnerships identified',
        'Break-even analysis'
      ]
    },
    scalability: {
      minSubsections: 8,
      requiredElements: [
        'Growth trajectory with projections',
        'Scaling strategy (geographic, product, market)',
        'Technology scalability considerations',
        'Team scaling plan with key hires',
        'Infrastructure requirements',
        'International expansion roadmap',
        'Scalability metrics and KPIs',
        'Case studies of similar businesses'
      ]
    },
    founderCapability: {
      minSubsections: 8,
      requiredElements: [
        'Comprehensive founder biography',
        'Educational credentials with dates',
        'Professional experience timeline',
        'Relevant skills matrix',
        'Previous entrepreneurial ventures',
        'Industry expertise evidence',
        'Leadership experience',
        'Advisory board/mentors'
      ]
    },
    marketUnderstanding: {
      minSubsections: 8,
      requiredElements: [
        'TAM analysis',
        'SAM breakdown',
        'SOM projection',
        'Competitor analysis (min 5)',
        'SWOT analysis',
        'Market trends and growth drivers',
        'Customer segmentation and personas',
        'Market entry barriers analysis'
      ]
    },
    financialPlanning: {
      minSubsections: 8,
      requiredElements: [
        '3-year financial projections',
        'Funding requirements breakdown',
        'Use of funds allocation',
        'Revenue forecasts with assumptions',
        'Cost structure analysis',
        'Financial milestones',
        'Scenario analysis (3 cases)',
        'Key financial metrics'
      ]
    },
    riskAwareness: {
      minSubsections: 8,
      requiredElements: [
        'Comprehensive risk register (min 10 risks)',
        'Risk categorization',
        'Probability and impact assessment',
        'Mitigation strategies',
        'Contingency plans',
        'Regulatory/compliance risks',
        'Competitive risks',
        'Economic/market risks'
      ]
    },
    ukCommitment: {
      minSubsections: 8,
      requiredElements: [
        'UK market opportunity rationale',
        'UK economic contribution projections',
        'Job creation timeline (3 years)',
        'UK-based operations plan',
        'Tax contribution estimates',
        'Supply chain UK integration',
        'Community/social impact',
        'Long-term settlement intentions'
      ]
    }
  },

  // Compliance Requirements
  compliance: {
    oisc: {
      required: true,
      disclaimer: 'This document contains general guidance only and does not constitute immigration advice. Please consult with an OISC-registered advisor or qualified immigration solicitor for personalized advice.',
      elements: [
        'No unauthorized legal advice',
        'Reference to professional legal counsel',
        'Accurate visa requirements',
        'No misleading claims'
      ]
    },
    dataAccuracy: {
      required: true,
      elements: [
        'All personal details verified',
        'Dates accurate and consistent',
        'Financial figures internally consistent',
        'Market data from reputable sources',
        'No placeholder/mock data'
      ]
    }
  },

  // Export Requirements
  exportFormats: {
    primary: '.docx',
    secondary: '.pdf',
    naming: '{TIER}_{DOCUMENT_TYPE}_{FOUNDER_LASTNAME}_{DATE}.{ext}'
  }
};

// Checklist Items (20 Core Standards)
export const ULTIMATE_TIER_CHECKLIST = [
  {
    id: 1,
    category: 'Document Structure',
    item: 'Page Count Requirement',
    description: 'Minimum 60 pages, target 60-80 pages with all 8 criteria fully expanded',
    required: true
  },
  {
    id: 2,
    category: 'Document Structure',
    item: 'Professional Cover Page',
    description: 'Founder name, document title, ULTIMATE TIER badge, submission date, reference number',
    required: true
  },
  {
    id: 3,
    category: 'Document Structure',
    item: 'Executive Summary',
    description: '2-3 pages covering business concept, innovation, market opportunity, founder credentials, 3-year vision',
    required: true
  },
  {
    id: 4,
    category: 'Document Structure',
    item: 'Table of Contents',
    description: 'All 8 sections listed with page numbers, sub-sections indented, appendices referenced',
    required: true
  },
  {
    id: 5,
    category: 'Document Structure',
    item: 'Consistent Formatting',
    description: 'Professional font, proper heading hierarchy, consistent margins, page breaks between sections',
    required: true
  },
  {
    id: 6,
    category: 'Lawyer Criteria',
    item: 'Innovation Section',
    description: '8-10 pages: Problem statement, unique solution, IP strategy, R&D roadmap, disruptive potential',
    required: true
  },
  {
    id: 7,
    category: 'Lawyer Criteria',
    item: 'Viability Section',
    description: '8-10 pages: Business model, revenue streams, pricing strategy, unit economics, break-even analysis',
    required: true
  },
  {
    id: 8,
    category: 'Lawyer Criteria',
    item: 'Scalability Section',
    description: '8-10 pages: Growth trajectory, scaling strategy, team plan, international expansion roadmap',
    required: true
  },
  {
    id: 9,
    category: 'Lawyer Criteria',
    item: 'Founder Capability Section',
    description: '6-8 pages: Biography, education, experience timeline, skills matrix, leadership evidence',
    required: true
  },
  {
    id: 10,
    category: 'Lawyer Criteria',
    item: 'Market Understanding Section',
    description: '8-10 pages: TAM/SAM/SOM, 5+ competitor analysis, SWOT, market trends, customer personas',
    required: true
  },
  {
    id: 11,
    category: 'Lawyer Criteria',
    item: 'Financial Planning Section',
    description: '8-10 pages: 3-year projections, funding breakdown, use of funds, scenario analysis',
    required: true
  },
  {
    id: 12,
    category: 'Lawyer Criteria',
    item: 'Risk Awareness Section',
    description: '4-6 pages: 10+ risks registered, categorized, mitigation strategies, contingency plans',
    required: true
  },
  {
    id: 13,
    category: 'Lawyer Criteria',
    item: 'UK Commitment Section',
    description: '4-6 pages: UK opportunity, economic contribution, job creation, tax estimates, settlement intentions',
    required: true
  },
  {
    id: 14,
    category: 'Compliance',
    item: 'OISC Compliance',
    description: 'Immigration disclaimers present, no unauthorized legal advice, reference to professional counsel',
    required: true
  },
  {
    id: 15,
    category: 'Compliance',
    item: 'Data Accuracy',
    description: 'All founder details verified, dates consistent, financial figures accurate, no placeholder data',
    required: true
  },
  {
    id: 16,
    category: 'Compliance',
    item: 'Evidence & Citations',
    description: 'Market research cited, financial assumptions documented, industry statistics referenced',
    required: true
  },
  {
    id: 17,
    category: 'Compliance',
    item: 'Professional Language',
    description: 'No grammatical errors, British English, professional tone, clear sentences, jargon explained',
    required: true
  },
  {
    id: 18,
    category: 'Final Deliverables',
    item: 'Export Quality',
    description: 'Word document properly formatted, PDF version available, all sections render correctly',
    required: true
  },
  {
    id: 19,
    category: 'Final Deliverables',
    item: 'Appendices & Supporting Documents',
    description: 'CV attached, qualifications referenced, financial spreadsheet, letters of support',
    required: true
  },
  {
    id: 20,
    category: 'Final Deliverables',
    item: 'Final Review Score',
    description: 'Self-assessment score 93.1/100 or higher, all 8 criteria addressed, spell-check completed',
    required: true
  }
];

// Tier comparison for reference
export const TIER_PAGE_REQUIREMENTS = {
  free: { min: 0, max: 5, description: 'Basic overview only' },
  basic: { min: 10, max: 20, description: 'Essential sections covered' },
  premium: { min: 25, max: 40, description: 'Comprehensive coverage' },
  enterprise: { min: 40, max: 60, description: 'Full professional package' },
  ultimate: { min: 60, max: 84, description: 'Maximum depth, lawyer-ready submission' }
};

// Validation function
export function validateUltimateTierDocument(pageCount: number, qualityScore: number): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (pageCount < ULTIMATE_TIER_STANDARDS.pageRequirements.minimum) {
    issues.push(`Page count ${pageCount} is below minimum ${ULTIMATE_TIER_STANDARDS.pageRequirements.minimum}`);
  }
  
  if (qualityScore < ULTIMATE_TIER_STANDARDS.qualityScore.minimum) {
    issues.push(`Quality score ${qualityScore} is below minimum ${ULTIMATE_TIER_STANDARDS.qualityScore.minimum}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
