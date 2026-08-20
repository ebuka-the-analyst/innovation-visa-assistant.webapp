const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (relative) => path.join(root, relative);

function update(relative, transform) {
  const target = file(relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-form-validation] prepared ${relative}`);
  }
}

update('server/expertApplicationRoutes.ts', (source) => {
  let next = source;

  const brokenReusableSchema = `const consultationServiceSchema = z.object({\n  services: z.array(consultationServiceSchema).min(1).max(8),\n});`;
  const correctReusableSchema = `const consultationServiceSchema = z.object({\n  serviceName: z.string().trim().min(3).max(160),\n  serviceDescription: z.string().trim().min(20).max(2000),\n  durationMinutes: z.number().int().min(15).max(360),\n  pricePounds: z.number().min(0).max(5000),\n  preparationNote: z.string().trim().max(3000).optional().default(""),\n});`;
  if (next.includes(brokenReusableSchema)) next = next.replace(brokenReusableSchema, correctReusableSchema);

  const applicationStart = next.indexOf('const applicationSchema = z.object({');
  const applicationEnd = applicationStart >= 0 ? next.indexOf('\n});', applicationStart) : -1;
  if (applicationStart < 0 || applicationEnd < 0) throw new Error('Could not locate expert application schema');

  const applicationBlock = next.slice(applicationStart, applicationEnd + 4);
  const legacyServiceFields = `  serviceName: z.string().trim().min(3).max(160),\n  serviceDescription: z.string().trim().min(20).max(2000),\n  durationMinutes: z.number().int().min(15).max(360),\n  pricePounds: z.number().min(0).max(5000),\n  preparationNote: z.string().trim().max(3000).optional().default(""),`;
  if (applicationBlock.includes(legacyServiceFields)) {
    const repairedBlock = applicationBlock.replace(legacyServiceFields, '  services: z.array(consultationServiceSchema).min(1).max(8),');
    next = next.slice(0, applicationStart) + repairedBlock + next.slice(applicationEnd + 4);
  }

  const genericParseFailure = `    if (!parsed.success) {\n      return res.status(400).json({ error: "Please complete all required profile, consultation and availability fields." });\n    }`;
  if (next.includes(genericParseFailure)) {
    next = next.replace(genericParseFailure, `    if (!parsed.success) {\n      const fieldErrors = parsed.error.issues.map((issue) => ({\n        path: issue.path.join("."),\n        message: issue.message,\n        code: issue.code,\n      }));\n      return res.status(400).json({ error: "Please review the fields highlighted below.", fieldErrors });\n    }`);
  }

  return next;
});

update('client/src/pages/expert-join.tsx', (source) => {
  let next = source;

  const oldJsonFailure = '  if (!response.ok) throw new Error(payload.error || payload.message || "Request failed");';
  if (next.includes(oldJsonFailure)) {
    next = next.replace(oldJsonFailure, `  if (!response.ok) {\n    const error: any = new Error(payload.error || payload.message || "Request failed");\n    error.fieldErrors = Array.isArray(payload.fieldErrors) ? payload.fieldErrors : [];\n    throw error;\n  }`);
  }

  if (!next.includes('type ValidationIssue =')) {
    const anchor = 'type ConsultationServiceForm = {';
    if (!next.includes(anchor)) throw new Error('Could not locate consultation form type');
    const validationType = `type ValidationIssue = { path: string; label: string; message: string };\n\nfunction validationLabel(path: string): string {\n  const serviceMatch = path.match(/^services\\.(\\d+)\\.(serviceName|serviceDescription|durationMinutes|pricePounds|preparationNote)$/);\n  if (serviceMatch) {\n    const number = Number(serviceMatch[1]) + 1;\n    const labels: Record<string, string> = { serviceName: "consultation name", serviceDescription: "consultation description", durationMinutes: "duration", pricePounds: "consultation fee", preparationNote: "preparation note" };\n    return \`Consultation \${number}: \${labels[serviceMatch[2]] || serviceMatch[2]}\`;\n  }\n  const labels: Record<string, string> = { firstName: "First name", lastName: "Last name", email: "Professional email", phone: "Phone number", profileImageUrl: "Professional photo", publicTitle: "Public professional title", publicBio: "Public biography", firmName: "Firm / organisation", regulatorType: "Regulatory status", sraNumber: "SRA number", iaaRegistrationNumber: "IAA / OISC registration number", iaaLevel: "IAA / OISC level", yearsExperience: "Years of professional experience", specializations: "Practice areas / specialisms", timezone: "Time zone", meetingMode: "Meeting format", bookingNoticeHours: "Minimum notice", bookingHorizonDays: "Booking horizon", slotIntervalMinutes: "Slot interval", bufferMinutes: "Buffer between bookings", weekdays: "Days available", startTime: "Start time", endTime: "End time", accuracyConfirmed: "Information accuracy confirmation", displayConsent: "Permission to display professional details", services: "Consultation services" };\n  return labels[path] || path || "Form field";\n}\n\n`;
    next = next.replace(anchor, validationType + anchor);
  }

  if (!next.includes('const [validationIssues, setValidationIssues]')) {
    const anchor = '  const [submitted, setSubmitted] = useState(false);';
    if (!next.includes(anchor)) throw new Error('Could not locate submitted state');
    next = next.replace(anchor, `${anchor}\n  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);`);
  }

  if (!next.includes('const collectValidationIssues = (): ValidationIssue[] =>')) {
    const anchor = '  const submitMutation = useMutation({';
    if (!next.includes(anchor)) throw new Error('Could not locate submit mutation');
    const validator = `  const collectValidationIssues = (): ValidationIssue[] => {\n    const issues: ValidationIssue[] = [];\n    const add = (path: string, message: string) => issues.push({ path, label: validationLabel(path), message });\n    const text = (value: unknown) => String(value ?? "").trim();\n    if (!text(form.firstName)) add("firstName", "Enter your first name.");\n    if (!text(form.lastName)) add("lastName", "Enter your last name.");\n    if (!/^\\S+@\\S+\\.\\S+$/.test(text(form.email))) add("email", "Enter a valid professional email address.");\n    if (text(form.publicTitle).length < 3) add("publicTitle", "Enter a professional title of at least 3 characters.");\n    if (text(form.publicBio).length < 40) add("publicBio", "Add at least 40 characters to your public biography.");\n    if (text(form.publicBio).length > 4000) add("publicBio", "Keep your public biography under 4,000 characters.");\n    const years = Number(form.yearsExperience);\n    if (form.yearsExperience === "" || !Number.isInteger(years) || years < 0 || years > 80) add("yearsExperience", "Enter years of experience between 0 and 80.");\n    const specializations = form.specializations.split(",").map((item) => item.trim()).filter(Boolean);\n    if (!specializations.length) add("specializations", "Add at least one practice area or specialism.");\n    if (specializations.some((item) => item.length < 2 || item.length > 100)) add("specializations", "Each specialism must be between 2 and 100 characters.");\n    if ((form.regulatorType === "sra" || form.regulatorType === "both") && !text(form.sraNumber)) add("sraNumber", "Enter your SRA number.");\n    if ((form.regulatorType === "iaa" || form.regulatorType === "both") && !text(form.iaaRegistrationNumber)) add("iaaRegistrationNumber", "Enter your IAA / OISC registration number.");\n    if (!Array.isArray(form.services) || !form.services.length) add("services", "Add at least one consultation service.");\n    else form.services.forEach((service, index) => {\n      const prefix = \`services.\${index}\`;\n      if (text(service.serviceName).length < 3) add(\`\${prefix}.serviceName\`, "Enter a consultation name of at least 3 characters.");\n      if (text(service.serviceDescription).length < 20) add(\`\${prefix}.serviceDescription\`, "Add at least 20 characters describing this consultation.");\n      const duration = Number(service.durationMinutes);\n      if (!Number.isInteger(duration) || duration < 15 || duration > 360) add(\`\${prefix}.durationMinutes\`, "Choose a valid consultation duration.");\n      const price = Number(service.pricePounds);\n      if (service.pricePounds === "" || !Number.isFinite(price) || price < 0 || price > 5000) add(\`\${prefix}.pricePounds\`, "Enter a consultation fee between £0 and £5,000.");\n      if (text(service.preparationNote).length > 3000) add(\`\${prefix}.preparationNote\`, "Keep the preparation note under 3,000 characters.");\n    });\n    if (!form.weekdays.length) add("weekdays", "Select at least one day you are available.");\n    if (!text(form.timezone)) add("timezone", "Enter your time zone.");\n    if (!text(form.startTime)) add("startTime", "Choose a start time.");\n    if (!text(form.endTime)) add("endTime", "Choose an end time.");\n    if (text(form.startTime) && text(form.endTime) && form.endTime <= form.startTime) add("endTime", "End time must be after start time.");\n    if (!form.accuracyConfirmed) add("accuracyConfirmed", "Confirm that the information is accurate.");\n    if (!form.displayConsent) add("displayConsent", "Give permission for the professional details to be displayed.");\n    return issues;\n  };\n\n  const showValidationIssues = (issues: ValidationIssue[]) => {\n    setValidationIssues(issues);\n    window.setTimeout(() => document.getElementById("expert-form-errors")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);\n  };\n\n`;
    next = next.replace(anchor, validator + anchor);
  }

  const oldOnError = `    onError: (error: any) => {\n      toast({ title: "Please check the form", description: error.message || "We could not submit your profile." });\n    },`;
  if (next.includes(oldOnError)) {
    next = next.replace(oldOnError, `    onError: (error: any) => {\n      const serverIssues: ValidationIssue[] = Array.isArray(error?.fieldErrors) ? error.fieldErrors.map((issue: any) => ({ path: String(issue?.path || ""), label: validationLabel(String(issue?.path || "")), message: String(issue?.message || "Please review this field.") })) : [];\n      if (serverIssues.length) showValidationIssues(serverIssues);\n      toast({ title: serverIssues.length ? \`Please review \${serverIssues.length} field\${serverIssues.length === 1 ? "" : "s"}\` : "Please check the form", description: serverIssues[0] ? \`\${serverIssues[0].label}: \${serverIssues[0].message}\` : (error.message || "We could not submit your profile.") });\n    },`);
  }

  const oldSubmitHandler = '<form className="space-y-6" onSubmit={(event) => { event.preventDefault(); submitMutation.mutate(); }}>';
  if (next.includes(oldSubmitHandler)) {
    next = next.replace(oldSubmitHandler, `<form className="space-y-6" onSubmit={(event) => { event.preventDefault(); const issues = collectValidationIssues(); if (issues.length) { showValidationIssues(issues); toast({ title: \`Please review \${issues.length} field\${issues.length === 1 ? "" : "s"}\`, description: \`\${issues[0].label}: \${issues[0].message}\` }); return; } setValidationIssues([]); submitMutation.mutate(); }}>`);
  }

  const stickyAnchor = '          <div className="sticky bottom-3 z-20 rounded-2xl border bg-white/95 p-4 shadow-xl backdrop-blur md:flex md:items-center md:justify-between">';
  if (next.includes(stickyAnchor) && !next.includes('id="expert-form-errors"')) {
    const summary = `          {validationIssues.length > 0 && (\n            <Card id="expert-form-errors" className="border-red-300 bg-red-50/80 shadow-sm">\n              <CardContent className="p-5">\n                <h3 className="font-semibold text-red-950">Please review the fields below</h3>\n                <p className="mt-1 text-sm text-red-800">Nothing has been lost. Correct these items and submit again.</p>\n                <ul className="mt-3 space-y-2 text-sm text-red-900">\n                  {validationIssues.map((issue, index) => (\n                    <li key={\`\${issue.path}-\${index}\`} className="rounded-lg border border-red-200 bg-white/80 px-3 py-2"><strong>{issue.label}</strong>: {issue.message}</li>\n                  ))}\n                </ul>\n              </CardContent>\n            </Card>\n          )}\n\n`;
    next = next.replace(stickyAnchor, summary + stickyAnchor);
  }

  next = next.replace('disabled={!requiredReady || submitMutation.isPending}', 'disabled={submitMutation.isPending}');
  return next;
});

console.log('[expert-form-validation] schema repair and validation UX prepared');
