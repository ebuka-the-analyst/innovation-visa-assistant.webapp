/**
 * Re-render the saved and already-paid Benchmark #2 markdown with the
 * six-column PDF renderer fix. Makes zero OpenAI calls.
 */
import { mkdir,readFile,writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { parsePdfTable } from "../server/businessPlanPdfTables";
import { renderBusinessPlanPdf } from "../server/businessPlanPdf";
import { inspectRenderedBusinessPlanPdf } from "../server/businessPlanPdfInspection";
import { assessBusinessPlanDocument } from "../server/businessPlanDocumentDiagnostics";

async function main(){
  const src=process.argv[2],out=process.argv[3];
  if(!src||!out)throw new Error("Provide the existing fictional Markdown and an output directory");
  const content=await readFile(resolve(src),"utf8");
  if(!content.startsWith("# FICTIONAL BUSINESS PLAN: ") ||
    !content.includes("QA DOCUMENT - NOT A REAL APPLICATION")){
      throw new Error("Refusing to render a customer document using the fictional benchmark tool.");
  }
  const sixTables: string[][][]=[];
  const lines=content.split("\n");
  for(let i=0;i<lines.length;i++){
    const parsed=parsePdfTable(lines,i);
    if(parsed?.rows[0].length===6){
      sixTables.push(parsed.rows);
      i+=parsed.consumed-1;
    }
  }
  if(sixTables.length!==4)throw new Error("Expected four source tables with six columns.");
  const rendered=await renderBusinessPlanPdf({
    businessName:"Fictional AccessibleVenue Connect Ltd",
    tier:"founder_pro",generatedContent:content,
  });
  const inspection=await inspectRenderedBusinessPlanPdf(rendered.buffer);
  const quality=assessBusinessPlanDocument("founder_pro",content,rendered.pageCount,inspection);

  const parsedPdf=await getDocument({data:new Uint8Array(rendered.buffer),useSystemFonts:true}).promise;
  try {
    let combined="";
    for(let n=1;n<=parsedPdf.numPages;n++){
      const page=await parsedPdf.getPage(n);
      combined+="\n"+(await page.getTextContent()).items.map((item:any)=>item.str||"").join(" ");
    }
    const numericText = combined.replace(/[,£\s]/g,"");
    for(const value of ["450","2900","7700","-31950","-34900","-35700","105000"]){
      if(!numericText.includes(value))throw new Error("Required financial figure missing from PDF extraction: "+value);
    }
    if(!combined.includes("Billable units"))throw new Error("Six-column table header missing from PDF extraction");
  }finally {await parsedPdf.destroy();}
  const result={
    offline:true,newApiRequests:0,sixColumnTables:sixTables.length,
    originalBenchmarkPages:129,correctedRenderedPages:rendered.pageCount,
    substantialPages:inspection.substantivePageCount,
    nearEmptyInteriorPages:inspection.nearEmptyInteriorPages,
    visibleHtmlTagPages:inspection.visibleHtmlTagPages,
    qualityGatePassed:quality.releaseGatePassed,
    blockingWarnings:quality.formattingWarnings,
    reviewAdvisories:quality.reviewAdvisories,
    manualEvidenceReviewRequired:true,
  };
  await mkdir(resolve(out),{recursive:true});
  await Promise.all([
    writeFile(resolve(out,"fictional-founder-pro-benchmark-two-corrected.pdf"),rendered.buffer),
    writeFile(resolve(out,"benchmark-two-export-qa.json"),JSON.stringify(result,null,2))
  ]);
  console.log(JSON.stringify(result,null,2));
  if(!quality.releaseGatePassed)process.exitCode=1;
}
main().catch(error=>{console.error("Offline PDF validation failed:",String(error?.message||error));process.exitCode=1;});
