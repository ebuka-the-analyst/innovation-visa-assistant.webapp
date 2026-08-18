const fs = require('fs');
const path = require('path');

const root = process.cwd();

function update(relative, transform) {
  const target = path.join(root, relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[document-review-ai] prepared ${relative}`);
  }
}

update('server/services/documentReviewService.ts', (source) => {
  if (source.includes('reasoning_effort: "low"') && source.includes('Math.max(maxTokens, 4_000)')) {
    return source;
  }

  const anchor = `    response_format: { type: "json_object" },\n    max_tokens: maxTokens,`;
  if (!source.includes(anchor)) {
    throw new Error('Document review managed AI request anchor not found');
  }

  return source.replace(
    anchor,
    `    response_format: { type: "json_object" },\n    // GPT-5.6 defaults to medium reasoning, and reasoning tokens count against the\n    // completion budget. A small budget can therefore finish with no visible JSON.\n    // Keep review reasoning explicit and reserve enough output budget for the result.\n    reasoning_effort: "low",\n    max_tokens: Math.max(maxTokens, 4_000),`,
  );
});

update('server/aiProviderGateway.ts', (source) => {
  if (source.includes('Empty OpenAI chat completion') && source.includes('reasoning_effort: "none"')) {
    return source;
  }

  const anchor = `    if (payload.max_tokens != null && payload.max_completion_tokens == null) {\n      payload.max_completion_tokens = payload.max_tokens;\n      delete payload.max_tokens;\n    }\n    if (/^gpt-5/i.test(model)) delete payload.temperature;\n    const result: any = await client.chat.completions.create(payload);\n    result.provider = "openai";\n    return result;`;

  if (!source.includes(anchor)) {
    throw new Error('Managed OpenAI chat gateway anchor not found');
  }

  const replacement = `    if (payload.max_tokens != null && payload.max_completion_tokens == null) {\n      payload.max_completion_tokens = payload.max_tokens;\n      delete payload.max_tokens;\n    }\n    const isGpt5Family = /^gpt-5/i.test(model);\n    if (isGpt5Family) {\n      delete payload.temperature;\n      // GPT-5.6 defaults to medium reasoning. Use low reasoning for ordinary\n      // Chat Completions unless the caller deliberately selected another effort.\n      if (payload.reasoning_effort == null) payload.reasoning_effort = "low";\n    }\n\n    const hasAssistantOutput = (completion: any): boolean => {\n      const choice = completion?.choices?.[0];\n      const text = normaliseTextContent(choice?.message?.content).trim();\n      const toolCalls = Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : [];\n      return Boolean(text || toolCalls.length);\n    };\n\n    let result: any = await client.chat.completions.create(payload);\n\n    // A reasoning model can return HTTP 200 but consume its whole completion budget\n    // on reasoning, leaving message.content empty. Treat that as an incomplete\n    // provider result, retry once with reasoning disabled and a safe output floor,\n    // then surface a recoverable provider error so configured fallback can run.\n    if (!hasAssistantOutput(result)) {\n      const finishReason = String(result?.choices?.[0]?.finish_reason || "unknown");\n      const reasoningTokens = Number(result?.usage?.completion_tokens_details?.reasoning_tokens || 0);\n      console.warn(\n        \`[AI Gateway] Empty OpenAI chat completion from \${model}; finish_reason=\${finishReason}; reasoning_tokens=\${reasoningTokens}. Retrying with visible-output safeguards.\`,\n      );\n\n      if (isGpt5Family) {\n        const retryPayload: any = {\n          ...payload,\n          reasoning_effort: "none",\n          max_completion_tokens: Math.max(Number(payload.max_completion_tokens || 0), 4_000),\n        };\n        result = await client.chat.completions.create(retryPayload);\n      }\n\n      if (!hasAssistantOutput(result)) {\n        const retryFinishReason = String(result?.choices?.[0]?.finish_reason || finishReason || "unknown");\n        const error: any = new Error(\n          \`AI provider returned an empty completion (finish_reason=\${retryFinishReason})\`,\n        );\n        error.status = 503;\n        throw error;\n      }\n    }\n\n    result.provider = "openai";\n    return result;`;

  return source.replace(anchor, replacement);
});

console.log('[document-review-ai] empty-output safeguards prepared');
