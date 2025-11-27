import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const DOCS_DIR = 'attached_assets/visa_application_documents';
const OUTPUT_DIR = 'attached_assets/visa_application_pdfs';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function parseMarkdown(content: string): Array<{ type: string; text: string; level?: number }> {
  const lines = content.split('\n');
  const elements: Array<{ type: string; text: string; level?: number }> = [];
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('# ')) {
      elements.push({ type: 'h1', text: line.substring(2).trim() });
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', text: line.substring(3).trim() });
    } else if (line.startsWith('### ')) {
      elements.push({ type: 'h3', text: line.substring(4).trim() });
    } else if (line.startsWith('#### ')) {
      elements.push({ type: 'h4', text: line.substring(5).trim() });
    } else if (line.startsWith('| ') && line.endsWith(' |')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (!line.includes('---')) {
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        tableRows.push(cells);
      }
    } else if (inTable && !line.startsWith('|')) {
      inTable = false;
      if (tableRows.length > 0) {
        elements.push({ type: 'table', text: JSON.stringify(tableRows) });
        tableRows = [];
      }
      if (line.trim()) {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          elements.push({ type: 'bullet', text: line.substring(2).trim() });
        } else if (/^\d+\.\s/.test(line)) {
          elements.push({ type: 'numbered', text: line.replace(/^\d+\.\s/, '').trim() });
        } else if (line.startsWith('---')) {
          elements.push({ type: 'hr', text: '' });
        } else if (line.startsWith('**') && line.endsWith('**')) {
          elements.push({ type: 'bold', text: line.replace(/\*\*/g, '').trim() });
        } else {
          elements.push({ type: 'paragraph', text: line.trim() });
        }
      }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push({ type: 'bullet', text: line.substring(2).trim() });
    } else if (/^\d+\.\s/.test(line)) {
      elements.push({ type: 'numbered', text: line.replace(/^\d+\.\s/, '').trim() });
    } else if (line.startsWith('---')) {
      elements.push({ type: 'hr', text: '' });
    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      elements.push({ type: 'bold', text: line.replace(/\*\*/g, '').trim() });
    } else if (line.trim()) {
      elements.push({ type: 'paragraph', text: line.trim() });
    }
  }

  if (inTable && tableRows.length > 0) {
    elements.push({ type: 'table', text: JSON.stringify(tableRows) });
  }

  return elements;
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[ \]/g, '☐')
    .replace(/\[x\]/gi, '☑')
    .replace(/✅/g, '[OK]')
    .replace(/❌/g, '[X]');
}

function generatePDF(mdContent: string, outputPath: string, title: string) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const elements = parseMarkdown(mdContent);
  let y = doc.y;

  for (const element of elements) {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    const cleanedText = cleanText(element.text);

    switch (element.type) {
      case 'h1':
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a365d');
        doc.text(cleanedText, 50, y, { align: 'center' });
        y = doc.y + 15;
        break;

      case 'h2':
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#2c5282');
        doc.text(cleanedText, 50, y);
        y = doc.y + 10;
        break;

      case 'h3':
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2d3748');
        doc.text(cleanedText, 50, y);
        y = doc.y + 8;
        break;

      case 'h4':
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#4a5568');
        doc.text(cleanedText, 50, y);
        y = doc.y + 6;
        break;

      case 'paragraph':
      case 'bold':
        doc.fontSize(10).font(element.type === 'bold' ? 'Helvetica-Bold' : 'Helvetica').fillColor('#333333');
        doc.text(cleanedText, 50, y, { width: 495, align: 'justify' });
        y = doc.y + 6;
        break;

      case 'bullet':
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.text(`• ${cleanedText}`, 60, y, { width: 485, indent: 10 });
        y = doc.y + 4;
        break;

      case 'numbered':
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.text(`  ${cleanedText}`, 60, y, { width: 485 });
        y = doc.y + 4;
        break;

      case 'hr':
        doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#cccccc').stroke();
        y += 15;
        break;

      case 'table':
        try {
          const rows: string[][] = JSON.parse(element.text);
          if (rows.length > 0) {
            const colWidth = 485 / rows[0].length;
            
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
              if (y > 720) {
                doc.addPage();
                y = 50;
              }
              
              const row = rows[rowIdx];
              const isHeader = rowIdx === 0;
              
              doc.fontSize(9).font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fillColor('#333333');
              
              if (isHeader) {
                doc.rect(50, y - 2, 495, 16).fillColor('#f0f0f0').fill();
                doc.fillColor('#333333');
              }
              
              for (let colIdx = 0; colIdx < row.length; colIdx++) {
                const cellText = cleanText(row[colIdx]).substring(0, 50);
                doc.text(cellText, 55 + colIdx * colWidth, y, { 
                  width: colWidth - 10,
                  height: 14,
                  ellipsis: true
                });
              }
              y += 16;
            }
            y += 8;
          }
        } catch (e) {
          // Skip malformed tables
        }
        break;
    }
  }

  doc.fontSize(8).font('Helvetica').fillColor('#666666');
  doc.text('OISC Compliance Notice: This document provides general guidance and does not constitute regulated immigration advice.', 50, 780, { 
    width: 495, 
    align: 'center' 
  });

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });
}

async function main() {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  
  console.log('Generating PDF documents for visa application...\n');
  
  for (const file of files) {
    const mdPath = path.join(DOCS_DIR, file);
    const pdfName = file.replace('.md', '.pdf');
    const pdfPath = path.join(OUTPUT_DIR, pdfName);
    
    const content = fs.readFileSync(mdPath, 'utf-8');
    const title = file.replace('.md', '').replace(/_/g, ' ');
    
    await generatePDF(content, pdfPath, title);
    console.log(`Generated: ${pdfName}`);
  }
  
  console.log(`\nAll PDFs saved to: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
