import type { Express, RequestHandler } from "express";
import { dbPool } from "./db";
import {
  EMAIL_TEMPLATES, DEFAULT_BODY_TEMPLATE, DEFAULT_SUBJECT_TEMPLATE,
  emailBrand, normaliseEmailBrand, renderEmailTemplate, validateTemplateEdit,
  type EmailBrand,
} from "./services/emailTemplateService";

const brands: EmailBrand[]=["global","ifva"];
const definitions = new Map(EMAIL_TEMPLATES.map(t=>[t.key,t]));
const validBrand=(value:unknown):value is EmailBrand => value==="global" || value==="ifva";
const safeString=(v:unknown)=>typeof v==="string"?v:"";
const validTemplateKey=(v:unknown):v is string => typeof v==="string"&&definitions.has(v);
const pool=dbPool;

export function registerEmailTemplateAdminRoutes(app:Express, requireAdmin:RequestHandler) {
  app.get("/api/admin/email-templates",requireAdmin,async(_req,res)=>{
    try {
      const out=await pool.query("SELECT brand,template_key,subject_template,body_template,revision,updated_by,updated_at FROM email_template_overrides");
      const overrides=new Map(out.rows.map(row=>[`${row.brand}:${row.template_key}`,row]));
      const items=brands.flatMap(brand=>EMAIL_TEMPLATES.map(item=>{
        const row=overrides.get(`${brand}:${item.key}`);
        return {
          ...item,brand,editable:true,
          subjectTemplate:row?.subject_template||DEFAULT_SUBJECT_TEMPLATE,
          bodyTemplate:row?.body_template||DEFAULT_BODY_TEMPLATE,
          custom:Boolean(row),revision:Number(row?.revision||0),
          updatedBy:row?.updated_by||null,updatedAt:row?.updated_at||null,
        };
      }));
      res.set("Cache-Control","no-store").json({items,activeBrand:emailBrand(),variables:["{{subject}}","{{body}}","{{recipient_name}}"]});
    } catch(e) {
      console.error("[Email templates] catalogue failed",e instanceof Error?e.message:"unknown");
      res.status(503).json({message:"Email template catalogue unavailable"});
    }
  });

  app.get("/api/admin/email-templates/delivery-log",requireAdmin,async(req,res)=>{
    try {
      const limit=Math.min(100,Math.max(1,Number(req.query.limit)||40));
      const offset=Math.min(5000,Math.max(0,Number(req.query.offset)||0));
      const emails=await pool.query(`
        SELECT id,recipient_email AS "recipientEmail",recipient_name AS "recipientName",
          subject,email_type AS "emailType",status,provider,message_id AS "messageId",
          error_message AS "errorMessage",sent_at AS "sentAt",delivered_at AS "deliveredAt"
        FROM email_logs ORDER BY sent_at DESC LIMIT $1 OFFSET $2`,
        [limit,offset],
      );
      res.set("Cache-Control","no-store").json({items:emails.rows,limit,offset});
    } catch(e) {
      console.error("[Email templates] delivery log failed",e instanceof Error?e.message:"unknown");
      res.status(503).json({message:"Email delivery history unavailable"});
    }
  });

  app.get("/api/admin/email-templates/:brand/:key/history",requireAdmin,async(req,res)=>{
    if(!validBrand(req.params.brand)||!validTemplateKey(req.params.key))
      return res.status(404).json({message:"Unknown template"});
    try {
      const r=await pool.query(`SELECT revision,subject_template AS "subjectTemplate",
        body_template AS "bodyTemplate",updated_by AS "updatedBy",updated_at AS "updatedAt"
        FROM email_template_revisions WHERE brand=$1 AND template_key=$2
        ORDER BY revision DESC LIMIT 40`,[req.params.brand,req.params.key]);
      return res.set("Cache-Control","no-store").json({items:r.rows});
    }catch(e) {
      console.error("[Email templates] history failed",e instanceof Error?e.message:"unknown");
      return res.status(503).json({message:"Template history unavailable"});
    }
  });

  app.post("/api/admin/email-templates/:brand/:key/preview",requireAdmin,async(req,res)=>{
    if(!validBrand(req.params.brand)||!validTemplateKey(req.params.key))return res.status(404).json({message:"Unknown template"});
    const {subjectTemplate,bodyTemplate}=req.body||{};
    const problem=validateTemplateEdit(subjectTemplate,bodyTemplate);
    if(problem)return res.status(400).json({message:problem});
    const product=req.params.brand==="global"?"Visa Assistant Global":"Innovator Founder Visa Assistant";
    const raw=normaliseEmailBrand(definitions.get(req.params.key)!.defaultSubject,
      "<h2>Sample message</h2><p>Hello Example Founder, this is safe preview text only. Real verification links, payment information and private customer details are never shown in previews.</p>",
      req.params.brand);
    const preview=renderEmailTemplate({...raw,subjectTemplate,bodyTemplate,recipientName:"Example Founder"});
    return res.set("Cache-Control","no-store").json({...preview,brand:product,previewOnly:true});
  });

  app.put("/api/admin/email-templates/:brand/:key",requireAdmin,async(req,res)=>{
    const {brand,key}=req.params;
    if(!validBrand(brand)||!validTemplateKey(key))return res.status(404).json({message:"Unknown template"});
    const {subjectTemplate,bodyTemplate,expectedRevision}=req.body||{};
    const problem=validateTemplateEdit(subjectTemplate,bodyTemplate);
    if(problem)return res.status(400).json({message:problem});
    if(!Number.isInteger(expectedRevision)||expectedRevision<0)return res.status(400).json({message:"Expected revision required"});
    const actor=safeString((req.user as any)?.email || (req.user as any)?.id).slice(0,255);
    const client=await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[`email:${brand}:${key}`]);
      const old=await client.query("SELECT revision FROM email_template_overrides WHERE brand=$1 AND template_key=$2 FOR UPDATE",[brand,key]);
      const current=Number(old.rows[0]?.revision||0);
      if(current!==expectedRevision){
        await client.query("ROLLBACK");
        return res.status(409).json({message:"This template was edited by someone else. Refresh before saving.",currentRevision:current});
      }
      const revision=current+1;
      await client.query(`INSERT INTO email_template_overrides
        (brand,template_key,subject_template,body_template,revision,updated_by,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,NOW())
        ON CONFLICT(brand,template_key) DO UPDATE SET subject_template=EXCLUDED.subject_template,
        body_template=EXCLUDED.body_template,revision=EXCLUDED.revision,
        updated_by=EXCLUDED.updated_by,updated_at=NOW()`,
        [brand,key,subjectTemplate,bodyTemplate,revision,actor]);
      await client.query(`INSERT INTO email_template_revisions
        (brand,template_key,revision,subject_template,body_template,updated_by)
        VALUES($1,$2,$3,$4,$5,$6)`,[brand,key,revision,subjectTemplate,bodyTemplate,actor]);
      await client.query("COMMIT");
      return res.set("Cache-Control","no-store").json({success:true,revision});
    }catch(e) {
      await client.query("ROLLBACK").catch(()=>{});
      console.error("[Email templates] save failed",e instanceof Error?e.message:"unknown");
      return res.status(503).json({message:"Unable to save email template"});
    }finally {client.release();}
  });
}
