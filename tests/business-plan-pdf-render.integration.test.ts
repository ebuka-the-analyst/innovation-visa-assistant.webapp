import assert from "node:assert/strict";
import test from "node:test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { normalisePdfPlanContent, renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";
import { getSectionsForTier } from "../server/aiPrompts";

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
