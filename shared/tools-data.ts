export interface Tool {
  id: string;
  name: string;
  description: string;
  category: "business" | "financial" | "innovation" | "team" | "growth" | "compliance" | "defense" | "documentation";
  stage: "before" | "during" | "after";
  tier: "free" | "basic" | "premium" | "enterprise" | "ultimate";
  icon: string;
}

export const ALL_TOOLS: Tool[] = [
  // A - Application & Advisors
  { id: "app-req-checker", name: "Application Requirements Checker", description: "Verify all required documents and eligibility criteria", category: "compliance", stage: "before", tier: "free", icon: "CheckCircle" },
  { id: "advisors-finder", name: "Approved Advisors/Endorsers Finder", description: "Find and compare approved visa advisors and endorsers", category: "documentation", stage: "before", tier: "basic", icon: "Users" },
  { id: "advisor-prep-guide", name: "Advisor Meeting Prep Guide", description: "Prepare for meetings with immigration advisors", category: "documentation", stage: "before", tier: "premium", icon: "BookOpen" },

  // B - Business Foundation
  { id: "business-plan", name: "Business Plan Generator", description: "Generate comprehensive business plans", category: "business", stage: "during", tier: "basic", icon: "FileText" },
  { id: "business-model-validator", name: "Business Model Validator", description: "Validate your business model against market realities", category: "business", stage: "before", tier: "premium", icon: "CheckCircle2" },
  { id: "budget-cost-analyzer", name: "Budget & Cost Analysis Tool", description: "Analyze startup costs and ongoing expenses", category: "financial", stage: "before", tier: "premium", icon: "DollarSign" },
  { id: "breakeven-calculator", name: "Break-Even Analysis Calculator", description: "Calculate when your business reaches profitability", category: "financial", stage: "during", tier: "premium", icon: "TrendingUp" },

  // C - Compliance & Criteria
  { id: "compliance-checker", name: "Compliance Checker", description: "Ensure compliance with UK visa rules and regulations", category: "compliance", stage: "during", tier: "basic", icon: "Shield" },
  { id: "criteria-scorer", name: "Criteria Assessment Scorer", description: "Score Innovation, Viability, and Scalability criteria", category: "business", stage: "during", tier: "premium", icon: "BarChart3" },
  { id: "company-formation", name: "Company Formation & Structure Guide", description: "Guide for UK company formation and legal structure", category: "compliance", stage: "before", tier: "free", icon: "Building2" },

  // D - Documents & Data
  { id: "doc-organizer", name: "Document Organizer", description: "Organize and track all application documents", category: "documentation", stage: "during", tier: "free", icon: "Folder" },
  { id: "due-diligence", name: "Due Diligence Report Generator", description: "Generate comprehensive due diligence reports", category: "documentation", stage: "during", tier: "enterprise", icon: "FileCheck" },
  { id: "data-security", name: "Data Security & Privacy Compliance Guide", description: "Ensure data security and GDPR compliance", category: "compliance", stage: "before", tier: "premium", icon: "Lock" },
  { id: "doc-verification", name: "Document Verification Tracker", description: "Track verification status of all documents", category: "documentation", stage: "during", tier: "premium", icon: "ClipboardCheck" },

  // E - Endorsement & Evidence
  { id: "endorsement-readiness", name: "Endorsement Readiness Checker", description: "Check readiness for endorsement application", category: "business", stage: "before", tier: "premium", icon: "Award" },
  { id: "endorser-comparison", name: "Endorser Comparison Tool", description: "Compare different endorsement bodies", category: "documentation", stage: "before", tier: "basic", icon: "Scale" },
  { id: "evidence-collection", name: "Evidence Collection & Organization", description: "Organize supporting evidence and documents", category: "documentation", stage: "during", tier: "basic", icon: "Package" },
  { id: "evidence-validator", name: "Evidence Quality Validator", description: "Validate quality and relevance of evidence", category: "compliance", stage: "during", tier: "enterprise", icon: "CheckCheck" },

  // F - Financial & Funding
  { id: "financial-projections", name: "Financial Projections Generator", description: "Generate 3-5 year financial forecasts", category: "financial", stage: "during", tier: "basic", icon: "LineChart" },
  { id: "funding-strategy", name: "Funding Strategy Builder", description: "Plan your funding and investment strategy", category: "financial", stage: "before", tier: "premium", icon: "Target" },
  { id: "funding-sources", name: "Funding Sources Finder", description: "Identify and analyze potential funding sources", category: "financial", stage: "before", tier: "enterprise", icon: "Coins" },
  { id: "financial-modeling", name: "Financial Modeling", description: "Advanced 3-5 year financial modeling", category: "financial", stage: "during", tier: "enterprise", icon: "Calculator" },

  // G - Growth & Go-to-Market
  { id: "growth-strategy", name: "Growth Strategy Builder", description: "Build comprehensive growth strategy", category: "growth", stage: "during", tier: "premium", icon: "Zap" },
  { id: "gtm-plan", name: "Go-to-Market Plan Generator", description: "Generate go-to-market strategy", category: "growth", stage: "during", tier: "premium", icon: "Rocket" },
  { id: "growth-metrics", name: "Growth Metrics Dashboard", description: "Track key growth metrics", category: "growth", stage: "after", tier: "premium", icon: "Activity" },
  { id: "geographic-expansion", name: "Geographic Expansion Planner", description: "Plan international expansion strategy", category: "growth", stage: "during", tier: "enterprise", icon: "Globe" },

  // H - Hiring & HR
  { id: "team-scaling", name: "Team Scaling Strategy Builder", description: "Plan team growth and hiring roadmap", category: "team", stage: "during", tier: "premium", icon: "Users" },
  { id: "hiring-plan", name: "Hiring Plan Generator", description: "Generate detailed hiring plan with timelines", category: "team", stage: "during", tier: "premium", icon: "UserPlus" },
  { id: "hr-compliance", name: "HR & Payroll Compliance Guide", description: "Ensure HR and payroll compliance", category: "compliance", stage: "after", tier: "premium", icon: "FileText" },
  { id: "org-chart", name: "Organizational Chart Builder", description: "Build and visualize organizational structure", category: "team", stage: "during", tier: "premium", icon: "Network" },

  // I - Innovation & IP
  { id: "innovation-score", name: "Innovation Score Calculator", description: "Calculate innovation score against criteria", category: "innovation", stage: "before", tier: "premium", icon: "Lightbulb" },
  { id: "innovation-validation", name: "Innovation Validation Report", description: "Generate innovation validation report", category: "innovation", stage: "before", tier: "enterprise", icon: "Zap" },
  { id: "ip-strategy", name: "IP & Patent Strategy Advisor", description: "Develop IP and patent strategy", category: "innovation", stage: "before", tier: "enterprise", icon: "Shield" },
  { id: "ip-roadmap", name: "IP Registration Roadmap", description: "Plan IP registration and protection", category: "innovation", stage: "before", tier: "enterprise", icon: "Map" },
  { id: "ip-audit", name: "Intellectual Property Audit", description: "Audit existing IP and identify gaps", category: "innovation", stage: "before", tier: "enterprise", icon: "Audit" },

  // J - Journey & Jurisdiction
  { id: "visa-timeline", name: "Visa Journey Timeline Planner", description: "Plan visa application timeline and milestones", category: "documentation", stage: "before", tier: "free", icon: "Calendar" },
  { id: "jurisdiction-checker", name: "UK Jurisdiction & Eligibility Checker", description: "Verify UK jurisdiction and visa eligibility", category: "compliance", stage: "before", tier: "free", icon: "MapPin" },
  { id: "visa-status-tracker", name: "Visa Status Tracker", description: "Track visa application status in real-time", category: "documentation", stage: "during", tier: "premium", icon: "Clock" },
  { id: "settlement-guide", name: "Post-Approval Settlement Guide", description: "Guide for post-visa settlement and setup", category: "documentation", stage: "after", tier: "premium", icon: "Home" },

  // K - KPI & Key Metrics
  { id: "kpi-dashboard", name: "KPI Dashboard", description: "Monitor key performance indicators", category: "business", stage: "during", tier: "premium", icon: "Gauge" },
  { id: "milestones-tracker", name: "Key Milestones Tracker", description: "Track business milestones and achievements", category: "business", stage: "after", tier: "premium", icon: "Flag" },
  { id: "performance-bench", name: "Performance Benchmarking", description: "Benchmark against industry standards", category: "growth", stage: "after", tier: "enterprise", icon: "BarChart" },
  { id: "success-metrics", name: "Success Metrics Planner", description: "Define and plan success metrics", category: "business", stage: "before", tier: "premium", icon: "Target" },

  // L - Legal & Lawyer
  { id: "legal-compliance", name: "Legal Compliance Guide", description: "Comprehensive UK legal compliance guide", category: "compliance", stage: "before", tier: "premium", icon: "Scale" },
  { id: "lawyer-finder", name: "Lawyer Finder & Booking", description: "Find and book immigration lawyers", category: "documentation", stage: "before", tier: "free", icon: "Users" },
  { id: "legal-templates", name: "Legal Document Templates", description: "Ready-to-use legal document templates", category: "documentation", stage: "during", tier: "premium", icon: "FileText" },
  { id: "regulatory-tracker", name: "Regulatory Requirement Tracker", description: "Track all regulatory requirements", category: "compliance", stage: "during", tier: "premium", icon: "CheckCircle" },

  // M - Market Research & Analysis
  { id: "market-analysis", name: "Market Analysis Report Generator", description: "Generate comprehensive market analysis reports", category: "business", stage: "before", tier: "premium", icon: "TrendingUp" },
  { id: "market-gap", name: "Market Gap Analyzer", description: "Identify and analyze market gaps", category: "innovation", stage: "before", tier: "premium", icon: "Zap" },
  { id: "market-research", name: "Market Research Compiler", description: "Compile market research data and insights", category: "business", stage: "before", tier: "premium", icon: "Search" },
  { id: "competitor-bench", name: "Competitor Benchmarking", description: "Benchmark against competitors", category: "business", stage: "before", tier: "premium", icon: "Users" },
  { id: "market-size", name: "Market Size Calculator", description: "Calculate market size and opportunity", category: "business", stage: "before", tier: "premium", icon: "Globe" },

  // N - Narrative & Pitch
  { id: "narrative-builder", name: "Narrative Builder", description: "Build compelling business narrative", category: "documentation", stage: "during", tier: "premium", icon: "BookOpen" },
  { id: "pitch-deck", name: "Pitch Deck Generator", description: "Generate professional pitch deck", category: "documentation", stage: "during", tier: "enterprise", icon: "Presentation" },
  { id: "exec-summary", name: "Executive Summary Creator", description: "Create compelling executive summary", category: "documentation", stage: "during", tier: "premium", icon: "Briefcase" },
  { id: "pitch-coach", name: "Pitch Practice Coach", description: "AI coaching for pitch practice", category: "documentation", stage: "during", tier: "enterprise", icon: "Mic" },

  // O - Operations & Organization
  { id: "operations-plan", name: "Operations Plan Builder", description: "Build comprehensive operations plan", category: "business", stage: "during", tier: "premium", icon: "Cog" },
  { id: "org-designer", name: "Organizational Structure Designer", description: "Design optimal organizational structure", category: "team", stage: "before", tier: "premium", icon: "Network" },
  { id: "process-docs", name: "Process Documentation Tool", description: "Document business processes", category: "documentation", stage: "during", tier: "premium", icon: "FileText" },
  { id: "supply-chain", name: "Supply Chain Planner", description: "Plan supply chain and logistics", category: "business", stage: "during", tier: "enterprise", icon: "Package" },

  // P - Probability & Planning
  { id: "success-predictor", name: "Success Probability Predictor", description: "Predict visa success probability", category: "business", stage: "before", tier: "enterprise", icon: "Zap" },
  { id: "risk-analysis", name: "Risk Analysis & Mitigation", description: "Analyze and mitigate business risks", category: "defense", stage: "during", tier: "premium", icon: "AlertTriangle" },
  { id: "contingency-plan", name: "Contingency Planning Tool", description: "Create contingency and backup plans", category: "business", stage: "before", tier: "premium", icon: "AlertCircle" },
  { id: "roadmap-builder", name: "Project Roadmap Builder", description: "Build detailed project roadmap", category: "business", stage: "during", tier: "premium", icon: "Map" },

  // Q - Q&A & Questions
  { id: "faq-generator", name: "FAQ Generator", description: "Generate FAQs for your business", category: "documentation", stage: "during", tier: "premium", icon: "HelpCircle" },
  { id: "rfe-qa", name: "RFE Q&A Builder", description: "Build Q&A for potential RFE responses", category: "defense", stage: "before", tier: "enterprise", icon: "MessageSquare" },
  { id: "interview-prep", name: "Interview Preparation Guide", description: "Prepare for visa officer interviews", category: "defense", stage: "during", tier: "premium", icon: "Mic" },
  { id: "question-bank", name: "Question Bank for Due Diligence", description: "Pre-built questions for due diligence", category: "documentation", stage: "before", tier: "enterprise", icon: "HelpCircle" },

  // R - Rejection & RFE Defense
  { id: "rejection-analysis", name: "Rejection Analysis Tool", description: "Analyze and learn from visa rejections", category: "defense", stage: "after", tier: "premium", icon: "AlertTriangle" },
  { id: "rfe-defense", name: "RFE Defence Lab", description: "Build defense against RFE challenges", category: "defense", stage: "during", tier: "premium", icon: "Shield" },
  { id: "rebuttal-letter", name: "Rebuttal Letter Generator", description: "Generate strong rebuttal letters", category: "documentation", stage: "after", tier: "enterprise", icon: "FileText" },
  { id: "appeal-strategy", name: "Appeal Strategy Builder", description: "Build strategy for visa appeals", category: "defense", stage: "after", tier: "enterprise", icon: "Scale" },

  // S - Scalability & Scenarios
  { id: "scalability-roadmap", name: "Scalability Roadmap Generator", description: "Generate scalability roadmap", category: "growth", stage: "during", tier: "premium", icon: "TrendingUp" },
  { id: "scenario-planner", name: "Scenario Planner", description: "Plan best/worst case scenarios", category: "business", stage: "before", tier: "premium", icon: "Zap" },
  { id: "settlement-planning", name: "Settlement Planning", description: "Plan post-visa settlement", category: "documentation", stage: "after", tier: "premium", icon: "Home" },
  { id: "site-strategy", name: "Site/Location Strategy", description: "Plan office locations and expansion", category: "business", stage: "during", tier: "premium", icon: "MapPin" },

  // T - Tax & Timeline
  { id: "tax-planning", name: "Tax Planning & Structure Advisor", description: "Plan optimal tax structure", category: "compliance", stage: "before", tier: "premium", icon: "DollarSign" },
  { id: "tax-compliance", name: "Tax Compliance Tracker", description: "Track tax compliance requirements", category: "compliance", stage: "after", tier: "premium", icon: "CheckCircle" },
  { id: "timeline-tracker", name: "Timeline Tracker", description: "Track application timeline stages", category: "documentation", stage: "during", tier: "basic", icon: "Calendar" },
  { id: "milestone-timeline", name: "Milestone Timeline Planner", description: "Plan milestone timelines", category: "business", stage: "before", tier: "premium", icon: "Calendar" },

  // U - Unique Value & Unit Economics
  { id: "uvp-generator", name: "Unique Value Proposition Generator", description: "Generate compelling UVP", category: "innovation", stage: "before", tier: "premium", icon: "Sparkles" },
  { id: "unit-economics", name: "Unit Economics Calculator", description: "Calculate unit economics", category: "financial", stage: "before", tier: "premium", icon: "BarChart" },
  { id: "usp-validator", name: "USP Validator", description: "Validate unique selling proposition", category: "innovation", stage: "before", tier: "enterprise", icon: "Award" },

  // V - Validation & Verification
  { id: "viability-checker", name: "Viability Checker", description: "Check business viability", category: "business", stage: "during", tier: "premium", icon: "CheckCircle" },
  { id: "validation-report", name: "Validation Report Generator", description: "Generate validation reports", category: "documentation", stage: "during", tier: "premium", icon: "FileCheck" },
  { id: "eligibility-validator", name: "Visa Eligibility Validator", description: "Validate visa eligibility", category: "compliance", stage: "before", tier: "free", icon: "CheckCircle" },
  { id: "verification-checklist", name: "Verification Document Checklist", description: "Complete verification checklist", category: "documentation", stage: "during", tier: "free", icon: "CheckList" },

  // W - Weaknesses & Win Probability
  { id: "weakness-analysis", name: "Weakness Analysis & Defense Builder", description: "Identify and defend weaknesses", category: "defense", stage: "before", tier: "enterprise", icon: "AlertTriangle" },
  { id: "win-predictor", name: "Win Probability Predictor", description: "Predict application win probability", category: "business", stage: "before", tier: "enterprise", icon: "Zap" },
  { id: "red-flag-fixer", name: "Red Flag Identifier & Fixer", description: "Identify and fix red flags", category: "defense", stage: "before", tier: "enterprise", icon: "AlertCircle" },
  { id: "strength-scorer", name: "Application Strength Scorer", description: "Score application strength", category: "business", stage: "during", tier: "enterprise", icon: "BarChart" },

  // X - X-Ray Deep Audit
  { id: "deep-xray", name: "Deep Application X-Ray Audit", description: "Deep dive application audit", category: "compliance", stage: "during", tier: "enterprise", icon: "Search" },
  { id: "compliance-xray", name: "Compliance X-Ray Scan", description: "Comprehensive compliance scan", category: "compliance", stage: "before", tier: "enterprise", icon: "Shield" },

  // Y - Year-by-Year Planning
  { id: "year-tracker", name: "Year-by-Year Progress Tracker", description: "Track yearly progress", category: "business", stage: "after", tier: "premium", icon: "Calendar" },
  { id: "yoy-projector", name: "Year-on-Year Growth Projector", description: "Project year-on-year growth", category: "growth", stage: "before", tier: "premium", icon: "TrendingUp" },

  // Z - Zero-to-Approved Roadmap
  { id: "zero-approved", name: "Zero-to-Approved Roadmap", description: "Complete roadmap from zero to visa approved", category: "business", stage: "before", tier: "enterprise", icon: "Map" },
  { id: "zone-planning", name: "Zone Planning", description: "Plan for London/Tier 2 expansion", category: "business", stage: "during", tier: "premium", icon: "MapPin" },
];

export const TIER_DESCRIPTIONS = {
  free: "Free tools to explore and get started with your visa journey",
  basic: "For getting started with UK Innovation Visa - business plan + essentials",
  premium: "Full feature suite for comprehensive visa preparation and business planning",
  enterprise: "Advanced tools for complex applications and maximum success probability",
  ultimate: "Complete access to all 88 tools - everything you could possibly need",
};
