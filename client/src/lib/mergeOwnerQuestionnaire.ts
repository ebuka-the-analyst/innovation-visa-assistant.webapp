/**
 * Replaces only unchanged first-generation AutoPopulate answers.
 * If a founder edited any value, their work always takes precedence.
 * Membership tier and unknown form fields never change.
 */
export interface QuestionnaireDraftMerge {
  merged: Record<string, string>;
  added: number;
  refreshed: number;
  skippedExisting: number;
}
export function mergeOwnerQuestionnaireDraft(
  existing: Record<string, string>,
  fields: Record<string, unknown>,
  previousFields: Record<string, unknown>,
  allowedFields: readonly string[],
): QuestionnaireDraftMerge {
  const merged = { ...existing };
  const allowed = new Set(allowedFields);
  let added = 0;
  let refreshed = 0;
  let skippedExisting = 0;
  for (const [field, incoming] of Object.entries(fields)) {
    if (field === "tier" || !allowed.has(field) ||
      typeof incoming !== "string" || !incoming.trim()) continue;
    const current = merged[field]?.trim() || "";
    if (!current) {
      merged[field] = incoming.trim();
      added++;
      continue;
    }
    const legacy = previousFields?.[field];
    if (typeof legacy === "string" && legacy.trim() === current) {
      if (current !== incoming.trim()) {
        merged[field] = incoming.trim();
        refreshed++;
      }
    } else {
      skippedExisting++;
    }
  }
  return { merged, added, refreshed, skippedExisting };
}
