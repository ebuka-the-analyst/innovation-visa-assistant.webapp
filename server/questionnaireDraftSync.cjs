const crypto = require("crypto");
const { Pool } = require("pg");

const ROUTE = "/api/questionnaire/draft";
const MAX_DRAFT_BYTES = 240_000;
const DRAFT_SCHEMA_VERSION = 1;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function isAuthenticated(req) {
  return Boolean(req?.isAuthenticated && req.isAuthenticated() && req.user?.id);
}

function requireAuthenticated(req, res) {
  if (!isAuthenticated(req)) {
    res.setHeader("Cache-Control", "no-store");
    res.status(401).json({ error: "Authentication required", code: "AUTHENTICATION_REQUIRED" });
    return false;
  }
  return true;
}

function noStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normaliseObject(value) {
  if (isPlainObject(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isPlainObject(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function byteLength(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function hashJson(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function sanitiseDraft(value) {
  if (!isPlainObject(value)) {
    const error = new Error("draftData must be a JSON object");
    error.statusCode = 400;
    error.code = "INVALID_DRAFT";
    throw error;
  }
  if (byteLength(value) > MAX_DRAFT_BYTES) {
    const error = new Error("Questionnaire draft is too large");
    error.statusCode = 413;
    error.code = "DRAFT_TOO_LARGE";
    throw error;
  }
  return JSON.parse(JSON.stringify(value));
}

function draftEnvelope(contextData) {
  const raw = normaliseObject(contextData).questionnaireDraft;
  if (!isPlainObject(raw)) return null;
  const fields = normaliseObject(raw.fields);
  return {
    schemaVersion: Number(raw.schemaVersion || DRAFT_SCHEMA_VERSION),
    source: raw.source === "traditional_form" ? raw.source : "traditional_form",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    fields,
  };
}

async function handleGet(req, res) {
  try {
    if (!requireAuthenticated(req, res)) return;
    const result = await getPool().query(
      `SELECT revision, context_data, updated_at
         FROM tool_case_contexts
        WHERE user_id = $1
        LIMIT 1`,
      [req.user.id],
    );
    const row = result.rows[0] || null;
    const draft = row ? draftEnvelope(row.context_data) : null;
    noStore(res);
    return res.json({
      revision: row ? Number(row.revision || 0) : 0,
      draftData: draft?.fields || {},
      schemaVersion: draft?.schemaVersion || DRAFT_SCHEMA_VERSION,
      source: draft?.source || "traditional_form",
      draftUpdatedAt: draft?.updatedAt || null,
      contextUpdatedAt: row?.updated_at || null,
    });
  } catch (error) {
    console.error("[QUESTIONNAIRE DRAFT] Read failed:", error);
    noStore(res);
    return res.status(500).json({ error: "Questionnaire draft could not be loaded", code: "DRAFT_READ_ERROR" });
  }
}

async function handlePut(req, res) {
  if (!requireAuthenticated(req, res)) return;
  const client = await getPool().connect();
  try {
    const body = isPlainObject(req.body) ? req.body : {};
    const allowedKeys = new Set(["draftData"]);
    if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
      const error = new Error("Questionnaire draft request contains unknown fields");
      error.statusCode = 400;
      error.code = "UNKNOWN_DRAFT_FIELD";
      throw error;
    }
    const draftData = sanitiseDraft(body.draftData || {});
    const now = new Date().toISOString();

    await client.query("BEGIN");
    const currentResult = await client.query(
      `SELECT revision, context_data, evidence_refs
         FROM tool_case_contexts
        WHERE user_id = $1
        FOR UPDATE`,
      [req.user.id],
    );
    const current = currentResult.rows[0] || null;
    const contextData = normaliseObject(current?.context_data);
    const evidenceRefs = Array.isArray(current?.evidence_refs) ? current.evidence_refs : [];
    const previousHash = current ? hashJson({ contextData, evidenceRefs }) : null;
    const nextContextData = {
      ...contextData,
      questionnaireDraft: {
        schemaVersion: DRAFT_SCHEMA_VERSION,
        source: "traditional_form",
        updatedAt: now,
        fields: draftData,
      },
    };
    const nextRevision = Number(current?.revision || 0) + 1;
    const newHash = hashJson({ contextData: nextContextData, evidenceRefs });

    await client.query(
      `INSERT INTO tool_case_contexts (user_id, revision, context_data, evidence_refs, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET revision = EXCLUDED.revision,
           context_data = EXCLUDED.context_data,
           evidence_refs = EXCLUDED.evidence_refs,
           updated_at = NOW()`,
      [req.user.id, nextRevision, JSON.stringify(nextContextData), JSON.stringify(evidenceRefs)],
    );
    await client.query(
      `INSERT INTO tool_case_context_events (id, user_id, revision, previous_sha256, new_sha256, created_at)
       VALUES (gen_random_uuid()::varchar, $1, $2, $3, $4, NOW())`,
      [req.user.id, nextRevision, previousHash, newHash],
    );
    await client.query("COMMIT");

    noStore(res);
    return res.json({
      success: true,
      revision: nextRevision,
      draftData,
      schemaVersion: DRAFT_SCHEMA_VERSION,
      source: "traditional_form",
      draftUpdatedAt: now,
    });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("[QUESTIONNAIRE DRAFT] Save failed:", error);
    noStore(res);
    return res.status(error?.statusCode || 500).json({
      error: error?.statusCode ? error.message : "Questionnaire draft could not be saved",
      code: error?.code || "DRAFT_SAVE_ERROR",
    });
  } finally {
    client.release();
  }
}

async function handleDelete(req, res) {
  if (!requireAuthenticated(req, res)) return;
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const currentResult = await client.query(
      `SELECT revision, context_data, evidence_refs
         FROM tool_case_contexts
        WHERE user_id = $1
        FOR UPDATE`,
      [req.user.id],
    );
    const current = currentResult.rows[0] || null;
    if (!current) {
      await client.query("COMMIT");
      noStore(res);
      return res.json({ success: true, revision: 0, deleted: false });
    }

    const contextData = normaliseObject(current.context_data);
    if (!Object.prototype.hasOwnProperty.call(contextData, "questionnaireDraft")) {
      await client.query("COMMIT");
      noStore(res);
      return res.json({ success: true, revision: Number(current.revision || 0), deleted: false });
    }

    const evidenceRefs = Array.isArray(current.evidence_refs) ? current.evidence_refs : [];
    const previousHash = hashJson({ contextData, evidenceRefs });
    const nextContextData = { ...contextData };
    delete nextContextData.questionnaireDraft;
    const nextRevision = Number(current.revision || 0) + 1;
    const newHash = hashJson({ contextData: nextContextData, evidenceRefs });

    await client.query(
      `UPDATE tool_case_contexts
          SET revision = $2, context_data = $3::jsonb, updated_at = NOW()
        WHERE user_id = $1`,
      [req.user.id, nextRevision, JSON.stringify(nextContextData)],
    );
    await client.query(
      `INSERT INTO tool_case_context_events (id, user_id, revision, previous_sha256, new_sha256, created_at)
       VALUES (gen_random_uuid()::varchar, $1, $2, $3, $4, NOW())`,
      [req.user.id, nextRevision, previousHash, newHash],
    );
    await client.query("COMMIT");

    noStore(res);
    return res.json({ success: true, revision: nextRevision, deleted: true });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("[QUESTIONNAIRE DRAFT] Delete failed:", error);
    noStore(res);
    return res.status(500).json({ error: "Questionnaire draft could not be cleared", code: "DRAFT_DELETE_ERROR" });
  } finally {
    client.release();
  }
}

function registerQuestionnaireDraftRoutes(app) {
  if (app.__questionnaireDraftSyncRoutesInstalled) return;
  Object.defineProperty(app, "__questionnaireDraftSyncRoutesInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  app.get(ROUTE, handleGet);
  app.put(ROUTE, handlePut);
  app.delete(ROUTE, handleDelete);
}

module.exports = {
  ROUTE,
  DRAFT_SCHEMA_VERSION,
  sanitiseDraft,
  draftEnvelope,
  handleGet,
  handlePut,
  handleDelete,
  registerQuestionnaireDraftRoutes,
};
