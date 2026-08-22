const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "server/routes.ts");
const source = fs.readFileSync(target, "utf8");
let next = source;

next = next.replace('import { getLatestNews, generateBreakingNews } from "./newsService";\n', "");

const legacyNewsRoutes = /\n  app\.get\("\/api\/news", async \(req, res\) => \{\n    try \{\n      const news = await getLatestNews\(\);[\s\S]*?\n  \}\);\n\n  app\.post\("\/api\/news\/check", async \(req, res\) => \{[\s\S]*?\n  \}\);\n/;
if (legacyNewsRoutes.test(next)) {
  next = next.replace(legacyNewsRoutes, "\n");
}

if (next.includes('from "./newsService"')) {
  throw new Error("Legacy hardcoded news service import is still active");
}
if (next.includes("const news = await getLatestNews();")) {
  throw new Error("Legacy hardcoded /api/news route is still active");
}
if (!next.includes('// NEWS FEED SYSTEM - Live UK Immigration News')) {
  throw new Error("Database-backed live news feed marker is missing");
}
if (!next.includes("news = await storage.getLatestNews(parseInt(limit as string));")) {
  throw new Error("Database-backed /api/news route is missing");
}

if (next !== source) {
  fs.writeFileSync(target, next, "utf8");
  console.log("[news] removed hardcoded route shadow; database-backed feed is active");
} else {
  console.log("[news] live database-backed route already active");
}
