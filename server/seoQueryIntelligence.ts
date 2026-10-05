export type SeoIntentCluster =
  | "business-plan"
  | "endorsement"
  | "eligibility"
  | "application-support"
  | "interview"
  | "settlement"
  | "success-rate"
  | "general-innovator-founder"
  | "other";

export type SeoSearchIntent = "commercial" | "informational" | "mixed";

export type SeoContentDecision =
  | "ignore"
  | "optimise-existing"
  | "support-existing"
  | "new-content";

export type SeoQueryIntelligence = {
  qualified: boolean;
  qualificationReason: string;
  cluster: SeoIntentCluster;
  intent: SeoSearchIntent;
  recommendedPath: string;
};

const JUNK_EXACT = new Set([
  "yes",
  "no",
  "ok",
  "okay",
  "test",
  "home",
  "1",
  "2",
  "3",
]);

const DOMAIN_TERMS = [
  "innovator",
  "innovative founder",
  "innovation founder",
  "founder visa",
  "visa",
  "business plan",
  "endorsement",
  "endorsing",
];

const COMMERCIAL_TERMS = [
  "help",
  "support",
  "assistance",
  "advice",
  "consultant",
  "service",
  "business plan help",
  "application help",
  "endorsement support",
];

const INFORMATIONAL_TERMS = [
  "how",
  "what",
  "requirements",
  "requirement",
  "eligibility",
  "template",
  "guide",
  "success rate",
  "funds",
  "settlement",
  "interview",
];

export function normaliseSeoQuery(query: string): string {
  return String(query || "")
    .toLowerCase()
    .replace(/[“”"'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normaliseSearchConsolePath(page: string): string {
  const raw = String(page || "").trim();
  if (!raw) return "";

  try {
    const pathname = new URL(raw).pathname || "/";
    return pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  } catch {
    if (!raw.startsWith("/")) return "";
    return raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }
}

function clusterForQuery(value: string): SeoIntentCluster {
  if (value.includes("business plan")) return "business-plan";
  if (value.includes("endors")) return "endorsement";
  if (
    value.includes("eligib") ||
    value.includes("requirement") ||
    value.includes("funds")
  ) {
    return "eligibility";
  }
  if (value.includes("interview")) return "interview";
  if (value.includes("settlement")) return "settlement";
  if (value.includes("success rate")) return "success-rate";
  if (
    value.includes("help") ||
    value.includes("support") ||
    value.includes("assistance") ||
    value.includes("advice") ||
    value.includes("consultant")
  ) {
    return "application-support";
  }
  if (
    value.includes("innovator") ||
    value.includes("founder visa") ||
    value.includes("innovation founder") ||
    value.includes("innovative founder")
  ) {
    return "general-innovator-founder";
  }
  return "other";
}

export function recommendedPathForCluster(cluster: SeoIntentCluster): string {
  switch (cluster) {
    case "business-plan":
      return "/business-plan-template";
    case "endorsement":
      return "/endorsing-bodies";
    case "eligibility":
      return "/eligibility";
    case "application-support":
      return "/";
    case "interview":
    case "settlement":
    case "success-rate":
    case "general-innovator-founder":
    case "other":
    default:
      return "/guide";
  }
}

export function analyseSeoQuery(query: string): SeoQueryIntelligence {
  const value = normaliseSeoQuery(query);
  const words = value.split(" ").filter(Boolean);

  if (!value) {
    return {
      qualified: false,
      qualificationReason: "Empty query",
      cluster: "other",
      intent: "mixed",
      recommendedPath: "/guide",
    };
  }

  if (
    value.length < 4 ||
    /^\d+$/.test(value) ||
    JUNK_EXACT.has(value) ||
    (words.length === 1 && !value.includes("innovator"))
  ) {
    return {
      qualified: false,
      qualificationReason: "Low-signal or navigational noise",
      cluster: "other",
      intent: "mixed",
      recommendedPath: "/guide",
    };
  }

  const domainRelevant = DOMAIN_TERMS.some((term) => value.includes(term));
  const cluster = clusterForQuery(value);
  const commercial = COMMERCIAL_TERMS.some((term) => value.includes(term));
  const informational = INFORMATIONAL_TERMS.some((term) => value.includes(term));

  return {
    qualified: domainRelevant,
    qualificationReason: domainRelevant
      ? "Relevant to the Innovator Founder search mission"
      : "Not specific enough to the Innovator Founder search mission",
    cluster,
    intent: commercial && informational
      ? "mixed"
      : commercial
        ? "commercial"
        : informational
          ? "informational"
          : "mixed",
    recommendedPath: recommendedPathForCluster(cluster),
  };
}

export function chooseSeoContentDecision(args: {
  qualified: boolean;
  cluster: SeoIntentCluster;
  actualPath?: string;
  recommendedPath: string;
  position: number;
}): SeoContentDecision {
  if (!args.qualified) return "ignore";

  const actualPath = normaliseSearchConsolePath(args.actualPath || "");
  if (actualPath && actualPath === args.recommendedPath) {
    return "optimise-existing";
  }

  if (args.position > 0 && args.position <= 20) {
    return "optimise-existing";
  }

  const hasDedicatedExistingRoute = [
    "business-plan",
    "endorsement",
    "eligibility",
    "application-support",
  ].includes(args.cluster);

  if (hasDedicatedExistingRoute) {
    return "optimise-existing";
  }

  if (args.position > 20 && args.position <= 50) {
    return "support-existing";
  }

  return "new-content";
}
