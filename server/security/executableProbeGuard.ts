import type { Request, Response, NextFunction } from "express";

// Reject executable-file probes before SPA fallback renders index.html.
// Requests to real application routes and assets are unaffected.
const PROBE_EXTENSION = /\.(?:php\d*|phtml|phar|asp|aspx|cgi|pl)(?:$|[/?#])/i;
const WORDPRESS_PATH = /(?:^|\/)wp-(?:admin|content|includes)(?:\/|$)/i;
const WINDOW_MS = 60_000;
const MAX_PROBES_PER_WINDOW = 20;
const MAX_IPS = 10_000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isExecutableProbe(path: string): boolean {
  return PROBE_EXTENSION.test(path) || WORDPRESS_PATH.test(path);
}

export function rejectExecutableProbes(req: Request, res: Response, next: NextFunction): void {
  const pathname = req.path || "/";
  if (!isExecutableProbe(pathname)) return next();

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  if (attempts.size > MAX_IPS) {
    for (const [key, item] of attempts) {
      if (item.resetAt <= now) attempts.delete(key);
    }
    if (attempts.size > MAX_IPS) attempts.clear();
  }
  const old = attempts.get(ip);
  const state = !old || old.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_MS }
    : { count: old.count + 1, resetAt: old.resetAt };
  attempts.set(ip, state);

  const status = state.count > MAX_PROBES_PER_WINDOW ? 429 : 404;
  // Avoid logging query parameters, headers, cookies, or session identifiers.
  console.warn(JSON.stringify({
    event: "security.executable_probe",
    timestamp: new Date(now).toISOString(),
    method: req.method,
    path: pathname.slice(0, 512),
    sourceIp: ip,
    status,
    countInWindow: state.count,
  }));
  res.setHeader("Cache-Control", "no-store");
  res.status(status).type("text/plain").send(status === 429 ? "Too Many Requests" : "Not Found");
}
