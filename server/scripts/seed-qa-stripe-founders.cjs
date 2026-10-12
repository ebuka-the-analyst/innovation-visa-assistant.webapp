/**
 * Boots three disposable NON-ADMIN verified login accounts on the isolated
 * IFVA sandbox QA database. No production app or existing account is touched.
 * Do not echo the password (Railway environment-only secret).
 */
const {Pool}=require("pg");
const bcrypt=require("bcrypt");
const ids={
  project:"dbec1752-9b2a-4473-8fab-ddae38310c26",
  environment:"5b20a1f5-8784-4463-bfe8-b435fa086a64",
};
function guard(env=process.env){
  if(env.RAILWAY_PROJECT_ID!==ids.project ||
    env.RAILWAY_ENVIRONMENT_ID!==ids.environment ||
    env.RAILWAY_PROJECT_NAME!=="IFVA Phase 2 Isolated QA" ||
    env.RAILWAY_ENVIRONMENT_NAME!=="staging" ||
    env.IFVA_MEMBER_STRIPE_QA_ENABLED!=="true" ||
    env.NODE_ENV!=="production"){
    throw Error("Refusing to seed QA Stripe founder outside isolated staging");
  }
  const pass=env.IFVA_QA_TEST_LOGIN_PASSWORD||"";
  if(pass.length<22 || pass.length>200)throw Error("Provide a long sandbox-only QA test password");
  const u=new URL(env.DATABASE_URL||"");
  if(!["postgres:","postgresql:"].includes(u.protocol)||
     !u.hostname.endsWith(".railway.internal"))throw Error("Refusing non-private QA database");
}
async function main(){
  guard();
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
  const accounts=["founder","founder-pro","pass"].map(kind=>"ifva-qa-"+kind+"-20261012@example.com");
  try{
    const hashed=await bcrypt.hash(process.env.IFVA_QA_TEST_LOGIN_PASSWORD,12);
    const client=await pool.connect();
    try{
      await client.query("BEGIN");
      for(const email of accounts){
        await client.query(
          "INSERT INTO users(email,password,first_name,last_name,is_email_verified,is_admin,subscription_tier,subscription_status) VALUES ($1,$2,'Sandbox','Founder',true,false,'free','inactive') ON CONFLICT(email) DO NOTHING",
          [email,hashed]);
        const found=await client.query(
          "SELECT id,is_admin,is_email_verified FROM users WHERE email=$1",[email]);
        if(found.rowCount!==1 || found.rows[0].is_admin || !found.rows[0].is_email_verified)
          throw Error("Sandbox identity not eligible for checkout");
      }
      await client.query("COMMIT");
    }catch(e){await client.query("ROLLBACK").catch(()=>{});throw e;}
    finally{client.release();}
    console.log("[QA STRIPE] 3 non-admin sandbox login accounts ready; no existing balances changed");
  }finally{await pool.end();}
}
if(require.main===module)main().catch(err=>{
 console.error("[QA STRIPE] Account seed rejected: "+String(err.message||"unknown"));
 process.exitCode=1;
});
module.exports={guard};
