/**
 * Independent inspection of rendered PDFKit bytes with PDF.js.
 * Page counts alone can be misleading if overflow creates nearly empty pages.
 */
export interface RenderedPdfInspection {
  pageCount: number;
  pageWordCounts: number[];
  nearEmptyInteriorPages: number[];
  substantivePageCount: number;
  lowContentFinalPage: boolean;
  visibleHtmlTagPages: number[];
}
export async function inspectRenderedBusinessPlanPdf(buffer: Buffer): Promise<RenderedPdfInspection> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  try {
    const pageWordCounts: number[] = [];
    const visibleHtmlTagPages: number[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const extracted = await page.getTextContent();
      const text = extracted.items.map((item: any) => String(item.str || "")).join(" ");
      const words = text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) || [];
      pageWordCounts.push(words.length);
      if (/<(?:table|tbody|thead|tr|td|th)\b|&pound;/i.test(text)) visibleHtmlTagPages.push(number);
    }
    const nearEmptyInteriorPages = pageWordCounts
      .map((words, i) => ({ words, number: i + 1 }))
      .filter(({ words, number }) => number > 1 && number < pdf.numPages && words < 30)
      .map(({ number }) => number);
    return {
      pageCount: pdf.numPages,
      pageWordCounts,
      nearEmptyInteriorPages,
      substantivePageCount: pageWordCounts.filter(words => words >= 100).length,
      lowContentFinalPage: pageWordCounts.length > 1 && pageWordCounts.at(-1)! < 30,
      visibleHtmlTagPages,
    };
  } finally {
    await pdf.destroy();
  }
}
