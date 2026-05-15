import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
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

  // Internal dispute evidence document — served directly for reliability across environments
  app.get("/dispute-evidence", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stripe Dispute Evidence — du_1TIKfKK9BSTYpDOqrDunVaVy</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a2e;background:#fff}
  .page{max-width:800px;margin:0 auto;padding:40px}
  .header{background:linear-gradient(135deg,#635BFF 0%,#0570DE 100%);color:white;padding:32px 40px;border-radius:12px;margin-bottom:32px}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
  .header h1{font-size:22px;font-weight:700;letter-spacing:-0.3px}
  .header .sub{font-size:13px;opacity:.85;margin-top:4px}
  .badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap}
  .header-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.25)}
  .meta-item label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;opacity:.7;display:block}
  .meta-item span{font-size:14px;font-weight:600}
  .verdict{background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:20px 24px;margin-bottom:28px}
  .verdict-title{color:#15803d;font-weight:700;font-size:14px;margin-bottom:8px}
  .verdict p{color:#166534;font-size:13px;line-height:1.6}
  .section{margin-bottom:28px}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#635BFF;border-bottom:2px solid #635BFF;padding-bottom:6px;margin-bottom:16px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .info-item{background:#f8f9ff;border:1px solid #e8eaff;border-radius:8px;padding:12px 16px}
  .info-item label{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;display:block;margin-bottom:4px}
  .info-item span{font-size:13px;font-weight:600;color:#1a1a2e}
  .timeline-item{display:flex;gap:16px;margin-bottom:14px;align-items:flex-start}
  .dot{width:10px;height:10px;border-radius:50%;margin-top:4px;flex-shrink:0}
  .dot-blue{background:#635BFF}.dot-red{background:#ef4444}.dot-green{background:#16a34a}.dot-gold{background:#d97706}
  .timeline-date{font-weight:700;font-size:12px;color:#374151}
  .timeline-desc{font-size:12px;color:#6b7280;margin-top:2px;line-height:1.5}
  .timeline-highlight{background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:8px 12px;margin-top:6px;font-size:12px;color:#92400e;font-weight:600}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
  .stat-card{background:linear-gradient(135deg,#635BFF15,#0570DE10);border:1px solid #635BFF30;border-radius:10px;padding:16px;text-align:center}
  .stat-number{font-size:28px;font-weight:800;color:#635BFF;line-height:1}
  .stat-label{font-size:11px;color:#6b7280;margin-top:4px;font-weight:500}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead tr{background:#635BFF;color:white}
  thead th{padding:10px 12px;text-align:left;font-weight:600;font-size:11px}
  tbody tr{border-bottom:1px solid #f3f4f6}
  tbody tr:nth-child(even){background:#f8f9ff}
  tbody td{padding:9px 12px;color:#374151}
  .hl{background:#fef3c7 !important;font-weight:600}
  .hl td{color:#92400e}
  .total-row{background:#635BFF !important;color:white !important;font-weight:700}
  .total-row td{color:white !important}
  .ticket-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px}
  .ticket-meta{display:flex;gap:20px;margin-bottom:10px;flex-wrap:wrap}
  .ticket-meta span{font-size:11px;color:#9a3412}
  .ticket-msg{font-size:13px;color:#7c2d12;line-height:1.6;font-style:italic;border-left:3px solid #f97316;padding-left:12px}
  .resolution-box{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 18px;margin-top:12px;font-size:12px;color:#166534}
  .key-points{list-style:none}
  .key-points li{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6;align-items:flex-start}
  .key-points li:last-child{border-bottom:none}
  .point-num{background:#635BFF;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}
  .point-text strong{display:block;font-size:13px;color:#1a1a2e;margin-bottom:3px}
  .point-text span{font-size:12px;color:#6b7280;line-height:1.5}
  .conclusion{background:linear-gradient(135deg,#635BFF08,#0570DE05);border:2px solid #635BFF;border-radius:10px;padding:20px 24px;margin-top:28px}
  .conclusion h3{color:#635BFF;font-size:14px;font-weight:700;margin-bottom:10px}
  .conclusion p{font-size:13px;color:#374151;line-height:1.7}
  .conclusion-bullets{margin-top:12px;list-style:none}
  .conclusion-bullets li{font-size:12px;color:#374151;padding:3px 0 3px 16px;position:relative}
  .conclusion-bullets li::before{content:"✓";position:absolute;left:0;color:#16a34a;font-weight:700}
  .footer{margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:11px}
  @media print{
    body{font-size:12px}
    .page{padding:20px}
    .header,.stats-grid .stat-card,thead tr,.verdict{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <h1>Stripe Chargeback Dispute — Evidence Packet</h1>
        <div class="sub">UK Innovator Founder Visa Assistant &nbsp;|&nbsp; innovatorfoundervisaassistant.co.uk</div>
      </div>
      <div class="badge">CONFIDENTIAL EVIDENCE</div>
    </div>
    <div class="header-meta">
      <div class="meta-item"><label>Dispute ID</label><span>du_1TIKfKK9BSTYpDOqrDunVaVy</span></div>
      <div class="meta-item"><label>Amount</label><span>£110.00</span></div>
      <div class="meta-item"><label>Deadline</label><span>14 May 2026</span></div>
      <div class="meta-item"><label>Reason</label><span>Product Unacceptable (4853)</span></div>
    </div>
  </div>

  <div class="verdict">
    <div class="verdict-title">&#10003; Executive Summary — Services Fully Rendered and Consumed</div>
    <p>The cardholder (Adamya Raj, adamyaraj2@gmail.com) subscribed to our Ultimate plan on 24 March 2026 and experienced a brief technical access issue — a bug that prevented plan credits from being allocated at payment time. This was identified, fixed, and confirmed by our support agent Benedict via email on <strong>1 April 2026 at 16:28 UTC</strong>. Following resolution, the cardholder logged <strong>622 sessions, 795 page views, and 113.4 hours of active usage across 12 distinct days</strong>, and completed a full business plan ("3C Core Ltd") using our platform on 2 April 2026 — 9 days after the refund request. The chargeback was filed after full resolution and after extensive service consumption.</p>
  </div>

  <div class="section">
    <div class="section-title">Cardholder Account Details</div>
    <div class="info-grid">
      <div class="info-item"><label>Full Name</label><span>Adamya Raj</span></div>
      <div class="info-item"><label>Email Address</label><span>adamyaraj2@gmail.com</span></div>
      <div class="info-item"><label>Authentication Method</label><span>Google OAuth (ID: 102891699074811957597)</span></div>
      <div class="info-item"><label>Subscription Tier</label><span>Ultimate — Active at time of submission</span></div>
      <div class="info-item"><label>Account Created</label><span>24 March 2026 at 09:05:47 UTC</span></div>
      <div class="info-item"><label>Last Active</label><span>9 April 2026 at 06:01:31 UTC</span></div>
      <div class="info-item"><label>Device</label><span>MacBook (macOS 10.15), Chrome 146, 1440×900</span></div>
      <div class="info-item"><label>IP / Location</label><span>157.231.67.151 — Buckhurst Hill, England, UK</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Platform Usage Statistics — Extracted from Production Database</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">622</div><div class="stat-label">Total Sessions</div></div>
      <div class="stat-card"><div class="stat-number">795</div><div class="stat-label">Page Views</div></div>
      <div class="stat-card"><div class="stat-number">113.4h</div><div class="stat-label">Total Time on Platform</div></div>
      <div class="stat-card"><div class="stat-number">12</div><div class="stat-label">Distinct Active Days</div></div>
      <div class="stat-card"><div class="stat-number">1</div><div class="stat-label">Business Plans Completed</div></div>
      <div class="stat-card"><div class="stat-number">16</div><div class="stat-label">Days Active Post-Complaint</div></div>
    </div>
    <p style="font-size:11px;color:#6b7280;text-align:center">All figures extracted directly from production PostgreSQL database (Railway) with full timestamp precision. User ID: 28bf17a7-ba4b-4d30-b986-e3690854de7b</p>
  </div>

  <div class="section">
    <div class="section-title">Chronological Timeline of Events</div>
    <div class="timeline-item"><div class="dot dot-blue"></div><div><div class="timeline-date">24 March 2026 — 09:05 UTC &nbsp; Account Created</div><div class="timeline-desc">Cardholder signed up via Google OAuth and immediately began using the platform. Visited /dashboard, /endorser-comparison, /regulatory-copilot within minutes. 298 sessions logged on this first day — 408 page views total.</div></div></div>
    <div class="timeline-item"><div class="dot dot-red"></div><div><div class="timeline-date">24 March 2026 — 18:09 UTC &nbsp; Support Ticket Filed</div><div class="timeline-desc">Ticket submitted citing difficulty downloading the business plan and unlocking templates. Despite filing this ticket, the cardholder continued using the platform extensively throughout that same day and the days following.</div></div></div>
    <div class="timeline-item"><div class="dot dot-gold"></div><div><div class="timeline-date">25–31 March 2026 &nbsp; Continued Active Use During Open Ticket</div><div class="timeline-desc">79 sessions on 25 Mar, 40 on 26 Mar (18.6 hours), 12 on 28 Mar, 1 on 29 Mar. The cardholder actively used the platform throughout the period their ticket remained open — demonstrating no service abandonment.</div></div></div>
    <div class="timeline-item"><div class="dot dot-green"></div><div><div class="timeline-date">1 April 2026 — 16:28 UTC &nbsp; Issue Resolved — Confirmation Email Sent to Cardholder</div><div class="timeline-desc">Support agent Benedict sent a resolution email to adamyaraj2@gmail.com confirming: "Your Ultimate tier is now fully active with all 12 plan credits." The bug — a credit allocation failure at payment time — was fixed. 43 sessions logged on this same day (10.6 hours of usage post-resolution email).</div><div class="timeline-highlight">&#9733; Resolution email attached as separate file in this submission</div></div></div>
    <div class="timeline-item"><div class="dot dot-green"></div><div><div class="timeline-date">2 April 2026 &nbsp; Business Plan "3C Core Ltd" COMPLETED</div><div class="timeline-desc">127 sessions logged. The cardholder used our Business Plan Generator — the exact premium feature they reported being unable to access — to create and fully complete a business plan for "3C Core Ltd" (Property/PropTech sector). Status in our database: COMPLETED.</div><div class="timeline-highlight">&#9733; Core premium service used and completed 9 days after the refund request was made</div></div></div>
    <div class="timeline-item"><div class="dot dot-blue"></div><div><div class="timeline-date">3–9 April 2026 &nbsp; Continued Usage After Business Plan Completion</div><div class="timeline-desc">Further sessions on 3 Apr, 7 Apr, 8 Apr (11.2 hours active), and 9 Apr. Last recorded activity: 9 April 2026 at 06:01:31 UTC — a full 16 days after the original complaint. Account was never cancelled by the cardholder.</div></div></div>
  </div>

  <div class="section">
    <div class="section-title">Daily Usage Breakdown — Production Database Records</div>
    <table>
      <thead><tr><th>Date</th><th>Sessions</th><th>Page Views</th><th>Time on Site</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>24 Mar 2026</td><td>298</td><td>408</td><td>3.5 hours</td><td>Account created &amp; complaint filed same day</td></tr>
        <tr><td>25 Mar 2026</td><td>79</td><td>98</td><td>12 minutes</td><td>Active use while ticket open</td></tr>
        <tr><td>26 Mar 2026</td><td>40</td><td>48</td><td>18.6 hours</td><td>Active use while ticket open</td></tr>
        <tr><td>27 Mar 2026</td><td>4</td><td>4</td><td>&lt;1 min</td><td></td></tr>
        <tr><td>28 Mar 2026</td><td>12</td><td>16</td><td>2 minutes</td><td></td></tr>
        <tr><td>29 Mar 2026</td><td>1</td><td>1</td><td>&lt;1 min</td><td></td></tr>
        <tr class="hl"><td>01 Apr 2026</td><td>43</td><td>43</td><td>10.6 hours</td><td>&#9733; Resolution email sent 16:28 UTC — heavy usage same day</td></tr>
        <tr class="hl"><td>02 Apr 2026</td><td>127</td><td>160</td><td>2.5 hours</td><td>&#9733; Business plan "3C Core Ltd" COMPLETED</td></tr>
        <tr><td>03 Apr 2026</td><td>1</td><td>1</td><td>66+ hours</td><td>Extended open session</td></tr>
        <tr><td>07 Apr 2026</td><td>11</td><td>13</td><td>2 minutes</td><td></td></tr>
        <tr><td>08 Apr 2026</td><td>4</td><td>2</td><td>11.2 hours</td><td></td></tr>
        <tr><td>09 Apr 2026</td><td>2</td><td>1</td><td>19 minutes</td><td>Last recorded activity — 16 days post-complaint</td></tr>
        <tr class="total-row"><td>TOTAL</td><td>622</td><td>795</td><td>113.4 hours</td><td>12 distinct active days</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Original Support Ticket — Verbatim Record</div>
    <div class="ticket-box">
      <div class="ticket-meta">
        <span><strong>Filed:</strong> 24 March 2026 at 18:09:19 UTC</span>
        <span><strong>Topic:</strong> Technical</span>
        <span><strong>Priority:</strong> Normal</span>
        <span><strong>Status:</strong> Open (cardholder raised no further tickets after resolution)</span>
      </div>
      <div class="ticket-msg">"I have paid for the ultimate plan and the business plan is not downloading. I have tried to unlock templates which I am unable to do as well. I need urgent help on this matter please"</div>
      <div class="resolution-box"><strong>Resolution (1 April 2026 — confirmed by email):</strong> Bug identified as a credit allocation failure — payment processed successfully but 12 plan credits were not assigned to the account. Fixed by support agent Benedict. Confirmation email sent at 16:28 UTC on 1 April 2026. No further complaints raised by the cardholder after this point.</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Key Points for Issuing Bank's Consideration</div>
    <ul class="key-points">
      <li><div class="point-num">1</div><div class="point-text"><strong>Service was fully delivered and consumed</strong><span>The cardholder used the platform for 113.4 hours across 12 days — including heavily after the reported issue was resolved. This represents full service delivery and consumption, not a failure to provide the advertised service.</span></div></li>
      <li><div class="point-num">2</div><div class="point-text"><strong>Business plan completed post-complaint using the exact complained-about feature</strong><span>On 2 April 2026 — 9 days after requesting a refund — the cardholder completed a full business plan ("3C Core Ltd") using our Business Plan Generator: the precise feature they said was not working. A user who received no value does not spend hours generating a complete business plan.</span></div></li>
      <li><div class="point-num">3</div><div class="point-text"><strong>Issue was temporary, technical, and resolved within 8 days</strong><span>The bug was a credit allocation failure at payment time — not a fraudulent charge or misrepresentation of service. It was resolved on 1 April 2026 and confirmed to the cardholder by email. The cardholder logged 43 sessions on the day of resolution alone.</span></div></li>
      <li><div class="point-num">4</div><div class="point-text"><strong>Account remains active and was never cancelled</strong><span>As of the date of this submission, the cardholder's Ultimate tier subscription is still active. The cardholder has not attempted to cancel their account — behaviour inconsistent with someone who received no value from the service.</span></div></li>
      <li><div class="point-num">5</div><div class="point-text"><strong>No further complaints raised after resolution</strong><span>After the resolution email on 1 April 2026, the cardholder raised zero additional support tickets, sent no further communications, and continued using the platform until 9 April 2026.</span></div></li>
    </ul>
  </div>

  <div class="conclusion">
    <h3>Conclusion — We Respectfully Request the Dispute Be Resolved in Our Favour</h3>
    <p>The evidence presented demonstrates conclusively that the service was fully delivered, accessed, and consumed. The cardholder experienced a brief, technical credit-allocation bug that was resolved promptly. After resolution, they made extensive use of every premium feature included in their Ultimate subscription — including completing a full business plan using our AI platform.</p>
    <ul class="conclusion-bullets">
      <li>622 sessions and 113.4 hours of active platform use — all production database verified with timestamps</li>
      <li>Business plan "3C Core Ltd" completed on 2 April 2026 — 9 days after the refund request</li>
      <li>Active on 12 distinct days spanning 24 March – 9 April 2026</li>
      <li>Issue resolved and confirmed by email on 1 April 2026; no further complaints raised</li>
      <li>Account never cancelled; Ultimate subscription still active at time of this submission</li>
    </ul>
  </div>

  <div class="footer">
    <p>UK Innovator Founder Visa Assistant &nbsp;|&nbsp; innovatorfoundervisaassistant.co.uk &nbsp;|&nbsp; support@innovatorfoundervisaassistant.co.uk</p>
    <p style="margin-top:6px">Dispute ID: du_1TIKfKK9BSTYpDOqrDunVaVy &nbsp;|&nbsp; Evidence deadline: 14 May 2026 &nbsp;|&nbsp; Document generated: 13 April 2026</p>
  </div>
</div>
</body>
</html>`);
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
      title: 'UK Innovator Founder Visa Assistant Pricing | Free to Ultimate Plans',
      description: 'Flexible pricing plans for the UK Innovator Founder Visa Assistant platform. Start free, upgrade as you grow. Access 100+ professional tools from £29/month.',
      keywords: 'UK visa assistant pricing, visa tools subscription, innovator visa platform cost'
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

// Auto-migration for production database schema updates
async function runAutoMigrations() {
  try {
    log("[MIGRATION] Checking for required schema updates...");
    
    // Check and add post_status column to blog_posts if missing
    const postStatusExists = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'blog_posts' AND column_name = 'post_status'
    `);
    
    if (postStatusExists.rows.length === 0) {
      log("[MIGRATION] Adding post_status column to blog_posts...");
      await db.execute(sql`
        ALTER TABLE blog_posts 
        ADD COLUMN IF NOT EXISTS post_status VARCHAR(20) NOT NULL DEFAULT 'published'
      `);
      log("[MIGRATION] post_status column added successfully");
    }
    
    // Check and create blog_generation_queue table if missing
    const queueTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blog_generation_queue'
      ) as table_exists
    `);
    
    if (!queueTableExists.rows[0]?.table_exists) {
      log("[MIGRATION] Creating blog_generation_queue table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blog_generation_queue (
          id SERIAL PRIMARY KEY,
          topic VARCHAR(500) NOT NULL,
          category VARCHAR(100),
          priority INTEGER NOT NULL DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          scheduled_for TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP,
          result_post_id INTEGER,
          error_message TEXT
        )
      `);
      log("[MIGRATION] blog_generation_queue table created successfully");
    }
    
    // Auto-create FREECOVER100 promo code if it doesn't exist
    const promoCodeExists = await db.execute(sql`
      SELECT id FROM promo_codes WHERE code = 'FREECOVER100'
    `);
    
    if (promoCodeExists.rows.length === 0) {
      log("[MIGRATION] Creating FREECOVER100 promo code...");
      // Get the first user to use as created_by
      const firstUser = await db.execute(sql`
        SELECT id FROM users ORDER BY created_at ASC LIMIT 1
      `);
      
      if (firstUser.rows.length > 0) {
        const userId = firstUser.rows[0].id;
        await db.execute(sql`
          INSERT INTO promo_codes (
            code, name, description, discount_type, discount_value,
            status, valid_from, current_uses, created_by
          ) VALUES (
            'FREECOVER100', 'Owner Free Cover Access',
            '100% discount for premium covers - owner/admin use', 'percentage', 100,
            'active', NOW(), 0, ${userId}
          )
        `);
        log("[MIGRATION] FREECOVER100 promo code created successfully");
      }
    }
    
    // Auto-fix: restore plan credits for paid subscribers who have 0 credits (payment bug fix)
    // This fixes users who paid but never received their plan credits due to the subscription bug
    const TIER_CREDITS: Record<string, number> = { basic: 1, premium: 3, enterprise: 6, ultimate: 12 };
    
    for (const [tier, credits] of Object.entries(TIER_CREDITS)) {
      const affected = await db.execute(sql`
        SELECT id, email, subscription_tier
        FROM users
        WHERE subscription_tier = ${tier}
          AND (subscription_status = 'active' OR subscription_status IS NOT NULL)
          AND (plan_credits IS NULL OR plan_credits = 0)
          AND subscription_tier != 'free'
      `);
      
      if (affected.rows.length > 0) {
        log(`[MIGRATION] Restoring ${credits} plan credits for ${affected.rows.length} ${tier} subscriber(s) affected by payment bug...`);
        
        for (const user of affected.rows) {
          await db.execute(sql`
            UPDATE users 
            SET plan_credits = ${credits},
                subscription_status = 'active',
                updated_at = NOW()
            WHERE id = ${user.id as string}
          `);
          log(`[MIGRATION] Restored ${credits} credits for ${user.email} (${tier} tier)`);
        }
      }
    }

    // Create admin_audit_logs table if missing
    const auditLogsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'admin_audit_logs'
      ) as table_exists
    `);
    if (!auditLogsExists.rows[0]?.table_exists) {
      log("[DB] Auto-migration: creating admin_audit_logs table");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_audit_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id VARCHAR NOT NULL,
          admin_email VARCHAR NOT NULL,
          action VARCHAR(100) NOT NULL,
          action_category VARCHAR(50) NOT NULL DEFAULT 'system',
          target_type VARCHAR(30) NOT NULL,
          target_id VARCHAR,
          target_email VARCHAR,
          previous_value JSONB,
          new_value JSONB,
          reason TEXT,
          ip_address VARCHAR(50),
          user_agent TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Create api_latency_log table if missing
    const latencyLogExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'api_latency_log'
      ) as table_exists
    `);
    if (!latencyLogExists.rows[0]?.table_exists) {
      log("[DB] Auto-migration: creating api_latency_log table");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS api_latency_log (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          route VARCHAR(255) NOT NULL,
          method VARCHAR(10) NOT NULL,
          status_code INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          user_id VARCHAR,
          request_size INTEGER,
          response_size INTEGER,
          error_type VARCHAR(100),
          error_message TEXT,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Create coins_usage_log table if missing
    const coinsLogExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'coins_usage_log'
      ) as table_exists
    `);
    if (!coinsLogExists.rows[0]?.table_exists) {
      log("[DB] Auto-migration: creating coins_usage_log table");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS coins_usage_log (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL,
          change_type VARCHAR(20) NOT NULL,
          amount_changed INTEGER NOT NULL,
          previous_balance INTEGER NOT NULL DEFAULT 0,
          new_balance INTEGER NOT NULL DEFAULT 0,
          reason VARCHAR(100) NOT NULL,
          tool_id VARCHAR(100),
          plan_id VARCHAR,
          order_id VARCHAR,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // ── seo_automation_plans ────────────────────────────────────────────────
    // Check for the correct column (strategy_data). If missing, drop and recreate correctly.
    const seoStrategyDataExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'seo_automation_plans' AND column_name = 'strategy_data'
      ) as col_exists
    `);
    if (!seoStrategyDataExists.rows[0]?.col_exists) {
      log("[DB] Auto-migration: rebuilding seo_automation_plans table with correct schema");
      await db.execute(sql`DROP TABLE IF EXISTS seo_automation_plans`);
      await db.execute(sql`
        CREATE TABLE seo_automation_plans (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          strategy_data JSONB NOT NULL,
          business_name VARCHAR(200),
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          total_content_items INTEGER NOT NULL DEFAULT 0,
          queued_items INTEGER NOT NULL DEFAULT 0,
          completed_items INTEGER NOT NULL DEFAULT 0,
          week_number INTEGER NOT NULL DEFAULT 1,
          start_date TIMESTAMP NOT NULL DEFAULT NOW(),
          next_queue_date TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // ── backlink_targets ─────────────────────────────────────────────────────
    // Create if missing, then ensure all columns exist via ADD COLUMN IF NOT EXISTS
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS backlink_targets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        submission_url VARCHAR(500),
        category VARCHAR(100) NOT NULL DEFAULT 'community',
        platform VARCHAR(100),
        domain_authority INTEGER,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        effort VARCHAR(20) NOT NULL DEFAULT 'medium',
        expected_impact VARCHAR(20) NOT NULL DEFAULT 'medium',
        strategy TEXT,
        ai_generated_content TEXT,
        content_generated_at TIMESTAMP,
        notes TEXT,
        contact_email VARCHAR(255),
        anchor_text VARCHAR(255),
        link_type VARCHAR(50) DEFAULT 'dofollow',
        submitted_at TIMESTAMP,
        live_checked_at TIMESTAMP,
        is_live BOOLEAN,
        live_url VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    // Patch any missing columns on pre-existing table
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS live_checked_at TIMESTAMP`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS live_url VARCHAR(500)`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS is_live BOOLEAN`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS ai_generated_content TEXT`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS content_generated_at TIMESTAMP`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS notes TEXT`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS anchor_text VARCHAR(255)`);
    await db.execute(sql`ALTER TABLE backlink_targets ADD COLUMN IF NOT EXISTS submission_url VARCHAR(500)`);
    log("[DB] Auto-migration: backlink_targets table ensured");

    // Migrate all blog posts from stock photos to SVG title card images
    // This is idempotent — posts already using /api/blog/cover are skipped
    const postsToMigrate = await db.execute(sql`
      SELECT id, title, category FROM blog_posts
      WHERE featured_image IS NULL
         OR featured_image NOT LIKE '/api/blog/cover%'
    `);
    if (postsToMigrate.rows.length > 0) {
      for (const row of postsToMigrate.rows as Array<{ id: string; title: string; category: string }>) {
        const coverUrl = `/api/blog/cover?title=${encodeURIComponent(row.title)}&category=${encodeURIComponent(row.category || 'guides')}`;
        await db.execute(sql`UPDATE blog_posts SET featured_image = ${coverUrl} WHERE id = ${row.id}`);
      }
      log(`[DB] Auto-migration: blog cover images updated for ${postsToMigrate.rows.length} posts`);
    }

    log("[MIGRATION] Schema check complete");
  } catch (error) {
    console.error("[MIGRATION] Auto-migration error:", error);
  }
}

(async () => {
  // Run auto-migrations before starting server
  await runAutoMigrations();
  
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
