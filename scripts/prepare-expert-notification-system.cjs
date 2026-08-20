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
    console.log(`[expert-notifications] prepared ${relative}`);
  }
}

update('server/routes.ts', (source) => {
  let next = source;
  const oldFilter = "AND (n.target_type = 'all' OR (n.target_type = 'tier' AND n.target_value = ${tier}))";
  const newFilter = "AND (n.target_type = 'all' OR (n.target_type = 'tier' AND n.target_value = ${tier}) OR (n.target_type = 'user' AND n.target_value = ${userId}))";
  if (next.includes(oldFilter)) next = next.split(oldFilter).join(newFilter);
  if (!next.includes("n.target_type = 'user' AND n.target_value = ${userId}")) {
    throw new Error('Could not enable user-targeted notification delivery');
  }
  return next;
});

update('client/src/pages/admin/ExpertNetwork.tsx', (source) => {
  let next = source;
  if (!next.includes('import { NotificationBell } from "@/components/NotificationBell";')) {
    const anchor = 'import { AdminSidebar } from "@/components/AdminSidebar";';
    if (!next.includes(anchor)) throw new Error('Could not locate Admin Expert Network sidebar import');
    next = next.replace(anchor, `${anchor}\nimport { NotificationBell } from "@/components/NotificationBell";`);
  }
  if (!next.includes('<NotificationBell />')) {
    const anchor = '            <Button variant="outline" size="sm" onClick={refreshNetwork}>';
    if (!next.includes(anchor)) throw new Error('Could not locate Admin Expert Network header actions');
    next = next.replace(anchor, `            <NotificationBell />\n${anchor}`);
  }
  return next;
});

update('client/src/pages/expert-booking.tsx', (source) => {
  let next = source;

  next = next.replace(
    '  serviceId?: string;\n  serviceName: string;\n  serviceDescription: string;\n  durationMinutes: string;\n  pricePounds: string;',
    '  serviceId?: string;\n  serviceName: string;\n  serviceDescription: string;\n  servicePreparationNote: string;\n  serviceActive: boolean;\n  durationMinutes: string;\n  pricePounds: string;',
  );

  next = next.replace(
    '  serviceName: "",\n  serviceDescription: "",\n  durationMinutes: bookingFormDefaults.durationMinutes,',
    '  serviceName: "",\n  serviceDescription: "",\n  servicePreparationNote: "",\n  serviceActive: true,\n  durationMinutes: bookingFormDefaults.durationMinutes,',
  );

  next = next.replace(
    '    serviceName: form.serviceName.trim(),\n    serviceDescription: form.serviceDescription.trim(),\n    durationMinutes: Number(form.durationMinutes),',
    '    serviceName: form.serviceName.trim(),\n    serviceDescription: form.serviceDescription.trim(),\n    servicePreparationNote: form.servicePreparationNote.trim(),\n    serviceActive: form.serviceActive,\n    durationMinutes: Number(form.durationMinutes),',
  );

  next = next.replace(
    '  const [activeTab, setActiveTab] = useState("book");',
    '  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("tab") === "mine" ? "mine" : "book");',
  );

  next = next.replace(
    '      serviceId: service?.id,\n      serviceName: service?.name || "",\n      serviceDescription: service?.description || "",\n      durationMinutes: String(service?.durationMinutes ?? 60),',
    '      serviceId: service?.id,\n      serviceName: service?.name || "",\n      serviceDescription: service?.description || "",\n      servicePreparationNote: service?.preparationNote || "",\n      serviceActive: service?.active !== false,\n      durationMinutes: String(service?.durationMinutes ?? 60),',
  );

  if (!next.includes('function loadAdminService(service?: ConsultationService)')) {
    const anchor = '  const saveConfigurationMutation = useMutation({';
    if (!next.includes(anchor)) throw new Error('Could not locate AdminNetworkManager save configuration mutation');
    const helper = String.raw`  function loadAdminService(service?: ConsultationService) {
    setConfig((current) => ({
      ...current,
      serviceId: service?.id,
      serviceName: service?.name || "",
      serviceDescription: service?.description || "",
      servicePreparationNote: service?.preparationNote || "",
      serviceActive: service?.active !== false,
      durationMinutes: String(service?.durationMinutes ?? bookingFormDefaults.durationMinutes),
      pricePounds: service ? String(service.pricePence / 100) : "",
    }));
  }

  function selectAdminService(serviceId: string) {
    if (serviceId === "__new__") {
      loadAdminService(undefined);
      return;
    }
    const service = selectedAdminExpert?.services?.find((item) => item.id === serviceId);
    if (service) loadAdminService(service);
  }

  function startNewAdminService() {
    loadAdminService(undefined);
    window.setTimeout(() => document.getElementById("admin-consultation-services")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

`;
    next = next.replace(anchor, helper + anchor);
  }

  next = next.replace(
    '    onSuccess: () => {\n      toast({ title: "Expert configuration saved", description: "The booking directory and availability now use this configuration." });',
    '    onSuccess: (data: any) => {\n      if (data?.serviceId) setConfig((current) => ({ ...current, serviceId: data.serviceId }));\n      toast({ title: "Expert configuration saved", description: "The selected consultation, profile and availability are updated. The professional has been notified by email." });',
  );

  const oldBookingSuccess = '    onSuccess: () => {\n      toast({ title: "Booking updated" });\n      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] });';
  if (next.includes(oldBookingSuccess)) {
    next = next.replace(oldBookingSuccess, String.raw`    onSuccess: (_data, variables) => {
      const changes = variables.changes || {};
      const status = String(changes.status || "");
      const description = status === "cancelled"
        ? "The customer, professional and administrators have been notified."
        : status === "completed"
          ? "The completion update has been sent through the notification and email system."
          : status === "no_show"
            ? "The no-show update has been sent through the notification and email system."
            : Object.prototype.hasOwnProperty.call(changes, "meetingUrl")
              ? "Meeting details were saved and the customer and professional have been notified."
              : "The booking update has been saved.";
      toast({ title: status === "cancelled" ? "Consultation cancelled" : "Booking updated", description });
      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] });`);
  }

  const serviceStart = next.indexOf('                <div className="border-t pt-5"><h4 className="font-semibold mb-4">Primary consultation service</h4>');
  const availabilityStart = serviceStart >= 0 ? next.indexOf('\n\n                <div className="border-t pt-5"><h4 className="font-semibold mb-4">Recurring availability</h4>', serviceStart) : -1;
  if (serviceStart >= 0 && availabilityStart > serviceStart) {
    const serviceUi = String.raw`                <div id="admin-consultation-services" className="border-t pt-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h4 className="font-semibold">Consultation services</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Choose any service to edit, or add another consultation. Each service keeps its own price, duration, description and preparation note.</p>
                    </div>
                    {!createMode && selectedAdminExpert && (
                      <Button type="button" variant="outline" size="sm" onClick={startNewAdminService}>
                        <Plus className="h-4 w-4 mr-2" /> Add consultation
                      </Button>
                    )}
                  </div>

                  {!createMode && selectedAdminExpert && (
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <Field label={`Service to edit (${selectedAdminExpert.services?.length || 0})`}>
                          <Select value={config.serviceId || "__new__"} onValueChange={selectAdminService}>
                            <SelectTrigger><SelectValue placeholder="Choose a consultation" /></SelectTrigger>
                            <SelectContent>
                              {!config.serviceId && <SelectItem value="__new__">New consultation service</SelectItem>}
                              {(selectedAdminExpert.services || []).map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} · {money(service.pricePence, service.currency)} · {service.durationMinutes} min{service.active === false ? " · inactive" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Badge variant="secondary" className="w-fit mb-1">{config.serviceId ? "Editing existing service" : "Creating new service"}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Service name"><Input value={config.serviceName} onChange={(e) => setConfig({ ...config, serviceName: e.target.value })} placeholder="e.g. Innovator Founder strategy consultation" /></Field>
                    <Field label="Price (£)"><Input type="number" min="0" step="0.01" value={config.pricePounds} onChange={(e) => setConfig({ ...config, pricePounds: e.target.value })} placeholder="Enter price" /></Field>
                    <Field label="Duration (minutes)"><Input type="number" min="15" max="360" value={config.durationMinutes} onChange={(e) => setConfig({ ...config, durationMinutes: e.target.value })} /></Field>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.serviceActive} onChange={(e) => setConfig({ ...config, serviceActive: e.target.checked })} /> Active and available for booking</label>
                    </div>
                    <div className="md:col-span-2"><Label>Service description</Label><Textarea className="mt-2 min-h-24" value={config.serviceDescription} onChange={(e) => setConfig({ ...config, serviceDescription: e.target.value })} /></div>
                    <div className="md:col-span-2"><Label>Preparation note for this service</Label><Textarea className="mt-2" value={config.servicePreparationNote} onChange={(e) => setConfig({ ...config, servicePreparationNote: e.target.value })} placeholder="What should the client prepare specifically for this consultation?" /></div>
                  </div>
                </div>`;
    next = next.slice(0, serviceStart) + serviceUi + next.slice(availabilityStart);
  }

  next = next.replace(
    '<Card>\n        <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Consultation operations</CardTitle>',
    '<Card id="consultation-operations">\n        <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Consultation operations</CardTitle>',
  );

  const oldCancelButton = '{booking.status !== "cancelled" && booking.status !== "completed" && <Button size="sm" variant="outline" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { status: "cancelled" } })}>Cancel</Button>}';
  if (next.includes(oldCancelButton)) {
    next = next.replace(oldCancelButton, String.raw`{booking.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { status: "no_show" } })}>No-show</Button>}
                {booking.status !== "cancelled" && booking.status !== "completed" && <Button size="sm" variant="outline" onClick={() => {
                  const reason = window.prompt("Reason for cancellation (this will be included in the customer's notification and email):", "");
                  if (reason === null) return;
                  updateBookingMutation.mutate({ bookingId: booking.id, changes: { status: "cancelled", cancellationReason: reason.trim() || "Cancelled by the platform administrator." } });
                }}>Cancel</Button>}`);
  }

  if (!next.includes('Consultation services</h4>')) {
    throw new Error('Could not replace the primary consultation editor with multi-service editing');
  }
  return next;
});

update('server/expertBookingRoutes.ts', (source) => {
  let next = source;

  if (next.includes('import { sendEmail } from "./email";')) {
    next = next.replace('import { sendEmail } from "./email";', `import {\n  queueExpertBookingEvent,\n  queueExpertProfileEmail,\n  startExpertNotificationWorker,\n} from "./expertNotificationService";`);
  }

  const confirmationStart = next.indexOf('async function sendBookingConfirmation(bookingId: string) {');
  const bookingSchemaStart = confirmationStart >= 0 ? next.indexOf('\n\nconst bookingSchema =', confirmationStart) : -1;
  if (confirmationStart >= 0 && bookingSchemaStart > confirmationStart) {
    next = next.slice(0, confirmationStart)
      + 'async function sendBookingConfirmation(bookingId: string) {\n  await queueExpertBookingEvent("confirmed", bookingId);\n}'
      + next.slice(bookingSchemaStart);
  }

  next = next.replace(
    '  serviceDescription: z.string().trim().max(2000).optional().default(""),\n  durationMinutes: z.number().int().min(15).max(360),',
    '  serviceDescription: z.string().trim().max(2000).optional().default(""),\n  servicePreparationNote: z.string().trim().max(3000).optional().default(""),\n  serviceActive: z.boolean().default(true),\n  durationMinutes: z.number().int().min(15).max(360),',
  );

  next = next.replace(
    '      SET name = $3, description = $4, duration_minutes = $5,\n          price_pence = $6, active = true, updated_at = NOW()\n      WHERE id = $1 AND expert_id = $2\n      RETURNING id\n    `, [serviceId, expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence]));',
    '      SET name = $3, description = $4, duration_minutes = $5,\n          price_pence = $6, active = $7, preparation_note = $8, updated_at = NOW()\n      WHERE id = $1 AND expert_id = $2\n      RETURNING id\n    `, [serviceId, expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence, input.serviceActive, input.servicePreparationNote || null]));',
  );

  next = next.replace(
    "        expert_id, name, description, duration_minutes, price_pence, currency, active\n      ) VALUES ($1,$2,$3,$4,$5,'GBP',true)\n      RETURNING id\n    `, [expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence]))[0]?.id;",
    "        expert_id, name, description, duration_minutes, price_pence, currency, active, preparation_note\n      ) VALUES ($1,$2,$3,$4,$5,'GBP',$6,$7)\n      RETURNING id\n    `, [expertId, input.serviceName, input.serviceDescription || null, input.durationMinutes, input.pricePence, input.serviceActive, input.servicePreparationNote || null]))[0]?.id;",
  );

  if (!next.includes('startExpertNotificationWorker();')) {
    const anchor = 'export function registerExpertBookingRoutes(app: Express): void {';
    if (!next.includes(anchor)) throw new Error('Could not locate Expert Booking route registration');
    next = next.replace(anchor, `${anchor}\n  startExpertNotificationWorker();`);
  }

  const insertBookingCommit = '      ]))[0];\n      await client.query("COMMIT");\n\n      if (isFree) {\n        void sendBookingConfirmation(booking.id);\n        return res.status(201).json({ booking, requiresPayment: false });\n      }';
  if (next.includes(insertBookingCommit)) {
    next = next.replace(insertBookingCommit, `      ]))[0];\n      await queueExpertBookingEvent(isFree ? "confirmed" : "pending_payment", booking.id, {}, client);\n      await client.query("COMMIT");\n\n      if (isFree) {\n        return res.status(201).json({ booking, requiresPayment: false });\n      }`);
  }

  next = next.replace(
    "        await pool.query(`\n          UPDATE expert_consultation_bookings\n          SET status = 'expired', payment_status = 'failed', hold_expires_at = NULL, updated_at = NOW()\n          WHERE id = $1\n        `, [booking.id]);\n        return res.status(502).json({ error: \"The slot was reserved, but payment checkout could not be started. Please try again.\" });",
    "        await pool.query(`\n          UPDATE expert_consultation_bookings\n          SET status = 'expired', payment_status = 'failed', hold_expires_at = NULL, updated_at = NOW()\n          WHERE id = $1\n        `, [booking.id]);\n        await queueExpertBookingEvent(\"payment_failed\", booking.id).catch((notifyError) => console.error(\"[Expert Booking] Payment failure notification enqueue failed\", notifyError));\n        return res.status(502).json({ error: \"The slot was reserved, but payment checkout could not be started. Please try again.\" });",
  );

  next = next.replace(
    '      void sendBookingConfirmation(booking.id);\n      return res.json({ success: true, bookingId: booking.id });',
    '      await sendBookingConfirmation(booking.id);\n      return res.json({ success: true, bookingId: booking.id });',
  );

  const configureCommit = '      const serviceId = await saveConfiguration(client, req.params.expertId, parsed.data);\n      await client.query("COMMIT");\n      return res.json({ success: true, serviceId });';
  if (next.includes(configureCommit)) {
    next = next.replace(configureCommit, String.raw`      const serviceId = await saveConfiguration(client, req.params.expertId, parsed.data);
      const expertContact = rows<any>(await client.query(`
        SELECT email, first_name AS "firstName", last_name AS "lastName"
        FROM immigration_lawyers WHERE id = $1 LIMIT 1
      `, [req.params.expertId]))[0];
      if (expertContact?.email) {
        await queueExpertProfileEmail({
          expertEmail: expertContact.email,
          expertName: `${expertContact.firstName || ""} ${expertContact.lastName || ""}`.trim(),
          expertId: req.params.expertId,
          eventType: "expert_configuration_updated",
          subject: "Your Expert Support consultation settings were updated",
          message: `The platform administrator updated your Expert Support profile, consultation service (${parsed.data.serviceName}), pricing or availability. Please contact the platform team if anything needs correcting.`,
          dedupeRevision: parsed.data,
        }, client);
      }
      await client.query("COMMIT");
      return res.json({ success: true, serviceId });`);
  }

  const createCommit = '      const serviceId = await saveConfiguration(client, expert.id, input);\n      await client.query("COMMIT");\n      return res.status(201).json({ expert, serviceId });';
  if (next.includes(createCommit)) {
    next = next.replace(createCommit, String.raw`      const serviceId = await saveConfiguration(client, expert.id, input);
      await queueExpertProfileEmail({
        expertEmail: expert.email,
        expertName: `${expert.firstName || ""} ${expert.lastName || ""}`.trim(),
        expertId: expert.id,
        eventType: "expert_profile_created",
        subject: "Your Expert Support profile has been created",
        message: "A professional Expert Support profile has been created for you on the Innovator Founder Visa Assistant platform. Contact the platform team if any profile, service, pricing or availability detail needs correcting.",
        dedupeRevision: { serviceId, email: expert.email },
      }, client);
      await client.query("COMMIT");
      return res.status(201).json({ expert, serviceId });`);
  }

  const oldVisibilityReturn = '      await pool.query(`\n        UPDATE expert_consultation_profiles\n        SET consultation_enabled = COALESCE($2, consultation_enabled),\n            featured = COALESCE($3, featured), updated_at = NOW()\n        WHERE expert_id = $1\n      `, [req.params.expertId, parsed.data.consultationEnabled ?? null, parsed.data.featured ?? null]);\n      return res.json({ success: true });';
  if (next.includes(oldVisibilityReturn)) {
    next = next.replace(oldVisibilityReturn, String.raw`      await pool.query(`
        UPDATE expert_consultation_profiles
        SET consultation_enabled = COALESCE($2, consultation_enabled),
            featured = COALESCE($3, featured), updated_at = NOW()
        WHERE expert_id = $1
      `, [req.params.expertId, parsed.data.consultationEnabled ?? null, parsed.data.featured ?? null]);
      if (parsed.data.consultationEnabled !== undefined) {
        const expertContact = rows<any>(await pool.query(`SELECT email, first_name AS "firstName", last_name AS "lastName" FROM immigration_lawyers WHERE id = $1 LIMIT 1`, [req.params.expertId]))[0];
        if (expertContact?.email) {
          await queueExpertProfileEmail({
            expertEmail: expertContact.email,
            expertName: `${expertContact.firstName || ""} ${expertContact.lastName || ""}`.trim(),
            expertId: req.params.expertId,
            eventType: "expert_visibility_updated",
            subject: parsed.data.consultationEnabled ? "Your Expert Support profile is publicly bookable" : "Your Expert Support profile is no longer publicly bookable",
            message: parsed.data.consultationEnabled ? "Your verified profile has been enabled for public consultation bookings." : "Public consultation booking has been disabled for your profile. Existing bookings remain visible to the platform team.",
            dedupeRevision: { consultationEnabled: parsed.data.consultationEnabled },
          });
        }
      }
      return res.json({ success: true });`);
  }

  const patchStart = next.indexOf('  app.patch("/api/admin/expert-booking/bookings/:bookingId"');
  const patchEnd = patchStart >= 0 ? next.indexOf('\n  });\n}', patchStart) : -1;
  if (patchStart >= 0 && patchEnd > patchStart) {
    const oldPatch = next.slice(patchStart, patchEnd + 6);
    const newPatch = String.raw`  app.patch("/api/admin/expert-booking/bookings/:bookingId", isAuthenticated, requireAdmin, mutationOriginGuard, async (req, res) => {
    const parsed = z.object({
      status: z.enum(["confirmed", "completed", "cancelled", "no_show"]).optional(),
      meetingUrl: z.string().url().max(2000).nullable().optional(),
      adminNotes: z.string().max(5000).nullable().optional(),
      cancellationReason: z.string().max(2000).nullable().optional(),
    }).safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {
      return res.status(400).json({ error: "No valid booking changes supplied." });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const booking = rows<any>(await client.query(`
        SELECT id, amount_pence AS "amountPence", payment_status AS "paymentStatus",
          status, meeting_url AS "meetingUrl"
        FROM expert_consultation_bookings WHERE id = $1 FOR UPDATE
      `, [req.params.bookingId]))[0];
      if (!booking) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Booking not found." });
      }
      if (parsed.data.status && ["confirmed", "completed"].includes(parsed.data.status)
          && Number(booking.amountPence) > 0 && booking.paymentStatus !== "paid") {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "A paid consultation cannot be confirmed or completed until payment is verified." });
      }
      await client.query(`
        UPDATE expert_consultation_bookings
        SET status = COALESCE($2, status),
            meeting_url = CASE WHEN $3::boolean THEN $4 ELSE meeting_url END,
            admin_notes = CASE WHEN $5::boolean THEN $6 ELSE admin_notes END,
            cancellation_reason = CASE WHEN $7::boolean THEN $8 ELSE cancellation_reason END,
            confirmed_at = CASE WHEN $2 = 'confirmed' THEN COALESCE(confirmed_at, NOW()) ELSE confirmed_at END,
            completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
            cancelled_at = CASE WHEN $2 = 'cancelled' THEN NOW() ELSE cancelled_at END,
            hold_expires_at = CASE WHEN $2 IN ('confirmed','completed','cancelled','no_show') THEN NULL ELSE hold_expires_at END,
            updated_at = NOW()
        WHERE id = $1
      `, [
        req.params.bookingId,
        parsed.data.status ?? null,
        parsed.data.meetingUrl !== undefined, parsed.data.meetingUrl ?? null,
        parsed.data.adminNotes !== undefined, parsed.data.adminNotes ?? null,
        parsed.data.cancellationReason !== undefined, parsed.data.cancellationReason ?? null,
      ]);

      if (parsed.data.status && parsed.data.status !== booking.status) {
        await queueExpertBookingEvent(parsed.data.status, req.params.bookingId, {
          cancellationReason: parsed.data.cancellationReason,
          meetingUrl: parsed.data.meetingUrl,
          actorUserId: currentUserId(req),
        }, client);
      }
      if (parsed.data.meetingUrl !== undefined && (parsed.data.meetingUrl || null) !== (booking.meetingUrl || null)) {
        await queueExpertBookingEvent("meeting_updated", req.params.bookingId, {
          meetingUrl: parsed.data.meetingUrl,
          actorUserId: currentUserId(req),
        }, client);
      }
      await client.query("COMMIT");
      return res.json({ success: true, notificationsQueued: true });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[Expert Booking] Admin booking update error", error);
      return res.status(500).json({ error: "Unable to update the consultation booking." });
    } finally {
      client.release();
    }
  });`;
    next = next.replace(oldPatch, newPatch);
  }

  if (!next.includes('queueExpertBookingEvent(parsed.data.status')) {
    throw new Error('Could not wire admin booking lifecycle notifications');
  }
  return next;
});

update('server/expertBookingPaymentWebhook.ts', (source) => {
  let next = source;
  next = next.replace('import { sendEmail } from "./email";', 'import { queueExpertBookingEvent } from "./expertNotificationService";');

  const emailStart = next.indexOf('function escapeHtml(value: unknown): string {');
  const confirmStart = next.indexOf('async function confirmPaidSession(session: any): Promise<void> {');
  if (emailStart >= 0 && confirmStart > emailStart) {
    next = next.slice(0, emailStart) + next.slice(confirmStart);
  }
  next = next.replace(
    '  if (shouldNotify) void sendConfirmedBookingEmail(bookingId);',
    '  if (shouldNotify) await queueExpertBookingEvent("confirmed", bookingId);',
  );

  const expireStart = next.indexOf('async function expireCheckoutSession(session: any): Promise<void> {');
  const registerStart = expireStart >= 0 ? next.indexOf('\n\nexport function registerExpertBookingPaymentWebhook', expireStart) : -1;
  if (expireStart >= 0 && registerStart > expireStart) {
    const replacement = String.raw`async function expireCheckoutSession(session: any): Promise<void> {
  if (session?.metadata?.type !== "expert_consultation") return;
  const bookingId = String(session.metadata?.bookingId || "").trim();
  if (!bookingId || !session.id) return;
  const updated = rows<any>(await pool.query(`
    UPDATE expert_consultation_bookings
    SET status = 'expired',
        payment_status = CASE WHEN payment_status = 'paid' THEN payment_status ELSE 'failed' END,
        hold_expires_at = NULL,
        updated_at = NOW()
    WHERE id = $1
      AND stripe_checkout_session_id = $2
      AND status = 'pending_payment'
      AND payment_status <> 'paid'
    RETURNING id
  `, [bookingId, session.id]));
  if (updated.length) await queueExpertBookingEvent("payment_failed", bookingId);
}`;
    next = next.slice(0, expireStart) + replacement + next.slice(registerStart);
  }

  if (!next.includes('queueExpertBookingEvent("payment_failed"')) {
    throw new Error('Could not wire Stripe failure notifications');
  }
  return next;
});

update('server/expertApplicationRoutes.ts', (source) => {
  let next = source;
  if (next.includes('import { sendEmail } from "./email";')) {
    next = next.replace('import { sendEmail } from "./email";', `import {\n  queueAdminExpertNetworkAlert,\n  queueExpertProfileEmail,\n} from "./expertNotificationService";`);
  }

  const reviewCommit = '      await client.query("COMMIT");\n\n      if (application.email) {';
  const reviewReturn = '      return res.json({ success: true, decision: parsed.data.decision });';
  const reviewBlockStart = next.indexOf(reviewCommit);
  const reviewReturnIndex = reviewBlockStart >= 0 ? next.indexOf(reviewReturn, reviewBlockStart) : -1;
  if (reviewBlockStart >= 0 && reviewReturnIndex > reviewBlockStart) {
    const commitEnd = reviewBlockStart + '      await client.query("COMMIT");'.length;
    const replacement = String.raw`

      if (application.email) {
        await queueExpertProfileEmail({
          expertEmail: application.email,
          expertName: application.firstName || "",
          expertId: application.expertId,
          eventType: approved ? "expert_application_approved" : "expert_application_rejected",
          subject: approved ? "Your Expert Support profile has been approved" : "Update on your Expert Support profile",
          message: approved
            ? "Your professional profile has been verified and is now eligible to appear for public consultation bookings."
            : `Your professional profile is not being published at this time.${parsed.data.notes ? ` Review note: ${parsed.data.notes}` : ""}`,
          dedupeRevision: { applicationId: application.id, decision: parsed.data.decision, notes: parsed.data.notes },
        });
      }
`;
    next = next.slice(0, commitEnd) + replacement + next.slice(reviewReturnIndex);
  }

  const submitCommitIndex = next.indexOf('      await client.query("COMMIT");', next.indexOf('app.post("/api/expert-applications/submit"'));
  const submitReturnIndex = submitCommitIndex >= 0 ? next.indexOf('      return res.status(201).json({', submitCommitIndex) : -1;
  if (submitCommitIndex >= 0 && submitReturnIndex > submitCommitIndex) {
    const commitEnd = submitCommitIndex + '      await client.query("COMMIT");'.length;
    const replacement = String.raw`

      await queueExpertProfileEmail({
        expertEmail: input.email,
        expertName: input.firstName,
        expertId: expert.id,
        eventType: "expert_application_received",
        subject: "Your Expert Support profile has been received",
        message: "Your professional profile, consultation services, fees and availability have been saved. The platform administrator will verify your professional details before public booking is enabled.",
        dedupeRevision: { applicationId: application.id },
      });
      await queueAdminExpertNetworkAlert({
        eventType: "expert_application_received",
        title: "New professional application",
        message: `${input.firstName} ${input.lastName} submitted an Expert Support profile for verification.`,
        actionUrl: "/admin/expert-network",
        dedupeRevision: { applicationId: application.id },
      });
`;
    next = next.slice(0, commitEnd) + replacement + next.slice(submitReturnIndex);
  }

  if (next.includes('void sendEmail({')) {
    throw new Error('Legacy fire-and-forget expert application email remains after notification preparation');
  }
  return next;
});

console.log('[expert-notifications] comprehensive notification and multi-service preparation complete');
