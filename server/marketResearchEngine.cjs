const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const OpenAIImport = require('openai');
const { ZodError } = require('zod');
const registry = require('../shared/tool-platform-registry.json');
const {
  MARKET_RESEARCH_VERSION,
  SUPPORTED_TOOL_IDS,
  marketResearchInputSchema,
  parseResearchOutput,
  extractSearchSourceUrls,
  validateSourceProvenance,
  buildResearchPrompt,
} = require('./marketResearchPolicy.cjs');

const OpenAI = OpenAIImport.default || OpenAIImport;
const ROUTE = '/api/market-research/run';
const COMMERCIAL_CATALOG_KEY = 'commercial.plan-catalog.v1';
const PLAN_RANK = Object.freeze({ free: 0, basic: 1, premium: 2, enterprise: 3, ultimate: 4 });
const FALLBACK_MINIMUM_PLAN = Object.freeze({
  'market-analysis': 'premium',
  'market-data-verifier': 'premium',
  'market-research': 'premium',
  'market-size': 'premium',
  'market-gap': 'premium',
  'competitor-bench': 'premium',
  'pmf-validator': 'premium',
});
const supportedToolIds = new Set(SUPPORTED_TOOL_IDS);
const application = express.application;
let pool;
let openai;

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

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('Market research provider is not configured');
    error.code = 'MARKET_RESEARCH_PROVIDER_NOT_CONFIGURED';
    throw error;
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120_000,
      maxRetries: 2,
    });
  }
  return openai;
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseCatalogValue(value) {
  if (isPlainObject(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function extractOutputText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }
  const chunks = [];
  for (const item of response?.output || []) {
    if (item?.type !== 'message') continue;
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function enforceAccess(client, userId, toolId) {
  if (!supportedToolIds.has(toolId)) {
    const error = new Error('Unsupported market research tool');
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

function replayResponse(existing) {
  return {
    success: true,
    idempotentReplay: true,
    runId: existing.id,
    validationState: existing.validation_state,
    registryVersion: existing.registry_version,
    policyVersion: existing.policy_version,
    resultSha256: existing.result_sha256,
    research: existing.result_payload,
  };
}

function sourceFreshness(source, accessedAt) {
  if (!source.publishedDate) return { publishedAgeDays: null, freshness: 'unknown' };
  const parsed = new Date(source.publishedDate);
  if (Number.isNaN(parsed.getTime())) return { publishedAgeDays: null, freshness: 'unknown' };
  const ageDays = Math.max(0, Math.floor((accessedAt.getTime() - parsed.getTime()) / 86_400_000));
  return {
    publishedAgeDays: ageDays,
    freshness: ageDays <= 365 ? 'recent' : ageDays <= 730 ? 'older' : 'stale_review_recommended',
  };
}

async function runValidatedResearch(input) {
  const client = getOpenAI();
  const model = process.env.OPENAI_MARKET_RESEARCH_MODEL || 'gpt-5.2';
  const accessedAt = new Date();
  const accessedDate = accessedAt.toISOString().slice(0, 10);
  const basePrompt = buildResearchPrompt(input, accessedDate);
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await client.responses.create({
        model,
        input: attempt === 1
          ? basePrompt
          : `${basePrompt}\n\nVALIDATION RETRY: Your previous attempt failed strict JSON or source-provenance validation. Be especially careful that every sourced fact cites source IDs whose URLs were genuinely surfaced by the web_search tool in THIS retry, and return valid JSON only.`,
        tools: [{ type: 'web_search', search_context_size: 'medium' }],
        include: ['web_search_call.action.sources'],
        max_output_tokens: 16_000,
      });

      const outputText = extractOutputText(response);
      if (!outputText) {
        const error = new Error('Research provider returned no output text');
        error.code = 'MARKET_RESEARCH_EMPTY_OUTPUT';
        throw error;
      }

      const parsed = parseResearchOutput(outputText);
      const toolSourceUrls = extractSearchSourceUrls(response);
      if (toolSourceUrls.size === 0) {
        const error = new Error('Research response contained no auditable web-search source list');
        error.code = 'MARKET_RESEARCH_NO_TOOL_SOURCES';
        throw error;
      }
      const provenance = validateSourceProvenance(parsed, toolSourceUrls);
      const sourceRegister = provenance.sources.map((source) => ({
        ...source,
        accessedAt: accessedAt.toISOString(),
        ...sourceFreshness(source, accessedAt),
      }));

      const sourceById = new Map(sourceRegister.map((source) => [source.id, source]));
      const authoritativeClaimCount = parsed.claims.filter((claim) =>
        claim.claimType === 'sourced_fact'
        && claim.sourceIds.some((id) => sourceById.get(id)?.quality === 'authoritative'),
      ).length;
      const sourcedFactCount = parsed.claims.filter((claim) => claim.claimType === 'sourced_fact').length;

      return {
        researchVersion: MARKET_RESEARCH_VERSION,
        providerModel: model,
        accessedAt: accessedAt.toISOString(),
        toolId: input.toolId,
        businessName: input.businessName,
        researchSummary: parsed.researchSummary,
        marketDefinition: parsed.marketDefinition,
        marketSizing: parsed.marketSizing,
        competitors: parsed.competitors,
        marketGaps: parsed.marketGaps,
        customerSignals: parsed.customerSignals,
        risksAndUnknowns: parsed.risksAndUnknowns,
        claims: parsed.claims,
        sourceRegister,
        recommendations: parsed.recommendations,
        provenance: {
          ...provenance,
          sourcedFactCount,
          authoritativeClaimCount,
          userAssumptionCount: input.userAssumptions.length,
          validationAttempts: attempt,
        },
        disclaimer: 'This is source-backed market research assembled from the web sources listed in this run. It is not a guarantee of market size, customer demand, endorsement or investment outcome. Re-check time-sensitive sources before relying on them in an application.',
      };
    } catch (error) {
      lastError = error;
      console.warn(`[MARKET RESEARCH] Validation attempt ${attempt} failed`, {
        code: error?.code,
        message: error?.message,
      });
    }
  }

  const error = new Error('Live market research could not pass source and structure validation');
  error.code = 'MARKET_RESEARCH_VALIDATION_EXHAUSTED';
  error.cause = lastError;
  throw error;
}

async function handleRun(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' });
  }

  const db = getPool();
  const client = await db.connect();
  let toolId = '';
  let clientRunKey = null;

  try {
    const rawInput = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const input = marketResearchInputSchema.parse(rawInput);
    toolId = input.toolId;
    clientRunKey = input.clientRunKey || null;
    const access = await enforceAccess(client, req.user.id, toolId);

    const preExisting = await findExistingRun(client, req.user.id, toolId, clientRunKey);
    if (preExisting) {
      noStore(res);
      return res.json(replayResponse(preExisting));
    }

    const research = await runValidatedResearch(input);
    const resultHash = hashJson(research);
    const inputSnapshot = { ...input };
    delete inputSnapshot.clientRunKey;

    await client.query('BEGIN');
    const contextResult = await client.query('SELECT revision FROM tool_case_contexts WHERE user_id = $1', [req.user.id]);
    const caseContextRevision = contextResult.rows[0] ? Number(contextResult.rows[0].revision) : 0;

    const existing = await findExistingRun(client, req.user.id, toolId, clientRunKey);
    if (existing) {
      await client.query('COMMIT');
      noStore(res);
      return res.json(replayResponse(existing));
    }

    const evidenceRefs = research.sourceRegister.map((source) => source.normalizedUrl).filter(Boolean).slice(0, 200);
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
        MARKET_RESEARCH_VERSION,
        caseContextRevision,
        JSON.stringify(inputSnapshot),
        JSON.stringify(evidenceRefs),
        JSON.stringify(research),
        resultHash,
        JSON.stringify({
          engine: 'openai-responses-web-search-with-source-provenance-validation',
          schemaValidated: true,
          sourceProvenanceValidated: true,
          webSearchSourceCount: research.provenance.searchToolSourceCount,
          registeredSourceCount: research.provenance.registeredSourceCount,
          sourcedFactCount: research.provenance.sourcedFactCount,
          meaning: 'validated means JSON schema and source provenance passed platform checks; it does not mean every source is independently audited or every inference is certain',
        }),
      ],
    );
    const runId = insert.rows[0].id;

    await client.query(
      `INSERT INTO tool_run_events (id, run_id, user_id, event_type, payload, created_at)
       VALUES
         (gen_random_uuid()::varchar, $1, $2, 'run_started', $3::jsonb, NOW()),
         (gen_random_uuid()::varchar, $1, $2, 'market_research_completed', $4::jsonb, NOW())`,
      [
        runId,
        req.user.id,
        JSON.stringify({
          executionMode: 'server_engine',
          researchVersion: MARKET_RESEARCH_VERSION,
          providerModel: research.providerModel,
          caseContextRevision,
        }),
        JSON.stringify({
          resultSha256: resultHash,
          webSearchSourceCount: research.provenance.searchToolSourceCount,
          registeredSourceCount: research.provenance.registeredSourceCount,
          sourcedFactCount: research.provenance.sourcedFactCount,
          validationAttempts: research.provenance.validationAttempts,
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
      policyVersion: MARKET_RESEARCH_VERSION,
      resultSha256: resultHash,
      research,
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}

    if (error instanceof ZodError) {
      noStore(res);
      return res.status(400).json({
        error: 'Market research input is incomplete or invalid',
        code: 'INVALID_MARKET_RESEARCH_INPUT',
        issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      });
    }

    if (error?.code === '23505' && clientRunKey) {
      try {
        const existing = await findExistingRun(client, req.user.id, toolId, clientRunKey);
        if (existing) {
          noStore(res);
          return res.json(replayResponse(existing));
        }
      } catch (lookupError) {
        console.error('[MARKET RESEARCH] Idempotency recovery lookup failed:', lookupError);
      }
    }

    if (error?.statusCode) {
      noStore(res);
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code || 'MARKET_RESEARCH_REQUEST_REJECTED',
        ...(error.minimumPlanId ? { minimumPlanId: error.minimumPlanId } : {}),
      });
    }

    if (error?.code === 'MARKET_RESEARCH_PROVIDER_NOT_CONFIGURED') {
      noStore(res);
      return res.status(503).json({ error: error.message, code: error.code });
    }

    if (error?.code === 'MARKET_RESEARCH_VALIDATION_EXHAUSTED') {
      console.error('[MARKET RESEARCH] Source validation exhausted:', error?.cause || error);
      noStore(res);
      return res.status(502).json({
        error: 'Live research completed but could not be verified safely. No result was saved.',
        code: error.code,
      });
    }

    console.error('[MARKET RESEARCH] Run failed:', error);
    noStore(res);
    return res.status(502).json({
      error: 'Live market research could not be completed safely',
      code: 'MARKET_RESEARCH_PROVIDER_ERROR',
    });
  } finally {
    client.release();
  }
}

function installRoute(app, originalPost) {
  if (app.__marketResearchRouteInstalled) return;
  Object.defineProperty(app, '__marketResearchRouteInstalled', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  originalPost.call(app, ROUTE, handleRun);
}

if (!application.__marketResearchHookInstalled) {
  const originalPost = application.post;
  Object.defineProperty(application, '__marketResearchHookInstalled', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  application.post = function marketResearchPost(path, ...handlers) {
    const isRouteRegistration = typeof path === 'string' && path.startsWith('/') && handlers.length > 0;
    if (isRouteRegistration) installRoute(this, originalPost);
    return originalPost.call(this, path, ...handlers);
  };
}

module.exports = { handleRun, runValidatedResearch };
