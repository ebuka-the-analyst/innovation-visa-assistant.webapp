/**
 * Convert source-model HTML tables into Markdown tables consumed by the Word
 * exporter. The generator deliberately permits financial-table HTML; removing
 * the tags without retaining row and cell boundaries destroys the financials.
 *
 * This is an offline text normaliser, not an HTML/browser parser. Malformed
 * tables are left unchanged rather than silently inventing figures.
 */
function decodeTableEntities(value: string): string {
  return value
    .replace(/&pound;|&#163;|&#x00a3;/gi, "£")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;|&#38;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function cellText(value: string): string {
  return decodeTableEntities(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\|/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

export function htmlFinancialTablesToMarkdown(source: string): string {
  return String(source || "").replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (whole, inner) => {
    const rows: string[][] = [];
    for (const row of inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(match => cellText(match[1]));
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length < 2 || rows.some(row => row.length !== rows[0].length)) return whole;
    if (rows[0].length < 2 || rows[0].length > 5) return whole;
    const width = rows[0].length;
    const encode = (row: string[]) => "| " + row.join(" | ") + " |";
    return "\n\n" + [
      encode(rows[0]),
      encode(Array.from({length: width}, () => "---")),
      ...rows.slice(1).map(encode),
    ].join("\n") + "\n\n";
  });
}
