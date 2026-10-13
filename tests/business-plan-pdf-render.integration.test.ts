import assert from "node:assert/strict";
import test from "node:test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { normalisePdfPlanContent, renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";
import { getSectionsForTier } from "../server/aiPrompts";
import { htmlFinancialTablesToMarkdown } from "../server/businessPlanTables";
import { parsePdfTable } from "../server/businessPlanPdfTables";
import { inspectRenderedBusinessPlanPdf } from "../server/businessPlanPdfInspection";
import { readFileSync } from "node:fs";

test("HTML financial tables are converted to legible text instead of raw markup", () => {
  const output = normalisePdfPlanContent(`## FINANCIALS
<table class="financial-table"><thead><tr><th>Metric</th><th>Year 1</th></tr></thead><tbody><tr><td>Revenue</td><td>&pound;50,000</td></tr></tbody></table>`);
  assert.match(output, /Metric\s*\|\s*Year 1/);
  assert.match(output, /Revenue\s*\|\s*£50,000/);
  assert.doesNotMatch(output, /<\/?(?:table|thead|tbody|tr|th|td)/i);
});

test("actual PDF page count agrees with independent PDF parser and contains no leaked HTML tags", async () => {
  const paragraph = "The venture is testing a UK market opportunity. The projections are assumptions, not verified commercial traction. Founder interview evidence will be collected before submission. ";
  const sections = Array.from({ length: 13 }, (_, index) =>
    `## ${index + 1}. BUSINESS PLAN SECTION
` + Array.from({ length: 16 }, () => paragraph.repeat(7)).join("\n\n")
  );
  const { buffer, pageCount } = await renderBusinessPlanPdf({
    businessName: "Test Venture Ltd",
    tier: "enterprise",
    generatedContent: sections.join("\n\n") + "\n\n" +
      `<table><tr><th>Year 1</th><th>Revenue</th></tr><tr><td>2027</td><td>&pound;50,000</td></tr></table>`,
  });
  assert.ok(buffer.byteLength > 4000);
  assert.ok(pageCount >= 5, `Unexpected PDF length: ${pageCount}`);
  const pdf = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  try {
    assert.equal(pdf.numPages, pageCount);
    const page = await pdf.getPage(pdf.numPages);
    const textContent = await page.getTextContent();
    const extracted = textContent.items.map((item: any) => item.str || "").join(" ");
    assert.doesNotMatch(extracted, /<table|<th|<td|&pound;/i);
  } finally {
    await pdf.destroy();
  }
});

test("document diagnostics require real pages and all mandatory sections", () => {
  const content = getSectionsForTier("founder_pro")
    .map(section => `## ${section.title}\n` + "Evidence is not yet verified. ".repeat(35)).join("\n\n");
  const pass = assessBusinessPlanDocument("founder_pro", content, 60);
  assert.equal(pass.actualPdfPages, 60);
  assert.equal(pass.sections.missing.length, 0);
  assert.equal(pass.releaseGatePassed, true);
  assert.equal(pass.manualEvidenceReviewRequired, true);
  const short = assessBusinessPlanDocument("founder_pro", content, 22);
  assert.equal(short.releaseGatePassed, false);
  assert.ok(short.formattingWarnings.some(warning => /below the advertised/i.test(warning)));
  const missing = assessBusinessPlanDocument("founder_pro", content.split("\n\n").slice(0, 1).join(""), 60);
  assert.equal(missing.releaseGatePassed, false);
  assert.ok(missing.sections.missing.length > 0);
});


test("Word export retains financial HTML as structured table rows", () => {
  const source = `## FINANCIAL PROJECTIONS
<table class="financial-table" style="width:100%">
<thead><tr><th>Metric</th><th>Year 1</th><th>Year 2</th></tr></thead>
<tbody>
<tr><td>Revenue</td><td>&pound;50,000</td><td>&pound;100,000</td></tr>
<tr><td>Costs</td><td>&pound;40,000</td><td>&pound;70,000</td></tr>
</tbody></table>
`;
  const prepared = htmlFinancialTablesToMarkdown(source);
  assert.match(prepared, /\| Metric \| Year 1 \| Year 2 \|/);
  assert.match(prepared, /\| --- \| --- \| --- \|/);
  assert.match(prepared, /\| Revenue \| £50,000 \| £100,000 \|/);
  assert.match(prepared, /\| Costs \| £40,000 \| £70,000 \|/);
  assert.doesNotMatch(prepared, /<(?:table|td|tr|th)/i);
  const appRoutes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  assert.match(appRoutes, /parseWordBlocks\(htmlFinancialTablesToMarkdown\(content\)\)/);
});

test("malformed financial tables are never silently turned into invalid Word rows", () => {
  const malformed = "<table><tr><th>Year</th><th>Revenue</th></tr><tr><td>2027</td></tr></table>";
  assert.equal(htmlFinancialTablesToMarkdown(malformed), malformed);
  const escaped = "<table><tr><th>Year</th><th>Revenue</th></tr><tr><td>2027</td><td>£1|2</td></tr></table>";
  const output = htmlFinancialTablesToMarkdown(escaped);
  assert.match(output, /\| 2027 \| £1\/2 \|/);
});


test("valid financial Markdown tables are parsed with consistent columns", () => {
  const rows = ["| Metric | Year 1 | Year 2 |", "| --- | --- | --- |", "| Revenue | £50,000 | £95,000 |", "| Operating cost | £28,000 | £55,000 |", "", "More prose"];
  const table = parsePdfTable(rows, 0);
  assert.equal(table?.consumed, 4);
  assert.equal(table?.rows[1][2], "£95,000");
  assert.equal(table?.rows[2][2], "£55,000");
  assert.equal(parsePdfTable(["| Metric | Sales |", "| metric | not-divider |"], 0), null);
});

test("PDF financial tables paginate and preserve every amount in a real PDF", async () => {
  const cells = Array.from({length: 58}, (_, index) => {
    const n = index + 1;
    return "<tr><td>Category " + n + "</td><td>GBP " + n * 1000 + "</td><td>GBP " + n * 1500 + "</td></tr>";
  }).join("\n");
  const data = '<table class="financial-table"><thead><tr><th>Category</th><th>Year 1</th><th>Year 2</th></tr></thead><tbody>' + cells + '</tbody></table>';
  const { buffer, pageCount } = await renderBusinessPlanPdf({
    businessName: "Financial Table QA",
    tier: "founder_pro",
    generatedContent: "## FINANCIAL PROJECTIONS\n\n" + data,
  });
  assert.ok(pageCount >= 2);
  const pdf = await getDocument({data: new Uint8Array(buffer), useSystemFonts: true}).promise;
  try {
    assert.equal(pdf.numPages, pageCount);
    let allText = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      allText += " " + (await page.getTextContent()).items.map((item: any) => item.str || "").join(" ");
    }
    assert.match(allText, /Category 1/);
    assert.match(allText, /Category 58/);
    assert.match(allText, /GBP 87000/);
    assert.doesNotMatch(allText, /<table|<td|<tr|&pound;/i);
  } finally {
    await pdf.destroy();
  }
});

test("successful HTML-to-table conversion is advisory, not an automatic document failure", () => {
  const sections = getSectionsForTier("founder_pro")
    .map(section => "## " + section.title + "\n" + "Fictional evidence remains unverified. ".repeat(32))
    .join("\n\n");
  const table = '<table><tr><th>Item</th><th>Year 1</th></tr><tr><td>Revenue</td><td>£5,400</td></tr></table>';
  const source = sections + "\n\n" + table;
  const inspection = {
    pageCount: 60,
    pageWordCounts: Array(60).fill(300),
    nearEmptyInteriorPages: [],
    substantivePageCount: 60,
    lowContentFinalPage: false,
    visibleHtmlTagPages: [],
  };
  const result = assessBusinessPlanDocument("founder_pro", source, 60, inspection);
  assert.equal(result.releaseGatePassed, true);
  assert.ok(result.reviewAdvisories.some(w => /converted/i.test(w)));
  assert.equal(result.formattingWarnings.length, 0);

  const malformed = source.replace("<td>£5,400</td>", "");
  const blocked = assessBusinessPlanDocument("founder_pro", malformed, 60, inspection);
  assert.equal(blocked.releaseGatePassed, false);
  assert.ok(blocked.formattingWarnings.some(w => /could not be structurally converted/i.test(w)));
});

test("independent PDF quality checks block inflated length from sparse overflow pages", () => {
  const sections = getSectionsForTier("founder_pro")
    .map(section => "## " + section.title + "\n" + "Fictional review content. ".repeat(32))
    .join("\n\n");
  const density = {
    pageCount: 60,
    pageWordCounts: [320, ...Array(58).fill(290), 16],
    nearEmptyInteriorPages: [4, 7, 18],
    substantivePageCount: 48,
    lowContentFinalPage: true,
    visibleHtmlTagPages: [],
  };
  const report = assessBusinessPlanDocument("founder_pro", sections, 60, density);
  assert.equal(report.releaseGatePassed, false);
  assert.ok(report.formattingWarnings.some(w => /nearly empty interior/i.test(w)));
  assert.ok(report.formattingWarnings.some(w => /substantive PDF page count/i.test(w)));
  assert.ok(report.reviewAdvisories.some(w => /Final PDF page/i.test(w)));
});

test("PDF paragraph pagination leaves no almost-empty interior pages", async () => {
  const paragraph =
    "The fictional UK venture has no established commercial traction, patent rights or verified customer interviews. " +
    "Its proposed innovation must be tested under consented research conditions before endorsement preparation can rely on its results. " +
    "Financial assumptions are illustrative and require independent verification of market demand and operating costs. ";
  const content = Array.from({ length: 8 }, (_, index) =>
    "## " + (index + 1) + ". QUALITY SECTION\n\n" +
    Array.from({ length: 13 }, () => paragraph.repeat(3)).join("\n\n")
  ).join("\n\n");
  const result = await renderBusinessPlanPdf({
    businessName: "Fictional PDF Page Overflow Test",
    generatedContent: content,
    tier: "founder_pro",
  });
  const inspection = await inspectRenderedBusinessPlanPdf(result.buffer);
  assert.ok(inspection.pageCount >= 8);
  assert.equal(inspection.pageCount, result.pageCount);
  assert.deepEqual(inspection.nearEmptyInteriorPages, []);
  assert.deepEqual(inspection.visibleHtmlTagPages, []);
});

test("colspan financial notes remain explanatory, not fabricated annual forecasts", () => {
  const source = '<table><tr><th>Metric</th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr>' +
    '<tr><td>Revenue</td><td>£5,400</td><td>£34,800</td><td>£92,400</td></tr>' +
    '<tr><td>LTV:CAC target, not an annual figure</td><td colspan="3">Target >3:1; not measured</td></tr></table>';
  const prepared = htmlFinancialTablesToMarkdown(source);
  assert.match(prepared, /\| Revenue \| £5,400 \| £34,800 \| £92,400 \|/);
  assert.match(prepared, /LTV:CAC target, not an annual figure: Target >3:1; not measured/);
  assert.doesNotMatch(prepared, /<table|colspan=/i);
  assert.doesNotMatch(prepared, /\| LTV:CAC target[^\n]*Year 1/i);
  const qa = assessBusinessPlanDocument(
    "founder_pro",
    getSectionsForTier("founder_pro").map(section =>
      "## " + section.title + "\n" + "Evidence remains unverified. ".repeat(40)
    ).join("\n\n") + "\n" + source,
    60,
    {
      pageCount: 60, pageWordCounts: Array(60).fill(300),
      nearEmptyInteriorPages: [], substantivePageCount: 60,
      lowContentFinalPage: false, visibleHtmlTagPages: [],
    },
  );
  assert.equal(qa.releaseGatePassed, true);
});


test("six-column financial rows retain the year, units and operating losses in actual PDF", async () => {
  const rows = [
    "| Year | Billable units | Revenue GBP | Variable costs GBP | Fixed costs GBP | Operating loss GBP |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    "| 1 | 450 | 5400 | 1350 | 36000 | -31950 |",
    "| 2 | 2900 | 34800 | 8700 | 61000 | -34900 |",
    "| 3 | 7700 | 92400 | 23100 | 105000 | -35700 |",
  ];
  const parsed = parsePdfTable(rows, 0);
  assert.equal(parsed?.rows[0].length, 6);
  assert.equal(parsed?.rows[3][5], "-35700");
  const rendered = await renderBusinessPlanPdf({
    businessName: "Fictional Six Column Benchmark",
    tier: "founder_pro",
    generatedContent: "## FINANCIAL VIABILITY\n\n" + rows.join("\n") + "\n\nSource assumptions only.",
  });
  const pdf = await getDocument({data:new Uint8Array(rendered.buffer),useSystemFonts:true}).promise;
  try {
    let extracted = "";
    for (let n=1;n<=pdf.numPages;n++) {
      const page=await pdf.getPage(n);
      extracted += " " + (await page.getTextContent()).items.map((i:any)=>i.str||"").join(" ");
    }
    assert.match(extracted,/Billable units/);
    assert.match(extracted,/Operating\s+loss\s+GBP/);
    assert.match(extracted,/-35700/);
    assert.match(extracted,/105000/);
  } finally {
    await pdf.destroy();
  }
});
