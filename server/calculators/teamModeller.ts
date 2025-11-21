import type { BusinessPlan } from "@shared/schema";

interface HiringStage {
  quarter: string;
  role: string;
  title: string;
  socCode: string;
  annualSalary: number;
  responsibilities: string[];
  skills: string[];
}

interface TeamPlan {
  stages: HiringStage[];
  totalJobsCommitted: number;
  totalFirstYearCost: number;
  gap: string[];
  recommendations: string[];
}

export function generateTeamPlan(plan: BusinessPlan): TeamPlan {
  const stages: HiringStage[] = [];
  let totalCost = 0;

  // Parse hiring plan to extract information
  const hiringPlan = plan.hiringPlan || "";

  // Q1: Typically operations/first hire
  stages.push({
    quarter: "Q1 Year 1",
    role: "Operations Manager",
    title: "Operations Manager",
    socCode: "1135", // Managers and proprietors in other specialist services
    annualSalary: 35000,
    responsibilities: ["Team coordination", "Admin", "Compliance"],
    skills: ["Leadership", "Organization", "Communication"],
  });

  // Q2: Tech hire if applicable
  if (plan.industry.toLowerCase().includes("tech") || plan.industry.toLowerCase().includes("software")) {
    stages.push({
      quarter: "Q2 Year 1",
      role: "Senior Developer",
      title: "Software Engineer",
      socCode: "2135", // Software developers and analysts
      annualSalary: 55000,
      responsibilities: ["Product development", "Architecture", "Code quality"],
      skills: ["JavaScript/Python", "System design", "Testing"],
    });
  }

  // Q3: Sales/Business Development
  stages.push({
    quarter: "Q3 Year 1",
    role: "Business Development",
    title: "Sales Manager",
    socCode: "3544", // Sales and retail assistants
    annualSalary: 32000,
    responsibilities: ["Customer acquisition", "Sales", "Partnerships"],
    skills: ["Sales", "Communication", "Negotiation"],
  });

  // Q4: Additional specialist
  if (plan.jobCreation >= 4) {
    stages.push({
      quarter: "Q4 Year 1",
      role: "Specialist",
      title: "Product Manager",
      socCode: "2431", // Management consultants and similar professionals
      annualSalary: 50000,
      responsibilities: ["Product strategy", "User research", "Roadmap"],
      skills: ["Analytics", "User empathy", "Strategy"],
    });
  }

  // Calculate costs
  stages.forEach(stage => {
    totalCost += stage.annualSalary;
  });

  // Identify gaps
  const gaps = identifyGaps(plan, stages);
  const recommendations = generateRecommendations(plan, stages);

  return {
    stages,
    totalJobsCommitted: plan.jobCreation,
    totalFirstYearCost: totalCost,
    gap: gaps,
    recommendations,
  };
}

function identifyGaps(plan: BusinessPlan, stages: HiringStage[]): string[] {
  const gaps: string[] = [];

  // Technical gap
  if (!plan.founderWorkHistory?.toLowerCase().includes("engineer") &&
      !plan.founderWorkHistory?.toLowerCase().includes("developer")) {
    gaps.push("Technical expertise gap - hiring senior developer critical");
  }

  // Sales/marketing gap
  if (!plan.founderWorkHistory?.toLowerCase().includes("sales") &&
      !plan.founderWorkHistory?.toLowerCase().includes("marketing")) {
    gaps.push("Go-to-market gap - business development hiring recommended");
  }

  // Finance gap
  if (!plan.founderWorkHistory?.toLowerCase().includes("finance") &&
      !plan.founderWorkHistory?.toLowerCase().includes("cfo")) {
    gaps.push("Finance/operations gap - CFO or finance hire important");
  }

  // Scalability gap
  if (plan.jobCreation > stages.length + 1) {
    gaps.push(`Scale gap - committed to ${plan.jobCreation} jobs but only planned ${stages.length} hires`);
  }

  return gaps;
}

function generateRecommendations(plan: BusinessPlan, stages: HiringStage[]): string[] {
  const recommendations: string[] = [];

  // Based on job creation commitment
  if (plan.jobCreation >= 5) {
    recommendations.push("Consider hiring contractor network before full-time team");
    recommendations.push("Establish clear equity/bonus structure to attract talent");
  }

  // Based on industry
  if (plan.industry.toLowerCase().includes("ai")) {
    recommendations.push("Prioritize hiring ML engineers - highest salary requirement");
  }

  if (plan.industry.toLowerCase().includes("fintech")) {
    recommendations.push("Budget for compliance officer (regulatory background)");
  }

  // Based on location
  if (plan.specificRegions?.toLowerCase().includes("london")) {
    recommendations.push("Budget +20% for London-based salaries");
  }

  // Tax/compliance
  recommendations.push("Register as Employer for PAYE - required by immigration");
  recommendations.push("Document all hiring as evidence of job creation commitment");

  return recommendations;
}

interface SkillAssessment {
  founderSkills: string[];
  requiredSkills: string[];
  strengths: string[];
  gaps: string[];
  hiringSuggestions: string[];
}

export function assessTeamSkills(plan: BusinessPlan): SkillAssessment {
  const founderSkills = extractSkills(plan.founderWorkHistory || "");
  const requiredSkills = getRequiredSkills(plan.industry);

  const strengths = founderSkills.filter(s => requiredSkills.includes(s));
  const gaps = requiredSkills.filter(s => !founderSkills.includes(s));

  const hiringSuggestions = gaps.map(gap => {
    if (gap.includes("Technical")) return "Hire CTO or Senior Engineer";
    if (gap.includes("Sales")) return "Hire Head of Sales or BD Lead";
    if (gap.includes("Finance")) return "Hire Finance Manager or CFO";
    if (gap.includes("Operations")) return "Hire Operations Manager";
    return `Hire specialist in ${gap}`;
  });

  return {
    founderSkills,
    requiredSkills,
    strengths,
    gaps,
    hiringSuggestions,
  };
}

function extractSkills(text: string): string[] {
  const skills: string[] = [];
  const skillPatterns = [
    { pattern: /engineer|developer|coding|python|javascript/i, skill: "Technical" },
    { pattern: /sales|marketing|business development|growth/i, skill: "Sales & Growth" },
    { pattern: /finance|accounting|budgeting|cfo/i, skill: "Finance" },
    { pattern: /operations|management|coordination|logistics/i, skill: "Operations" },
    { pattern: /strategy|planning|leadership|ceo|founder/i, skill: "Strategy & Leadership" },
  ];

  skillPatterns.forEach(({ pattern, skill }) => {
    if (pattern.test(text)) skills.push(skill);
  });

  return skills;
}

function getRequiredSkills(industry: string): string[] {
  const baseSkills = ["Strategy & Leadership", "Operations", "Finance"];

  if (industry.toLowerCase().includes("tech") || industry.toLowerCase().includes("software")) {
    baseSkills.push("Technical");
  }

  if (!industry.toLowerCase().includes("b2b")) {
    baseSkills.push("Sales & Growth");
  }

  return baseSkills;
}
