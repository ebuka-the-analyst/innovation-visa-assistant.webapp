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
  let next = source;

  const hiddenMatch = next.match(/const SIDEBAR_HIDDEN_ROUTES = \[([^\]]*)\];/);
  if (!hiddenMatch) throw new Error("Could not locate public route list");
  const hiddenEntries = hiddenMatch[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => entry !== '"/expert-booking"');
  next = next.replace(hiddenMatch[0], `const SIDEBAR_HIDDEN_ROUTES = [${hiddenEntries.join(", ")}];`);

  if (!next.includes("OPEN_ACCESS_DASHBOARD_ROUTES")) {
    const customAnchor = next.match(/const CUSTOM_LAYOUT_ROUTES = \[[^\]]*\];/);
    if (!customAnchor) throw new Error("Could not locate custom layout routes");
    next = next.replace(customAnchor[0], `${customAnchor[0]}\nconst OPEN_ACCESS_DASHBOARD_ROUTES = ["/expert-booking"];`);
  }

  if (!next.includes("const isOpenAccessDashboardRoute = OPEN_ACCESS_DASHBOARD_ROUTES.includes(location);")) {
    const layoutAnchor = "  const isCustomLayoutRoute = CUSTOM_LAYOUT_ROUTES.includes(location);";
    if (!next.includes(layoutAnchor)) throw new Error("Could not locate AppLayout route flags");
    next = next.replace(layoutAnchor, `${layoutAnchor}\n  const isOpenAccessDashboardRoute = OPEN_ACCESS_DASHBOARD_ROUTES.includes(location);`);
  }

  if (!next.includes("<AppSidebar publicMode")) {
    const publicAnchor = "  if (isPublicRoute) {";
    if (!next.includes(publicAnchor)) throw new Error("Could not locate AppLayout public branch");
    const openShell = `  if (isOpenAccessDashboardRoute) {\n    return (\n      <SidebarProvider>\n        <div className=\"flex h-screen w-full\">\n          <AppSidebar publicMode />\n          <div className=\"flex flex-col flex-1 w-full min-w-0\">\n            <UnifiedHeader />\n            <main className=\"flex-1 overflow-auto\">\n              <Suspense fallback={<PageLoadingSkeleton />}>\n                <Router />\n              </Suspense>\n            </main>\n          </div>\n        </div>\n      </SidebarProvider>\n    );\n  }\n\n`;
    next = next.replace(publicAnchor, `${openShell}${publicAnchor}`);
  }

  if (!next.includes('href="/login?redirect=%2Fexpert-booking"')) {
    const logoutBlock = `      {user && (\n        <Button\n          variant=\"outline\"\n          size=\"sm\"\n          onClick={() => logoutMutation.mutate()}\n          disabled={logoutMutation.isPending}\n          data-testid=\"button-header-logout\"\n        >\n          <LogOut className=\"h-4 w-4 mr-1\" />\n          <span className=\"hidden sm:inline\">Logout</span>\n        </Button>\n      )}`;
    if (!next.includes(logoutBlock)) throw new Error("Could not locate header logout control");
    next = next.replace(logoutBlock, `${logoutBlock}\n      {!user && (\n        <Link href=\"/login?redirect=%2Fexpert-booking\">\n          <Button variant=\"outline\" size=\"sm\" data-testid=\"button-header-signin\">Sign in</Button>\n        </Link>\n      )}`);
  }

  return next;
});

update("client/src/components/app-sidebar.tsx", (source) => {
  let next = source;

  next = next.replace(
    "interface AppSidebarProps {\n  demoMode?: boolean;\n}",
    "interface AppSidebarProps {\n  demoMode?: boolean;\n  publicMode?: boolean;\n}",
  );
  next = next.replace(
    "export function AppSidebar({ demoMode = false }: AppSidebarProps) {",
    "export function AppSidebar({ demoMode = false, publicMode = false }: AppSidebarProps) {",
  );
  next = next.replace(
    "    enabled: !demoMode,",
    "    enabled: !demoMode && !publicMode,",
  );

  if (!next.includes("const publicUser = {")) {
    const demoAnchor = `  const demoUser = {\n    id: \"demo\",\n    email: \"demo@example.com\",\n    displayName: \"Demo User\",\n    isAdmin: false,\n  };`;
    if (!next.includes(demoAnchor)) throw new Error("Could not locate sidebar demo user");
    next = next.replace(demoAnchor, `${demoAnchor}\n\n  const publicUser = {\n    id: \"guest\",\n    email: \"No account required\",\n    displayName: \"Guest visitor\",\n    isAdmin: false,\n  };`);
  }

  next = next.replace(
    "  const currentUser = demoMode ? demoUser : user;\n\n  if (!currentUser && !demoMode) return null;",
    "  const currentUser = publicMode ? publicUser : demoMode ? demoUser : user;\n\n  if (!currentUser && !demoMode && !publicMode) return null;",
  );
  next = next.replace(
    "          {demoMode ? (",
    "          {demoMode || publicMode ? (",
  );
  return next;
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

update("client/src/components/expert-booking/PublicExpertBooking.tsx", (source) => {
  let next = source;
  next = next.replace('className="min-h-screen bg-[#f7f9fc] text-slate-950"', 'className="min-h-full bg-[#f7f9fc] text-slate-950"');
  next = next.replace(/\n      <header className="sticky top-0 z-40 border-b border-slate-200\/80 bg-white\/95 backdrop-blur">[\s\S]*?<\/header>\n/, "\n");
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
require("./validate-public-expert-booking.cjs");
console.log("[public-expert-booking] public access, dashboard-shell guest UX and modern booking UI prepared");