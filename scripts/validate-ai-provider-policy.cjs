const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));

const retiredName = 'q' + 'wen';

if (exists('server/' + retiredName + 'Client.ts')) {
  throw new Error('Retired AI provider client still exists.');
}

function walk(relative) {
  const absolute = path.join(root, relative);
  const output = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) output.push(...walk(child));
    else if (/\.(?:ts|tsx|js|cjs|mjs)$/.test(entry.name)) output.push(child);
  }
  return output;
}

const retiredOperationalPatterns = [
  new RegExp(retiredName + 'Client', 'i'),
  new RegExp('QW' + 'EN_API_KEY', 'i'),
  new RegExp('QW' + 'EN_MODELS', 'i'),
  new RegExp('\\b' + retiredName + '\\s*\\.', 'i'),
  new RegExp("[\\\"'`]" + retiredName + '-', 'i'),
  new RegExp('dash' + 'scope', 'i'),
  new RegExp('ali' + 'yuncs', 'i'),
];

const runtimeViolations = new Set();
for (const relative of walk('server')) {
  const source = read(relative);
  for (const pattern of retiredOperationalPatterns) {
    if (pattern.test(source)) runtimeViolations.add(`Retired provider runtime usage: ${relative}`);
  }

  if (relative !== 'server/aiProviderGateway.ts') {
    if (/api\.openai\.com/i.test(source)) runtimeViolations.add(`Direct OpenAI endpoint bypass: ${relative}`);
    if (/new\s+Anthropic\s*\(/.test(source)) runtimeViolations.add(`Direct Anthropic client bypass: ${relative}`);
  }

  if (/generativelanguage\.googleapis\.com/i.test(source) || /@google\/genai/i.test(source) || /new\s+GoogleGenAI\s*\(/.test(source)) {
    runtimeViolations.add(`Direct Google generative-AI bypass: ${relative}`);
  }
}

if (runtimeViolations.size) {
  throw new Error(`Unmanaged AI runtime calls remain:\n${[...runtimeViolations].sort().map((value) => `- ${value}`).join('\n')}`);
}

const config = read('server/aiModelConfig.ts');
if (!config.includes('PLATFORM_LATEST_OPENAI_MODEL = "gpt-5.6"')) {
  throw new Error('Platform latest OpenAI model is not pinned to the approved gpt-5.6 default.');
}
if (!config.includes('BUSINESS_PLAN_MODEL = PLATFORM_LATEST_OPENAI_MODEL')) {
  throw new Error('Business plan generation is not using the platform latest model policy.');
}

const gateway = read('server/aiProviderGateway.ts');
for (const snippet of [
  'PLATFORM_LATEST_OPENAI_MODEL = "gpt-5.6"',
  'provider: "openai", enabled: true, priority: 1',
  'provider: "anthropic", enabled: false, priority: 2',
  'registerAIProviderGatewayRoutes',
  'registerAIProviderAdminRoutes',
  '/internal-ai-gateway/v1/chat/completions',
  '/internal-ai-gateway/v1/responses',
  '/api/admin/ai-providers',
  'apiKeysStoredServerSideOnly: true',
]) {
  if (!gateway.includes(snippet)) throw new Error(`Managed AI gateway is missing: ${snippet}`);
}

const preload = read('server/aiGatewayPreload.cjs');
if (!preload.includes('OPENAI_BASE_URL') || !preload.includes('/internal-ai-gateway/v1')) {
  throw new Error('OpenAI SDK calls are not centrally routed through the managed gateway.');
}

const packageJson = read('package.json');
if (!packageJson.includes('--require=./server/aiGatewayPreload.cjs')) {
  throw new Error('Managed AI gateway preload is not active in runtime scripts.');
}
if (!packageJson.includes('prepare-managed-ai-routing.cjs')) {
  throw new Error('Legacy AI entry points are not normalised before dev/build.');
}

const routes = read('server/routes.ts');
if (!routes.includes('managedLegacyTextAI')) {
  throw new Error('Legacy text-generation paths were not routed through the managed OpenAI-compatible gateway.');
}

const index = read('server/index.ts');
if (!index.includes('registerAIProviderGatewayRoutes(app);') || !index.includes('registerAIProviderAdminRoutes(app);')) {
  throw new Error('Managed AI routes are not registered in the application server.');
}

const app = read('client/src/App.tsx');
if (!app.includes('/admin/ai-providers') || !app.includes('AdminAIProviders')) {
  throw new Error('Admin AI Providers page is not routed.');
}

const sidebar = read('client/src/components/AdminSidebar.tsx');
if (!sidebar.includes('settings-ai-providers') || !sidebar.includes('/admin/ai-providers')) {
  throw new Error('Admin sidebar does not expose AI Provider Control.');
}

const adminPage = read('client/src/pages/admin/AIProviders.tsx');
for (const snippet of ['AI Provider Control', 'Platform latest approved', 'OpenAI / ChatGPT', 'Anthropic / Claude']) {
  if (!adminPage.includes(snippet)) throw new Error(`Admin AI Provider UI missing: ${snippet}`);
}

const migration = read('migrations/app/20260818_ai_provider_control.sql');
if (!migration.includes('ai_provider_settings') || !migration.includes("'openai', TRUE, 1, 'platform-latest'")) {
  throw new Error('AI provider settings migration is incomplete.');
}

const review = read('server/services/documentReviewService.ts');
if (!review.includes('Calling managed AI provider') || retiredOperationalPatterns.some((pattern) => pattern.test(review))) {
  throw new Error('Final Document Review is not fully migrated to the managed provider layer.');
}

const verifier = read('server/blogMultiVerifier.ts');
if (!verifier.includes('dual-pass managed verification') || retiredOperationalPatterns.some((pattern) => pattern.test(verifier))) {
  throw new Error('Blog verification is not fully migrated to the managed provider layer.');
}

console.log('Managed AI provider policy validation passed.');
