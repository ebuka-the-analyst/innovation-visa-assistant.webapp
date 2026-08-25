const fs = require('fs');
const path = require('path');

const root = process.cwd();
function update(relative, transform) {
  const target = path.join(root, relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[managed-ai-extra] prepared ${relative}`);
  }
}

update('server/routes.ts', (source) => {
  let next = source;

  // Remove retired provider from admin diagnostics while retaining legacy DB score fields.
  next = next.replace(/\n\s*qwen:\s*\{\s*apiKey:\s*process\.env\.QWEN_API_KEY[\s\S]*?model:\s*"qwen-plus",\s*\},/g, '');
  next = next.replace(/\n\s*\{\s*name:\s*"Qwen",\s*status:\s*result\.qwenScore[\s\S]*?score:\s*result\.qwenScore,\s*\},/g, '');

  // Replace the remaining social-post Gemini/OpenAI fallback ladder with one centrally managed call.
  const socialStart = '// Try Gemini keys in sequence';
  const socialEnd = '        if (!content) {\n          return res.status(503).json({';
  while (next.includes(socialStart)) {
    const start = next.indexOf(socialStart);
    const end = next.indexOf(socialEnd, start);
    if (end === -1) throw new Error('Could not locate legacy social AI fallback end in server/routes.ts');
    const indentStart = next.lastIndexOf('\n', start) + 1;
    const replacement = '        let content: string | null = null;\n        try {\n          content = await callAI(prompt, 1200);\n        } catch (managedAIError) {\n          console.error("Managed AI social generation failed:", managedAIError);\n        }\n\n';
    next = next.slice(0, indentStart) + replacement + next.slice(end);
  }

  return next;
});

update('server/seoStrategyEngine.ts', (source) => {
  let next = source;
  next = next.replace('import Anthropic from "@anthropic-ai/sdk";\n', '');
  next = next.replace('import { GoogleGenAI } from "@google/genai";\n', '');
  if (!next.includes('BUSINESS_PLAN_MODEL')) {
    next = next.replace('import OpenAI from "openai";', 'import OpenAI from "openai";\nimport { BUSINESS_PLAN_MODEL } from "./aiModelConfig";');
  }

  const clientStart = next.indexOf('const anthropic = new Anthropic');
  const interfaceStart = next.indexOf('export interface SEOBusinessContext');
  if (clientStart !== -1 && interfaceStart !== -1 && interfaceStart > clientStart) {
    next = next.slice(0, clientStart) + 'const managedSEOAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });\n\n' + next.slice(interfaceStart);
  }

  const retiredCallStart = next.indexOf('async function callQwen(');
  const safeParseStart = next.indexOf('function safeParseJSON', retiredCallStart);
  if (retiredCallStart !== -1 && safeParseStart !== -1) {
    const helper = `async function callManagedSEO(prompt: string, role: string): Promise<Record<string, unknown>> {\n  const response: any = await managedSEOAI.chat.completions.create({\n    model: BUSINESS_PLAN_MODEL as any,\n    messages: [\n      { role: "system", content: role + " Respond with valid JSON only, with no markdown or surrounding explanation." },\n      { role: "user", content: prompt },\n    ],\n    response_format: { type: "json_object" },\n    max_tokens: 8000,\n  } as any);\n  return safeParseJSON(String(response.choices?.[0]?.message?.content || "{}"));\n}\n\n`;
    next = next.slice(0, retiredCallStart) + helper + next.slice(safeParseStart);
  }

  const analysisStartMarker = '  const [geminiResult, openaiResult, claudeResult, qwenResult] =';
  const dataMarker = '  const geminiData =';
  const analysisStart = next.indexOf(analysisStartMarker);
  const dataStart = next.indexOf(dataMarker, analysisStart);
  if (analysisStart !== -1 && dataStart !== -1) {
    const managedCalls = `  // Four specialised analysis passes, all routed through the centrally managed provider policy.\n  const [geminiResult, openaiResult, claudeResult, qwenResult] = await Promise.allSettled([\n    callManagedSEO(buildGeminiPrompt(ctx), "Act as the local SEO and Google Business Profile specialist."),\n    callManagedSEO(buildOpenAIPrompt(ctx), "Act as the technical SEO, keyword and CRO specialist."),\n    callManagedSEO(buildClaudePrompt(ctx), "Act as the content, entity and authority-building specialist."),\n    callManagedSEO(buildQwenPrompt(ctx), "Act as the production-content and publishing specialist."),\n  ]);\n\n`;
    next = next.slice(0, analysisStart) + managedCalls + next.slice(dataStart);
  }

  // Rename runtime logs so retired/provider-specific labels do not imply direct calls.
  next = next.replace(/\[SEO Engine\] Starting quad-model SEO analysis/g, '[SEO Engine] Starting managed multi-pass SEO analysis');
  next = next.replace(/\[SEO Engine\] Gemini failed:/g, '[SEO Engine] Local SEO pass failed:');
  next = next.replace(/\[SEO Engine\] OpenAI failed:/g, '[SEO Engine] Technical SEO pass failed:');
  next = next.replace(/\[SEO Engine\] Claude failed:/g, '[SEO Engine] Authority pass failed:');
  next = next.replace(/\[SEO Engine\] Qwen failed:/g, '[SEO Engine] Content-production pass failed:');
  next = next.replace(/\[SEO Engine\] All models completed/g, '[SEO Engine] Managed analysis passes completed');

  return next;
});

// Keep public-facing client copy aligned with the same trust policy in production builds.
require('./prepare-public-client-copy.cjs');

// Keep public server-rendered SEO claims aligned with the same trust policy in production builds.
require('./prepare-server-public-seo.cjs');

// Keep the Final Document Review waiting experience transparent in both dev and production builds.
require('./prepare-document-review-wait-ux.cjs');

console.log('[managed-ai-extra] provider-specific bypass cleanup complete');
