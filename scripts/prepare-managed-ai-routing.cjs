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
    console.log(`[managed-ai] prepared ${relative}`);
  }
}

update('server/index.ts', (source) => {
  let next = source;
  if (!next.includes('registerAIProviderGatewayRoutes')) {
    const anchor = 'import { startBusinessPlanRevisionWorker } from "./services/businessPlanRevisionService";';
    if (!next.includes(anchor)) throw new Error('Could not locate server/index.ts AI import anchor');
    next = next.replace(anchor, `${anchor}\nimport { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";`);
  }
  if (!next.includes('registerAIProviderGatewayRoutes(app);')) {
    const anchor = '  const server = await registerRoutes(app);';
    if (!next.includes(anchor)) throw new Error('Could not locate server/index.ts route-registration anchor');
    next = next.replace(anchor, `${anchor}\n  registerAIProviderGatewayRoutes(app);\n  registerAIProviderAdminRoutes(app);`);
  }
  return next;
});

update('server/routes.ts', (source) => {
  let next = source;
  next = next.replace('import { GoogleGenAI } from "@google/genai";\n', '');

  const oldClient = `const geminiAI = new GoogleGenAI({\n  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || "",\n});`;
  if (next.includes(oldClient)) {
    next = next.replace(oldClient, `const managedLegacyTextAI = {\n  models: {\n    generateContent: async ({ contents }: { contents: unknown }) => {\n      const completion = await openaiClient.chat.completions.create({\n        model: BUSINESS_PLAN_MODEL as any,\n        messages: [{ role: "user", content: typeof contents === "string" ? contents : JSON.stringify(contents) }],\n        max_tokens: 4000,\n      } as any);\n      return { text: completion.choices[0]?.message?.content || "" };\n    },\n  },\n};`);
  }
  next = next.replace(/\bgeminiAI\b/g, 'managedLegacyTextAI');
  return next;
});

update('client/src/App.tsx', (source) => {
  let next = source;
  if (!next.includes('const AdminAIProviders = lazy(')) {
    const anchor = 'const SeoStrategy = lazy(() => import("@/pages/admin/SeoStrategy"));';
    if (!next.includes(anchor)) throw new Error('Could not locate App.tsx admin import anchor');
    next = next.replace(anchor, `${anchor}\nconst AdminAIProviders = lazy(() => import("@/pages/admin/AIProviders"));`);
  }
  next = next.replace(
    'const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard"];',
    'const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard", "/admin/ai-providers"];',
  );
  if (!next.includes('<Route path="/admin/ai-providers"')) {
    const anchor = '      <Route path="/admin-dashboard" component={AdminDashboard} />;';
    if (next.includes(anchor)) {
      next = next.replace(anchor, `      <Route path="/admin/ai-providers" component={AdminAIProviders} />\n${anchor}`);
    } else {
      const normalAnchor = '      <Route path="/admin-dashboard" component={AdminDashboard} />';
      if (!next.includes(normalAnchor)) throw new Error('Could not locate App.tsx admin route anchor');
      next = next.replace(normalAnchor, `      <Route path="/admin/ai-providers" component={AdminAIProviders} />\n${normalAnchor}`);
    }
  }
  return next;
});

update('client/src/components/AdminSidebar.tsx', (source) => {
  let next = source;
  if (!next.includes('id: "settings-ai-providers"')) {
    const anchor = '      { id: "settings-general", label: "General Settings", icon: Settings, badge: null },';
    if (!next.includes(anchor)) throw new Error('Could not locate AdminSidebar settings anchor');
    next = next.replace(anchor, `${anchor}\n      { id: "settings-ai-providers", label: "AI Providers", icon: Cpu, badge: null },`);
  }
  if (!next.includes('const [, setAdminLocation] = useLocation();')) {
    const anchor = '  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Dashboard", "User Intelligence", "Plan Lifecycle"]);';
    if (!next.includes(anchor)) throw new Error('Could not locate AdminSidebar state anchor');
    next = next.replace(anchor, `${anchor}\n  const [, setAdminLocation] = useLocation();`);
  }
  next = next.replace(
    'onClick={() => onSectionChange(item.id)}',
    'onClick={() => item.id === "settings-ai-providers" ? setAdminLocation("/admin/ai-providers") : onSectionChange(item.id)}',
  );
  return next;
});

console.log('[managed-ai] routing preparation complete');
