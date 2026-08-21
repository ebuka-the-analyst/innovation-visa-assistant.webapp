const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();

function update(relativePath, transform) {
  const target = path.join(root, relativePath);
  const before = fs.readFileSync(target, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, "utf8");
    console.log(`[public-expert-booking] prepared ${relativePath}`);
  }
}

update("server/index.ts", (source) => {
  let next = source;
  if (!next.includes('from "./publicExpertBookingRoutes"')) {
    const importAnchor = 'import { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";';
    if (!next.includes(importAnchor)) throw new Error("Could not locate server route import anchor");
    next = next.replace(importAnchor, `${importAnchor}\nimport { registerPublicExpertBookingRoutes } from "./publicExpertBookingRoutes";`);
  }
  if (!next.includes("registerPublicExpertBookingRoutes(app);")) {
    const routeAnchor = "  registerAIProviderGatewayRoutes(app);";
    if (!next.includes(routeAnchor)) throw new Error("Could not locate server route registration anchor");
    next = next.replace(routeAnchor, `${routeAnchor}\n  registerPublicExpertBookingRoutes(app);`);
  }
  return next;
});

update("client/src/App.tsx", (source) => {
  if (source.includes('"/expert-booking"') && source.match(/SIDEBAR_HIDDEN_ROUTES[^\n]+expert-booking/)) return source;
  const match = source.match(/const SIDEBAR_HIDDEN_ROUTES = \[([^\]]*)\];/);
  if (!match) throw new Error("Could not locate public route list");
  const current = match[1].trim();
  return source.replace(match[0], `const SIDEBAR_HIDDEN_ROUTES = [${current}${current ? ", " : ""}"/expert-booking"];`);
});

update("client/src/pages/expert-booking.tsx", (source) => {
  let next = source;
  if (!next.includes('PublicExpertBooking from "@/components/expert-booking/PublicExpertBooking"')) {
    const anchor = 'import { useEffect, useMemo, useRef, useState } from "react";';
    if (!next.includes(anchor)) throw new Error("Could not locate Expert Booking import anchor");
    next = next.replace(anchor, `${anchor}\nimport PublicExpertBooking from "@/components/expert-booking/PublicExpertBooking";`);
  }
  if (next.includes("export default function ExpertBooking()")) {
    next = next.replace(
      "export default function ExpertBooking()",
      "export default PublicExpertBooking;\n\nfunction LegacyExpertBooking()",
    );
  }
  if (!next.includes("export default PublicExpertBooking;")) {
    throw new Error("Public Expert Booking was not installed as the default page");
  }
  return next;
});

update("client/src/pages/tools-hub.tsx", (source) => {
  let next = source;
  if (!next.includes("OPEN_ACCESS_TOOLS")) {
    const anchor = "const unavailableToolIds = new Set<string>(UNAVAILABLE_LISTED_TOOL_IDS);\nconst PUBLIC_TOOLS: Tool[] = ALL_TOOLS.filter((tool) => !unavailableToolIds.has(tool.id));";
    if (!next.includes(anchor)) throw new Error("Could not locate Tools Hub registry anchor");
    const replacement = `const unavailableToolIds = new Set<string>(UNAVAILABLE_LISTED_TOOL_IDS);\nconst OPEN_ACCESS_TOOLS: Tool[] = [\n  { id: "expert-booking", name: "Expert Booking", description: "Browse verified professionals, choose a live time and book a paid consultation.", category: "documentation", stage: "before", tier: "free", icon: "CalendarCheck2" },\n  { id: "blog", name: "Blog", description: "Read practical Innovator Founder guides, updates and founder resources.", category: "documentation", stage: "before", tier: "free", icon: "Newspaper" },\n];\nconst OPEN_ACCESS_ROUTES: Record<string, string> = { "expert-booking": "/expert-booking", blog: "/blog" };\nconst OPEN_ACCESS_TOOL_IDS = new Set(OPEN_ACCESS_TOOLS.map((tool) => tool.id));\nconst PUBLIC_TOOLS: Tool[] = [\n  ...OPEN_ACCESS_TOOLS,\n  ...ALL_TOOLS.filter((tool) => !unavailableToolIds.has(tool.id) && !OPEN_ACCESS_TOOL_IDS.has(tool.id)),\n];`;
    next = next.replace(anchor, replacement);
  }

  const tierAnchor = `  const getEffectiveTier = (tool: Tool): ToolTier | undefined =>\n    getToolAccess(tool.id)?.minimumPlanId;\n  const canAccessManagedTool = (tool: Tool) =>\n    getToolAccess(tool.id)?.allowed === true;`;
  if (next.includes(tierAnchor)) {
    next = next.replace(tierAnchor, `  const getEffectiveTier = (tool: Tool): ToolTier | undefined =>\n    OPEN_ACCESS_TOOL_IDS.has(tool.id) ? "free" : getToolAccess(tool.id)?.minimumPlanId;\n  const canAccessManagedTool = (tool: Tool) =>\n    OPEN_ACCESS_TOOL_IDS.has(tool.id) || getToolAccess(tool.id)?.allowed === true;`);
  }

  const clickAnchor = `  const handleToolClick = (tool: Tool) => {\n    if (!auth.isLoading && !auth.isAuthenticated) {`;
  if (next.includes(clickAnchor)) {
    next = next.replace(clickAnchor, `  const handleToolClick = (tool: Tool) => {\n    const openRoute = OPEN_ACCESS_ROUTES[tool.id];\n    if (openRoute) {\n      addRecent(tool.id);\n      setLocation(openRoute);\n      return;\n    }\n    if (!auth.isLoading && !auth.isAuthenticated) {`);
  }

  next = next.replace(
    "      const matchesTier = !tierFilter || getEffectiveTier(tool) === tierFilter;",
    "      const matchesTier = !tierFilter || (tierFilter === \"free\" ? OPEN_ACCESS_TOOL_IDS.has(tool.id) : (!OPEN_ACCESS_TOOL_IDS.has(tool.id) && getEffectiveTier(tool) === tierFilter));",
  );
  return next;
});

function makeGuestAwareSql(source) {
  return source
    .replaceAll('u.email AS "userEmail"', 'COALESCE(u.email, b.customer_email) AS "userEmail"')
    .replaceAll('u.first_name AS "userFirstName"', 'COALESCE(u.first_name, b.customer_first_name) AS "userFirstName"')
    .replaceAll('u.last_name AS "userLastName"', 'COALESCE(u.last_name, b.customer_last_name) AS "userLastName"')
    .replaceAll("JOIN users u ON u.id = b.user_id", "LEFT JOIN users u ON u.id = b.user_id");
}

update("server/expertBookingRoutes.ts", makeGuestAwareSql);

update("server/expertNotificationService.ts", (source) => {
  let next = makeGuestAwareSql(source);
  next = next.replaceAll(
    "Open Expert Support in your dashboard to view the latest booking details.",
    "Open Expert Support to view the latest booking details.",
  );
  return next;
});

update("server/expertBookingPaymentWebhook.ts", (source) => {
  let next = makeGuestAwareSql(source);
  next = next.replace(
    '  if (!bookingId || !userId || !session.id) return;',
    '  if (!bookingId || !session.id) return;',
  );
  next = next.replace(
    '    if (!booking\n        || booking.userId !== userId\n        || booking.stripeCheckoutSessionId !== session.id) {',
    '    const guestSession = userId === "guest" && !booking?.userId;\n    if (!booking\n        || (!guestSession && booking.userId !== userId)\n        || booking.stripeCheckoutSessionId !== session.id) {',
  );
  next = next.replaceAll(
    "You can manage the appointment from Expert Support in your dashboard.",
    "You can manage the appointment from Expert Support. Keep this confirmation email for your records.",
  );
  return next;
});

for (const relativePath of [
  "server/expertBookingGuestAccess.ts",
  "server/publicExpertBookingRoutes.ts",
]) {
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Missing ${relativePath}`);
}

execFileSync(process.execPath, ["--check", "scripts/prepare-public-expert-booking.cjs"], { cwd: root, stdio: "inherit" });
console.log("[public-expert-booking] public access, guest checkout and modern booking UI prepared");
