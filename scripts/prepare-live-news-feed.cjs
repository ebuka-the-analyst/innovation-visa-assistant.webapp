const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "server/routes.ts");
const source = fs.readFileSync(target, "utf8");
let next = source;

next = next.replace(
  'import { getLatestNews, generateBreakingNews } from "./newsService";\n',
  'import { getLatestNews } from "./newsService";\n',
);

if (!next.includes('import { getLatestNews } from "./newsService";')) {
  const anchor = 'import { z } from "zod";\n';
  if (!next.includes(anchor)) throw new Error("Could not locate news service import anchor");
  next = next.replace(anchor, `${anchor}import { getLatestNews } from "./newsService";\n`);
}

const legacyNewsRoutes = /\n  app\.get\("\/api\/news", async \(req, res\) => \{\n    try \{\n      const news = await getLatestNews\(\);[\s\S]*?\n  \}\);\n\n  app\.post\("\/api\/news\/check", async \(req, res\) => \{[\s\S]*?\n  \}\);\n/;
if (legacyNewsRoutes.test(next)) {
  next = next.replace(legacyNewsRoutes, "\n");
}

next = next.replace(
  /news = await storage\.getLatestNews\(parseInt\(limit as string\)\);/g,
  'news = await getLatestNews(parseInt(limit as string));',
);

if (!next.includes('// NEWS FEED SYSTEM - Live UK Immigration News')) {
  throw new Error("Live news route marker is missing");
}
if (!next.includes('import { getLatestNews } from "./newsService";')) {
  throw new Error("Live news service import is missing");
}
if (!next.includes("news = await getLatestNews(parseInt(limit as string));")) {
  throw new Error("Live /api/news route is not wired to the fallback-enabled service");
}
if (next.includes("const news = await getLatestNews();")) {
  throw new Error("Legacy shadow /api/news route is still active");
}

if (next !== source) {
  fs.writeFileSync(target, next, "utf8");
  console.log("[news] live stored feed with GOV.UK fallback is active");
} else {
  console.log("[news] live fallback-enabled route already active");
}
