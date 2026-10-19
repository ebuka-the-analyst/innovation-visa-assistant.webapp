import { dbPool } from "../db";

export type EmailBrand = "global" | "ifva";
export type EmailTemplateDefinition = {
  key: string;
  label: string;
  group: string;
  defaultSubject: string;
  description: string;
  trigger: "automatic" | "conditional" | "manual" | "template";
};

// All discoverable outgoing templates, including dormant helpers, are visible to admins.
// The shared sendEmail gateway maps individual messages onto this catalogue.
export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  ["verification", "Verify email address", "Account", "Verify your email address", "Email-and-password signup and resend", "automatic"],
  ["welcome", "Welcome after verification", "Account", "Welcome to your account", "After a successful verification", "automatic"],
  ["admin_verified", "Admin verified account", "Account", "Your account has been verified", "Admin manually verifies an account", "conditional"],
  ["password_reset", "Password reset", "Account", "Reset your password", "Password reset requests", "automatic"],
  ["bulk_welcome", "Bulk welcome", "Account", "Thank you for joining", "Admin-selected bulk welcome", "manual"],
  ["payment_receipt", "Payment receipt (legacy checkout)", "Membership", "Payment receipt", "Legacy checkout fulfilment only", "conditional"],
  ["member_activated", "Paid membership activated", "Membership", "Your membership is active", "Signed Stripe membership activation", "automatic"],
  ["member_renewed", "Membership renewed", "Membership", "Your membership has renewed", "Signed Stripe paid renewal", "automatic"],
  ["member_payment_failed", "Membership payment failed", "Membership", "Your membership payment needs attention", "Signed Stripe invoice failure", "automatic"],
  ["member_cancelled", "Membership ended", "Membership", "Your membership has ended", "Signed Stripe subscription deletion", "automatic"],
  ["member_refunded", "Membership refund", "Membership", "Your membership refund has been processed", "Signed Stripe refund", "automatic"],
  ["member_disputed", "Membership payment review", "Membership", "Your membership needs attention", "Signed Stripe charge dispute", "automatic"],
  ["member_cancellation_scheduled", "Cancellation scheduled", "Membership", "Your membership will not renew", "Customer scheduled cancellation", "automatic"],
  ["plan_completed", "Business plan ready", "Business plan", "Your business plan is ready", "Business plan generation worker", "automatic"],
  ["upgrade_reminder", "Membership upgrade reminder", "Engagement", "Unlock additional membership features", "Optional upgrade reminder helper", "template"],
  ["weekly_progress", "Weekly preparation progress", "Engagement", "Your weekly progress report", "Optional weekly progress helper", "template"],
  ["digest", "Visa progress digest", "Engagement", "Your visa journey progress update", "Scheduled from user preferences", "conditional"],
  ["deadline_reminder", "Deadline reminder", "Engagement", "Upcoming deadline", "Scheduled deadline reminder", "conditional"],
  ["breaking_news", "Breaking news alert", "Engagement", "Important visa news", "Scheduled relevant news alert", "conditional"],
  ["tool_completion", "Tool completed", "Engagement", "Tool completed", "Scheduled tool completion notification", "conditional"],
  ["achievement", "Achievement unlocked", "Engagement", "Achievement unlocked", "Scheduled achievement notification", "conditional"],
  ["milestone", "Progress milestone", "Engagement", "Progress milestone reached", "Scheduled progress milestone", "conditional"],
  ["support_request", "Support request to team", "Support", "New support request", "Customer opened a support ticket", "automatic"],
  ["support_ack", "Support request acknowledgement", "Support", "We received your support request", "Customer opened a support ticket", "automatic"],
  ["referral_signup", "Referral sign-up", "Referrals", "Your referral joined", "Invitee joined with referral code", "conditional"],
  ["referral_purchase", "Referral purchase reward", "Referrals", "A referral reward was earned", "Optional referral purchase helper", "template"],
  ["referral_reward", "Referral earnings", "Referrals", "You've earned a referral reward", "Qualifying legacy purchase", "conditional"],
  ["promo_reward", "Promo code reward", "Referrals", "Your promotion reward", "Optional promotional reward helper", "template"],
  ["reward_approved", "Referral reward approved", "Referrals", "Your referral reward was approved", "Optional reward approval helper", "template"],
  ["reward_rejected", "Referral reward rejected", "Referrals", "Update about your referral reward", "Optional reward decision helper", "template"],
  ["payout_request", "Payout request for admin", "Referrals", "New payout request", "Referrer requested a payout", "automatic"],
  ["payout_completed", "Payout completed", "Referrals", "Your payout was completed", "Admin recorded payout completion", "automatic"],
  ["payout_rejected", "Payout rejected", "Referrals", "Update about your payout", "Admin rejected payout", "automatic"],
  ["expert_application_received", "Expert application received", "Expert Support", "We received your expert profile", "Expert submitted an application", "automatic"],
  ["expert_application_reviewed", "Expert application decision", "Expert Support", "Your expert profile has been reviewed", "Admin reviewed professional application", "automatic"],
  ["expert_admin_application", "New expert application alert", "Expert Support", "New expert application", "Expert application received; admin address required", "conditional"],
  ["expert_profile", "Expert profile update", "Expert Support", "Update to your expert profile", "Professional profile update", "conditional"],
  ["expert_admin", "Expert network admin alert", "Expert Support", "Expert network update", "Expert network operational event", "conditional"],
  ["expert_booking_pending", "Expert booking awaiting payment", "Expert Support", "Complete payment for your consultation", "A consultation slot is pending payment", "conditional"],
  ["expert_booking_confirmed", "Expert consultation confirmed", "Expert Support", "Your consultation is confirmed", "Signed paid consultation booking", "conditional"],
  ["expert_booking_updated", "Expert consultation updated", "Expert Support", "Your consultation meeting was updated", "Meeting link or time updated", "conditional"],
  ["expert_booking_cancelled", "Expert consultation cancelled", "Expert Support", "Your consultation was cancelled", "Booking cancelled", "conditional"],
  ["expert_booking_completed", "Expert consultation completed", "Expert Support", "Your consultation is complete", "Session completed", "conditional"],
  ["expert_booking_no_show", "Expert consultation no-show", "Expert Support", "Update about your consultation", "No-show recorded", "conditional"],
  ["expert_booking_payment_failed", "Expert consultation payment failed", "Expert Support", "Consultation payment was not completed", "Failed consultation payment", "conditional"],
  ["expert_booking_other", "Expert booking notification", "Expert Support", "Consultation booking update", "Professional and admin booking messages", "conditional"],
  ["broadcast", "Admin broadcast", "Communications", "Platform announcement", "Admin sends targeted message", "manual"],
  ["test", "Admin delivery test", "Communications", "Email test", "Admin tests the email provider", "manual"],
  ["system", "Other system notification", "Communications", "Important account update", "Any unclassified system email", "conditional"],
].map(([key,label,group,defaultSubject,description,trigger]) => ({
  key,label,group,defaultSubject,description,trigger: trigger as EmailTemplateDefinition["trigger"],
}));

const templateKeys = new Set(EMAIL_TEMPLATES.map(item => item.key));
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] || c));

export function emailBrand(env: NodeJS.ProcessEnv = process.env): EmailBrand {
  if (env.EMAIL_BRAND === "global" || env.EMAIL_BRAND === "ifva") return env.EMAIL_BRAND;
  const service = (env.RAILWAY_SERVICE_NAME || "").toLowerCase();
  if (service.includes("visaassistant-global")) return "global";
  if (service.includes("innovation-visa-assistant")) return "ifva";
  const url = (env.BASE_URL || "").toLowerCase();
  if (url.includes("innovatorfoundervisaassistant.co.uk")) return "ifva";
  if (url.includes("visaassistant.global")) return "global";
  return "ifva"; // Historical single-service default, not based on email sender.
}

export function templateKey(emailType: string | undefined, subject: string): string {
  const type = String(emailType || "").trim().toLowerCase();
  if (templateKeys.has(type)) return type;
  const s = subject.toLowerCase();
  if (type === "expert_network_application") return s.includes("new expert application") ? "expert_admin_application" : s.includes("received") ? "expert_application_received" : "expert_application_reviewed";
  if (type === "expert_network") return s.includes("[expert network]") ? "expert_admin" : "expert_profile";
  if (type === "expert_booking") return s.includes("new consultation booking") ? "expert_booking_other" : "expert_booking_confirmed";
  if (type === "broadcast") return "broadcast";
  if (s.includes("verification") || s.includes("verify your email")) return "verification";
  if (s.includes("password reset")) return "password_reset";
  if (s.includes("verified") && s.includes("account")) return "admin_verified";
  if (s.includes("your business plan is ready")) return "plan_completed";
  if (s.includes("new referral signup")) return "referral_signup";
  if (s.includes("referral reward earned")) return "referral_purchase";
  if (s.includes("reward has been approved")) return "reward_approved";
  if (s.includes("reward update")) return "reward_rejected";
  if (s.includes("payout request:")) return "payout_request";
  if (s.includes("payout completed:")) return "payout_completed";
  if (s.includes("payout update:")) return "payout_rejected";
  if (s.startsWith("[support]")) return "support_request";
  if (s.includes("support request received")) return "support_ack";
  if (s.includes("unlock more tools")) return "upgrade_reminder";
  if (s.includes("weekly visa prep")) return "weekly_progress";
  if (s.includes("deadline")) return "deadline_reminder";
  if (s.includes("referral!")) return "referral_reward";
  if (s.includes("promo code")) return "promo_reward";
  return "system";
}

export function normaliseEmailBrand(subject: string, html: string, brand: EmailBrand) {
  const product = brand === "global" ? "Visa Assistant Global" : "Innovator Founder Visa Assistant";
  const support = brand === "global" ? "support@visaassistant.global" : "support@innovatorfoundervisaassistant.co.uk";
  let updatedSubject = subject
    .replace(/UK Innovator Founder Visa Assistant/gi, product)
    .replace(/Innovator Founder Visa Assistant/gi, product);
  let updatedHtml = html
    .replace(/Thank you for signing up! You(?:'|&#39;)re one step closer to your UK Innovator Founder Visa journey\./gi,
      brand === "global"
        ? "Thank you for signing up. Your global visa preparation journey starts here."
        : "Thank you for signing up. Your UK Innovator Founder Visa preparation journey starts here.")
    .replace(/Welcome to Visa Assistant Global/g, "Welcome to " + product)
    .replace(/support@(?:visaassistant\.global|innovatorfoundervisaassistant\.co\.uk)/gi, support);
  if (brand === "global") {
    updatedHtml = updatedHtml
      .replace(/UK Innovator Founder Visa Assistant/gi, product)
      .replace(/Innovator Founder Visa Assistant/gi, product);
  } else {
    updatedHtml = updatedHtml.replace(/© (\$\{new Date\(\)\.getFullYear\(\)\}|\d{4}) Visa Assistant Global/g, "© $1 " + product + " · Powered by Visa Assistant Global");
  }
  return {subject:updatedSubject,html:updatedHtml};
}

// The original HTML remains the source of secure, event-specific links and order details.
// Admins can wrap or replace its presentation without altering verification tokens.
export const DEFAULT_SUBJECT_TEMPLATE = "{{subject}}";
export const DEFAULT_BODY_TEMPLATE = "{{body}}";

export function renderEmailTemplate(input: {subject:string;html:string;subjectTemplate:string;bodyTemplate:string;recipientName?:string}) {
  const vars: Record<string,string> = {
    subject: input.subject, body: input.html,
    recipient_name: escapeHtml(input.recipientName || "there"),
  };
  const replace = (template:string) => template.replace(/{{(subject|body|recipient_name)}}/g, (_m,key:string) => vars[key]);
  return {subject:replace(input.subjectTemplate).replace(/[\r\n]/g," ").slice(0,350),html:replace(input.bodyTemplate)};
}

export function validateTemplateEdit(subjectTemplate: unknown,bodyTemplate: unknown) {
  if (typeof subjectTemplate !== "string" || !subjectTemplate.trim() || subjectTemplate.length > 500) return "Subject must contain 1–500 characters.";
  if (typeof bodyTemplate !== "string" || !bodyTemplate.includes("{{body}}") || bodyTemplate.length > 100000) return "HTML template must include {{body}} to preserve secure links, paid amounts and other event-specific details (maximum 100,000 characters).";
  if (/<\s*(script|iframe|object|form|meta|base)\b/i.test(bodyTemplate) || /\son\w+\s*=/i.test(bodyTemplate) || /javascript\s*:/i.test(bodyTemplate)) return "Active HTML or JavaScript is not allowed.";
  if (/{{(?!body|subject|recipient_name)[^}]+}}/.test(subjectTemplate + bodyTemplate)) return "Unsupported variable. Use {{subject}}, {{body}} or {{recipient_name}}.";
  return null;
}

export async function composeEmail(input:{subject:string;html:string;emailType?:string;recipientName?:string}) {
  const brand=emailBrand();
  const key=templateKey(input.emailType,input.subject);
  const base=normaliseEmailBrand(input.subject,input.html,brand);
  try {
    const result=await dbPool.query(
      "SELECT subject_template, body_template FROM email_template_overrides WHERE brand=$1 AND template_key=$2 LIMIT 1",
      [brand,key],
    );
    const edited=result.rows[0];
    if (edited) return {...renderEmailTemplate({...base,subjectTemplate:edited.subject_template,bodyTemplate:edited.body_template,recipientName:input.recipientName}),brand,key};
  } catch (err) {
    console.error("[Email templates] Override lookup unavailable; using safe built-in template",err instanceof Error?err.message:"unknown");
  }
  return {...base,brand,key};
}
