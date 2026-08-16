const fs = require('fs');

const files = {
  api: 'server/adminBusinessPlanRevisionRoutes.ts',
  ui: 'client/src/components/admin/AdminRevisionQueue.tsx',
  index: 'server/index.ts',
  sidebar: 'client/src/components/AdminSidebar.tsx',
  dashboard: 'client/src/pages/admin-dashboard.tsx',
};

for (const file of Object.values(files)) {
  if (!fs.existsSync(file)) throw new Error(`Admin revision queue file missing: ${file}`);
}

const api = fs.readFileSync(files.api, 'utf8');
const ui = fs.readFileSync(files.ui, 'utf8');
const index = fs.readFileSync(files.index, 'utf8');
const sidebar = fs.readFileSync(files.sidebar, 'utf8');
const dashboard = fs.readFileSync(files.dashboard, 'utf8');

for (const marker of [
  'requireAdmin',
  'mutationOriginGuard',
  '/api/admin/business-plan-revisions',
  '/assign-to-me',
  '/retry',
  "revision.status !== \"failed\"",
  'revision_retry_queued',
  'revision_assigned',
]) {
  if (!api.includes(marker)) throw new Error(`Admin revision API invariant missing: ${marker}`);
}

if (api.includes('/accept')) {
  throw new Error('Admin revision API must not expose an acceptance endpoint');
}

for (const marker of [
  'Business Plan Revision Queue',
  'Customer-controlled acceptance',
  'Retry failed revision',
  'Assign to me',
  'Revision checkpoints',
  'Audit timeline',
]) {
  if (!ui.includes(marker)) throw new Error(`Admin revision UI invariant missing: ${marker}`);
}

if (!index.includes('registerAdminBusinessPlanRevisionRoutes(app)')) {
  throw new Error('Admin revision routes are not registered');
}
if (!sidebar.includes('plans-revisions')) {
  throw new Error('Admin Revision Queue is missing from AdminSidebar');
}
if (!dashboard.includes("activeSection === 'plans-revisions'")) {
  throw new Error('Admin dashboard does not render the Revision Queue section');
}

console.log(JSON.stringify({
  ok: true,
  adminAuth: true,
  sameOriginMutations: true,
  inspectAssignRetry: true,
  customerAcceptanceAuthorityPreserved: true,
}, null, 2));
