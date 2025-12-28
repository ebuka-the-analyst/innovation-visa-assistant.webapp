import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  sections: ExportSection[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

interface ExportSection {
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'score' | 'divider';
  content?: string;
  level?: 1 | 2 | 3;
  items?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  score?: {
    value: number;
    max: number;
    label: string;
  };
}

export function usePdfExport() {
  const brandColors = {
    primary: '#005EB8',
    secondary: '#41B6E6',
    dark: '#1a1a2e',
    text: '#333333',
    muted: '#666666',
    light: '#f5f5f5',
  };

  const generatePdf = (options: ExportOptions): void => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    const addHeader = () => {
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, pageWidth, 45, 'F');

      const gradientWidth = pageWidth;
      for (let i = 0; i < gradientWidth; i++) {
        const ratio = i / gradientWidth;
        const r = Math.round(255 * (1 - ratio) + 17 * ratio);
        const g = Math.round(165 * (1 - ratio) + 182 * ratio);
        const b = Math.round(54 * (1 - ratio) + 233 * ratio);
        doc.setDrawColor(r, g, b);
        doc.line(i, 42, i + 1, 42);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('UK Innovator Founder Visa Assistant', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("UK's #1 Visa AI Assistant", pageWidth / 2, 26, { align: 'center' });

      currentY = 55;
    };

    const addTitle = () => {
      doc.setTextColor(26, 26, 46);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, margin, currentY);
      currentY += 10;

      if (options.subtitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text(options.subtitle, margin, currentY);
        currentY += 8;
      }

      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, currentY);
      currentY += 15;
    };

    const checkPageBreak = (requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    const addSection = (section: ExportSection) => {
      switch (section.type) {
        case 'heading':
          checkPageBreak(15);
          const fontSize = section.level === 1 ? 16 : section.level === 2 ? 14 : 12;
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 26, 46);
          doc.text(section.content || '', margin, currentY);
          currentY += fontSize / 2 + 5;
          break;

        case 'paragraph':
          const lines = doc.splitTextToSize(section.content || '', pageWidth - margin * 2);
          checkPageBreak(lines.length * 5 + 5);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 51, 51);
          doc.text(lines, margin, currentY);
          currentY += lines.length * 5 + 5;
          break;

        case 'list':
          if (section.items) {
            checkPageBreak(section.items.length * 7 + 5);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 51, 51);
            section.items.forEach((item, index) => {
              const bulletLines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 5);
              checkPageBreak(bulletLines.length * 5);
              doc.text(bulletLines, margin + 5, currentY);
              currentY += bulletLines.length * 5 + 2;
            });
            currentY += 3;
          }
          break;

        case 'table':
          if (section.tableData && section.tableData.rows.length > 0) {
            checkPageBreak(30);
            doc.autoTable({
              startY: currentY,
              head: [section.tableData.headers],
              body: section.tableData.rows,
              margin: { left: margin, right: margin },
              styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: [51, 51, 51],
              },
              headStyles: {
                fillColor: [26, 26, 46],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [245, 245, 245],
              },
              theme: 'striped',
            });
            if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
              currentY = doc.lastAutoTable.finalY + 10;
            } else {
              currentY += 30;
            }
          }
          break;

        case 'score':
          if (section.score) {
            checkPageBreak(30);
            const scoreWidth = 60;
            const scoreHeight = 20;
            const scoreX = margin;
            
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(scoreX, currentY, scoreWidth, scoreHeight, 3, 3, 'F');
            
            const fillWidth = (section.score.value / section.score.max) * (scoreWidth - 4);
            const scoreColor = section.score.value >= 70 ? [34, 197, 94] : 
                              section.score.value >= 40 ? [234, 179, 8] : [239, 68, 68];
            doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
            doc.roundedRect(scoreX + 2, currentY + 2, fillWidth, scoreHeight - 4, 2, 2, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 26, 46);
            doc.text(`${section.score.value}%`, scoreX + scoreWidth + 5, currentY + 13);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(102, 102, 102);
            doc.text(section.score.label, scoreX + scoreWidth + 25, currentY + 13);
            
            currentY += scoreHeight + 10;
          }
          break;

        case 'divider':
          checkPageBreak(10);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, currentY, pageWidth - margin, currentY);
          currentY += 10;
          break;
      }
    };

    const addFooter = () => {
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('UK Innovator Founder Visa Assistant - Confidential', margin, footerY);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });
    };

    addHeader();
    addTitle();

    options.sections.forEach(section => {
      addSection(section);
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
    }

    checkPageBreak(50);
    currentY += 10;
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('IMPORTANT LEGAL NOTICE', margin, currentY);
    currentY += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const disclaimerText = 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
    doc.text(disclaimerLines, margin, currentY);
    currentY += disclaimerLines.length * 4 + 4;
    
    const adviceText = 'For legal advice specific to your situation, please consult: (1) An OISC-registered immigration adviser (Level 1 or higher), (2) A solicitor regulated by the SRA, or (3) A barrister regulated by the BSB.';
    const adviceLines = doc.splitTextToSize(adviceText, pageWidth - 2 * margin);
    doc.text(adviceLines, margin, currentY);

    if (options.metadata) {
      doc.setProperties({
        title: options.title,
        subject: options.metadata.subject || 'UK Innovator Founder Visa Application',
        author: options.metadata.author || 'UK Innovator Founder Visa Assistant',
        keywords: options.metadata.keywords?.join(', ') || 'visa, innovation, UK, business',
        creator: 'UK Innovator Founder Visa Assistant',
      });
    }

    doc.save(`${options.filename}.pdf`);
  };

  const exportBusinessPlan = (planData: any) => {
    generatePdf({
      title: 'Business Plan Report',
      subtitle: planData.businessName || 'Innovation Business Plan',
      filename: `business-plan-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Executive Summary', level: 1 },
        { type: 'paragraph', content: planData.executiveSummary || planData.businessDescription || 'No executive summary provided.' },
        { type: 'divider' },
        
        { type: 'heading', content: 'Business Overview', level: 1 },
        { type: 'table', tableData: {
          headers: ['Field', 'Details'],
          rows: [
            ['Business Name', planData.businessName || 'N/A'],
            ['Industry', planData.industry || 'N/A'],
            ['Target Market', planData.targetMarket || 'N/A'],
            ['Business Stage', planData.businessStage || 'N/A'],
          ]
        }},
        { type: 'divider' },
        
        { type: 'heading', content: 'Innovation & Scalability', level: 1 },
        { type: 'paragraph', content: planData.innovationDescription || 'Innovation details not provided.' },
        { type: 'heading', content: 'Scalability Plan', level: 2 },
        { type: 'paragraph', content: planData.scalabilityPlan || 'Scalability plan not provided.' },
        { type: 'divider' },
        
        { type: 'heading', content: 'Financial Projections', level: 1 },
        { type: 'paragraph', content: planData.financialProjections || 'Financial projections not provided.' },
        { type: 'heading', content: 'Funding Sources', level: 2 },
        { type: 'paragraph', content: planData.fundingSources || 'Funding sources not provided.' },
        { type: 'divider' },
        
        { type: 'heading', content: 'Team & Experience', level: 1 },
        { type: 'paragraph', content: planData.teamExperience || 'Team experience not provided.' },
        { type: 'divider' },
        
        { type: 'heading', content: 'Market Analysis', level: 1 },
        { type: 'paragraph', content: planData.marketResearch || 'Market research not provided.' },
        { type: 'heading', content: 'Competitor Analysis', level: 2 },
        { type: 'paragraph', content: planData.competitorAnalysis || 'Competitor analysis not provided.' },
      ],
      metadata: {
        subject: 'UK Innovator Founder Visa Business Plan',
        keywords: ['business plan', 'visa', 'innovation', 'UK'],
      }
    });
  };

  const exportToolReport = (toolName: string, data: Record<string, any>, score?: number) => {
    const sections: ExportSection[] = [
      { type: 'heading', content: `${toolName} Analysis Report`, level: 1 },
    ];

    if (score !== undefined) {
      sections.push({
        type: 'score',
        score: { value: score, max: 100, label: 'Overall Score' }
      });
    }

    sections.push({ type: 'divider' });

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sections.push({ type: 'heading', content: formattedKey, level: 2 });
        sections.push({ type: 'paragraph', content: value });
      } else if (Array.isArray(value) && value.length > 0) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sections.push({ type: 'heading', content: formattedKey, level: 2 });
        sections.push({ type: 'list', items: value.map(item => typeof item === 'string' ? item : JSON.stringify(item)) });
      }
    });

    generatePdf({
      title: toolName,
      subtitle: 'Tool Analysis Report',
      filename: `${toolName.toLowerCase().replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}`,
      sections,
      metadata: {
        subject: `${toolName} Report`,
        keywords: [toolName.toLowerCase(), 'visa', 'analysis'],
      }
    });
  };

  return {
    generatePdf,
    exportBusinessPlan,
    exportToolReport,
  };
}
