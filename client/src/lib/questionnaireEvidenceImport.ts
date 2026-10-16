/**
 * Import a founder-provided evidence draft into the 11-step questionnaire.
 * No personal content is embedded in the application bundle or repository.
 * Only known questionnaire fields with string values may be imported.
 */
export const EVIDENCE_IMPORT_FORMAT = "ifva-questionnaire-evidence-draft";

export interface EvidenceDraftFile {
  format: string;
  version: number;
  application_email: string;
  fields: Record<string, unknown>;
  review_required?: string[];
}

export function parseQuestionnaireEvidenceDraft(
  raw: string,
  signedInEmail: string,
  allowedFieldNames: readonly string[],
  existing: Readonly<Record<string, string>>,
): {
  merged: Record<string, string>;
  added: number;
  skippedExisting: number;
  reviewRequired: number;
} {
  if (!signedInEmail || !signedInEmail.trim()) {
    throw new Error("Sign in to the account this draft belongs to before importing.");
  }
  if (new TextEncoder().encode(raw).length > 100_000) {
    throw new Error("This draft exceeds the 100 KB limit.");
  }
  let data: EvidenceDraftFile;
  try {
    data = JSON.parse(raw) as EvidenceDraftFile;
  } catch {
    throw new Error("Invalid JSON file. Please select the prepared questionnaire .json file.");
  }
  if (data === null || typeof data !== "object" || Array.isArray(data) ||
      data.format !== EVIDENCE_IMPORT_FORMAT || data.version !== 1 ||
      !data.fields || typeof data.fields !== "object" || Array.isArray(data.fields)) {
    throw new Error("This is not a supported IFVA questionnaire evidence draft.");
  }
  if (typeof data.application_email !== "string" ||
      data.application_email.trim().toLowerCase() !== signedInEmail.trim().toLowerCase()) {
    throw new Error("This draft belongs to a different account. Sign in with the matching email.");
  }

  const allowed = new Set(allowedFieldNames);
  const merged = { ...existing };
  let added = 0;
  let skippedExisting = 0;
  for (const [field, value] of Object.entries(data.fields)) {
    if (field === "tier" || !allowed.has(field) || typeof value !== "string") continue;
    const text = value.trim();
    if (!text) continue;
    if (typeof merged[field] === "string" && merged[field].trim().length > 0) {
      skippedExisting++;
      continue;
    }
    // Protect the browser draft from unexpectedly large fields.
    if (text.length > 15_000) continue;
    merged[field] = text;
    added++;
  }
  return {
    merged, added, skippedExisting,
    reviewRequired: Array.isArray(data.review_required) ? data.review_required.length : 0,
  };
}
