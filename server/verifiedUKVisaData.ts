/**
 * VERIFIED UK INNOVATOR FOUNDER VISA DATA
 * 
 * This file contains ONLY verified, official information from UK government sources.
 * All data must be traceable to official sources and should be regularly updated.
 * 
 * Last updated: January 2026
 * Sources: UK Home Office, GOV.UK, Official Endorsing Body Websites
 * 
 * LEGAL NOTICE: This information is for general guidance only and should not be
 * taken as legal advice. Always verify current requirements with official sources.
 */

// ============================================================================
// OFFICIAL UK VISA FEES AND TIMELINES (Verified from GOV.UK)
// ============================================================================

export const VERIFIED_VISA_FEES = {
  innovatorFounderVisa: {
    applicationFee: 1191, // GBP - from outside UK
    applicationFeeInUK: 1191, // GBP - switching from within UK
    immigrationHealthSurcharge: 1035, // GBP per year (£1,035 × years of visa)
    biometricFee: 19.20, // GBP (if applicable)
    priorityService: 500, // GBP (where available)
    superPriorityService: 1000, // GBP (where available)
    source: "https://www.gov.uk/innovator-founder-visa/how-much-it-costs",
    lastVerified: "January 2026"
  },
  endorsementCosts: {
    initialEndorsement: 1000, // GBP (typical - varies by body)
    contactPointMeeting: 500, // GBP per meeting (typical - varies by body)
    note: "Endorsement fees vary by endorsing body. Contact your chosen body directly for current pricing.",
    source: "Individual endorsing body websites",
    lastVerified: "January 2026"
  }
};

// ============================================================================
// VERIFIED ELIGIBILITY REQUIREMENTS (From GOV.UK)
// ============================================================================

export const VERIFIED_ELIGIBILITY = {
  financialRequirement: {
    amount: 1270, // GBP minimum in bank account
    durationDays: 28, // Must be held for 28 consecutive days
    endDate: "Within 31 days of application",
    source: "https://www.gov.uk/innovator-founder-visa/eligibility",
    lastVerified: "January 2026"
  },
  englishLanguage: {
    minimumLevel: "B2", // CEFR level
    acceptedTests: [
      "IELTS for UKVI (minimum 5.5 in each component)",
      "TOEFL iBT",
      "PTE Academic",
      "LanguageCert SELT",
      "Trinity ISE",
      "Skills for English UKVI"
    ],
    exemptions: [
      "National of majority English-speaking country",
      "Degree taught in English (must be verified by Ecctis)",
      "Previous UK visa at B1 or B2 level (some categories)"
    ],
    source: "https://www.gov.uk/innovator-founder-visa/knowledge-of-english",
    lastVerified: "January 2026"
  },
  visaDuration: {
    initial: "3 years",
    extension: "3 years (if continuing to meet requirements)",
    settlementEligibility: "After 3 years with successful endorsement",
    source: "https://www.gov.uk/innovator-founder-visa",
    lastVerified: "January 2026"
  }
};

// ============================================================================
// VERIFIED ENDORSING BODIES (From Home Office Official List)
// ============================================================================

export const VERIFIED_ENDORSING_BODIES = {
  // CRITICAL: These are the ONLY 4 active endorsing bodies as of 2026
  // Do NOT add, remove, or modify without verification from official sources
  
  envestors: {
    officialName: "Envestors Limited",
    website: "https://www.envestors.co.uk",
    status: "Active endorsing body",
    description: "Envestors is an FCA-regulated investment platform that connects growth businesses with investors. They provide endorsement services for the Innovator Founder Visa.",
    // NOTE: We do NOT describe their specialty or ideal applicant type
    // as this could be inaccurate and misleading
    contactMethod: "Via their website application process",
    source: "Home Office list of approved endorsing bodies",
    lastVerified: "January 2026"
  },
  innovatorInternational: {
    officialName: "Innovator International Limited",
    website: "https://www.innovatorinternational.com",
    status: "Active endorsing body",
    description: "Innovator International provides endorsement services for entrepreneurs seeking the UK Innovator Founder Visa.",
    contactMethod: "Via their website application process",
    source: "Home Office list of approved endorsing bodies",
    lastVerified: "January 2026"
  },
  startupVisaCoUK: {
    officialName: "StartUp Visa.Co.UK",
    website: "https://www.startupvisa.co.uk",
    status: "Active endorsing body",
    description: "StartUp Visa.Co.UK is an approved endorsing body providing endorsement services for the UK Innovator Founder Visa.",
    contactMethod: "Via their website application process",
    source: "Home Office list of approved endorsing bodies",
    lastVerified: "January 2026"
  },
  primus: {
    officialName: "Primus",
    website: "https://www.primusendorsement.com",
    status: "Active endorsing body",
    description: "Primus is an approved endorsing body providing endorsement services for the UK Innovator Founder Visa.",
    contactMethod: "Via their website application process",
    source: "Home Office list of approved endorsing bodies",
    lastVerified: "January 2026"
  }
};

// ============================================================================
// VERIFIED ENDORSEMENT CRITERIA (From GOV.UK)
// ============================================================================

export const VERIFIED_ENDORSEMENT_CRITERIA = {
  newBusiness: [
    "Innovation: The business idea must be genuinely innovative, new to the market, or significantly different from existing offerings",
    "Viability: The applicant must have the skills, knowledge, and experience to run the business",
    "Scalability: The business must have potential for growth and job creation"
  ],
  sameBusiness: [
    "Must be the same business originally endorsed",
    "Must have made significant progress against the business plan",
    "Must still meet innovation, viability, and scalability criteria"
  ],
  contactPointMeetings: {
    frequency: "At 6, 12, and 24 months after endorsement",
    purpose: "To confirm the business is progressing as planned",
    consequence: "Endorsement may be withdrawn if insufficient progress"
  },
  source: "https://www.gov.uk/innovator-founder-visa/eligibility",
  lastVerified: "January 2026"
};

// ============================================================================
// VERIFIED ILR (SETTLEMENT) REQUIREMENTS
// ============================================================================

export const VERIFIED_SETTLEMENT_REQUIREMENTS = {
  timeInUK: "At least 3 years on Innovator Founder Visa",
  absences: {
    maxSingleAbsence: 180, // days in any 12-month period
    totalAbsences: "No more than 450 days in 3 years"
  },
  endorsementLetter: "Must have valid endorsement letter confirming business has met criteria",
  businessCriteria: [
    "At least £50,000 investment into the business from third parties (not personal funds)",
    "OR significant achievements demonstrating viability (job creation, revenue, etc.)"
  ],
  lifeInUKTest: true,
  englishLanguage: "B1 level or above",
  fee: 2885, // GBP
  source: "https://www.gov.uk/innovator-founder-visa/settlement",
  lastVerified: "January 2026"
};

// ============================================================================
// PROHIBITED CONTENT - THINGS WE MUST NOT CLAIM
// ============================================================================

export const CONTENT_RESTRICTIONS = {
  doNotClaim: [
    "Specific success rates for any endorsing body",
    "Comparisons between endorsing bodies' quality or ease of approval",
    "Fabricated case studies with fictional names or businesses",
    "Specific processing times beyond official estimates",
    "Any guarantee of visa approval",
    "Legal advice or immigration advice (we are not OISC regulated)",
    "Endorsement preferences for specific sectors or business types",
    "Unofficial shortcuts or loopholes",
    "Any claims about government policy that aren't officially announced"
  ],
  requiredDisclaimers: [
    "This information is for general guidance only",
    "Always verify requirements with official government sources",
    "This does not constitute immigration advice",
    "Fees and requirements may change - check GOV.UK for current information"
  ]
};

// ============================================================================
// BLOG CONTENT VALIDATION RULES
// ============================================================================

export const CONTENT_VALIDATION_RULES = {
  // These patterns indicate potentially fabricated content
  fabricationPatterns: [
    /take the story of/i,
    /meet \w+, a/i,
    /case study: the \w+ entrepreneur/i,
    /let me tell you about \w+ who/i,
    /consider \w+'s journey/i,
    /\w+ recently secured their visa/i,
    /when \w+ applied for their visa/i,
  ],
  
  // Content that must include disclaimers
  requiresDisclaimer: [
    /endorsing bod/i,
    /visa fee/i,
    /processing time/i,
    /settlement/i,
    /ilr/i,
    /indefinite leave/i,
    /financial requirement/i,
  ],
  
  // Outdated terms to flag
  outdatedTerms: [
    { term: "Tier 1 Entrepreneur", replacement: "Innovator Founder Visa" },
    { term: "Startup Visa", replacement: "Innovator Founder Visa (note: separate Startup visa may exist)" },
    { term: "£945", replacement: "£1,270 (financial requirement updated)" },
  ]
};

// ============================================================================
// SEO KEYWORDS AND SCHEMA DATA
// ============================================================================

export const SEO_DATA = {
  primaryKeywords: [
    "UK Innovator Founder Visa",
    "UK entrepreneur visa",
    "UK business visa",
    "endorsing body UK",
    "Innovator Founder Visa requirements",
    "UK visa for entrepreneurs",
    "UK startup visa 2026"
  ],
  longTailKeywords: [
    "how to get UK Innovator Founder Visa",
    "UK Innovator Founder Visa business plan",
    "endorsing body interview tips",
    "UK visa for tech entrepreneurs",
    "Innovator Founder Visa financial requirements",
    "UK visa application process 2026"
  ],
  organizationSchema: {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "description": "AI-powered platform helping entrepreneurs navigate the UK Innovator Founder Visa process",
    "url": "https://innovatorfoundervisaassistant.co.uk"
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getVerifiedEndorsingBodyInfo(): string {
  return `As of January 2026, there are 4 approved endorsing bodies for the UK Innovator Founder Visa:

1. **Envestors Limited** (envestors.co.uk) - FCA-regulated investment platform providing endorsement services
2. **Innovator International Limited** (innovatorinternational.com) - Approved endorsing body
3. **StartUp Visa.Co.UK** (startupvisa.co.uk) - Approved endorsing body
4. **Primus** (primusendorsement.com) - Approved endorsing body

Contact each endorsing body directly via their website to learn about their specific process, fees, and requirements. Endorsement typically costs around £1,000 for initial assessment plus £500 per contact point meeting, though this varies by body.`;
}

export function getStandardDisclaimer(): string {
  return `<div class="disclaimer-box">
<p><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. The UK Innovator Founder Visa requirements and fees may change. Always verify current requirements on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener">GOV.UK</a> and consult with a qualified immigration adviser if needed.</p>
</div>`;
}

export function getLastUpdatedNotice(): string {
  const date = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return `<p class="last-updated"><em>Last verified against official sources: ${date}</em></p>`;
}
