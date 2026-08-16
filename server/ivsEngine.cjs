const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const { ZodError } = require('zod');
const registry = require('../shared/tool-platform-registry.json');
const { IVS_POLICY_VERSION, SUPPORTED_TOOL_IDS, assessIVS } = require('./ivsPolicy.cjs');

const ROUTE = '/api/endorsement/ivs-assess';
const COMMERCIAL_CATALOG_KEY = 'commercial.plan-catalog.v1';
const PLAN_RANK = Object.freeze({ free: 0, basic: 1, premium: 2, enterprise: 3, ultimate: 4 });
const FALLBACK_MINIMUM_PLAN = Object.freeze({
  'endorsement-readiness': 'premium',
  'criteria-scorer': 'premium',
  'innovation-score': 'premium',
  'innovation-validation': 'enterprise',
  'business-model-validator': 'premium',
  'viability-checker': 'premium',
});
const supportedToolIds = new Set(SUPPORTED_TOOL_IDS);
const application = express.application;
let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function parseCatalogValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function enforceAccess(client, userId, toolId) {
  if (!supportedToolIds.has(toolId)) {
    const error = new Error('Unsupported IVS tool');
    error.statusCode = 404;
    error.code = 'UNSUPPORTED_TOOL';
    throw error;
  }

  const [userResult, catalogResult] = await Promise.all([
    client.query('SELECT subscription_tier FROM users WHERE id = $1 LIMIT 1', [userId]),
    client.query('SELECT value FROM system_settings WHERE key = $1 LIMIT 1', [COMMERCIAL_CATALOG_KEY]),
  ]);
  if (!userResult.rows[0]) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const catalog = parseCatalogValue(catalogResult.rows[0]?.value);
  const configuredMinimum = catalog?.minimumPlanByTool?.[toolId];
  const minimumPlanId = typeof configuredMinimum === 'string' && PLAN_RANK[configuredMinimum] !== undefined
    ? configuredMinimum
    : FALLBACK_MINIMUM_PLAN[toolId];
  const rawUserPlan = String(userResult.rows[0].subscription_tier || 'free').toLowerCase();
  const userPlanId = PLAN_RANK[rawUserPlan] === undefined ? 'free' : rawUserPlan;

  if (PLAN_RANK[userPlanId] < PLAN_RANK[minimumPlanId]) {
    const error = new Error('Your current plan does not include this tool');
    error.statusCode = 403;
    error.code = 'TOOL_ACCESS_REQUIRED';
    error.minimumPlanId = minimumPlanId;
    throw error;
  }
  return { userPlanId, minimumPlanId };
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function findExistingRun(client, userId, toolId, clientRunKey) {
  if (!clientRunKey) return null;
  const result = await client.query(
    `SELECT id, result_payload, result_sha256, validation_state, policy_version, registry_version
       FROM tool_runs
      WHERE user_id = $1 AND tool_id = $2 AND client_run_key = $3
      LIMIT 1`,
    [userId, toolId, clientRunKey],
  );
  return result.rows[0] || null;
}

async function handleAssess(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' });
  }

  const db = getPool();
  const client = await db.connect();
  try {
    const input = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const toolId = String(input.toolId || '');
    const access = await enforceAccess(client, req.user.id, toolId);
    const result = assessIVS(input);
    const clientRunKey = typeof input.clientRunKey === 'string' ? input.clientRunKey : null;
    const inputSnapshot = { ...input };
    delete inputSnapshot.clientRunKey;
    const resultHash = hashJson(result);

    await client.query('BEGIN');
    const contextResult = await client.query('SELECT revision FROM tool_case_contexts WHERE user_id = $1', [req.user.id]);
    const caseContextRevision = contextResult.rows[0] ? Number(contextResult.rows[0].revision) : 0;

    const existing = await findExistingRun(client, req.user.id, toolId, clientRunKey);
    if (existing) {
      await client.query('COMMIT');
      noStore(res);
      return res.json({
        success: true,
        idempotentReplay: true,
        runId: existing.id,
        validationState: existing.validation_state,
        registryVersion: existing.registry_version,
        policyVersion: existing.policy_version,
        resultSha256: existing.result_sha256,
        assessment: existing.result_payload,
      });
    }

    const evidenceRefs = result.evidenceInventory.evidenceRefs || [];
    const insert = await client.query(
      `INSERT INTO tool_runs (
         id, user_id, tool_id, client_run_key, status, execution_mode, registry_version,
         policy_version, case_context_revision, input_snapshot, evidence_refs,
         result_payload, result_sha256, validation_state, validation_summary,
         started_at, completed_at, created_at, updated_at
       ) VALUES (
         gen_random_uuid()::varchar, $1, $2, $3, 'completed', 'server_engine', $4,
         $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, 'validated', $11::jsonb,
         NOW(), NOW(), NOW(), NOW()
       ) RETURNING id`,
      [
        req.user.id,
        toolId,
        clientRunKey,
        registry.registryVersion,
        IVS_POLICY_VERSION,
        caseContextRevision,
        JSON.stringify(inputSnapshot),
        JSON.stringify(evidenceRefs),
        JSON.stringify(result),
        resultHash,
        JSON.stringify({
          engine: 'transparent-evidence-readiness-engine',
          schemaValidated: true,
          policyVersion: IVS_POLICY_VERSION,
          meaning: 'validated means the input schema and deterministic evidence coverage calculation were validated; it is not an endorsing-body decision',
        }),
      ],
    );
    const runId = insert.rows[0].id;

    await client.query(
      `INSERT INTO tool_run_events (id, run_id, user_id, event_type, payload, created_at)
       VALUES
         (gen_random_uuid()::varchar, $1, $2, 'run_started', $3::jsonb, NOW()),
         (gen_random_uuid()::varchar, $1, $2, 'ivs_assessment_completed', $4::jsonb, NOW())`,
      [
        runId,
        req.user.id,
        JSON.stringify({ executionMode: 'server_engine', policyVersion: IVS_POLICY_VERSION, caseContextRevision }),
        JSON.stringify({
          resultSha256: resultHash,
          overallStatus: result.overallStatus,
          criticalGapCount: result.criticalGaps.length,
          evidenceGapCount: result.evidenceGaps.length,
        }),
      ],
    );
    await client.query('COMMIT');

    noStore(res);
    return res.status(201).json({
      success: true,
      idempotentReplay: false,
      runId,
      toolAccess: access,
      validationState: 'validated',
      registryVersion: registry.registryVersion,
      policyVersion: IVS_POLICY_VERSION,
      resultSha256: resultHash,
      assessment: result,
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    if (error instanceof ZodError) {
      noStore(res);
      return res.status(400).json({
        error: 'Assessment input is incomplete or invalid',
        code: 'INVALID_IVS_INPUT',
        issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      });
    }
    if (error?.code === '23505') {
      try {
        const input = req.body || {};
        const existing = await findExistingRun(
          client,
          req.user.id,
          String(input.toolId || ''),
          typeof input.clientRunKey === 'string' ? input.clientRunKey : null,
        );
        if (existing) {
          noStore(res);
          return res.json({
            success: true,
            idempotentReplay: true,
            runId: existing.id,
            validationState: existing.validation_state,
            registryVersion: existing.registry_version,
            policyVersion: existing.policy_version,
            resultSha256: existing.result_sha256,
            assessment: existing.result_payload,
          });
        }
      } catch {}
    }
    if (error?.statusCode) {
      noStore(res);
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code || 'IVS_REQUEST_REJECTED',
        ...(error.minimumPlanId ? { minimumPlanId: error.minimumPlanId } : {}),
      });
    }
    console.error('[IVS ENGINE] Assessment failed:', error);
    noStore(res);
    return res.status(500).json({ error: 'IVS assessment could not be completed', code: 'IVS_ENGINE_ERROR' });
  } finally {
    client.release();
  }
}

function installRoute(app, originalPost) {
  if (app.__ivsEngineRouteInstalled) return;
  Object.defineProperty(app, '__ivsEngineRouteInstalled', { value: true, enumerable: false });
  originalPost.call(app, ROUTE, handleAssess);
}

if (!application.__ivsEngineHookInstalled) {
  const originalPost = application.post;
  Object.defineProperty(application, '__ivsEngineHookInstalled', { value: true, enumerable: false });
  application.post = function ivsEnginePost(path, ...handlers) {
    const isRouteRegistration = typeof path === 'string' && path.startsWith('/') && handlers.length > 0;
    if (isRouteRegistration) installRoute(this, originalPost);
    return originalPost.call(this, path, ...handlers);
  };
}

module.exports = { handleAssess };
