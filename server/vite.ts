import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import {
  getSeoProfile,
  registerSeoDiscoveryRoutes,
  renderSeoHtml,
} from "./seoPresentation";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  registerSeoDiscoveryRoutes(app);
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Always reload index.html in development so metadata changes are immediate.
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      template = renderSeoHtml(template, req);
      const page = await vite.transformIndexHtml(url, template);
      const profile = getSeoProfile(req);
      res.setHeader("X-Robots-Tag", profile.robots);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

function setApplicationShellHeaders(res: Response) {
  // Never allow an old HTML shell to outlive the hashed asset manifest from the
  // deployment that created it. Browsers/proxies must request the current shell.
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // These routes are intentionally generated at request time so the same build can
  // serve visaassistant.global and the legacy Innovator Founder hostname safely.
  registerSeoDiscoveryRoutes(app);

  app.use(express.static(distPath, {
    // Do not let express.static serve index.html directly. The catch-all below must
    // inject hostname/path-specific metadata into every HTML response.
    index: false,
    setHeaders: (res, filePath) => {
      const normalisedPath = filePath.split(path.sep).join("/");
      if (normalisedPath.endsWith("/index.html")) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
        return;
      }

      // Vite fingerprints production assets. A fingerprinted URL is safe to cache
      // for a long time because a content change produces a new filename.
      if (normalisedPath.includes("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // Fall through to index.html for client-side routes. Render the HTML shell per
  // request so crawlers receive correct title, canonical, robots, social metadata
  // and JSON-LD even when they do not execute the React application.
  app.use("*", async (req, res, next) => {
    try {
      setApplicationShellHeaders(res);
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const profile = getSeoProfile(req);
      const page = renderSeoHtml(template, req);
      res.setHeader("X-Robots-Tag", profile.robots);
      res.status(200).type("html").send(page);
    } catch (error) {
      next(error);
    }
  });
}
