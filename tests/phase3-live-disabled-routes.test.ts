import test from "node:test";
import assert from "node:assert/strict";
import {registerMemberStripeLiveRoutes} from "../server/phase3/memberStripeLiveRoutes";

test("disabled membership webhook fails with retryable HTTP 503, never SPA 200",()=>{
 const routes:Record<string,any>={};
 const app={
   post(path:string, handler:any){routes["POST "+path]=handler;},
   get(path:string, handler:any){routes["GET "+path]=handler;},
 };
 registerMemberStripeLiveRoutes(app as any,(()=>{}) as any,{} as any,(()=>{}) as any);
 for(const key of [
   "POST /api/member-stripe-live/webhook",
   "POST /api/member-stripe-live/checkout",
   "GET /api/member-stripe-live/order/:orderId",
 ]){
   assert.equal(typeof routes[key],"function",key+" must be explicitly unavailable");
   const response:any={
     code:200,headers:{} as Record<string,string>,body:null,
     setHeader(k:string,v:string){this.headers[k]=v;return this;},
     status(code:number){this.code=code;return this;},
     json(payload:any){this.body=payload;return this;},
   };
   routes[key]({},response);
   assert.equal(response.code,503,key+" must never report HTTP 200 while disabled");
   assert.equal(response.body.received,false);
   assert.equal(response.headers["Cache-Control"],"no-store");
 }
});
