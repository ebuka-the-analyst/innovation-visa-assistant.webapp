import assert from "node:assert/strict";

const base = "https://ifva-phase2-staging-app-staging.up.railway.app";
const ownerPlan = "b9ce9af4-4b38-4393-b548-4f013f000116";
const generatingPlan = "b9ce9af4-4b38-4393-b548-4f013f000117";
const fictionalPassword = "IFVA-QA-fixture-only-2026!do-not-reuse";
const headersJSON = { "Content-Type": "application/json" };
const timeout = AbortSignal.timeout(25000);

async function request(path, init = {}) {
  const result = await fetch(base + path, {...init, signal:AbortSignal.timeout(45000)});
  const bytes = Buffer.from(await result.arrayBuffer());
  return { status: result.status, headers: result.headers, bytes,
    json: () => JSON.parse(bytes.toString("utf8")) };
}
async function login(email) {
  const result = await request("/api/auth/login", {
    method:"POST", headers:headersJSON, body:JSON.stringify({email,password:fictionalPassword}),
  });
  assert.equal(result.status,200,"Fictional test account sign-in must work, got "+result.status);
  const session = result.headers.get("set-cookie")?.split(";")[0] || "";
  assert.ok(session.startsWith("connect.sid="),"Login must issue HTTP-only session cookie");
  assert.equal(result.json()?.success,true);
  return {Cookie:session};
}
function statusMessage(actual, expected, desc) {
  assert.equal(actual.status,expected,desc+": expected "+expected+", got "+actual.status+
    ", content-type="+(actual.headers.get("content-type")||"none"));
  console.log("PASS "+desc+" => "+actual.status);
}
async function main() {
  const host = new URL(base).hostname;
  assert.equal(host,"ifva-phase2-staging-app-staging.up.railway.app",
    "Refusing requests to any production domain");
  const healthy=await request("/health");
  statusMessage(healthy,200,"Isolated staging health");
  for(const suffix of ["pdf","word"]) {
    statusMessage(await request("/api/download/"+suffix+"/"+ownerPlan),401,
      "Unauthenticated "+suffix+" download blocked");
  }
  const outsider=await login("ifva-staging-other-20261012@example.test");
  const owner=await login("ifva-staging-owner-20261012@example.test");
  const myUser=await request("/api/auth/user",{headers:owner});
  statusMessage(myUser,200,"Logged-in account inspection");
  for(const suffix of ["pdf","word"]){
    statusMessage(await request("/api/download/"+suffix+"/"+ownerPlan,{headers:outsider}),404,
      "Cross-account "+suffix+" rejected without existence disclosure");
  }
  statusMessage(await request("/api/download/pdf/"+generatingPlan,{headers:owner}),400,
    "Generating document blocked");
  statusMessage(await request("/api/download/pdf/not-a-real-id",{headers:owner}),404,
    "Missing document blocked");
  const pdf=await request("/api/download/pdf/"+ownerPlan,{headers:owner});
  statusMessage(pdf,200,"Actual PDF for fictional owner");
  assert.equal(pdf.bytes.subarray(0,4).toString(),"%PDF");
  assert.match(pdf.headers.get("content-type")||"",/application\/pdf/i);
  assert.ok(Number(pdf.headers.get("x-business-plan-pages"))>=1);
  assert.match(pdf.headers.get("content-disposition")||"",/attachment/i);
  console.log("PDF bytes="+pdf.bytes.length+" pages="+pdf.headers.get("x-business-plan-pages"));
  const preview=await request("/api/view/pdf/"+ownerPlan,{headers:owner});
  statusMessage(preview,200,"Actual inline PDF preview");
  assert.equal(preview.bytes.subarray(0,4).toString(),"%PDF");
  assert.match(preview.headers.get("content-disposition")||"",/inline/i);
  const word=await request("/api/download/word/"+ownerPlan,{headers:owner});
  statusMessage(word,200,"Actual Word download for fictional owner");
  assert.equal(word.bytes.subarray(0,2).toString(),"PK");
  assert.match(word.headers.get("content-type")||"",/wordprocessingml\.document/i);
  console.log("WORD bytes="+word.bytes.length);
  assert.ok(word.bytes.length>3000);
  console.log(JSON.stringify({
    outcome:"PASS",tests:"actual Railway HTTP auth, owner isolation, PDF/Word, incomplete plan",
    planData:"fictional only",aiCalls:0,stripeCalls:0,productionRequests:0,
  }));
}
main().catch(error=>{console.error("STAGING QA FAILED:",error.message);process.exitCode=1;});
