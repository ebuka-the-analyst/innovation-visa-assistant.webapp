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
    const managedBlock = [
      '  // Managed AI writer: provider and model are selected centrally in Admin.',
      '  try {',
      '    const managedBlogAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });',
      '    const response: any = await managedBlogAI.chat.completions.create({',
      '      model: BUSINESS_PLAN_MODEL as any,',
      '      messages: [',
      '        { role: "system", content: systemInstruction },',
      '        { role: "user", content: prompt },',
      '      ],',
      '      response_format: { type: "json_object" },',
      '      max_tokens: 8000,',
      '    } as any);',
      '',
      '    let raw = String(response.choices?.[0]?.message?.content || "").trim();',
      '    if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\\s*/i, "").replace(/\\s*```$/i, "").trim();',
      '    const objectStart = raw.indexOf("{");',
      '    const objectEnd = raw.lastIndexOf("}");',
      '    if (objectStart < 0 || objectEnd < objectStart) throw new Error("Managed AI blog response did not contain valid JSON");',
      '    const parsed = JSON.parse(raw.slice(objectStart, objectEnd + 1));',
      '',
      '    let finalContent = correctContent(String(parsed.content || ""));',
      '    const contentHasDisclaimer =',
      '      finalContent.includes("disclaimer-box") ||',
      '      finalContent.includes("Important Notice") ||',
      '      finalContent.includes("does not constitute");',
      '    if (!contentHasDisclaimer) {',
      '      finalContent += "\\n<div class=\\\"disclaimer-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-6\\\"><p class=\\\"text-sm\\\"><strong>Important Notice:</strong> This article provides general information only and does not constitute immigration or legal advice. Requirements and fees may change. Always verify current information on <a href=\\\"https://www.gov.uk/innovator-founder-visa\\\" target=\\\"_blank\\\" rel=\\\"noopener\\\" class=\\\"text-primary underline\\\">GOV.UK</a> and consider consulting a qualified immigration adviser for your specific circumstances.</p></div>";',
      '    }',
      '',
      '    const hasInternalLinks = finalContent.includes("href=\\\"/");',
      '    if (!hasInternalLinks) {',
      '      const links = "\\n<h3>Helpful Resources</h3><p>Explore <a href=\\\"/tools\\\" class=\\\"text-primary hover:underline\\\">our visa preparation tools</a>, use our <a href=\\\"/business-plan\\\" class=\\\"text-primary hover:underline\\\">Business Plan Generator</a>, or check our <a href=\\\"/faq\\\" class=\\\"text-primary hover:underline\\\">frequently asked questions</a>.</p>";',
      '      const disclaimerIndex = finalContent.indexOf("<div class=\\\"disclaimer-box");',
      '      finalContent = disclaimerIndex > 0',
      '        ? finalContent.slice(0, disclaimerIndex) + links + finalContent.slice(disclaimerIndex)',
      '        : finalContent + links;',
      '    }',
      '',
      '    const validationResult = validateBlogContent({',
      '      title: parsed.title,',
      '      excerpt: parsed.excerpt,',
      '      content: finalContent,',
      '      category,',
      '      tags: parsed.tags || [],',
      '      metaTitle: parsed.metaTitle,',
      '      metaDescription: parsed.metaDescription,',
      '    });',
      '    console.log("[Blog Generator] Validation Report:");',
      '    console.log(generateValidationReport(validationResult));',
      '',
      '    const dateSlug = new Date().toISOString().split("T")[0];',
      '    const uniqueSlug = slugify(parsed.title) + "-" + dateSlug + "-" + Math.random().toString(36).substring(2, 6);',
      '',
      '    let verificationResult = null;',
      '    let verificationStatus = "pending";',
      '    let isPublished = false;',
      '    let postStatus = "draft";',
      '    try {',
      '      console.log("[Blog Generator] Running dual-pass managed verification...");',
      '      verificationResult = await verifyBlogPost(parsed.title, finalContent);',
      '      if (verificationResult.passed) {',
      '        verificationStatus = "passed";',
      '        isPublished = true;',
      '        postStatus = "published";',
      '      } else {',
      '        verificationStatus = "human_review";',
      '      }',
      '    } catch (verifyError) {',
      '      console.error("[Blog Generator] Managed verification error:", verifyError);',
      '      verificationStatus = "human_review";',
      '    }',
      '',
      '    return {',
      '      title: parsed.title,',
      '      slug: uniqueSlug,',
      '      excerpt: parsed.excerpt,',
      '      content: finalContent,',
      '      category,',
      '      tags: parsed.tags || [],',
      '      metaTitle: parsed.metaTitle || parsed.title,',
      '      metaDescription: parsed.metaDescription || parsed.excerpt,',
      '      metaKeywords: parsed.metaKeywords || parsed.tags || [],',
      '      featuredImage: buildCoverImageUrl(parsed.title || topic, category),',
      '      readingTime: parsed.readingTime || 8,',
      '      author: "UK Visa Expert Team",',
      '      authorBio: "Our team provides accurate, verified information about the UK Innovator Founder Visa process. Content is checked through the platform managed AI verification policy against official sources.",',
      '      aiVerificationScore: verificationResult?.compositeScore ?? null,',
      '      geminiScore: verificationResult?.geminiScore ?? null,',
      '      openaiScore: verificationResult?.openaiScore ?? null,',
      '      verificationStatus,',
      '      verificationDetails: verificationResult?.details ?? null,',
      '      verifiedAt: verificationResult?.verifiedAt ?? null,',
      '      verificationExpiresAt: verificationResult?.verificationExpiresAt ?? null,',
      '      humanReviewRequired: verificationResult?.requiresHumanReview ?? true,',
      '      contradictionFlags: verificationResult?.contradictionFlags ?? 0,',
      '      sourcesCited: verificationResult?.sourcesCited ?? 0,',
      '      contentHash: verificationResult?.contentHash ?? computeContentHash(finalContent),',
      '      isPublished,',
      '      postStatus,',
      '    };',
      '  } catch (error: any) {',
      '    console.error("[Blog Generator] Managed AI generation failed:", error?.message || error);',
      '    throw new Error("Failed to generate blog content through the managed AI provider: " + (error?.message || "unknown error"));',
      '  }',
    ].join('\n');
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
