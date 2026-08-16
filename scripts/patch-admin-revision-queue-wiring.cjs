const fs = require('fs');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

// Register admin API routes.
{
  const file = 'server/index.ts';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    'import { registerBusinessPlanRevisionRoutes } from "./businessPlanRevisionRoutes";',
    'import { registerBusinessPlanRevisionRoutes } from "./businessPlanRevisionRoutes";\nimport { registerAdminBusinessPlanRevisionRoutes } from "./adminBusinessPlanRevisionRoutes";',
    'admin revision route import',
  );
  source = replaceOnce(
    source,
    '  registerBusinessPlanRevisionRoutes(app);\n  startBusinessPlanGenerationWorker();',
    '  registerBusinessPlanRevisionRoutes(app);\n  registerAdminBusinessPlanRevisionRoutes(app);\n  startBusinessPlanGenerationWorker();',
    'admin revision route registration',
  );
  fs.writeFileSync(file, source);
}

// Add Revision Queue to the existing Admin Sidebar.
{
  const file = 'client/src/components/AdminSidebar.tsx';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    '      { id: "plans-failed", label: "Failed Plans", icon: FileWarning, badge: null },\n      { id: "plans-funnel", label: "Completion Funnel", icon: Filter, badge: null },',
    '      { id: "plans-failed", label: "Failed Plans", icon: FileWarning, badge: null },\n      { id: "plans-revisions", label: "Revision Queue", icon: History, badge: null },\n      { id: "plans-funnel", label: "Completion Funnel", icon: Filter, badge: null },',
    'AdminSidebar revision item',
  );
  fs.writeFileSync(file, source);
}

// Integrate the queue into the existing admin dashboard without triggering unrelated plan analytics queries.
{
  const file = 'client/src/pages/admin-dashboard.tsx';
  let source = fs.readFileSync(file, 'utf8');
  source = replaceOnce(
    source,
    'import { PricingAccessManagement } from "@/components/admin/PricingAccessManagement";',
    'import { PricingAccessManagement } from "@/components/admin/PricingAccessManagement";\nimport { AdminRevisionQueue } from "@/components/admin/AdminRevisionQueue";',
    'Admin dashboard revision import',
  );
  source = replaceOnce(
    source,
    "    enabled: !!user?.isAdmin && activeSection.startsWith('plans'),\n    refetchInterval: REFRESH_INTERVAL,",
    "    enabled: !!user?.isAdmin && activeSection.startsWith('plans') && activeSection !== 'plans-revisions',\n    refetchInterval: REFRESH_INTERVAL,",
    'Admin plan analytics query guard',
  );
  source = replaceOnce(
    source,
    "    enabled: !!user?.isAdmin && activeSection.startsWith('plans'),\n  });\n\n  // Tool analytics data",
    "    enabled: !!user?.isAdmin && activeSection.startsWith('plans') && activeSection !== 'plans-revisions',\n  });\n\n  // Tool analytics data",
    'Admin plans data query guard',
  );
  source = replaceOnce(
    source,
    "      'plans-failed': 'Failed Plans',\n      'plans-funnel': 'Plan Completion Funnel',",
    "      'plans-failed': 'Failed Plans',\n      'plans-revisions': 'Business Plan Revision Queue',\n      'plans-funnel': 'Plan Completion Funnel',",
    'Admin dashboard title mapping',
  );
  source = replaceOnce(
    source,
    "                {/* Plans Section */}\n                {activeSection.startsWith('plans') && (",
    "                {/* Business Plan Revision Queue */}\n                {activeSection === 'plans-revisions' && (\n                  <AdminRevisionQueue />\n                )}\n\n                {/* Plans Section */}\n                {activeSection.startsWith('plans') && activeSection !== 'plans-revisions' && (",
    'Admin dashboard revision render',
  );
  fs.writeFileSync(file, source);
}

console.log('Admin Revision Queue wiring applied');
