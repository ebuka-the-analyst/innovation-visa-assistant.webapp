import type { EmailBrand } from "./emailTemplateService";

export function messageDraft(key:string,brand:EmailBrand,description:string):string {
  const product=brand==="ifva"?"Innovator Founder Visa Assistant":"Visa Assistant Global";
  const drafts:Record<string,string>={
    verification:"Thank you for creating your "+product+" account.\n\nPlease verify your email address to activate your account.",
    welcome:"Welcome to "+product+". Your email address is now verified, and your account is ready. Explore the tools and features available in your membership.",
    password_reset:"We received a password reset request for your "+product+" account. If you did not make this request, you can ignore this email.",
    admin_verified:"Your "+product+" account has been verified by our team. You can now sign in.",
    bulk_welcome:"Thank you for joining "+product+". We look forward to supporting your preparation journey.",
    member_activated:"Your paid membership has been activated. See your membership details below.",
    member_renewed:"Your membership has renewed. Review the confirmed billing period below.",
    member_payment_failed:"We could not confirm your membership payment. Check the billing status in your dashboard.",
    member_cancelled:"Your membership has ended. Review your recorded access details below.",
    member_refunded:"A membership refund update is available. Review your payment details below.",
    member_disputed:"A membership payment requires review. Please contact support.",
    member_cancellation_scheduled:"Your membership is set to expire at the end of the current paid period.",
    payment_receipt:"Thank you for your purchase. Your transaction details are below.",
    plan_completed:"Your business plan is ready. Review the details and next steps below.",
    support_ack:"Thank you for contacting support. We have received your request.",
    support_request:"A new support request has been received. Review the details below.",
    expert_booking_confirmed:"Your consultation is confirmed. See your booking details below.",
    expert_booking_cancelled:"Your consultation has been cancelled. See the booking details below.",
  };
  return drafts[key]||"There is an update about your account. "+description+".";
}
export function editableSubject(brand:EmailBrand,key:string,defaultSubject:string):string {
  const product=brand==="ifva"?"Innovator Founder Visa Assistant":"Visa Assistant Global";
  if(key==="welcome")return "Welcome to "+product;
  if(key==="verification")return "Verify your email - "+product;
  if(key==="password_reset")return "Reset your password - "+product;
  return defaultSubject;
}
export function validateMessageDraft(value:unknown):string|null {
  if(typeof value!=="string" || value.trim().length<10 || value.length>12000)
    return "Write a message between 10 and 12,000 characters.";
  return null;
}
export function renderMessageDraft(message:string,recipientName?:string):string {
  const esc=(s:string)=>s.replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
  }[ch]||ch));
  const content=message.trim().split(/\n\s*\n/).map(p=>
    "<p style='margin:0 0 15px;line-height:1.6'>"+esc(p.trim()).replace(/\n/g,"<br>")+"</p>"
  ).join("");
  return "<div style='font-family:Arial,sans-serif;padding:24px;background:#f4f8ff;border-radius:8px'>"+
    "<p>Hi "+esc(recipientName||"there")+",</p>"+content+"</div>";
}
