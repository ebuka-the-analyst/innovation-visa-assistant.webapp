import type { BusinessPlan } from "@shared/schema";

interface EndorserProfile {
  name: string;
  riskTolerance: "high" | "medium" | "low";
  sectorPreferences: string[];
  innovationWeight: number;
  viabilityWeight: number;
  scalabilityWeight: number;
}

const ENDORSERS: Record<string, EndorserProfile> = {
  "tech-nation": {
    name: "Tech Nation (2025)",
    riskTolerance: "high",
    sectorPreferences: ["AI/ML", "FinTech", "SaaS", "Cyber Security", "Deep Tech", "Climate Tech"],
    innovationWeight: 0.4,
    viabilityWeight: 0.35,
    scalabilityWeight: 0.25,
  },
  "innovator-intl": {
    name: "Innovator International (2025)",
    riskTolerance: "medium",
    sectorPreferences: ["Any innovative business", "Tech-enabled services", "B2B/B2C platforms"],
    innovationWeight: 0.35,
    viabilityWeight: 0.4,
    scalabilityWeight: 0.25,
  },
  "university": {
    name: "UK University Routes (2025)",
    riskTolerance: "low",
    sectorPreferences: ["Research-backed innovation", "Deep Tech", "Academic spinouts"],
    innovationWeight: 0.5,
    viabilityWeight: 0.25,
    scalabilityWeight: 0.25,
  },
  "envestors": {
    name: "Envestors (2025)",
    riskTolerance: "high",
    sectorPreferences: ["Growth-stage startups", "Revenue-generating businesses", "All sectors"],
    innovationWeight: 0.3,
    viabilityWeight: 0.35,
    scalabilityWeight: 0.35,
  },
  "global-talent": {
    name: "Global Talent Visa Route (2025)",
    riskTolerance: "medium",
    sectorPreferences: ["Exceptional talent in tech", "Recognized expertise", "International leaders"],
    innovationWeight: 0.35,
    viabilityWeight: 0.30,
    scalabilityWeight: 0.35,
  },
  "scale-up": {
    name: "Scale-up Visa (2025)",
    riskTolerance: "high",
    sectorPreferences: ["High-growth companies", "Pre-revenue to scaling stage"],
    innovationWeight: 0.30,
    viabilityWeight: 0.40,
    scalabilityWeight: 0.30,
  },
};

export function scoreBusinessPlanForEndorser(plan: BusinessPlan, endorserId: string) {
  const endorser = ENDORSERS[endorserId];
  if (!endorser) throw new Error("Endorser not found");

  // Calculate innovation score (0-100)
  const innovationScore = calculateInnovationScore(plan);
  
  // Calculate viability score (0-100)
  const viabilityScore = calculateViabilityScore(plan);
  
  // Calculate scalability score (0-100)
  const scalabilityScore = calculateScalabilityScore(plan);

  // Weighted total
  const totalScore = Math.round(
    innovationScore * endorser.innovationWeight +
    viabilityScore * endorser.viabilityWeight +
    scalabilityScore * endorser.scalabilityWeight
  );

  // Sector fit
  const sectorFit = endorser.sectorPreferences.includes("Any") || 
                   endorser.sectorPreferences.some(pref => plan.industry.toLowerCase().includes(pref.toLowerCase()));

  // Risk assessment
  const riskLevel = assessRisk(plan, endorser.riskTolerance);

  // Narrative feedback
  const feedback = generateFeedback(endorser, { innovationScore, viabilityScore, scalabilityScore }, sectorFit, riskLevel);

  return {
    endorserId,
    endorserName: endorser.name,
    totalScore,
    breakdown: { innovationScore, viabilityScore, scalabilityScore },
    sectorFit,
    riskLevel,
    recommendation: totalScore >= 75 ? "Strong fit" : totalScore >= 60 ? "Moderate fit" : "Weak fit",
    feedback,
  };
}

function calculateInnovationScore(plan: BusinessPlan): number {
  let score = 50; // baseline

  // Patent/IP status
  if (plan.patentStatus?.toLowerCase().includes("patent filed")) score += 15;
  if (plan.patentStatus?.toLowerCase().includes("pending")) score += 10;

  // Differentiation clarity
  if (plan.uniqueness?.length > 100) score += 10;
  if (plan.uniqueness?.toLowerCase().includes("proprietary")) score += 5;

  // Tech complexity
  if (plan.aiMethodology?.length > 50) score += 10;
  if (plan.dataArchitecture?.length > 50) score += 5;

  // Customer validation
  if (plan.existingCustomers?.toLowerCase().includes("yes")) score += 10;

  return Math.min(100, score);
}

function calculateViabilityScore(plan: BusinessPlan): number {
  let score = 50;

  // Financial health
  const ltv = plan.lifetimeValue || 0;
  const cac = plan.customerAcquisitionCost || 1;
  const ltvCacRatio = ltv / cac;
  
  if (ltvCacRatio >= 3) score += 15;
  else if (ltvCacRatio >= 2) score += 10;
  else score += 5;

  // Funding
  if (plan.funding >= 50000) score += 10;
  if (plan.fundingSources?.includes("investor")) score += 5;

  // Revenue model clarity
  if (plan.revenue?.length > 50) score += 10;

  // Payback period
  if (plan.paybackPeriod <= 12) score += 10;
  else if (plan.paybackPeriod <= 24) score += 5;

  return Math.min(100, score);
}

function calculateScalabilityScore(plan: BusinessPlan): number {
  let score = 50;

  // Job creation commitment
  if (plan.jobCreation >= 5) score += 15;
  else if (plan.jobCreation >= 3) score += 10;
  else score += 5;

  // Market size
  if (plan.marketSize?.toLowerCase().includes("billion")) score += 15;
  else if (plan.marketSize?.toLowerCase().includes("million")) score += 10;

  // Expansion strategy
  if (plan.expansion?.length > 50) score += 10;

  // International plans
  if (plan.internationalPlan && plan.internationalPlan.length > 20) score += 10;

  return Math.min(100, score);
}

function assessRisk(plan: BusinessPlan, tolerance: "high" | "medium" | "low"): string {
  let riskFactors = 0;

  // Pre-revenue
  if (!plan.revenue || plan.revenue.toLowerCase().includes("none")) riskFactors += 2;

  // No existing customers
  if (!plan.existingCustomers || plan.existingCustomers.toLowerCase().includes("no")) riskFactors += 2;

  // Low funding
  if (plan.funding < 10000) riskFactors += 2;

  // Unproven market
  if (!plan.customerInterviews || plan.customerInterviews.length < 50) riskFactors += 1;

  let riskLevel = "High";
  if (riskFactors <= 2) riskLevel = "Low";
  else if (riskFactors <= 4) riskLevel = "Medium";

  return riskLevel;
}

function generateFeedback(
  endorser: EndorserProfile,
  scores: Record<string, number>,
  sectorFit: boolean,
  riskLevel: string
): string[] {
  const feedback: string[] = [];

  if (!sectorFit) {
    feedback.push(`⚠️ Your industry may not align with ${endorser.name}'s typical investments. Consider repositioning focus.`);
  }

  if (scores.innovationScore < 60) {
    feedback.push("💡 Strengthen your innovation narrative: highlight unique IP, patents, or differentiation");
  }

  if (scores.viabilityScore < 60) {
    feedback.push("📊 Improve viability evidence: target 3:1 LTV:CAC ratio and validate with pilot customers");
  }

  if (scores.scalabilityScore < 60) {
    feedback.push("📈 Clarify your scaling plan: detail hiring roadmap, market expansion, and 3-year revenue targets");
  }

  if (riskLevel === "High" && endorser.riskTolerance === "low") {
    feedback.push("⚠️ Your profile presents higher risk than this endorser typically accepts. De-risk by securing customer pilots or funding.");
  }

  if (feedback.length === 0) {
    feedback.push("✓ Strong fit for this endorser - proceed with application");
  }

  return feedback;
}

export function getAllEndorsers() {
  return Object.entries(ENDORSERS).map(([id, profile]) => ({
    id,
    name: profile.name,
    riskTolerance: profile.riskTolerance,
    sectorPreferences: profile.sectorPreferences.join(", "),
  }));
}
