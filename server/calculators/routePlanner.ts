import type { BusinessPlan } from "@shared/schema";

interface VisaRoute {
  id: string;
  name: string;
  minCapital: number;
  minTraction: "none" | "mvp" | "revenue" | "profitable";
  timeline: string;
  requirements: string[];
  successProbability: number;
  pros: string[];
  cons: string[];
}

const VISA_ROUTES: Record<string, VisaRoute> = {
  "innovator-founder": {
    id: "innovator-founder",
    name: "UK Innovation Founder Visa",
    minCapital: 0,
    minTraction: "none",
    timeline: "8-12 weeks",
    requirements: [
      "Endorsement from approved body (Tech Nation, etc.)",
      "Innovative business idea",
      "Full-time commitment",
      "No cash injection requirement",
    ],
    successProbability: 0.75,
    pros: [
      "No capital injection required",
      "Can start pre-revenue",
      "Build to IPO potential",
      "Route to ILR after 3 years",
    ],
    cons: [
      "Requires endorser approval (competitive)",
      "Must hire UK team",
      "Strict compliance requirements",
      "Limited to business visas",
    ],
  },
  "skilled-worker": {
    id: "skilled-worker",
    name: "Skilled Worker Sponsor (Employment)",
    minCapital: 10000,
    minTraction: "mvp",
    timeline: "4-8 weeks",
    requirements: [
      "UK employer sponsor license",
      "Shortage occupation code (SOC 2020)",
      "Certificate of Sponsorship",
      "Salary threshold (£27,000+)",
      "Approved job",
    ],
    successProbability: 0.9,
    pros: [
      "Higher approval rate",
      "Faster processing",
      "Points-based system clarity",
      "Clear ILR pathway",
    ],
    cons: [
      "Requires established UK company",
      "Salary threshold limitations",
      "Sponsor compliance burden",
      "Limited flexibility post-visa",
    ],
  },
  "global-talent": {
    id: "global-talent",
    name: "Global Talent Visa (Exceptional Talent)",
    minCapital: 5000,
    minTraction: "revenue",
    timeline: "6-10 weeks",
    requirements: [
      "Recognised talent in field",
      "Award/publication/media coverage",
      "Endorsement from tech body",
      "Plan to contribute to UK",
    ],
    successProbability: 0.6,
    pros: [
      "No sponsorship needed",
      "Flexible post-visa plans",
      "Premium talent recognition",
      "Route to ILR in 3 years",
    ],
    cons: [
      "Strict talent criteria",
      "Competitive endorsement",
      "Evidence of recognition required",
      "Limited to exceptional cases",
    ],
  },
  "scale-up": {
    id: "scale-up",
    name: "Scale-up Visa (Growth Investment)",
    minCapital: 50000,
    minTraction: "revenue",
    timeline: "4-6 weeks",
    requirements: [
      "Scale-up recommendation letter",
      "Pre-revenue growth metrics",
      "Experienced founder/CTO",
      "Equity stake required",
    ],
    successProbability: 0.8,
    pros: [
      "Faster processing",
      "Designed for founders",
      "Investor-backed pathway",
      "Clear growth metrics",
    ],
    cons: [
      "Requires scale-up recommendation",
      "Limited to accelerators",
      "Geographic restrictions",
      "ILR not available immediately",
    ],
  },
};

export function analyzeVisaRoutes(plan: BusinessPlan) {
  const routes: any[] = [];

  // Score each route for the business profile
  for (const [id, route] of Object.entries(VISA_ROUTES)) {
    const score = scoreRouteForPlan(plan, route);
    const feasibility = assessFeasibility(plan, route);

    routes.push({
      ...route,
      score,
      feasibility,
      fitAnalysis: generateRouteAnalysis(plan, route, score),
    });
  }

  // Sort by score
  routes.sort((a, b) => b.score - a.score);

  return routes;
}

function scoreRouteForPlan(plan: BusinessPlan, route: VisaRoute): number {
  let score = 50;

  // Capital requirements
  if (plan.funding >= route.minCapital) score += 15;
  else score -= 10;

  // Traction fit
  const tractionLevel = assessTraction(plan);
  if (
    (route.minTraction === "none") ||
    (route.minTraction === "mvp" && (tractionLevel === "mvp" || tractionLevel === "revenue")) ||
    (route.minTraction === "revenue" && tractionLevel === "revenue")
  ) {
    score += 20;
  } else {
    score -= 15;
  }

  // Success probability adjustment
  score = Math.round(score * (route.successProbability / 0.75));

  return Math.min(100, Math.max(0, score));
}

function assessTraction(plan: BusinessPlan): "none" | "mvp" | "revenue" {
  if (plan.revenue && plan.revenue.toLowerCase() !== "none") {
    return "revenue";
  }
  if (plan.productStatus?.toLowerCase().includes("complete") || plan.innovationStage === "market-validation") {
    return "mvp";
  }
  return "none";
}

function assessFeasibility(plan: BusinessPlan, route: VisaRoute): "high" | "medium" | "low" {
  let score = 0;

  // Check each requirement
  for (const req of route.requirements) {
    if (req.toLowerCase().includes("endorsement")) {
      // Check if targeting correct endorser
      if (plan.targetEndorser) score += 1;
    }
    if (req.toLowerCase().includes("capital")) {
      if (plan.funding >= route.minCapital) score += 1;
    }
    if (req.toLowerCase().includes("salary")) {
      // Estimate potential salary from projections
      const salary = estimateSalary(plan);
      if (salary >= 27000) score += 1;
    }
  }

  const ratio = score / route.requirements.length;
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.5) return "medium";
  return "low";
}

function estimateSalary(plan: BusinessPlan): number {
  // Estimate annual salary from revenue projections
  if (!plan.monthlyProjections) return 0;
  try {
    const monthly = parseFloat(plan.monthlyProjections.split(",")[0]);
    return monthly * 12 * 0.3; // Assume 30% to founder salary
  } catch {
    return 0;
  }
}

function generateRouteAnalysis(plan: BusinessPlan, route: VisaRoute, score: number): string[] {
  const analysis: string[] = [];

  if (score >= 75) {
    analysis.push(`✓ Excellent fit for ${route.name}`);
  } else if (score >= 60) {
    analysis.push(`~ Good fit for ${route.name}, but needs improvements`);
  } else {
    analysis.push(`✗ Challenging fit - may need stronger evidence`);
  }

  // Specific guidance
  if (route.id === "innovator-founder") {
    if (!plan.patentStatus || plan.patentStatus.includes("none")) {
      analysis.push("Consider filing a patent or utility model to strengthen innovation narrative");
    }
  }

  if (route.id === "skilled-worker") {
    const salary = estimateSalary(plan);
    if (salary < 27000) {
      analysis.push("Increase salary projections to meet £27,000 minimum");
    }
  }

  if (route.id === "global-talent") {
    analysis.push("Ensure you have published work, awards, or significant media coverage");
  }

  if (route.id === "scale-up") {
    if (!plan.funding || plan.funding < 50000) {
      analysis.push("Seek investment backing from recognized accelerators");
    }
  }

  return analysis;
}

export function compareRoutes(plan: BusinessPlan) {
  const routes = analyzeVisaRoutes(plan);

  return {
    recommended: routes[0],
    allRoutes: routes,
    summary: `Based on your business profile, ${routes[0].name} is the best fit with a ${routes[0].score}/100 score. However, ${routes[1]?.name} is also viable (${routes[1]?.score}/100).`,
  };
}
