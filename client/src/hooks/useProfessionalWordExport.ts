import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, PageBreak, BorderStyle, ShadingType, Header, Footer, PageNumber, NumberFormat } from 'docx';
import { saveAs } from 'file-saver';

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

export function useProfessionalWordExport() {
  const colors = {
    primary: '1a1a2e',
    accent: 'ffa536',
    secondary: '11b6e9',
    text: '333333',
    muted: '666666',
    light: 'F5F5F5',
    white: 'FFFFFF',
    success: '22c55e',
    warning: 'f59e0b',
    danger: 'ef4444',
  };

  const generateProfessionalWord = async (options: ProfessionalDocumentOptions): Promise<void> => {
    const children: (Paragraph | Table)[] = [];

    children.push(
      new Paragraph({
        spacing: { before: 2000 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: options.mainTitle.toUpperCase(),
            bold: true,
            size: 56,
            color: colors.white,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        shading: {
          type: ShadingType.SOLID,
          color: colors.primary,
          fill: colors.primary,
        },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: options.subtitle,
            size: 28,
            color: colors.muted,
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Prepared by:',
            size: 24,
            color: colors.muted,
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
            text: options.preparedBy.name,
            bold: true,
            size: 32,
            color: colors.primary,
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
            text: options.preparedBy.email,
            size: 22,
            color: colors.secondary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    if (options.preparedBy.phone) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: options.preparedBy.phone,
              size: 22,
              color: colors.muted,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        })
      );
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: options.date,
            size: 28,
            color: colors.primary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000 },
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'TABLE OF CONTENTS',
            bold: true,
            size: 40,
            color: colors.primary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    let sectionCounter = 1;
    options.parts.forEach((part) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `PART ${part.partLetter}: ${part.partTitle.toUpperCase()}`,
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          spacing: { before: 400, after: 200 },
        })
      );

      part.sections.forEach((section) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${sectionCounter}. ${section.title}`,
                size: 22,
                color: colors.text,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
        sectionCounter++;
      });
    });

    if (options.appendices && options.appendices.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'APPENDICES',
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          spacing: { before: 400, after: 200 },
        })
      );

      options.appendices.forEach((appendix) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${appendix.letter}. ${appendix.title}`,
                size: 22,
                color: colors.text,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
      });
    }

    sectionCounter = 1;
    options.parts.forEach((part) => {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );

      children.push(
        new Paragraph({
          spacing: { before: 2000 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `PART ${part.partLetter}`,
              size: 28,
              color: colors.muted,
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
              text: part.partTitle.toUpperCase(),
              bold: true,
              size: 56,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      part.sections.forEach((section) => {
        children.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${sectionCounter}. ${section.title.toUpperCase()}`,
                bold: true,
                size: 36,
                color: colors.primary,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
          })
        );

        if (section.content) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content,
                  size: 22,
                  color: colors.text,
                }),
              ],
              spacing: { after: 300 },
            })
          );
        }

        if (section.subsections) {
          section.subsections.forEach((sub) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${sub.number} ${sub.title}`,
                    bold: true,
                    size: 26,
                    color: colors.primary,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
              })
            );

            if (sub.content) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sub.content,
                      size: 22,
                      color: colors.text,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }

            if (sub.list) {
              sub.list.forEach((item) => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${item}`,
                        size: 22,
                        color: colors.text,
                      }),
                    ],
                    spacing: { after: 100 },
                    indent: { left: 400 },
                  })
                );
              });
            }

            if (sub.table && sub.table.rows.length > 0) {
              const tableRows: TableRow[] = [];

              tableRows.push(
                new TableRow({
                  children: sub.table.headers.map(header =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: header,
                              bold: true,
                              size: 22,
                              color: colors.white,
                            }),
                          ],
                        }),
                      ],
                      shading: { fill: colors.primary, type: ShadingType.SOLID, color: colors.primary },
                    })
                  ),
                })
              );

              sub.table.rows.forEach((row, idx) => {
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
                        shading: idx % 2 === 0 ? { fill: colors.light, type: ShadingType.SOLID, color: colors.light } : undefined,
                      })
                    ),
                  })
                );
              });

              children.push(
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                })
              );

              children.push(new Paragraph({ spacing: { after: 300 } }));
            }
          });
        }

        if (section.table && section.table.rows.length > 0) {
          const tableRows: TableRow[] = [];

          tableRows.push(
            new TableRow({
              children: section.table.headers.map(header =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: header,
                          bold: true,
                          size: 22,
                          color: colors.white,
                        }),
                      ],
                    }),
                  ],
                  shading: { fill: colors.primary, type: ShadingType.SOLID, color: colors.primary },
                })
              ),
            })
          );

          section.table.rows.forEach((row, idx) => {
            tableRows.push(
              new TableRow({
                children: row.map(cell => {
                  const cellText = typeof cell === 'object' ? cell.text : cell;
                  const cellStatus = typeof cell === 'object' ? cell.status : undefined;
                  const symbol = cellStatus === 'pass' ? '[PASS] ' : cellStatus === 'warning' ? '[WARN] ' : cellStatus === 'fail' ? '[FAIL] ' : '';
                  const textColor = cellStatus === 'pass' ? colors.success : cellStatus === 'warning' ? colors.warning : cellStatus === 'fail' ? colors.danger : colors.text;

                  return new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: symbol + cellText,
                            size: 22,
                            color: textColor,
                          }),
                        ],
                      }),
                    ],
                    shading: idx % 2 === 0 ? { fill: colors.light, type: ShadingType.SOLID, color: colors.light } : undefined,
                  });
                }),
              })
            );
          });

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );

          children.push(new Paragraph({ spacing: { after: 300 } }));
        }

        if (section.list) {
          section.list.forEach((item) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${item}`,
                    size: 22,
                    color: colors.text,
                  }),
                ],
                spacing: { after: 100 },
                indent: { left: 400 },
              })
            );
          });
        }

        if (section.score) {
          const scoreColor = section.score.value >= 80 ? colors.success :
                            section.score.value >= 60 ? colors.warning : colors.danger;

          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${section.score.label}: `,
                  size: 28,
                  color: colors.text,
                }),
                new TextRun({
                  text: `${section.score.value}/${section.score.max}`,
                  bold: true,
                  size: 36,
                  color: scoreColor,
                }),
                section.score.status ? new TextRun({
                  text: ` (${section.score.status})`,
                  size: 28,
                  color: scoreColor,
                }) : new TextRun({ text: '' }),
              ],
              spacing: { before: 300, after: 400 },
              shading: {
                type: ShadingType.SOLID,
                color: colors.light,
                fill: colors.light,
              },
            })
          );
        }

        sectionCounter++;
      });
    });

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
            color: colors.muted,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'For legal advice specific to your situation, please consult:',
            size: 20,
            color: colors.muted,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    const advisors = [
      '(1) An OISC-registered immigration adviser (Level 1 or higher)',
      '(2) A solicitor regulated by the Solicitors Regulation Authority (SRA)',
      '(3) A barrister regulated by the Bar Standards Board (BSB)'
    ];

    advisors.forEach((advisor) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: advisor,
              size: 20,
              color: colors.muted,
            }),
          ],
          indent: { left: 400 },
          spacing: { after: 50 },
        })
      );
    });

    children.push(
      new Paragraph({
        spacing: { before: 400 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'UK Innovator Founder Visa Assistant',
            size: 20,
            color: colors.muted,
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
            color: colors.secondary,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    const doc = new Document({
      creator: options.metadata?.author || options.preparedBy.name,
      title: options.mainTitle,
      subject: options.metadata?.subject || 'UK Innovator Founder Visa Application',
      keywords: options.metadata?.keywords?.join(', '),
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const filename = options.mainTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.docx`);
  };

  const generateSimpleProfessionalWord = async (
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

    await generateProfessionalWord({
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
    generateProfessionalWord,
    generateSimpleProfessionalWord,
  };
}
