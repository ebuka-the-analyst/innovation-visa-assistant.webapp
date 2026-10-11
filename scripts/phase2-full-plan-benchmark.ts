/**
 * Full-length flagship QA using fictional customer-free founder scenarios.
 * Dry-run is DEFAULT and makes zero network calls. Live mode consumes real API
 * credits only with an explicit cap and staging-secret opt-in.
 *
 * Dry run: node --import tsx scripts/phase2-full-plan-benchmark.ts --case marketplace --tier founder_pro
 * Live: IFVA_ENABLE_FULL_PLAN_BENCHMARK=yes IFVA_STAGING_OPENAI_API_KEY=... \
 *       node --import tsx scripts/phase2-full-plan-benchmark.ts --live \
 *       --case marketplace --tier founder_pro --max-usd 30 --output-dir /tmp/ifva-bench
 */
import OpenAI from "openai";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getSectionsForTier, getSectionSystemPrompt } from "../server/aiPrompts";
import { estimateStandardAstraUsd } from "../server/aiInferencePricing";
import { benchmarkOutputBudget, reserveBenchmarkRequest, assertBenchmarkSpendLimit } from "../server/benchmark/flagshipBudget";
import { QA_FOUNDER_CASES, type QaCaseId, deriveQaFinancials } from "../tests/fixtures/fictional-founder-cases";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";
import { renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { inspectRenderedBusinessPlanPdf } from "../server/businessPlanPdfInspection";

type Tier = "founder" | "founder_pro" | "founder_pass_90d";
type Input = { caseId: QaCaseId; tier: Tier; live: boolean; budgetUsd: number | null; outputDir: string | null };
function option(args: string[], flag: string): string | null {
  const i = args.indexOf(flag);
  return i === -1 ? null : (args[i + 1] || null);
}
function parseInput(args: string[]): Input {
  const caseId = option(args, "--case") || "marketplace";
  const tier = option(args, "--tier") || "founder_pro";
  if (!(caseId in QA_FOUNDER_CASES)) throw new Error("Unknown fictional benchmark case");
  if (!["founder","founder_pro","founder_pass_90d"].includes(tier)) throw new Error("Unsupported benchmark tier");
  const live = args.includes("--live");
  const rawBudget = option(args, "--max-usd");
  const budgetUsd = rawBudget !== null ? Number(rawBudget) : null;
  if (rawBudget != null && (!Number.isFinite(budgetUsd) || budgetUsd! <= 0 || budgetUsd! > 60)) {
    throw new Error("Budget must be between $0.01 and $60 (USD)");
  }
  const outputDir = option(args, "--output-dir");
  if (live && (!outputDir || !rawBudget)) throw new Error("Live runs require --max-usd and --output-dir");
  if (live && process.env.IFVA_ENABLE_FULL_PLAN_BENCHMARK !== "yes") {
    throw new Error("Live mode requires IFVA_ENABLE_FULL_PLAN_BENCHMARK=yes");
  }
  if (live && !String(process.env.IFVA_STAGING_OPENAI_API_KEY || "").trim()) {
    throw new Error("Live mode requires a separately configured IFVA_STAGING_OPENAI_API_KEY");
  }
  return { caseId: caseId as QaCaseId, tier: tier as Tier, live, budgetUsd, outputDir };
}
function buildFactSheet(caseId: QaCaseId): string {
  const item = QA_FOUNDER_CASES[caseId];
  const money = (n: number) => "GBP " + n.toLocaleString("en-GB");
  const years = deriveQaFinancials(item);
  const financialRows = years.map(y =>
    [y.year, y.units, money(y.revenueGbp), money(y.variableCostsGbp),
     money(y.fixedCostsGbp), money(y.operatingSurplusGbp)].join(" | ")
  );
  return [
    "FICTIONAL QUALITY-ASSURANCE CASE. None of these assertions is a verified real-world fact.",
    "Name: " + item.businessName,
    "Sector: " + item.industry,
    "Product: " + item.product,
    "Testable innovation hypothesis: " + item.innovationHypothesis,
    "Founder qualifications / experience (unverified): " + item.founderExperience,
    "Stage and current real-world status: " + item.businessStage,
    "No customers, patents, customer letters, scientific results or market research have been verified.",
    "Evidence gaps:", ...item.evidenceGaps.map(x => "- " + x),
    "Deterministic three-year FINANCIAL ASSUMPTIONS, NOT actual or promised financial performance:",
    "Year | Hypothetical billable units | Revenue | Variable costs | Fixed costs | Operating surplus/loss",
    ...financialRows,
    "All financial figures above derive strictly from assumed units x unit price or cost, " +
      "and operating surplus equals revenue minus variable and fixed expenses.",
    "Do not invent data, businesses, interviews, regulatory approvals, patents, endorsements or references.",
    "Where facts are missing, identify verifiable evidence required and the method to obtain it.",
    "Be critical if the venture is loss-making. Do not present hypothetical targets as traction."
  ].join("\n");
}
export function buildQaSectionPrompt(caseId: QaCaseId, tier: Tier, index: number): string {
  const sections = getSectionsForTier(tier);
  const section = sections[index];
  if (!section) throw new Error("Invalid QA section index");
  return [
    getSectionSystemPrompt(tier, section, index + 1, sections.length),
    "QA FACT SHEET: " + buildFactSheet(caseId),
    "Only generate this one requested section. Source all factual numerical assumptions from the QA fact sheet.",
    "Never manufacture a citation or treat a hypothetical financial projection as an audited account."
  ].join("\n\n");
}
async function main(): Promise<void> {
  const input = parseInput(process.argv.slice(2));
  const sections = getSectionsForTier(input.tier);
  const schedules = sections.map((section, i) => {
    const prompt = buildQaSectionPrompt(input.caseId, input.tier, i);
    const maxOutputTokens = benchmarkOutputBudget(section.maxTokens);
    const reservation = reserveBenchmarkRequest(prompt, maxOutputTokens);
    return { section, prompt, reservation };
  });
  const plannedMaxUsd = Number(schedules.reduce((sum,x)=>sum+x.reservation.reserveUsd,0).toFixed(3));
  const setup = {
    mode: input.live ? "live" : "dry-run",
    fictionalCase: input.caseId,
    tier: input.tier,
    model: "gpt-6-astra",
    sectionCount: sections.length,
    estimatedWorstCaseUsd: plannedMaxUsd,
    requestedLimitUsd: input.budgetUsd,
    billingCaveat: "Conservative token-pricing estimate, NOT an enforced provider billing cap; provider bills may differ"
  };
  if (!input.live) {
    console.log(JSON.stringify({ ...setup, sections: schedules.map(x => ({
      title:x.section.title,
      maxOutputTokens:x.reservation.maxOutputTokens,
      maxCostUsd:x.reservation.reserveUsd
    })) },null,2));
    return;
  }
  const allowed = input.budgetUsd!;
  if (plannedMaxUsd > allowed) {
    throw new Error("STOP: planned worst-case spending " + plannedMaxUsd +
      " USD exceeds authorisation " + allowed + " USD. No API request was made.");
  }
  const openai = new OpenAI({
    apiKey: process.env.IFVA_STAGING_OPENAI_API_KEY!,
    baseURL:"https://api.openai.com/v1",
    maxRetries: 0,
    timeout: 600000
  });
  let reportedUsd = 0;
  const usage: Array<{section:string;status:string;elapsedMs:number;inputTokens:number|null;
    outputTokens:number|null;reasoningTokens:number|null;estimatedUsd:number}> = [];
  const completed: string[] = [];
  const outputDir = resolve(input.outputDir!);
  await mkdir(outputDir,{recursive:true});
  // Separate file per fictional benchmark, never use a real customer's data.
  for (const {section,prompt,reservation} of schedules) {
    assertBenchmarkSpendLimit(reportedUsd, reservation.reserveUsd, allowed);
    const t0=Date.now();
    let reply: any;
    try {
      reply=await openai.responses.create({
        model:"gpt-6-astra",
        input:prompt,
        reasoning:{effort:"high"},
        text:{verbosity:"high"},
        max_output_tokens:reservation.maxOutputTokens,
        store:false
      } as any);
    } catch (error:any) {
      throw new Error("API request failed, stop without retry; status="+String(error?.status||"unknown")+
        ", type="+String(error?.code||error?.name||"unknown").slice(0,45));
    }
    const model=String(reply.model||"");
    const content=String(reply.output_text || "").trim();
    const u=reply.usage||{};
    const pricing=estimateStandardAstraUsd({
      provider:"openai",model,
      inputTokens:typeof u.input_tokens==="number"?u.input_tokens:null,
      cachedInputTokens:u.input_tokens_details?.cached_tokens||0,
      outputTokens:typeof u.output_tokens==="number"?u.output_tokens:null,
      serviceTier:reply.service_tier||"default",
      apiBaseUrl:"https://api.openai.com/v1"
    });
    // If usage unavailable, reserve entire request as a cost estimate.
    const estimatedUsd=pricing.costUsdEstimated ?? reservation.reserveUsd;
    reportedUsd=Number((reportedUsd+estimatedUsd).toFixed(6));
    usage.push({
      section:section.title,status:String(reply.status||"unknown"),
      elapsedMs:Date.now()-t0,inputTokens:u.input_tokens??null,
      outputTokens:u.output_tokens??null,
      reasoningTokens:u.output_tokens_details?.reasoning_tokens??null,
      estimatedUsd
    });
    // Output text and API responses never enter CI logs.
    if (reply.status!=="completed" || model!=="gpt-6-astra" || content.length<150) {
      await writeFile(resolve(outputDir,"usage-partial.json"),JSON.stringify({setup,usage,reportedUsd,stoppedAt:section.title},null,2));
      throw new Error("Model failed to complete a section. Stopped with no automatic retry.");
    }
    completed.push("## "+section.title+"\n\n"+content);
  }
  const fixture=QA_FOUNDER_CASES[input.caseId];
  const generatedContent="# FICTIONAL BUSINESS PLAN: "+fixture.businessName+
    "\n\nQA DOCUMENT - NOT A REAL APPLICATION\n\n"+completed.join("\n\n---\n\n");
  const pdf=await renderBusinessPlanPdf({businessName:fixture.businessName,tier:input.tier,generatedContent});
  const independentPdfInspection=await inspectRenderedBusinessPlanPdf(pdf.buffer);
  const diagnostics=assessBusinessPlanDocument(
    input.tier,generatedContent,pdf.pageCount,independentPdfInspection,
  );
  const prefix=input.caseId+"-"+input.tier;
  await Promise.all([
    writeFile(resolve(outputDir,prefix+".pdf"),pdf.buffer),
    writeFile(resolve(outputDir,prefix+".md"),generatedContent),
    writeFile(resolve(outputDir,prefix+"-report.json"),JSON.stringify({
      setup,usedEstimatedUsd:reportedUsd,usage,
      benchmark:diagnostics,
      expectedFinancials:deriveQaFinancials(fixture),
      warnings:[
        "Fictional scenario; independent original source verification not possible.",
        "No automated arithmetic extraction/cross-section audit has yet been completed.",
        "PDF page length and basic structure do not prove document suitability.",
        "Word rendering remains a separate required staging check."
      ]
    },null,2))
  ]);
  console.log(JSON.stringify({
    finished:true,fictionalCase:input.caseId,tier:input.tier,
    pageCount:pdf.pageCount,sectionCount:sections.length,
    structurePass:diagnostics.releaseGatePassed,
    estimatedUsd:reportedUsd,
    evidenceReviewRequired:true,
    note:"Results saved locally; no document content or API key printed"
  },null,2));
  if(!diagnostics.releaseGatePassed)process.exitCode=1;
}
main().catch((error:any)=>{
  console.error("BENCHMARK STOPPED: "+String(error?.message||"unknown").slice(0,350));
  process.exitCode=1;
});
