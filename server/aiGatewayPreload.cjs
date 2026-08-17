const crypto = require('crypto');

const port = process.env.PORT || '5000';
const upstreamKey = String(process.env.OPENAI_API_KEY || '').trim();

if (upstreamKey) {
  process.env.UPSTREAM_OPENAI_API_KEY = upstreamKey;
}

const token = process.env.INTERNAL_AI_GATEWAY_TOKEN || crypto.randomBytes(32).toString('hex');
process.env.INTERNAL_AI_GATEWAY_TOKEN = token;
process.env.OPENAI_API_KEY = token;
process.env.OPENAI_BASE_URL = `http://127.0.0.1:${port}/internal-ai-gateway/v1`;

process.env.AI_PROVIDER_GATEWAY_ACTIVE = '1';
