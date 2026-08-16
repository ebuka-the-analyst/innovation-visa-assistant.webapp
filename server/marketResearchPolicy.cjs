const { z } = require('zod');

const MARKET_RESEARCH_VERSION = 'market-research-web-2026-08-16.v1';
const MAX_SOURCES = 40;

const SUPPORTED_TOOL_IDS = Object.freeze([
  'market-analysis',
  'market-data-verifier',
  'market-research',
  'market-size',
  'market-gap',
  'competitor-bench',
  'pmf-validator',
]);

const marketResearchInputSchema = z.object({
  toolId: z.enum(SUPPORTED_TOOL_IDS),
  businessName: z.string().trim().min(2).max(160),
  businessSummary: z.string().trim().min(30).max(5000),
  targetGeography: z.string().trim().min(2).max(500),
  targetCustomers: z.string().trim().min(10).max(2500),
  problemStatement: z.string().trim().min(20).max(3500),
  proposedSolution: z.string().trim().min(20).max(3500),
  knownCompetitors: z.array(z.string().trim().min(2).max(160)).max(20).default([]),
  researchQuestions: z.array(z.string().trim().min(10).max(500)).max(12).default([]),
  userAssumptions: z.array(z.object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(2).max(160),
    value: z.string().trim().min(1).max(1000),
  }).strict()).max(30).default([]),
  clientRunKey: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/).optional(),
}).strict();

const marketSizingValueSchema = z.object({
  status: z.enum(['sourced', 'calculated_from_sourced_inputs', 'user_assumption', 'unavailable']),
  value: z.number().finite().nonnegative().nullable(),
  currency: z.string().trim().min(1).max(12).nullable(),
  period: z.string().trim().max(80).nullable(),
  methodology: z.string().trim().min(3).max(1500),
  sourceIds: z.array(z.string().trim().min(1).max(80)).max(12),
  assumptionIds: z.array(z.string().trim().min(1).max(80)).max(12),
}).strict();

const sourceRegisterSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(500),
  url: z.string().url().max(2000),
  publisher: z.string().trim().max(300).default(''),
  publishedDate: z.string().trim().max(40).nullable().default(null),
  notes: z.string().trim().max(1000).default(''),
}).strict();

const researchClaimSchema = z.object({
  id: z.string().trim().min(1).max(80),
  claim: z.string().trim().min(5).max(2500),
  claimType: z.enum(['sourced_fact', 'inference', 'user_assumption']),
  sourceIds: z.array(z.string().trim().min(1).max(80)).max(12),
  assumptionIds: z.array(z.string().trim().min(1).max(80)).max(12),
  confidence: z.enum(['high', 'medium', 'low']),
}).strict();

const marketResearchOutputSchema = z.object({
  researchSummary: z.string().trim().min(20).max(6000),
  marketDefinition: z.string().trim().min(10).max(3000),
  marketSizing: z.object({
    tam: marketSizingValueSchema,
    sam: marketSizingValueSchema,
    som: marketSizingValueSchema,
  }).strict(),
  competitors: z.array(z.object({
    name: z.string().trim().min(2).max(200),
    positioning: z.string().trim().min(5).max(1500),
    strengths: z.array(z.string().trim().min(2).max(500)).max(8),
    weaknessesOrGaps: z.array(z.string().trim().min(2).max(500)).max(8),
    sourceIds: z.array(z.string().trim().min(1).max(80)).max(12),
  }).strict()).max(20),
  marketGaps: z.array(z.object({
    gap: z.string().trim().min(5).max(1500),
    evidence: z.string().trim().min(5).max(1500),
    sourceIds: z.array(z.string().trim().min(1).max(80)).max(12),
    confidence: z.enum(['high', 'medium', 'low']),
  }).strict()).max(20),
  customerSignals: z.array(z.object({
    signal: z.string().trim().min(5).max(1500),
    sourceIds: z.array(z.string().trim().min(1).max(80)).max(12),
    confidence: z.enum(['high', 'medium', 'low']),
  }).strict()).max(20),
  risksAndUnknowns: z.array(z.string().trim().min(3).max(1000)).max(30),
  claims: z.array(researchClaimSchema).min(1).max(80),
  sourceRegister: z.array(sourceRegisterSchema).min(1).max(MAX_SOURCES),
  recommendations: z.array(z.string().trim().min(5).max(1200)).max(20),
}).strict();

function stripCodeFence(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function parseResearchOutput(text) {
  const parsed = JSON.parse(stripCodeFence(text));
  return marketResearchOutputSchema.parse(parsed);
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

function hostnameOf(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

function classifySource(source) {
  const hostname = hostnameOf(source.url);
  const officialDomains = [
    'gov.uk',
    'ons.gov.uk',
    'legislation.gov.uk',
    'companieshouse.gov.uk',
    'bankofengland.co.uk',
    'ukri.org',
  ];
  const academicSuffixes = ['.ac.uk', '.edu'];
  const official = officialDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  const academic = academicSuffixes.some((suffix) => hostname.endsWith(suffix));
  if (official) return { quality: 'authoritative', category: 'official_public_source' };
  if (academic) return { quality: 'strong', category: 'academic_or_research' };
  return { quality: 'contextual', category: 'web_source' };
}

function extractSearchSourceUrls(response) {
  const urls = new Set();
  for (const item of response?.output || []) {
    if (item?.type !== 'web_search_call') continue;
    for (const source of item?.action?.sources || []) {
      const normalized = normalizeUrl(source?.url);
      if (normalized) urls.add(normalized);
    }
  }
  return urls;
}

function validateSourceProvenance(output, toolSourceUrls) {
  const sourceById = new Map();
  const sourceIds = new Set();
  const unverifiedSources = [];
  const duplicateSourceIds = [];

  for (const source of output.sourceRegister) {
    if (sourceIds.has(source.id)) duplicateSourceIds.push(source.id);
    sourceIds.add(source.id);
    const normalizedUrl = normalizeUrl(source.url);
    const verifiedBySearchTool = Boolean(normalizedUrl && toolSourceUrls.has(normalizedUrl));
    const classified = classifySource(source);
    const enriched = {
      ...source,
      normalizedUrl,
      verifiedBySearchTool,
      quality: classified.quality,
      category: classified.category,
    };
    sourceById.set(source.id, enriched);
    if (!verifiedBySearchTool) unverifiedSources.push({ id: source.id, url: source.url });
  }

  const invalidReferences = [];
  const unsupportedSourcedFacts = [];

  const validateRefs = (ownerType, ownerId, refs, requireVerified) => {
    for (const sourceId of refs || []) {
      const source = sourceById.get(sourceId);
      if (!source) {
        invalidReferences.push({ ownerType, ownerId, sourceId, reason: 'source_id_not_in_register' });
        continue;
      }
      if (requireVerified && !source.verifiedBySearchTool) {
        unsupportedSourcedFacts.push({ ownerType, ownerId, sourceId, reason: 'source_url_not_in_web_search_source_set' });
      }
    }
  };

  for (const claim of output.claims) {
    validateRefs('claim', claim.id, claim.sourceIds, claim.claimType === 'sourced_fact');
    if (claim.claimType === 'sourced_fact' && claim.sourceIds.length === 0) {
      unsupportedSourcedFacts.push({ ownerType: 'claim', ownerId: claim.id, reason: 'sourced_fact_without_source' });
    }
    if (claim.claimType === 'user_assumption' && claim.assumptionIds.length === 0) {
      invalidReferences.push({ ownerType: 'claim', ownerId: claim.id, reason: 'user_assumption_without_assumption_id' });
    }
  }

  for (const competitor of output.competitors) {
    validateRefs('competitor', competitor.name, competitor.sourceIds, true);
  }
  for (const gap of output.marketGaps) {
    validateRefs('market_gap', gap.gap.slice(0, 80), gap.sourceIds, true);
  }
  for (const signal of output.customerSignals) {
    validateRefs('customer_signal', signal.signal.slice(0, 80), signal.sourceIds, true);
  }
  for (const [name, sizing] of Object.entries(output.marketSizing)) {
    const requireVerified = ['sourced', 'calculated_from_sourced_inputs'].includes(sizing.status);
    validateRefs(`market_sizing_${name}`, name, sizing.sourceIds, requireVerified);
    if (requireVerified && sizing.sourceIds.length === 0) {
      unsupportedSourcedFacts.push({ ownerType: `market_sizing_${name}`, ownerId: name, reason: 'sourced_market_size_without_source' });
    }
  }

  if (duplicateSourceIds.length || invalidReferences.length || unsupportedSourcedFacts.length) {
    const error = new Error('Market research source-provenance validation failed');
    error.code = 'MARKET_SOURCE_VALIDATION_FAILED';
    error.details = { duplicateSourceIds, invalidReferences, unsupportedSourcedFacts, unverifiedSources };
    throw error;
  }

  return {
    sources: Array.from(sourceById.values()),
    searchToolSourceCount: toolSourceUrls.size,
    registeredSourceCount: sourceById.size,
    verifiedRegisteredSourceCount: Array.from(sourceById.values()).filter((source) => source.verifiedBySearchTool).length,
    unusedSearchToolSourceCount: Math.max(0, toolSourceUrls.size - Array.from(sourceById.values()).filter((source) => source.verifiedBySearchTool).length),
    unverifiedSources,
  };
}

function buildResearchPrompt(input, accessedDate) {
  const assumptions = input.userAssumptions.length
    ? input.userAssumptions.map((item) => `- ${item.id}: ${item.label} = ${item.value}`).join('\n')
    : '- None supplied';
  const competitors = input.knownCompetitors.length ? input.knownCompetitors.join(', ') : 'None supplied';
  const questions = input.researchQuestions.length
    ? input.researchQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')
    : '1. What credible market, competitor, demand and sizing evidence is available for this business?';

  return `You are a market-research analyst supporting a UK Innovator Founder business evidence pack.

Use web search extensively. Research current, credible sources. Prefer official statistics, regulators, government publications, primary company sources, recognised research institutions and reputable industry sources. Avoid low-quality SEO pages where stronger sources exist.

CRITICAL SOURCE RULES:
1. Do not state a numeric market fact, market size, growth rate, customer count, competitor fact or other externally verifiable factual claim as a sourced fact unless you found a supporting web source in this run.
2. Every sourced_fact must cite one or more source IDs from sourceRegister.
3. Every sourceRegister URL must be a URL you actually used from web search in this run. Never invent URLs.
4. Distinguish sourced facts from inference and user assumptions.
5. Do not turn the user's assumptions into external facts.
6. If TAM/SAM/SOM cannot be supported credibly, return status "unavailable" rather than inventing a number.
7. If calculating a market size from sourced inputs, explain the calculation and cite every sourced input. If user assumptions are also used, include their assumption IDs.
8. Competitor strengths/weaknesses and market gaps must cite supporting sources. State uncertainty where evidence is limited.
9. Keep source IDs short and unique, for example src1, src2.
10. Access date is ${accessedDate}.

BUSINESS:
Name: ${input.businessName}
Summary: ${input.businessSummary}
Target geography: ${input.targetGeography}
Target customers: ${input.targetCustomers}
Problem: ${input.problemStatement}
Proposed solution: ${input.proposedSolution}
Known competitors: ${competitors}

USER ASSUMPTIONS (not external facts unless independently sourced):
${assumptions}

RESEARCH QUESTIONS:
${questions}

Return ONLY valid JSON with this exact top-level structure:
{
  "researchSummary": "...",
  "marketDefinition": "...",
  "marketSizing": {
    "tam": {"status":"sourced|calculated_from_sourced_inputs|user_assumption|unavailable","value":null,"currency":null,"period":null,"methodology":"...","sourceIds":[],"assumptionIds":[]},
    "sam": {"status":"sourced|calculated_from_sourced_inputs|user_assumption|unavailable","value":null,"currency":null,"period":null,"methodology":"...","sourceIds":[],"assumptionIds":[]},
    "som": {"status":"sourced|calculated_from_sourced_inputs|user_assumption|unavailable","value":null,"currency":null,"period":null,"methodology":"...","sourceIds":[],"assumptionIds":[]}
  },
  "competitors": [{"name":"...","positioning":"...","strengths":["..."],"weaknessesOrGaps":["..."],"sourceIds":["src1"]}],
  "marketGaps": [{"gap":"...","evidence":"...","sourceIds":["src1"],"confidence":"high|medium|low"}],
  "customerSignals": [{"signal":"...","sourceIds":["src1"],"confidence":"high|medium|low"}],
  "risksAndUnknowns": ["..."],
  "claims": [{"id":"claim1","claim":"...","claimType":"sourced_fact|inference|user_assumption","sourceIds":["src1"],"assumptionIds":[],"confidence":"high|medium|low"}],
  "sourceRegister": [{"id":"src1","title":"...","url":"https://...","publisher":"...","publishedDate":null,"notes":"why this source matters"}],
  "recommendations": ["..."]
}

Do not include markdown fences or prose outside the JSON.`;
}

module.exports = {
  MARKET_RESEARCH_VERSION,
  MAX_SOURCES,
  SUPPORTED_TOOL_IDS,
  marketResearchInputSchema,
  marketResearchOutputSchema,
  parseResearchOutput,
  extractSearchSourceUrls,
  validateSourceProvenance,
  buildResearchPrompt,
  classifySource,
};
