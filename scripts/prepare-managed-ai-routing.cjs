const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (relative) => path.join(root, relative);

function update(relative, transform) {
  const target = file(relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[managed-ai] prepared ${relative}`);
  }
}

update('server/index.ts', (source) => {
  let next = source;
  if (!next.includes('registerAIProviderGatewayRoutes')) {
    const anchor = 'import { startBusinessPlanRevisionWorker } from "./services/businessPlanRevisionService";';
    if (!next.includes(anchor)) throw new Error('Could not locate server/index.ts AI import anchor');
    next = next.replace(anchor, `${anchor}\nimport { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";`);
  }
  if (!next.includes('registerAIProviderGatewayRoutes(app);')) {
    const anchor = '  const server = await registerRoutes(app);';
    if (!next.includes(anchor)) throw new Error('Could not locate server/index.ts route-registration anchor');
    next = next.replace(anchor, `${anchor}\n  registerAIProviderGatewayRoutes(app);\n  registerAIProviderAdminRoutes(app);`);
  }
  return next;
});

update('server/routes.ts', (source) => {
  let next = source;
  next = next.replace('import { GoogleGenAI } from "@google/genai";\n', '');

  const oldClient = `const geminiAI = new GoogleGenAI({\n  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || "",\n});`;
  if (next.includes(oldClient)) {
    next = next.replace(oldClient, `const managedLegacyTextAI = {\n  models: {\n    generateContent: async ({ contents }: { contents: unknown }) => {\n      const completion = await openaiClient.chat.completions.create({\n        model: BUSINESS_PLAN_MODEL as any,\n        messages: [{ role: "user", content: typeof contents === "string" ? contents : JSON.stringify(contents) }],\n        max_tokens: 4000,\n      } as any);\n      return { text: completion.choices[0]?.message?.content || "" };\n    },\n  },\n};`);
  }
  next = next.replace(/\bgeminiAI\b/g, 'managedLegacyTextAI');
  return next;
});

update('server/blogGenerator.ts', (source) => {
  let next = source;
  if (!next.includes('import OpenAI from "openai";')) {
    const anchor = 'import { db } from "./db";';
    if (!next.includes(anchor)) throw new Error('Could not locate blogGenerator import anchor');
    next = next.replace(anchor, `import OpenAI from "openai";\nimport { BUSINESS_PLAN_MODEL } from "./aiModelConfig";\n${anchor}`);
  }

  const startMarker = '  // ── OpenAI REST API (primary writer)';
  const endMarker = '  throw new Error(\n    "Failed to generate blog content — all AI writers exhausted (OpenAI + Gemini fallback)",\n  );';
  if (next.includes(startMarker)) {
    const start = next.indexOf(startMarker);
    const endStart = next.indexOf(endMarker, start);
    if (endStart === -1) throw new Error('Could not locate blogGenerator legacy writer block end');
    const end = endStart + endMarker.length;
    const managedBlock = `  // Managed AI writer: provider and model are selected centrally in Admin.\n  try {\n    const managedBlogAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });\n    const response: any = await managedBlogAI.chat.completions.create({\n      model: BUSINESS_PLAN_MODEL as any,\n      messages: [\n        { role: "system", content: systemInstruction },\n        { role: "user", content: prompt },\n      ],\n      response_format: { type: "json_object" },\n      max_tokens: 8000,\n    } as any);\n\n    let raw = String(response.choices?.[0]?.message?.content || "").trim();\n    raw = raw.replace(/^\\\\\`\\\\\`\\\\\`(?:json)?\\\\s*/i, "").replace(/\\\\s*\\\\\`\\\\\`\\\\\`$/i, "").trim();\n    const objectStart = raw.indexOf("{");\n    const objectEnd = raw.lastIndexOf("}");\n    if (objectStart < 0 || objectEnd < objectStart) throw new Error("Managed AI blog response did not contain valid JSON");\n    const parsed = JSON.parse(raw.slice(objectStart, objectEnd + 1));\n\n    let finalContent = correctContent(String(parsed.content || ""));\n    const contentHasDisclaimer =\n      finalContent.includes("disclaimer-box") ||\n      finalContent.includes("Important Notice") ||\n      finalContent.includes("does not constitute");\n    if (!contentHasDisclaimer) {\n      finalContent += \\`\\n<div class="disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6"><p class="text-sm"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener" class="text-primary underline">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p></div>\\`;\n    }\n\n    const hasInternalLinks = finalContent.includes('href="/');\n    if (!hasInternalLinks) {\n      const links = \\`\\n<h3>Helpful Resources</h3><p>Explore <a href="/tools" class="text-primary hover:underline">our visa preparation tools</a>, use our <a href="/business-plan" class="text-primary hover:underline">Business Plan Generator</a>, or check our <a href="/faq" class="text-primary hover:underline">frequently asked questions</a>.</p>\\`;\n      const disclaimerIndex = finalContent.indexOf('<div class="disclaimer-box');\n      finalContent = disclaimerIndex > 0\n        ? finalContent.slice(0, disclaimerIndex) + links + finalContent.slice(disclaimerIndex)\n        : finalContent + links;\n    }\n\n    const validationResult = validateBlogContent({\n      title: parsed.title,\n      excerpt: parsed.excerpt,\n      content: finalContent,\n      category,\n      tags: parsed.tags || [],\n      metaTitle: parsed.metaTitle,\n      metaDescription: parsed.metaDescription,\n    });\n    console.log("[Blog Generator] Validation Report:");\n    console.log(generateValidationReport(validationResult));\n\n    const dateSlug = new Date().toISOString().split("T")[0];\n    const uniqueSlug = \\`\\${slugify(parsed.title)}-\\${dateSlug}-\\${Math.random().toString(36).substring(2, 6)}\\`;\n\n    let verificationResult = null;\n    let verificationStatus = "pending";\n    let isPublished = false;\n    let postStatus = "draft";\n    try {\n      console.log("[Blog Generator] Running dual-pass managed verification...");\n      verificationResult = await verifyBlogPost(parsed.title, finalContent);\n      if (verificationResult.passed) {\n        verificationStatus = "passed";\n        isPublished = true;\n        postStatus = "published";\n      } else {\n        verificationStatus = "human_review";\n      }\n    } catch (verifyError) {\n      console.error("[Blog Generator] Managed verification error:", verifyError);\n      verificationStatus = "human_review";\n    }\n\n    return {\n      title: parsed.title,\n      slug: uniqueSlug,\n      excerpt: parsed.excerpt,\n      content: finalContent,\n      category,\n      tags: parsed.tags || [],\n      metaTitle: parsed.metaTitle || parsed.title,\n      metaDescription: parsed.metaDescription || parsed.excerpt,\n      metaKeywords: parsed.metaKeywords || parsed.tags || [],\n      featuredImage: buildCoverImageUrl(parsed.title || topic, category),\n      readingTime: parsed.readingTime || 8,\n      author: "UK Visa Expert Team",\n      authorBio: "Our team provides accurate, verified information about the UK Innovator Founder Visa process. Content is checked through the platform's centrally managed AI verification policy against official sources.",\n      aiVerificationScore: verificationResult?.compositeScore ?? null,\n      geminiScore: verificationResult?.geminiScore ?? null,\n      openaiScore: verificationResult?.openaiScore ?? null,\n      verificationStatus,\n      verificationDetails: verificationResult?.details ?? null,\n      verifiedAt: verificationResult?.verifiedAt ?? null,\n      verificationExpiresAt: verificationResult?.verificationExpiresAt ?? null,\n      humanReviewRequired: verificationResult?.requiresHumanReview ?? true,\n      contradictionFlags: verificationResult?.contradictionFlags ?? 0,\n      sourcesCited: verificationResult?.sourcesCited ?? 0,\n      contentHash: verificationResult?.contentHash ?? computeContentHash(finalContent),\n      isPublished,\n      postStatus,\n    };\n  } catch (error: any) {\n    console.error("[Blog Generator] Managed AI generation failed:", error?.message || error);\n    throw new Error(\\`Failed to generate blog content through the managed AI provider: \\${error?.message || "unknown error"}\\`);\n  }`;
    next = next.slice(0, start) + managedBlock + next.slice(end);
  }
  return next;
});

update('client/src/App.tsx', (source) => {
  let next = source;
  if (!next.includes('const AdminAIProviders = lazy(')) {
    const anchor = 'const SeoStrategy = lazy(() => import("@/pages/admin/SeoStrategy"));';
    if (!next.includes(anchor)) throw new Error('Could not locate App.tsx admin import anchor');
    next = next.replace(anchor, `${anchor}\nconst AdminAIProviders = lazy(() => import("@/pages/admin/AIProviders"));`);
  }
  next = next.replace(
    'const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard"];',
    'const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard", "/admin/ai-providers"];',
  );
  if (!next.includes('<Route path="/admin/ai-providers"')) {
    const anchor = '      <Route path="/admin-dashboard" component={AdminDashboard} />;';
    if (next.includes(anchor)) {
      next = next.replace(anchor, `      <Route path="/admin/ai-providers" component={AdminAIProviders} />\n${anchor}`);
    } else {
      const normalAnchor = '      <Route path="/admin-dashboard" component={AdminDashboard} />';
      if (!next.includes(normalAnchor)) throw new Error('Could not locate App.tsx admin route anchor');
      next = next.replace(normalAnchor, `      <Route path="/admin/ai-providers" component={AdminAIProviders} />\n${normalAnchor}`);
    }
  }
  return next;
});

update('client/src/components/AdminSidebar.tsx', (source) => {
  let next = source;
  if (!next.includes('id: "settings-ai-providers"')) {
    const anchor = '      { id: "settings-general", label: "General Settings", icon: Settings, badge: null },';
    if (!next.includes(anchor)) throw new Error('Could not locate AdminSidebar settings anchor');
    next = next.replace(anchor, `${anchor}\n      { id: "settings-ai-providers", label: "AI Providers", icon: Cpu, badge: null },`);
  }
  if (!next.includes('const [, setAdminLocation] = useLocation();')) {
    const anchor = '  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Dashboard", "User Intelligence", "Plan Lifecycle"]);';
    if (!next.includes(anchor)) throw new Error('Could not locate AdminSidebar state anchor');
    next = next.replace(anchor, `${anchor}\n  const [, setAdminLocation] = useLocation();`);
  }
  next = next.replace(
    'onClick={() => onSectionChange(item.id)}',
    'onClick={() => item.id === "settings-ai-providers" ? setAdminLocation("/admin/ai-providers") : onSectionChange(item.id)}',
  );
  return next;
});

console.log('[managed-ai] routing preparation complete');
