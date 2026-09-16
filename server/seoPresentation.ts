import type { Express, Request } from "express";

const GLOBAL_HOSTS = new Set(["visaassistant.global", "www.visaassistant.global"]);
const GLOBAL_ORIGIN = "https://visaassistant.global";
const INNOVATOR_PATH = "/uk/innovatorfoundervisaassistant";
const INNOVATOR_CANONICAL = `${GLOBAL_ORIGIN}${INNOVATOR_PATH}`;

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

const PUBLIC_PAGE_META: Record<string, { title: string; description: string }> = {
  "/pricing": {
    title: "Pricing | Visa Assistant Global",
    description: "View Visa Assistant Global preparation-tool pricing and available platform options.",
  },
  "/faq": {
    title: "Visa Preparation FAQ | Visa Assistant Global",
    description: "Answers to common questions about Visa Assistant Global, its AI-assisted preparation tools and how the platform works.",
  },
  "/guide": {
    title: "Visa Preparation Guide | Visa Assistant Global",
    description: "Practical visa application preparation guidance, structured tools and supporting resources from Visa Assistant Global.",
  },
  "/features": {
    title: "Visa Preparation Tools & Features | Visa Assistant Global",
    description: "Explore AI-assisted document, preparation, evidence and workflow tools available through Visa Assistant Global.",
  },
  "/about": {
    title: "About Visa Assistant Global",
    description: "Learn about Visa Assistant Global, a technology platform providing AI-assisted visa application preparation tools and structured workflows.",
  },
  "/eligibility": {
    title: "UK Innovator Founder Eligibility Preparation | Visa Assistant Global",
    description: "Structured preparation resources for understanding and organising information relevant to the UK Innovator Founder route.",
  },
  "/endorsing-bodies": {
    title: "UK Innovator Founder Endorsing Bodies | Visa Assistant Global",
    description: "Preparation resources covering UK Innovator Founder endorsing bodies and application-readiness considerations.",
  },
  "/business-plan-template": {
    title: "Innovator Founder Business Plan Template | Visa Assistant Global",
    description: "A structured business-plan preparation resource for UK Innovator Founder applicants, including innovation, viability and scalability evidence planning.",
  },
  "/guide/ultimate-uk-innovator-founder-visa-guide": {
    title: "UK Innovator Founder Visa Preparation Guide | Visa Assistant Global",
    description: "A detailed preparation guide for the UK Innovator Founder route, covering business planning, evidence organisation and application readiness.",
  },
  "/blog": {
    title: "Visa Preparation Blog | Visa Assistant Global",
    description: "Visa preparation articles, product guidance and application-readiness resources from Visa Assistant Global.",
  },
  "/privacy": {
    title: "Privacy Policy | Visa Assistant Global",
    description: "Read the Visa Assistant Global privacy policy and how platform data is handled.",
  },
  "/terms": {
    title: "Terms of Use | Visa Assistant Global",
    description: "Read the terms governing use of Visa Assistant Global and its visa preparation tools.",
  },
  "/cookies": {
    title: "Cookie Policy | Visa Assistant Global",
    description: "Read how Visa Assistant Global uses essential and optional cookies and local storage.",
  },
  "/ai-transparency": {
    title: "AI Transparency | Visa Assistant Global",
    description: "Learn how Visa Assistant Global uses AI-assisted features, their limitations and the role of human verification.",
  },
};

export interface SeoProfile {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  siteName: string;
  jsonLd: unknown[];
}

function cleanHost(req: Request) {
  const forwarded = req.headers["x-forwarded-host"];
  const raw = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() || req.get("host") || req.hostname;
  return raw.toLowerCase().replace(/:\d+$/, "");
}

function cleanPath(req: Request) {
  const path = req.path || "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function globalJsonLd() {
  const organisation = {
    "@type": "Organization",
    "@id": `${GLOBAL_ORIGIN}/#organization`,
    name: "Visa Assistant Global",
    url: GLOBAL_ORIGIN,
    description: "Technology platform providing AI-assisted visa application preparation tools, structured workflows and document support.",
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
          description: "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals.",
        },
        {
          "@type": "WebApplication",
          "@id": `${GLOBAL_ORIGIN}/#app`,
          name: "Visa Assistant Global",
          url: `${GLOBAL_ORIGIN}/`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "en-GB",
          description: "AI-assisted visa application preparation platform with structured document, evidence and workflow tools.",
          publisher: { "@id": `${GLOBAL_ORIGIN}/#organization` },
          audience: {
            "@type": "Audience",
            audienceType: "Entrepreneurs, innovators and skilled professionals preparing visa applications",
          },
        },
      ],
    },
  ];
}

function innovatorJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${INNOVATOR_CANONICAL}#webpage`,
          name: "UK Innovator Founder Visa Assistant",
          url: INNOVATOR_CANONICAL,
          inLanguage: "en-GB",
          description: "AI-assisted preparation tools for the UK Innovator Founder route, including business planning, founder profile, evidence and financial forecasting workflows.",
          isPartOf: { "@id": `${GLOBAL_ORIGIN}/#website` },
        },
        {
          "@type": "WebApplication",
          "@id": `${INNOVATOR_CANONICAL}#app`,
          name: "UK Innovator Founder Visa Assistant",
          url: INNOVATOR_CANONICAL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "en-GB",
          description: "Application preparation workspace for the UK Innovator Founder route. It provides technology tools and general information and is not a regulated immigration adviser or decision-maker.",
          publisher: { "@id": `${GLOBAL_ORIGIN}/#organization` },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${INNOVATOR_CANONICAL}#breadcrumbs`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Visa Assistant Global", item: `${GLOBAL_ORIGIN}/` },
            { "@type": "ListItem", position: 2, name: "United Kingdom", item: `${GLOBAL_ORIGIN}/uk` },
            { "@type": "ListItem", position: 3, name: "Innovator Founder Visa Assistant", item: INNOVATOR_CANONICAL },
          ],
        },
      ],
    },
  ];
}

function isPrivatePath(pathname: string) {
  if (AUTH_PATHS.has(pathname)) return true;
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function getSeoProfile(req: Request): SeoProfile {
  const host = cleanHost(req);
  const pathname = cleanPath(req);
  const isGlobal = GLOBAL_HOSTS.has(host);

  if (isGlobal && pathname === "/") {
    return {
      title: "Visa Assistant Global | AI-Powered Visa Preparation",
      description: "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals. Explore supported countries and prepare applications with structured guidance, document tools and compliance-focused workflows.",
      canonical: `${GLOBAL_ORIGIN}/`,
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      siteName: "Visa Assistant Global",
      jsonLd: globalJsonLd(),
    };
  }

  if (pathname === INNOVATOR_PATH || pathname === "/uk" || (!isGlobal && pathname === "/")) {
    return {
      title: "UK Innovator Founder Visa Assistant | Application Preparation Tools",
      description: "AI-assisted preparation tools for the UK Innovator Founder route, including business plan development, founder profile, innovation evidence, financial forecasting and application readiness.",
      canonical: INNOVATOR_CANONICAL,
      robots: pathname === "/uk" ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      siteName: "Visa Assistant Global",
      jsonLd: innovatorJsonLd(),
    };
  }

  if (pathname === "/v2") {
    return {
      title: "Visa Assistant Global | AI-Powered Visa Preparation",
      description: "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals.",
      canonical: `${GLOBAL_ORIGIN}/`,
      robots: "noindex,follow",
      siteName: "Visa Assistant Global",
      jsonLd: globalJsonLd(),
    };
  }

  if (pathname.startsWith("/blog/") && isGlobal) {
    return {
      title: "Visa Preparation Article | Visa Assistant Global",
      description: "Visa preparation guidance and application-readiness resources from Visa Assistant Global.",
      canonical: `${GLOBAL_ORIGIN}${pathname}`,
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      siteName: "Visa Assistant Global",
      jsonLd: [],
    };
  }

  const publicMeta = PUBLIC_PAGE_META[pathname];
  if (publicMeta && isGlobal) {
    return {
      ...publicMeta,
      canonical: `${GLOBAL_ORIGIN}${pathname}`,
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      siteName: "Visa Assistant Global",
      jsonLd: [],
    };
  }

  if (isPrivatePath(pathname)) {
    return {
      title: "Visa Assistant Global",
      description: "Secure Visa Assistant Global application preparation workspace.",
      canonical: `${GLOBAL_ORIGIN}${pathname}`,
      robots: "noindex,nofollow,noarchive",
      siteName: "Visa Assistant Global",
      jsonLd: [],
    };
  }

  return {
    title: isGlobal ? "Visa Assistant Global" : "UK Innovator Founder Visa Assistant",
    description: isGlobal
      ? "AI-assisted visa application preparation tools and structured workflows."
      : "AI-assisted UK Innovator Founder application preparation tools and structured workflows.",
    canonical: isGlobal ? `${GLOBAL_ORIGIN}${pathname}` : INNOVATOR_CANONICAL,
    robots: "noindex,follow",
    siteName: isGlobal ? "Visa Assistant Global" : "UK Innovator Founder Visa Assistant",
    jsonLd: [],
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
  const image = `${GLOBAL_ORIGIN}/favicon.png`;
  const jsonLd = profile.jsonLd
    .map((entry) => `<script type="application/ld+json">${safeJson(entry)}</script>`)
    .join("\n    ");

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
    <meta name="twitter:image" content="${image}" />
    ${jsonLd}
    <!-- SEO_DYNAMIC_END -->`;
}

export function renderSeoHtml(template: string, req: Request) {
  const profile = getSeoProfile(req);
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

function robotsTxt() {
  return [
    "# Visa Assistant Global crawler policy",
    "# Public pages are crawlable. Private workspaces, account pages and APIs are excluded.",
    robotsGroup("*"),
    robotsGroup("OAI-SearchBot"),
    robotsGroup("GPTBot"),
    robotsGroup("ClaudeBot"),
    robotsGroup("PerplexityBot"),
    `Sitemap: ${GLOBAL_ORIGIN}/sitemap.xml`,
    `# AI-readable site summary: ${GLOBAL_ORIGIN}/llms.txt`,
    "",
  ].join("\n\n");
}

function sitemapXml() {
  const urls = [
    ["/", "1.0"],
    [INNOVATOR_PATH, "0.95"],
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
  ];

  const entries = urls
    .map(([path, priority]) => `  <url>\n    <loc>${GLOBAL_ORIGIN}${path}</loc>\n    <priority>${priority}</priority>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function llmsTxt() {
  return `# Visa Assistant Global\n\n> Visa Assistant Global is a technology platform providing AI-assisted visa application preparation tools, structured workflows, document support and application-readiness resources for entrepreneurs, innovators and skilled professionals.\n\n## Canonical website\n- ${GLOBAL_ORIGIN}/\n\n## Currently live route\n- United Kingdom — Innovator Founder Visa Assistant: ${INNOVATOR_CANONICAL}\n\n## Key public resources\n- Features: ${GLOBAL_ORIGIN}/features\n- Pricing: ${GLOBAL_ORIGIN}/pricing\n- FAQ: ${GLOBAL_ORIGIN}/faq\n- About: ${GLOBAL_ORIGIN}/about\n- UK Innovator Founder preparation guide: ${GLOBAL_ORIGIN}/guide/ultimate-uk-innovator-founder-visa-guide\n- Eligibility preparation: ${GLOBAL_ORIGIN}/eligibility\n- Endorsing bodies preparation: ${GLOBAL_ORIGIN}/endorsing-bodies\n- Business plan template: ${GLOBAL_ORIGIN}/business-plan-template\n- Blog: ${GLOBAL_ORIGIN}/blog\n- AI transparency: ${GLOBAL_ORIGIN}/ai-transparency\n- Privacy: ${GLOBAL_ORIGIN}/privacy\n- Terms: ${GLOBAL_ORIGIN}/terms\n\n## Platform positioning\nVisa Assistant Global provides technology tools, general information and application preparation support. It is not a law firm, a regulated immigration adviser, an endorsing body or an immigration decision-maker. Immigration requirements can change, so users should verify current requirements with the relevant official authority before relying on them.\n\n## AI and search guidance\nPublic pages may be crawled and summarised subject to the crawler's own policies. Private workspaces, authentication pages, account areas and APIs should not be indexed. Prefer canonical URLs on visaassistant.global when referring to platform content.\n`;
}

export function registerSeoDiscoveryRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").set("Cache-Control", "public, max-age=300").send(robotsTxt());
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").set("Cache-Control", "public, max-age=300").send(sitemapXml());
  });

  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain").set("Cache-Control", "public, max-age=300").send(llmsTxt());
  });
}
