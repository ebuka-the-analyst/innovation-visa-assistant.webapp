/**
 * Render financial Markdown tables into actual PDFKit cells. Source HTML
 * financial tables are first converted by businessPlanTables.ts.
 */
export interface ParsedPdfTable {
  rows: string[][];
  consumed: number;
}

function cellsOf(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  const parts = trimmed.slice(1, -1).split("|").map(cell => cell.trim());
  return parts.length >= 2 && parts.length <= 6 ? parts : null;
}

function isDivider(row: string[]): boolean {
  return row.every(cell => /^:?-{3,}:?$/.test(cell));
}

export function parsePdfTable(lines: string[], index: number): ParsedPdfTable | null {
  const header = cellsOf(lines[index] || "");
  if (!header || index + 1 >= lines.length) return null;
  const divider = cellsOf(lines[index + 1] || "");
  if (!divider || divider.length !== header.length || !isDivider(divider)) return null;
  const rows = [header];
  let cursor = index + 2;
  while (cursor < lines.length) {
    const row = cellsOf(lines[cursor]);
    if (!row || row.length !== header.length || isDivider(row)) break;
    rows.push(row);
    cursor++;
  }
  if (rows.length < 2) return null;
  return { rows, consumed: cursor - index };
}

export function renderPdfTable(
  doc: any,
  rows: string[][],
  startY: number,
): number {
  const totalWidth = 495;
  const startX = 50;
  const firstWidth = Math.round(totalWidth * (rows[0].length <= 2 ? 0.47 : rows[0].length >= 6 ? 0.24 : 0.34));
  const remainingWidth = totalWidth - firstWidth;
  const widths = rows[0].map((_, i) =>
    i === 0 ? firstWidth : remainingWidth / (rows[0].length - 1)
  );
  const usableBottom = () => doc.page.height - 65;
  const topMargin = 60;
  let y = startY;

  const drawRow = (row: string[], header: boolean): void => {
    const dense = rows[0].length >= 6;
    const cellPad = dense ? 6 : 8;
    const fontSize = dense ? 8 : header ? 10 : 9;
    const textHeight = row.map((cell, i) => {
      doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize);
      return doc.heightOfString(cell, { width: widths[i] - cellPad * 2 });
    });
    const h = Math.max(dense ? 25 : 27, ...textHeight.map(n => n + cellPad * 2));
    if (h > usableBottom() - topMargin) {
      throw new Error("A financial table cell is too large to render on one page");
    }
    if (y + h > usableBottom()) {
      doc.addPage();
      y = topMargin;
      if (!header) drawRow(rows[0], true);
    }
    let x = startX;
    for (let i = 0; i < row.length; i++) {
      const width = widths[i];
      doc.save();
      doc.rect(x, y, width, h).fill(header ? "#005EB8" : "#FFFFFF");
      doc.rect(x, y, width, h).strokeColor("#CBD5E1").lineWidth(0.6).stroke();
      doc.font(header ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor(header ? "#FFFFFF" : "#172337")
        .text(row[i], x + cellPad, y + cellPad, { width: width - cellPad * 2 });
      doc.restore();
      x += width;
    }
    y += h;
  };

  for (let i = 0; i < rows.length; i++) drawRow(rows[i], i === 0);
  return y + 12;
}
