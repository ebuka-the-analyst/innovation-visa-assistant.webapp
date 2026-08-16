process.env.NODE_ENV = 'test';

const express = require('express');
require('../server/toolPlatform.cjs');

const app = express();
app.get('/__tool_platform_smoke_trigger__', (_req, res) => res.sendStatus(204));

const routes = [];
for (const layer of app._router?.stack || []) {
  if (!layer.route) continue;
  const methods = Object.keys(layer.route.methods || {}).filter((method) => layer.route.methods[method]);
  for (const method of methods) routes.push(`${method.toUpperCase()} ${layer.route.path}`);
}

const requiredRoutes = [
  'GET /api/tool-platform/registry',
  'GET /api/tool-platform/context',
  'PUT /api/tool-platform/context',
  'POST /api/tool-platform/runs',
  'GET /api/tool-platform/runs',
  'GET /api/tool-platform/runs/:runId',
  'POST /api/tool-platform/runs/:runId/complete',
  'POST /api/tool-platform/runs/:runId/fail',
];

const missing = requiredRoutes.filter((route) => !routes.includes(route));
const duplicates = requiredRoutes.filter((route) => routes.filter((candidate) => candidate === route).length !== 1);

if (missing.length || duplicates.length) {
  console.error(JSON.stringify({ ok: false, missing, duplicates, routes }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, registeredRoutes: requiredRoutes }, null, 2));
