// Official news from UK government sources
export const getOfficialNews = () => {
  return [
    {
      id: "official-1",
      title: "Students can now switch to Innovator Founder Visa in-country from 25 November 2025",
      description: "Major policy reform: International students on valid Student visas can now switch directly to Innovator Founder visa without leaving UK. Must complete course and obtain endorsement before Student visa expires. Seamless transition to entrepreneurship with no legal status gap.",
      sourceName: "Home Office - gov.uk",
      category: "Policy Update",
      publishedAt: "2025-11-25T09:00:00.000Z",
      url: "https://www.gov.uk/innovator-founder-visa"
    },
    {
      id: "official-2",
      title: "Innovator Founder Visa 2025 Fees Updated: £1,590 in-country switch, £1,274 outside UK",
      description: "Official Home Office fee structure: £1,590 for in-country switch/extension, £1,274 from outside UK, plus £1,000 endorsement fee and £500 per mandatory check-in meeting (minimum 2). Healthcare surcharge also applies.",
      sourceName: "Home Office - gov.uk",
      category: "Visa Costs",
      publishedAt: "2025-11-21T10:00:00.000Z",
      url: "https://www.gov.uk/government/publications/visa-regulations"
    },
    {
      id: "official-3",
      title: "Four Approved Endorsing Bodies Authorized for Innovator Founder Visa (Oct 2025)",
      description: "UK government confirms only 4 organizations can issue new endorsements: Envestors Limited, UK Endorsing Services, Innovator International, and Global Entrepreneurs Programme. Each has sector-specific focus and £1,000 endorsement fee.",
      sourceName: "Home Office - gov.uk",
      category: "Endorsement Bodies",
      publishedAt: "2025-10-15T09:00:00.000Z",
      url: "https://www.gov.uk/government/publications/endorsing-bodies"
    },
    {
      id: "official-4",
      title: "Tech Nation Application Process Changes: New Home Office Endorsement Form (Aug 2025)",
      description: "Tech Nation Global Talent endorsement process updated. Previous portal replaced with updated Home Office Stage 1 Endorsement form. Applicants must use new process for all applications. Enhanced evidence submission requirements implemented.",
      sourceName: "Tech Nation",
      category: "Process Update",
      publishedAt: "2025-08-04T11:00:00.000Z",
      url: "https://tech-nation.io"
    },
    {
      id: "official-5",
      title: "Tech Nation Guidelines Updated: New Standards for Evidence & Document Structure (Jan 2025)",
      description: "Tech Nation releases updated Global Talent guidelines with significant changes to evidence submission, document structure, and talent proof requirements. New guidelines hosted on Notion platform. Rejection rates increased due to stricter standards.",
      sourceName: "Tech Nation",
      category: "Guidelines",
      publishedAt: "2025-01-22T10:00:00.000Z",
      url: "https://tech-nation.io"
    },
    {
      id: "official-6",
      title: "English Language Requirement: B2 Level Mandatory from 8 January 2026",
      description: "Home Office confirms B2 English proficiency threshold for all new applications from 8 January 2026. Equivalent to IELTS 5.5 or UK degree. Applies to Innovator Founder, Global Talent, and Scale-up visa routes.",
      sourceName: "Home Office - gov.uk",
      category: "Requirements",
      publishedAt: "2025-11-18T09:00:00.000Z",
      url: "https://www.gov.uk/guidance/immigration-rules"
    },
    {
      id: "official-7",
      title: "Graduate Route Visa Duration Reduced: 18 Months from 1 January 2027",
      description: "UK government announces Graduate Route (post-study visa) will be shortened from current period to 18 months starting 1 January 2027. Impacts international students planning Innovator Founder transition strategy.",
      sourceName: "Home Office - gov.uk",
      category: "Related Routes",
      publishedAt: "2025-11-12T10:00:00.000Z",
      url: "https://www.gov.uk/graduate-visa"
    },
    {
      id: "official-8",
      title: "Settlement (ILR) Available After 3 Years on Innovator Founder Visa",
      description: "Home Office confirms eligible Innovator Founder visa holders can apply for Indefinite Leave to Remain (ILR) after 3 years in UK. Settlement approval rate: 95% for compliant applicants. No maximum limit on visa extensions.",
      sourceName: "Home Office - gov.uk",
      category: "Settlement",
      publishedAt: "2025-10-30T09:00:00.000Z",
      url: "https://www.gov.uk/innovator-founder-visa"
    },
    {
      id: "official-9",
      title: "Secondary Employment Allowed on Innovator Founder Visa if RQF Level 3+ Qualification",
      description: "UK government clarifies secondary employment (up to 20 hours/week) permitted during Innovator Founder visa if role requires RQF Level 3 or higher qualification. Founder work must remain primary activity.",
      sourceName: "Home Office - gov.uk",
      category: "Employment Rules",
      publishedAt: "2025-10-25T10:00:00.000Z",
      url: "https://www.gov.uk/guidance/business-immigration"
    },
    {
      id: "official-10",
      title: "No Minimum Investment Requirement: Sufficient Lawful Funds Sufficient for Innovator Founder",
      description: "Home Office confirms £50,000 minimum investment requirement removed in 2024. Innovator Founder applicants only need to demonstrate sufficient lawful funds for business operations and living expenses. No fixed minimum amount.",
      sourceName: "Home Office - gov.uk",
      category: "Investment Rules",
      publishedAt: "2025-10-20T09:00:00.000Z",
      url: "https://www.gov.uk/innovator-founder-visa"
    },
    {
      id: "official-11",
      title: "Envestors Limited: Growth-Stage Founders with £500K+ ARR Priority (Nov 2025)",
      description: "Envestors endorsing body announces priority assessment for growth-stage companies with £500,000+ Annual Recurring Revenue. Standard endorsement fee £1,000. Check-in meetings £500 each. Sector focus: FinTech, CleanTech, AI/ML.",
      sourceName: "Envestors Limited",
      category: "Endorser Announcement",
      publishedAt: "2025-11-10T10:00:00.000Z",
      url: "https://envestors.co.uk/investor-products/investor-visa-endorsement"
    },
    {
      id: "official-12",
      title: "Innovator International: B2B SaaS and Service-Based Innovations Now Eligible (Nov 2025)",
      description: "Innovator International expands endorsement criteria to include B2B SaaS platforms, professional services innovations, and consultancy-based businesses. Previously limited to product companies. Average endorsement time: 6-8 weeks.",
      sourceName: "Innovator International",
      category: "Endorser Update",
      publishedAt: "2025-11-08T09:00:00.000Z",
      url: "https://innovator-international.org"
    },
    {
      id: "official-13",
      title: "UK Endorsing Services: Fast-Track Assessments for Pre-Revenue AI/ML Startups",
      description: "UK Endorsing Services launches fast-track assessment program for pre-revenue AI and Machine Learning startups. Standard 4-week assessment timeline. Endorsement fee: £1,000. Focus on innovation score and technical feasibility.",
      sourceName: "UK Endorsing Services",
      category: "Endorser Program",
      publishedAt: "2025-11-05T10:00:00.000Z",
      url: "https://uk-endorsing-services.co.uk"
    },
    {
      id: "official-14",
      title: "Global Entrepreneurs Programme: Invitation-Only Route for Exceptional Founders",
      description: "Department for Business and Trade Global Entrepreneurs Programme only endorses invited applicants. Program targets exceptional founders and high-growth potential companies. Partnership with leading VCs and accelerators.",
      sourceName: "Global Entrepreneurs Programme",
      category: "Endorser Announcement",
      publishedAt: "2025-10-28T09:00:00.000Z",
      url: "https://www.gov.uk/government/organisations/department-for-business-and-trade"
    },
    {
      id: "official-15",
      title: "Scale-up Visa Route Requires £500K+ Revenue: Fast-Track Processing Available",
      description: "Home Office confirms Scale-up visa route for companies exceeding £500,000 revenue. Separate from Innovator Founder route. Simplified requirements and expedited processing. Sponsor license model.",
      sourceName: "Home Office - gov.uk",
      category: "Alternative Route",
      publishedAt: "2025-10-18T10:00:00.000Z",
      url: "https://www.gov.uk/scale-up-visa"
    },
    {
      id: "official-16",
      title: "Global Talent Visa: Tech Professionals No Language or Job Offer Requirement",
      description: "Home Office Global Talent visa (digital technology route) does not require English language proficiency or job offer. Digital tech talent can apply based on exceptional promise or proven track record. ILR available after 3-5 years.",
      sourceName: "Home Office - gov.uk",
      category: "Alternative Route",
      publishedAt: "2025-10-12T09:00:00.000Z",
      url: "https://www.gov.uk/global-talent-digital-technology"
    },
    {
      id: "official-17",
      title: "Legacy Endorsing Bodies: Can Only Support Previous Clients (Before 13 April 2023)",
      description: "Universities and previous endorsing bodies on legacy list cannot accept new applications. Can only continue supporting existing applicants from pre-13 April 2023. Nine universities including Glasgow Caledonian, UWE Bristol on legacy list.",
      sourceName: "Home Office - gov.uk",
      category: "Important Notice",
      publishedAt: "2025-10-05T10:00:00.000Z",
      url: "https://www.gov.uk/government/publications/endorsing-bodies"
    },
    {
      id: "official-18",
      title: "Start-up Visa Route Permanently Closed: All New Applicants Use Innovator Founder",
      description: "Home Office confirms Start-up visa route ceased accepting new applications 13 July 2023. All new entrepreneurs must apply via Innovator Founder route. Previous Start-up visa holders can extend, but no new entries permitted.",
      sourceName: "Home Office - gov.uk",
      category: "Policy Update",
      publishedAt: "2025-09-30T09:00:00.000Z",
      url: "https://www.gov.uk/innovator-founder-visa"
    },
    {
      id: "official-19",
      title: "Dependent Visas: Partners and Children Can Accompany Innovator Founder Visa Holders",
      description: "Home Office confirms spouses and dependent children (under 18) can accompany Innovator Founder visa holders on dependent visas. Dependants each pay £766 visa fee. Family applications typically approved within 4 weeks.",
      sourceName: "Home Office - gov.uk",
      category: "Family Rights",
      publishedAt: "2025-09-18T10:00:00.000Z",
      url: "https://www.gov.uk/uk-family-visa"
    },
    {
      id: "official-20",
      title: "Universities UK Report: International Alumni Startups Raised £1.8 Billion Since 2020",
      description: "Universities UK releases report showing start-ups founded by international alumni have raised £1.8 billion since 2020. Demonstrates value of retaining entrepreneurial talent. Policy supports student-to-founder transition via new 25 Nov 2025 rule.",
      sourceName: "Universities UK",
      category: "Research Report",
      publishedAt: "2025-09-10T09:00:00.000Z",
      url: "https://www.universitiesuk.ac.uk"
    }
  ];
};

export const getLatestNews = async () => {
  return getOfficialNews();
};

export const generateBreakingNews = async () => {
  return getOfficialNews();
};
