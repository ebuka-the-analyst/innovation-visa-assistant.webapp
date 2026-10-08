import express, { type Request, Response, NextFunction } from "express";
import { rejectExecutableProbes } from "./security/executableProbeGuard";
import { registerRoutes } from "./routes";
import { startBusinessPlanGenerationWorker } from "./services/businessPlanGenerationService";
import { registerBusinessPlanRevisionRoutes } from "./businessPlanRevisionRoutes";
import { registerAdminBusinessPlanRevisionRoutes } from "./adminBusinessPlanRevisionRoutes";
import { startBusinessPlanRevisionWorker } from "./services/businessPlanRevisionService";
import { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";
import { registerSearchConsoleAdminRoutes } from "./searchConsoleAdmin";
import { getSeoProfile, renderSeoHtml } from "./seoPresentation";
import type { Express as ExpressType } from "express";
import type { Server } from "http";
import path from "path";
import fs from "fs";
import compression from "compression";
import { fileURLToPath } from "url";
import { db } from "./db";
import { sql } from "drizzle-orm";

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

  // Serve Vite-fingerprinted assets directly, but never serve index.html here.
  // HTML must pass through the host-aware SEO renderer below.
  app.use(
    express.static(distPath, {
      index: false,
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        const normalisedPath = filePath.split(path.sep).join("/");
        if (normalisedPath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  const indexPath = path.resolve(distPath, "index.html");

  // Single production HTML renderer. All public metadata, canonical URLs,
  // robots directives, approved SEO overrides and blog JSON-LD come from
  // server/seoPresentation.ts so production cannot drift from the SEO engine.
  app.use("*", async (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();

    try {
      const template = await fs.promises.readFile(indexPath, "utf8");
      const profile = getSeoProfile(req);
      const page = await renderSeoHtml(template, req);

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.setHeader("X-Robots-Tag", profile.robots);
      res.status(200).type("html").send(page);
    } catch (error) {
      next(error);
    }
  });
}
const app = express();

// Audit and reject PHP/WordPress reconnaissance before any SPA fallback.
app.use(rejectExecutableProbes);

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

// Production error-response shield: never expose server internals to end users.
// Route handlers may still return useful 4xx validation messages, while 5xx
// responses are normalised and correlated to an internal support reference.
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = ((body: any) => {
    if (
      process.env.NODE_ENV === "production" &&
      res.statusCode >= 500 &&
      !res.locals.preserveErrorResponse
    ) {
      const existingReference = body && typeof body === "object" ? body.reference : undefined;
      const reference = existingReference || ("IFVA-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase());
      const publicMessage = "We couldn't complete that request just now. Please try again.";

      res.setHeader("X-Error-Reference", reference);
      console.error("[" + reference + "] " + req.method + " " + req.path + " returned " + res.statusCode, body);
      return originalJson({
        message: publicMessage,
        error: publicMessage,
        reference,
      });
    }

    return originalJson(body);
  }) as any;

  next();
});

// Lightweight liveness endpoint used by Railway and external monitors.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

(async () => {
  const server = await registerRoutes(app);
  registerAIProviderGatewayRoutes(app);
  registerAIProviderAdminRoutes(app);
  registerSearchConsoleAdminRoutes(app);
  registerBusinessPlanRevisionRoutes(app);
  registerAdminBusinessPlanRevisionRoutes(app);
  startBusinessPlanGenerationWorker();
  startBusinessPlanRevisionWorker();

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const internalMessage = err.message || "Internal Server Error";
    const reference = "IFVA-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const publicMessage = process.env.NODE_ENV === "production" && status >= 500
      ? "We couldn't complete that request just now. Please try again."
      : internalMessage;

    console.error("[" + reference + "] Unhandled request error: " + req.method + " " + req.path, err);

    if (!res.headersSent) {
      res.setHeader("X-Error-Reference", reference);
      res.status(status).json({
        message: publicMessage,
        error: publicMessage,
        reference,
      });
    }
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

    // Lifetime SEO autopilot ranking monitor: refresh Search Console mission daily.
    // Content creation remains weekly and capped to avoid keyword cannibalisation.
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const runSeoDailyMonitor = async () => {
      try {
        const { refreshLifetimeTop5Autopilot } = await import("./seoAutomation.js");
        await refreshLifetimeTop5Autopilot(false);
      } catch (err) {
        console.error("[SEO Autopilot] Daily monitor error:", err);
      }
    };
    setTimeout(() => {
      runSeoDailyMonitor();
      setInterval(runSeoDailyMonitor, ONE_DAY_MS);
    }, 2 * 60 * 1000);

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
