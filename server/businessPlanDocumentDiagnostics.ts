import { getSectionsForTier } from "./aiPrompts";
import { sanitizeBusinessPlanOutputText } from "./pdf";
import { htmlFinancialTablesToMarkdown } from "./businessPlanTables";
import type { RenderedPdfInspection } from "./businessPlanPdfInspection";

export interface BusinessPlanDocumentDiagnostics {
  tier: string;
  actualPdfPages: number;
  wordCount: number;
  target: { minPages: number; maxPages: number | null };
  sections: { expected: number; located: number; missing: string[] };
  formattingWarnings: string[];
  reviewAdvisories: string[];
  pdfInspection: RenderedPdfInspection | null;
  releaseGatePassed: boolean;
  manualEvidenceReviewRequired: true;
}

const TARGETS: Record<string, { minPages: number; maxPages: number | null }> = {
  free: { minPages: 10, maxPages: 15 },
  founder: { minPages: 40, maxPages: 55 },
  founder_pro: { minPages: 56, maxPages: null },
  founder_pass_90d: { minPages: 56, maxPages: null },
};

function canonical(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/^\d+(?:\.\d+)*\.\s*/, "")
    .replace(/[^a-z\d]+/gi, " ")
    .trim()
    .toLowerCase();
}

/**
 * Deterministic document release diagnostics. This is not an endorsement
 * assessment, independent verification of citations, or approval guarantee.
 * It must be paired with manual review and independent source validation.
 */
export function assessBusinessPlanDocument(
  tier: string, generatedContent: string, actualPdfPages: number,
  pdfInspection: RenderedPdfInspection | null = null,
): BusinessPlanDocumentDiagnostics {
  const target = TARGETS[tier] || { minPages: 0, maxPages: null };
  const source = sanitizeBusinessPlanOutputText(String(generatedContent || ""));
  const plainText = source.replace(/<[^>]+>/g, " ").replace(/\*\*/g, "").trim();
  const words = plainText.match(/\b[\p{L}\p{N}][\p{L}\p{N}'-]*\b/gu) || [];
  const headings = source.split("\n")
    .filter(line => /^#{1,4}\s+/.test(line))
    .map(canonical);
  const definitions = getSectionsForTier(tier);
  const missing = definitions
    .map(section => section.title)
    .filter(title => !headings.includes(canonical(title)));
  const formattingWarnings: string[] = [];
  const reviewAdvisories: string[] = [];
  if (/<table\b/i.test(source)) {
    // HTML tables are a legitimate generator output and both exporters
    // convert supported tables. Do not fail merely because HTML was used.
    const converted = htmlFinancialTablesToMarkdown(source);
    if (/<table\b/i.test(converted)) {
      formattingWarnings.push("One or more HTML tables could not be structurally converted; inspect both exports.");
    } else {
      reviewAdvisories.push("Converted source HTML tables: manually inspect PDF and Word financial layouts.");
    }
  }
  if (/\b(?:TBD|PLACEHOLDER|LOREM IPSUM)\b/i.test(plainText)) {
    formattingWarnings.push("Document contains possible placeholders requiring human review.");
  }
  if (!Number.isFinite(actualPdfPages) || actualPdfPages < 1) {
    formattingWarnings.push("Actual rendered PDF page count is unavailable.");
  }
  if (target.minPages > 0 && actualPdfPages < target.minPages) {
    formattingWarnings.push("Actual PDF length is below the advertised tier target.");
  }
  if (target.maxPages != null && actualPdfPages > target.maxPages) {
    formattingWarnings.push("Actual PDF length exceeds the advertised tier range.");
  }
  if (missing.length > 0) formattingWarnings.push("One or more required document sections are missing.");
  if (words.length < 250) formattingWarnings.push("Document contains too little substantive text.");
  if (pdfInspection) {
    if (pdfInspection.pageCount !== actualPdfPages) {
      formattingWarnings.push("PDF page count disagrees with independent PDF parser.");
    }
    if (pdfInspection.visibleHtmlTagPages.length) {
      formattingWarnings.push("Rendered PDF contains visible HTML markup.");
    }
    if (pdfInspection.nearEmptyInteriorPages.length) {
      formattingWarnings.push("PDF has nearly empty interior pages: " + pdfInspection.nearEmptyInteriorPages.join(", "));
    }
    if (target.minPages > 0 && pdfInspection.substantivePageCount < target.minPages) {
      formattingWarnings.push("Substantive PDF page count is below the advertised minimum.");
    }
    if (pdfInspection.lowContentFinalPage) {
      reviewAdvisories.push("Final PDF page contains fewer than 30 words; review unnecessary page breaks.");
    }
  } else {
    reviewAdvisories.push("Independent PDF page-content inspection was not supplied.");
  }

  return {
    tier,
    actualPdfPages,
    wordCount: words.length,
    target,
    sections: { expected: definitions.length, located: definitions.length - missing.length, missing },
    formattingWarnings,
    reviewAdvisories,
    pdfInspection,
    releaseGatePassed: formattingWarnings.length === 0,
    manualEvidenceReviewRequired: true,
  };
}
