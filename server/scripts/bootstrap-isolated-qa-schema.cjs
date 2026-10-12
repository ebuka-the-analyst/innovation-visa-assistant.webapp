/**
 * QA-ONLY fresh database bootstrap. No existing application, user or customer
 * data is ever imported. This file MUST NOT run in the live Railway project.
 *
 * Modes:
 *   base   : create the baseline Drizzle schema, only when the database has
 *            absolutely no tables. Production app migrations run afterwards.
 *   ledger : apply isolated test-mode event/payment ledgers, only after
 *            the app's baseline + member entitlement migrations are present.
 *
 * The QA gateway remains disabled unless separate sk_test_ and whsec_ keys
 * and genuine signed provider acceptance are deliberately configured.
 */
const {Pool}=require("pg");
const {spawnSync}=require("node:child_process");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const PROJECT="dbec1752-9b2a-4473-8fab-ddae38310c26";
const ENVIRONMENT="5b20a1f5-8784-4463-bfe8-b435fa086a64";
function qaGuard(env=process.env) {
  if(env.RAILWAY_PROJECT_ID!==PROJECT ||
     env.RAILWAY_ENVIRONMENT_ID!==ENVIRONMENT ||
     env.RAILWAY_PROJECT_NAME!=="IFVA Phase 2 Isolated QA" ||
     env.RAILWAY_ENVIRONMENT_NAME!=="staging" ||
     env.IFVA_QA_SCHEMA_BOOTSTRAP_ENABLED!=="true" ||
     env.NODE_ENV!=="production") {
    throw new Error("QA schema bootstrap blocked: isolated project and staging identity required");
  }
  let target;
  try {target=new URL(env.DATABASE_URL||"");}
  catch {throw new Error("QA schema bootstrap blocked: no database endpoint");}
  if(!["postgres:","postgresql:"].includes(target.protocol) ||
     !target.hostname.endsWith(".railway.internal") ||
     target.hostname==="railway.internal") {
    throw new Error("QA schema bootstrap blocked: database must use private Railway Postgres");
  }
  return target;
}
async function run(mode) {
  qaGuard();
  if(mode!=="base" && mode!=="ledger") throw Error("Specify base or ledger");
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,
    connectionTimeoutMillis:20000});
  try {
    const existing=await pool.query(
      `SELECT table_name FROM information_schema.tables
         WHERE table_schema='public' AND table_type='BASE TABLE'`);
    const names=new Set(existing.rows.map(r=>r.table_name));
    if(mode==="base"){
      if(names.size===0){
        // drizzle-kit push is allowed EXACTLY ONCE on a demonstrably
        // empty, isolated database. It must never alter existing schemas.
        await pool.end();
        const kit=path.join(process.cwd(),"node_modules",".bin","drizzle-kit");
        const run=spawnSync(kit,["push","--force","--config","drizzle.config.ts"],{
          stdio:"inherit",timeout:240000,env:process.env,
        });
        if(run.status!==0)throw Error("Fresh QA baseline schema push failed");
        console.log("[QA BOOTSTRAP] New isolated baseline successfully created");
        return;
      }
      for(const required of ["users","business_plans","credit_transactions","sessions"]){
        if(!names.has(required))throw Error("QA baseline incomplete: "+required);
      }
      console.log("[QA BOOTSTRAP] Existing isolated baseline verified; no schema push");
      return;
    }
    for(const required of ["users","member_ai_entitlements","member_ai_quota_reservations"]){
      if(!names.has(required))throw Error("QA ledger requires existing app migration: "+required);
    }
    const file=path.resolve(process.cwd(),"migrations/qa/20261012_member_stripe_test_ledger.sql");
    const sql=fs.readFileSync(file,"utf8");
    const checksum=crypto.createHash("sha256").update(sql).digest("hex");
    const client=await pool.connect();
    try{
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext('ifva-isolated-test-ledger'))");
      await client.query(`CREATE TABLE IF NOT EXISTS qa_stripe_schema_migrations
        (filename VARCHAR(255) PRIMARY KEY,checksum VARCHAR(64) NOT NULL,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      const prior=await client.query(
        "SELECT checksum FROM qa_stripe_schema_migrations WHERE filename=$1",
        ["20261012_member_stripe_test_ledger.sql"]);
      if(prior.rowCount===1){
        if(prior.rows[0].checksum!==checksum)
          throw Error("QA ledger migration checksum changed: write forward-only SQL");
      }else{
        await client.query(sql);
        await client.query(
          "INSERT INTO qa_stripe_schema_migrations(filename,checksum) VALUES($1,$2)",
          ["20261012_member_stripe_test_ledger.sql",checksum]);
      }
      await client.query("COMMIT");
      console.log("[QA BOOTSTRAP] Isolated ledger verified");
    }catch(e){await client.query("ROLLBACK").catch(()=>{});throw e;}
    finally{client.release();}
  }finally {
    await pool.end().catch(()=>{});
  }
}
module.exports={qaGuard};
if(require.main===module)run(process.argv[2]).catch(err=>{
  console.error("[QA BOOTSTRAP]",err instanceof Error?err.message:"Unknown error");
  process.exitCode=1;
});
