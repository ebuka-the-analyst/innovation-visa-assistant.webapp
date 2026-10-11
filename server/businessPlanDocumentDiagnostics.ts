import { getSectionsForTier } from "./aiPrompts";
import { sanitizeBusinessPlanOutputText } from "./pdf";

export interface BusinessPlanDocumentDiagnostics {
  tier: string;
  actualPdfPages: number;
  wordCount: number;
  target: { minPages: number; maxPages: number | null };
  sections: { expected: number; located: number; missing: string[] };
  formattingWarnings: string[];
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
  if (/<\/?(?:table|tbody|thead|tr|td|th)\b/i.test(source)) {
    formattingWarnings.push("Source contains HTML tables; verify their appearance in both PDF and Word exports.");
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

  return {
    tier,
    actualPdfPages,
    wordCount: words.length,
    target,
    sections: { expected: definitions.length, located: definitions.length - missing.length, missing },
    formattingWarnings,
    releaseGatePassed: formattingWarnings.length === 0,
    manualEvidenceReviewRequired: true,
  };
}
