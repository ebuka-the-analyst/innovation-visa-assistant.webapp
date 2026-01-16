// pdfTextExtract.ts
// PURE TEXT EXTRACTION ONLY (NO CANVAS, NO IMAGE RENDER)

let pdfjsLib: any | null = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;

  // Legacy build is the safest for Node
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // In Node, disable worker completely
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = "";
  }

  pdfjsLib = pdfjs;
  return pdfjsLib;
}

export async function extractPdfText(fileBuffer: Buffer): Promise<{
  text: string;
  isScannedLikely: boolean;
  pages: number;
  charCount: number;
}> {
  const pdfjs = await loadPdfJs();

  if (!pdfjs?.getDocument) {
    throw new Error("pdfjs-dist getDocument not available");
  }

  const uint8Array = new Uint8Array(fileBuffer);

  const loadingTask = pdfjs.getDocument({
    data: uint8Array,
    disableWorker: true,
    isEvalSupported: false,
    stopAtErrors: true,
    verbosity: 0,
  });

  const pdfDocument = await loadingTask.promise;

  let fullText = "";

  for (let pageNo = 1; pageNo <= pdfDocument.numPages; pageNo++) {
    const page = await pdfDocument.getPage(pageNo);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => (item?.str ? item.str : ""))
      .join(" ");

    fullText += pageText + "\n";
  }

  // Cleanup
  await pdfDocument.cleanup?.();
  await pdfDocument.destroy?.();

  const cleaned = fullText.trim();

  // Detect scanned PDF (image-only)
  const charCount = cleaned.replace(/\s+/g, "").length;

  return {
    text: cleaned,
    isScannedLikely: charCount < 50, // if too small, almost always scanned
    pages: pdfDocument.numPages,
    charCount,
  };
}
