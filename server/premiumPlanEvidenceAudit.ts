/**
 * Deterministic warnings only. This does not confirm that a source is genuine,
 * that a business qualifies for endorsement, or that external facts are true.
 */
export interface EditorialEvidenceAudit {
  blockedMediaMarkup: string[];
  unverifiedSourceMentions: string[];
  repeatedCrossSectionPhrases: Array<{ phrase: string; sectionCount: number }>;
  sectionWordCounts: Array<{ section: string; words: number }>;
}

export function auditPremiumPlanEvidence(content: string): EditorialEvidenceAudit {
  const raw = String(content || "");
  const blockedMediaMarkup: string[] = [];
  if (/<svg\b/i.test(raw)) blockedMediaMarkup.push("Inline SVG appears in source but is not preserved by plain-text PDF export.");
  if (/<(?:iframe|script|canvas)\b/i.test(raw)) blockedMediaMarkup.push("Unsupported embedded HTML media/script markup.");

  const unverifiedSourceMentions: string[] = [];
  // SVG namespace URLs identify the XML format, not a cited research source.
  const researchText = raw.replace(/<svg\\b[\\s\\S]*?<\\/svg>/gi, " ");
  const hasAcademicNames = /(?:\bet\s+al\.|\bjournal of\b|\bpublished in\b|\bpeer.reviewed\b|\b[A-Z][a-z]+\s+and colleagues\b)/i.test(researchText);
  const hasResolvableReferences = /https?:\/\/[^\s<>"]+|\bdoi:\s*10\.\d{4,9}\//i.test(raw);
  if (hasAcademicNames && !hasResolvableReferences) {
    unverifiedSourceMentions.push(
      "Named academic or research references lack a URL/DOI in the source. Check exact authors, titles, dates and applicability independently.",
    );
  }
  if (/\b(?:according to (?:a |the )?(?:report|study|research)|industry reports show|studies show)\b/i.test(raw)) {
    unverifiedSourceMentions.push(
      "Reported research findings require an independently checked publication and precise supporting passage.",
    );
  }

  const heading = /^##\s+\d+\.\s+(.+)$/gm;
  const sections = [...raw.matchAll(heading)];
  const sectionWordCounts: Array<{section:string;words:number}> = [];
  const seenPhrases = new Map<string, Set<number>>();
  sections.forEach((match,index) => {
    const end = index + 1 < sections.length ? sections[index+1].index! : raw.length;
    const section = raw.slice(match.index! + match[0].length, end)
      // Exclude table boilerplate and machine-readable images from n-gram checks.
      .replace(/<table\b[\s\S]*?<\/table>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]*>/g, " ");
    const words = section.match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [];
    sectionWordCounts.push({ section: match[1].trim(), words: words.length });
    const lower = words.map(w=>w.toLowerCase());
    const already = new Set<string>();
    for(let offset=0; offset+13<=lower.length; offset++) {
      const phrase = lower.slice(offset,offset+13).join(" ");
      if (already.has(phrase)) continue;
      already.add(phrase);
      if(!seenPhrases.has(phrase)) seenPhrases.set(phrase,new Set());
      seenPhrases.get(phrase)!.add(index);
    }
  });
  const repeatedCrossSectionPhrases = [...seenPhrases.entries()]
    .filter(([,ids])=>ids.size>=4)
    .sort((a,b)=>b[1].size-a[1].size)
    .slice(0,12)
    .map(([phrase,ids])=>({phrase,sectionCount:ids.size}));
  return { blockedMediaMarkup, unverifiedSourceMentions, repeatedCrossSectionPhrases, sectionWordCounts };
}
