// pdfTextExtract.ts
// PURE NODE.JS TEXT EXTRACTION - NO BROWSER DEPENDENCIES

export async function extractPdfText(fileBuffer: Buffer): Promise<{
  text: string;
  isScannedLikely: boolean;
  pages: number;
  charCount: number;
}> {
  console.log("[PDF Extract] Starting extraction with unpdf, buffer size:", fileBuffer.length);
  
  try {
    // Use unpdf - a pure Node.js PDF parser with no browser dependencies
    const { extractText, getDocumentProxy } = await import("unpdf");
    
    // Get document info first
    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    const numPages = pdf.numPages;
    console.log("[PDF Extract] Document loaded, pages:", numPages);
    
    // Extract text from PDF
    const { text: fullText } = await extractText(new Uint8Array(fileBuffer), { 
      mergePages: true 
    });
    
    const cleaned = (fullText || "").trim();
    const charCount = cleaned.replace(/\s+/g, "").length;
    
    console.log("[PDF Extract] Extraction complete, charCount:", charCount);
    
    // Cleanup
    await pdf.cleanup?.();
    
    return {
      text: cleaned,
      isScannedLikely: charCount < 50,
      pages: numPages,
      charCount,
    };
  } catch (unpdfError: any) {
    console.error("[PDF Extract] unpdf failed:", unpdfError?.message);
    
    // Fallback: Try basic binary extraction for very simple PDFs
    try {
      console.log("[PDF Extract] Attempting basic text extraction fallback...");
      const textContent = fileBuffer.toString("utf-8");
      
      // Extract text between stream markers (crude but works for some PDFs)
      const textMatches = textContent.match(/\(([\w\s.,;:!?'-]+)\)/g);
      if (textMatches) {
        const extractedText = textMatches
          .map(m => m.slice(1, -1))
          .filter(t => t.length > 2)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        
        if (extractedText.length > 50) {
          console.log("[PDF Extract] Fallback extraction got chars:", extractedText.length);
          return {
            text: extractedText,
            isScannedLikely: false,
            pages: 1,
            charCount: extractedText.replace(/\s+/g, "").length,
          };
        }
      }
    } catch (fallbackError) {
      console.error("[PDF Extract] Fallback also failed:", fallbackError);
    }
    
    // Return empty result - PDF is likely scanned or encrypted
    return {
      text: "",
      isScannedLikely: true,
      pages: 0,
      charCount: 0,
    };
  }
}
