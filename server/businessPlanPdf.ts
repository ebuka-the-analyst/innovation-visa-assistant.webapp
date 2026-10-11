import { sanitizeBusinessPlanOutputText } from "./pdf";
import { htmlFinancialTablesToMarkdown } from "./businessPlanTables";
import { parsePdfTable, renderPdfTable } from "./businessPlanPdfTables";

function shouldSkipPlanArtifactLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^`{1,3}\s*(?:text|plaintext|markdown|md)?\s*$/i.test(trimmed)) return true;
  return /[┌┐└┘─│▼▲►◄]|-->|<--|=>|^\s*[|+\\\\/_-]{2,}/.test(trimmed);
}

/**
 * Business-plan prompts can emit HTML financial tables. The PDF renderer must
 * never print visible HTML tags. Convert them to readable rows until a full
 * structured table renderer is independently tested and adopted.
 */
export function normalisePdfPlanContent(value: string): string {
  return value
    .replace(/<\/t(?:h|d)>[ \t]*<t(?:h|d)[^>]*>/gi, " | ")
    .replace(/<tr\b[^>]*>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&pound;/gi, "£")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n");
}

export async function renderBusinessPlanPdf(businessPlan: any): Promise<{buffer: Buffer; pageCount: number}> {
    const PDFDocument = (await import("pdfkit")).default;

    const doc = new PDFDocument({
      size: "A4",
      bufferPages: true,
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: `${businessPlan.businessName} - Business Plan`,
        Author: "UK Innovator Founder Visa Assistant",
        Subject: "Business Plan for UK Innovator Founder Visa",
      },
    });

    const chunks: Buffer[] = [];
    const output = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const content = normalisePdfPlanContent(htmlFinancialTablesToMarkdown(sanitizeBusinessPlanOutputText(businessPlan.generatedContent || "")));
    const tierName =
      (businessPlan.tier || "free").charAt(0).toUpperCase() +
      (businessPlan.tier || "free").slice(1);

    // Cover page
    doc.rect(0, 0, doc.page.width, 200).fill("#005EB8");
    doc
      .fontSize(28)
      .fillColor("#FFFFFF")
      .text(businessPlan.businessName, 50, 80, { align: "center" });
    doc.fontSize(14).text("UK Innovator Founder Visa Business Plan", 50, 120, {
      align: "center",
    });
    doc
      .fontSize(12)
      .text(
        `${tierName} Plan | Generated ${new Date().toLocaleDateString("en-GB")}`,
        50,
        145,
        { align: "center" },
      );

    doc.moveDown(8);
    doc.fillColor("#000000");

    // Always derive the next position from PDFKit's actual doc.y.
    // Manually adding a precomputed paragraph height after PDFKit has already
    // auto-paginated can create nearly blank pages and inflate paid page counts.
    const lines = content.split("\n");
    let currentY = 220;
    const topMargin = 60;
    const bottomMargin = 65;
    const usablePageBody = doc.page.height - topMargin - bottomMargin;
    const ensureRoom = (height: number): void => {
      if (height <= usablePageBody && currentY + height > doc.page.height - bottomMargin) {
        doc.addPage();
        currentY = topMargin;
      }
    };
    const writeText = (
      value: string, x: number, width: number,
      fontSize: number, color: string, font: string,
      after: number, options: Record<string, unknown> = {},
    ): void => {
      doc.font(font).fontSize(fontSize).fillColor(color);
      const height = doc.heightOfString(value, { width, ...options });
      ensureRoom(height + after);
      doc.text(value, x, currentY, { width, ...options });
      // The accurate position includes any automatic page breaks.
      currentY = doc.y + after;
    };

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const table = parsePdfTable(lines, lineIndex);
      if (table) {
        ensureRoom(65);
        currentY = renderPdfTable(doc, table.rows, currentY);
        lineIndex += table.consumed - 1;
        continue;
      }
      const trimmed = line.trim();
      if (shouldSkipPlanArtifactLine(trimmed)) continue;
      if (!trimmed) {
        currentY += 10;
        continue;
      }
      if (/^\d+\.\s+[A-Z][A-Z\s&]+$/.test(trimmed)) continue;
      if (/^\d+\.\s+[A-Z]{2,}/.test(trimmed) && !trimmed.includes("(") && trimmed.length < 60) continue;
      if (trimmed === "---" || trimmed.startsWith("# ")) continue;

      if (trimmed.startsWith("## ")) {
        const value = trimmed.slice(3);
        doc.font("Helvetica-Bold").fontSize(16);
        const headingHeight = doc.heightOfString(value, { width: 495 });
        // Keep the heading, underline and the start of the next paragraph together.
        ensureRoom(headingHeight + 75);
        currentY += 15;
        writeText(value, 50, 495, 16, "#005EB8", "Helvetica-Bold", 8);
        doc.moveTo(50, currentY)
          .lineTo(545, currentY)
          .strokeColor("#005EB8").lineWidth(1).stroke();
        currentY += 14;
      } else if (trimmed.startsWith("### ")) {
        const value = trimmed.slice(4);
        doc.font("Helvetica-Bold").fontSize(13);
        const headingHeight = doc.heightOfString(value, { width: 495 });
        ensureRoom(headingHeight + 55);
        currentY += 8;
        writeText(value, 50, 495, 13, "#005EB8", "Helvetica-Bold", 13);
      } else if (trimmed.startsWith("#### ")) {
        writeText(trimmed.slice(5), 50, 495, 12, "#333333", "Helvetica-Bold", 10);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const value = "•  " + trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, "$1");
        writeText(value, 60, 480, 11, "#444444", "Helvetica", 6);
      } else if (/^\d+\.\s/.test(trimmed) && !/^\d+\.\s+[A-Z]{2,}/.test(trimmed)) {
        const value = trimmed.replace(/\*\*([^*]+)\*\*/g, "$1");
        writeText(value, 60, 480, 11, "#444444", "Helvetica", 6);
      } else {
        const value = trimmed.replace(/\*\*([^*]+)\*\*/g, "$1");
        writeText(value, 50, 495, 11, "#444444", "Helvetica", 8, { align: "justify" });
      }
    }

    // Count PDFKit-rendered pages; advertised page ranges are NOT inferred from prompt text.
    const pageCount = doc.bufferedPageRange().count;
    doc.end();
    return { buffer: await output, pageCount };
  }



export async function generatePDFWithPDFKit(
  businessPlan: any,
  disposition: "attachment" | "inline",
  res: any,
): Promise<void> {
  const { buffer, pageCount } = await renderBusinessPlanPdf(businessPlan);
  const sanitizedName = String(businessPlan.businessName || "business-plan")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_");
  const filename = (sanitizedName || "business-plan") + "-business-plan.pdf";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", disposition + '; filename="' + filename + '"');
  res.setHeader("X-Business-Plan-Pages", String(pageCount));
  res.send(buffer);
}
