const fs = require('fs');
const path = require('path');

const root = process.cwd();
const toolsDataPath = path.join(root, 'shared', 'tools-data.ts');
const toolRoutesPath = path.join(root, 'client', 'src', 'lib', 'toolRoutes.ts');
const commercialCatalogPath = path.join(root, 'shared', 'commercialCatalog.ts');
const registryPath = path.join(root, 'shared', 'tool-platform-registry.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function unique(values, label) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) {
    throw new Error(`${label} contains duplicate IDs: ${Array.from(new Set(duplicates)).join(', ')}`);
  }
  return new Set(values);
}

function quotedArray(source, constantName) {
  const match = source.match(new RegExp(`export\\s+const\\s+${constantName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s+as\\s+const`));
  if (!match) throw new Error(`Could not locate ${constantName} in shared/commercialCatalog.ts`);
  return Array.from(match[1].matchAll(/["']([^"']+)["']/g), (entry) => entry[1]);
}

function difference(left, right) {
  return Array.from(left).filter((value) => !right.has(value)).sort();
}

function assertSameSet(actual, expected, label) {
  const missing = difference(expected, actual);
  const unexpected = difference(actual, expected);
  if (missing.length || unexpected.length) {
    throw new Error(
      `${label} mismatch. Missing: [${missing.join(', ')}]. Unexpected: [${unexpected.join(', ')}].`,
    );
  }
}

const toolsData = read(toolsDataPath);
const toolRoutes = read(toolRoutesPath);
const commercialCatalog = read(commercialCatalogPath);
const registry = JSON.parse(read(registryPath));

if (registry.schemaVersion !== 1) {
  throw new Error(`Unsupported tool registry schemaVersion: ${registry.schemaVersion}`);
}
if (!['beta', 'production'].includes(registry.defaultRunnableStatus)) {
  throw new Error(`Unsupported defaultRunnableStatus: ${registry.defaultRunnableStatus}`);
}

const listedIds = unique(
  Array.from(toolsData.matchAll(/\{\s*id:\s*["']([^"']+)["']\s*,\s*name:/g), (match) => match[1]),
  'ALL_TOOLS',
);
const routedIds = unique(
  Array.from(toolRoutes.matchAll(/^\s*["']([^"']+)["']:\s*lazy\(/gm), (match) => match[1]),
  'toolMap',
);
const commercialRunnableIds = unique(quotedArray(commercialCatalog, 'RUNNABLE_TOOL_IDS'), 'commercial RUNNABLE_TOOL_IDS');
const commercialDisabledIds = unique(quotedArray(commercialCatalog, 'UNAVAILABLE_LISTED_TOOL_IDS'), 'commercial UNAVAILABLE_LISTED_TOOL_IDS');
const commercialInternalIds = unique(quotedArray(commercialCatalog, 'UNLISTED_RUNNABLE_TOOL_IDS'), 'commercial UNLISTED_RUNNABLE_TOOL_IDS');

const registryDisabledIds = unique(registry.disabledListedToolIds || [], 'registry disabledListedToolIds');
const registryInternalIds = unique(registry.internalRunnableToolIds || [], 'registry internalRunnableToolIds');
const registryProductionIds = unique(registry.productionToolIds || [], 'registry productionToolIds');

assertSameSet(commercialRunnableIds, routedIds, 'Commercial runnable IDs vs actual client routes');
assertSameSet(registryDisabledIds, commercialDisabledIds, 'Registry disabled IDs vs commercial catalogue');
assertSameSet(registryInternalIds, commercialInternalIds, 'Registry internal IDs vs commercial catalogue');

const listedWithoutRoute = new Set(difference(listedIds, routedIds));
const routedWithoutListing = new Set(difference(routedIds, listedIds));
assertSameSet(registryDisabledIds, listedWithoutRoute, 'Disabled listed tools vs listed tools without a route');
assertSameSet(registryInternalIds, routedWithoutListing, 'Internal tools vs routed tools without a public listing');

for (const id of registryDisabledIds) {
  if (!listedIds.has(id)) throw new Error(`Disabled tool ${id} is not listed in ALL_TOOLS`);
  if (routedIds.has(id)) throw new Error(`Disabled tool ${id} unexpectedly has a runnable route`);
}
for (const id of registryInternalIds) {
  if (!routedIds.has(id)) throw new Error(`Internal tool ${id} does not have a runnable route`);
  if (listedIds.has(id)) throw new Error(`Internal tool ${id} is unexpectedly listed publicly`);
}
for (const id of registryProductionIds) {
  if (!routedIds.has(id) || !listedIds.has(id)) {
    throw new Error(`Production tool ${id} must be both publicly listed and runnable`);
  }
  if (registryDisabledIds.has(id) || registryInternalIds.has(id)) {
    throw new Error(`Production tool ${id} cannot also be disabled or internal`);
  }
}

const publicRunnableIds = difference(routedIds, registryInternalIds);
const betaCount = publicRunnableIds.filter((id) => !registryProductionIds.has(id)).length;

console.log(JSON.stringify({
  ok: true,
  registryVersion: registry.registryVersion,
  listedTools: listedIds.size,
  runnableTools: routedIds.size,
  publicRunnableTools: publicRunnableIds.length,
  productionTools: registryProductionIds.size,
  betaTools: betaCount,
  disabledListedTools: registryDisabledIds.size,
  internalRunnableTools: registryInternalIds.size,
}, null, 2));
