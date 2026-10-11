import { sanitizeBusinessPlanOutputText } from "./pdf";

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

    const content = normalisePdfPlanContent(sanitizeBusinessPlanOutputText(businessPlan.generatedContent || ""));
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

    // Parse and render content - skip duplicate titles
    const lines = content.split("\n");
    let currentY = 220;

    for (const line of lines) {
      const trimmed = line.trim();
      if (shouldSkipPlanArtifactLine(trimmed)) continue;
      if (!trimmed) {
        currentY += 10;
        continue;
      }

      // Skip duplicate numbered section headers and separators
      // Match patterns like "1. EXECUTIVE SUMMARY", "2. FOUNDER CREDENTIALS & VALIDATION"
      if (/^\d+\.\s+[A-Z][A-Z\s&]+$/.test(trimmed)) continue;
      if (
        /^\d+\.\s+[A-Z]{2,}/.test(trimmed) &&
        !trimmed.includes("(") &&
        trimmed.length < 60
      )
        continue;
      if (trimmed === "---") continue;

      // Skip main title (# ) as it's already on cover page
      if (trimmed.startsWith("# ")) {
        continue;
      }

      // Check if we need a new page
      if (currentY > doc.page.height - 80) {
        doc.addPage();
        currentY = 60;
      }

      if (trimmed.startsWith("## ")) {
        // Section heading - blue with underline
        currentY += 15;
        doc.fontSize(16).fillColor("#005EB8").font("Helvetica-Bold");
        doc.text(trimmed.slice(3), 50, currentY);
        currentY += 28;
        // Add underline
        doc
          .moveTo(50, currentY - 8)
          .lineTo(545, currentY - 8)
          .strokeColor("#005EB8")
          .lineWidth(1)
          .stroke();
        currentY += 5;
      } else if (trimmed.startsWith("### ")) {
        // Subsection heading - blue
        currentY += 8;
        doc.fontSize(13).fillColor("#005EB8").font("Helvetica-Bold");
        doc.text(trimmed.slice(4), 50, currentY);
        currentY += 22;
      } else if (trimmed.startsWith("#### ")) {
        // Sub-subsection heading
        doc.fontSize(12).fillColor("#333333").font("Helvetica-Bold");
        doc.text(trimmed.slice(5), 50, currentY);
        currentY += 20;
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        // Bullet point
        doc.fontSize(11).fillColor("#444444").font("Helvetica");
        const bulletText = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, "$1");
        doc.text("•  " + bulletText, 60, currentY, { width: 480 });
        currentY += doc.heightOfString("•  " + bulletText, { width: 480 }) + 6;
      } else if (
        /^\d+\.\s/.test(trimmed) &&
        !/^\d+\.\s+[A-Z]{2,}/.test(trimmed)
      ) {
        // Numbered list item (but not section headers)
        doc.fontSize(11).fillColor("#444444").font("Helvetica");
        const listText = trimmed.replace(/\*\*([^*]+)\*\*/g, "$1");
        doc.text(listText, 60, currentY, { width: 480 });
        currentY += doc.heightOfString(listText, { width: 480 }) + 6;
      } else {
        // Regular paragraph
        doc.fontSize(11).fillColor("#444444").font("Helvetica");
        const cleanText = trimmed.replace(/\*\*([^*]+)\*\*/g, "$1");
        doc.text(cleanText, 50, currentY, { width: 495, align: "justify" });
        currentY += doc.heightOfString(cleanText, { width: 495 }) + 8;
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
