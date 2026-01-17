import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ScoreData {
  value: number;
  max: number;
  label: string;
}

interface ImageData {
  dataUrl: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface ExportSection {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'score' | 'divider' | 'image';
  content?: string;
  level?: 1 | 2 | 3;
  items?: string[];
  tableData?: TableData;
  score?: ScoreData;
  imageData?: ImageData;
}

interface WordExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  sections: ExportSection[];
  metadata?: {
    subject?: string;
    author?: string;
    keywords?: string[];
  };
}

export function useWordExport() {
  const generateWord = async (options: WordExportOptions) => {
    const { title, subtitle, filename, sections, metadata } = options;
    
    const children: (Paragraph | Table)[] = [];
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 48,
            color: '1a1a2e',
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    if (subtitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: subtitle,
              size: 28,
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleString('en-GB')}`,
            size: 20,
            color: '999999',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );
    
    for (const section of sections) {
      switch (section.type) {
        case 'heading':
          const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 : 
                               section.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content || '',
                  bold: true,
                  size: section.level === 1 ? 32 : section.level === 2 ? 28 : 24,
                  color: '1a1a2e',
                }),
              ],
              heading: headingLevel,
              spacing: { before: 400, after: 200 },
            })
          );
          break;
          
        case 'paragraph':
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content || '',
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            })
          );
          break;
          
        case 'list':
          if (section.items) {
            for (const item of section.items) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${item}`,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 100 },
                  indent: { left: 400 },
                })
              );
            }
          }
          break;
          
        case 'table':
          if (section.tableData && section.tableData.rows.length > 0) {
            const tableRows: TableRow[] = [];
            
            tableRows.push(
              new TableRow({
                children: section.tableData.headers.map(header => 
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: header,
                            bold: true,
                            size: 22,
                            color: 'FFFFFF',
                          }),
                        ],
                      }),
                    ],
                    shading: { fill: '1a1a2e' },
                  })
                ),
              })
            );
            
            for (let i = 0; i < section.tableData.rows.length; i++) {
              const row = section.tableData.rows[i];
              tableRows.push(
                new TableRow({
                  children: row.map(cell => 
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: cell,
                              size: 22,
                            }),
                          ],
                        }),
                      ],
                      shading: i % 2 === 0 ? { fill: 'F5F5F5' } : undefined,
                    })
                  ),
                })
              );
            }
            
            children.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
            );
            children.push(new Paragraph({ spacing: { after: 200 } }));
          }
          break;
          
        case 'score':
          if (section.score) {
            const percentage = Math.round((section.score.value / section.score.max) * 100);
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${section.score.label}: `,
                    bold: true,
                    size: 28,
                  }),
                  new TextRun({
                    text: `${percentage}%`,
                    bold: true,
                    size: 36,
                    color: percentage >= 80 ? '22c55e' : percentage >= 60 ? 'f59e0b' : 'ef4444',
                  }),
                ],
                spacing: { after: 400 },
              })
            );
          }
          break;
          
        case 'divider':
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '────────────────────────────────────────────────────────',
                  color: 'CCCCCC',
                  size: 20,
                }),
              ],
              spacing: { before: 200, after: 200 },
            })
          );
          break;

        case 'image':
          if (section.imageData?.dataUrl) {
            try {
              const base64Data = section.imageData.dataUrl.split(',')[1];
              const imgWidth = section.imageData.width || 600;
              const imgHeight = section.imageData.height || 350;
              
              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)),
                      transformation: {
                        width: imgWidth,
                        height: imgHeight,
                      },
                      type: 'png',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 },
                })
              );
              
              if (section.imageData.caption) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: section.imageData.caption,
                        size: 18,
                        italics: true,
                        color: '666666',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                  })
                );
              }
            } catch (err) {
              console.error('Failed to add image to Word:', err);
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '[Chart image could not be rendered]',
                      size: 20,
                      color: 'CC6666',
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
          }
          break;
      }
    }
    
    children.push(
      new Paragraph({
        spacing: { before: 600 },
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
        spacing: { after: 200 },
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Report generated by UK Innovator Founder Visa Assistant',
            size: 18,
            color: '666666',
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
            size: 18,
            color: '11b6e9',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'IMPORTANT LEGAL NOTICE',
            size: 18,
            bold: true,
            color: 'B45309',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 400 },
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.',
            size: 16,
            color: '666666',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 100 },
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'For legal advice specific to your situation, please consult: (1) An OISC-registered immigration adviser (Level 1 or higher), (2) A solicitor regulated by the Solicitors Regulation Authority (SRA), or (3) A barrister regulated by the Bar Standards Board (BSB).',
            size: 16,
            color: '666666',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 200 },
      })
    );
    
    const doc = new Document({
      creator: metadata?.author || 'UK Innovator Founder Visa Assistant',
      title: title,
      subject: metadata?.subject,
      keywords: metadata?.keywords?.join(', '),
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };
  
  return { generateWord };
}
