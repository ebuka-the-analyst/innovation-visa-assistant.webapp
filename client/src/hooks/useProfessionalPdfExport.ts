import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface DocumentPart {
  partLetter: string;
  partTitle: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  number: string;
  title: string;
  content?: string;
  subsections?: DocumentSubsection[];
  table?: {
    headers: string[];
    rows: (string | { text: string; status?: 'pass' | 'warning' | 'fail' })[][];
  };
  list?: string[];
  score?: {
    value: number;
    max: number;
    label: string;
    status?: 'Exceeds' | 'Meets' | 'Below';
  };
}

export interface DocumentSubsection {
  number: string;
  title: string;
  content?: string;
  list?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ProfessionalDocumentOptions {
  mainTitle: string;
  subtitle: string;
  preparedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  parts: DocumentPart[];
  appendices?: {
    letter: string;
    title: string;
    content: string;
  }[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export function useProfessionalPdfExport() {
  const colors = {
    primary: { r: 26, g: 26, b: 46 },
    accent: { r: 255, g: 165, b: 54 },
    secondary: { r: 17, g: 182, b: 233 },
    text: { r: 51, g: 51, b: 51 },
    muted: { r: 102, g: 102, b: 102 },
    light: { r: 245, g: 245, b: 245 },
    white: { r: 255, g: 255, b: 255 },
    success: { r: 34, g: 197, b: 94 },
    warning: { r: 234, g: 179, b: 8 },
    danger: { r: 239, g: 68, b: 68 },
  };

  const generateProfessionalPdf = (options: ProfessionalDocumentOptions): void => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    let currentY = margin;
    let currentPage = 1;
    const tocEntries: { title: string; page: number; level: number }[] = [];

    const setColor = (color: { r: number; g: number; b: number }) => {
      doc.setTextColor(color.r, color.g, color.b);
    };

    const checkPageBreak = (requiredSpace: number): boolean => {
      if (currentY + requiredSpace > pageHeight - 30) {
        doc.addPage();
        currentPage++;
        currentY = margin;
        return true;
      }
      return false;
    };

    const addPageNumber = (pageNum: number) => {
      doc.setFontSize(10);
      setColor(colors.muted);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    };

    const addCoverPage = () => {
      doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      for (let i = 0; i < pageWidth; i++) {
        const ratio = i / pageWidth;
        const r = Math.round(colors.accent.r * (1 - ratio) + colors.secondary.r * ratio);
        const g = Math.round(colors.accent.g * (1 - ratio) + colors.secondary.g * ratio);
        const b = Math.round(colors.accent.b * (1 - ratio) + colors.secondary.b * ratio);
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(3);
        doc.line(i, pageHeight / 3, i + 1, pageHeight / 3);
      }

      setColor(colors.white);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(options.mainTitle.toUpperCase(), pageWidth - 60);
      doc.text(titleLines, pageWidth / 2, pageHeight / 3 - 40, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const subtitleLines = doc.splitTextToSize(options.subtitle, pageWidth - 80);
      doc.text(subtitleLines, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });

      const preparedY = pageHeight / 2 + 40;
      doc.setFontSize(12);
      doc.text('Prepared by:', pageWidth / 2, preparedY, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(options.preparedBy.name, pageWidth / 2, preparedY + 15, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(options.preparedBy.email, pageWidth / 2, preparedY + 28, { align: 'center' });
      
      if (options.preparedBy.phone) {
        doc.text(options.preparedBy.phone, pageWidth / 2, preparedY + 38, { align: 'center' });
      }

      doc.setFontSize(14);
      doc.text(options.date, pageWidth / 2, pageHeight - 50, { align: 'center' });
    };

    const addTableOfContents = () => {
      doc.addPage();
      currentPage++;
      currentY = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      setColor(colors.primary);
      doc.text('TABLE OF CONTENTS', pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      let sectionCounter = 1;
      let estimatedPage = 3;

      options.parts.forEach((part) => {
        checkPageBreak(30);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setColor(colors.primary);
        doc.text(`PART ${part.partLetter}: ${part.partTitle.toUpperCase()}`, margin, currentY);
        currentY += 8;

        part.sections.forEach((section) => {
          checkPageBreak(8);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          setColor(colors.text);
          
          const sectionTitle = `${sectionCounter}. ${section.title}`;
          const pageNumStr = `Page ${estimatedPage}`;
          
          const titleWidth = doc.getTextWidth(sectionTitle);
          const pageWidth2 = doc.getTextWidth(pageNumStr);
          const dotsWidth = pageWidth - margin * 2 - titleWidth - pageWidth2 - 10;
          const dotCount = Math.floor(dotsWidth / 1.5);
          const dots = '.'.repeat(Math.max(0, dotCount));
          
          doc.text(sectionTitle, margin, currentY);
          doc.text(dots, margin + titleWidth + 3, currentY);
          doc.text(pageNumStr, pageWidth - margin, currentY, { align: 'right' });
          
          tocEntries.push({ title: sectionTitle, page: estimatedPage, level: 1 });
          
          currentY += 6;
          sectionCounter++;
          estimatedPage += 2;
        });
        
        currentY += 5;
      });

      if (options.appendices && options.appendices.length > 0) {
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setColor(colors.primary);
        doc.text('APPENDICES', margin, currentY);
        currentY += 8;

        options.appendices.forEach((appendix) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          setColor(colors.text);
          doc.text(`${appendix.letter}. ${appendix.title}`, margin + 5, currentY);
          currentY += 6;
        });
      }
    };

    const addPartHeader = (part: DocumentPart) => {
      doc.addPage();
      currentPage++;
      
      doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      const centerY = pageHeight / 2 - 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      setColor(colors.muted);
      doc.text(`PART ${part.partLetter}`, pageWidth / 2, centerY - 15, { align: 'center' });
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      setColor(colors.primary);
      doc.text(part.partTitle.toUpperCase(), pageWidth / 2, centerY + 10, { align: 'center' });

      for (let i = 0; i < 60; i++) {
        const ratio = i / 60;
        const r = Math.round(colors.accent.r * (1 - ratio) + colors.secondary.r * ratio);
        const g = Math.round(colors.accent.g * (1 - ratio) + colors.secondary.g * ratio);
        const b = Math.round(colors.accent.b * (1 - ratio) + colors.secondary.b * ratio);
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(2);
        doc.line(pageWidth / 2 - 30 + i, centerY + 25, pageWidth / 2 - 30 + i + 1, centerY + 25);
      }
    };

    const addSection = (section: DocumentSection, sectionNum: number) => {
      doc.addPage();
      currentPage++;
      currentY = margin;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      setColor(colors.primary);
      doc.text(`${sectionNum}. ${section.title.toUpperCase()}`, margin, currentY);
      currentY += 15;

      if (section.content) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        setColor(colors.text);
        const contentLines = doc.splitTextToSize(section.content, pageWidth - margin * 2);
        contentLines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, margin, currentY);
          currentY += 6;
        });
        currentY += 5;
      }

      if (section.subsections) {
        section.subsections.forEach((sub) => {
          checkPageBreak(20);
          
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          setColor(colors.primary);
          doc.text(`${sub.number} ${sub.title}`, margin, currentY);
          currentY += 10;

          if (sub.content) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            setColor(colors.text);
            const subContentLines = doc.splitTextToSize(sub.content, pageWidth - margin * 2);
            subContentLines.forEach((line: string) => {
              checkPageBreak(6);
              doc.text(line, margin, currentY);
              currentY += 6;
            });
            currentY += 5;
          }

          if (sub.list) {
            sub.list.forEach((item) => {
              checkPageBreak(8);
              doc.setFontSize(11);
              doc.setFont('helvetica', 'normal');
              setColor(colors.text);
              const bulletLines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 10);
              bulletLines.forEach((line: string, idx: number) => {
                doc.text(line, margin + (idx === 0 ? 5 : 10), currentY);
                currentY += 5;
              });
            });
            currentY += 3;
          }

          if (sub.table) {
            checkPageBreak(30);
            doc.autoTable({
              startY: currentY,
              head: [sub.table.headers],
              body: sub.table.rows,
              margin: { left: margin, right: margin },
              styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: [colors.text.r, colors.text.g, colors.text.b],
              },
              headStyles: {
                fillColor: [colors.primary.r, colors.primary.g, colors.primary.b],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [colors.light.r, colors.light.g, colors.light.b],
              },
              theme: 'striped',
            });
            currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : currentY + 30;
          }
        });
      }

      if (section.table) {
        checkPageBreak(30);
        
        const processedRows = section.table.rows.map(row => 
          row.map(cell => {
            if (typeof cell === 'object' && cell.status) {
              const symbol = cell.status === 'pass' ? '[PASS]' : cell.status === 'warning' ? '[WARN]' : '[FAIL]';
              return `${symbol} ${cell.text}`;
            }
            return cell as string;
          })
        );

        doc.autoTable({
          startY: currentY,
          head: [section.table.headers],
          body: processedRows,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: [colors.text.r, colors.text.g, colors.text.b],
          },
          headStyles: {
            fillColor: [colors.primary.r, colors.primary.g, colors.primary.b],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [colors.light.r, colors.light.g, colors.light.b],
          },
          columnStyles: {
            0: { fontStyle: 'bold' },
          },
          didParseCell: (data: any) => {
            const cellText = data.cell.raw as string;
            if (cellText && typeof cellText === 'string') {
              if (cellText.startsWith('[PASS]') || cellText.includes('Exceeds') || cellText.includes('Meets')) {
                data.cell.styles.textColor = [colors.success.r, colors.success.g, colors.success.b];
              } else if (cellText.startsWith('[WARN]') || cellText.includes('Warning')) {
                data.cell.styles.textColor = [colors.warning.r, colors.warning.g, colors.warning.b];
              } else if (cellText.startsWith('[FAIL]') || cellText.includes('Below')) {
                data.cell.styles.textColor = [colors.danger.r, colors.danger.g, colors.danger.b];
              }
            }
          },
          theme: 'striped',
        });
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : currentY + 30;
      }

      if (section.list) {
        section.list.forEach((item) => {
          checkPageBreak(8);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          setColor(colors.text);
          const bulletLines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 10);
          bulletLines.forEach((line: string, idx: number) => {
            doc.text(line, margin + (idx === 0 ? 5 : 10), currentY);
            currentY += 5;
          });
        });
        currentY += 5;
      }

      if (section.score) {
        checkPageBreak(40);
        
        const scoreBoxWidth = 100;
        const scoreBoxX = margin;
        
        doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
        doc.roundedRect(scoreBoxX, currentY, scoreBoxWidth, 25, 3, 3, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        setColor(colors.muted);
        doc.text(section.score.label, scoreBoxX + 5, currentY + 10);
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const scoreColor = section.score.value >= 80 ? colors.success : 
                          section.score.value >= 60 ? colors.warning : colors.danger;
        setColor(scoreColor);
        doc.text(`${section.score.value}/${section.score.max}`, scoreBoxX + 5, currentY + 20);
        
        if (section.score.status) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(section.score.status, scoreBoxX + 50, currentY + 20);
        }
        
        currentY += 35;
      }
    };

    const addFooter = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setFontSize(8);
        setColor(colors.muted);
        doc.setFont('helvetica', 'normal');
        doc.text('UK Innovator Founder Visa Assistant - Confidential', margin, pageHeight - 10);
        doc.text(`Page ${i - 1}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
    };

    const addLegalDisclaimer = () => {
      doc.addPage();
      currentY = margin;
      
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('IMPORTANT LEGAL NOTICE', margin, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setColor(colors.muted);
      
      const disclaimer1 = 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.';
      const lines1 = doc.splitTextToSize(disclaimer1, pageWidth - margin * 2);
      doc.text(lines1, margin, currentY);
      currentY += lines1.length * 5 + 8;
      
      const disclaimer2 = 'For legal advice specific to your situation, please consult:';
      doc.text(disclaimer2, margin, currentY);
      currentY += 8;
      
      const advisors = [
        '(1) An OISC-registered immigration adviser (Level 1 or higher)',
        '(2) A solicitor regulated by the Solicitors Regulation Authority (SRA)',
        '(3) A barrister regulated by the Bar Standards Board (BSB)'
      ];
      
      advisors.forEach((advisor) => {
        doc.text(`   ${advisor}`, margin, currentY);
        currentY += 6;
      });
    };

    addCoverPage();
    addTableOfContents();

    let sectionCounter = 1;
    options.parts.forEach((part) => {
      addPartHeader(part);
      
      part.sections.forEach((section) => {
        addSection(section, sectionCounter);
        sectionCounter++;
      });
    });

    addLegalDisclaimer();
    addFooter();

    if (options.metadata) {
      doc.setProperties({
        title: options.mainTitle,
        subject: options.metadata.subject || 'UK Innovator Founder Visa Application',
        author: options.metadata.author || options.preparedBy.name,
        keywords: options.metadata.keywords?.join(', ') || 'visa, innovation, UK, business',
        creator: 'UK Innovator Founder Visa Assistant',
      });
    }

    const filename = options.mainTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSimpleProfessionalPdf = (
    title: string,
    subtitle: string,
    content: { heading: string; text: string; list?: string[] }[],
    authorName: string,
    authorEmail: string
  ) => {
    const parts: DocumentPart[] = [{
      partLetter: 'A',
      partTitle: 'Document Content',
      sections: content.map((item, idx) => ({
        number: `${idx + 1}`,
        title: item.heading,
        content: item.text,
        list: item.list,
      })),
    }];

    generateProfessionalPdf({
      mainTitle: title,
      subtitle: subtitle,
      preparedBy: {
        name: authorName,
        email: authorEmail,
      },
      date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      parts,
    });
  };

  return {
    generateProfessionalPdf,
    generateSimpleProfessionalPdf,
  };
}
