const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const registry = require('../shared/tool-platform-registry.json');

const BASE_ROUTE = '/api/tool-platform';
const COMMERCIAL_CATALOG_KEY = 'commercial.plan-catalog.v1';
const PLAN_RANK = { free: 0, basic: 1, premium: 2, enterprise: 3, ultimate: 4 };
const MAX_CONTEXT_BYTES = 250_000;
const MAX_INPUT_BYTES = 250_000;
const MAX_RESULT_BYTES = 500_000;
const MAX_EVIDENCE_REFS = 200;
const application = express.application;

const disabledIds = new Set(registry.disabledListedToolIds || []);
const internalIds = new Set(registry.internalRunnableToolIds || []);
const productionIds = new Set(registry.productionToolIds || []);

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

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function requireAuthenticated(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' });
    return false;
  }
  return true;
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function byteLength(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

function validateObject(value, label, maxBytes) {
  if (!isPlainObject(value)) throw new ClientInputError(`${label} must be a JSON object`, 'INVALID_OBJECT');
  if (byteLength(value) > maxBytes) throw new ClientInputError(`${label} is too large`, 'PAYLOAD_TOO_LARGE', 413);
  return value;
}

function validateEvidenceRefs(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new ClientInputError('evidenceRefs must be an array', 'INVALID_EVIDENCE_REFS');
  if (value.length > MAX_EVIDENCE_REFS) {
    throw new ClientInputError(`evidenceRefs cannot contain more than ${MAX_EVIDENCE_REFS} items`, 'TOO_MANY_EVIDENCE_REFS');
  }
  const refs = value.map((entry) => {
    if (typeof entry !== 'string') throw new ClientInputError('Every evidence reference must be a string', 'INVALID_EVIDENCE_REF');
    const trimmed = entry.trim();
    if (!trimmed || trimmed.length > 240 || !/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(trimmed)) {
      throw new ClientInputError('Evidence references must be stable IDs or paths, not free-form content', 'INVALID_EVIDENCE_REF');
    }
    return trimmed;
  });
  return Array.from(new Set(refs));
}

function optionalIdentifier(value, label, maxLength = 120) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new ClientInputError(`${label} must be a string`, 'INVALID_IDENTIFIER');
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(trimmed)) {
    throw new ClientInputError(`${label} has an invalid format`, 'INVALID_IDENTIFIER');
  }
  return trimmed;
}

function toolStatus(toolId) {
  if (disabledIds.has(toolId)) return 'disabled';
  if (internalIds.has(toolId)) return 'internal';
  if (productionIds.has(toolId)) return 'production';
  return registry.defaultRunnableStatus || 'beta';
}

function normaliseCatalogValue(value) {
  if (isPlainObject(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return null;
}

async function loadEntitlement(db, userId, toolId) {
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(toolId)) {
    throw new ClientInputError('Unknown tool', 'UNKNOWN_TOOL', 404);
  }

  const status = toolStatus(toolId);
  if (status === 'disabled') throw new ClientInputError('This tool is not available', 'TOOL_DISABLED', 404);
  if (status === 'internal') throw new ClientInputError('This tool is not publicly available', 'TOOL_INTERNAL', 404);

  const [catalogResult, userResult] = await Promise.all([
    db.query('SELECT value FROM system_settings WHERE key = $1 LIMIT 1', [COMMERCIAL_CATALOG_KEY]),
    db.query('SELECT subscription_tier FROM users WHERE id = $1 LIMIT 1', [userId]),
  ]);

  const catalog = normaliseCatalogValue(catalogResult.rows[0]?.value);
  const minimumPlanByTool = catalog && isPlainObject(catalog.minimumPlanByTool)
    ? catalog.minimumPlanByTool
    : null;
  if (!minimumPlanByTool) {
    const error = new Error('Commercial catalogue is unavailable');
    error.code = 'COMMERCIAL_CATALOG_UNAVAILABLE';
    throw error;
  }
  const minimumPlanId = minimumPlanByTool[toolId];
  if (typeof minimumPlanId !== 'string' || PLAN_RANK[minimumPlanId] === undefined) {
    throw new ClientInputError('Unknown or unavailable tool', 'UNKNOWN_TOOL', 404);
  }

  const userPlanId = String(userResult.rows[0]?.subscription_tier || 'free').toLowerCase();
  const safeUserPlanId = PLAN_RANK[userPlanId] === undefined ? 'free' : userPlanId;
  if (PLAN_RANK[safeUserPlanId] < PLAN_RANK[minimumPlanId]) {
    throw new ClientInputError('Your current plan does not include this tool', 'TOOL_ACCESS_REQUIRED', 403, {
      minimumPlanId,
    });
  }

  return { minimumPlanId, userPlanId: safeUserPlanId, status };
}

class ClientInputError extends Error {
  constructor(message, code, statusCode = 400, extra = {}) {
    super(message);
    this.name = 'ClientInputError';
    this.code = code;
    this.statusCode = statusCode;
    this.extra = extra;
  }
}

function sendError(res, error, logLabel) {
  if (error instanceof ClientInputError) {
    return res.status(error.statusCode).json({ error: error.message, code: error.code, ...error.extra });
  }
  console.error(`[TOOL PLATFORM] ${logLabel}:`, error);
  if (error?.code === 'COMMERCIAL_CATALOG_UNAVAILABLE') {
    return res.status(503).json({
      error: 'Tool access could not be verified',
      code: 'TOOL_ACCESS_UNAVAILABLE',
    });
  }
  return res.status(500).json({ error: 'Tool platform request failed', code: 'TOOL_PLATFORM_ERROR' });
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function handleRegistry(req, res) {
  try {
    if (!requireAuthenticated(req, res)) return;
    noStore(res);
    return res.json({
      schemaVersion: registry.schemaVersion,
      registryVersion: registry.registryVersion,
      defaultRunnableStatus: registry.defaultRunnableStatus,
      productionToolIds: registry.productionToolIds || [],
      disabledListedToolIds: registry.disabledListedToolIds || [],
      policyBaseline: registry.policyBaseline,
    });
  } catch (error) {
    return sendError(res, error, 'registry read failed');
  }
}

async function handleGetContext(req, res) {
  try {
    if (!requireAuthenticated(req, res)) return;
    const db = getPool();
    const result = await db.query(
      `SELECT revision, context_data, evidence_refs, created_at, updated_at
         FROM tool_case_contexts
        WHERE user_id = $1`,
      [req.user.id],
    );
    noStore(res);
    const row = result.rows[0];
    if (!row) {
      return res.json({ revision: 0, contextData: {}, evidenceRefs: [], createdAt: null, updatedAt: null });
    }
    return res.json({
      revision: Number(row.revision),
      contextData: row.context_data || {},
      evidenceRefs: row.evidence_refs || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    return sendError(res, error, 'context read failed');
  }
}

async function handlePutContext(req, res) {
  const db = getPool();
  const client = await db.connect();
  try {
    if (!requireAuthenticated(req, res)) return;
    const body = isPlainObject(req.body) ? req.body : {};
    const expectedRevision = Number(body.expectedRevision);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
      throw new ClientInputError('expectedRevision must be a non-negative integer', 'INVALID_REVISION');
    }
    const contextData = validateObject(body.contextData || {}, 'contextData', MAX_CONTEXT_BYTES);
    const evidenceRefs = validateEvidenceRefs(body.evidenceRefs);
    const newHash = hashJson({ contextData, evidenceRefs });

    await client.query('BEGIN');
    const currentResult = await client.query(
      `SELECT revision, context_data, evidence_refs
         FROM tool_case_contexts
        WHERE user_id = $1
        FOR UPDATE`,
      [req.user.id],
    );
    const current = currentResult.rows[0];
    const currentRevision = current ? Number(current.revision) : 0;
    if (currentRevision !== expectedRevision) {
      await client.query('ROLLBACK');
      noStore(res);
      return res.status(409).json({
        error: 'Case context changed after it was loaded. Reload before saving.',
        code: 'CONTEXT_REVISION_CONFLICT',
        currentRevision,
      });
    }

    const nextRevision = currentRevision + 1;
    const previousHash = current ? hashJson({
      contextData: current.context_data || {},
      evidenceRefs: current.evidence_refs || [],
    }) : null;

    await client.query(
      `INSERT INTO tool_case_contexts (user_id, revision, context_data, evidence_refs, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET revision = EXCLUDED.revision,
           context_data = EXCLUDED.context_data,
           evidence_refs = EXCLUDED.evidence_refs,
           updated_at = NOW()`,
      [req.user.id, nextRevision, JSON.stringify(contextData), JSON.stringify(evidenceRefs)],
    );
    await client.query(
      `INSERT INTO tool_case_context_events (
         id, user_id, revision, previous_sha256, new_sha256, created_at
       ) VALUES (gen_random_uuid()::varchar, $1, $2, $3, $4, NOW())`,
      [req.user.id, nextRevision, previousHash, newHash],
    );
    await client.query('COMMIT');

    noStore(res);
    return res.json({
      success: true,
      revision: nextRevision,
      contextData,
      evidenceRefs,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return sendError(res, error, 'context update failed');
  } finally {
    client.release();
  }
}

async function handleCreateRun(req, res) {
  const db = getPool();
  const client = await db.connect();
  try {
    if (!requireAuthenticated(req, res)) return;
    const body = isPlainObject(req.body) ? req.body : {};
    const toolId = String(body.toolId || '').trim();
    const entitlement = await loadEntitlement(client, req.user.id, toolId);
    const inputSnapshot = validateObject(body.inputSnapshot || {}, 'inputSnapshot', MAX_INPUT_BYTES);
    const evidenceRefs = validateEvidenceRefs(body.evidenceRefs);
    const clientRunKey = optionalIdentifier(body.clientRunKey, 'clientRunKey');
    const requestedPolicyVersion = optionalIdentifier(body.policyVersion, 'policyVersion', 60);
    const policyVersion = requestedPolicyVersion || registry.policyBaseline?.version || null;

    await client.query('BEGIN');
    const contextResult = await client.query(
      'SELECT revision FROM tool_case_contexts WHERE user_id = $1',
      [req.user.id],
    );
    const caseContextRevision = contextResult.rows[0] ? Number(contextResult.rows[0].revision) : 0;

    let inserted;
    if (clientRunKey) {
      const insertResult = await client.query(
        `INSERT INTO tool_runs (
           id, user_id, tool_id, client_run_key, status, execution_mode, registry_version,
           policy_version, case_context_revision, input_snapshot, evidence_refs,
           validation_state, started_at, created_at, updated_at
         ) VALUES (
           gen_random_uuid()::varchar, $1, $2, $3, 'started', 'legacy_client', $4,
           $5, $6, $7::jsonb, $8::jsonb, 'unverified', NOW(), NOW(), NOW()
         )
         ON CONFLICT (user_id, tool_id, client_run_key) WHERE client_run_key IS NOT NULL
         DO NOTHING
         RETURNING id, status, created_at`,
        [
          req.user.id,
          toolId,
          clientRunKey,
          registry.registryVersion,
          policyVersion,
          caseContextRevision,
          JSON.stringify(inputSnapshot),
          JSON.stringify(evidenceRefs),
        ],
      );
      inserted = insertResult.rows[0];
      if (!inserted) {
        const existingResult = await client.query(
          `SELECT id, status, created_at
             FROM tool_runs
            WHERE user_id = $1 AND tool_id = $2 AND client_run_key = $3
            LIMIT 1`,
          [req.user.id, toolId, clientRunKey],
        );
        const existing = existingResult.rows[0];
        await client.query('COMMIT');
        noStore(res);
        return res.json({
          runId: existing.id,
          status: existing.status,
          idempotentReplay: true,
          toolStatus: entitlement.status,
          minimumPlanId: entitlement.minimumPlanId,
          caseContextRevision,
        });
      }
    } else {
      const insertResult = await client.query(
        `INSERT INTO tool_runs (
           id, user_id, tool_id, status, execution_mode, registry_version,
           policy_version, case_context_revision, input_snapshot, evidence_refs,
           validation_state, started_at, created_at, updated_at
         ) VALUES (
           gen_random_uuid()::varchar, $1, $2, 'started', 'legacy_client', $3,
           $4, $5, $6::jsonb, $7::jsonb, 'unverified', NOW(), NOW(), NOW()
         )
         RETURNING id, status, created_at`,
        [
          req.user.id,
          toolId,
          registry.registryVersion,
          policyVersion,
          caseContextRevision,
          JSON.stringify(inputSnapshot),
          JSON.stringify(evidenceRefs),
        ],
      );
      inserted = insertResult.rows[0];
    }

    await client.query(
      `INSERT INTO tool_run_events (id, run_id, user_id, event_type, payload, created_at)
       VALUES (gen_random_uuid()::varchar, $1, $2, 'run_started', $3::jsonb, NOW())`,
      [inserted.id, req.user.id, JSON.stringify({
        registryVersion: registry.registryVersion,
        policyVersion,
        caseContextRevision,
        toolStatus: entitlement.status,
      })],
    );
    await client.query('COMMIT');

    noStore(res);
    return res.status(201).json({
      runId: inserted.id,
      status: inserted.status,
      idempotentReplay: false,
      toolStatus: entitlement.status,
      minimumPlanId: entitlement.minimumPlanId,
      caseContextRevision,
      registryVersion: registry.registryVersion,
      policyVersion,
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return sendError(res, error, 'run creation failed');
  } finally {
    client.release();
  }
}

async function handleCompleteRun(req, res) {
  const db = getPool();
  const client = await db.connect();
  try {
    if (!requireAuthenticated(req, res)) return;
    const runId = String(req.params.runId || '');
    if (!/^[A-Za-z0-9-]{16,80}$/.test(runId)) throw new ClientInputError('Invalid run ID', 'INVALID_RUN_ID');
    const body = isPlainObject(req.body) ? req.body : {};
    const resultPayload = validateObject(body.resultPayload || {}, 'resultPayload', MAX_RESULT_BYTES);
    const evidenceRefs = body.evidenceRefs === undefined ? null : validateEvidenceRefs(body.evidenceRefs);
    const resultHash = hashJson(resultPayload);

    await client.query('BEGIN');
    const existingResult = await client.query(
      `SELECT id, status, evidence_refs
         FROM tool_runs
        WHERE id = $1 AND user_id = $2
        FOR UPDATE`,
      [runId, req.user.id],
    );
    const existing = existingResult.rows[0];
    if (!existing) throw new ClientInputError('Tool run not found', 'RUN_NOT_FOUND', 404);
    if (existing.status === 'completed') {
      await client.query('COMMIT');
      noStore(res);
      return res.json({ runId, status: 'completed', idempotentReplay: true });
    }
    if (existing.status !== 'started') {
      throw new ClientInputError(`Tool run cannot be completed from status ${existing.status}`, 'INVALID_RUN_TRANSITION', 409);
    }

    await client.query(
      `UPDATE tool_runs
          SET status = 'completed',
              result_payload = $1::jsonb,
              result_sha256 = $2,
              evidence_refs = COALESCE($3::jsonb, evidence_refs),
              validation_state = 'unverified',
              completed_at = NOW(),
              updated_at = NOW()
        WHERE id = $4 AND user_id = $5`,
      [
        JSON.stringify(resultPayload),
        resultHash,
        evidenceRefs === null ? null : JSON.stringify(evidenceRefs),
        runId,
        req.user.id,
      ],
    );
    await client.query(
      `INSERT INTO tool_run_events (id, run_id, user_id, event_type, payload, created_at)
       VALUES (gen_random_uuid()::varchar, $1, $2, 'run_completed_legacy_client', $3::jsonb, NOW())`,
      [runId, req.user.id, JSON.stringify({ resultSha256: resultHash, validationState: 'unverified' })],
    );
    await client.query('COMMIT');
    noStore(res);
    return res.json({
      runId,
      status: 'completed',
      validationState: 'unverified',
      resultSha256: resultHash,
      idempotentReplay: false,
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return sendError(res, error, 'run completion failed');
  } finally {
    client.release();
  }
}

async function handleFailRun(req, res) {
  const db = getPool();
  const client = await db.connect();
  try {
    if (!requireAuthenticated(req, res)) return;
    const runId = String(req.params.runId || '');
    if (!/^[A-Za-z0-9-]{16,80}$/.test(runId)) throw new ClientInputError('Invalid run ID', 'INVALID_RUN_ID');
    const body = isPlainObject(req.body) ? req.body : {};
    const errorCode = optionalIdentifier(body.errorCode || 'TOOL_RUN_FAILED', 'errorCode', 80) || 'TOOL_RUN_FAILED';
    const errorMessage = typeof body.errorMessage === 'string' ? body.errorMessage.trim().slice(0, 1000) : 'Tool run failed';

    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE tool_runs
          SET status = 'failed', error_code = $1, error_message = $2,
              completed_at = NOW(), updated_at = NOW()
        WHERE id = $3 AND user_id = $4 AND status = 'started'
        RETURNING id`,
      [errorCode, errorMessage, runId, req.user.id],
    );
    if (result.rowCount !== 1) {
      const existing = await client.query('SELECT status FROM tool_runs WHERE id = $1 AND user_id = $2', [runId, req.user.id]);
      if (!existing.rows[0]) throw new ClientInputError('Tool run not found', 'RUN_NOT_FOUND', 404);
      if (existing.rows[0].status === 'failed') {
        await client.query('COMMIT');
        noStore(res);
        return res.json({ runId, status: 'failed', idempotentReplay: true });
      }
      throw new ClientInputError(`Tool run cannot fail from status ${existing.rows[0].status}`, 'INVALID_RUN_TRANSITION', 409);
    }
    await client.query(
      `INSERT INTO tool_run_events (id, run_id, user_id, event_type, payload, created_at)
       VALUES (gen_random_uuid()::varchar, $1, $2, 'run_failed', $3::jsonb, NOW())`,
      [runId, req.user.id, JSON.stringify({ errorCode })],
    );
    await client.query('COMMIT');
    noStore(res);
    return res.json({ runId, status: 'failed', idempotentReplay: false });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return sendError(res, error, 'run failure update failed');
  } finally {
    client.release();
  }
}

async function handleListRuns(req, res) {
  try {
    if (!requireAuthenticated(req, res)) return;
    const db = getPool();
    const toolId = typeof req.query.toolId === 'string' ? req.query.toolId.trim() : '';
    const limitRequested = Number(req.query.limit || 20);
    const limit = Number.isInteger(limitRequested) ? Math.max(1, Math.min(50, limitRequested)) : 20;
    const params = [req.user.id];
    let where = 'user_id = $1';
    if (toolId) {
      params.push(toolId);
      where += ` AND tool_id = $${params.length}`;
    }
    params.push(limit);
    const result = await db.query(
      `SELECT id, tool_id, status, execution_mode, registry_version, policy_version,
              case_context_revision, validation_state, confidence_score, error_code,
              started_at, completed_at, created_at, updated_at
         FROM tool_runs
        WHERE ${where}
        ORDER BY created_at DESC
        LIMIT $${params.length}`,
      params,
    );
    noStore(res);
    return res.json({ runs: result.rows });
  } catch (error) {
    return sendError(res, error, 'run list failed');
  }
}

async function handleGetRun(req, res) {
  try {
    if (!requireAuthenticated(req, res)) return;
    const db = getPool();
    const runId = String(req.params.runId || '');
    const result = await db.query(
      `SELECT id, tool_id, status, execution_mode, registry_version, policy_version,
              case_context_revision, input_snapshot, evidence_refs, result_payload,
              result_sha256, validation_state, validation_summary, confidence_score,
              error_code, error_message, started_at, completed_at, created_at, updated_at
         FROM tool_runs
        WHERE id = $1 AND user_id = $2`,
      [runId, req.user.id],
    );
    if (!result.rows[0]) throw new ClientInputError('Tool run not found', 'RUN_NOT_FOUND', 404);
    const events = await db.query(
      `SELECT event_type, payload, created_at
         FROM tool_run_events
        WHERE run_id = $1 AND user_id = $2
        ORDER BY created_at ASC`,
      [runId, req.user.id],
    );
    noStore(res);
    return res.json({ run: result.rows[0], events: events.rows });
  } catch (error) {
    return sendError(res, error, 'run read failed');
  }
}

function installRoutes(app, originalGet, originalPost, originalPut) {
  if (app.__toolPlatformRoutesInstalled) return;
  Object.defineProperty(app, '__toolPlatformRoutesInstalled', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  originalGet.call(app, `${BASE_ROUTE}/registry`, handleRegistry);
  originalGet.call(app, `${BASE_ROUTE}/context`, handleGetContext);
  originalPut.call(app, `${BASE_ROUTE}/context`, handlePutContext);
  originalPost.call(app, `${BASE_ROUTE}/runs`, handleCreateRun);
  originalGet.call(app, `${BASE_ROUTE}/runs`, handleListRuns);
  originalGet.call(app, `${BASE_ROUTE}/runs/:runId`, handleGetRun);
  originalPost.call(app, `${BASE_ROUTE}/runs/:runId/complete`, handleCompleteRun);
  originalPost.call(app, `${BASE_ROUTE}/runs/:runId/fail`, handleFailRun);
}

if (!application.__toolPlatformHookInstalled) {
  const originalGet = application.get;
  const originalPost = application.post;
  const originalPut = application.put;

  Object.defineProperty(application, '__toolPlatformHookInstalled', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  const maybeInstall = (app, path, handlers) => {
    const isRouteRegistration = typeof path === 'string' && path.startsWith('/') && handlers.length > 0;
    if (isRouteRegistration) installRoutes(app, originalGet, originalPost, originalPut);
  };

  application.get = function toolPlatformGet(path, ...handlers) {
    maybeInstall(this, path, handlers);
    return originalGet.call(this, path, ...handlers);
  };
  application.post = function toolPlatformPost(path, ...handlers) {
    maybeInstall(this, path, handlers);
    return originalPost.call(this, path, ...handlers);
  };
  application.put = function toolPlatformPut(path, ...handlers) {
    maybeInstall(this, path, handlers);
    return originalPut.call(this, path, ...handlers);
  };
}
