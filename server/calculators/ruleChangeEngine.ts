interface HomeOfficeRule {
  id: string;
  category: string;
  title: string;
  content: string;
  effectiveDate: string;
  impact: "high" | "medium" | "low";
  affectedVentures: string[];
}

const CURRENT_RULES: HomeOfficeRule[] = [
  {
    id: "rule_001",
    category: "Job Creation",
    title: "Job Creation Requirement (2024)",
    content: "Founders must commit to creating 5+ full-time UK jobs within 3 years of visa grant.",
    effectiveDate: "2024-01-01",
    impact: "high",
    affectedVentures: ["all"],
  },
  {
    id: "rule_002",
    category: "Financial Requirements",
    title: "Minimum Capital Requirement (Removed)",
    content: "No minimum capital requirement for Innovation Founder visa - previously £50k. Now £0+.",
    effectiveDate: "2023-06-01",
    impact: "high",
    affectedVentures: ["pre-revenue", "bootstrapped"],
  },
  {
    id: "rule_003",
    category: "Endorsement",
    title: "Endorsing Body Standards",
    content: "Endorsing bodies must provide written confirmation of innovation, viability, and scalability.",
    effectiveDate: "2024-03-15",
    impact: "medium",
    affectedVentures: ["all"],
  },
  {
    id: "rule_004",
    category: "Extension Requirements",
    title: "ILR Eligibility (3-Year Track Record)",
    content: "Must demonstrate job creation, revenue growth, and compliance for ILR after 3 years.",
    effectiveDate: "2024-01-01",
    impact: "high",
    affectedVentures: ["all"],
  },
  {
    id: "rule_005",
    category: "Compliance",
    title: "GDPR & Data Protection",
    content: "All data handling must comply with UK GDPR and be documented in privacy policy.",
    effectiveDate: "2023-01-01",
    impact: "medium",
    affectedVentures: ["data-intensive"],
  },
];

interface RuleChange {
  previousRule: HomeOfficeRule | null;
  newRule: HomeOfficeRule;
  changeType: "new" | "modified" | "removed";
  impact: string[];
  actionItems: string[];
}

export function getApplicableRules(businessProfile: {
  industry: string;
  stage: string;
  funding: number;
}): HomeOfficeRule[] {
  return CURRENT_RULES.filter(rule => {
    if (rule.affectedVentures.includes("all")) return true;
    if (rule.affectedVentures.includes(businessProfile.stage)) return true;
    if (businessProfile.funding === 0 && rule.affectedVentures.includes("bootstrapped"))
      return true;
    if (
      businessProfile.industry.toLowerCase().includes("data") &&
      rule.affectedVentures.includes("data-intensive")
    )
      return true;
    return false;
  });
}

export function analyzeRuleImpact(
  businessProfile: any,
  newRule: HomeOfficeRule
): RuleChange {
  const previousRule: HomeOfficeRule | null = null; // In real app, look up from version control

  const impact: string[] = [];
  const actionItems: string[] = [];

  // Analyze impact
  if (newRule.category === "Job Creation") {
    if (businessProfile.jobCreation < 5) {
      impact.push("Your current job creation plan does not meet requirement");
      actionItems.push("Increase hiring commitment to 5+ FT positions");
      actionItems.push("Document roles with UK SOC codes");
    } else {
      impact.push("✓ Your profile meets job creation requirement");
    }
  }

  if (newRule.category === "Financial Requirements") {
    if (businessProfile.funding === 0) {
      impact.push("✓ No capital requirement - removes barrier for pre-revenue ventures");
      actionItems.push("Consider seed fundraising to strengthen viability");
    }
  }

  if (newRule.category === "Endorsement") {
    actionItems.push("Ensure endorser provides written confirmation of all 3 criteria");
    actionItems.push("Request detailed feedback on innovation/viability/scalability assessment");
  }

  if (newRule.category === "Extension Requirements") {
    actionItems.push("Plan for post-visa compliance monitoring");
    actionItems.push("Track job creation, revenue, and team growth quarterly");
  }

  return {
    previousRule,
    newRule,
    changeType: "new",
    impact,
    actionItems,
  };
}

export function generateRuleDiff(previousVersion: string, currentVersion: string): string[] {
  const changes: string[] = [];

  // In real implementation, parse rule versions and compare
  changes.push("✓ Rule comparison framework ready for implementation");

  return changes;
}

export interface RuleEngineStatus {
  lastChecked: string;
  rulesCount: number;
  applicableRules: HomeOfficeRule[];
  criticalChanges: RuleChange[];
  recommendation: string;
}

export function getRuleEngineStatus(businessProfile: any): RuleEngineStatus {
  const applicableRules = getApplicableRules(businessProfile);
  const criticalChanges: RuleChange[] = [];

  // Analyze critical rules
  for (const rule of applicableRules.filter(r => r.impact === "high")) {
    criticalChanges.push(analyzeRuleImpact(businessProfile, rule));
  }

  const recommendation =
    criticalChanges.length > 0
      ? `⚠️ ${criticalChanges.length} critical rules require attention`
      : "✓ Your profile complies with current Home Office rules";

  return {
    lastChecked: new Date().toISOString(),
    rulesCount: CURRENT_RULES.length,
    applicableRules,
    criticalChanges,
    recommendation,
  };
}
