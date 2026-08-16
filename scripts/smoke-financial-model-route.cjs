process.env.NODE_ENV = 'test';

const express = require('express');
require('../server/toolPlatform.cjs');
require('../server/eligibilityEngine.cjs');
require('../server/ivsEngine.cjs');
require('../server/financialModelEngine.cjs');

const app = express();
app.post('/__financial_model_smoke_trigger__', (_req, res) => res.sendStatus(204));

const routes = [];
for (const layer of app._router?.stack || []) {
  if (!layer.route) continue;
  const methods = Object.keys(layer.route.methods || {}).filter((method) => layer.route.methods[method]);
  for (const method of methods) routes.push(`${method.toUpperCase()} ${layer.route.path}`);
}

const required = [
  'POST /api/financial-model/assess',
  'POST /api/endorsement/ivs-assess',
  'POST /api/eligibility/assess',
  'POST /api/tool-platform/runs',
];
const missing = required.filter((route) => !routes.includes(route));
const duplicates = required.filter((route) => routes.filter((candidate) => candidate === route).length !== 1);

if (missing.length || duplicates.length) {
  console.error(JSON.stringify({ ok: false, missing, duplicates, routes }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, requiredRoutes: required }, null, 2));
