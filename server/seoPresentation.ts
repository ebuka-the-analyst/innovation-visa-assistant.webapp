import type { Express, Request } from "express";
import { desc, eq } from "drizzle-orm";
import { seoAutomationPlans } from "@shared/schema";
import { db } from "./db";

const GLOBAL_HOSTS = new Set(["visaassistant.global", "www.visaassistant.global"]);
const INNOVATOR_HOSTS = new Set([
  "innovatorfoundervisaassistant.co.uk",
  "www.innovatorfoundervisaassistant.co.uk",
]);

const GLOBAL_ORIGIN = "https://visaassistant.global";
const INNOVATOR_ORIGIN = "https://innovatorfoundervisaassistant.co.uk";
const GLOBAL_INNOVATOR_PATH = "/uk/innovatorfoundervisaassistant";
const GLOBAL_INNOVATOR_CANONICAL = `${GLOBAL_ORIGIN}${GLOBAL_INNOVATOR_PATH}`;

const INDEX_ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const PRIVATE_PREFIXES = [
  "/api/",
  "/admin",
  "/dashboard",
  "/settings",
  "/checkout",
  "/questionnaire",
  "/theme-selection",
  "/adaptive-intake",
  "/generation",
  "/tools-hub",
  "/tools/",
  "/documents",
  "/support",
  "/progress",
  "/partner-dashboard",
  "/referral-dashboard",
  "/premium-features",
  "/achievements",
  "/template-library",
  "/document-review",
  "/calendar",
  "/visa-prefill",
  "/testing-validation",
  "/compliance-dashboard",
  "/ai-assistant",
  "/handoff",
  "/oracle-supervisor",
  "/founder-autopilot",
  "/neural-twin",
  "/voice-builder",
  "/regulatory-copilot",
  "/economic-impact",
  "/knowledge-graph",
  "/interview-prep",
  "/traction-evidence",
  "/founder-portfolio",
  "/endorser-cover-letter",
  "/commercial-validation",
  "/oisc-compliance",
  "/market-data-verifier",
  "/mvp-demo-guide",
  "/financial-resilience",
  "/rejection-analysis",
  "/settlement-planning",
  "/kpi-dashboard",
  "/evidence-graph",
  "/rfe-defence-lab",
  "/diagnostics",
  "/data-manager",
];

const AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

const GLOBAL_PUBLIC_PAGE_META: Record<
  string,
  { title: string; description: string }
> = {
  "/pricing": {
    title: "Pricing | Visa Assistant Global",
    description:
      "View Visa Assistant Global preparation-tool pricing and available platform options.",
  },
  "/faq": {
    title: "Visa Preparation FAQ | Visa Assistant Global",
    description:
      "Answers to common questions about Visa Assistant Global, its AI-assisted preparation tools and how the platform works.",
  },
  "/guide": {
    title: "Visa Preparation Guide | Visa Assistant Global",
    description:
      "Practical visa application preparation guidance, structured tools and supporting resources from Visa Assistant Global.",
  },
  "/features": {
    title: "Visa Preparation Tools & Features | Visa Assistant Global",
    description:
      "Explore AI-assisted document, preparation, evidence and workflow tools available through Visa Assistant Global.",
  },
  "/about": {
    title: "About Visa Assistant Global",
    description:
      "Learn about Visa Assistant Global, a technology platform providing AI-assisted visa application preparation tools and structured workflows.",
  },
  "/eligibility": {
    title: "UK Innovator Founder Eligibility Preparation | Visa Assistant Global",
    description:
      "Structured preparation resources for understanding and organising information relevant to the UK Innovator Founder route.",
  },
  "/endorsing-bodies": {
    title: "UK Innovator Founder Endorsing Bodies | Visa Assistant Global",
    description:
      "Preparation resources covering UK Innovator Founder endorsing bodies and application-readiness considerations.",
  },
  "/business-plan-template": {
    title: "Innovator Founder Business Plan Template | Visa Assistant Global",
    description:
      "A structured business-plan preparation resource for UK Innovator Founder applicants, including innovation, viability and scalability evidence planning.",
  },
  "/guide/ultimate-uk-innovator-founder-visa-guide": {
    title: "UK Innovator Founder Visa Preparation Guide | Visa Assistant Global",
    description:
      "A detailed preparation guide for the UK Innovator Founder route, covering business planning, evidence organisation and application readiness.",
  },
  "/blog": {
    title: "Visa Preparation Blog | Visa Assistant Global",
    description:
      "Visa preparation articles, product guidance and application-readiness resources from Visa Assistant Global.",
  },
  "/privacy": {
    title: "Privacy Policy | Visa Assistant Global",
    description:
      "Read the Visa Assistant Global privacy policy and how platform data is handled.",
  },
  "/terms": {
    title: "Terms of Use | Visa Assistant Global",
    description:
      "Read the terms governing use of Visa Assistant Global and its visa preparation tools.",
  },
  "/cookies": {
    title: "Cookie Policy | Visa Assistant Global",
    description:
      "Read how Visa Assistant Global uses essential and optional cookies and local storage.",
  },
  "/ai-transparency": {
    title: "AI Transparency | Visa Assistant Global",
    description:
      "Learn how Visa Assistant Global uses AI-assisted features, their limitations and the role of human verification.",
  },
};

const INNOVATOR_PUBLIC_PAGE_META: Record<
  string,
  { title: string; description: string }
> = {
  "/pricing": {
    title: "Pricing | UK Innovator Founder Visa Assistant",
    description:
      "View pricing for AI-assisted UK Innovator Founder business-plan, evidence, document and application-preparation tools.",
  },
  "/faq": {
    title: "UK Innovator Founder Visa FAQ 2026 | Preparation Questions",
    description:
      "Answers to common UK Innovator Founder Visa preparation questions covering eligibility, endorsement, business plans, evidence and the application workflow.",
  },
  "/guide": {
    title: "UK Innovator Founder Visa Guide 2026 | Application Preparation",
    description:
      "Practical UK Innovator Founder Visa preparation guidance covering endorsement, business planning, evidence, eligibility and application readiness.",
  },
  "/features": {
    title: "UK Innovator Founder Visa Tools & Features | AI Preparation",
    description:
      "Explore AI-assisted business-plan, evidence, document, interview and application-preparation tools for the UK Innovator Founder route.",
  },
  "/about": {
    title: "About | UK Innovator Founder Visa Assistant",
    description:
      "Learn about the UK Innovator Founder Visa Assistant, a technology platform for structured business planning, evidence and application preparation.",
  },
  "/eligibility": {
    title: "UK Innovator Founder Visa Eligibility 2026 | Requirements",
    description:
      "Prepare for UK Innovator Founder eligibility requirements with structured guidance on endorsement, English language, funds and application evidence.",
  },
  "/endorsing-bodies": {
    title: "UKES & UK Innovator Founder Endorsing Bodies 2026",
    description:
      "See UK Endorsing Services (UKES) alongside the authorised Innovator Founder endorsing bodies, endorsement fees and contact-point requirements.",
  },
  "/business-plan-template": {
    title: "Innovator Founder Visa Business Plan Template 2026 | UK",
    description:
      "Build an Innovator Founder business plan around innovation, viability, scalability, market evidence, financial forecasts and endorsement readiness.",
  },
  "/guide/ultimate-uk-innovator-founder-visa-guide": {
    title: "Ultimate UK Innovator Founder Visa Guide 2026 | Preparation",
    description:
      "Detailed UK Innovator Founder Visa preparation guide covering endorsement, eligibility, business planning, evidence and application readiness.",
  },
  "/blog": {
    title: "UK Innovator Founder Visa Blog | Guides & Preparation",
    description:
      "Articles and preparation resources for UK Innovator Founder applicants, including business planning, endorsement, evidence and application readiness.",
  },
  "/privacy": {
    title: "Privacy Policy | UK Innovator Founder Visa Assistant",
    description:
      "Read how the UK Innovator Founder Visa Assistant handles platform and account data.",
  },
  "/terms": {
    title: "Terms of Use | UK Innovator Founder Visa Assistant",
    description:
      "Read the terms governing use of the UK Innovator Founder Visa Assistant and its preparation tools.",
  },
  "/cookies": {
    title: "Cookie Policy | UK Innovator Founder Visa Assistant",
    description:
      "Read how the UK Innovator Founder Visa Assistant uses essential and optional cookies and local storage.",
  },
  "/ai-transparency": {
    title: "AI Transparency | UK Innovator Founder Visa Assistant",
    description:
      "Learn how AI-assisted features are used, their limitations and the role of human verification in application preparation.",
  },
};

export interface SeoProfile {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  siteName: string;
  jsonLd: unknown[];
  approvedOverride?: boolean;
  approvedPath?: string;
}

type ApprovedSeoOverride = {
  title?: string;
  description?: string;
  keyword?: string;
  approvedAt?: string;
};

let overrideCache:
  | {
      expiresAt: number;
      overrides: Record<string, ApprovedSeoOverride>;
    }
  | undefined;

function cleanHost(req: Request) {
  const forwarded = req.headers["x-forwarded-host"];
  const raw =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      ?.split(",")[0]
      ?.trim() ||
    req.get("host") ||
    req.hostname;
  return raw.toLowerCase().replace(/:\d+$/, "");
}

function cleanPath(req: Request) {
  const path = req.path || "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function requestOrigin(req: Request) {
  const host = cleanHost(req);
  if (INNOVATOR_HOSTS.has(host)) return INNOVATOR_ORIGIN;
  return GLOBAL_ORIGIN;
}

function globalJsonLd() {
  const organisation = {
    "@type": "Organization",
    "@id": `${GLOBAL_ORIGIN}/#organization`,
    name: "Visa Assistant Global",
    url: GLOBAL_ORIGIN,
    description:
      "Technology platform providing AI-assisted visa application preparation tools, structured workflows and document support.",
  };

  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        organisation,
        {
          "@type": "WebSite",
          "@id": `${GLOBAL_ORIGIN}/#website`,
          name: "Visa Assistant Global",
          url: `${GLOBAL_ORIGIN}/`,
          inLanguage: "en-GB",
          publisher: { "@id": `${GLOBAL_ORIGIN}/#organization` },
          description:
            "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals.",
        },
        {
          "@type": "WebApplication",
          "@id": `${GLOBAL_ORIGIN}/#app`,
          name: "Visa Assistant Global",
          url: `${GLOBAL_ORIGIN}/`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "en-GB",
          description:
            "AI-assisted visa application preparation platform with structured document, evidence and workflow tools.",
          publisher: { "@id": `${GLOBAL_ORIGIN}/#organization` },
        },
      ],
    },
  ];
}

function innovatorJsonLd(canonical: string, pageTitle: string, description: string) {
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${INNOVATOR_ORIGIN}/#website`,
          name: "UK Innovator Founder Visa Assistant",
          url: `${INNOVATOR_ORIGIN}/`,
          inLanguage: "en-GB",
          description:
            "AI-assisted application preparation tools for the UK Innovator Founder route.",
        },
        {
          "@type": "WebPage",
          "@id": `${canonical}#webpage`,
          name: pageTitle,
          url: canonical,
          inLanguage: "en-GB",
          description,
          isPartOf: { "@id": `${INNOVATOR_ORIGIN}/#website` },
        },
      ],
    },
  ];
}

function globalInnovatorJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${GLOBAL_INNOVATOR_CANONICAL}#webpage`,
          name: "UK Innovator Founder Visa Assistant",
          url: GLOBAL_INNOVATOR_CANONICAL,
          inLanguage: "en-GB",
          description:
            "AI-assisted preparation tools for the UK Innovator Founder route, including business planning, founder profile, evidence and financial forecasting workflows.",
          isPartOf: { "@id": `${GLOBAL_ORIGIN}/#website` },
        },
        {
          "@type": "WebApplication",
          "@id": `${GLOBAL_INNOVATOR_CANONICAL}#app`,
          name: "UK Innovator Founder Visa Assistant",
          url: GLOBAL_INNOVATOR_CANONICAL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "en-GB",
          description:
            "Application preparation workspace for the UK Innovator Founder route. It provides technology tools and general information and is not a regulated immigration adviser or decision-maker.",
          publisher: { "@id": `${GLOBAL_ORIGIN}/#organization` },
        },
      ],
    },
  ];
}

function isPrivatePath(pathname: string) {
  if (AUTH_PATHS.has(pathname)) return true;
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

function privateProfile(origin: string, pathname: string, siteName: string): SeoProfile {
  return {
    title: siteName,
    description: `Secure ${siteName} application preparation workspace.`,
    canonical: `${origin}${pathname}`,
    robots: "noindex,nofollow,noarchive",
    siteName,
    jsonLd: [],
  };
}

export function getSeoProfile(req: Request): SeoProfile {
  const host = cleanHost(req);
  const pathname = cleanPath(req);
  const isGlobal = GLOBAL_HOSTS.has(host);
  const isInnovator = INNOVATOR_HOSTS.has(host);

  if (isPrivatePath(pathname)) {
    if (isInnovator) {
      return privateProfile(
        INNOVATOR_ORIGIN,
        pathname,
        "UK Innovator Founder Visa Assistant",
      );
    }
    return privateProfile(GLOBAL_ORIGIN, pathname, "Visa Assistant Global");
  }

  if (isInnovator) {
    if (pathname === "/") {
      const title =
        "UK Innovator Founder Visa Assistant | Application Preparation Tools";
      const description =
        "AI-assisted UK Innovator Founder preparation tools for business plans, endorsement readiness, evidence, financial forecasting and application preparation.";
      return {
        title,
        description,
        canonical: `${INNOVATOR_ORIGIN}/`,
        robots: INDEX_ROBOTS,
        siteName: "UK Innovator Founder Visa Assistant",
        jsonLd: innovatorJsonLd(`${INNOVATOR_ORIGIN}/`, title, description),
      };
    }

    if (pathname.startsWith("/blog/")) {
      const title = "UK Innovator Founder Visa Article | Preparation Guide";
      const description =
        "UK Innovator Founder Visa preparation guidance and application-readiness resources.";
      return {
        title,
        description,
        canonical: `${INNOVATOR_ORIGIN}${pathname}`,
        robots: INDEX_ROBOTS,
        siteName: "UK Innovator Founder Visa Assistant",
        jsonLd: innovatorJsonLd(
          `${INNOVATOR_ORIGIN}${pathname}`,
          title,
          description,
        ),
      };
    }

    const publicMeta = INNOVATOR_PUBLIC_PAGE_META[pathname];
    if (publicMeta) {
      const canonical = `${INNOVATOR_ORIGIN}${pathname}`;
      return {
        ...publicMeta,
        canonical,
        robots: INDEX_ROBOTS,
        siteName: "UK Innovator Founder Visa Assistant",
        jsonLd: innovatorJsonLd(
          canonical,
          publicMeta.title,
          publicMeta.description,
        ),
      };
    }

    return {
      title: "UK Innovator Founder Visa Assistant",
      description:
        "AI-assisted UK Innovator Founder application preparation tools and structured workflows.",
      canonical: `${INNOVATOR_ORIGIN}${pathname}`,
      robots: "noindex,follow",
      siteName: "UK Innovator Founder Visa Assistant",
      jsonLd: [],
    };
  }

  if (isGlobal && pathname === "/") {
    return {
      title: "Visa Assistant Global | AI-Powered Visa Preparation",
      description:
        "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals. Explore supported countries and prepare applications with structured guidance, document tools and compliance-focused workflows.",
      canonical: `${GLOBAL_ORIGIN}/`,
      robots: INDEX_ROBOTS,
      siteName: "Visa Assistant Global",
      jsonLd: globalJsonLd(),
    };
  }

  if (
    isGlobal &&
    (pathname === GLOBAL_INNOVATOR_PATH || pathname === "/uk")
  ) {
    return {
      title:
        "UK Innovator Founder Visa Assistant | Application Preparation Tools",
      description:
        "AI-assisted preparation tools for the UK Innovator Founder route, including business plan development, founder profile, innovation evidence, financial forecasting and application readiness.",
      canonical: GLOBAL_INNOVATOR_CANONICAL,
      robots: pathname === "/uk" ? "noindex,follow" : INDEX_ROBOTS,
      siteName: "Visa Assistant Global",
      jsonLd: globalInnovatorJsonLd(),
    };
  }

  if (isGlobal && pathname === "/v2") {
    return {
      title: "Visa Assistant Global | AI-Powered Visa Preparation",
      description:
        "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals.",
      canonical: `${GLOBAL_ORIGIN}/`,
      robots: "noindex,follow",
      siteName: "Visa Assistant Global",
      jsonLd: globalJsonLd(),
    };
  }

  if (isGlobal && pathname.startsWith("/blog/")) {
    return {
      title: "Visa Preparation Article | Visa Assistant Global",
      description:
        "Visa preparation guidance and application-readiness resources from Visa Assistant Global.",
      canonical: `${GLOBAL_ORIGIN}${pathname}`,
      robots: INDEX_ROBOTS,
      siteName: "Visa Assistant Global",
      jsonLd: [],
    };
  }

  if (isGlobal) {
    const publicMeta = GLOBAL_PUBLIC_PAGE_META[pathname];
    if (publicMeta) {
      return {
        ...publicMeta,
        canonical: `${GLOBAL_ORIGIN}${pathname}`,
        robots: INDEX_ROBOTS,
        siteName: "Visa Assistant Global",
        jsonLd: [],
      };
    }
  }

  return {
    title: "Visa Assistant Global",
    description:
      "AI-assisted visa application preparation tools and structured workflows.",
    canonical: `${requestOrigin(req)}${pathname}`,
    robots: "noindex,follow",
    siteName: isInnovator
      ? "UK Innovator Founder Visa Assistant"
      : "Visa Assistant Global",
    jsonLd: [],
  };
}

async function getApprovedSeoOverrides(): Promise<
  Record<string, ApprovedSeoOverride>
> {
  if (overrideCache && overrideCache.expiresAt > Date.now()) {
    return overrideCache.overrides;
  }

  try {
    const activePlans = await db
      .select({ strategyData: seoAutomationPlans.strategyData })
      .from(seoAutomationPlans)
      .where(eq(seoAutomationPlans.status, "active"))
      .orderBy(desc(seoAutomationPlans.updatedAt))
      .limit(10);

    const top5Plan = activePlans.find(
      (row) =>
        (row.strategyData as any)?.autopilotMode === "top5-lifetime",
    );
    const overrides =
      ((top5Plan?.strategyData as any)?.approvedOverrides || {}) as Record<
        string,
        ApprovedSeoOverride
      >;

    overrideCache = {
      expiresAt: Date.now() + 10_000,
      overrides,
    };
    return overrides;
  } catch (error) {
    console.warn("[SEO] Unable to read approved metadata overrides:", error);
    return {};
  }
}

async function applyApprovedSeoOverride(
  profile: SeoProfile,
  req: Request,
): Promise<SeoProfile> {
  const host = cleanHost(req);
  const pathname = cleanPath(req);

  // The Search Console mission and approval queue currently target the
  // Innovator Founder domain. Do not leak those overrides onto Visa Assistant Global.
  if (!INNOVATOR_HOSTS.has(host) || !profile.robots.startsWith("index")) {
    return profile;
  }

  const overrides = await getApprovedSeoOverrides();
  const override = overrides[pathname];
  if (!override?.title || !override?.description) return profile;

  return {
    ...profile,
    title: override.title,
    description: override.description,
    approvedOverride: true,
    approvedPath: pathname,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildSeoMarkup(profile: SeoProfile) {
  const title = escapeHtml(profile.title);
  const description = escapeHtml(profile.description);
  const canonical = escapeHtml(profile.canonical);
  const siteName = escapeHtml(profile.siteName);
  const image = profile.canonical.startsWith(INNOVATOR_ORIGIN)
    ? `${INNOVATOR_ORIGIN}/og-image.webp`
    : `${GLOBAL_ORIGIN}/favicon.png`;
  const jsonLd = profile.jsonLd
    .map(
      (entry) =>
        `<script type="application/ld+json">${safeJson(entry)}</script>`,
    )
    .join("\n    ");
  const approvalMeta =
    profile.approvedOverride && profile.approvedPath
      ? `
    <meta name="seo-autopilot-path" content="${escapeHtml(profile.approvedPath)}" />
    <meta name="seo-autopilot-title" content="${title}" />
    <meta name="seo-autopilot-description" content="${description}" />`
      : "";

  return `<!-- SEO_DYNAMIC_START -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${escapeHtml(profile.robots)}" />
    <meta name="googlebot" content="${escapeHtml(profile.robots)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en-GB" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:locale" content="en_GB" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />${approvalMeta}
    ${jsonLd}
    <!-- SEO_DYNAMIC_END -->`;
}

export async function renderSeoHtml(template: string, req: Request) {
  const baseProfile = getSeoProfile(req);
  const profile = await applyApprovedSeoOverride(baseProfile, req);
  return template.replace(
    /<!-- SEO_DYNAMIC_START -->[\s\S]*?<!-- SEO_DYNAMIC_END -->/,
    buildSeoMarkup(profile),
  );
}

const crawlerDisallows = [
  "/api/",
  "/admin",
  "/dashboard",
  "/settings",
  "/checkout",
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/questionnaire",
  "/generation",
  "/documents",
  "/support",
  "/progress",
];

function robotsGroup(agent: string) {
  return [
    `User-agent: ${agent}`,
    "Allow: /",
    ...crawlerDisallows.map((path) => `Disallow: ${path}`),
  ].join("\n");
}

function robotsTxt(origin: string, siteName: string) {
  return [
    `# ${siteName} crawler policy`,
    "# Public pages are crawlable. Private workspaces, account pages and APIs are excluded.",
    robotsGroup("*"),
    robotsGroup("OAI-SearchBot"),
    robotsGroup("GPTBot"),
    robotsGroup("ClaudeBot"),
    robotsGroup("PerplexityBot"),
    `Sitemap: ${origin}/sitemap.xml`,
    `# AI-readable site summary: ${origin}/llms.txt`,
    "",
  ].join("\n\n");
}

function buildSitemapXml(
  origin: string,
  urls: Array<[string, string]>,
) {
  const entries = urls
    .map(
      ([path, priority]) =>
        `  <url>\n    <loc>${origin}${path}</loc>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function globalSitemapXml() {
  return buildSitemapXml(GLOBAL_ORIGIN, [
    ["/", "1.0"],
    [GLOBAL_INNOVATOR_PATH, "0.95"],
    ["/guide/ultimate-uk-innovator-founder-visa-guide", "0.85"],
    ["/eligibility", "0.8"],
    ["/endorsing-bodies", "0.8"],
    ["/business-plan-template", "0.8"],
    ["/features", "0.75"],
    ["/pricing", "0.7"],
    ["/faq", "0.7"],
    ["/about", "0.6"],
    ["/blog", "0.7"],
    ["/ai-transparency", "0.6"],
    ["/privacy", "0.3"],
    ["/terms", "0.3"],
    ["/cookies", "0.3"],
  ]);
}

function innovatorSitemapXml() {
  return buildSitemapXml(INNOVATOR_ORIGIN, [
    ["/", "1.0"],
    ["/guide", "0.9"],
    ["/guide/ultimate-uk-innovator-founder-visa-guide", "0.9"],
    ["/business-plan-template", "0.9"],
    ["/endorsing-bodies", "0.9"],
    ["/eligibility", "0.9"],
    ["/features", "0.8"],
    ["/pricing", "0.75"],
    ["/faq", "0.75"],
    ["/about", "0.6"],
    ["/blog", "0.75"],
    ["/ai-transparency", "0.5"],
    ["/privacy", "0.3"],
    ["/terms", "0.3"],
    ["/cookies", "0.3"],
  ]);
}

function globalLlmsTxt() {
  return `# Visa Assistant Global

> Visa Assistant Global is a technology platform providing AI-assisted visa application preparation tools, structured workflows, document support and application-readiness resources for entrepreneurs, innovators and skilled professionals.

## Canonical website
- ${GLOBAL_ORIGIN}/

## Currently live route
- United Kingdom — Innovator Founder Visa Assistant: ${GLOBAL_INNOVATOR_CANONICAL}

## Key public resources
- Features: ${GLOBAL_ORIGIN}/features
- Pricing: ${GLOBAL_ORIGIN}/pricing
- FAQ: ${GLOBAL_ORIGIN}/faq
- About: ${GLOBAL_ORIGIN}/about
- UK Innovator Founder preparation guide: ${GLOBAL_ORIGIN}/guide/ultimate-uk-innovator-founder-visa-guide
- Eligibility preparation: ${GLOBAL_ORIGIN}/eligibility
- Endorsing bodies preparation: ${GLOBAL_ORIGIN}/endorsing-bodies
- Business plan template: ${GLOBAL_ORIGIN}/business-plan-template
- Blog: ${GLOBAL_ORIGIN}/blog
- AI transparency: ${GLOBAL_ORIGIN}/ai-transparency

## Platform positioning
Visa Assistant Global provides technology tools, general information and application preparation support. It is not a law firm, a regulated immigration adviser, an endorsing body or an immigration decision-maker.
`;
}

function innovatorLlmsTxt() {
  return `# UK Innovator Founder Visa Assistant

> AI-assisted application-preparation workspace for the UK Innovator Founder route, with structured business planning, endorsement-readiness, evidence, financial and interview tools.

## Canonical website
- ${INNOVATOR_ORIGIN}/

## Key public resources
- Guide: ${INNOVATOR_ORIGIN}/guide
- Business plan template: ${INNOVATOR_ORIGIN}/business-plan-template
- Endorsing bodies: ${INNOVATOR_ORIGIN}/endorsing-bodies
- Eligibility: ${INNOVATOR_ORIGIN}/eligibility
- Features: ${INNOVATOR_ORIGIN}/features
- Pricing: ${INNOVATOR_ORIGIN}/pricing
- FAQ: ${INNOVATOR_ORIGIN}/faq
- Blog: ${INNOVATOR_ORIGIN}/blog

## Platform positioning
The platform provides technology tools, general information and application preparation support. It is not a law firm, a regulated immigration adviser, an endorsing body or an immigration decision-maker. Immigration requirements can change, so users should verify current requirements with official GOV.UK guidance and the relevant endorsing body.
`;
}

export function registerSeoDiscoveryRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => {
    const host = cleanHost(req);
    const isInnovator = INNOVATOR_HOSTS.has(host);
    const origin = isInnovator ? INNOVATOR_ORIGIN : GLOBAL_ORIGIN;
    const siteName = isInnovator
      ? "UK Innovator Founder Visa Assistant"
      : "Visa Assistant Global";
    res
      .type("text/plain")
      .set("Cache-Control", "public, max-age=300")
      .send(robotsTxt(origin, siteName));
  });

  app.get("/sitemap.xml", (req, res) => {
    const isInnovator = INNOVATOR_HOSTS.has(cleanHost(req));
    res
      .type("application/xml")
      .set("Cache-Control", "public, max-age=300")
      .send(isInnovator ? innovatorSitemapXml() : globalSitemapXml());
  });

  app.get("/llms.txt", (req, res) => {
    const isInnovator = INNOVATOR_HOSTS.has(cleanHost(req));
    res
      .type("text/plain")
      .set("Cache-Control", "public, max-age=300")
      .send(isInnovator ? innovatorLlmsTxt() : globalLlmsTxt());
  });
}
