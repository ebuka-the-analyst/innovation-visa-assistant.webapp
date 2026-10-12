/**
 * No-cost offline DOCX preview for an EXISTING fictional AI benchmark Markdown.
 * Reuses production financial table builder; does not call the authenticated
 * client export route, change a database or make any API request.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  Document, Footer, HeadingLevel, Packer, PageNumber, Paragraph,
  TextRun, AlignmentType, BorderStyle,
} from "docx";
import { htmlFinancialTablesToMarkdown } from "../server/businessPlanTables";
import { buildBusinessPlanWordTable } from "../server/businessPlanWordTableExporter";

const plain = (value: string) => value.replace(/\*\*([^*]+)\*\*/g,"$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/<[^>]*>/g," ")
  .replace(/[–—]/g,"-").trim();
const tableCells = (line: string) =>
  line.trim().slice(1,-1).split("|").map(part=>plain(part.trim()));
const divider = (row: string[]) =>
  row.every(part=> /^:?-{3,}:?$/.test(part.trim()));

export function parseBenchWordBlocks(markdown: string) {
  const lines = htmlFinancialTablesToMarkdown(markdown).split("\n");
  const blocks: Array<
    | {kind:"heading";level:number;text:string}
    | {kind:"table";rows:string[][]}
    | {kind:"paragraph";text:string}
    | {kind:"bullet";text:string}
  > = [];
  let buffer: string[] = [];
  const flush = () => {
    if(buffer.length) {
      const text=plain(buffer.join(" ").replace(/\s+/g," "));
      if(text) blocks.push({kind:"paragraph",text});
      buffer=[];
    }
  };
  for(let i=0;i<lines.length;){
    const trimmed=lines[i].trim();
    if(!trimmed) {flush();i++;continue;}
    if(trimmed==="---"){flush();i++;continue;}
    const header=trimmed.match(/^(#{1,4})\s+(.+)/);
    if(header){flush();blocks.push({kind:"heading",level:header[1].length,text:plain(header[2])});i++;continue;}
    if(trimmed.startsWith("|")&&trimmed.endsWith("|")){
      const head=tableCells(trimmed);
      const next=i+1<lines.length?tableCells(lines[i+1]):[];
      if(head.length>=2&&head.length<=6&&next.length===head.length&&divider(next)){
        flush();
        const rows=[head];
        i+=2;
        while(i<lines.length&&lines[i].trim().startsWith("|")&&lines[i].trim().endsWith("|")){
          const row=tableCells(lines[i]);
          if(row.length!==head.length || divider(row))break;
          rows.push(row);i++;
        }
        if(rows.length>=2){blocks.push({kind:"table",rows});continue;}
      }
    }
    if(/^[-*]\s+/.test(trimmed)){flush();blocks.push({kind:"bullet",text:plain(trimmed.slice(2))});i++;continue;}
    buffer.push(trimmed);i++;
  }
  flush();
  return blocks;
}

export async function writeFullFictionalDocx(markdown: string, target: string) {
  if(!/^# FICTIONAL BUSINESS PLAN:/m.test(markdown)||!/QA DOCUMENT - NOT A REAL APPLICATION/.test(markdown)){
    throw new Error("Refusing to export a non-fictional or unlabelled client plan.");
  }
  const blocks=parseBenchWordBlocks(markdown);
  const sectionCount=blocks.filter(b=>b.kind==="heading"&&b.level===2).length;
  if(sectionCount!==13)throw new Error("Expected exactly 13 benchmark section headings.");
  const tables=blocks.filter((b):b is {kind:"table";rows:string[][]}=>b.kind==="table");
  const columnsSix=tables.filter(b=>b.rows[0].length===6).length;
  if(columnsSix!==4)throw new Error("Expected exactly four six-column benchmark financial tables.");
  const children:any[]=[];
  for(const block of blocks){
    if(block.kind==="table"){
      children.push(buildBusinessPlanWordTable(block.rows));
    } else if(block.kind==="heading"){
      const heading=block.level===1?HeadingLevel.TITLE:
        block.level===2?HeadingLevel.HEADING_1:
        block.level===3?HeadingLevel.HEADING_2:HeadingLevel.HEADING_3;
      children.push(new Paragraph({text:block.text,heading,spacing:{before:180,after:100}}));
    } else if(block.kind==="bullet"){
      children.push(new Paragraph({text:block.text,bullet:{level:0},spacing:{after:80}}));
    } else {
      children.push(new Paragraph({children:[new TextRun({text:block.text,size:21})],
        spacing:{after:130},alignment:AlignmentType.LEFT}));
    }
  }
  const doc=new Document({sections:[{
    properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:900,right:900}}},
    footers:{default:new Footer({children:[new Paragraph({
      alignment:AlignmentType.RIGHT,
      children:[new TextRun({text:"Fictional QA only  •  Page ",size:17}),
        new TextRun({children:[PageNumber.CURRENT],size:17})],
    })]})},
    children,
  }]});
  const bytes=await Packer.toBuffer(doc);
  await mkdir(resolve(target,".."),{recursive:true});
  await writeFile(target,bytes);
  return {sections:sectionCount,tables:tables.length,sixColumnTables:columnsSix,
    blocks:blocks.length,bytes:bytes.length,productionTableBuilderUsed:true,
    isAuthenticatedProductionRouteTest:false};
}

async function main(){
  const input=process.argv[2],out=process.argv[3];
  if(!input||!out)throw new Error("Provide existing fictional benchmark Markdown and output DOCX filename.");
  const report=await writeFullFictionalDocx(await readFile(resolve(input),"utf8"),resolve(out));
  console.log(JSON.stringify(report,null,2));
}
if(process.argv[1]&&/phase2-benchmark-word-preview\.(?:ts|js)$/.test(process.argv[1])){
  main().catch(err=>{console.error("DOCX preview failed:",String(err.message||err));process.exitCode=1;});
}
