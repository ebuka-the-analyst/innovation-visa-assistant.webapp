import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import express from "express";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph } from "docx";
import { guardedBusinessPlanDownload } from "../server/businessPlanDownloadGuard";
import { generatePDFWithPDFKit } from "../server/businessPlanPdf";
import { buildBusinessPlanWordTable } from "../server/businessPlanWordTableExporter";

const fictional = {
  id: "fixture-1",
  userId: "founder-A",
  status: "completed",
  businessName: "Fictional Access QA",
  tier: "founder_pro",
  generatedContent: [
    "# FICTIONAL BUSINESS PLAN: Fictional Access QA",
    "## 1. EXECUTIVE SUMMARY",
    "A fictional venture built only to test owner-scoped document downloads.",
    "## 5. FINANCIAL VIABILITY",
    "| Year | Units | Revenue GBP | Variable costs GBP | Fixed costs GBP | Operating loss GBP |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    "| 1 | 450 | 5400 | 1350 | 36000 | -31950 |",
    "| 2 | 2900 | 34800 | 8700 | 61000 | -34900 |",
    "| 3 | 7700 | 92400 | 23100 | 105000 | -35700 |",
  ].join("\n\n"),
};

async function withEphemeralServer(callback: (base: string) => Promise<void>) {
  const app = express();
  // Test-only authenticated-user injection; NOT present in any production routes.
  app.use((req, _res, next) => {
    const id = req.header("x-fixture-account");
    if (id) (req as any).user = { id, isAdmin: req.header("x-fixture-admin") === "yes" };
    next();
  });
  const lookup = async (id: string) => id === fictional.id ? fictional : null;
  app.get("/api/download/pdf/:planId", guardedBusinessPlanDownload({
    lookup, includeStatusOnNotReady: true, logLabel: "Fixture PDF download",
    failureMessage: "Failed to generate PDF",
    render: async (plan, _req, res) => generatePDFWithPDFKit(plan, "attachment", res),
  }));
  app.get("/api/view/pdf/:planId", guardedBusinessPlanDownload({
    lookup, includeStatusOnNotReady: true, logLabel: "Fixture PDF view",
    failureMessage: "Failed to generate PDF",
    render: async (plan, _req, res) => generatePDFWithPDFKit(plan, "inline", res),
  }));
  app.get("/api/download/word/:planId", guardedBusinessPlanDownload({
    lookup, allowAdmin: true, logLabel: "Fixture Word download",
    failureMessage: "Failed to generate Word document",
    render: async (_plan, _req, res) => {
      const document = new Document({ sections:[{children:[
        new Paragraph("Fictional Access QA financials"),
        buildBusinessPlanWordTable([
          ["Year","Units","Revenue","Variable costs","Fixed costs","Operating loss"],
          ["1","450","5400","1350","36000","-31950"],
          ["2","2900","34800","8700","61000","-34900"],
          ["3","7700","92400","23100","105000","-35700"],
        ]),
      ]}] });
      const bytes = await Packer.toBuffer(document);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", 'attachment; filename="fictional.docx"');
      res.send(bytes);
    },
  }));
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("Fixture server needs an ephemeral local port");
  try {
    await callback("http://127.0.0.1:" + addr.port);
  } finally {
    await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
}

test("production PDF and Word routes use the same shared fail-closed access guard", () => {
  const routes = readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
  for (const url of ["/api/download/pdf/:planId","/api/view/pdf/:planId","/api/download/word/:planId"]) {
    assert.ok(routes.includes('app.get("'+url+'", isAuthenticated, guardedBusinessPlanDownload({'),
      url+" must enforce both isAuthenticated and the shared document guard");
  }
  assert.match(routes,/allowAdmin:\s*true[\s\S]*?logLabel:\s*"Word download"/);
  assert.match(routes,/render:\s*async\s*\(businessPlan,\s*_req,\s*res\)[\s\S]*?generatePDFWithPDFKit\(businessPlan,\s*"attachment",\s*res\)/);
  assert.match(routes,/render:\s*async\s*\(businessPlan,\s*req,\s*res\)[\s\S]*?Packer\.toBuffer\(doc\)/);
});

test("isolated HTTP downloads never reveal another founder's document", async () => {
  await withEphemeralServer(async base => {
    for (const endpoint of ["/api/download/pdf/fixture-1","/api/view/pdf/fixture-1","/api/download/word/fixture-1"]) {
      const missing = await fetch(base+endpoint);
      assert.equal(missing.status,401);
      assert.equal(missing.headers.get("content-type")?.includes("pdf"),false);
      const wrong = await fetch(base+endpoint,{headers:{"x-fixture-account":"founder-B"}});
      assert.equal(wrong.status,404);
      assert.equal((await wrong.text()).includes("Fictional Access QA"),false);
      const missingId = await fetch(base+endpoint.replace("fixture-1","not-a-plan"),{headers:{"x-fixture-account":"founder-A"}});
      assert.equal(missingId.status,404);
    }
    const elevatedPdf = await fetch(base+"/api/download/pdf/fixture-1",{
      headers:{"x-fixture-account":"founder-B","x-fixture-admin":"yes"},
    });
    assert.equal(elevatedPdf.status,404,"PDF owner-only policy must not quietly become admin-readable");
    const elevatedWord = await fetch(base+"/api/download/word/fixture-1",{
      headers:{"x-fixture-account":"founder-B","x-fixture-admin":"yes"},
    });
    assert.equal(elevatedWord.status,200,"Preserve existing explicit Word admin-read behaviour");
    const ownerPdf = await fetch(base+"/api/download/pdf/fixture-1",{headers:{"x-fixture-account":"founder-A"}});
    assert.equal(ownerPdf.status,200);
    assert.match(ownerPdf.headers.get("content-disposition")||"",/attachment/i);
    assert.match(ownerPdf.headers.get("content-type")||"",/application\/pdf/);
    const pageCount=Number(ownerPdf.headers.get("x-business-plan-pages"));
    assert.ok(pageCount>=1);
    const rendered = await getDocument({
      data:new Uint8Array(await ownerPdf.arrayBuffer()),useSystemFonts:true,
    }).promise;
    try {assert.equal(rendered.numPages,pageCount);}finally{await rendered.destroy();}
    const ownerView=await fetch(base+"/api/view/pdf/fixture-1",{headers:{"x-fixture-account":"founder-A"}});
    assert.equal(ownerView.status,200);
    assert.match(ownerView.headers.get("content-disposition")||"",/inline/i);
    const word=await fetch(base+"/api/download/word/fixture-1",{headers:{"x-fixture-account":"founder-A"}});
    assert.equal(word.status,200);
    assert.match(word.headers.get("content-type")||"",/wordprocessingml.document/);
    const buf=Buffer.from(await word.arrayBuffer());
    const tmp=await mkdtemp(join(tmpdir(),"ifva-route-qa-"));
    try{
      const filename=join(tmp,"fixture.docx");
      await writeFile(filename,buf);
      const xml=execFileSync("unzip",["-p",filename,"word/document.xml"],{encoding:"utf8"});
      assert.match(xml,/Operating loss/);
      assert.match(xml,/-35700/);
      assert.equal((xml.match(/<w:tbl>/g)||[]).length,1);
    }finally{await rm(tmp,{recursive:true,force:true});}
  });
});

test("unfinished or empty documents cannot pass a customer download gate", async () => {
  const lookup = async()=>({...fictional,status:"generating"});
  const fakeReq = {params:{planId:"fixture-1"},user:{id:"founder-A"}} as any;
  const statuses:number[]=[];
  const responses:any[]=[];
  const res:any = {status(code:number){statuses.push(code);return this;},json(body:any){responses.push(body);return this;}};
  let renderCalls=0;
  await guardedBusinessPlanDownload({lookup,includeStatusOnNotReady:true,failureMessage:"Failed to generate PDF",
    logLabel:"Fixture",render:async()=>{renderCalls++;}})(fakeReq,res,()=>{});
  assert.deepEqual(statuses,[400]);
  assert.equal(responses[0].status,"generating");
  assert.equal(renderCalls,0);
  statuses.length=0;responses.length=0;
  await guardedBusinessPlanDownload({lookup:async()=>({...fictional,generatedContent:""}),failureMessage:"Failed to generate Word document",
    logLabel:"Fixture",render:async()=>{renderCalls++;}})(fakeReq,res,()=>{});
  assert.deepEqual(statuses,[500]);
  assert.equal(renderCalls,0);
});
