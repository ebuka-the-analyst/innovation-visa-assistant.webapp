/**
 * Account-bound questionnaire draft eligibility/validation.
 * Personal draft content and the authorised email live in Railway environment
 * variables, NOT in a public repository or the customer-facing JS bundle.
 */
export const OWNER_DRAFT_EMAIL_ENV = "QUESTIONNAIRE_AUTOFILL_OWNER_EMAIL";
export const OWNER_DRAFT_DATA_ENV = "QUESTIONNAIRE_AUTOFILL_DRAFT_JSON";

export function isEligibleQuestionnaireDraftOwner(
  signedInEmail: unknown,
  configuredEmail: unknown,
): boolean {
  if (typeof signedInEmail !== "string" || typeof configuredEmail !== "string") return false;
  const allowed = configuredEmail.trim().toLowerCase();
  return allowed.length > 3 && allowed.includes("@") &&
    signedInEmail.trim().toLowerCase() === allowed;
}

export interface OwnerQuestionnaireDraft {
  fields: Record<string,string>;
  /** Previous server-provided answers, for safe migration of untouched drafts. */
  previousFields: Record<string,string>;
  needsEvidence: string[];
}
export function parseOwnerQuestionnaireDraft(raw: string | undefined): OwnerQuestionnaireDraft {
  if (!raw || raw.length > 100_000) throw new Error("Owner questionnaire draft not configured");
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid owner questionnaire draft");
  }
  const draft = parsed as Record<string,unknown>;
  if (draft.format !== "ifva-owner-autopopulate-v1" ||
      !draft.fields || typeof draft.fields !== "object" || Array.isArray(draft.fields)) {
    throw new Error("Unrecognised owner questionnaire draft format");
  }
  const sanitiseFields = (source: unknown): Record<string,string> => {
    const fields: Record<string,string> = {};
    if (!source || typeof source !== "object" || Array.isArray(source)) return fields;
    for (const [field, answer] of Object.entries(source as Record<string,unknown>)) {
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,79}$/.test(field) ||
          field === "tier" || typeof answer !== "string" || !answer.trim()) continue;
      fields[field] = answer.trim().slice(0,30_000);
    }
    return fields;
  };
  const previousFields = sanitiseFields(draft.fields);
  const fields = { ...previousFields };
  // Founder-voice phrasing is private configuration, never shipped to browsers.
  for (const name of [
    "QUESTIONNAIRE_FOUNDER_VOICE_1",
    "QUESTIONNAIRE_FOUNDER_VOICE_2",
    "QUESTIONNAIRE_FOUNDER_VOICE_3",
    "QUESTIONNAIRE_FOUNDER_VOICE_4",
    "QUESTIONNAIRE_FOUNDER_VOICE_5",
    "QUESTIONNAIRE_FOUNDER_VOICE_6",
  ]) {
    const raw = process.env[name];
    if (!raw) continue;
    if (raw.length > 30_000) throw new Error("Private founder voice block too large");
    const overrides = sanitiseFields(JSON.parse(raw));
    for (const [key, answer] of Object.entries(overrides)) {
      if (key in previousFields) fields[key] = answer;
    }
  }
  if (Object.keys(fields).length === 0) throw new Error("Owner questionnaire draft is empty");
  const needsEvidence = Array.isArray(draft.needsEvidence) ?
    draft.needsEvidence.filter((name): name is string => typeof name === "string" &&
      /^[a-zA-Z][a-zA-Z0-9]{0,79}$/.test(name)).slice(0,60) : [];
  return {fields,previousFields,needsEvidence};
}
