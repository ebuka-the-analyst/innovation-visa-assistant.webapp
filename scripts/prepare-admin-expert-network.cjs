const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (relative) => path.join(root, relative);

function update(relative, transform) {
  const target = file(relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[admin-expert-network] prepared ${relative}`);
  }
}

update('client/src/App.tsx', (source) => {
  let next = source;

  if (!next.includes('const AdminExpertNetwork = lazy(')) {
    const aiAnchor = 'const AdminAIProviders = lazy(() => import("@/pages/admin/AIProviders"));';
    const seoAnchor = 'const SeoStrategy = lazy(() => import("@/pages/admin/SeoStrategy"));';
    const anchor = next.includes(aiAnchor) ? aiAnchor : seoAnchor;
    if (!next.includes(anchor)) throw new Error('Could not locate App.tsx admin lazy-load anchor');
    next = next.replace(anchor, `${anchor}\nconst AdminExpertNetwork = lazy(() => import("@/pages/admin/ExpertNetwork"));`);
  }

  if (!next.includes('"/admin/expert-network"')) {
    const customLayoutMatch = next.match(/const CUSTOM_LAYOUT_ROUTES = \[([^\]]*)\];/);
    if (!customLayoutMatch) throw new Error('Could not locate App.tsx custom-layout routes');
    const current = customLayoutMatch[1].trim();
    const replacement = `const CUSTOM_LAYOUT_ROUTES = [${current}${current ? ', ' : ''}"/admin/expert-network"];`;
    next = next.replace(customLayoutMatch[0], replacement);
  }

  if (!next.includes('<Route path="/admin/expert-network"')) {
    const aiRoute = '      <Route path="/admin/ai-providers" component={AdminAIProviders} />';
    const dashboardRoute = '      <Route path="/admin-dashboard" component={AdminDashboard} />';
    const anchor = next.includes(aiRoute) ? aiRoute : dashboardRoute;
    if (!next.includes(anchor)) throw new Error('Could not locate App.tsx admin route anchor');
    next = next.replace(anchor, `${anchor}\n      <Route path="/admin/expert-network" component={AdminExpertNetwork} />`);
  }

  return next;
});

update('client/src/components/AdminSidebar.tsx', (source) => {
  let next = source;

  if (!next.includes('id: "lawyer-manage-network"')) {
    const anchor = '      { id: "lawyer-team", label: "Lawyer Team", icon: UserCog, badge: null },';
    if (!next.includes(anchor)) throw new Error('Could not locate Lawyer Team navigation anchor');
    next = next.replace(anchor, `${anchor}\n      { id: "lawyer-manage-network", label: "Manage Network", icon: Users, badge: null },`);
  }

  next = next.replace(
    'window.location.assign("/expert-booking?tab=manage-network");',
    'setAdminLocation("/admin/expert-network");',
  );

  if (!next.includes('setAdminLocation("/admin/expert-network")')) {
    const settingsBranch = `if (item.id === "settings-ai-providers") {\n                              setAdminLocation("/admin/ai-providers");\n                              return;\n                            }`;
    if (!next.includes(settingsBranch)) throw new Error('Could not locate AdminSidebar admin navigation handler');
    next = next.replace(
      settingsBranch,
      `${settingsBranch}\n                            if (item.id === "lawyer-manage-network") {\n                              setAdminLocation("/admin/expert-network");\n                              return;\n                            }`,
    );
  }

  return next;
});

update('client/src/pages/expert-booking.tsx', (source) => {
  let next = source;

  next = next.replace(
    '{user?.isAdmin && <TabsTrigger value="manage" className="gap-2"><Settings2 className="h-4 w-4" /> Manage Network</TabsTrigger>}',
    '',
  );
  next = next.replace(
    '{user?.isAdmin && <TabsContent value="manage"><AdminNetworkManager toast={toast} /></TabsContent>}',
    '',
  );
  next = next.replace(
    '{user?.isAdmin && <Button className="mt-5" onClick={() => setActiveTab("manage")}><Plus className="h-4 w-4 mr-2" /> Configure first expert</Button>}',
    '{user?.isAdmin && <Button className="mt-5" onClick={() => window.location.assign("/admin/expert-network")}><Plus className="h-4 w-4 mr-2" /> Configure first expert</Button>}',
  );

  if (!next.includes('export function AdminNetworkManager(')) {
    const anchor = 'function AdminNetworkManager({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {';
    if (!next.includes(anchor)) throw new Error('Could not locate Expert Booking admin network manager');
    next = next.replace(anchor, `export ${anchor}`);
  }

  return next;
});

console.log('[admin-expert-network] admin network route preparation complete');
require('./prepare-expert-onboarding.cjs');
require('./prepare-expert-notification-system.cjs');
require('./prepare-public-expert-booking.cjs');
require('./prepare-expert-booking-auto-account.cjs');
require('./validate-expert-booking-auto-account.cjs');
require('./prepare-lawyer-team-management.cjs');
require('./prepare-lawyer-team-production-hardening.cjs');
require('./validate-lawyer-team-management.cjs');
require('./prepare-user-sidebar-red.cjs');
require('./validate-user-navigation-and-live-tools.cjs');
