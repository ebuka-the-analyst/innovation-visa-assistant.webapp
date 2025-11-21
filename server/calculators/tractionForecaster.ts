import type { BusinessPlan } from "@shared/schema";

interface ComparableVenture {
  name: string;
  industry: string;
  yearOfFounding: number;
  months_1_revenue: number;
  months_12_revenue: number;
  months_24_revenue: number;
  months_36_revenue: number;
}

// Sample comparable ventures database
const COMPARABLE_VENTURES: ComparableVenture[] = [
  {
    name: "SaaS Unicorn A",
    industry: "SaaS",
    yearOfFounding: 2015,
    months_1_revenue: 5000,
    months_12_revenue: 150000,
    months_24_revenue: 500000,
    months_36_revenue: 1500000,
  },
  {
    name: "FinTech B",
    industry: "FinTech",
    yearOfFounding: 2016,
    months_1_revenue: 0,
    months_12_revenue: 80000,
    months_24_revenue: 300000,
    months_36_revenue: 1000000,
  },
  {
    name: "AI Platform C",
    industry: "AI/ML",
    yearOfFounding: 2017,
    months_1_revenue: 0,
    months_12_revenue: 200000,
    months_24_revenue: 800000,
    months_36_revenue: 2500000,
  },
  {
    name: "CleanTech D",
    industry: "CleanTech",
    yearOfFounding: 2016,
    months_1_revenue: 0,
    months_12_revenue: 50000,
    months_24_revenue: 200000,
    months_36_revenue: 600000,
  },
];

interface TractionForecast {
  userProjection: {
    months_1: number;
    months_12: number;
    months_24: number;
    months_36: number;
  };
  comparableRange: {
    months_1: { low: number; high: number };
    months_12: { low: number; high: number };
    months_24: { low: number; high: number };
    months_36: { low: number; high: number };
  };
  assessment: string[];
  recommendations: string[];
}

export function forecastTraction(plan: BusinessPlan): TractionForecast {
  // Extract user projections
  const userProjection = parseProjections(plan.monthlyProjections || "");

  // Find comparable ventures
  const comparables = findComparables(plan);

  // Calculate range
  const comparableRange = calculateComparableRange(comparables);

  // Assessment
  const assessment = assessProjectionRealism(userProjection, comparableRange);
  const recommendations = generateRecommendations(userProjection, comparableRange, plan);

  return {
    userProjection,
    comparableRange,
    assessment,
    recommendations,
  };
}

function parseProjections(monthlyStr: string): {
  months_1: number;
  months_12: number;
  months_24: number;
  months_36: number;
} {
  try {
    const values = monthlyStr.split(",").map(v => parseInt(v.trim()) || 0);
    return {
      months_1: values[0] || 0,
      months_12: values[11] || (values[0] * 12 * 0.5),
      months_24: values[23] || (values[0] * 24 * 0.3),
      months_36: values[35] || (values[0] * 36 * 0.2),
    };
  } catch {
    return { months_1: 0, months_12: 50000, months_24: 150000, months_36: 300000 };
  }
}

function findComparables(plan: BusinessPlan): ComparableVenture[] {
  return COMPARABLE_VENTURES.filter(venture => {
    const industryMatch = plan.industry.toLowerCase().includes(venture.industry.toLowerCase()) ||
                         venture.industry.toLowerCase().includes(plan.industry.toLowerCase());
    return industryMatch;
  }).slice(0, 3);
}

function calculateComparableRange(comparables: ComparableVenture[]) {
  if (comparables.length === 0) {
    return {
      months_1: { low: 0, high: 10000 },
      months_12: { low: 100000, high: 500000 },
      months_24: { low: 300000, high: 1500000 },
      months_36: { low: 1000000, high: 5000000 },
    };
  }

  const revenues = {
    months_1: comparables.map(v => v.months_1_revenue),
    months_12: comparables.map(v => v.months_12_revenue),
    months_24: comparables.map(v => v.months_24_revenue),
    months_36: comparables.map(v => v.months_36_revenue),
  };

  return {
    months_1: { low: Math.min(...revenues.months_1), high: Math.max(...revenues.months_1) },
    months_12: { low: Math.min(...revenues.months_12), high: Math.max(...revenues.months_12) },
    months_24: { low: Math.min(...revenues.months_24), high: Math.max(...revenues.months_24) },
    months_36: { low: Math.min(...revenues.months_36), high: Math.max(...revenues.months_36) },
  };
}

function assessProjectionRealism(
  userProjection: any,
  comparableRange: any
): string[] {
  const assessment: string[] = [];

  // Month 1
  if (userProjection.months_1 > comparableRange.months_1.high) {
    assessment.push("⚠️ Month 1 revenue projection is optimistic vs. comparable ventures");
  } else if (userProjection.months_1 === 0 && comparableRange.months_1.low > 0) {
    assessment.push("✓ Conservative Month 1 assumption (most ventures start at $0)");
  }

  // Year 1
  if (userProjection.months_12 > comparableRange.months_12.high * 1.5) {
    assessment.push("⚠️ Year 1 revenue is aggressive - consider reducing by 30-40%");
  } else if (
    userProjection.months_12 >= comparableRange.months_12.low &&
    userProjection.months_12 <= comparableRange.months_12.high
  ) {
    assessment.push("✓ Year 1 projection aligns with comparable ventures");
  }

  // Year 2-3
  if (userProjection.months_36 > comparableRange.months_36.high * 2) {
    assessment.push("✗ Year 3 projection significantly exceeds industry benchmarks");
  } else if (
    userProjection.months_36 >= comparableRange.months_36.low &&
    userProjection.months_36 <= comparableRange.months_36.high * 1.2
  ) {
    assessment.push("✓ 3-year trajectory is realistic and defensible");
  }

  return assessment;
}

function generateRecommendations(
  userProjection: any,
  comparableRange: any,
  plan: BusinessPlan
): string[] {
  const recommendations: string[] = [];

  // If too aggressive
  if (userProjection.months_12 > comparableRange.months_12.high) {
    recommendations.push("Reduce Year 1 projections to 80% of current to improve credibility");
    recommendations.push("Add pilot revenue or LOIs as validation");
  }

  // Funding check
  if (plan.funding < 50000 && userProjection.months_36 > 1000000) {
    recommendations.push("Secure additional funding - current capital insufficient for growth targets");
  }

  // Team check
  if (plan.jobCreation < 3 && userProjection.months_36 > 500000) {
    recommendations.push("Expand hiring plan - revenue growth requires team scaling");
  }

  recommendations.push("Use benchmark data to defend projections to endorsers");

  return recommendations;
}
