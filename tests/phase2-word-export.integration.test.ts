import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { htmlFinancialTablesToMarkdown } from "../server/businessPlanTables";
import { buildBusinessPlanWordTable } from "../server/businessPlanWordTableExporter";
import { readFileSync } from "node:fs";

function rowsFromPreparedText(markdown: string): string[][] {
  return markdown.split("\n").filter(line => /^\|.*\|$/.test(line.trim()))
    .filter(line => !/^\|[ :|-]+\|$/.test(line.trim()))
    .map(line => line.trim().slice(1,-1).split("|").map(cell => cell.trim()));
}

test("production Word financial table builder emits correct real DOCX XML", async () => {
  const html = '<table><thead><tr><th>Metric</th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr></thead><tbody>' +
    '<tr><td>Revenue</td><td>£5,400</td><td>£34,800</td><td>£92,400</td></tr>' +
    '<tr><td>Variable costs</td><td>£1,350</td><td>£8,700</td><td>£23,100</td></tr>' +
    '<tr><td>Fixed costs</td><td>£36,000</td><td>£61,000</td><td>£105,000</td></tr>' +
    '<tr><td>Operating result</td><td>-£31,950</td><td>-£34,900</td><td>-£35,700</td></tr>' +
    '<tr><td>LTV:CAC threshold</td><td colspan="3">Target >3:1; not measured</td></tr></tbody></table>';
  const prepared = htmlFinancialTablesToMarkdown(html);
  const rows = rowsFromPreparedText(prepared);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].length, 4);
  assert.match(prepared, /LTV:CAC threshold: Target >3:1; not measured/);

  const doc = new Document({ sections: [{
    children: [
      new Paragraph({text:"Fictional financial model",heading:HeadingLevel.HEADING_1}),
      buildBusinessPlanWordTable(rows),
      new Paragraph({text:"LTV:CAC threshold: Target >3:1; not measured"}),
    ],
  }]});
  const bytes = await Packer.toBuffer(doc);
  assert.ok(bytes.length > 3000);
  const dir = await mkdtemp(join(tmpdir(),"ifva-docx-"));
  try {
    const filename=join(dir,"export.docx");
    await writeFile(filename,bytes);
    const xml = execFileSync("unzip",["-p",filename,"word/document.xml"],{encoding:"utf8"});
    assert.match(xml, /<w:tbl>/);
    assert.match(xml, /£5,400/);
    assert.match(xml, /£34,800/);
    assert.match(xml, /-£35,700/);
    assert.match(xml, /LTV:CAC threshold/);
    assert.match(xml, /Target &gt;3:1/);
    assert.match(xml, /w:tblHeader/);
    assert.doesNotMatch(xml, /colspan=|&lt;table/i);
    const routeSource = readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
    assert.match(routeSource,/buildBusinessPlanWordTable\(rows\)/);
    assert.match(routeSource,/htmlFinancialTablesToMarkdown\(content\)/);
  } finally {
    await rm(dir,{recursive:true,force:true});
  }
});
