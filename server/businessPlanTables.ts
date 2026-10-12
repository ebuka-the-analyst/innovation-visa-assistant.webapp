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
    const notes: Array<{ label: string; value: string }> = [];
    let width: number | null = null;

    for (const match of inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...match[1].matchAll(/<(t[dh])\b([^>]*)>([\s\S]*?)<\/\1>/gi)]
        .map(cell => {
          const colspanRaw = cell[2].match(/\bcolspan\s*=\s*["']?(\d+)/i);
          const colspan = colspanRaw ? Number(colspanRaw[1]) : 1;
          return { value: cellText(cell[3]), colspan };
        });
      if (!cells.length) continue;
      if (cells.some(cell => !Number.isInteger(cell.colspan) || cell.colspan < 1 || cell.colspan > 6)) {
        return whole;
      }
      const totalColumns = cells.reduce((total, cell) => total + cell.colspan, 0);
      if (width == null) width = totalColumns;
      if (totalColumns !== width) return whole;

      if (cells.some(cell => cell.colspan > 1)) {
        // A span such as "LTV:CAC target" across three year columns is
        // explanatory prose, NOT a value specifically for Year 1. Keep it
        // underneath the table instead of inventing repeated annual values.
        if (cells.length === 2 && cells[0].colspan === 1 &&
            cells[1].colspan === width - 1) {
          notes.push({ label: cells[0].value, value: cells[1].value });
        } else {
          // Complex colspan/rowspan grids require a genuine HTML table engine;
          // never silently flatten or misalign the financial information.
          return whole;
        }
      } else {
        rows.push(cells.map(cell => cell.value));
      }
    }

    if (width == null || width < 2 || width > 6 ||
        rows.length < 2 || rows.some(row => row.length !== width)) {
      return whole;
    }
    const encode = (row: string[]) => "| " + row.join(" | ") + " |";
    const markdown = [
      encode(rows[0]),
      encode(Array.from({ length: width }, () => "---")),
      ...rows.slice(1).map(encode),
    ].join("\n");
    const footnotes = notes.map(note => note.label + ": " + note.value).join("\n\n");
    return "\n\n" + markdown + (footnotes ? "\n\n" + footnotes : "") + "\n\n";
  });
}
