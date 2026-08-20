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
    console.log(`[expert-multiple-services] prepared ${relative}`);
  }
}

update('client/src/pages/expert-join.tsx', (source) => {
  let next = source;

  if (!next.includes('  Plus,\n  Trash2,')) {
    next = next.replace(
      '  X,\n} from "lucide-react";',
      '  X,\n  Plus,\n  Trash2,\n} from "lucide-react";',
    );
  }

  if (!next.includes('type ConsultationServiceForm =')) {
    const anchor = 'type FormState = {';
    if (!next.includes(anchor)) throw new Error('Could not locate ExpertJoin FormState');
    const typeBlock = `type ConsultationServiceForm = {\n  id: string;\n  serviceName: string;\n  serviceDescription: string;\n  durationMinutes: string;\n  pricePounds: string;\n  preparationNote: string;\n};\n\nfunction createConsultationService(seed: Partial<ConsultationServiceForm> = {}): ConsultationServiceForm {\n  return {\n    id: \`service-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`,\n    serviceName: "",\n    serviceDescription: "",\n    durationMinutes: "60",\n    pricePounds: "",\n    preparationNote: "",\n    ...seed,\n  };\n}\n\n`;
    next = next.replace(anchor, typeBlock + anchor);
  }

  const oldFormFields = `  serviceName: string;\n  serviceDescription: string;\n  durationMinutes: string;\n  pricePounds: string;\n  preparationNote: string;`;
  if (next.includes(oldFormFields)) {
    next = next.replace(oldFormFields, '  services: ConsultationServiceForm[];');
  }

  const oldInitialFields = `  serviceName: "Innovator Founder consultation",\n  serviceDescription: "",\n  durationMinutes: "60",\n  pricePounds: "",\n  preparationNote: "",`;
  if (next.includes(oldInitialFields)) {
    next = next.replace(
      oldInitialFields,
      `  services: [createConsultationService({ serviceName: "Innovator Founder consultation" })],`,
    );
  }

  const oldDraftRestore = '      try { setForm({ ...initialForm, ...JSON.parse(saved) }); } catch {}';
  if (next.includes(oldDraftRestore)) {
    next = next.replace(
      oldDraftRestore,
      `      try {\n        const parsed = JSON.parse(saved);\n        const services = Array.isArray(parsed.services) && parsed.services.length\n          ? parsed.services.map((service: any) => createConsultationService(service))\n          : [createConsultationService({\n              serviceName: parsed.serviceName || "Innovator Founder consultation",\n              serviceDescription: parsed.serviceDescription || "",\n              durationMinutes: String(parsed.durationMinutes || "60"),\n              pricePounds: String(parsed.pricePounds || ""),\n              preparationNote: parsed.preparationNote || "",\n            })];\n        setForm({ ...initialForm, ...parsed, services });\n      } catch {}`,
    );
  }

  const oldEnhanceSignature = `  const enhance = async (field: string, value: string, onChange: (next: string) => void) => {\n    setEnhancingField(field);`;
  if (next.includes(oldEnhanceSignature)) {
    next = next.replace(
      oldEnhanceSignature,
      `  const enhance = async (field: string, value: string, onChange: (next: string) => void, activityKey = field) => {\n    setEnhancingField(activityKey);`,
    );
  }

  if (!next.includes('const updateService =')) {
    const anchor = `  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {\n    setForm((current) => ({ ...current, [key]: value }));\n  };`;
    if (!next.includes(anchor)) throw new Error('Could not locate ExpertJoin set helper');
    const helpers = `${anchor}\n\n  const updateService = <K extends keyof Omit<ConsultationServiceForm, "id">>(id: string, key: K, value: ConsultationServiceForm[K]) => {\n    setForm((current) => ({\n      ...current,\n      services: current.services.map((service) => service.id === id ? { ...service, [key]: value } : service),\n    }));\n  };\n\n  const addService = () => {\n    setForm((current) => {\n      if (current.services.length >= 8) return current;\n      return { ...current, services: [...current.services, createConsultationService()] };\n    });\n  };\n\n  const removeService = (id: string) => {\n    setForm((current) => current.services.length <= 1\n      ? current\n      : { ...current, services: current.services.filter((service) => service.id !== id) });\n  };`;
    next = next.replace(anchor, helpers);
  }

  const oldSubmitConversions = `          durationMinutes: Number(form.durationMinutes),\n          pricePounds: Number(form.pricePounds),\n          specializations,`;
  if (next.includes(oldSubmitConversions)) {
    next = next.replace(
      oldSubmitConversions,
      `          services: form.services.map(({ id: _id, ...service }) => ({\n            ...service,\n            durationMinutes: Number(service.durationMinutes),\n            pricePounds: Number(service.pricePounds),\n          })),\n          specializations,`,
    );
  }

  const oldReady = `  const requiredReady = Boolean(\n    form.firstName && form.lastName && form.email && form.publicTitle && form.publicBio.length >= 40 &&\n    form.yearsExperience !== "" && form.specializations && form.serviceName && form.serviceDescription.length >= 20 &&\n    form.pricePounds !== "" && form.weekdays.length && form.accuracyConfirmed && form.displayConsent &&\n    (!(form.regulatorType === "sra" || form.regulatorType === "both") || form.sraNumber) &&\n    (!(form.regulatorType === "iaa" || form.regulatorType === "both") || form.iaaRegistrationNumber)\n  );`;
  if (next.includes(oldReady)) {
    next = next.replace(
      oldReady,
      `  const servicesReady = form.services.length > 0 && form.services.every((service) =>\n    service.serviceName.trim().length >= 3 &&\n    service.serviceDescription.trim().length >= 20 &&\n    service.durationMinutes !== "" &&\n    service.pricePounds !== ""\n  );\n\n  const requiredReady = Boolean(\n    form.firstName && form.lastName && form.email && form.publicTitle && form.publicBio.length >= 40 &&\n    form.yearsExperience !== "" && form.specializations && servicesReady &&\n    form.weekdays.length && form.accuracyConfirmed && form.displayConsent &&\n    (!(form.regulatorType === "sra" || form.regulatorType === "both") || form.sraNumber) &&\n    (!(form.regulatorType === "iaa" || form.regulatorType === "both") || form.iaaRegistrationNumber)\n  );`,
    );
  }

  next = next.replace(
    'Your professional profile, consultation fee and availability are now saved in the platform.',
    'Your professional profile, consultation services, fees and availability are now saved in the platform.',
  );
  next = next.replace(
    'Your profile, consultation rate and weekly availability will be created automatically for administrator verification.',
    'Your profile, consultation services, rates and weekly availability will be created automatically for administrator verification.',
  );

  const serviceStart = next.indexOf('          <Section title="3. Consultation & fee"');
  const availabilityMarker = '\n\n          <Section title="4. Availability"';
  const serviceEnd = serviceStart >= 0 ? next.indexOf(availabilityMarker, serviceStart) : -1;
  if (serviceStart >= 0 && serviceEnd > serviceStart) {
    const section = `          <Section title="3. Consultations & fees" description="Add every consultation service you want clients to be able to book. Each service can have its own name, description, duration and fee." icon={<Banknote className="h-5 w-5" />}>\n            <div className="space-y-5">\n              {form.services.map((service, index) => (\n                <div key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:p-5">\n                  <div className="mb-5 flex items-center justify-between gap-3">\n                    <div>\n                      <div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Consultation {index + 1}</div>\n                      <div className="mt-1 text-sm text-slate-500">Set exactly what the client can book and what they will pay.</div>\n                    </div>\n                    {form.services.length > 1 && (\n                      <Button type="button" variant="ghost" size="sm" onClick={() => removeService(service.id)} className="gap-1.5 text-red-600 hover:text-red-700">\n                        <Trash2 className="h-4 w-4" /> Remove\n                      </Button>\n                    )}\n                  </div>\n\n                  <div className="grid gap-5 md:grid-cols-2">\n                    <TextField\n                      label="Consultation name"\n                      required\n                      value={service.serviceName}\n                      onChange={(value) => updateService(service.id, "serviceName", value)}\n                      placeholder="e.g. Innovator Founder endorsement strategy consultation"\n                      enhanceField="serviceName"\n                      enhance={(field, value, onChange) => enhance(field, value, onChange, \`service-\${service.id}-serviceName\`)}\n                      enhancing={enhancingField === \`service-\${service.id}-serviceName\`}\n                    />\n                    <div className="space-y-2">\n                      <Label>Consultation fee (£) *</Label>\n                      <Input type="number" min="0" max="5000" step="0.01" value={service.pricePounds} onChange={(event) => updateService(service.id, "pricePounds", event.target.value)} placeholder="175" />\n                      <p className="text-xs text-slate-500">Customer-facing price for this consultation.</p>\n                    </div>\n                    <div className="space-y-2">\n                      <Label>Duration *</Label>\n                      <Select value={service.durationMinutes} onValueChange={(value) => updateService(service.id, "durationMinutes", value)}>\n                        <SelectTrigger><SelectValue /></SelectTrigger>\n                        <SelectContent>{[30,45,60,75,90,120].map((minutes) => <SelectItem key={minutes} value={String(minutes)}>{minutes} minutes</SelectItem>)}</SelectContent>\n                      </Select>\n                    </div>\n                  </div>\n\n                  <NarrativeField\n                    label="Consultation description"\n                    required\n                    value={service.serviceDescription}\n                    onChange={(value) => updateService(service.id, "serviceDescription", value)}\n                    placeholder="Explain what the client can expect from this consultation."\n                    enhanceField="serviceDescription"\n                    enhance={(field, value, onChange) => enhance(field, value, onChange, \`service-\${service.id}-serviceDescription\`)}\n                    enhancing={enhancingField === \`service-\${service.id}-serviceDescription\`}\n                  />\n                  <NarrativeField\n                    label="Preparation note for clients"\n                    value={service.preparationNote}\n                    onChange={(value) => updateService(service.id, "preparationNote", value)}\n                    placeholder="What should clients prepare before this consultation?"\n                    enhanceField="preparationNote"\n                    enhance={(field, value, onChange) => enhance(field, value, onChange, \`service-\${service.id}-preparationNote\`)}\n                    enhancing={enhancingField === \`service-\${service.id}-preparationNote\`}\n                  />\n                </div>\n              ))}\n            </div>\n\n            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">\n              <div>\n                <div className="font-medium text-slate-900">Offer more than one consultation?</div>\n                <div className="mt-1 text-sm text-slate-600">Add up to 8 services. Each one appears separately for clients to choose when booking.</div>\n              </div>\n              <Button type="button" variant="outline" onClick={addService} disabled={form.services.length >= 8} className="gap-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50">\n                <Plus className="h-4 w-4" /> Add another consultation\n              </Button>\n            </div>\n\n            <div className="max-w-md space-y-2">\n              <Label>Meeting format *</Label>\n              <Select value={form.meetingMode} onValueChange={(value: any) => set("meetingMode", value)}>\n                <SelectTrigger><SelectValue /></SelectTrigger>\n                <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="either">Video or phone</SelectItem></SelectContent>\n              </Select>\n              <p className="text-xs text-slate-500">This meeting format applies to all consultation services on your profile.</p>\n            </div>\n          </Section>`;
    next = next.slice(0, serviceStart) + section + next.slice(serviceEnd);
  }

  return next;
});

update('server/expertApplicationRoutes.ts', (source) => {
  let next = source;

  if (!next.includes('const consultationServiceSchema = z.object(')) {
    const anchor = 'const applicationSchema = z.object({';
    if (!next.includes(anchor)) throw new Error('Could not locate expert application schema');
    const schema = `const consultationServiceSchema = z.object({\n  serviceName: z.string().trim().min(3).max(160),\n  serviceDescription: z.string().trim().min(20).max(2000),\n  durationMinutes: z.number().int().min(15).max(360),\n  pricePounds: z.number().min(0).max(5000),\n  preparationNote: z.string().trim().max(3000).optional().default(""),\n});\n\n`;
    next = next.replace(anchor, schema + anchor);
  }

  const oldServiceFields = `  serviceName: z.string().trim().min(3).max(160),\n  serviceDescription: z.string().trim().min(20).max(2000),\n  durationMinutes: z.number().int().min(15).max(360),\n  pricePounds: z.number().min(0).max(5000),\n  preparationNote: z.string().trim().max(3000).optional().default(""),`;
  if (next.includes(oldServiceFields)) {
    next = next.replace(oldServiceFields, '  services: z.array(consultationServiceSchema).min(1).max(8),');
  }

  next = next.replace(
    '        input.bufferMinutes, input.preparationNote || null,',
    '        input.bufferMinutes, input.services[0]?.preparationNote || null,',
  );

  const serviceInsertStart = next.indexOf('      await client.query(`\n        INSERT INTO expert_consultation_services (');
  const weekdayAnchor = '\n\n      for (const weekday of [...new Set(input.weekdays)]) {';
  const serviceInsertEnd = serviceInsertStart >= 0 ? next.indexOf(weekdayAnchor, serviceInsertStart) : -1;
  if (serviceInsertStart >= 0 && serviceInsertEnd > serviceInsertStart) {
    const replacement = `      for (let serviceIndex = 0; serviceIndex < input.services.length; serviceIndex += 1) {\n        const service = input.services[serviceIndex];\n        await client.query(\`\n          INSERT INTO expert_consultation_services (\n            expert_id, name, description, duration_minutes, price_pence, currency, active, sort_order, preparation_note\n          ) VALUES ($1,$2,$3,$4,$5,'GBP',true,$6,$7)\n        \`, [\n          expert.id, service.serviceName, service.serviceDescription, service.durationMinutes,\n          Math.round(service.pricePounds * 100), serviceIndex, service.preparationNote || null,\n        ]);\n      }`;
    next = next.slice(0, serviceInsertStart) + replacement + next.slice(serviceInsertEnd);
  }

  next = next.replace(
    `          s.name AS "serviceName", s.price_pence AS "pricePence", s.currency,\n          s.duration_minutes AS "durationMinutes"`,
    `          s.name AS "serviceName", s.price_pence AS "pricePence", s.currency,\n          s.duration_minutes AS "durationMinutes", s.service_count AS "serviceCount"`,
  );
  next = next.replace(
    `          SELECT name, price_pence, currency, duration_minutes\n          FROM expert_consultation_services`,
    `          SELECT name, price_pence, currency, duration_minutes, COUNT(*) OVER() AS service_count\n          FROM expert_consultation_services`,
  );

  next = next.replace(
    'Your professional profile, consultation fee and availability have been saved.',
    'Your professional profile, consultation services, fees and availability have been saved.',
  );

  return next;
});

update('client/src/pages/admin/ExpertNetwork.tsx', (source) => {
  let next = source;
  if (!next.includes('serviceCount?: number | null;')) {
    next = next.replace(
      '  serviceName?: string | null;\n  pricePence?: number | null;',
      '  serviceName?: string | null;\n  serviceCount?: number | null;\n  pricePence?: number | null;',
    );
  }
  next = next.replace(
    '{application.serviceName && <Badge variant="outline">{application.serviceName}</Badge>}',
    '{application.serviceName && <Badge variant="outline">{application.serviceName}{(application.serviceCount || 1) > 1 ? ` +${(application.serviceCount || 1) - 1} more` : ""}</Badge>}',
  );
  return next;
});

console.log('[expert-multiple-services] multiple consultation preparation complete');
