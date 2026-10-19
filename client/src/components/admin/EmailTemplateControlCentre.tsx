import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock, FileCode2, History, Mail, RefreshCw, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Brand = "global" | "ifva";
type CopyEdit = {find:string;replace:string};
interface Template {
  brand:Brand;key:string;label:string;group:string;description:string;
  trigger:string;defaultSubject:string;subjectTemplate:string;bodyTemplate:string;
  revision:number;custom:boolean;updatedBy:string|null;updatedAt:string|null;contentReplacements:CopyEdit[];
}
interface Catalogue{items:Template[];activeBrand:Brand;variables:string[]}
interface Delivery {
  id:string;recipientEmail:string;subject:string;emailType:string;status:string;
  provider:string|null;messageId:string|null;errorMessage:string|null;sentAt:string;
}
interface Revision {revision:number;subjectTemplate:string;bodyTemplate:string;contentReplacements:CopyEdit[];updatedBy:string|null;updatedAt:string}
const fetchJson=async(path:string)=> {
  const response=await fetch(path,{credentials:"include",cache:"no-store"});
  if(!response.ok)throw new Error("Unable to load email administration data");
  return response.json();
};
const labelBrand=(brand:Brand)=>brand==="ifva"?"Innovator Founder Visa Assistant":"Visa Assistant Global";


/** Existing customer-facing paragraph, after server-side brand normalisation. */
function editableParagraph(brand:Brand,key:string):string {
  const product=labelBrand(brand);
  const values:Record<string,string>={
    verification: brand==="global"
      ? "Thank you for signing up. Your global visa preparation journey starts here."
      : "Thank you for signing up. Your UK Innovator Founder Visa preparation journey starts here.",
    password_reset:"We received a request to reset your password for your "+product+" account.",
    welcome:"Congratulations! Your email is now verified. You can access the features included in your current plan.",
    admin_verified:"Great news! Your account has been verified by our team. You can now access the features included in your current plan.",
    bulk_welcome:"We're honoured to have you as part of our growing community.",
  };
  return values[key]||"";
}
function readableSubject(brand:Brand,key:string,defaultSubject:string) {
  if(key==="welcome")return "Welcome to "+labelBrand(brand);
  if(key==="verification")return "Verify your email - "+labelBrand(brand);
  if(key==="password_reset")return "Reset your password - "+labelBrand(brand);
  return defaultSubject.replace(/UK Innovator Founder Visa Assistant|Visa Assistant Global/gi,labelBrand(brand));
}
const editorStart="<!-- EMAIL_EDITOR_MESSAGE -->";
const editorEnd="<!-- END_EMAIL_EDITOR_MESSAGE -->";
function decodeHtml(s:string) {return s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&");}
function htmlEscape(s:string) {return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));}
function safeIntro(value:string) {
  return editorStart+'<div style="font:15px/1.65 Arial,sans-serif;margin:20px 0">'+
    htmlEscape(value.trim()).replace(/\r?\n/g,"<br>")+'</div>'+editorEnd;
}
function extractIntro(value:string) {
  const start=value.indexOf(editorStart),end=value.indexOf(editorEnd,start+editorStart.length);
  if(start<0||end<0)return "";
  return decodeHtml(value.slice(start+editorStart.length,end).replace(/^<div[^>]*>/,"").replace(/<\/div>$/,"").replace(/<br\s*\/?>/gi,"\n"));
}
function buildEditorPayload(selected:Template,brand:Brand,subjectText:string,messageText:string,advancedBody:string,rules:CopyEdit[]) {
  const existing=editableParagraph(brand,selected.key);
  const newRules=rules.filter(rule=>rule.find.trim()&&rule.find!==existing);
  if(existing && messageText.trim()!==existing) newRules.push({find:existing,replace:messageText.trim()});
  const originalBody=advancedBody.replace(/<!-- EMAIL_EDITOR_MESSAGE -->[\s\S]*?<!-- END_EMAIL_EDITOR_MESSAGE -->/g,"");
  const body=existing ? originalBody : ((messageText.trim()?safeIntro(messageText):"")+originalBody);
  const displaySubject=readableSubject(brand,selected.key,selected.defaultSubject);
  return {
    subjectTemplate: subjectText.trim()===displaySubject ? "{{subject}}" : subjectText.trim(),
    bodyTemplate:body,contentReplacements:newRules,expectedRevision:selected.revision,
  };
}

export function EmailTemplateControlCentre(){
  const {toast}=useToast();
  const {data,refetch,isLoading,isError}=useQuery<Catalogue>({
    queryKey:["/api/admin/email-templates"],
    queryFn:()=>fetchJson("/api/admin/email-templates"),
    staleTime:0,
  });
  const [brand,setBrand]=useState<Brand>("ifva");
  const initialisedBrand=useRef(false);
  const [key,setKey]=useState("verification");
  const [search,setSearch]=useState("");
  const [subject,setSubject]=useState("");
  const [message,setMessage]=useState("");
  const [body,setBody]=useState("{{body}}");
  const [copyEdits,setCopyEdits]=useState<CopyEdit[]>([]);
  const [busy,setBusy]=useState(false);
  const [preview,setPreview]=useState<{subject:string;html:string}|null>(null);
  const [history,setHistory]=useState<Revision[]|null>(null);
  const [showLog,setShowLog]=useState(false);
  const [log,setLog]=useState<Delivery[]>([]);
  const [logOffset,setLogOffset]=useState(0);
  const [logError,setLogError]=useState("");
  const selected=data?.items.find(x=>x.brand===brand && x.key===key);
  useEffect(()=>{
    if(data?.activeBrand && !initialisedBrand.current){setBrand(data.activeBrand);initialisedBrand.current=true;}
  },[data?.activeBrand]);
  useEffect(()=>{
    if(!selected)return;
    const displaySubject=readableSubject(brand,key,selected.defaultSubject);
    setSubject(selected.subjectTemplate==="{{subject}}"?displaySubject:selected.subjectTemplate);
    setBody(selected.bodyTemplate);
    const source=editableParagraph(brand,key);
    const existingRule=(selected.contentReplacements||[]).find(r=>r.find===source);
    setMessage(source ? (existingRule?.replace??source) : extractIntro(selected.bodyTemplate));
    setCopyEdits((selected.contentReplacements||[]).filter(r=>r.find!==source));
    setPreview(null);setHistory(null);
  },[brand,key,selected?.revision,selected?.subjectTemplate,selected?.bodyTemplate]);
  const list=useMemo(()=>data?.items.filter(t=>t.brand===brand && (
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.group.toLowerCase().includes(search.toLowerCase()) ||
    t.key.toLowerCase().includes(search.toLowerCase())
  ))||[],[data,brand,search]);
  const draft=selected?buildEditorPayload(selected,brand,subject,message,body,copyEdits):null;
  const dirty=!!selected && !!draft && (selected.subjectTemplate!==draft.subjectTemplate||
    selected.bodyTemplate!==draft.bodyTemplate||JSON.stringify(selected.contentReplacements||[])!==JSON.stringify(draft.contentReplacements));

  async function save(){
    if(!selected)return;
    setBusy(true);
    try{
      const response=await fetch(`/api/admin/email-templates/${brand}/${key}`,{
        method:"PUT",credentials:"include",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(draft),
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.message || "Unable to save template");
      toast({title:"Template saved",description:`Revision ${payload.revision} is now active for ${labelBrand(brand)}.`});
      await refetch();
    }catch(e){toast({title:"Save failed",description:e instanceof Error?e.message:"Unable to save",variant:"destructive"});}
    finally{setBusy(false);}
  }
  async function showPreview(){
    setBusy(true);
    try{
      const response=await fetch(`/api/admin/email-templates/${brand}/${key}/preview`,{
        method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...draft,expectedRevision:undefined}),
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.message || "Preview unavailable");
      // Show edited copy using dummy account data. Never reveal live tokens.
      const explanation=editableParagraph(brand,key)
        ? "Secure links and account-specific details are retained by the application."
        : "Original account-specific content is appended automatically.";
      const sample=(message.trim()||"Original message text is unchanged.");
      const safe="<div style='font-family:Arial,sans-serif;padding:24px'><h2>"+
        htmlEscape(labelBrand(brand))+"</h2><p>Hi Example Founder,</p><p>"+
        htmlEscape(sample).replace(/\r?\n/g,"<br>")+
        "</p><hr><p style='color:#64748b'>"+htmlEscape(explanation)+"</p></div>";
      setPreview({subject:subject||payload.subject,html:safe});
    }catch(e){toast({title:"Preview failed",description:e instanceof Error?e.message:"Unavailable",variant:"destructive"});}
    finally{setBusy(false);}
  }
  async function loadHistory(){
    if(!selected)return;
    try{
      const result=await fetchJson(`/api/admin/email-templates/${brand}/${key}/history`);
      setHistory(result.items);
    }catch(e){toast({title:"History unavailable",variant:"destructive"});}
  }
  async function loadLog(offset=0){
    try{
      setLogError("");
      const result=await fetchJson(`/api/admin/email-templates/delivery-log?limit=40&offset=${offset}`);
      setLog(result.items);setLogOffset(offset);setShowLog(true);
    }catch(e){setLogError("Delivery history could not be retrieved.");setShowLog(true);}
  }
  return <section className="space-y-4" data-testid="admin-email-template-control">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Email Template Control Centre</h2>
        <p className="text-sm text-muted-foreground">Review and edit outgoing messages for both platforms. Changes affect future emails only, not previously sent messages.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={()=>void loadLog()}><Mail className="mr-2 h-4 w-4"/>Delivery history</Button>
        <Button variant="outline" onClick={()=>void refetch()}><RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button>
      </div>
    </header>
    <div className="rounded-lg border bg-muted/30 p-3 text-xs">
      <strong>How editing works:</strong> Open a template, write your subject and message, preview, then save.
      The original verification buttons, payment references and personalised account details are kept by the system.
      For other templates, your message appears above the preserved event information.
    </div>
    {isLoading && <p className="text-sm">Loading templates…</p>}
    {isError && <p className="text-sm text-destructive">Unable to load the template library. Please retry.</p>}
    {data && <>
      <div className="flex flex-wrap gap-2">
        {(["ifva","global"] as const).map(b=><Button key={b} variant={brand===b?"default":"outline"} onClick={()=>setBrand(b)} size="sm">
          {labelBrand(b)} {b===data.activeBrand?"(this service)":""}
        </Button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[285px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-sm">{list.length} available templates</CardTitle>
            <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/><Input aria-label="Search templates" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or category" className="pl-8"/></div>
          </CardHeader>
          <CardContent className="max-h-[640px] space-y-1 overflow-y-auto">
            {list.map(t=><button key={t.key} type="button" onClick={()=>{if(dirty&&!window.confirm("Discard your unsaved changes?"))return;setKey(t.key);}}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent ${key===t.key?"border-primary bg-primary/5":"border-transparent"}`} data-testid={`template-${t.brand}-${t.key}`}>
              <div className="flex items-center justify-between gap-2"><span className="font-medium">{t.label}</span>{t.custom&&<Badge variant="secondary">Edited</Badge>}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.group} · {t.trigger}</div>
            </button>)}
          </CardContent>
        </Card>
        {selected && <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base"><FileCode2 className="h-4 w-4"/>{selected.label}
              <Badge variant="outline">Revision {selected.revision||"default"}</Badge></CardTitle>
            <CardDescription>{selected.description}. <strong>Brand:</strong> {labelBrand(brand)}.</CardDescription>
            {selected.updatedAt&&<p className="text-xs text-muted-foreground">Last edited {new Date(selected.updatedAt).toLocaleString("en-GB")} by {selected.updatedBy||"administrator"}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div><label className="mb-1 block text-sm font-medium" htmlFor="template-subject">Email subject</label>
              <Input id="template-subject" value={subject} onChange={e=>setSubject(e.target.value)} maxLength={500} data-testid="template-editor-subject"/>
            </div>
            <div><label className="mb-1 block text-sm font-medium" htmlFor="template-message">Email message</label>
              <Textarea id="template-message" value={message} onChange={e=>setMessage(e.target.value)} rows={9} maxLength={2000}
                placeholder="Write the message your customer should read..." data-testid="template-editor-message"/>
              <p className="mt-1 text-xs text-muted-foreground">
                {editableParagraph(brand,key)
                  ? "You can replace this message text directly. The secure action buttons and account details remain intact."
                  : "Your message is added above the original event-specific details, which remain protected."}
              </p>
            </div>
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">Advanced HTML and wording rules (optional)</summary>
              <p className="mt-2 text-xs text-muted-foreground">For technical adjustments only. Keep the original body placeholder to preserve transactional links.</p>
              <Textarea aria-label="Advanced HTML template" value={body} onChange={e=>setBody(e.target.value)} rows={7} className="mt-3 font-mono text-xs" data-testid="template-editor-body"/>
            </details>
            <details className="space-y-2 rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">Advanced find-and-replace rules</summary>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="text-sm font-semibold">Edit text inside the original message</p>
                  <p className="text-xs text-muted-foreground">Find existing plain text and replace it in future emails. This leaves secure HTML, payment amounts and private links intact. Exact phrases are case-sensitive.</p></div>
                <Button size="sm" variant="outline" disabled={copyEdits.length>=12} onClick={()=>setCopyEdits(v=>[...v,{find:"",replace:""}])}>Add wording change</Button>
              </div>
              {copyEdits.map((rule,index)=><div key={index} className="grid gap-2 rounded border p-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input aria-label={`Existing phrase ${index+1}`} placeholder="Existing wording" value={rule.find} onChange={e=>setCopyEdits(v=>v.map((r,i)=>i===index?{...r,find:e.target.value}:r))} />
                <Input aria-label={`Replacement phrase ${index+1}`} placeholder="Replacement wording" value={rule.replace} onChange={e=>setCopyEdits(v=>v.map((r,i)=>i===index?{...r,replace:e.target.value}:r))}/>
                <Button size="sm" variant="outline" onClick={()=>setCopyEdits(v=>v.filter((_r,i)=>i!==index))}>Remove</Button>
              </div>)}
            </details>
            <div className="flex flex-wrap gap-2">
              <Button onClick={()=>void save()} disabled={busy||!dirty}><Save className="mr-2 h-4 w-4"/>Save changes</Button>
              <Button variant="outline" onClick={()=>void showPreview()} disabled={busy}>Preview (no send)</Button>
              <Button variant="outline" onClick={()=>void loadHistory()}><History className="mr-2 h-4 w-4"/>History</Button>
              <Button variant="outline" onClick={()=>{setSubject(readableSubject(brand,key,selected.defaultSubject));setMessage(editableParagraph(brand,key));setBody("{{body}}");setCopyEdits([]);setPreview(null);}}>Restore default draft</Button>
            </div>
            {preview&&<div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">Preview only · {preview.subject}</p>
              <iframe title="Safe email template preview" sandbox="" srcDoc={preview.html} className="h-72 w-full rounded border bg-white"/>
            </div>}
            {history&&<div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">Revision history (last 40)</p>
              {history.length===0&&<p className="text-xs text-muted-foreground">This template has not yet been edited.</p>}
              {history.map(h=><div key={h.revision} className="flex items-center justify-between gap-2 rounded border p-2 text-xs">
                <span>Revision {h.revision} · {new Date(h.updatedAt).toLocaleString("en-GB")} · {h.updatedBy||"admin"}</span>
                <Button size="sm" variant="outline" onClick={()=>{setSubject(h.subjectTemplate==="{{subject}}"?readableSubject(brand,key,selected.defaultSubject):h.subjectTemplate);
                  setBody(h.bodyTemplate);
                  const phrase=editableParagraph(brand,key);
                  const known=(h.contentReplacements||[]).find(r=>r.find===phrase);
                  setMessage(phrase ? (known?.replace??phrase):extractIntro(h.bodyTemplate));
                  setCopyEdits((h.contentReplacements||[]).filter(r=>r.find!==phrase));
                  setPreview(null);}}>Load as draft</Button>
              </div>)}
            </div>}
          </CardContent>
        </Card>}
      </div>
    </>}
    {showLog&&<Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4"/>Recent email delivery attempts</CardTitle>
        <CardDescription>Sent means accepted by the provider, not necessarily delivered to the inbox. Verification tokens and email bodies are not stored here.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {logError&&<p className="text-sm text-destructive">{logError}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs">
          <thead><tr className="border-b"><th className="p-2">Recipient</th><th className="p-2">Subject</th><th className="p-2">Type</th><th className="p-2">Status</th><th className="p-2">Time</th></tr></thead>
          <tbody>{log.map(x=><tr className="border-b" key={x.id}>
            <td className="p-2">{x.recipientEmail}</td><td className="p-2">{x.subject}</td>
            <td className="p-2">{x.emailType}</td><td className="p-2">
              <span className="inline-flex items-center gap-1">{x.status==="failed"?<AlertTriangle className="h-3 w-3"/>:<CheckCircle2 className="h-3 w-3"/>}{x.status}</span>
              {x.errorMessage&&<p className="mt-1 max-w-56 text-muted-foreground">{x.errorMessage}</p>}</td>
            <td className="p-2">{new Date(x.sentAt).toLocaleString("en-GB")}</td>
          </tr>)}</tbody>
        </table></div>
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={logOffset===0} onClick={()=>void loadLog(Math.max(0,logOffset-40))}>Previous</Button><Button variant="outline" disabled={log.length<40} onClick={()=>void loadLog(logOffset+40)}>Next</Button></div>
      </CardContent>
    </Card>}
  </section>;
}
