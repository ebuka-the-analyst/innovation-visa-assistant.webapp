import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {Pool} from "pg";

const migration=readFileSync(new URL("../migrations/app/20261014_stripe_managed_orders_isolated.sql",import.meta.url),"utf8");
test("isolated Managed Payments schema runs twice in PostgreSQL and cannot mix direct UK orders",async()=>{
 const url=process.env.QUOTA_TEST_DATABASE_URL;
 if(!url)throw Error("Offline Postgres test requires QUOTA_TEST_DATABASE_URL");
 const pool=new Pool({connectionString:url});
 const client=await pool.connect();
 try{
  await client.query("BEGIN");
  await client.query("CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY)");
  await client.query(migration);
  await client.query(migration);
  const tables=await client.query<{tablename:string}>(
   "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'member_stripe_managed_%'");
  assert.deepEqual(tables.rows.map(v=>v.tablename).sort(),[
   "member_stripe_managed_events","member_stripe_managed_orders",
   "member_stripe_managed_reviews",
  ]);
  const cols=await client.query<{column_name:string;is_nullable:string}>(
    "SELECT column_name,is_nullable FROM information_schema.columns WHERE table_name='member_stripe_managed_orders'");
  for(const name of ["provider_mode","buyer_kind","product_tax_code","stripe_product_id","livemode","base_pence","tax_pence","gross_pence","currency","customer_country","status"]){
   assert.ok(cols.rows.some(c=>c.column_name===name),name);
  }
  const indexes=await client.query<{indexname:string;indexdef:string}>(
   "SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='member_stripe_managed_orders'");
  const single=indexes.rows.find(i=>i.indexname==="idx_managed_one_current_checkout");
  assert.match(single?.indexdef||"",/UNIQUE INDEX/);
  assert.match(single?.indexdef||"",/user_id, livemode/);
  assert.match(single?.indexdef||"",/status.*reserved/);
  const checks=await client.query<{conname:string}>(
   "SELECT conname FROM pg_constraint WHERE conrelid='member_stripe_managed_orders'::regclass");
  assert.ok(checks.rows.some(x=>x.conname==="managed_buyer_tax_code"));
  assert.ok(checks.rows.some(x=>x.conname==="managed_order_sku_price"));
  assert.ok(checks.rows.some(x=>x.conname==="managed_invoice_tax_arithmetic"));
  assert.doesNotMatch(migration,/ALTER TABLE member_stripe_live_orders|UPDATE member_stripe_live_orders/);
 } finally{
  await client.query("ROLLBACK").catch(()=>{});
  client.release();
  await pool.end();
 }
});
