import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { startBusinessPlanGenerationWorker } from "./services/businessPlanGenerationService";
import { registerBusinessPlanRevisionRoutes } from "./businessPlanRevisionRoutes";
import { registerAdminBusinessPlanRevisionRoutes } from "./adminBusinessPlanRevisionRoutes";
import { startBusinessPlanRevisionWorker } from "./services/businessPlanRevisionService";
import type { Express as ExpressType } from "express";
import type { Server } from "http";
import path from "path";
import fs from "fs";
import compression from "compression";
import { fileURLToPath } from "url";
import { db } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { blogPosts } from "../shared/schema";

// Get __dirname equivalent for ESM (works in Node 18+)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Wrapper for setupVite that skips API routes (only used in development)
async function setupVite(app: ExpressType, server: Server) {
  // Add middleware to prevent Vite from handling API routes and critical SEO files
  app.use((req, res, next) => {
    if (
      req.path.startsWith("/api/") ||
      req.path === "/robots.txt" ||
      req.path === "/sitemap.xml"
    ) {
      // Skip the Vite middleware for these paths
      (req as any).skipVite = true;
    }
    next();
  });
  
  // Dynamic import to avoid loading vite.ts in production (it uses Node 20+ features)
  const { setupVite: originalSetupVite } = await import("./vite");
  await originalSetupVite(app, server);
}

// Wrapper for serveStatic that skips API routes
function serveStatic(app: ExpressType) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve robots.txt with correct content-type
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile(path.resolve(distPath, "robots.txt"));
  });


  // Serve static assets with aggressive caching (1 year for hashed assets)
  app.use(express.static(distPath, {
    maxAge: '1y', // Cache for 1 year (Vite adds hash to filenames for cache busting)
    etag: true,
    lastModified: true,
    immutable: true, // Assets won't change (hash in filename ensures this)
    setHeaders: (res, filePath) => {
      // Apply aggressive caching for hashed assets (js, css, images with hash)
      if (filePath.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|avif|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // HTML files should not be cached as aggressively
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));

  // Cache the base HTML template to avoid repeated file reads
  const indexPath = path.resolve(distPath, "index.html");
  let baseHtmlTemplate: string | null = null;
  
  function getBaseHtml(): string {
    if (!baseHtmlTemplate) {
      baseHtmlTemplate = fs.readFileSync(indexPath, 'utf8');
    }
    return baseHtmlTemplate;
  }

  const BASE_URL = "https://innovatorfoundervisaassistant.co.uk";

  const orgSchema = {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "url": BASE_URL,
    "logo": { "@type": "ImageObject", "url": `${BASE_URL}/og-image.webp` }
  };

  const websiteSchema = {
    "@type": "WebSite",
    "name": "UK Innovator Founder Visa Assistant",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/tools?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  };

  // Route-specific meta tags for SEO (server-side injection)
  const routeMeta: Record<string, { title: string; description: string; keywords?: string; schema?: any }> = {
    '/': {
      title: 'UK Innovator Founder Visa Assistant — Business Plan, Endorsement & Compliance Tools',
      description: 'The UK\'s leading AI platform for Innovator Founder Visa applications. Generate your 80-page business plan, prepare for endorsement, check compliance, and access 109 expert tools — from business model validation to financial projections.',
      keywords: 'UK Innovator Founder Visa, Innovator Founder Visa, UK business visa, visa for entrepreneurs UK, innovator founder visa requirements, UK visa application, business plan for visa, endorsement UK visa',
      schema: { "@context": "https://schema.org", "@graph": [orgSchema, websiteSchema] }
    },
    '/blog': {
      title: 'UK Innovator Founder Visa Blog | Expert Guides & News',
      description: 'In-depth guides, news, and analysis on the UK Innovator Founder Visa. Every article is quad-AI verified against official GOV.UK sources for 100% accuracy.',
      keywords: 'UK Innovator Founder Visa blog, visa news, endorsement guides, ILR settlement UK',
      schema: {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "UK Innovator Founder Visa Assistant Blog",
        "url": `${BASE_URL}/blog`,
        "description": "Expert guides and analysis on the UK Innovator Founder Visa, verified by four independent AI models.",
        "publisher": orgSchema
      }
    },
    '/tools': {
      title: 'UK Innovator Founder Visa Tools | 100+ Expert AI Tools',
      description: 'Access 100+ professional-grade AI tools for your UK Innovator Founder Visa application. Innovation scoring, compliance checking, business plan generation, endorsement readiness, and more.',
      keywords: 'UK visa tools, innovation score calculator, compliance checker, endorsement readiness, business plan generator visa',
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "UK Innovator Founder Visa Tools",
        "url": `${BASE_URL}/tools`,
        "description": "100+ professional AI-powered tools for the UK Innovator Founder Visa application",
        "provider": orgSchema
      }
    },
    '/faq': {
      title: 'UK Innovator Founder Visa FAQ 2026 | 25+ Expert Answers',
      description: 'Answers to 25+ frequently asked questions about the UK Innovator Founder Visa. Expert guidance on endorsement, requirements (£1,191 fee, £1,270 savings), timeline, and ILR settlement.',
      keywords: 'UK innovator founder visa FAQ, visa questions answers, endorsement body, visa cost, ILR settlement',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the UK Innovator Founder Visa?",
            "acceptedAnswer": { "@type": "Answer", "text": "The UK Innovator Founder Visa is for entrepreneurs seeking to establish an innovative, viable, and scalable business in the UK. It requires endorsement from one of four Home Office-approved bodies: Envestors, Innovator International, UKES, or the Global Entrepreneurs Programme (invitation only)." }
          },
          {
            "@type": "Question",
            "name": "How much does the Innovator Founder Visa cost?",
            "acceptedAnswer": { "@type": "Answer", "text": "The visa fee is £1,191. You must also show £1,270 in personal savings held for 28 consecutive days. There is no minimum business investment requirement. A priority service costs £500 where available." }
          },
          {
            "@type": "Question",
            "name": "How long is the visa valid?",
            "acceptedAnswer": { "@type": "Answer", "text": "The visa is initially granted for 3 years. It can be extended for a further 3 years. After 3 years you may apply for Indefinite Leave to Remain (ILR/settlement) at a fee of £2,885." }
          }
        ]
      }
    },
    '/guide': {
      title: 'UK Innovator Founder Visa Complete Guide 2026 | Requirements, Process & Timeline',
      description: 'Comprehensive expert guide to the UK Innovator Founder Visa. Covers requirements, all four endorsing bodies, innovation/viability/scalability criteria, financial planning, and the path to ILR settlement.',
      keywords: 'UK innovator founder visa guide, how to apply, endorsement criteria, innovation viability scalability, settlement ILR',
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "UK Innovator Founder Visa Complete Guide 2026",
        "description": "Comprehensive expert guide covering all aspects of the UK Innovator Founder Visa application process, requirements, and path to settlement.",
        "author": orgSchema,
        "publisher": orgSchema,
        "datePublished": "2026-01-01",
        "about": { "@type": "Thing", "name": "UK Innovator Founder Visa" }
      }
    },
    '/pricing': {
      title: 'UK Innovator Founder Visa Assistant Pricing Plans',
      description: 'Current one-time pricing for UK Innovator Founder Visa Assistant plans. Start free and compare the tools included with each published plan.',
      keywords: 'UK visa assistant pricing, visa tool plans, innovator visa platform cost'
    },
    '/about': {
      title: 'About UK Innovator Founder Visa Assistant | AI-Powered Visa Guidance',
      description: 'Learn about the UK Innovator Founder Visa Assistant — the UK\'s leading AI platform for Innovator Founder Visa applicants, with 100+ expert tools and quad-AI verified content.',
      keywords: 'about innovator visa assistant, UK visa AI platform, visa guidance platform'
    },
    '/contact': {
      title: 'Contact UK Innovator Founder Visa Assistant | Get Support',
      description: 'Get in touch with the UK Innovator Founder Visa Assistant team. We provide expert support for your visa application journey.',
      keywords: 'contact innovator visa assistant, visa application support'
    },
    '/register': {
      title: 'Sign Up Free | UK Innovator Founder Visa Assistant',
      description: 'Create your free account on the UK Innovator Founder Visa Assistant platform. Access innovation scoring, compliance checking, and business plan generation tools instantly.',
      keywords: 'sign up visa assistant, free visa tools account'
    },
    '/login': {
      title: 'Sign In | UK Innovator Founder Visa Assistant',
      description: 'Sign in to your UK Innovator Founder Visa Assistant account to access your tools, saved progress, and personalised visa guidance.'
    }
  };

  // Helper: inject meta tags into base HTML
  function injectMeta(html: string, title: string, description: string, path: string, schema?: object, ogImage?: string, keywords?: string): string {
    const BASE = "https://innovatorfoundervisaassistant.co.uk";
    const canonicalUrl = `${BASE}${path}`;
    const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeDesc = description.replace(/"/g, "&quot;").replace(/</g, "&lt;");

    // Title
    html = html.includes('<title>')
      ? html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`)
      : html.replace('</head>', `    <title>${safeTitle}</title>\n  </head>`);

    // Meta description
    html = html.includes('name="description"')
      ? html.replace(/<meta name="description" content="[^"]*"\s*\/?>/,
          `<meta name="description" content="${safeDesc}" />`)
      : html.replace('</head>', `    <meta name="description" content="${safeDesc}" />\n  </head>`);

    // Canonical
    html = html.includes('rel="canonical"')
      ? html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonicalUrl}" />`)
      : html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);

    // Keywords
    if (keywords) {
      html = html.includes('name="keywords"')
        ? html.replace(/<meta name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${keywords.replace(/"/g, "&quot;")}" />`)
        : html.replace('</head>', `    <meta name="keywords" content="${keywords.replace(/"/g, "&quot;")}" />\n  </head>`);
    }

    // Robots directive
    html = html.includes('name="robots"')
      ? html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`)
      : html.replace('</head>', `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />\n  </head>`);

    // Resolve OG image to absolute URL
    const absoluteOgImage = ogImage
      ? (ogImage.startsWith("http") ? ogImage : `${BASE}${ogImage}`)
      : `${BASE}/og-image.webp`;

    // OG tags
    const ogTags = [
      `<meta property="og:title" content="${safeTitle}" />`,
      `<meta property="og:description" content="${safeDesc}" />`,
      `<meta property="og:url" content="${canonicalUrl}" />`,
      `<meta property="og:type" content="article" />`,
      `<meta property="og:image" content="${absoluteOgImage}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:site_name" content="UK Innovator Founder Visa Assistant" />`,
      `<meta property="og:locale" content="en_GB" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${safeTitle}" />`,
      `<meta name="twitter:description" content="${safeDesc}" />`,
      `<meta name="twitter:image" content="${absoluteOgImage}" />`,
    ].join("\n    ");

    // Remove stale OG/Twitter tags and inject fresh set
    html = html.replace(/<meta property="og:[^>]*\/?>/g, '');
    html = html.replace(/<meta name="twitter:[^>]*\/?>/g, '');
    html = html.replace('</head>', `    ${ogTags}\n  </head>`);

    // Schema.org JSON-LD — replace any existing seo-schema blocks
    if (schema) {
      html = html.replace(/<script type="application\/ld\+json" class="seo-schema">[\s\S]*?<\/script>/g, '');
      const schemaScript = `\n    <script type="application/ld+json" class="seo-schema">\n    ${JSON.stringify(schema, null, 2)}\n    </script>`;
      html = html.replace('</head>', `${schemaScript}\n  </head>`);
    }

    return html;
  }

  // fall through to index.html ONLY for non-API routes with SEO injection
  app.use("*", async (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next(); // Skip for API routes
    }

    let html = getBaseHtml();

    const BASE_DOMAIN = "https://innovatorfoundervisaassistant.co.uk";

    // ── Blog post route: /blog/:slug ──────────────────────────────────────────
    const blogMatch = req.path.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      try {
        const slug = blogMatch[1];
        const [post] = await db
          .select({
            title: blogPosts.title,
            metaTitle: blogPosts.metaTitle,
            metaDescription: blogPosts.metaDescription,
            excerpt: blogPosts.excerpt,
            slug: blogPosts.slug,
            publishedAt: blogPosts.publishedAt,
            author: blogPosts.author,
            category: blogPosts.category,
            featuredImage: blogPosts.featuredImage,
            readingTime: blogPosts.readingTime,
            tags: blogPosts.tags,
          })
          .from(blogPosts)
          .where(eq(blogPosts.slug, slug))
          .limit(1);

        if (post) {
          const title = (post.metaTitle || post.title) + " | UK Innovator Founder Visa Assistant";
          const description = post.metaDescription || post.excerpt || `Expert guide on ${post.title} — quad-AI verified UK Innovator Founder Visa advice.`;
          const publishedDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString();
          const postUrl = `${BASE_DOMAIN}/blog/${post.slug}`;
          const imageUrl = post.featuredImage
            ? (post.featuredImage.startsWith("http") ? post.featuredImage : `${BASE_DOMAIN}${post.featuredImage}`)
            : `${BASE_DOMAIN}/og-image.webp`;
          const keywords = (post.tags ?? []).join(", ") || "UK Innovator Founder Visa";

          // BlogPosting schema (more specific than Article — Google prefers this for blogs)
          const blogPostingSchema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": description,
            "image": { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 },
            "author": {
              "@type": "Organization",
              "name": "UK Innovator Founder Visa Assistant Team",
              "url": BASE_DOMAIN
            },
            "publisher": {
              "@type": "Organization",
              "name": "UK Innovator Founder Visa Assistant",
              "url": BASE_DOMAIN,
              "logo": { "@type": "ImageObject", "url": `${BASE_DOMAIN}/og-image.webp`, "width": 1200, "height": 630 }
            },
            "datePublished": publishedDate,
            "dateModified": publishedDate,
            "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl },
            "articleSection": post.category,
            "keywords": keywords,
            "timeRequired": `PT${post.readingTime ?? 8}M`,
            "about": { "@type": "Thing", "name": "UK Innovator Founder Visa" },
            "reviewedBy": [
              { "@type": "Organization", "name": "Gemini AI" },
              { "@type": "Organization", "name": "OpenAI GPT-4o" },
              { "@type": "Organization", "name": "Claude AI" },
              { "@type": "Organization", "name": "Qwen AI" }
            ]
          };

          // BreadcrumbList for blog post
          const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_DOMAIN },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_DOMAIN}/blog` },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": postUrl }
            ]
          };

          const combinedSchema = { "@context": "https://schema.org", "@graph": [blogPostingSchema, breadcrumbSchema] };

          console.log(`[SEO] Injecting BlogPosting meta for: /blog/${slug}`);
          html = injectMeta(html, title, description, req.path, combinedSchema, imageUrl, keywords);
        }
      } catch (err) {
        console.error("[SEO] Blog meta injection failed:", err);
      }
    }

    // ── Static route meta injection ───────────────────────────────────────────
    const meta = routeMeta[req.path];
    if (meta) {
      console.log(`[SEO] Injecting meta for route: ${req.path}`);
      html = injectMeta(html, meta.title, meta.description, req.path, meta.schema, undefined, meta.keywords);
    }

    // ── Universal fallback: ensure ALL pages get a canonical + robots tag ─────
    // (even routes not in routeMeta and not blog posts)
    if (!blogMatch && !meta) {
      const canonicalUrl = `${BASE_DOMAIN}${req.path}`;
      if (!html.includes('rel="canonical"')) {
        html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
      }
      if (!html.includes('name="robots"')) {
        html = html.replace('</head>', `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />\n  </head>`);
      }
    }

    res.send(html);
  });
}
const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// PhD-level optimization: Enable gzip/brotli compression for all responses
app.use(compression({
  level: 6, // Balanced compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    // Skip compression for images (already compressed)
    const contentType = res.getHeader('Content-Type');
    if (contentType && typeof contentType === 'string' && contentType.startsWith('image/')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Serve blog images - check local first, then S3
import { s3Storage } from "./services/s3Storage";
const blogLocalPaths = [
  path.join(process.cwd(), "client/src/assets/blog"),
  path.join(process.cwd(), "client/src/assets/blog/unique"),
  path.join(process.cwd(), "dist/public/assets/blog"),
  path.join(process.cwd(), "dist/public/assets/blog/unique"),
  path.join(process.cwd(), "public/assets/blog"),
];

// Unified blog image handler — covers all 4 URL patterns:
//   /assets/blog/:filename
//   /assets/blog/unique/:filename
//   /objects/blog/:filename
//   /objects/blog/unique/:filename
const uniqueLocalPaths = [
  path.join(process.cwd(), "client/src/assets/blog/unique"),
  path.join(process.cwd(), "dist/public/assets/blog/unique"),
  path.join(process.cwd(), "public/assets/blog/unique"),
];

async function serveBlogImage(filename: string, subdir: string | null, res: any, next: any) {
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  // Build ordered search paths — subdir-specific first, then all general paths
  const searchPaths = subdir === "unique"
    ? [...uniqueLocalPaths, ...blogLocalPaths]
    : blogLocalPaths;

  for (const dir of searchPaths) {
    const localPath = path.join(dir, filename);
    if (fs.existsSync(localPath)) {
      res.set({ "Content-Type": contentType, "Cache-Control": "public, max-age=604800" });
      return res.sendFile(localPath);
    }
  }

  // S3 fallback — try both with and without subdir prefix
  if (s3Storage.isAvailable()) {
    const s3Keys = subdir
      ? [`blog-images/${subdir}/${filename}`, `blog-images/${filename}`]
      : [`blog-images/${filename}`];
    for (const s3Key of s3Keys) {
      try {
        const buffer = await s3Storage.downloadFile(s3Key);
        res.set({ "Content-Type": contentType, "Cache-Control": "public, max-age=604800" });
        return res.send(buffer);
      } catch {}
    }
  }

  console.log(`[Blog] Image not found: ${subdir ? subdir + "/" : ""}${filename}`);
  next();
}

app.get(["/assets/blog/unique/:filename", "/objects/blog/unique/:filename"], async (req, res, next) => {
  await serveBlogImage(req.params.filename, "unique", res, next);
});

app.get(["/assets/blog/:filename", "/objects/blog/:filename"], async (req, res, next) => {
  await serveBlogImage(req.params.filename, null, res, next);
});

console.log("[Blog] Image route configured (local + unique + S3 fallback)");

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Log API latency to database for analytics (async, non-blocking)
      // Skip logging for the analytics endpoints themselves to avoid recursion
      if (!path.includes('/analytics/') && !path.includes('/activity/')) {
        const user = (req as any).user;
        db.execute(sql`
          INSERT INTO api_latency_log (route, method, status_code, duration_ms, user_id, timestamp)
          VALUES (${path}, ${req.method}, ${res.statusCode}, ${duration}, ${user?.id || null}, NOW())
        `).catch(() => {}); // Silently ignore errors to not affect main request
      }
    }
  });

  next();
});

// Disable caching for ALL API responses to ensure fresh data
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Never cache API responses - ensures mutations immediately reflect in UI
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// PhD-level SEO & Security: Add security headers
app.use((req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy for privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy (formerly Feature-Policy) - allow microphone for voice features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  
  // Content Security Policy (CSP) - allows Google Analytics, fonts, and APIs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://challenges.cloudflare.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://accounts.google.com https://api.resend.com wss:",
    "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  
  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerBusinessPlanRevisionRoutes(app);
  registerAdminBusinessPlanRevisionRoutes(app);
  startBusinessPlanGenerationWorker();
  startBusinessPlanRevisionWorker();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add middleware to skip static file serving for API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      // Skip to error handler if no route matched
      return next();
    }
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Verify Stripe mode on startup
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;
    if (stripeKey) {
      const mode = stripeKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
      const publicMode = stripePublicKey?.startsWith('pk_live_') ? 'LIVE' : 'TEST';
      log(`[STRIPE] Secret Key Mode: ${mode} | Public Key Mode: ${publicMode}`);
      if (mode === 'TEST') {
        log(`[STRIPE WARNING] Using TEST keys - payments will not be real!`);
      }
    } else {
      log(`[STRIPE WARNING] STRIPE_SECRET_KEY not configured!`);
    }
    
    // Start fully automated blog pipeline (generate → fix → publish, no human needed)
    setTimeout(async () => {
      try {
        const { startBlogPipeline } = await import("./blogPipeline.js");
        startBlogPipeline();
      } catch (err) {
        console.error("[Pipeline] Failed to start blog pipeline:", err);
      }
    }, 15000); // 15s delay to let server fully boot first

    // Start notification processing interval (every 5 minutes)
    const NOTIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    setInterval(async () => {
      try {
        const { processPendingNotifications } = await import("./services/notificationService");
        const processed = await processPendingNotifications();
        if (processed > 0) {
          log(`Processed ${processed} pending notifications`);
        }
      } catch (error) {
        console.error("Notification processing error:", error);
      }
    }, NOTIFICATION_INTERVAL);
    
    // Process notifications once on startup after a brief delay
    setTimeout(async () => {
      try {
        const { processPendingNotifications } = await import("./services/notificationService");
        const processed = await processPendingNotifications();
        if (processed > 0) {
          log(`Initial notification processing: ${processed} notifications sent`);
        }
      } catch (error) {
        console.error("Initial notification processing error:", error);
      }
    }, 10000); // 10 second delay after startup

    // Weekly SEO automation cron: every Monday at 8am GMT
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const msUntilNextMonday8am = (() => {
      const now = new Date();
      const next = new Date(now);
      const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon
      const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
      next.setUTCDate(next.getUTCDate() + daysUntilMonday);
      next.setUTCHours(8, 0, 0, 0);
      return Math.max(next.getTime() - now.getTime(), 60000);
    })();

    setTimeout(async () => {
      const runSeoWeeklyCron = async () => {
        try {
          const { runWeeklyAutomationCron } = await import("./seoAutomation.js");
          await runWeeklyAutomationCron();
        } catch (err) {
          console.error("[SEO Automation] Weekly cron error:", err);
        }
      };
      await runSeoWeeklyCron();
      setInterval(runSeoWeeklyCron, ONE_WEEK_MS);
    }, msUntilNextMonday8am);
    
  });
})();
