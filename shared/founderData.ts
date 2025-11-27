/**
 * UK INNOVATOR FOUNDER VISA ASSISTANT
 * Comprehensive Founder Profile Data for Visa Application Prefill
 * 
 * This file contains all verified founder information extracted from:
 * - Business Plan (BUSINESS_PLAN_UK_Innovator_Founder_Visa_Assistant.md)
 * - CV (Ebuka_Umeh_CV_1764067055390.pdf)
 * - Direct founder answers
 * - 475-question bank requirements
 * 
 * Used to prefill ALL visa application tools across all tiers
 * Ensures 100% compliance with lawyer's 8 criteria
 */

export interface FounderProfile {
  // Section 1: Personal Information
  personal: {
    fullName: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    currentVisaStatus: string;
    visaExpiryDate: string;
    ukEntryDate: string;
    currentAddress: string;
    city: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
    linkedIn: string;
    github: string;
    portfolio: string;
    website: string;
  };

  // Section 2: Education & Qualifications
  education: {
    degrees: Array<{
      degree: string;
      field: string;
      institution: string;
      location: string;
      year: string;
      grade?: string;
      focus?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
      url?: string;
    }>;
    professionalMemberships: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };

  // Section 3: Professional Experience
  experience: {
    totalYears: number;
    currentRole: string;
    currentCompany: string;
    positions: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
      achievements: string[];
    }>;
    keySkills: string[];
    technicalSkills: Array<{
      skill: string;
      proficiency: number; // 1-10
    }>;
  };

  // Section 4: Business Information
  business: {
    companyName: string;
    tradingName: string;
    companyNumber: string;
    registeredAddress: string;
    incorporationDate: string;
    businessType: string;
    industry: string;
    website: string;
    email: string;
    directors: Array<{
      name: string;
      role: string;
      shareholding: string;
    }>;
    productName: string;
    productDescription: string;
    problemStatement: string;
    solution: string;
    uniqueSellingPoints: string[];
    technologyStack: string[];
    currentStage: string;
    launchDate: string;
  };

  // Section 5: Financial Information
  financial: {
    personalSavings: number;
    availableCapital: number;
    investmentToDate: number;
    monthlyOperatingCosts: number;
    year1Revenue: number;
    year2Revenue: number;
    year3Revenue: number;
    year1Costs: number;
    year2Costs: number;
    year3Costs: number;
    breakEvenPoint: string;
    fundingStrategy: string;
    pricingTiers: Array<{
      name: string;
      price: number;
      tools: number;
      targetUser: string;
    }>;
  };

  // Section 6: Market & Competition
  market: {
    targetMarket: string;
    marketSize: string;
    tam: string;
    sam: string;
    som: string;
    competitors: Array<{
      name: string;
      website: string;
      strengths: string;
      weaknesses: string;
    }>;
    competitiveAdvantages: string[];
    customerSegments: string[];
    geographicFocus: string[];
  };

  // Section 7: Innovation & IP
  innovation: {
    innovationType: string;
    innovationDescription: string;
    uniqueFeatures: string[];
    technicalDifferentiators: string[];
    ipStrategy: string;
    patents: string[];
    proprietaryTechnology: string[];
  };

  // Section 8: Scalability & Growth
  scalability: {
    year1Users: number;
    year2Users: number;
    year3Users: number;
    year1Employees: number;
    year2Employees: number;
    year3Employees: number;
    hiringPlan: Array<{
      role: string;
      year: number;
      salary: number;
    }>;
    growthPhases: Array<{
      phase: string;
      timeline: string;
      objectives: string[];
    }>;
    geographicExpansion: string[];
  };

  // Section 9: UK Commitment
  ukCommitment: {
    ukEntry: string;
    ukEducation: string;
    ukWorkExperience: string;
    ukConnections: string[];
    whyUK: string[];
    jobCreation: string;
    economicContribution: string;
    taxContribution: string;
  };

  // Section 10: Visa Specific
  visa: {
    endorsingBody: string;
    endorsingBodyReason: string;
    contactPointStrategy: string[];
    maintenanceFunds: number;
    dependents: number;
    backupPlan: string;
    personalCommitment: string;
  };

  // Section 11: Evidence & References
  evidence: {
    portfolioProjects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url: string;
      outcomes: string;
    }>;
    testimonials: Array<{
      name: string;
      role: string;
      company: string;
      quote: string;
    }>;
    references: Array<{
      name: string;
      role: string;
      company: string;
      relationship: string;
      email: string;
      canVouch: string;
    }>;
    awards: string[];
    publications: string[];
    mediaFeatures: string[];
  };
}

// Complete Founder Profile Data - Ebuka Benedict Umeh
export const FOUNDER_DATA: FounderProfile = {
  personal: {
    fullName: "Ebuka Benedict Umeh",
    firstName: "Ebuka Benedict",
    lastName: "Umeh",
    dateOfBirth: "", // To be provided by founder
    nationality: "Nigerian",
    currentVisaStatus: "Post-Study Work (PSW) Visa",
    visaExpiryDate: "", // To be provided - typically 2 years from graduation
    ukEntryDate: "28 September 2022",
    currentAddress: "13 Village Place, Burley",
    city: "Leeds",
    postcode: "LS4 2NT",
    country: "United Kingdom",
    email: "benedict.umeh@innovatorfoundervisaassistant.co.uk",
    phone: "", // To be provided
    linkedIn: "", // To be provided
    github: "", // To be provided
    portfolio: "https://bhenmedia.com",
    website: "https://innovatorfoundervisaassistant.co.uk"
  },

  education: {
    degrees: [
      {
        degree: "MSc",
        field: "Data Science",
        institution: "Leeds Beckett University",
        location: "Leeds, UK",
        year: "2023",
        focus: "Big Data Analytics, Machine Learning, Business Intelligence"
      },
      {
        degree: "BSc",
        field: "Information Technology and Business Information Systems",
        institution: "Middlesex University",
        location: "London, UK",
        year: "2017"
      },
      {
        degree: "Advanced Diploma",
        field: "Software Engineering",
        institution: "Aptech Computer Institute",
        location: "Lagos, Nigeria",
        year: "2016"
      }
    ],
    certifications: [],
    professionalMemberships: [],
    languages: [
      { language: "English", proficiency: "Fluent" },
      { language: "Igbo", proficiency: "Native" }
    ]
  },

  experience: {
    totalYears: 7,
    currentRole: "Founder & Lead Developer",
    currentCompany: "UK Innovator Founder Visa Assistant",
    positions: [
      {
        title: "Founder & Lead Developer",
        company: "BhenMedia",
        location: "UK",
        startDate: "2018",
        endDate: "Present",
        description: "Web development company delivering custom platforms, AI chatbots, automation systems, and high-performance websites",
        achievements: [
          "Delivered 50+ projects for clients across hospitality, healthcare, and corporate sectors",
          "Built custom platforms, AI chatbots, and automation systems",
          "Demonstrated entrepreneurial capability and client management skills"
        ]
      },
      {
        title: "AI Solutions Developer",
        company: "Ibis Styles Leeds",
        location: "Leeds, UK",
        startDate: "2023",
        endDate: "Present",
        description: "Built independent AI-powered virtual concierge system",
        achievements: [
          "Automates 200+ guest queries daily",
          "Streamlines hotel operations significantly",
          "Developed end-to-end AI solution independently"
        ]
      },
      {
        title: "Technical Developer",
        company: "Qalhata Technology",
        location: "UK",
        startDate: "2022",
        endDate: "2023",
        description: "Developed analytics dashboards and technical web infrastructure",
        achievements: [
          "Built AI-driven enterprise systems for data analysis",
          "Created analytics dashboards for business intelligence"
        ]
      },
      {
        title: "Web Developer",
        company: "Deskstones Ltd",
        location: "UK",
        startDate: "2021",
        endDate: "2022",
        description: "Website rebuild and optimization",
        achievements: [
          "Improved website performance and SEO visibility by over 40%",
          "Demonstrated measurable business impact"
        ]
      },
      {
        title: "Automation Specialist",
        company: "Eden Health Care",
        location: "UK",
        startDate: "2020",
        endDate: "2021",
        description: "Developed automation tools for healthcare operations",
        achievements: [
          "Reduced manual processes by 60%",
          "Created efficiency-driving solutions for healthcare sector"
        ]
      }
    ],
    keySkills: [
      "Full Stack Development",
      "AI and Machine Learning Integration",
      "Data Analytics and Business Intelligence",
      "Product Development and UX Design",
      "Digital Marketing and SEO",
      "Project Management and Client Relations"
    ],
    technicalSkills: [
      { skill: "React", proficiency: 9 },
      { skill: "Node.js", proficiency: 9 },
      { skill: "TypeScript", proficiency: 9 },
      { skill: "Python", proficiency: 8 },
      { skill: "PostgreSQL", proficiency: 8 },
      { skill: "OpenAI/GPT Integration", proficiency: 9 },
      { skill: "Google Gemini AI", proficiency: 8 },
      { skill: "Tailwind CSS", proficiency: 9 },
      { skill: "Express.js", proficiency: 9 },
      { skill: "Data Analytics", proficiency: 8 },
      { skill: "Machine Learning", proficiency: 7 },
      { skill: "Cloud Infrastructure", proficiency: 7 }
    ]
  },

  business: {
    companyName: "UK Innovator Founder Visa Assistant",
    tradingName: "UK Innovator Founder Visa Assistant",
    companyNumber: "", // To be registered
    registeredAddress: "13 Village Place, Burley, Leeds, LS4 2NT, United Kingdom",
    incorporationDate: "", // To be registered
    businessType: "AI-powered SaaS Platform",
    industry: "Immigration Technology (ImmigrationTech)",
    website: "https://innovatorfoundervisaassistant.co.uk",
    email: "benedict.umeh@innovatorfoundervisaassistant.co.uk",
    directors: [
      {
        name: "Ebuka Benedict Umeh",
        role: "Founder & CEO",
        shareholding: "100%"
      }
    ],
    productName: "UK Innovator Founder Visa Assistant",
    productDescription: "AI-powered Software-as-a-Service (SaaS) platform designed to democratise access to the UK Innovator Founder Visa process",
    problemStatement: "Navigating the UK Innovator Founder Visa process presents significant challenges: complexity (two-stage application, changing regulations), cost barriers (traditional lawyers charge £3,000-£15,000), information gaps (scattered, inconsistent guidance), and high rejection rates (60-70% at endorsement stage, with weak business plans causing 40% of rejections).",
    solution: "End-to-end, AI-powered solution with 109+ professional-level tools across 8 categories, providing comprehensive guidance at a fraction of traditional costs (90%+ reduction).",
    uniqueSellingPoints: [
      "First fully-integrated Innovator Founder Visa operating system",
      "109+ purpose-built tools specifically for Innovator Founder Visa",
      "AI orchestration layer combining multiple language models (GPT-4, Gemini)",
      "Multi-agent endorsement readiness scoring (ORACLE with Nova, Sterling, Atlas, Sage)",
      "90%+ cost reduction compared to traditional services (£29-299 vs £3,000-15,000)",
      "24/7 online access with real-time policy updates",
      "PhD-level quality standards backed by immigration expertise"
    ],
    technologyStack: [
      "React 18",
      "TypeScript",
      "Tailwind CSS",
      "Node.js 20",
      "Express.js",
      "PostgreSQL (Neon)",
      "OpenAI GPT-4",
      "Google Gemini 2.5",
      "Cloud Infrastructure",
      "TLS 1.3 encryption"
    ],
    currentStage: "Live Beta",
    launchDate: "November 2025"
  },

  financial: {
    personalSavings: 8000,
    availableCapital: 8000,
    investmentToDate: 1000,
    monthlyOperatingCosts: 5000,
    year1Revenue: 180000,
    year2Revenue: 600000,
    year3Revenue: 1200000,
    year1Costs: 146000,
    year2Costs: 357000,
    year3Costs: 699000,
    breakEvenPoint: "Month 6 (125 paying customers)",
    fundingStrategy: "Bootstrap initial growth with revenue, seek £50,000-100,000 seed investment at 12-18 months, reinvest profits for organic growth",
    pricingTiers: [
      { name: "Free", price: 0, tools: 13, targetUser: "Initial exploration" },
      { name: "Basic", price: 29, tools: 20, targetUser: "Straightforward applications" },
      { name: "Premium", price: 49, tools: 83, targetUser: "Most applicants (Most Popular)" },
      { name: "Enterprise", price: 89, tools: 109, targetUser: "Advanced IP and patent strategy" },
      { name: "Ultimate", price: 299, tools: 109, targetUser: "Personal strategist, success guarantee" }
    ]
  },

  market: {
    targetMarket: "Global entrepreneurs seeking UK Innovator Founder Visa",
    marketSize: "948,000 people immigrating to UK annually, 500,000+ global entrepreneurs seeking UK business visas",
    tam: "£2.5 billion (Global entrepreneurs seeking UK business visas)",
    sam: "£250 million (50,000 Innovator Founder and related business visa applicants annually)",
    som: "Year 1: 1,000 users (2% market share), Year 3: 10,000 users (20% market share), £1.2 million revenue",
    competitors: [
      {
        name: "Relogate",
        website: "relogate.me",
        strengths: "Innovator Founder Visa assistance, business plan development",
        weaknesses: "Limited AI integration, higher price point"
      },
      {
        name: "Jobbatical",
        website: "jobbatical.com",
        strengths: "Global immigration, tech-powered solutions",
        weaknesses: "Broad focus, not specialised for Innovator Founder Visa"
      },
      {
        name: "VisaConnect",
        website: "visaconnect.com",
        strengths: "UK Start-Up and Innovator visa advice",
        weaknesses: "Traditional service model, limited self-service tools"
      },
      {
        name: "Traditional Law Firms",
        website: "Various",
        strengths: "Professional expertise, established reputation",
        weaknesses: "High cost (£3,000-15,000), not scalable"
      }
    ],
    competitiveAdvantages: [
      "100% Innovator Founder focused (vs generic or broad focus)",
      "Advanced AI integration (GPT-4, Gemini) vs limited or none",
      "109+ purpose-built tools vs 10-20 generic tools",
      "£29-299 price point vs £1,000-15,000",
      "Full self-service capability vs limited",
      "24/7 online access vs office hours only",
      "Real-time policy updates vs manual, delayed"
    ],
    customerSegments: [
      "Tech entrepreneurs with innovative business ideas",
      "International students with entrepreneurial ambitions",
      "Professionals transitioning to entrepreneurship",
      "Startup founders seeking UK expansion"
    ],
    geographicFocus: [
      "Primary: India, Nigeria, Pakistan, China, USA",
      "Secondary: Middle East, Southeast Asia, South America",
      "Tertiary: Europe, Australia, Canada"
    ]
  },

  innovation: {
    innovationType: "Market Innovation + Technology Innovation + Business Model Innovation",
    innovationDescription: "First fully-integrated Innovator Founder Visa operating system combining AI orchestration (multi-LLM architecture), compliance intelligence graph mapping to Home Office criteria, and multi-agent endorsement readiness scoring",
    uniqueFeatures: [
      "ORACLE Supervisor AI with 4 specialized agents (Nova, Sterling, Atlas, Sage)",
      "Real-time compliance checking and scoring",
      "Automated document generation and review",
      "Intelligent business plan development assistance",
      "Natural language chatbot for instant guidance",
      "Neural Twin simulation for application readiness",
      "Voice-driven autopilot mode"
    ],
    technicalDifferentiators: [
      "Multi-LLM architecture (OpenAI GPT-4, Google Gemini)",
      "Real-time policy update integration",
      "Progressive disclosure UX for complex workflows",
      "Enterprise-grade security and data protection",
      "Machine learning for compliance scoring",
      "Predictive analytics for application success"
    ],
    ipStrategy: "Trade secrets and first-mover advantage, potential patent applications for novel AI approaches",
    patents: [],
    proprietaryTechnology: [
      "ORACLE multi-agent AI system",
      "Compliance intelligence graph",
      "Endorsement readiness scoring algorithm"
    ]
  },

  scalability: {
    year1Users: 5000,
    year2Users: 20000,
    year3Users: 50000,
    year1Employees: 3,
    year2Employees: 8,
    year3Employees: 12,
    hiringPlan: [
      { role: "Customer Success Manager", year: 1, salary: 35000 },
      { role: "Marketing Manager", year: 1, salary: 40000 },
      { role: "Full Stack Developer", year: 2, salary: 50000 },
      { role: "Full Stack Developer", year: 2, salary: 50000 },
      { role: "Operations Manager", year: 2, salary: 40000 },
      { role: "Marketing Specialist", year: 2, salary: 35000 },
      { role: "Customer Success Specialist", year: 2, salary: 30000 },
      { role: "Senior Developer", year: 3, salary: 60000 },
      { role: "Full Stack Developer", year: 3, salary: 50000 },
      { role: "Customer Success Specialist", year: 3, salary: 30000 },
      { role: "Customer Success Specialist", year: 3, salary: 30000 }
    ],
    growthPhases: [
      {
        phase: "Phase 1: UK Market Dominance",
        timeline: "Year 1-2",
        objectives: [
          "Establish as leading Innovator Founder Visa platform",
          "Capture 20% market share",
          "Build brand recognition"
        ]
      },
      {
        phase: "Phase 2: Visa Category Expansion",
        timeline: "Year 2-3",
        objectives: [
          "Add Skilled Worker Visa tools",
          "Add Global Talent Visa tools",
          "Add Scale-Up Visa tools"
        ]
      },
      {
        phase: "Phase 3: Geographic Expansion",
        timeline: "Year 3+",
        objectives: [
          "Localised platforms for key source countries",
          "Multi-language support",
          "Regional partnerships"
        ]
      },
      {
        phase: "Phase 4: Enterprise and B2B",
        timeline: "Year 3+",
        objectives: [
          "White-label solutions for law firms",
          "University licensing",
          "Corporate immigration departments"
        ]
      }
    ],
    geographicExpansion: [
      "UK regions first",
      "India, Nigeria, Pakistan (key source countries)",
      "Middle East, Southeast Asia",
      "Europe, Australia, Canada"
    ]
  },

  ukCommitment: {
    ukEntry: "Entered UK on Student visa on 28 September 2022",
    ukEducation: "MSc Data Science from Leeds Beckett University (2023)",
    ukWorkExperience: "Working in UK on projects including Ibis Styles Leeds AI concierge, Qalhata Technology, and BhenMedia clients since 2022",
    ukConnections: [
      "Leeds Beckett University alumni network",
      "UK hospitality industry clients",
      "UK healthcare sector connections",
      "Leeds tech community"
    ],
    whyUK: [
      "UK immigration services market: £1.5-2 billion",
      "948,000+ annual immigration to UK",
      "Post-Brexit immigration changes driving demand",
      "UK tech ecosystem and AI leadership",
      "Access to global talent and investors",
      "Supportive policy environment for innovation",
      "Personal experience with UK immigration process"
    ],
    jobCreation: "12 UK jobs by Year 3 (2 in Year 1, 5 in Year 2, 4 in Year 3)",
    economicContribution: "Estimated £100,000+ annual tax revenue by Year 3",
    taxContribution: "Corporation tax, employer NICs, income tax from employees"
  },

  visa: {
    endorsingBody: "Tech Nation", // Most appropriate for AI/tech platform
    endorsingBodyReason: "Tech Nation specializes in digital technology businesses and has specific expertise in AI-powered platforms. The platform's multi-LLM architecture and innovative approach to immigration services aligns with their focus on transformative technology.",
    contactPointStrategy: [
      "Contact 1 (Month 6): Platform launch metrics, first 500 users, initial revenue",
      "Contact 2 (Month 12): Year 1 milestones, 5,000 users, first hires, partnership announcements",
      "Contact 3 (Month 18): Growth trajectory, 10,000+ users, team expansion, new features",
      "Contact 4 (Month 24): Year 2 achievements, revenue milestones, market position",
      "Contact 5 (Month 30): Scaling updates, geographic expansion plans, B2B partnerships",
      "Contact 6 (Month 36): Year 3 results, 12 employees, market leadership evidence"
    ],
    maintenanceFunds: 8000, // £8,000 personal savings (exceeds £1,270 requirement)
    dependents: 0,
    backupPlan: "If visa is not approved, continue developing the platform remotely while reapplying with additional evidence. The platform can be operated from any location while pursuing alternative UK visa routes.",
    personalCommitment: "Fully committed to building this business in the UK full-time. The platform represents the intersection of my technical expertise, personal immigration experience, and passion for democratizing access to opportunity."
  },

  evidence: {
    portfolioProjects: [
      {
        name: "UK Innovator Founder Visa Assistant",
        description: "AI-powered SaaS platform with 109+ tools for visa applicants",
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "OpenAI", "Gemini"],
        url: "https://innovatorfoundervisaassistant.co.uk",
        outcomes: "Live platform with comprehensive tool suite, multi-agent AI system"
      },
      {
        name: "Ibis Styles Leeds AI Concierge",
        description: "AI-powered virtual concierge system for hotel guests",
        technologies: ["AI/ML", "Node.js", "Natural Language Processing"],
        url: "Internal hotel system",
        outcomes: "Automates 200+ guest queries daily, significantly streamlined operations"
      },
      {
        name: "BhenMedia Client Projects",
        description: "50+ custom web platforms, AI chatbots, and automation systems",
        technologies: ["React", "Node.js", "Python", "Various AI integrations"],
        url: "https://bhenmedia.com",
        outcomes: "Diverse portfolio across hospitality, healthcare, corporate sectors"
      },
      {
        name: "Eden Health Care Automation",
        description: "Automation tools for healthcare operations",
        technologies: ["Python", "Automation", "Healthcare systems"],
        url: "Internal system",
        outcomes: "Reduced manual processes by 60%"
      },
      {
        name: "Deskstones Ltd Website Rebuild",
        description: "Complete website rebuild and optimization",
        technologies: ["Web development", "SEO", "Performance optimization"],
        url: "Client website",
        outcomes: "Improved performance and SEO visibility by over 40%"
      }
    ],
    testimonials: [],
    references: [
      {
        name: "", // To be provided
        role: "",
        company: "",
        relationship: "Technical reference",
        email: "",
        canVouch: "Technical skills and development expertise"
      },
      {
        name: "", // To be provided
        role: "",
        company: "",
        relationship: "Business reference",
        email: "",
        canVouch: "Entrepreneurial ability and business acumen"
      },
      {
        name: "", // To be provided
        role: "",
        company: "",
        relationship: "Industry reference",
        email: "",
        canVouch: "Innovation and industry knowledge"
      }
    ],
    awards: [],
    publications: [],
    mediaFeatures: []
  }
};

// Helper function to get formatted founder bio
export function getFormattedFounderBio(): string {
  const { personal, education, experience, business, ukCommitment } = FOUNDER_DATA;
  
  return `FOUNDER BIOGRAPHY

${personal.fullName}
Founder & CEO, ${business.companyName}

BACKGROUND

${personal.fullName} is a highly accomplished Full Stack Developer and AI Integration Specialist with over ${experience.totalYears} years of professional experience. With a Master's degree in Data Science from Leeds Beckett University and a Bachelor's degree in Information Technology from Middlesex University, he combines advanced technical expertise with proven entrepreneurial capability.

EDUCATION

${education.degrees.map(d => `• ${d.degree} ${d.field}, ${d.institution} (${d.year})${d.focus ? `\n  Focus: ${d.focus}` : ''}`).join('\n')}

PROFESSIONAL EXPERIENCE

${experience.positions.map(p => `${p.title} | ${p.company} (${p.startDate} - ${p.endDate})
${p.achievements.map(a => `• ${a}`).join('\n')}`).join('\n\n')}

KEY COMPETENCIES

${experience.keySkills.map(s => `• ${s}`).join('\n')}

UK COMMITMENT

${personal.fullName} entered the UK on a Student visa on ${ukCommitment.ukEntry.split(' on ')[1]} and has since established deep roots in the UK tech ecosystem. Having completed a UK master's degree and delivered projects for UK clients including hotels, healthcare providers, and technology companies, he is committed to building his business in the UK and creating ${ukCommitment.jobCreation.split(' ')[0]} UK jobs over the next three years.

FOUNDER FIT

The founder's unique combination of technical expertise (MSc Data Science, ${experience.totalYears}+ years development), entrepreneurial experience (50+ client projects), and first-hand immigration experience creates an ideal profile for building and scaling this platform. He understands both the technical requirements for building AI-powered tools and the real-world challenges faced by visa applicants.`;
}

// Helper function to get business plan executive summary
export function getExecutiveSummary(): string {
  const { business, financial, market, scalability, innovation } = FOUNDER_DATA;
  
  return `EXECUTIVE SUMMARY

BUSINESS OVERVIEW

${business.companyName} is an AI-powered Software-as-a-Service (SaaS) platform designed to democratise access to the UK Innovator Founder Visa process. The platform provides comprehensive, PhD-level quality tools and guidance across compliance, documentation, team management, business planning, financial modelling, and growth strategies.

THE OPPORTUNITY

The UK immigration services market represents a substantial opportunity, with over 948,000 people immigrating to the UK annually. The Innovator Founder Visa route has an approximate 88% success rate for well-prepared applications, yet the process remains complex, expensive, and inaccessible to many qualified entrepreneurs worldwide.

Traditional immigration services charge between £3,000 to £15,000 for Innovator Founder Visa assistance, creating a significant barrier for talented entrepreneurs with limited capital. Our platform addresses this gap by providing accessible, technology-driven support at a fraction of traditional costs.

KEY HIGHLIGHTS

• Product: ${business.uniqueSellingPoints.length}+ professional-level AI-powered tools across 8 categories
• Pricing: Tiered model from Free to Ultimate (£0 to £299)
• Target Market: Global entrepreneurs seeking UK Innovator Founder Visa
• Launch Date: ${business.launchDate}
• Initial Investment: Under £1,000 (self-developed)
• Available Capital: £${financial.availableCapital.toLocaleString()} personal funds
• Year 1 Revenue Target: £${financial.year1Revenue.toLocaleString()}
• Year 3 Revenue Target: £${financial.year3Revenue.toLocaleString()}
• Job Creation: ${scalability.year1Employees} employees by Year 1, ${scalability.year3Employees} by Year 3

INNOVATION

${innovation.innovationDescription}

MISSION STATEMENT

To become the UK's leading AI-powered visa application assistant, enabling talented entrepreneurs worldwide to navigate the Innovator Founder Visa process with confidence, accuracy, and affordability.`;
}

// Helper function to get financial projections summary
export function getFinancialProjectionsSummary(): string {
  const { financial, scalability } = FOUNDER_DATA;
  
  return `FINANCIAL PROJECTIONS SUMMARY

REVENUE FORECAST

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Total Users | ${scalability.year1Users.toLocaleString()} | ${scalability.year2Users.toLocaleString()} | ${scalability.year3Users.toLocaleString()} |
| Paying Users | ${Math.round(scalability.year1Users * 0.1).toLocaleString()} | ${Math.round(scalability.year2Users * 0.125).toLocaleString()} | ${Math.round(scalability.year3Users * 0.15).toLocaleString()} |
| Total Revenue | £${financial.year1Revenue.toLocaleString()} | £${financial.year2Revenue.toLocaleString()} | £${financial.year3Revenue.toLocaleString()} |

COST STRUCTURE

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Total Costs | £${financial.year1Costs.toLocaleString()} | £${financial.year2Costs.toLocaleString()} | £${financial.year3Costs.toLocaleString()} |

PROFITABILITY

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Net Profit | £${(financial.year1Revenue - financial.year1Costs).toLocaleString()} | £${(financial.year2Revenue - financial.year2Costs).toLocaleString()} | £${(financial.year3Revenue - financial.year3Costs).toLocaleString()} |
| Net Margin | ${Math.round((financial.year1Revenue - financial.year1Costs) / financial.year1Revenue * 100)}% | ${Math.round((financial.year2Revenue - financial.year2Costs) / financial.year2Revenue * 100)}% | ${Math.round((financial.year3Revenue - financial.year3Costs) / financial.year3Revenue * 100)}% |

FUNDING

• Personal Investment: Under £1,000 (development completed)
• Available Capital: £${financial.personalSavings.toLocaleString()}
• Break-even Point: ${financial.breakEvenPoint}
• Funding Strategy: ${financial.fundingStrategy}

PRICING TIERS

${financial.pricingTiers.map(t => `• ${t.name}: £${t.price} (${t.tools} tools) - ${t.targetUser}`).join('\n')}`;
}

// Helper to check if a field needs founder input
export function getRequiredFounderInputs(): string[] {
  const missingFields: string[] = [];
  
  if (!FOUNDER_DATA.personal.dateOfBirth) missingFields.push("Date of Birth");
  if (!FOUNDER_DATA.personal.visaExpiryDate) missingFields.push("PSW Visa Expiry Date");
  if (!FOUNDER_DATA.personal.phone) missingFields.push("Phone Number");
  if (!FOUNDER_DATA.personal.linkedIn) missingFields.push("LinkedIn Profile URL");
  if (!FOUNDER_DATA.personal.github) missingFields.push("GitHub Profile URL");
  if (!FOUNDER_DATA.business.companyNumber) missingFields.push("Company Registration Number (if registered)");
  if (FOUNDER_DATA.evidence.references.every(r => !r.name)) missingFields.push("3 Professional References");
  if (FOUNDER_DATA.evidence.testimonials.length === 0) missingFields.push("Client Testimonials");
  
  return missingFields;
}
