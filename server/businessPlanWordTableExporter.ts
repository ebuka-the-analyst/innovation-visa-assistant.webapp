import {
  Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, WidthType,
} from "docx";

function plain(value: string): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ").trim();
}

/**
 * Shared production Word financial-table builder. The same function is
 * exercised by an actual DOCX OOXML integration test, not a mocked parser.
 */
export function buildBusinessPlanWordTable(rows: string[][]): Table {
  if (rows.length < 2 || rows.length > 150) throw new Error("Invalid Word table row count");
  const width = rows[0]?.length || 0;
  if (width < 2 || width > 5 || rows.some(row => row.length !== width)) {
    throw new Error("Malformed Word table dimensions");
  }
  const columnWidth = Math.floor(9000 / width);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIndex) =>
      new TableRow({
        tableHeader: rowIndex === 0,
        children: row.map(cell =>
          new TableCell({
            width: { size: columnWidth, type: WidthType.DXA },
            shading: rowIndex === 0
              ? { type: ShadingType.CLEAR, fill: "005EB8", color: "auto" }
              : undefined,
            children: [new Paragraph({
              children: [new TextRun({
                text: plain(cell), size: rowIndex === 0 ? 20 : 19,
                bold: rowIndex === 0, color: rowIndex === 0 ? "FFFFFF" : "111827",
              })],
              spacing: { before: 80, after: 80 },
            })],
          })
        ),
      })
    ),
  });
}
