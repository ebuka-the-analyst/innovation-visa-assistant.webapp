/**
 * READ-ONLY Stripe-sandbox purchase lifecycle audit.
 * Only runs in the named isolated QA Railway project and private Postgres.
 */
const {Pool}=require("pg");
const QA_PROJECT="dbec1752-9b2a-4473-8fab-ddae38310c26";
const QA_ENV="5b20a1f5-8784-4463-bfe8-b435fa086a64";
const cases=[
  {key:"founder",email:"ifva-qa-founder-20261012@example.com",expected:"revoked"},
  {key:"founder_pro",email:"ifva-qa-founder-pro-20261012@example.com",expected:"active"},
  {key:"founder_pass_90d",email:"ifva-qa-pass-20261012@example.com",expected:"revoked"},
];
function guard(env=process.env){
 if(env.RAILWAY_PROJECT_ID!==QA_PROJECT ||
   env.RAILWAY_ENVIRONMENT_ID!==QA_ENV ||
   env.RAILWAY_PROJECT_NAME!=="IFVA Phase 2 Isolated QA"||
   env.RAILWAY_ENVIRONMENT_NAME!=="staging"||
   env.IFVA_MEMBER_STRIPE_QA_ENABLED!=="true"||
   env.NODE_ENV!=="production")throw Error("Refusing read outside isolated Stripe QA");
 const u=new URL(env.DATABASE_URL||"");
 if(!["postgres:","postgresql:"].includes(u.protocol)||
    !u.hostname.endsWith(".railway.internal"))throw Error("Refusing non-private QA database");
}
function evaluate(a){
 const check={key:a.key,expected:a.expected,
   paymentRecorded:a.orderCount===1,
   orderActive:a.orderActive,paidThrough:a.paidThrough,
   userTier:a.userTier,userStatus:a.userStatus,
   entitlementStatus:a.entitlementStatus,
   pendingReviews:a.pendingReviews,recordedDecisions:a.decisions};
 if(a.orderCount!==1)return {...check,pass:false,failure:"missing or duplicated order"};
 const activeEnt=a.entitlementStatus==="active";
 const activeUser=a.userStatus==="active";
 const activeLedger=a.orderActive===true;
 if(a.expected==="active"){
  return {...check,pass:activeEnt&&activeUser&&activeLedger,
     failure:activeEnt&&activeUser&&activeLedger?null:"Expected paid subscription to remain active"};
 }
 return {...check,pass:!activeEnt&&!activeUser&&!activeLedger,
    failure:!activeEnt&&!activeUser&&!activeLedger?null:"Cancelled/refunded membership still active"};
}
async function main(){
 guard();
 const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2});
 const failures=[];
 try{
  for(const item of cases){
   const q="SELECT u.subscription_tier AS user_tier,u.subscription_status AS user_status,"+
     " o.id,o.currently_active,o.paid_through,ent.status AS entitlement_status,"+
     " (SELECT COUNT(*)::int FROM member_stripe_test_reviews r"+
     " WHERE r.order_id=o.id AND r.status='pending') AS pending_reviews"+
     " FROM users u"+
     " LEFT JOIN member_stripe_test_orders o ON o.user_id=u.id AND o.sku=$2"+
     " LEFT JOIN member_ai_entitlements ent ON ent.user_id=u.id"+
     " AND ent.provider='stripe'"+
     " AND ent.provider_reference="+
     " CASE WHEN o.sku='founder_pass_90d' THEN o.stripe_checkout_session_id"+
     " ELSE o.stripe_subscription_id END"+
     " WHERE u.email=$1";
   const x=await pool.query(q,[item.email,item.key]);
   const orders=x.rows.filter(y=>y.id);
   const row=orders[0]||x.rows[0]||{};
   const decisions=row.id?(await pool.query(
    "SELECT event_type,decision FROM member_stripe_test_events"+
    " WHERE order_id=$1 ORDER BY event_created,received_at",[row.id])).rows:[];
   const check=evaluate({key:item.key,expected:item.expected,orderCount:orders.length,
     orderActive:row.currently_active===true,paidThrough:row.paid_through||null,
     userTier:row.user_tier||null,userStatus:row.user_status||null,
     entitlementStatus:row.entitlement_status||null,
     pendingReviews:Number(row.pending_reviews||0),decisions});
   console.log("[QA LIFECYCLE AUDIT] "+JSON.stringify(check));
   if(!check.pass)failures.push(item.key+": "+check.failure);
  }
  const unmatched=await pool.query(
   "SELECT count(*)::integer AS n FROM member_stripe_test_unmatched_events WHERE status='pending'");
  console.log("[QA LIFECYCLE AUDIT] unmatched signed events pending="+unmatched.rows[0].n);
  if(Number(unmatched.rows[0].n)>0)failures.push("unmatched provider events remain");
  if(failures.length){
   console.error("[QA LIFECYCLE AUDIT] NOT READY: "+failures.join("; "));
   if(process.env.IFVA_QA_LIFECYCLE_AUDIT_STRICT==="true")process.exitCode=1;
  }else console.log("[QA LIFECYCLE AUDIT] PASS: all three orders agree with expected post-lifecycle state");
 }finally{await pool.end();}
}
if(require.main===module)main().catch(e=>{
 console.error("[QA LIFECYCLE AUDIT] ERROR: "+String(e.message||"unknown"));
 process.exitCode=1;
});
module.exports={guard,evaluate};
