/**
 * TIER-AWARE DOCUMENT EXPORT HOOK
 * 
 * Integrates tier-based content control with document exports
 * Ensures exact page counts for each tier:
 * - FREE: 10-15 pages MAXIMUM (capped to encourage upgrades)
 * - BASIC: 25-35 pages
 * - PREMIUM: 40-60 pages
 * - ENTERPRISE: 50-80 pages
 * - ULTIMATE: 80+ pages
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, PageBreak, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  SubscriptionTier, 
  getTierConfig, 
  getContentExpansionMultiplier,
  getUpgradeMessage 
} from '@/lib/tierContentConfig';
import { generateTierDocument, QuestionnaireData, GeneratedDocument } from '@/lib/tierDocumentGenerator';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Page counting constants
const WORDS_PER_PAGE = 275;
const CHARS_PER_WORD = 5.5;

interface TierExportOptions {
  tier: SubscriptionTier;
  questionnaireData: QuestionnaireData;
  documentTitle: string;
  authorName: string;
  authorEmail: string;
  format: 'pdf' | 'word';
}

interface TierExportResult {
  success: boolean;
  estimatedPages: number;
  actualPages: number;
  tier: SubscriptionTier;
  upgradeMessage?: string;
  error?: string;
}

export function useTierAwareExport() {
  const colors = {
    primary: { hex: '1a1a2e', rgb: { r: 26, g: 26, b: 46 } },
    accent: { hex: 'ffa536', rgb: { r: 255, g: 165, b: 54 } },
    secondary: { hex: '11b6e9', rgb: { r: 17, g: 182, b: 233 } },
    text: { hex: '333333', rgb: { r: 51, g: 51, b: 51 } },
    muted: { hex: '666666', rgb: { r: 102, g: 102, b: 102 } },
    light: { hex: 'F5F5F5', rgb: { r: 245, g: 245, b: 245 } },
    white: { hex: 'FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
    success: { hex: '22c55e', rgb: { r: 34, g: 197, b: 94 } },
    warning: { hex: 'f59e0b', rgb: { r: 245, g: 158, b: 11 } },
    danger: { hex: 'ef4444', rgb: { r: 239, g: 68, b: 68 } },
  };

  /**
   * Calculate word count for content
   */
  const calculateWordCount = (content: string): number => {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  };

  /**
   * Estimate page count from word count
   */
  const estimatePages = (wordCount: number): number => {
    return Math.ceil(wordCount / WORDS_PER_PAGE);
  };

  /**
   * Generate tier-appropriate document content
   */
  const generateTierContent = (data: QuestionnaireData, tier: SubscriptionTier): GeneratedDocument => {
    return generateTierDocument(data, tier);
  };

  /**
   * Export document with tier-based content control
   */
  const exportWithTierControl = async (options: TierExportOptions): Promise<TierExportResult> => {
    const { tier, questionnaireData, documentTitle, authorName, authorEmail, format } = options;
    
    try {
      // Generate tier-appropriate content
      const generatedDoc = generateTierContent(questionnaireData, tier);
      
      if (format === 'word') {
        await generateTierWord(generatedDoc, documentTitle, authorName, authorEmail);
      } else {
        generateTierPdf(generatedDoc, documentTitle, authorName, authorEmail);
      }
      
      return {
        success: true,
        estimatedPages: generatedDoc.estimatedPages,
        actualPages: generatedDoc.estimatedPages,
        tier,
        upgradeMessage: generatedDoc.upgradeMessage,
      };
    } catch (error) {
      return {
        success: false,
        estimatedPages: 0,
        actualPages: 0,
        tier,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  };

  /**
   * Generate tier-controlled Word document
   */
  const generateTierWord = async (
    doc: GeneratedDocument, 
    title: string, 
    authorName: string, 
    authorEmail: string
  ): Promise<void> => {
    const config = getTierConfig(doc.tier);
    const children: (Paragraph | Table)[] = [];

    // Cover page
    children.push(
      new Paragraph({ spacing: { before: 2000 } })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 56,
            color: colors.white.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        shading: {
          type: ShadingType.SOLID,
          color: colors.primary.hex,
          fill: colors.primary.hex,
        },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'UK Innovator Founder Visa Business Plan',
            size: 28,
            color: colors.muted.hex,
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
      })
    );

    // Tier badge
    const tierBadge = doc.tier.charAt(0).toUpperCase() + doc.tier.slice(1);
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${tierBadge} Package | ${doc.estimatedPages} Pages`,
            size: 24,
            color: colors.accent.hex,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );

    // Author info
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Prepared by:',
            size: 24,
            color: colors.muted.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: authorName,
            size: 28,
            bold: true,
            color: colors.primary.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: authorEmail,
            size: 22,
            color: colors.secondary.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            size: 22,
            color: colors.muted.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 2000 },
      })
    );

    // Page break after cover
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // Table of Contents
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'TABLE OF CONTENTS',
            bold: true,
            size: 32,
            color: colors.primary.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    let tocPage = 3;
    doc.sections.forEach((section, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. ${section.title}`,
              size: 24,
              color: colors.text.hex,
            }),
            new TextRun({
              text: ` ... ${tocPage}`,
              size: 22,
              color: colors.muted.hex,
            }),
          ],
          spacing: { after: 150 },
        })
      );
      tocPage += Math.ceil(section.wordCount / WORDS_PER_PAGE);
    });

    if (doc.appendices.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '\nAPPENDICES',
              bold: true,
              size: 24,
              color: colors.primary.hex,
            }),
          ],
          spacing: { before: 400, after: 200 },
        })
      );

      doc.appendices.forEach((appendix, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${String.fromCharCode(65 + idx)}. ${appendix.title}`,
                size: 22,
                color: colors.text.hex,
              }),
              new TextRun({
                text: ` ... ${tocPage}`,
                size: 22,
                color: colors.muted.hex,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
        tocPage += Math.ceil(appendix.wordCount / WORDS_PER_PAGE);
      });
    }

    // Page break after TOC
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // Main sections
    doc.sections.forEach((section, idx) => {
      // Section header
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. ${section.title.toUpperCase()}`,
              bold: true,
              size: 32,
              color: colors.primary.hex,
            }),
          ],
          spacing: { before: 400, after: 300 },
          shading: {
            type: ShadingType.SOLID,
            color: colors.light.hex,
            fill: colors.light.hex,
          },
        })
      );

      // Section content - split by paragraphs
      const paragraphs = section.content.split('\n\n');
      paragraphs.forEach(para => {
        if (para.trim()) {
          // Check if it's a subheading (ALL CAPS or ends with :)
          const isSubheading = para.trim() === para.trim().toUpperCase() || para.trim().endsWith(':');
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: isSubheading ? 24 : 22,
                  bold: isSubheading,
                  color: isSubheading ? colors.primary.hex : colors.text.hex,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
      });

      // Add page break between major sections
      if (idx < doc.sections.length - 1) {
        children.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    });

    // Appendices
    if (doc.appendices.length > 0) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'APPENDICES',
              bold: true,
              size: 36,
              color: colors.primary.hex,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );

      doc.appendices.forEach((appendix, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `APPENDIX ${String.fromCharCode(65 + idx)}: ${appendix.title}`,
                bold: true,
                size: 28,
                color: colors.primary.hex,
              }),
            ],
            spacing: { before: 400, after: 300 },
          })
        );

        const paragraphs = appendix.content.split('\n\n');
        paragraphs.forEach(para => {
          if (para.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 22,
                    color: colors.text.hex,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          }
        });

        if (idx < doc.appendices.length - 1) {
          children.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }
      });
    }

    // Upgrade notice for FREE tier
    if (doc.tier === 'free' && doc.upgradeMessage) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'UPGRADE YOUR BUSINESS PLAN',
              bold: true,
              size: 32,
              color: colors.accent.hex,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'This Free tier preview contains a limited business plan. For a more comprehensive document:',
              size: 24,
              color: colors.text.hex,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      const upgradeOptions = [
        'BASIC (£9): 25-35 pages with financial projections',
        'PREMIUM (£19): 40-60 pages with market research appendices',
        'ENTERPRISE (£29): 50-80 pages with scenario analysis',
        'ULTIMATE (£39): 80+ pages - comprehensive package'
      ];

      upgradeOptions.forEach(option => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${option}`,
                size: 22,
                color: colors.text.hex,
              }),
            ],
            spacing: { after: 150 },
            indent: { left: 400 },
          })
        );
      });

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Upgrade at: innovatorfoundervisaassistant.co.uk/pricing',
              size: 24,
              color: colors.secondary.hex,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        })
      );
    }

    // Legal notice
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '────────────────────────────────────────────────────────',
            color: 'CCCCCC',
            size: 20,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'IMPORTANT LEGAL NOTICE',
            bold: true,
            size: 24,
            color: 'B45309',
          }),
        ],
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.',
            size: 20,
            color: colors.muted.hex,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'For legal advice, consult: (1) OISC-registered adviser, (2) SRA-regulated solicitor, or (3) BSB-regulated barrister.',
            size: 20,
            color: colors.muted.hex,
          }),
        ],
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'UK Innovator Founder Visa Assistant',
            size: 20,
            color: colors.muted.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'innovatorfoundervisaassistant.co.uk',
            size: 20,
            color: colors.secondary.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    // Create document
    const wordDoc = new Document({
      creator: authorName,
      title: title,
      subject: 'UK Innovator Founder Visa Business Plan',
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(wordDoc);
    const filename = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    saveAs(blob, `${filename}-${doc.tier}-${new Date().toISOString().split('T')[0]}.docx`);
  };

  /**
   * Generate tier-controlled PDF document
   */
  const generateTierPdf = (
    doc: GeneratedDocument, 
    title: string, 
    authorName: string, 
    authorEmail: string
  ): void => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;
    let currentY = margin;
    let currentPage = 1;

    const checkPageBreak = (requiredSpace: number): boolean => {
      if (currentY + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        currentPage++;
        currentY = margin;
        addPageNumber();
        return true;
      }
      return false;
    };

    const addPageNumber = () => {
      pdf.setFontSize(10);
      pdf.setTextColor(colors.muted.rgb.r, colors.muted.rgb.g, colors.muted.rgb.b);
      pdf.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    };

    // Cover page
    pdf.setFillColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Gradient bar
    for (let i = 0; i < pageWidth; i++) {
      const ratio = i / pageWidth;
      const r = Math.round(colors.accent.rgb.r * (1 - ratio) + colors.secondary.rgb.r * ratio);
      const g = Math.round(colors.accent.rgb.g * (1 - ratio) + colors.secondary.rgb.g * ratio);
      const b = Math.round(colors.accent.rgb.b * (1 - ratio) + colors.secondary.rgb.b * ratio);
      pdf.setFillColor(r, g, b);
      pdf.rect(i, pageHeight / 2 - 20, 1, 2, 'F');
    }

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(title.toUpperCase(), pageWidth - margin * 2);
    pdf.text(titleLines, pageWidth / 2, pageHeight / 2 - 35, { align: 'center' });

    // Subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'italic');
    pdf.text('UK Innovator Founder Visa Business Plan', pageWidth / 2, pageHeight / 2, { align: 'center' });

    // Tier badge
    const tierBadge = doc.tier.charAt(0).toUpperCase() + doc.tier.slice(1);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.accent.rgb.r, colors.accent.rgb.g, colors.accent.rgb.b);
    pdf.text(`${tierBadge} Package | ${doc.estimatedPages} Pages`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });

    // Author
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Prepared by:', pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(authorName, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.secondary.rgb.r, colors.secondary.rgb.g, colors.secondary.rgb.b);
    pdf.text(authorEmail, pageWidth / 2, pageHeight / 2 + 58, { align: 'center' });

    // Date
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    pdf.text(dateStr, pageWidth / 2, pageHeight / 2 + 75, { align: 'center' });

    // TOC page
    pdf.addPage();
    currentPage++;
    currentY = margin;

    pdf.setTextColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TABLE OF CONTENTS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    let tocPageNum = 3;
    doc.sections.forEach((section, idx) => {
      pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${idx + 1}. ${section.title}`, margin, currentY);
      pdf.text(`${tocPageNum}`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 8;
      tocPageNum += Math.ceil(section.wordCount / WORDS_PER_PAGE);
    });

    if (doc.appendices.length > 0) {
      currentY += 10;
      pdf.setTextColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('APPENDICES', margin, currentY);
      currentY += 8;

      doc.appendices.forEach((appendix, idx) => {
        pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${String.fromCharCode(65 + idx)}. ${appendix.title}`, margin + 10, currentY);
        pdf.text(`${tocPageNum}`, pageWidth - margin, currentY, { align: 'right' });
        currentY += 6;
        tocPageNum += Math.ceil(appendix.wordCount / WORDS_PER_PAGE);
      });
    }

    // Content pages
    doc.sections.forEach((section, sectionIdx) => {
      pdf.addPage();
      currentPage++;
      currentY = margin;
      addPageNumber();

      // Section header
      pdf.setFillColor(colors.light.rgb.r, colors.light.rgb.g, colors.light.rgb.b);
      pdf.rect(margin - 5, currentY - 5, pageWidth - margin * 2 + 10, 12, 'F');
      pdf.setTextColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${sectionIdx + 1}. ${section.title.toUpperCase()}`, margin, currentY + 5);
      currentY += 20;

      // Section content
      pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const paragraphs = section.content.split('\n\n');
      paragraphs.forEach(para => {
        if (para.trim()) {
          const isSubheading = para.trim() === para.trim().toUpperCase() || para.trim().endsWith(':');
          
          if (isSubheading) {
            checkPageBreak(15);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
          }

          const lines = pdf.splitTextToSize(para.trim(), pageWidth - margin * 2);
          const lineHeight = isSubheading ? 6 : 5;
          
          lines.forEach((line: string) => {
            checkPageBreak(lineHeight + 2);
            pdf.text(line, margin, currentY);
            currentY += lineHeight;
          });
          
          currentY += 4;
        }
      });
    });

    // Appendices
    doc.appendices.forEach((appendix, idx) => {
      pdf.addPage();
      currentPage++;
      currentY = margin;
      addPageNumber();

      pdf.setTextColor(colors.primary.rgb.r, colors.primary.rgb.g, colors.primary.rgb.b);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`APPENDIX ${String.fromCharCode(65 + idx)}: ${appendix.title}`, margin, currentY);
      currentY += 15;

      pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const paragraphs = appendix.content.split('\n\n');
      paragraphs.forEach(para => {
        if (para.trim()) {
          const lines = pdf.splitTextToSize(para.trim(), pageWidth - margin * 2);
          lines.forEach((line: string) => {
            checkPageBreak(6);
            pdf.text(line, margin, currentY);
            currentY += 5;
          });
          currentY += 3;
        }
      });
    });

    // Upgrade notice for FREE tier
    if (doc.tier === 'free') {
      pdf.addPage();
      currentPage++;
      currentY = margin;

      pdf.setTextColor(colors.accent.rgb.r, colors.accent.rgb.g, colors.accent.rgb.b);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UPGRADE YOUR BUSINESS PLAN', pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      pdf.setTextColor(colors.text.rgb.r, colors.text.rgb.g, colors.text.rgb.b);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This Free tier preview contains a limited business plan.', pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      pdf.text('For a more comprehensive document:', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      const options = [
        'BASIC (£9): 25-35 pages with financial projections',
        'PREMIUM (£19): 40-60 pages with market research appendices',
        'ENTERPRISE (£29): 50-80 pages with scenario analysis',
        'ULTIMATE (£39): 80+ pages - comprehensive package'
      ];

      options.forEach(opt => {
        pdf.text(`• ${opt}`, margin + 20, currentY);
        currentY += 8;
      });

      currentY += 10;
      pdf.setTextColor(colors.secondary.rgb.r, colors.secondary.rgb.g, colors.secondary.rgb.b);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Upgrade at: innovatorfoundervisaassistant.co.uk/pricing', pageWidth / 2, currentY, { align: 'center' });
    }

    // Legal notice page
    pdf.addPage();
    currentPage++;
    currentY = margin;

    pdf.setTextColor(179, 83, 9);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IMPORTANT LEGAL NOTICE', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    pdf.setTextColor(colors.muted.rgb.r, colors.muted.rgb.g, colors.muted.rgb.b);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const legalText = 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999. For legal advice, consult: (1) OISC-registered adviser, (2) SRA-regulated solicitor, or (3) BSB-regulated barrister.';
    const legalLines = pdf.splitTextToSize(legalText, pageWidth - margin * 2);
    legalLines.forEach((line: string) => {
      pdf.text(line, margin, currentY);
      currentY += 5;
    });

    currentY += 20;
    pdf.setTextColor(colors.muted.rgb.r, colors.muted.rgb.g, colors.muted.rgb.b);
    pdf.text('UK Innovator Founder Visa Assistant', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
    pdf.setTextColor(colors.secondary.rgb.r, colors.secondary.rgb.g, colors.secondary.rgb.b);
    pdf.text('innovatorfoundervisaassistant.co.uk', pageWidth / 2, currentY, { align: 'center' });

    // Save
    const filename = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    pdf.save(`${filename}-${doc.tier}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  /**
   * Get tier page requirements for display
   */
  const getTierPageInfo = (tier: SubscriptionTier) => {
    const config = getTierConfig(tier);
    return {
      tier,
      minPages: config.minPages,
      maxPages: config.maxPages,
      description: getUpgradeMessage(tier) || `${config.minPages}-${config.maxPages} pages`,
    };
  };

  return {
    exportWithTierControl,
    generateTierContent,
    getTierPageInfo,
    calculateWordCount,
    estimatePages,
  };
}
