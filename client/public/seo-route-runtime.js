(() => {
  const GLOBAL_HOSTS = new Set(["visaassistant.global", "www.visaassistant.global"]);
  const GLOBAL_ORIGIN = "https://visaassistant.global";
  const INNOVATOR_PATH = "/uk/innovatorfoundervisaassistant";
  const INNOVATOR_CANONICAL = `${GLOBAL_ORIGIN}${INNOVATOR_PATH}`;

  const PUBLIC_META = {
    "/pricing": ["Pricing | Visa Assistant Global", "View Visa Assistant Global preparation-tool pricing and available platform options."],
    "/faq": ["Visa Preparation FAQ | Visa Assistant Global", "Answers to common questions about Visa Assistant Global, its AI-assisted preparation tools and how the platform works."],
    "/guide": ["Visa Preparation Guide | Visa Assistant Global", "Practical visa application preparation guidance, structured tools and supporting resources from Visa Assistant Global."],
    "/features": ["Visa Preparation Tools & Features | Visa Assistant Global", "Explore AI-assisted document, preparation, evidence and workflow tools available through Visa Assistant Global."],
    "/about": ["About Visa Assistant Global", "Learn about Visa Assistant Global, a technology platform providing AI-assisted visa application preparation tools and structured workflows."],
    "/eligibility": ["UK Innovator Founder Eligibility Preparation | Visa Assistant Global", "Structured preparation resources for understanding and organising information relevant to the UK Innovator Founder route."],
    "/endorsing-bodies": ["UK Innovator Founder Endorsing Bodies | Visa Assistant Global", "Preparation resources covering UK Innovator Founder endorsing bodies and application-readiness considerations."],
    "/business-plan-template": ["Innovator Founder Business Plan Template | Visa Assistant Global", "A structured business-plan preparation resource for UK Innovator Founder applicants, including innovation, viability and scalability evidence planning."],
    "/guide/ultimate-uk-innovator-founder-visa-guide": ["UK Innovator Founder Visa Preparation Guide | Visa Assistant Global", "A detailed preparation guide for the UK Innovator Founder route, covering business planning, evidence organisation and application readiness."],
    "/blog": ["Visa Preparation Blog | Visa Assistant Global", "Visa preparation articles, product guidance and application-readiness resources from Visa Assistant Global."],
    "/privacy": ["Privacy Policy | Visa Assistant Global", "Read the Visa Assistant Global privacy policy and how platform data is handled."],
    "/terms": ["Terms of Use | Visa Assistant Global", "Read the terms governing use of Visa Assistant Global and its visa preparation tools."],
    "/cookies": ["Cookie Policy | Visa Assistant Global", "Read how Visa Assistant Global uses essential and optional cookies and local storage."],
    "/ai-transparency": ["AI Transparency | Visa Assistant Global", "Learn how Visa Assistant Global uses AI-assisted features, their limitations and the role of human verification."],
  };

  const PRIVATE_PREFIXES = [
    "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password",
    "/dashboard", "/settings", "/checkout", "/questionnaire", "/generation",
    "/tools-hub", "/tools/", "/documents", "/support", "/progress", "/admin",
    "/partner-dashboard", "/referral-dashboard", "/premium-features", "/visa-prefill",
  ];

  function ensureMeta(selector, attr, value) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
      if (match) element.setAttribute(match[1], match[2]);
      document.head.appendChild(element);
    }
    element.setAttribute(attr, value);
  }

  function ensureCanonical(url) {
    let element = document.head.querySelector('link[rel="canonical"]');
    if (!element) {
      element = document.createElement("link");
      element.setAttribute("rel", "canonical");
      document.head.appendChild(element);
    }
    element.setAttribute("href", url);
  }

  function apply() {
    const host = window.location.hostname.toLowerCase();
    const isGlobal = GLOBAL_HOSTS.has(host);
    const path = window.location.pathname.length > 1 && window.location.pathname.endsWith("/")
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname;

    let title = isGlobal ? "Visa Assistant Global" : "UK Innovator Founder Visa Assistant";
    let description = isGlobal
      ? "AI-assisted visa application preparation tools and structured workflows."
      : "AI-assisted UK Innovator Founder application preparation tools and structured workflows.";
    let canonical = isGlobal ? `${GLOBAL_ORIGIN}${path}` : INNOVATOR_CANONICAL;
    let robots = "noindex,follow";

    if (isGlobal && path === "/") {
      title = "Visa Assistant Global | AI-Powered Visa Preparation";
      description = "AI-assisted visa preparation tools for entrepreneurs, innovators and skilled professionals. Explore supported countries and prepare applications with structured guidance, document tools and compliance-focused workflows.";
      canonical = `${GLOBAL_ORIGIN}/`;
      robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    } else if (path === INNOVATOR_PATH || path === "/uk" || (!isGlobal && path === "/")) {
      title = "UK Innovator Founder Visa Assistant | Application Preparation Tools";
      description = "AI-assisted preparation tools for the UK Innovator Founder route, including business plan development, founder profile, innovation evidence, financial forecasting and application readiness.";
      canonical = INNOVATOR_CANONICAL;
      robots = path === "/uk" ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    } else if (isGlobal && PUBLIC_META[path]) {
      [title, description] = PUBLIC_META[path];
      canonical = `${GLOBAL_ORIGIN}${path}`;
      robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    } else if (isGlobal && path.startsWith("/blog/")) {
      title = "Visa Preparation Article | Visa Assistant Global";
      description = "Visa preparation guidance and application-readiness resources from Visa Assistant Global.";
      canonical = `${GLOBAL_ORIGIN}${path}`;
      robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    } else if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))) {
      robots = "noindex,nofollow,noarchive";
    }

    document.title = title;
    ensureMeta('meta[name="description"]', "content", description);
    ensureMeta('meta[name="robots"]', "content", robots);
    ensureMeta('meta[name="googlebot"]', "content", robots);
    ensureMeta('meta[property="og:url"]', "content", canonical);
    ensureMeta('meta[property="og:title"]', "content", title);
    ensureMeta('meta[property="og:description"]', "content", description);
    ensureMeta('meta[name="twitter:title"]', "content", title);
    ensureMeta('meta[name="twitter:description"]', "content", description);
    ensureCanonical(canonical);
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    queueMicrotask(apply);
    return result;
  };
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    queueMicrotask(apply);
    return result;
  };
  window.addEventListener("popstate", apply);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
