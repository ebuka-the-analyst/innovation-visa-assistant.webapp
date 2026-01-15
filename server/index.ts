import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import type { Express as ExpressType } from "express";
import type { Server } from "http";
import path from "path";
import fs from "fs";
import compression from "compression";
import { fileURLToPath } from "url";

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
  // Add middleware to prevent Vite from handling API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      // For API routes, skip the Vite middleware by setting a flag
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

  // Serve sitemap.xml with correct content-type
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.sendFile(path.resolve(distPath, "sitemap.xml"));
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

  // Route-specific meta tags for SEO (server-side injection)
  const routeMeta: Record<string, { title: string; description: string; schema?: any }> = {
    '/faq': {
      title: 'UK Innovator Founder Visa FAQ | Common Questions Answered',
      description: 'Get answers to 25+ frequently asked questions about the UK Innovator Founder Visa. Expert guidance on endorsement, requirements, costs, timeline, and settlement.',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the UK Innovator Founder Visa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The UK Innovator Founder Visa is a visa route for experienced businesspeople seeking to establish an innovative, viable and scalable business in the UK."
            }
          }
        ]
      }
    },
    '/guide': {
      title: 'UK Innovator Founder Visa Complete Guide 2025 | Requirements, Process & Timeline',
      description: 'Comprehensive PhD-level guide to the UK Innovator Founder Visa. Learn requirements, endorsement process, innovation criteria, financial planning, and path to settlement.',
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "UK Innovator Founder Visa Complete Guide 2025",
        "description": "Comprehensive guide covering all aspects of the UK Innovator Founder Visa application process",
        "author": {
          "@type": "Organization",
          "name": "UK Innovator Founder Visa Assistant Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "UK Innovator Founder Visa Assistant"
        },
        "datePublished": "2025-01-01"
      }
    }
  };

  // fall through to index.html ONLY for non-API routes with SEO injection
  app.use("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next(); // Skip for API routes
    }

    let html = getBaseHtml();
    
    // Check if this route has specific meta tags  
    const meta = routeMeta[req.path];
    if (meta) {
      console.log(`[SEO] Injecting meta for route: ${req.path}`);
      // Inject route-specific title
      if (html.includes('<title>')) {
        html = html.replace(
          /<title>.*?<\/title>/,
          `<title>${meta.title}</title>`
        );
      } else {
        html = html.replace('</head>', `    <title>${meta.title}</title>\n  </head>`);
      }
      
      // Inject route-specific description
      if (html.includes('name="description"')) {
        html = html.replace(
          /<meta name="description" content=".*?"\/>/,
          `<meta name="description" content="${meta.description}"/>`
        );
      } else {
        html = html.replace('</head>', `    <meta name="description" content="${meta.description}"/>\n  </head>`);
      }
      
      // Inject canonical URL (handle whitespace variations)
      const canonicalUrl = `https://innovatorfoundervisaassistant.co.uk${req.path}`;
      if (html.includes('rel="canonical"')) {
        html = html.replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
          `<link rel="canonical" href="${canonicalUrl}" />`
        );
      } else {
        html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
      }
      
      // Inject OG URL (handle whitespace variations)
      if (html.includes('property="og:url"')) {
        html = html.replace(
          /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:url" content="${canonicalUrl}" />`
        );
      } else {
        html = html.replace('</head>', `    <meta property="og:url" content="${canonicalUrl}" />\n  </head>`);
      }
      
      // Inject route-specific schema if available
      if (meta.schema) {
        const schemaScript = `\n    <script type="application/ld+json" class="seo-schema">\n    ${JSON.stringify(meta.schema, null, 2)}\n    </script>`;
        html = html.replace('</head>', `${schemaScript}\n  </head>`);
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
  });
})();
